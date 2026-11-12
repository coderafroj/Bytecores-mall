/** Minimal Appwrite REST client (no SDK): exactly the calls the sync server needs. */
export function createAppwriteRest({ endpoint, project, key, databaseId, collectionId, bucketId, fetchImpl = fetch }) {
  const base = endpoint.replace(/\/$/, '');
  const docs = `/databases/${databaseId}/collections/${collectionId}/documents`;
  const files = `/storage/buckets/${bucketId}/files`;

  async function call(method, path, { json, form, params } = {}) {
    const qs = params ? '?' + params.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&') : '';
    const headers = { 'X-Appwrite-Project': project, 'X-Appwrite-Key': key };
    if (json) headers['Content-Type'] = 'application/json';
    const res = await fetchImpl(base + path + qs, { method, headers, body: json ? JSON.stringify(json) : form });
    const text = await res.text();
    let body; try { body = text ? JSON.parse(text) : {}; } catch { body = { message: text }; }
    if (!res.ok) { const e = new Error(body.message || `Appwrite ${res.status}`); e.code = res.status; throw e; }
    return body;
  }
  const notFound = (e) => { if (e.code === 404) return null; throw e; };

  return {
    getDoc: (id) => call('GET', `${docs}/${id}`).catch(notFound),
    createDoc: (id, data) => call('POST', docs, { json: { documentId: id, data } }),
    updateDoc: (id, data) => call('PATCH', `${docs}/${id}`, { json: { data } }),
    async listDocs({ since, limit }) {
      const q = [
        { method: 'greaterThan', attribute: 'srv', values: [since] },
        { method: 'orderAsc', attribute: 'srv' },
        { method: 'limit', values: [limit] },
      ];
      return (await call('GET', docs, { params: q.map((x) => ['queries[]', JSON.stringify(x)]) })).documents;
    },
    async putImage(id, dataUrl) {
      const [, mime, b64] = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
      const bytes = Buffer.from(b64, 'base64');
      const send = () => {
        const form = new FormData();
        form.append('fileId', id);
        form.append('file', new Blob([bytes], { type: mime }), `${id}.${mime.split('/')[1]}`);
        return call('POST', files, { form });
      };
      try { await send(); } catch (e) {
        if (e.code !== 409) throw e;
        await call('DELETE', `${files}/${id}`).catch(notFound);   // replace the old photo
        await send();
      }
    },
    delImage: (id) => call('DELETE', `${files}/${id}`).catch(notFound),
  };
}
