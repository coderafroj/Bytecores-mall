import { describe, it, expect } from 'vitest';
import { InvoiceCalculator as C } from './invoiceCalculator';
import { Money } from './money';

const line = (o = {}) => ({ productId: 'p1', name: 'Cable', qty: 1, unitPrice: 11800, costPrice: 6000, gstRate: 18, ...o });

describe('Money', () => {
  it('converts without float drift', () => {
    expect(Money.toPaise(0.1 + 0.2)).toBe(30);
    expect(Money.toPaise('99.99')).toBe(9999);
    expect(Money.toPaise('abc')).toBe(0);
  });
});

describe('InvoiceCalculator', () => {
  it('extracts GST from an inclusive price', () => {
    const r = C.calculate([line()], null, { roundOff: false });
    expect(r.total).toBe(11800);
    expect(r.taxable).toBe(10000);
    expect(r.gst).toBe(1800);
    expect(r.cgst + r.sgst).toBe(1800);
  });

  it('profit excludes GST and cost', () => {
    const r = C.calculate([line({ qty: 2 })], null, { roundOff: false });
    expect(r.profit).toBe(20000 - 12000);
  });

  it('applies flat discount proportionally and totals match', () => {
    const lines = [line({ productId: 'a', unitPrice: 10000, gstRate: 0 }), line({ productId: 'b', unitPrice: 30000, gstRate: 0 })];
    const r = C.calculate(lines, { type: 'flat', value: 4000 }, { roundOff: false });
    expect(r.discount).toBe(4000);
    expect(r.lines.reduce((s, l) => s + l.discountShare, 0)).toBe(4000);
    expect(r.total).toBe(36000);
  });

  it('percent discount and never exceeds subtotal', () => {
    expect(C.calculate([line({ gstRate: 0 })], { type: 'percent', value: 10 }, { roundOff: false }).discount).toBe(1180);
    expect(C.calculate([line()], { type: 'flat', value: 999999 }, { roundOff: false }).total).toBe(0);
  });

  it('rounds off to nearest rupee', () => {
    const r = C.calculate([line({ unitPrice: 9950, gstRate: 0 })]);
    expect(r.total).toBe(10000);
    expect(r.roundOff).toBe(50);
  });

  it('computes balance due and change', () => {
    expect(C.balanceDue(10000, [{ amount: 6000 }])).toEqual({ paid: 6000, due: 4000, change: 0 });
    expect(C.balanceDue(10000, [{ amount: 12000 }])).toEqual({ paid: 12000, due: 0, change: 2000 });
  });
});
