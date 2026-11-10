import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { db } from '../data/db';
import { ExpenseRepo } from '../data/repositories';
import { Money } from '../domain/money';
import { Field, RupeeInput } from './common';
import { fmtDate } from './utils';
import { filterExpenses, RANGES } from '../domain/analytics';

const CATS = ['Rent', 'Salary', 'Electricity', 'Transport', 'Tea & Misc', 'Repair', 'Other'];

export default function Expenses() {
  const all = useLiveQuery(() => db.expenses.orderBy('createdAt').reverse().toArray(), [], []);
  const [cat, setCat] = useState('Rent');
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState('');
  const month = filterExpenses(all, RANGES.month()).reduce((s, e) => s + e.amount, 0);

  const add = async () => {
    try { await ExpenseRepo.add({ category: cat, amount, note }); setAmount(0); setNote(''); toast.success('Expense saved'); } catch (e) { toast.error(e.message); }
  };
  return (
    <>
      <div className="card"><div className="xs mute">Last 30 days expenses</div><div className="num b" style={{ fontSize: 26 }}>{Money.format(month)}</div></div>
      <div className="card col" style={{ marginTop: 10 }}>
        <div className="chips">{CATS.map((c) => <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>)}</div>
        <div className="grid g2"><Field label="Amount ₹"><RupeeInput value={amount} onChange={setAmount} /></Field><Field label="Note"><input className="inp" value={note} onChange={(e) => setNote(e.target.value)} /></Field></div>
        <button className="btn pri" disabled={amount <= 0} onClick={add}>Add expense</button>
      </div>
      <div className="sec-title">History</div>
      <div className="list">
        {all.slice(0, 100).map((e) => (
          <div className="item" key={e.id}><div className="grow"><div className="b">{e.category}</div><div className="xs mute">{fmtDate(e.createdAt)} {e.note && `· ${e.note}`}</div></div>
            <b className="num">{Money.format(e.amount)}</b>
            <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => window.confirm('Delete this expense?') && ExpenseRepo.remove(e.id)} aria-label="Delete"><Trash2 size={15} /></button></div>
        ))}
        {!all.length && <div className="empty card">Track rent, salary and bills here to see your real net profit.</div>}
      </div>
    </>
  );
}
