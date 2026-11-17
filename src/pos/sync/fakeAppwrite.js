/* eslint-disable no-useless-assignment */
// Test helper only (not imported by the app): an in-memory Appwrite that speaks the real REST shapes.
import { createAppwriteRest } from './appwriteRest';

/* ---- a fake Appwrite speaking the real REST shapes, so the adapter is tested too ---- */
export function fakeAppwrite() {
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
  return { api, docs, files, calls, fetchImpl };
}

