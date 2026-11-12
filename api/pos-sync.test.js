import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/backend', () => ({
  verifyToken: async (t) => { if (t !== 'good') throw new Error('bad token'); return { sub: 'u-' + globalThis.__email }; },
  createClerkClient: () => ({ users: { getUser: async () => ({ primaryEmailAddressId: 'e1', emailAddresses: [{ id: 'e1', emailAddress: globalThis.__email }] }) } }),
}));
const { default: handler } = await import('./pos-sync.js');

const res = () => { const r = { code: 200, body: null, headers: {} }; r.setHeader = (k, v) => { r.headers[k] = v; }; r.status = (c) => { r.code = c; return r; }; r.json = (b) => { r.body = b; return r; }; return r; };
const call = async (over = {}) => { const r = res(); await handler({ method: 'POST', headers: { authorization: 'Bearer good' }, body: { action: 'ping' }, ...over }, r); return r; };

const ENV = { APPWRITE_API_KEY: 'K', CLERK_SECRET_KEY: 'sk', APPWRITE_ENDPOINT: 'https://aw.test/v1', APPWRITE_PROJECT_ID: 'p', APPWRITE_DATABASE_ID: 'd', ADMIN_EMAILS: 'owner@shop.com' };
beforeEach(() => { Object.assign(process.env, ENV); globalThis.__email = 'owner@shop.com'; });

describe('POST /api/pos-sync', () => {
  it('only accepts POST and never caches', async () => {
    const r = await call({ method: 'GET' });
    expect(r.code).toBe(405);
    expect(r.headers['Cache-Control']).toBe('no-store');
  });
  it('503 and names what is missing when env is not set', async () => {
    delete process.env.APPWRITE_API_KEY;
    const r = await call();
    expect([r.code, r.body.missing]).toEqual([503, ['APPWRITE_API_KEY']]);
  });
  it('401 without a token or with a bad one', async () => {
    expect((await call({ headers: {} })).code).toBe(401);
    expect((await call({ headers: { authorization: 'Bearer nope' } })).code).toBe(401);
  });
  it('403 for a logged-in user who is not an admin', async () => {
    globalThis.__email = 'stranger@x.com';
    expect((await call()).code).toBe(403);
  });
  it('admin (case-insensitive email) gets through; and a pull hits Appwrite with the server key only', async () => {
    globalThis.__email = 'Owner@Shop.com';
    const seen = [];
    vi.stubGlobal('fetch', async (url, init) => { seen.push([url, init.headers['X-Appwrite-Key']]); return { ok: true, status: 200, text: async () => '{"documents":[]}' }; });
    const r = await call({ body: { action: 'pull', since: 0, limit: 100 } });
    expect(r.code).toBe(200);
    expect(r.body).toEqual({ records: [], next: 0, more: false });
    expect(seen[0][0]).toContain('/databases/d/collections/pos_records/documents');
    expect(seen[0][1]).toBe('K');
    vi.unstubAllGlobals();
  });
});
