/* eslint-disable no-useless-assignment */
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db, DEFAULT_SETTINGS } from '../data/db';
import { ProductRepo, InvoiceRepo, CustomerRepo, SettingsRepo, wipeAllData } from '../data/repositories';
import { sync } from './engine';
import { createPosServer } from './serverCore';
import { createAppwriteRest } from './appwriteRest';

/* ---- a fake Appwrite speaking the real REST shapes, so the adapter is tested too ---- */
function fakeAppwrite() {
  const docs = new Map(); const files = new Map(); const calls = [];
  const fetchImpl = async (url, init = {}) => {
    const u = new URL(url); const m = init.method || 'GET'; calls.push(`${m} ${u.pathname}`);
    const json = (code, body) => ({ ok: code < 400, status: code, text: async () => JSON.stringify(body) });
    if (init.headers['X-Appwrite-Key'] !== 'K') return json(401, { message: 'bad key' });
    let r;
    if ((r = /\/documents$/.exec(u.pathname))) {
      if (m === 'POST') {
        const b = JSON.parse(init.body);
        if (docs.has(b.documentId)) return json(409, { message: 'exists' });
        docs.set(b.documentId, { $id: b.documentId, ...b.data }); return json(201, docs.get(b.documentId));
      }
      const qs = u.searchParams.getAll('queries[]').map((q) => JSON.parse(q));
      const since = qs.find((q) => q.method === 'greaterThan').values[0]; const lim = qs.find((q) => q.method === 'limit').values[0];
      const out = [...docs.values()].filter((d) => d.srv > since).sort((a, b) => a.srv - b.srv).slice(0, lim);
      return json(200, { documents: out });
    }
    if ((r = /\/documents\/([^/]+)$/.exec(u.pathname))) {
      const d = docs.get(r[1]); if (!d) return json(404, { message: 'nf' });
      if (m === 'PATCH') { Object.assign(d, JSON.parse(init.body).data); return json(200, d); }
      return json(200, d);
    }
    if (/\/files$/.test(u.pathname)) {
      const id = init.body.get('fileId'); if (files.has(id)) return json(409, { message: 'exists' });
      files.set(id, init.body.get('file')); return json(201, { $id: id });
    }
    if ((r = /\/files\/([^/]+)$/.exec(u.pathname)) && m === 'DELETE') { return files.delete(r[1]) ? json(204, {}) : json(404, { message: 'nf' }); }
    return json(500, { message: 'unhandled ' + m + u.pathname });
  };
  const api = createAppwriteRest({ endpoint: 'https://aw.test/v1', project: 'p', key: 'K', databaseId: 'd', collectionId: 'c', bucketId: 'b', fetchImpl });
  return { api, docs, files, calls };
}

let cloud;
beforeEach(async () => {
  await wipeAllData();
  cloud = fakeAppwrite();
  const server = createPosServer({ api: cloud.api });
  sync._setTransport(async (action, body) => { const out = await server.handle({ action, ...body }); if (out.status !== 200) throw new Error(out.json.error); return out.json; });
  sync._setImageFetcher(async (pid) => { const f = cloud.files.get(`products_${pid}`); return f ? 'data:image/webp;base64,RESTORED' : null; });
  sync.setAuth({ getToken: async () => 't', signedIn: true });
});
const settings = { ...DEFAULT_SETTINGS, roundOff: false };
const IMG = 'data:image/webp;base64,AAAAAAAA';

describe('change tracking', () => {
  it('stamps every write with a strictly increasing updatedAt and records deletes', async () => {
    const a = await ProductRepo.save({ name: 'A', sellPrice: 100, costPrice: 50, stock: 1 });
    const b = await ProductRepo.save({ name: 'B', sellPrice: 100, costPrice: 50, stock: 1 });
    const [pa, pb] = await Promise.all([db.products.get(a), db.products.get(b)]);
    expect(pb.updatedAt).toBeGreaterThan(pa.updatedAt);
    await ProductRepo.save({ id: a, name: 'A2', sellPrice: 100, costPrice: 50, stock: 1 });
    expect((await db.products.get(a)).updatedAt).toBeGreaterThan(pb.updatedAt);
    await ProductRepo.remove(b);
    await new Promise((r) => setTimeout(r, 20));
    expect((await db.tombs.toArray()).map((t) => t.rid)).toEqual([`products_${b}`]);
  });
});

