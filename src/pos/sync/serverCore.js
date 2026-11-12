/**
 * Server side of the shop sync. Runs ONLY inside the Vercel function (api/pos-sync.js),
 * after the caller was verified as admin. The browser never sees an Appwrite key.
 *
 * Storage model (schema-less, so app updates never need a DB migration):
 *   one Appwrite collection, one document per record:  id = "<table>_<pk>"
 *   { type, data (JSON string), updatedAt, srv, deleted, device }
 *   `updatedAt` = device clock (decides who wins a conflict)
 *   `srv`       = server order number (lets any device ask "what's new since X?")
 */
export const TYPES = ['products', 'customers', 'invoices', 'expenses', 'payments', 'stockMoves', 'settings'];
const RID = /^[A-Za-z]+_[A-Za-z0-9]{1,24}$/;
const MAX_RECORDS = 60;
const MAX_DATA = 90_000;
const MAX_IMAGE_BYTES = 400_000;

function validate(rec) {
  if (!rec || typeof rec.rid !== 'string' || !RID.test(rec.rid)) return 'bad rid';
  if (!TYPES.includes(rec.type) || !rec.rid.startsWith(rec.type + '_')) return 'bad type';
  if (!Number.isFinite(rec.updatedAt)) return 'bad updatedAt';
  if (JSON.stringify(rec.data || {}).length > MAX_DATA) return 'record too large';
  if (rec.image?.op === 'put') {
    const m = /^data:image\/(webp|jpeg|png);base64,/.exec(rec.image.dataUrl || '');
    if (!m) return 'bad image';
    if (rec.image.dataUrl.length * 0.75 > MAX_IMAGE_BYTES) return 'image too large';
  }
  return '';
}

export function createPosServer({ api, now = Date.now }) {
  async function upsert(rec, srv, device) {
    if (rec.image?.op === 'put') await api.putImage(rec.rid, rec.image.dataUrl);
    else if (rec.image?.op === 'del') await api.delImage(rec.rid);
    const doc = {
      type: rec.type, data: JSON.stringify(rec.data || {}), updatedAt: rec.updatedAt,
      srv, deleted: !!rec.deleted, device: String(device || '').slice(0, 40),
    };
    try {
      await api.createDoc(rec.rid, doc);
    } catch (e) {
      if (e.code !== 409) throw e;
      const cur = await api.getDoc(rec.rid);
      if (cur && cur.updatedAt > rec.updatedAt) return { stale: true };   // someone saved a newer copy
      await api.updateDoc(rec.rid, doc);
    }
    return {};
  }

  async function push({ records, device }) {
    if (!Array.isArray(records) || records.length > MAX_RECORDS) return { status: 400, json: { error: 'bad batch' } };
    const base = now() * 1000;
    const results = new Array(records.length);
    // small parallelism: fast, but gentle on Appwrite rate limits
    for (let i = 0; i < records.length; i += 6) {
      await Promise.all(records.slice(i, i + 6).map(async (rec, j) => {
        const k = i + j;
        const bad = validate(rec);
        if (bad) { results[k] = { rid: rec?.rid, ok: false, error: bad, permanent: true }; return; }
        try { results[k] = { rid: rec.rid, ok: true, ...(await upsert(rec, base + k, device)) }; }
        catch (e) { results[k] = { rid: rec.rid, ok: false, error: e.message || 'failed' }; }
      }));
    }
    return { status: 200, json: { results } };
  }

  async function pull({ since = 0, limit = 100 }) {
    const lim = Math.min(Math.max(1, Number(limit) | 0), 100);
    const docs = await api.listDocs({ since: Number(since) || 0, limit: lim });
    const records = docs.map((d) => ({
      rid: d.$id, type: d.type, data: safeJson(d.data), updatedAt: d.updatedAt, deleted: !!d.deleted, srv: d.srv,
    }));
    return { status: 200, json: { records, next: records.length ? records[records.length - 1].srv : since, more: docs.length === lim } };
  }

  return {
    async handle(body) {
      try {
        if (body?.action === 'push') return await push(body);
        if (body?.action === 'pull') return await pull(body);
        if (body?.action === 'ping') return { status: 200, json: { ok: true } };
        return { status: 400, json: { error: 'unknown action' } };
      } catch (e) {
        return { status: 502, json: { error: 'storage_error', message: e.message } };
      }
    },
  };
}

function safeJson(s) { try { return JSON.parse(s); } catch { return {}; } }
