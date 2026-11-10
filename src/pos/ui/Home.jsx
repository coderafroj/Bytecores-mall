import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { ScanLine, PackagePlus, Wallet, TriangleAlert, ShieldAlert } from 'lucide-react';
import { db } from '../data/db';
import { Money } from '../domain/money';
import * as A from '../domain/analytics';
import { fmtTime } from './utils';

export default function Home({ settings, needsPin }) {
  // One live query. It reads only today/yesterday and the last 30 days through the createdAt
  // index, so the dashboard stays instant even with 100k bills.
  const d = useLiveQuery(async () => {
    const [from, to] = A.RANGES.today();
    const [recentTwo, last30, products, customers, exps, recent] = await Promise.all([
      db.invoices.where('createdAt').between(from - 86400000, to).toArray(),
      db.invoices.where('createdAt').between(A.RANGES.month()[0], to).toArray(),
      db.products.toArray(),
      db.customers.toArray(),
      db.expenses.where('createdAt').between(from, to).toArray(),
      db.invoices.orderBy('createdAt').reverse().limit(5).toArray(),
    ]);
    return {
      sum: A.summarize(A.filterInvoices(recentTwo, [from, to])),
      change: A.periodChange(recentTwo, [from, to]),
      exp: exps.reduce((s, e) => s + e.amount, 0),
      health: A.inventoryHealth(products, A.filterInvoices(last30, A.RANGES.month())),
      udhaar: customers.reduce((s, c) => s + (c.credit || 0), 0),
      udhaarCount: customers.reduce((n, c) => n + (c.credit > 0 ? 1 : 0), 0),
      hasBills: recent.length > 0,
      recent,
      backupAge: settings.lastBackupAt ? (Date.now() - settings.lastBackupAt) / 86400000 : Infinity,
    };
  }, [settings.lastBackupAt]);

  if (!d) return <div className="empty">Loading…</div>;
  const { sum, change, exp, health, udhaar, udhaarCount, recent, backupAge } = d;

  return (
    <>
      {!needsPin && (
        <Link to="/pos/settings" className="card row" style={{ background: 'var(--warn-soft)', textDecoration: 'none', color: 'inherit', marginBottom: 12 }}>
          <ShieldAlert size={20} className="warn" />
          <div className="grow sm"><b>PIN lagao</b><div className="xs mute">Staff ko sirf billing dikhegi, profit aur cost nahi. Settings mein Malik PIN aur Staff PIN set karo.</div></div>
        </Link>
      )}
      {backupAge > 7 && d.hasBills && (
        <Link to="/pos/settings" className="card row" style={{ background: 'var(--warn-soft)', textDecoration: 'none', color: 'inherit', marginBottom: 12 }}>
          <ShieldAlert size={20} className="warn" />
          <div className="grow sm"><b>{Number.isFinite(backupAge) ? `Last backup ${Math.floor(backupAge)} days ago` : 'No backup taken yet'}</b><div className="xs mute">Your data lives on this device. Tap to download a backup.</div></div>
        </Link>
      )}

      <Link to="/pos/bill" className="btn pri block" style={{ minHeight: 60, fontSize: 17, textDecoration: 'none' }}><ScanLine size={20} /> Start new bill</Link>

      <div className="sec-title">Today</div>
      <div className="grid g2 md4">
        <div className="card stat"><div className="xs mute">Sales</div><div className="v num">{Money.format(sum.revenue)}</div>
          <span className={`d ${change.revenue >= 0 ? 'good' : 'bad'}`}>{change.revenue >= 0 ? '▲' : '▼'} {Math.abs(change.revenue).toFixed(0)}% vs yesterday</span></div>
        <div className="card stat"><div className="xs mute">Profit</div><div className="v num good">{Money.format(sum.profit)}</div><span className="d mute">after expenses {Money.format(sum.profit - exp)}</span></div>
        <div className="card stat"><div className="xs mute">Bills</div><div className="v num">{sum.bills}</div><span className="d mute">{sum.items} items sold</span></div>
        <Link to="/pos/customers" className="card stat" style={{ textDecoration: 'none', color: 'inherit' }}><div className="xs mute">Udhaar to collect</div><div className="v num warn">{Money.format(udhaar)}</div><span className="d mute">{udhaarCount} customers</span></Link>
      </div>

      <div className="grid g3" style={{ marginTop: 10 }}>
        <Link className="btn" to="/pos/stock" style={{ textDecoration: 'none' }}><PackagePlus size={16} /> Stock</Link>
        <Link className="btn" to="/pos/expenses" style={{ textDecoration: 'none' }}><Wallet size={16} /> Expense</Link>
        <Link className="btn" to="/pos/reports" style={{ textDecoration: 'none' }}>Reports</Link>
      </div>

      {(health.out.length > 0 || health.low.length > 0) && (
        <>
          <div className="sec-title">Needs attention</div>
          <Link to="/pos/stock" className="card row" style={{ textDecoration: 'none', color: 'inherit' }}>
            <TriangleAlert size={20} className="warn" />
            <div className="grow sm"><b>{health.out.length} out of stock · {health.low.length} running low</b>
              <div className="xs mute trunc">{[...health.out, ...health.low].slice(0, 4).map((p) => p.name).join(', ')}</div></div>
          </Link>
        </>
      )}

      <div className="sec-title">Recent bills</div>
      <div className="list">
        {recent.map((i) => (
          <Link to="/pos/bills" key={i.id} className="item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="grow"><div className="b">{i.number} {i.status === 'void' && <span className="tag bad">Cancelled</span>}</div><div className="xs mute">{fmtTime(i.createdAt)} · {i.itemCount} items {i.customer ? `· ${i.customer.name}` : ''}</div></div>
            <b className="num">{Money.format(i.total)}</b>
          </Link>
        ))}
        {!recent.length && <div className="empty card">No bills yet. Your first sale will show up here.</div>}
      </div>
    </>
  );
}
