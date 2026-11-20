/* eslint-disable no-useless-assignment */
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db, DEFAULT_SETTINGS } from '../data/db';
import { ProductRepo, InvoiceRepo, CustomerRepo, SettingsRepo, wipeAllData } from '../data/repositories';
import { sync } from './engine';
import { createPosServer } from './serverCore';
import { createAppwriteRest } from './appwriteRest';
import { fakeAppwrite } from './fakeAppwrite';

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

describe('clear errors instead of silent failure', () => {
  it('an HTML answer (npm run dev without the API) becomes a readable config error, never a crash', async () => {
    await ProductRepo.save({ name: 'X', sellPrice: 100, costPrice: 50, stock: 1 });
    sync._setTransport(null);                                   // use the real fetch transport
    globalThis.fetch = async () => ({ status: 200, ok: true, text: async () => '<!doctype html><html></html>' });
    sync.setAuth({ getToken: async () => 't', signedIn: true });
    await sync.syncNow();
    const s = sync.getSnapshot();
    expect(s.status).toBe('config');
    expect(s.message).toMatch(/Sync server/);
    expect(await sync.pendingCount()).toBeGreaterThan(0);       // nothing lost, still queued
  });

  it('diagnose names the broken step', async () => {
    sync._setTransport(async () => ({ ok: false, collection: { ok: false, message: 'pos_records collection nahi mila. Computer par "npm run setup:appwrite" chalao.' }, bucket: { ok: true }, records: 0 }));
    const steps = await sync.diagnose();
    const bad = steps.find((x) => !x.ok);
    expect(bad.label).toMatch(/collection/);
    expect(bad.detail).toMatch(/setup:appwrite/);
    sync.setAuth({ getToken: async () => null, signedIn: false });
    expect((await sync.diagnose()).find((x) => !x.ok).label).toMatch(/login/i);
  });

  it('"upload everything" re-sends data that was already uploaded', async () => {
    const server = createPosServer({ api: cloud.api });
    sync._setTransport(async (a, b) => (await server.handle({ action: a, ...b })).json);
    sync.setAuth({ getToken: async () => 't', signedIn: true });
    const id = await ProductRepo.save({ name: 'Again', sellPrice: 100, costPrice: 50, stock: 1 });
    await sync.syncNow();
    expect(await sync.pendingCount()).toBe(0);
    cloud.docs.delete(`products_${id}`);                         // cloud copy lost
    await sync.uploadEverything();
    expect(cloud.docs.has(`products_${id}`)).toBe(true);
  });

  it('server ping reports missing collection with the fix', async () => {
    const api = { ...cloud.api, countDocs: async () => { throw Object.assign(new Error('x'), { code: 404 }); }, checkBucket: async () => ({}) };
    const r = await createPosServer({ api }).handle({ action: 'ping' });
    expect(r.json.ok).toBe(false);
    expect(r.json.collection.message).toMatch(/setup:appwrite/);
  });
});

describe('first sync uploads everything already on the device', () => {
  it('even if earlier failed attempts left stale watermarks', async () => {
    const a = await ProductRepo.save({ name: 'Old item 1', sellPrice: 100, costPrice: 50, stock: 1 });
    const b = await ProductRepo.save({ name: 'Old item 2', sellPrice: 100, costPrice: 50, stock: 1 });
    await db.meta.put({ key: 'push:products', value: Date.now() + 10_000_000 });   // pretend a broken attempt "advanced" it
    await sync.syncNow();
    expect(cloud.docs.has(`products_${a}`) && cloud.docs.has(`products_${b}`)).toBe(true);
  });
});

describe('sale history is append-only in the cloud too', () => {
  it('the server refuses to mark a bill, payment or stock entry as deleted, but still accepts normal saves', async () => {
    const server = createPosServer({ api: cloud.api });
    const r = await server.handle({ action: 'push', device: 'x', records: [
      { rid: 'invoices_1', type: 'invoices', updatedAt: 5, data: { number: 'BM-00001' } },
      { rid: 'invoices_1', type: 'invoices', updatedAt: 9, deleted: true, data: {} },
      { rid: 'payments_1', type: 'payments', updatedAt: 9, deleted: true, data: {} },
      { rid: 'stockMoves_1', type: 'stockMoves', updatedAt: 9, deleted: true, data: {} },
      { rid: 'products_1', type: 'products', updatedAt: 9, deleted: true, data: {} },
    ] });
    expect(r.json.results.map((x) => x.ok)).toEqual([true, false, false, false, true]);
    expect(r.json.results[1].error).toMatch(/cannot be deleted/);
    expect(JSON.parse(cloud.docs.get('invoices_1').data).number).toBe('BM-00001');   // still there
    expect(cloud.docs.get('invoices_1').deleted).toBe(false);
  });
});
