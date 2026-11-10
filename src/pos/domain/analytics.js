/**
 * Analytics engine: pure functions over invoices/products. No DB or UI.
 * All values stay in paise.
 */
const DAY = 86400000;
export const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };

export const RANGES = {
  today: () => [startOfDay(Date.now()), Date.now() + 1],
  yesterday: () => [startOfDay(Date.now()) - DAY, startOfDay(Date.now())],
  week: () => [startOfDay(Date.now()) - 6 * DAY, Date.now() + 1],
  month: () => [startOfDay(Date.now()) - 29 * DAY, Date.now() + 1],
  year: () => [startOfDay(Date.now()) - 364 * DAY, Date.now() + 1],
  all: () => [0, Date.now() + 1],
};

export function filterInvoices(invoices, [from, to]) {
  return invoices.filter((i) => i.status !== 'void' && i.createdAt >= from && i.createdAt < to);
}

export function summarize(invoices) {
  const s = { revenue: 0, profit: 0, gst: 0, cost: 0, discount: 0, bills: invoices.length, items: 0, due: 0 };
  for (const i of invoices) {
    s.revenue += i.total; s.profit += i.profit; s.gst += i.gst; s.cost += i.cost;
    s.discount += i.discount; s.items += i.itemCount; s.due += i.due || 0;
  }
  s.margin = s.revenue - s.gst > 0 ? (s.profit / (s.revenue - s.gst)) * 100 : 0;
  s.avgBill = s.bills ? Math.round(s.revenue / s.bills) : 0;
  return s;
}

/** Daily series with zero-filled gaps so charts never skip days. */
export function dailySeries(invoices, [from, to]) {
  const start = startOfDay(from === 0 ? (invoices.reduce((m, i) => Math.min(m, i.createdAt), Date.now())) : from);
  const days = Math.min(400, Math.max(1, Math.ceil((to - start) / DAY)));
  const map = new Map();
  for (let d = 0; d < days; d++) map.set(start + d * DAY, { t: start + d * DAY, revenue: 0, profit: 0, bills: 0 });
  for (const i of invoices) {
    const row = map.get(startOfDay(i.createdAt));
    if (row) { row.revenue += i.total; row.profit += i.profit; row.bills += 1; }
  }
  return [...map.values()].map((r) => ({
    ...r,
    label: new Date(r.t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    revenueR: r.revenue / 100,
    profitR: r.profit / 100,
  }));
}

export function topProducts(invoices, by = 'profit', limit = 8) {
  const m = new Map();
  for (const i of invoices) for (const l of i.lines) {
    const r = m.get(l.productId) || { productId: l.productId, name: l.name, qty: 0, revenue: 0, profit: 0 };
    r.qty += l.qty; r.revenue += l.net; r.profit += l.profit; m.set(l.productId, r);
  }
  return [...m.values()].sort((a, b) => b[by] - a[by]).slice(0, limit);
}

export function byCategory(invoices, products) {
  const cat = new Map(products.map((p) => [p.id, p.category]));
  const m = new Map();
  for (const i of invoices) for (const l of i.lines) {
    const c = cat.get(l.productId) || 'Other';
    const r = m.get(c) || { name: c, revenue: 0, profit: 0, qty: 0 };
    r.revenue += l.net; r.profit += l.profit; r.qty += l.qty; m.set(c, r);
  }
  return [...m.values()].sort((a, b) => b.revenue - a.revenue);
}

export function paymentMix(invoices) {
  const m = {};
  for (const i of invoices) for (const p of i.payments) m[p.method] = (m[p.method] || 0) + p.amount;
  return Object.entries(m).map(([name, value]) => ({ name, value }));
}

/** Sales by hour of day (0-23) so the owner knows peak hours. */
export function hourly(invoices) {
  const h = Array.from({ length: 24 }, (_, i) => ({ hour: i, label: `${i % 12 || 12}${i < 12 ? 'a' : 'p'}`, revenue: 0, bills: 0 }));
  for (const i of invoices) { const r = h[new Date(i.createdAt).getHours()]; r.revenue += i.total; r.bills += 1; }
  return h.map((r) => ({ ...r, revenueR: r.revenue / 100 }));
}

export function inventoryHealth(products, invoices30d) {
  const sold = new Map();
  for (const i of invoices30d) for (const l of i.lines) sold.set(l.productId, (sold.get(l.productId) || 0) + l.qty);
  let costValue = 0, retailValue = 0;
  const low = [], out = [], dead = [], reorder = [];
  for (const p of products) {
    costValue += Math.max(0, p.stock) * p.costPrice;
    retailValue += Math.max(0, p.stock) * p.sellPrice;
    const threshold = p.lowStockAt || 0;
    if (p.stock <= 0) out.push(p);
    else if (p.stock <= threshold) low.push(p);
    const s = sold.get(p.id) || 0;
    if (p.stock > 0 && s === 0) dead.push(p);
    // days of stock left at the 30-day sales velocity
    if (s > 0) {
      const perDay = s / 30;
      const daysLeft = p.stock / perDay;
      if (daysLeft < 7) reorder.push({ ...p, daysLeft: Math.max(0, Math.floor(daysLeft)), perDay });
    }
  }
  reorder.sort((a, b) => a.daysLeft - b.daysLeft);
  return {
    costValue, retailValue, expectedProfit: retailValue - costValue,
    low, out, dead, reorder, skuCount: products.length,
    unitsInStock: products.reduce((s, p) => s + Math.max(0, p.stock), 0),
  };
}

/** Compare current period to the one just before it (same length). */
export function periodChange(allInvoices, [from, to]) {
  const len = to - from;
  const cur = summarize(filterInvoices(allInvoices, [from, to]));
  const prev = summarize(filterInvoices(allInvoices, [from - len, from]));
  const pct = (a, b) => (b === 0 ? (a > 0 ? 100 : 0) : ((a - b) / b) * 100);
  return { cur, prev, revenue: pct(cur.revenue, prev.revenue), profit: pct(cur.profit, prev.profit), bills: pct(cur.bills, prev.bills) };
}

export function filterExpenses(expenses, [from, to]) {
  return expenses.filter((e) => e.createdAt >= from && e.createdAt < to);
}

export function expensesByCategory(expenses) {
  const m = new Map();
  for (const e of expenses) m.set(e.category, (m.get(e.category) || 0) + e.amount);
  return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

/** Gross profit is on the invoice; net profit also subtracts shop expenses. */
export function netProfit(summary, expenses) {
  const exp = expenses.reduce((s, e) => s + e.amount, 0);
  return { expenses: exp, net: summary.profit - exp };
}

/** Pareto/ABC: which products make 80% of the profit. */
export function abcClasses(invoices) {
  const items = topProducts(invoices, 'profit', 10000).filter((r) => r.profit > 0);
  const total = items.reduce((s, r) => s + r.profit, 0);
  let acc = 0;
  return items.map((r) => {
    acc += r.profit;
    const share = total ? acc / total : 1;
    return { ...r, cls: share <= 0.8 ? 'A' : share <= 0.95 ? 'B' : 'C' };
  });
}