describe('push', () => {
  it('uploads products, photo, bills, customers; second sync sends nothing', async () => {
    const id = await ProductRepo.save({ name: 'Cable', sellPrice: 15000, costPrice: 9000, stock: 5, image: IMG });
    const p = await db.products.get(id);
    await InvoiceRepo.createSale({ lines: [{ productId: id, name: 'Cable', qty: 1, unitPrice: 15000, costPrice: 9000, gstRate: 0 }], discount: null, payments: [], customer: { name: 'Ram', phone: '9876543210' }, settings });
    expect(await sync.pendingCount()).toBeGreaterThan(0);
    await sync.syncNow();
    expect(sync.getSnapshot().status).toBe('idle');
    expect(await sync.pendingCount()).toBe(0);
    expect(cloud.docs.has(`products_${id}`)).toBe(true);
    expect(cloud.docs.has('invoices_1') || [...cloud.docs.keys()].some((k) => k.startsWith('invoices_'))).toBe(true);
    expect(cloud.files.has(`products_${id}`)).toBe(true);
    expect((await db.products.get(id)).imgSynced).toBe(p.imgHash);
    const before = cloud.calls.length;
    await sync.syncNow();
    expect(cloud.calls.slice(before).filter((c) => c.startsWith('POST') || c.startsWith('PATCH'))).toEqual([]);
  });

  it('edits and deletes reach the cloud; PIN stays local', async () => {
    const id = await ProductRepo.save({ name: 'Pen', sellPrice: 1000, costPrice: 500, stock: 9, image: IMG });
    await SettingsRepo.save({ shopName: 'Raj Mall', pinHash: 'secret-hash' });
    await sync.syncNow();
    await ProductRepo.save({ id, name: 'Pen Blue', sellPrice: 1200, costPrice: 500, stock: 9 });
    await sync.syncNow();
    expect(JSON.parse(cloud.docs.get(`products_${id}`).data).name).toBe('Pen Blue');
    expect(cloud.docs.has('settings_shopName')).toBe(true);
    expect(cloud.docs.has('settings_pinHash')).toBe(false);
    await ProductRepo.remove(id);
    await new Promise((r) => setTimeout(r, 20));
    await sync.syncNow();
    expect(cloud.docs.get(`products_${id}`).deleted).toBe(true);
    expect(cloud.files.has(`products_${id}`)).toBe(false);
  });

  it('offline then online: nothing is lost', async () => {
    const id = await ProductRepo.save({ name: 'Offline item', sellPrice: 500, costPrice: 200, stock: 2 });
    sync._setTransport(async () => { throw Object.assign(new Error('offline'), { kind: 'offline' }); });
    await sync.syncNow();
    expect(sync.getSnapshot().status).toBe('offline');
    expect(await sync.pendingCount()).toBeGreaterThan(0);
    expect(await db.products.get(id)).toBeTruthy();
    const server = createPosServer({ api: cloud.api });
    sync._setTransport(async (a, b) => (await server.handle({ action: a, ...b })).json);
    await sync.syncNow();
    expect(sync.getSnapshot().status).toBe('idle');
    expect(cloud.docs.has(`products_${id}`)).toBe(true);
  });
});

