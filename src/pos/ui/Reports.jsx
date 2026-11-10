import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download, TrendingDown, TrendingUp } from 'lucide-react';
import { db } from '../data/db';
import { Money } from '../domain/money';
import * as A from '../domain/analytics';
import { downloadFile, toCSV, fmtDate } from './utils';

const COLORS = ['#dc2f2a', '#2563eb', '#11703f', '#d97706', '#7c3aed', '#0891b2'];
const LABELS = { today: 'Today', yesterday: 'Yesterday', week: '7 days', month: '30 days', year: '1 year', all: 'All time' };
const rupee = (v) => Money.format(Math.round(v * 100), { compact: true });

function Delta({ v }) {
  if (!Number.isFinite(v) || Math.abs(v) < 0.5) return <span className="d mute">no change</span>;
  const up = v > 0;
  return <span className={`d ${up ? 'good' : 'bad'}`}>{up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {Math.abs(v).toFixed(0)}% vs previous</span>;
}

export default function Reports() {
  const [range, setRange] = useState('month');
  const [by, setBy] = useState('profit');

  // Range-limited reads through the createdAt index: cost grows with the period, not with shop history.
  const data = useLiveQuery(async () => {
    const r = A.RANGES[range]();
    const len = r[1] - r[0];
    const [invs, last30, exps, products] = await Promise.all([
      db.invoices.where('createdAt').between(Math.max(0, r[0] - len), r[1]).toArray(), // current + previous period
      db.invoices.where('createdAt').between(A.RANGES.month()[0], Date.now() + 1).toArray(),
      db.expenses.where('createdAt').between(r[0], r[1]).toArray(),
      db.products.toArray(),
    ]);
    return { r, invs, last30, exps, products };
  }, [range]);

  const d = useMemo(() => {
    if (!data) return null;
    const { r, invs, last30, exps, products } = data;
    const inv = A.filterInvoices(invs, r);
    const sum = A.summarize(inv);
    return {
      inv, sum, change: A.periodChange(invs, r), net: A.netProfit(sum, exps), r,
      series: A.dailySeries(inv, r), hours: A.hourly(inv), top: A.topProducts(inv, by, 8),
      cats: A.byCategory(inv, products), mix: A.paymentMix(inv), exp: A.expensesByCategory(exps),
      health: A.inventoryHealth(products, A.filterInvoices(last30, A.RANGES.month())), abc: A.abcClasses(inv),
    };
  }, [data, by]);

  if (!d) return <div className="empty">Loading…</div>;

  const exportBills = () => downloadFile(`sales-${range}.csv`, toCSV([
    ['Bill', 'Date', 'Customer', 'Items', 'Subtotal', 'Discount', 'Taxable', 'CGST', 'SGST', 'Total', 'Profit', 'Due'],
    ...d.inv.map((i) => [i.number, fmtDate(i.createdAt), i.customer?.name || '', i.itemCount, ...[i.subtotal, i.discount, i.taxable, i.cgst, i.sgst, i.total, i.profit, i.due || 0].map((x) => x / 100)]),
  ]));

  const { sum, change, net, health } = d;
  const maxTop = Math.max(1, ...d.top.map((x) => x[by]));

  return (
    <>
      <div className="chips">{Object.entries(LABELS).map(([k, l]) => <button key={k} className={`chip ${range === k ? 'on' : ''}`} onClick={() => setRange(k)}>{l}</button>)}</div>

      <div className="grid g4">
        <div className="card stat"><div className="xs mute">Sales</div><div className="v num">{Money.format(sum.revenue, { compact: true })}</div><Delta v={change.revenue} /></div>
        <div className="card stat"><div className="xs mute">Gross profit</div><div className="v num good">{Money.format(sum.profit, { compact: true })}</div><Delta v={change.profit} /></div>
        <div className="card stat"><div className="xs mute">Net profit (after expenses)</div><div className={`v num ${net.net < 0 ? 'bad' : 'good'}`}>{Money.format(net.net, { compact: true })}</div><span className="d mute">expenses {Money.format(net.expenses, { compact: true })}</span></div>
        <div className="card stat"><div className="xs mute">Bills · avg</div><div className="v num">{sum.bills}</div><span className="d mute">avg {Money.format(sum.avgBill)} · margin {sum.margin.toFixed(0)}%</span></div>
      </div>

      <div className="sec-title">Sales & profit trend</div>
      <div className="card chart-box">
        <ResponsiveContainer>
          <AreaChart data={d.series} margin={{ left: -14, right: 6, top: 6 }}>
            <defs>
              <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dc2f2a" stopOpacity=".35" /><stop offset="1" stopColor="#dc2f2a" stopOpacity="0" /></linearGradient>
              <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#11703f" stopOpacity=".35" /><stop offset="1" stopColor="#11703f" stopOpacity="0" /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={24} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={rupee} width={52} />
            <Tooltip formatter={(v, n) => [Money.format(Math.round(v * 100)), n]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            <Area type="monotone" dataKey="revenueR" name="Sales" stroke="#dc2f2a" fill="url(#gr)" strokeWidth={2} />
            <Area type="monotone" dataKey="profitR" name="Profit" stroke="#11703f" fill="url(#gp)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md2">
        <div>
          <div className="row between"><div className="sec-title">Best sellers</div>
            <div className="chips">{['profit', 'revenue', 'qty'].map((k) => <button key={k} className={`chip ${by === k ? 'on' : ''}`} onClick={() => setBy(k)}>{k === 'qty' ? 'Units' : k}</button>)}</div></div>
          <div className="card col">
            {d.top.map((t) => (
              <div key={t.productId}>
                <div className="row between sm"><span className="trunc b">{t.name}</span><span className="num">{by === 'qty' ? t.qty : Money.format(t[by])}</span></div>
                <div className="bar"><i style={{ width: `${(t[by] / maxTop) * 100}%` }} /></div>
              </div>
            ))}
            {!d.top.length && <div className="empty">No sales in this period</div>}
          </div>
        </div>
        <div>
          <div className="sec-title">Peak hours</div>
          <div className="card chart-box" style={{ height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={d.hours.slice(8, 23)} margin={{ left: -22, right: 4 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} /><YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip formatter={(v) => [v, 'Bills']} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="bills" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid md2">
        <div>
          <div className="sec-title">Category performance</div>
          <div className="card col">
            {d.cats.map((c) => (
              <div className="row between sm" key={c.name}><span className="b">{c.name}</span>
                <span className="num">{Money.format(c.revenue, { compact: true })} <span className="good xs">+{Money.format(c.profit, { compact: true })}</span></span></div>
            ))}
            {!d.cats.length && <div className="empty">No data</div>}
          </div>
        </div>
        <div>
          <div className="sec-title">Payment mix</div>
          <div className="card row">
            <div style={{ width: 130, height: 130 }}>
              <ResponsiveContainer><PieChart><Pie data={d.mix} dataKey="value" innerRadius={34} outerRadius={60} paddingAngle={2}>{d.mix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie></PieChart></ResponsiveContainer>
            </div>
            <div className="col grow" style={{ gap: 6 }}>
              {d.mix.map((m, i) => <div className="row between sm" key={m.name}><span className="row"><i style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length] }} />{m.name}</span><b className="num">{Money.format(m.value, { compact: true })}</b></div>)}
              {!d.mix.length && <span className="mute sm">No payments</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="sec-title">Inventory health (last 30 days sales)</div>
      <div className="grid g4">
        <div className="card stat"><div className="xs mute">Stock value (cost)</div><div className="v num">{Money.format(health.costValue, { compact: true })}</div></div>
        <div className="card stat"><div className="xs mute">Stock value (retail)</div><div className="v num">{Money.format(health.retailValue, { compact: true })}</div></div>
        <div className="card stat"><div className="xs mute">Expected profit in stock</div><div className="v num good">{Money.format(health.expectedProfit, { compact: true })}</div></div>
        <div className="card stat"><div className="xs mute">Units · SKUs</div><div className="v num">{health.unitsInStock}</div><span className="d mute">{health.skuCount} products</span></div>
      </div>
      <div className="grid md3" style={{ marginTop: 10 }}>
        <ListCard title="Reorder soon" tone="warn" empty="Nothing running out" rows={health.reorder.slice(0, 6).map((p) => [p.name, `${p.daysLeft}d left`])} />
        <ListCard title="Out of stock" tone="bad" empty="All in stock" rows={health.out.slice(0, 6).map((p) => [p.name, '0'])} />
        <ListCard title="Dead stock (no sale in 30d)" tone="mute" empty="Everything is moving" rows={health.dead.slice(0, 6).map((p) => [p.name, `${Money.format(p.stock * p.costPrice, { compact: true })} locked`])} />
      </div>

      <div className="sec-title">Profit drivers (ABC)</div>
      <div className="card sm">
        {d.abc.length ? <>
          <b>{d.abc.filter((x) => x.cls === 'A').length}</b> products (class A) make 80% of your profit:{' '}
          {d.abc.filter((x) => x.cls === 'A').slice(0, 5).map((x) => x.name).join(', ')}. Never let these run out.
        </> : <span className="mute">Make some sales to see this.</span>}
      </div>

      <div className="sec-title">GST summary</div>
      <div className="card grid g3 sm">
        <div><div className="xs mute">Taxable value</div><b className="num">{Money.format(sum.revenue - sum.gst)}</b></div>
        <div><div className="xs mute">CGST + SGST</div><b className="num">{Money.format(sum.gst)}</b></div>
        <div><div className="xs mute">Udhaar given</div><b className="num warn">{Money.format(sum.due)}</b></div>
      </div>

      {d.exp.length > 0 && <>
        <div className="sec-title">Expenses</div>
        <div className="card col">{d.exp.map((e) => <div key={e.name} className="row between sm"><span>{e.name}</span><b className="num">{Money.format(e.value)}</b></div>)}</div>
      </>}

      <button className="btn block" style={{ marginTop: 16 }} onClick={exportBills}><Download size={16} /> Export sales CSV (for CA / GST filing)</button>
    </>
  );
}

function ListCard({ title, rows, tone, empty }) {
  return (
    <div className="card col" style={{ gap: 6 }}>
      <div className={`b sm ${tone === 'mute' ? '' : tone}`}>{title}</div>
      {rows.map(([a, b], i) => <div key={i} className="row between sm"><span className="trunc">{a}</span><span className="xs mute" style={{ whiteSpace: 'nowrap' }}>{b}</span></div>)}
      {!rows.length && <span className="xs mute">{empty}</span>}
    </div>
  );
}
