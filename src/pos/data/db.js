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
  }
}

export const db = new MallDB();

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
