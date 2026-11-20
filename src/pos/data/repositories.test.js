import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db, DEFAULT_SETTINGS } from './db';
import { ProductRepo, InvoiceRepo, CustomerRepo, BackupService, wipeAllData } from './repositories';

const settings = { ...DEFAULT_SETTINGS, roundOff: false };
const rs = (n) => n * 100;

async function seed() {
  const a = await ProductRepo.save({ name: 'Cable', sellPrice: rs(100), costPrice: rs(60), stock: 10, gstRate: 0 });
  const b = await ProductRepo.save({ name: 'Charger', sellPrice: rs(500), costPrice: rs(350), stock: 3, gstRate: 18 });
  return { a, b };
}
const line = async (id, qty, gstRate) => {
  const p = await db.products.get(id);
  return { productId: id, name: p.name, qty, unitPrice: p.sellPrice, costPrice: p.costPrice, gstRate };
};

beforeEach(async () => { await wipeAllData(); });

describe('sales', () => {
  it('cash sale reduces stock, counts sold, and books profit', async () => {
    const { a } = await seed();
    const inv = await InvoiceRepo.createSale({ lines: [await line(a, 3, 0)], discount: null, payments: [{ method: 'CASH', amount: rs(300) }], customer: null, settings });
    const p = await db.products.get(a);
    expect(p.stock).toBe(7);
    expect(p.sold).toBe(3);
    expect(inv.total).toBe(rs(300));
    expect(inv.profit).toBe(rs(120));
    expect(inv.due).toBe(0);
  });

  it('rejects overselling and leaves stock untouched', async () => {
    const { b } = await seed();
    await expect(InvoiceRepo.createSale({ lines: [await line(b, 4, 18)], discount: null, payments: [{ method: 'CASH', amount: rs(2000) }], customer: null, settings })).rejects.toThrow(/Only 3/);
    expect((await db.products.get(b)).stock).toBe(3);
    expect(await db.invoices.count()).toBe(0);
  });

  it('udhaar needs a phone and is recorded on the customer', async () => {
    const { a } = await seed();
    const args = { lines: [await line(a, 1, 0)], discount: null, payments: [], settings };
    await expect(InvoiceRepo.createSale({ ...args, customer: { name: 'Ram', phone: '' } })).rejects.toThrow();
    expect((await db.products.get(a)).stock).toBe(10); // failed sale rolled back
    const inv = await InvoiceRepo.createSale({ ...args, customer: { name: 'Ram', phone: '98765 43210' } });
    const c = await db.customers.get(inv.customerId);
    expect(c.credit).toBe(rs(100));
    await CustomerRepo.receivePayment(c.id, rs(40));
    expect((await db.customers.get(c.id)).credit).toBe(rs(60));
  });

  it('GST-off bills have no tax, GST-on bills extract it from the price', async () => {
    const { b } = await seed();
    const off = await InvoiceRepo.createSale({ lines: [await line(b, 1, 0)], discount: null, payments: [{ method: 'UPI', amount: rs(500) }], customer: null, settings });
    expect(off.gst).toBe(0);
    const on = await InvoiceRepo.createSale({ lines: [await line(b, 1, 18)], discount: null, payments: [{ method: 'UPI', amount: rs(500) }], customer: null, settings });
    expect(on.gst).toBe(rs(500) - Math.round((rs(500) * 100) / 118));
    expect(on.total).toBe(rs(500));
  });

  it('sale entries can never be deleted (bills, payments, stock history)', async () => {
    const { a } = await seed();
    const inv = await InvoiceRepo.createSale({ lines: [await line(a, 2, 0)], discount: null, payments: [], customer: { name: 'Sita', phone: '9876543210' }, settings });
    await CustomerRepo.receivePayment(inv.customerId, rs(50));
    await expect(db.invoices.delete(inv.id)).rejects.toThrow(/delete nahi ho sakti/);
    await expect(db.invoices.clear()).rejects.toThrow(/delete nahi ho sakti/);
    await expect(db.invoices.bulkDelete([inv.id])).rejects.toThrow(/delete nahi ho sakti/);
    await expect(db.payments.clear()).rejects.toThrow(/delete nahi ho sakti/);
    await expect(db.stockMoves.clear()).rejects.toThrow(/delete nahi ho sakti/);
    expect(await db.invoices.count()).toBe(1);
    expect(await db.payments.count()).toBe(1);
    expect((await db.products.get(a)).stock).toBe(8);          // nothing was rolled back or changed
    expect(await db.tombs.count()).toBe(0);                    // and nothing is queued to delete in the cloud
  });

  it('the cancel-bill feature no longer exists', async () => {
    expect(InvoiceRepo.voidInvoice).toBeUndefined();
  });

  it('deleting a PRODUCT keeps its old bills intact', async () => {
    const { a } = await seed();
    const inv = await InvoiceRepo.createSale({ lines: [await line(a, 1, 0)], discount: null, payments: [{ method: 'CASH', amount: rs(100) }], customer: null, settings });
    await ProductRepo.remove(a);
    const kept = await db.invoices.get(inv.id);
    expect(kept.lines[0].name).toBe('Cable');
    expect(kept.total).toBe(rs(100));
  });
});

describe('stock & backup', () => {
  it('restock keeps a weighted-average cost', async () => {
    const { a } = await seed();               // 10 @ 60
    await ProductRepo.addStock(a, 10, rs(80));  // +10 @ 80
    const p = await db.products.get(a);
    expect([p.stock, p.costPrice]).toEqual([20, rs(70)]);
  });

  it('backup round-trips products, photos and bills', async () => {
    const id = await ProductRepo.save({ name: 'Pen', sellPrice: rs(10), costPrice: rs(5), stock: 5, image: 'data:image/webp;base64,AAAA' });
    await InvoiceRepo.createSale({ lines: [await line(id, 1, 0)], discount: null, payments: [{ method: 'CASH', amount: rs(10) }], customer: null, settings });
    const dump = JSON.parse(JSON.stringify(await BackupService.exportAll()));
    await wipeAllData();
    expect(await db.products.count()).toBe(0);
    await BackupService.importAll(dump);
    expect((await db.images.get(id)).data).toMatch(/^data:image/);
    expect((await db.products.get(id)).hasImage).toBe(1);
    expect(await db.invoices.count()).toBe(1);
  });
});
