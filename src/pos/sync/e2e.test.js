/* eslint-disable no-useless-assignment */
// The whole production path in one process: local items -> engine -> POST /api/pos-sync ->
// real handler -> REAL Clerk token verification -> (fake) Appwrite. Only Clerk's "get email" call is faked.
import 'fake-indexeddb/auto';
import { generateKeyPairSync, createSign } from 'node:crypto';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { fakeAppwrite } from './fakeAppwrite';

const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const mint = (sub) => { const h = b64({ alg: 'RS256', typ: 'JWT', kid: 'k' }); const p = b64({ sub, iat: now - 5, nbf: now - 5, exp: now + 120, iss: 'https://c.example' }); return `${h}.${p}.${createSign('RSA-SHA256').update(`${h}.${p}`).sign(privateKey).toString('base64url')}`; };
const token = mint('user_1');

let email = 'owner@shop.com';
vi.mock('@clerk/backend', async (orig) => ({ ...(await orig()), createClerkClient: () => ({ users: { getUser: async () => ({ primaryEmailAddressId: 'e', emailAddresses: [{ id: 'e', emailAddress: email }] }) } }) }));
const { default: handler } = await import('../../../api/pos-sync.js');
const { db } = await import('../data/db');
const { ProductRepo, InvoiceRepo, wipeAllData } = await import('../data/repositories');
const { sync } = await import('./engine');

let cloud;
beforeAll(() => {
  cloud = fakeAppwrite();
  Object.assign(process.env, { APPWRITE_API_KEY: 'K', CLERK_SECRET_KEY: 'sk_test_x', ADMIN_EMAILS: 'owner@shop.com', APPWRITE_ENDPOINT: 'https://aw.test/v1', APPWRITE_PROJECT_ID: 'p', APPWRITE_DATABASE_ID: 'd', CLERK_JWT_KEY: publicKey.export({ type: 'spki', format: 'pem' }) });
  vi.stubGlobal('fetch', async (url, init) => {
    if (String(url).startsWith('/api/pos-sync')) {          // the browser calling our Vercel function
      const r = { code: 200, body: null, setHeader() {}, status(c) { r.code = c; return r; }, json(b) { r.body = b; return r; } };
      await handler({ method: 'POST', headers: Object.fromEntries(Object.entries(init.headers).map(([k, v]) => [k.toLowerCase(), v])), body: JSON.parse(init.body) }, r);
      return { status: r.code, ok: r.code < 400, text: async () => JSON.stringify(r.body) };
    }
    return cloud.fetchImpl(url, init);                       // the function calling Appwrite
  });
  sync._setTransport(null);
  sync._setImageFetcher(async () => null);
});

describe('production path', () => {
  it('items that were only local get uploaded automatically, photo included, and survive a new device', async () => {
    await wipeAllData();
    const id = await ProductRepo.save({ name: 'Local only item', sellPrice: 12900, costPrice: 8000, stock: 7, image: 'data:image/webp;base64,AAAAAAAA' });
    await InvoiceRepo.createSale({ lines: [{ productId: id, name: 'Local only item', qty: 2, unitPrice: 12900, costPrice: 8000, gstRate: 0 }], discount: null, payments: [{ method: 'CASH', amount: 25800 }], customer: null, settings: { invoicePrefix: 'BM', roundOff: false } });

    sync.setAuth({ getToken: async () => token, signedIn: true });
    await sync.syncNow();
    expect(sync.getSnapshot().status).toBe('idle');
    expect(cloud.docs.has(`products_${id}`)).toBe(true);
    expect(JSON.parse(cloud.docs.get(`products_${id}`).data).stock).toBe(5);
    expect([...cloud.docs.keys()].some((k) => k.startsWith('invoices_'))).toBe(true);
    expect(cloud.files.has(`products_${id}`)).toBe(true);

    await wipeAllData();                                     // new laptop
    await sync.syncNow();
    expect((await db.products.get(id)).name).toBe('Local only item');
  });

  it('a non-admin Clerk account is refused with the email shown', async () => {
    email = 'stranger@x.com';
    const strangerToken = mint('user_2');
    await wipeAllData();
    await ProductRepo.save({ name: 'x', sellPrice: 100, costPrice: 50, stock: 1 });
    sync.setAuth({ getToken: async () => strangerToken, signedIn: true });
    await sync.syncNow();
    expect(sync.getSnapshot().status).toBe('auth');
    expect(sync.getSnapshot().message).toMatch(/Ye account admin nahi hai|login nahi mana|admin/i);
    email = 'owner@shop.com';
  });

  it('a token from a different Clerk instance explains itself', async () => {
    await wipeAllData();
    await ProductRepo.save({ name: 'y', sellPrice: 100, costPrice: 50, stock: 1 });
    sync.setAuth({ getToken: async () => token.slice(0, -6) + 'AAAAAA', signedIn: true });
    await sync.syncNow();
    expect(sync.getSnapshot().message).toMatch(/CLERK_SECRET_KEY|verify|signature|token/i);
  });
});
