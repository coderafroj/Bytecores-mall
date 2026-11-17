// Uses the REAL @clerk/backend verifyToken (only the network call for the user's email is faked).
import { generateKeyPairSync, createSign } from 'node:crypto';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
function jwt(claims, key = privateKey) {
  const head = b64({ alg: 'RS256', typ: 'JWT', kid: 'ins_test' });
  const body = b64(claims);
  const sig = createSign('RSA-SHA256').update(`${head}.${body}`).sign(key).toString('base64url');
  return `${head}.${body}.${sig}`;
}
const now = Math.floor(Date.now() / 1000);
const good = (over = {}) => jwt({ sub: 'user_123', iat: now - 5, nbf: now - 5, exp: now + 60, iss: 'https://clerk.example.com', ...over });

vi.mock('@clerk/backend', async (orig) => ({ ...(await orig()), createClerkClient: () => ({ users: { getUser: async () => ({ primaryEmailAddressId: 'e1', emailAddresses: [{ id: 'e1', emailAddress: 'Owner@Shop.com' }] }) } }) }));
const { default: handler } = await import('./pos-sync.js');

const res = () => { const r = { code: 200, body: null }; r.setHeader = () => {}; r.status = (c) => { r.code = c; return r; }; r.json = (b) => { r.body = b; return r; }; return r; };
const call = async (token) => { const r = res(); await handler({ method: 'POST', headers: token ? { authorization: `Bearer ${token}` } : {}, body: { action: 'pull', since: 0, limit: 1 } }, r); return r; };

beforeAll(() => {
  Object.assign(process.env, {
    APPWRITE_API_KEY: 'K', CLERK_SECRET_KEY: 'sk_test_x', ADMIN_EMAILS: 'owner@shop.com',
    APPWRITE_ENDPOINT: 'https://aw.test/v1', APPWRITE_PROJECT_ID: 'p', APPWRITE_DATABASE_ID: 'd',
    CLERK_JWT_KEY: publicKey.export({ type: 'spki', format: 'pem' }),
  });
  vi.stubGlobal('fetch', async () => ({ ok: true, status: 200, text: async () => '{"documents":[]}' }));
});

describe('handler with the real Clerk library', () => {
  it('a valid admin token is accepted', async () => {
    const r = await call(good());
    expect([r.code, r.body?.error]).toEqual([200, undefined]);
  });
  it('expired / forged / garbage tokens are rejected with a reason', async () => {
    expect((await call(good({ exp: now - 100 }))).code).toBe(401);
    const other = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey;
    expect((await call(good({}).split('.').slice(0, 2).join('.') + '.' + jwt({}, other).split('.')[2])).code).toBe(401);
    const bad = await call('garbage');
    expect(bad.code).toBe(401);
    expect(bad.body.reason).toBeTruthy();
  });
});
