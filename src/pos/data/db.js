import Dexie from 'dexie';

/**
 * Local-first database (IndexedDB). Works 100% offline; this is the source of
 * truth for the shop. All money fields are integer paise.
 */
class MallDB extends Dexie {
  constructor() {
    super('bytecores_mall_pos');
    this.version(1).stores({
      products: '++id, &sku, barcode, name, category, stock, updatedAt',
      invoices: '++id, &number, createdAt, customerId, status',
      customers: '++id, &phone, name',
      stockMoves: '++id, productId, type, createdAt',
      payments: '++id, customerId, createdAt',
      settings: 'key',
    });
    // v2: shop expenses (rent, salary, electricity...) for true net-profit.
    this.version(2).stores({ expenses: '++id, createdAt, category' });
    // v3: cloud sync. `updatedAt` is a strictly increasing stamp set automatically on every write
    // (see hooks below), so "what changed since last sync" is one indexed range read.
    // Photos live in their own table so the product list stays small and fast.
    this.version(3).stores({
      invoices: '++id, &number, createdAt, customerId, status, updatedAt',
      customers: '++id, &phone, name, updatedAt',
      stockMoves: '++id, productId, type, createdAt, updatedAt',
      payments: '++id, customerId, createdAt, updatedAt',
      expenses: '++id, createdAt, category, updatedAt',
      settings: 'key, updatedAt',
      images: 'id',
      tombs: 'rid, updatedAt',
      meta: 'key',
    }).upgrade(async (tx) => {
      let ts = Date.now();
      for (const t of ['products', 'invoices', 'customers', 'stockMoves', 'payments', 'expenses', 'settings']) {
        await tx.table(t).toCollection().modify((r) => { r.updatedAt = ts++; });
      }
      const imgs = [];
      await tx.table('products').toCollection().modify((p) => {
        if (p.image) { const hash = hashStr(p.image); imgs.push({ id: p.id, data: p.image, hash }); p.hasImage = 1; p.imgHash = hash; }
        delete p.image;
      });
      if (imgs.length) await tx.table('images').bulkPut(imgs);
    });
  }
}

/** FNV-1a: cheap O(len) fingerprint used to detect a changed photo. */
export function hashStr(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(36) + str.length.toString(36);
}

export const db = new MallDB();

/* ---- automatic change tracking for sync ---- */
let lastTs = 0;
/** Strictly increasing millisecond stamp: no two rows on this device ever tie. */
export const nextTs = () => (lastTs = Math.max(Date.now(), lastTs + 1));
export const SYNCED = ['products', 'customers', 'invoices', 'expenses', 'payments', 'stockMoves', 'settings'];
/** Sale history can be added to, never removed. Only the sync engine (isRemote) may touch these deletions. */
export const APPEND_ONLY = ['invoices', 'payments', 'stockMoves'];
export const LOCAL_ONLY_SETTINGS = new Set(['pinHash', 'staffPinHash', 'lastBackupAt']);
export const ridOf = (table, pk) => `${table}_${pk}`;

for (const name of SYNCED) {
  const t = db[name];
  // rows written by the sync engine itself run in a transaction flagged `isRemote` and are not re-stamped
  t.hook('creating', function (pk, obj, tx) { if (!tx?.isRemote) obj.updatedAt = nextTs(); });
  t.hook('updating', function (mods, pk, obj, tx) { if (!tx?.isRemote) return { updatedAt: nextTs() }; });
  t.hook('deleting', function (pk, obj, tx) {
    if (tx?.isRemote) return;
    if (APPEND_ONLY.includes(name)) throw new Error('Sale ki entry delete nahi ho sakti');
    // outside the caller's transaction (tombs is not in its scope)
    this.onsuccess = () => { Dexie.ignoreTransaction(() => db.tombs.put({ rid: ridOf(name, pk), table: name, pk, updatedAt: nextTs() })).catch(() => {}); };
  });
}

/** Run writes that must NOT be pushed back to the cloud (data that came from the cloud). */
export const asRemote = (tables, fn) => db.transaction('rw', tables, async (tx) => { tx.isRemote = true; return fn(tx); });

export const DEFAULT_SETTINGS = {
  shopName: 'Bytecores Mall',
  address: '',
  phone: '',
  gstin: '',
  invoicePrefix: 'BM',
  upiId: '',
  footerNote: 'Thank you! Visit again.',
  lowStockDefault: 5,
  roundOff: true,
  pinHash: '',
  lastBackupAt: 0,
  staffPinHash: '',
  gstEnabled: false, // GST off by default: bills show a plain total. Turn on in Settings.
};
