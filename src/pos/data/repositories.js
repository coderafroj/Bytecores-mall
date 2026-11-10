import { db, DEFAULT_SETTINGS } from './db';
import { InvoiceCalculator } from '../domain/invoiceCalculator';

const now = () => Date.now();
let skuSeq = 0;
// time + counter + random: unique even for 1,000 rows imported in the same millisecond
const autoSku = () => `SKU${now().toString(36)}${(skuSeq++).toString(36)}${Math.random().toString(36).slice(2, 4)}`.toUpperCase();

/* ---------------- Settings ---------------- */
export class SettingsRepo {
  static async get() {
    const rows = await db.settings.toArray();
    const saved = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...DEFAULT_SETTINGS, ...saved };
  }
  static async save(patch) {
    await db.settings.bulkPut(Object.entries(patch).map(([key, value]) => ({ key, value })));
  }
}

/* ---------------- Products ---------------- */
export class ProductRepo {
  static async save(p) {
    const data = {
      name: p.name.trim(),
      sku: (p.sku || '').trim() || autoSku(),
      barcode: (p.barcode || '').trim(),
      category: (p.category || 'General').trim(),
      costPrice: p.costPrice | 0,
      mrp: p.mrp | 0,
      sellPrice: p.sellPrice | 0,
      gstRate: Number(p.gstRate) || 0,
      stock: Number(p.stock) || 0,
      lowStockAt: Number(p.lowStockAt) || 0,
      unit: p.unit || 'pcs',
      image: p.image || '',
      updatedAt: now(),
    };
    if (!data.name) throw new Error('Product name is required');
    if (data.sellPrice <= 0) throw new Error('Selling price must be more than 0');

    return db.transaction('rw', db.products, db.stockMoves, async () => {
      if (p.id) {
        const prev = await db.products.get(p.id);
        await db.products.update(p.id, data);
        if (prev && prev.stock !== data.stock) {
          await db.stockMoves.add({
            productId: p.id, type: 'adjust', qty: data.stock - prev.stock,
            costPrice: data.costPrice, note: 'Manual edit', createdAt: now(),
          });
        }
        return p.id;
      }
      const id = await db.products.add({ ...data, createdAt: now() });
      if (data.stock > 0) {
        await db.stockMoves.add({
          productId: id, type: 'in', qty: data.stock, costPrice: data.costPrice,
          note: 'Opening stock', createdAt: now(),
        });
      }
      return id;
    });
  }

  static async remove(id) {
    await db.products.delete(id);
  }

  /** Stock-in from a supplier. Recomputes weighted-average cost price. */
  static async addStock(id, qty, unitCost, note = 'Purchase') {
    return db.transaction('rw', db.products, db.stockMoves, async () => {
      const p = await db.products.get(id);
      if (!p) throw new Error('Product not found');
      const oldQty = Math.max(0, p.stock);
      const newStock = p.stock + qty;
      const avgCost =
        oldQty + qty > 0 ? Math.round((p.costPrice * oldQty + unitCost * qty) / (oldQty + qty)) : unitCost;
      await db.products.update(id, { stock: newStock, costPrice: avgCost, updatedAt: now() });
      await db.stockMoves.add({ productId: id, type: 'in', qty, costPrice: unitCost, note, createdAt: now() });
    });
  }

  static async findByCode(code) {
    const c = (code || '').trim();
    if (!c) return null;
    return (await db.products.where('barcode').equals(c).first()) || (await db.products.where('sku').equals(c).first()) || null;
  }
}

/* ---------------- Customers ---------------- */
export class CustomerRepo {
  static async upsertByPhone({ name, phone }) {
    const ph = (phone || '').replace(/\D/g, '').slice(-10);
    if (!ph) return null;
    const existing = await db.customers.where('phone').equals(ph).first();
    if (existing) {
      if (name && name !== existing.name) await db.customers.update(existing.id, { name });
      return existing.id;
    }
    return db.customers.add({ name: name || 'Customer', phone: ph, credit: 0, createdAt: now() });
  }

  /** Customer pays back some of their udhaar. */
  static async receivePayment(customerId, amount, method = 'CASH') {
    return db.transaction('rw', db.customers, db.payments, async () => {
      const c = await db.customers.get(customerId);
      if (!c) throw new Error('Customer not found');
      const applied = Math.min(amount, c.credit);
      await db.customers.update(customerId, { credit: c.credit - applied });
      await db.payments.add({ customerId, amount: applied, method, createdAt: now() });
      return applied;
    });
  }
}

/* ---------------- Invoices ---------------- */
export class InvoiceRepo {
  static async nextNumber(prefix) {
    const last = await db.invoices.orderBy('id').last();
    const seq = (last?.id || 0) + 1;
    return `${prefix}-${String(seq).padStart(5, '0')}`;
  }

