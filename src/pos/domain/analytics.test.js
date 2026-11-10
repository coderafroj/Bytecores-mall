import { describe, it, expect } from 'vitest';
import { summarize, topProducts, inventoryHealth, hourly, paymentMix } from './analytics';

const inv = (o = {}) => ({
  status: 'paid', createdAt: new Date('2026-11-10T14:30:00').getTime(), total: 11800, profit: 4000, gst: 1800,
  cost: 6000, discount: 0, itemCount: 1, due: 0, payments: [{ method: 'UPI', amount: 11800 }],
  lines: [{ productId: 1, name: 'Cable', qty: 1, net: 11800, profit: 4000 }], ...o,
});

describe('analytics', () => {
  it('summarizes revenue, profit and margin', () => {
    const s = summarize([inv(), inv()]);
    expect(s.revenue).toBe(23600);
    expect(s.profit).toBe(8000);
    expect(s.avgBill).toBe(11800);
    expect(Math.round(s.margin)).toBe(40);
  });
  it('ranks top products', () => {
    const t = topProducts([inv(), inv({ lines: [{ productId: 2, name: 'Case', qty: 3, net: 9000, profit: 6000 }] })], 'profit');
    expect(t[0].name).toBe('Case');
  });
  it('buckets by hour and payment', () => {
    expect(hourly([inv()])[14].bills).toBe(1);
    expect(paymentMix([inv()])).toEqual([{ name: 'UPI', value: 11800 }]);
  });
  it('flags low, out, dead stock and values inventory', () => {
    const p = [
      { id: 1, stock: 2, lowStockAt: 5, costPrice: 100, sellPrice: 150 },
      { id: 2, stock: 0, lowStockAt: 5, costPrice: 100, sellPrice: 150 },
      { id: 3, stock: 10, lowStockAt: 5, costPrice: 100, sellPrice: 150 },
    ];
    const h = inventoryHealth(p, [inv()]);
    expect(h.low.length).toBe(1);
    expect(h.out.length).toBe(1);
    expect(h.dead.map((x) => x.id)).toEqual([2, 3].filter((x) => x === 3));
    expect(h.costValue).toBe(1200);
    expect(h.expectedProfit).toBe(600);
  });
});