describe('restore on a new device', () => {
  it('pulls products, photo, bills and customers back after a wipe', async () => {
    const id = await ProductRepo.save({ name: 'Mouse', sellPrice: 30000, costPrice: 20000, stock: 4, image: IMG });
    await InvoiceRepo.createSale({ lines: [{ productId: id, name: 'Mouse', qty: 2, unitPrice: 30000, costPrice: 20000, gstRate: 0 }], discount: null, payments: [], customer: { name: 'Sita', phone: '9000000001' }, settings });
    await sync.syncNow();

    await wipeAllData();                       // brand-new laptop
    expect(await db.products.count()).toBe(0);
    await sync.syncNow();
    const p = await db.products.get(id);
    expect([p.name, p.stock]).toEqual(['Mouse', 2]);
    expect((await db.images.get(id)).data).toBe('data:image/webp;base64,RESTORED');
    expect(await db.invoices.count()).toBe(1);
    const c = await db.customers.toCollection().first();
    expect(c.credit).toBe(60000);
    expect(await sync.pendingCount()).toBe(0);   // restored rows are not re-uploaded
    // and the app keeps working: next id continues after the restored ones
    const id2 = await ProductRepo.save({ name: 'New', sellPrice: 100, costPrice: 50, stock: 1 });
    expect(id2).toBeGreaterThan(id);
  });

  it('newer local edit is not overwritten by an older cloud copy', async () => {
    const id = await ProductRepo.save({ name: 'Keep', sellPrice: 100, costPrice: 50, stock: 1 });
    await sync.syncNow();
    await ProductRepo.save({ id, name: 'Keep v2', sellPrice: 100, costPrice: 50, stock: 1 });
    await sync.syncNow();
    expect((await db.products.get(id)).name).toBe('Keep v2');
  });
});

describe('server safety', () => {
  it('rejects malformed records and oversized images, never crashes', async () => {
    const server = createPosServer({ api: cloud.api });
    const r = await server.handle({ action: 'push', device: 'x', records: [
      { rid: '../etc', type: 'products', updatedAt: 1, data: {} },
      { rid: 'products_1', type: 'hacker', updatedAt: 1, data: {} },
      { rid: 'products_2', type: 'products', updatedAt: 1, data: {}, image: { op: 'put', dataUrl: 'data:text/html;base64,AAAA' } },
      { rid: 'products_3', type: 'products', updatedAt: 1, data: { name: 'ok' } },
    ] });
    expect(r.json.results.map((x) => x.ok)).toEqual([false, false, false, true]);
    expect((await server.handle({ action: 'nope' })).status).toBe(400);
  });

  it('wrong Appwrite key surfaces as an error, not silent loss', async () => {
    const bad = createAppwriteRest({ endpoint: 'https://aw.test/v1', project: 'p', key: 'WRONG', databaseId: 'd', collectionId: 'c', bucketId: 'b', fetchImpl: async () => ({ ok: false, status: 401, text: async () => '{"message":"bad key"}' }) });
    const r = await createPosServer({ api: bad }).handle({ action: 'pull', since: 0 });
    expect(r.status).toBe(502);
  });
});

describe('wipe / restore never delete the cloud copy', () => {
  it('erasing this device keeps cloud data; restoring a backup re-uploads it', async () => {
    const id = await ProductRepo.save({ name: 'Safe', sellPrice: 100, costPrice: 50, stock: 3 });
    await sync.syncNow();
    await wipeAllData();
    expect(await db.tombs.count()).toBe(0);
    await sync.syncNow();                                   // comes back from the cloud
    expect((await db.products.get(id)).name).toBe('Safe');
    expect(cloud.docs.get(`products_${id}`).deleted).toBe(false);

    const { BackupService } = await import('../data/repositories');
    const dump = JSON.parse(JSON.stringify(await BackupService.exportAll()));
    await BackupService.importAll(dump);
    expect(await db.tombs.count()).toBe(0);
    expect(await sync.pendingCount()).toBeGreaterThan(0);   // restored rows are queued for upload
    await sync.syncNow();
    expect(cloud.docs.get(`products_${id}`).deleted).toBe(false);
  });
});
