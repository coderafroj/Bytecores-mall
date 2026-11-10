import { Money } from './money';

/**
 * Pure billing engine. No UI, no database, fully unit-testable.
 *
 * Selling prices are GST-INCLUSIVE (normal retail practice in India).
 * Tax is extracted from the line total, not added on top.
 *
 * line = { productId, name, qty, unitPrice (paise), costPrice (paise), gstRate (%) }
 * discount = { type: 'flat' | 'percent', value }  (flat value in paise)
 */
export class InvoiceCalculator {
  static lineTotal(line) {
    return Math.round(line.unitPrice * line.qty);
  }

  static calculate(lines, discount = null, { roundOff = true } = {}) {
    const subtotal = lines.reduce((s, l) => s + InvoiceCalculator.lineTotal(l), 0);

    let discountAmt = 0;
    if (discount && discount.value > 0) {
      discountAmt =
        discount.type === 'percent'
          ? Math.round((subtotal * Math.min(discount.value, 100)) / 100)
          : Math.min(Math.round(discount.value), subtotal);
    }

    // Spread the bill-level discount across lines proportionally so GST and
    // profit stay correct per line.
    let allocated = 0;
    const computed = lines.map((l, i) => {
      const gross = InvoiceCalculator.lineTotal(l);
      let share = 0;
      if (subtotal > 0 && discountAmt > 0) {
        share =
          i === lines.length - 1
            ? discountAmt - allocated
            : Math.round((gross / subtotal) * discountAmt);
        allocated += share;
      }
      const net = gross - share; // GST-inclusive amount customer pays for this line
      const rate = l.gstRate || 0;
      const taxable = rate ? Math.round((net * 100) / (100 + rate)) : net;
      const gst = net - taxable;
      const cost = Math.round((l.costPrice || 0) * l.qty);
      return { ...l, gross, discountShare: share, net, taxable, gst, cost, profit: net - gst - cost };
    });

    const afterDiscount = subtotal - discountAmt;
    const gstTotal = computed.reduce((s, l) => s + l.gst, 0);
    const taxableTotal = computed.reduce((s, l) => s + l.taxable, 0);
    const costTotal = computed.reduce((s, l) => s + l.cost, 0);

    let total = afterDiscount;
    let roundOffAmt = 0;
    if (roundOff) {
      total = Math.round(afterDiscount / 100) * 100; // nearest rupee
      roundOffAmt = total - afterDiscount;
    }

    return {
      lines: computed,
      subtotal,
      discount: discountAmt,
      taxable: taxableTotal,
      gst: gstTotal,
      cgst: Math.floor(gstTotal / 2),
      sgst: gstTotal - Math.floor(gstTotal / 2),
      roundOff: roundOffAmt,
      total,
      cost: costTotal,
      profit: total - gstTotal - costTotal,
      itemCount: lines.reduce((s, l) => s + l.qty, 0),
    };
  }

  /** Split payment helper: how much is still unpaid (becomes customer credit). */
  static balanceDue(total, payments) {
    const paid = payments.reduce((s, p) => s + (p.amount || 0), 0);
    return { paid, due: Math.max(0, total - paid), change: Math.max(0, paid - total) };
  }
}
