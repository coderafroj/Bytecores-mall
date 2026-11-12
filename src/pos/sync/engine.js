import { db, SYNCED, LOCAL_ONLY_SETTINGS, ridOf, asRemote } from '../data/db';

/**
 * Offline-first sync. The local database is always the source of truth for the counter.
 *  push: every row whose `updatedAt` is newer than the table's watermark (+ delete tombstones)
 *  pull: everything the cloud has with `srv` greater than our cursor
 * Both are indexed range reads, so cost follows "what changed", not "how much data exists".
 * Conflict rule: the newer `updatedAt` wins. Designed for ONE counter device writing at a time.
 */
const BATCH_RECORDS = 40;
const BATCH_BYTES = 1_200_000;      // keeps each request well under Vercel's 4.5 MB limit
const pkOf = (table) => (table === 'settings' ? 'key' : 'id');

/* ---------------- tiny observable store for the UI ---------------- */
let snap = { status: 'idle', pending: 0, lastSyncAt: 0, message: '', detail: '' };
const listeners = new Set();
const set = (patch) => { snap = { ...snap, ...patch }; listeners.forEach((l) => l()); };

let auth = { getToken: null, signedIn: false };
let transport = defaultTransport;
let imageFetcher = defaultImageFetcher;
let running = null;

export const sync = {
  subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
  getSnapshot: () => snap,
  setAuth(next) { auth = next || { getToken: null, signedIn: false }; },
  setPending(n) { if (n !== snap.pending) set({ pending: n }); },
  /** test hooks */
  _setTransport(t) { transport = t || defaultTransport; },
  _setImageFetcher(f) { imageFetcher = f || defaultImageFetcher; },
  pendingCount,
  syncNow,
};

/* ---------------- meta helpers ---------------- */
const getMeta = async (key, d = 0) => (await db.meta.get(key))?.value ?? d;
const setMeta = (key, value) => db.meta.put({ key, value });

async function deviceId() {
  let id = await getMeta('device', '');
  if (!id) { id = (globalThis.crypto?.randomUUID?.() || `d${Date.now()}${Math.random().toString(36).slice(2)}`).slice(0, 36); await setMeta('device', id); }
  return id;
}

export async function pendingCount() {
  let n = 0;
  for (const t of SYNCED) n += await db[t].where('updatedAt').above(await getMeta(`push:${t}`)).count();
  n += await db.tombs.where('updatedAt').above(await getMeta('push:tombs')).count();
  return n;
}

/* ---------------- transport ---------------- */
async function defaultTransport(action, body) {
  const token = auth.getToken ? await auth.getToken() : null;
  if (!token) throw Object.assign(new Error('login_required'), { kind: 'auth' });
  let res;
  try {
    res = await fetch('/api/pos-sync', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ action, ...body }) });
  } catch { throw Object.assign(new Error('offline'), { kind: 'offline' }); }
  const json = await res.json().catch(() => ({}));
  if (res.status === 401) throw Object.assign(new Error('login_required'), { kind: 'auth' });
  if (res.status === 403) throw Object.assign(new Error('Ye account admin nahi hai'), { kind: 'forbidden' });
  if (res.status === 503) throw Object.assign(new Error(`Server setup baaki: ${(json.missing || []).join(', ')}`), { kind: 'config' });
  if (!res.ok) throw Object.assign(new Error(json.message || json.error || `Server error ${res.status}`), { kind: 'server' });
  return json;
}

/* ---------------- push ---------------- */
async function buildRecord(table, row) {
  const { updatedAt, imgSynced, ...data } = row;
  const rec = { rid: ridOf(table, row[pkOf(table)]), type: table, updatedAt, data };
  let sentHash = null;
  if (table === 'products' && (row.imgHash || '') !== (imgSynced || '')) {
    if (row.hasImage) {
      const img = await db.images.get(row.id);
      if (img?.data) { rec.image = { op: 'put', dataUrl: img.data }; sentHash = row.imgHash; }
    } else { rec.image = { op: 'del' }; sentHash = ''; }
  }
  return { rec, sentHash };
}