  /**
   * Atomic sale: validates stock, decrements it, writes invoice + stock moves,
   * updates customer credit. Either everything happens or nothing does.
   */
  static async createSale({ lines, discount, payments, customer, settings }) {
    if (!lines.length) throw new Error('Cart is empty');
    const calc = InvoiceCalculator.calculate(lines, discount, { roundOff: settings.roundOff });
    const { paid, due, change } = InvoiceCalculator.balanceDue(calc.total, payments);
    if (due > 0 && !customer) throw new Error('Select a customer to sell on credit (udhaar)');

    return db.transaction('rw', db.products, db.invoices, db.customers, db.stockMoves, async () => {
      // quick items (custom: true) are one-off charges and are not stock-tracked
      const tracked = calc.lines.filter((l) => !l.custom);
      for (const l of tracked) {
        const p = await db.products.get(l.productId);
        if (!p) throw new Error(`${l.name} no longer exists`);
        if (p.stock < l.qty) throw new Error(`Only ${p.stock} of ${p.name} in stock`);
      }
      for (const l of tracked) {
        const p = await db.products.get(l.productId);
        await db.products.update(l.productId, { stock: p.stock - l.qty, sold: (p.sold || 0) + l.qty, updatedAt: now() });
      }

      let customerId = null;
      let customerSnap = null;
      if (customer) {
        customerId = await CustomerRepo.upsertByPhone(customer);
        if (customerId) {
          const c = await db.customers.get(customerId);
          if (due > 0) await db.customers.update(customerId, { credit: c.credit + due });
          customerSnap = { name: c.name, phone: c.phone };
        }
      }
      if (due > 0 && !customerId) throw new Error('Udhaar needs a valid 10-digit customer phone number');

      const number = await InvoiceRepo.nextNumber(settings.invoicePrefix);
      const cashPaid = Math.min(paid, calc.total);
      const invoice = {
        number, createdAt: now(), status: 'paid', customerId, customer: customerSnap,
        lines: calc.lines.map((l) => ({
          productId: l.productId, name: l.name, qty: l.qty, unitPrice: l.unitPrice, custom: !!l.custom,
          costPrice: l.costPrice, gstRate: l.gstRate, net: l.net, gst: l.gst, cost: l.cost, profit: l.profit,
        })),
        subtotal: calc.subtotal, discount: calc.discount, taxable: calc.taxable, gst: calc.gst,
        cgst: calc.cgst, sgst: calc.sgst, roundOff: calc.roundOff, total: calc.total,
        cost: calc.cost, profit: calc.profit, itemCount: calc.itemCount,
        payments: payments.filter((p) => p.amount > 0), paid: cashPaid, due, change,
      };
      const id = await db.invoices.add(invoice);
      await db.stockMoves.bulkAdd(
        tracked.map((l) => ({
          productId: l.productId, type: 'sale', qty: -l.qty, costPrice: l.costPrice,
          note: number, invoiceId: id, createdAt: now(),
        }))
      );
      return { ...invoice, id };
    });
  }

  /** Cancel a bill: puts stock back and reverses any customer credit. */
  static async voidInvoice(id) {
    return db.transaction('rw', db.products, db.invoices, db.customers, db.stockMoves, async () => {
      const inv = await db.invoices.get(id);
      if (!inv) throw new Error('Invoice not found');
      if (inv.status === 'void') throw new Error('Already cancelled');
      for (const l of inv.lines.filter((x) => !x.custom)) {
        const p = await db.products.get(l.productId);
        if (p) await db.products.update(l.productId, { stock: p.stock + l.qty, sold: Math.max(0, (p.sold || 0) - l.qty), updatedAt: now() });
        await db.stockMoves.add({
          productId: l.productId, type: 'return', qty: l.qty, costPrice: l.costPrice,
          note: `Cancelled ${inv.number}`, invoiceId: id, createdAt: now(),
        });
      }
      if (inv.customerId && inv.due > 0) {
        const c = await db.customers.get(inv.customerId);
        if (c) await db.customers.update(inv.customerId, { credit: Math.max(0, c.credit - inv.due) });
      }
      await db.invoices.update(id, { status: 'void', voidedAt: now() });
    });
  }
}

/* ---------------- Expenses ---------------- */
export class ExpenseRepo {
  static async add({ category, amount, note }) {
    if (!(amount > 0)) throw new Error('Enter an amount');
    return db.expenses.add({ category: category || 'Other', amount, note: (note || '').trim(), createdAt: now() });
  }
  static async remove(id) { await db.expenses.delete(id); }
}

/* ---------------- Backup / restore ---------------- */
export class BackupService {
  static async exportAll() {
    const [products, invoices, customers, stockMoves, payments, settings, expenses] = await Promise.all([
      db.products.toArray(), db.invoices.toArray(), db.customers.toArray(),
      db.stockMoves.toArray(), db.payments.toArray(), db.settings.toArray(), db.expenses.toArray(),
    ]);
    return { app: 'bytecores-mall-pos', version: 2, exportedAt: new Date().toISOString(), products, invoices, customers, stockMoves, payments, settings, expenses };
  }

  static async markBackedUp() {
    await SettingsRepo.save({ lastBackupAt: Date.now() });
  }

  static async importAll(data) {
    if (data?.app !== 'bytecores-mall-pos') throw new Error('This is not a Bytecores backup file');
    await db.transaction('rw', db.products, db.invoices, db.customers, db.stockMoves, db.payments, db.settings, db.expenses, async () => {
      await Promise.all([db.products.clear(), db.invoices.clear(), db.customers.clear(), db.stockMoves.clear(), db.payments.clear(), db.settings.clear(), db.expenses.clear()]);
      await db.expenses.bulkAdd(data.expenses || []);
      await db.products.bulkAdd(data.products || []);
      await db.invoices.bulkAdd(data.invoices || []);
      await db.customers.bulkAdd(data.customers || []);
      await db.stockMoves.bulkAdd(data.stockMoves || []);
      await db.payments.bulkAdd(data.payments || []);
      await db.settings.bulkAdd(data.settings || []);
    });
  }
}

/** Wipe everything (used by Settings > Danger zone). */
export async function wipeAllData() {
  await db.transaction('rw', db.products, db.invoices, db.customers, db.stockMoves, db.payments, db.settings, db.expenses, async () => {
    await Promise.all([db.products, db.invoices, db.customers, db.stockMoves, db.payments, db.settings, db.expenses].map((t) => t.clear()));
  });
}