async function collectBatch() {
  const items = [];          // in order; rec === null means "local only, just move the watermark"
  let bytes = 0;
  const room = () => items.length < BATCH_RECORDS && bytes < BATCH_BYTES;
  for (const table of SYNCED) {
    if (!room()) break;
    const wm = await getMeta(`push:${table}`);
    const rows = await db[table].where('updatedAt').above(wm).limit(BATCH_RECORDS - items.length).toArray();
    for (const row of rows) {
      if (table === 'settings' && LOCAL_ONLY_SETTINGS.has(row.key)) { items.push({ table, updatedAt: row.updatedAt, rec: null }); continue; }
      const { rec, sentHash } = await buildRecord(table, row);
      bytes += JSON.stringify(rec).length;
      items.push({ table, updatedAt: row.updatedAt, rec, sentHash, pk: row[pkOf(table)] });
      if (!room()) break;
    }
  }
  if (room()) {
    const wm = await getMeta('push:tombs');
    const tombs = await db.tombs.where('updatedAt').above(wm).limit(BATCH_RECORDS - items.length).toArray();
    for (const t of tombs) {
      const rec = { rid: t.rid, type: t.table, updatedAt: t.updatedAt, deleted: true, data: {} };
      if (t.table === 'products') rec.image = { op: 'del' };
      items.push({ table: 'tombs', updatedAt: t.updatedAt, rec });
    }
  }
  return items;
}

async function pushAll() {
  const device = await deviceId();
  for (let guard = 0; guard < 10_000; guard++) {
    const items = await collectBatch();
    if (!items.length) return;
    const records = items.filter((i) => i.rec).map((i) => i.rec);
    const results = records.length ? (await transport('push', { device, records })).results : [];
    const byRid = new Map(results.map((r) => [r.rid, r]));

    const blocked = new Set();
    const advance = {};
    for (const it of items) {
      if (blocked.has(it.table)) continue;
      const r = it.rec ? byRid.get(it.rec.rid) : { ok: true };
      if (!r?.ok && !r?.permanent) { blocked.add(it.table); continue; }   // retry later; permanent rejects are skipped
      advance[it.table] = it.updatedAt;
      if (it.table === 'products' && it.sentHash !== null && r?.ok) {
        await asRemote([db.products], async () => {
          const cur = await db.products.get(it.pk);
          if (cur && (cur.imgHash || '') === it.sentHash) await db.products.update(it.pk, { imgSynced: it.sentHash });
        });
      }
    }
    for (const [table, ts] of Object.entries(advance)) {
      await setMeta(`push:${table}`, ts);
      if (table === 'tombs') await db.tombs.where('updatedAt').belowOrEqual(ts).delete();
    }
    if (blocked.size) {
      const bad = results.find((r) => !r.ok);
      throw Object.assign(new Error(bad?.error || 'Kuch records upload nahi hue'), { kind: 'server' });
    }
    if (!Object.keys(advance).length) return;
  }
}

/* ---------------- pull ---------------- */
async function applyRemote(records) {
  await asRemote([...SYNCED.map((t) => db[t]), db.images, db.meta], async () => {
    // tables with nothing waiting to upload: rows we are about to receive are "already synced"
    const clean = {};
    for (const t of SYNCED) clean[t] = (await db[t].where('updatedAt').above(await getMeta(`push:${t}`)).count()) === 0;
    const maxTs = {};
    for (const rec of records) {
      const table = rec.type;
      if (!SYNCED.includes(table)) continue;
      const raw = rec.rid.slice(table.length + 1);
      const pk = table === 'settings' ? raw : Number(raw);
      const local = await db[table].get(pk);
      if (local && local.updatedAt >= rec.updatedAt) continue;      // ours is the same or newer
      maxTs[table] = Math.max(maxTs[table] || 0, rec.updatedAt);
      if (rec.deleted) {
        await db[table].delete(pk);
        if (table === 'products') await db.images.delete(pk);
        continue;
      }
      const row = { ...rec.data, updatedAt: rec.updatedAt };
      if (table === 'products') {
        row.imgSynced = row.imgHash || '';
        if (!row.hasImage) await db.images.delete(pk);
      }
      await db[table].put(row);
    }
    for (const [table, ts] of Object.entries(maxTs)) {
      if (clean[table] && ts > (await getMeta(`push:${table}`))) await setMeta(`push:${table}`, ts);   // don't echo it back up
    }
  });
}

async function pullAll(onProgress) {
  let total = 0;
  for (let guard = 0; guard < 100_000; guard++) {
    const since = await getMeta('pullSrv');
    const res = await transport('pull', { since, limit: 100 });
    if (!res.records.length) return;
    await applyRemote(res.records);
    await setMeta('pullSrv', res.next);
    total += res.records.length;
    onProgress?.(total);
    if (!res.more) return;
  }
}

/* ---------------- photos coming down from the cloud ---------------- */
async function defaultImageFetcher(productId) {
  const { VITE_APPWRITE_ENDPOINT: ep, VITE_APPWRITE_PROJECT_ID: project, VITE_APPWRITE_POS_BUCKET_ID: bucket = 'pos_images' } = import.meta.env;
  if (!ep || !project) return null;
  const res = await fetch(`${ep.replace(/\/$/, '')}/storage/buckets/${bucket}/files/${ridOf('products', productId)}/view?project=${project}`);
  if (!res.ok) return null;
  const blob = await res.blob();
  return new Promise((resolve) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = () => resolve(null); r.readAsDataURL(blob); });
}

async function fetchMissingImages() {
  const withPhoto = (await db.products.toArray()).filter((p) => p.hasImage);
  if (!withPhoto.length) return;
  const have = new Set((await db.images.bulkGet(withPhoto.map((p) => p.id))).map((r, i) => (r ? withPhoto[i].id : null)));
  const missing = withPhoto.filter((p) => !have.has(p.id));
  let changed = false;
  for (let i = 0; i < missing.length; i += 4) {
    await Promise.all(missing.slice(i, i + 4).map(async (p) => {
      try {
        const data = await imageFetcher(p.id);
        if (!data) return;
        await asRemote([db.images, db.products], async () => {
          const cur = await db.products.get(p.id);
          if (cur?.hasImage) { await db.images.put({ id: p.id, data, hash: cur.imgHash }); changed = true; }
        });
      } catch { /* try again on the next sync */ }
    }));
  }
  if (changed) globalThis.dispatchEvent?.(new Event('pos-images'));
}

/* ---------------- orchestration ---------------- */
async function syncNow() {
  if (running) return running;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) { set({ status: 'offline', message: 'Internet nahi hai. Sab local save ho raha hai.' }); return undefined; }
  if (!auth.signedIn) { set({ status: 'auth', message: 'Cloud sync ke liye admin login karo' }); return undefined; }
  running = (async () => {
    set({ status: 'syncing', message: '', detail: '' });
    try {
      await pushAll();
      await pullAll((n) => set({ detail: `${n} records aaye` }));
      await fetchMissingImages();
      const lastSyncAt = Date.now();
      await setMeta('lastSyncAt', lastSyncAt);
      set({ status: 'idle', lastSyncAt, message: '', detail: '', pending: await pendingCount() });
    } catch (e) {
      const map = { offline: 'offline', auth: 'auth', forbidden: 'auth', config: 'config' };
      set({ status: map[e.kind] || 'error', message: e.kind === 'offline' ? 'Internet nahi hai. Sab local save ho raha hai.' : e.kind === 'auth' ? 'Cloud sync ke liye admin login karo' : e.message, pending: await pendingCount().catch(() => snap.pending) });
    } finally { running = null; }
  })();
  return running;
}

export async function loadLastSync() {
  const t = await getMeta('lastSyncAt');
  if (t && !snap.lastSyncAt) set({ lastSyncAt: t });
}
