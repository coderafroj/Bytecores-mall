import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { Search, MessageCircle } from 'lucide-react';
import { db } from '../data/db';
import { CustomerRepo } from '../data/repositories';
import { Money } from '../domain/money';
import { Sheet, Field, RupeeInput } from './common';
import { fmtDate } from './utils';
import { whatsappLink } from './utils';

export default function Customers({ settings }) {
  const customers = useLiveQuery(() => db.customers.toArray(), [], []);
  const [q, setQ] = useState('');
  const [only, setOnly] = useState(false);
  const [sel, setSel] = useState(null);
  const total = customers.reduce((s, c) => s + (c.credit || 0), 0);
  const t = q.trim().toLowerCase();
  const list = customers
    .filter((c) => (!only || c.credit > 0) && (!t || c.name.toLowerCase().includes(t) || c.phone.includes(t)))
    .sort((a, b) => b.credit - a.credit || a.name.localeCompare(b.name));

  return (
    <>
      <div className="card row between" style={{ background: 'var(--warn-soft)' }}>
        <div><div className="xs mute">Total udhaar to collect</div><div className="num b" style={{ fontSize: 26 }}>{Money.format(total)}</div></div>
        <button className={`chip ${only ? 'on' : ''}`} onClick={() => setOnly(!only)}>Only pending</button>
      </div>
      <div className="search" style={{ margin: '10px 0' }}><Search size={18} /><input className="inp" placeholder="Search name or phone" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="list">
        {list.map((c) => (
          <button key={c.id} className="item" onClick={() => setSel(c)}>
            <div className="avatar">{c.name[0]?.toUpperCase()}</div>
            <div className="grow"><div className="b trunc">{c.name}</div><div className="xs mute">{c.phone}</div></div>
            {c.credit > 0 ? <span className="tag warn num">{Money.format(c.credit)} due</span> : <span className="tag good">Clear</span>}
          </button>
        ))}
        {!list.length && <div className="empty card">Customers are added automatically when you enter a phone number while billing.</div>}
      </div>
      {sel && <CustomerSheet id={sel.id} settings={settings} onClose={() => setSel(null)} />}
    </>
  );
}

function CustomerSheet({ id, settings, onClose }) {
  const c = useLiveQuery(() => db.customers.get(id), [id]);
  const bills = useLiveQuery(() => db.invoices.where('customerId').equals(id).reverse().sortBy('createdAt'), [id], []);
  const pays = useLiveQuery(() => db.payments.where('customerId').equals(id).toArray(), [id], []);
  const [amt, setAmt] = useState(0);
  const [method, setMethod] = useState('CASH');
  if (!c) return null;
  const receive = async () => {
    try { const a = await CustomerRepo.receivePayment(id, amt, method); toast.success(`Received ${Money.format(a)}`); setAmt(0); } catch (e) { toast.error(e.message); }
  };
  const remind = `Hello ${c.name}, a friendly reminder from ${settings.shopName}: ${Money.format(c.credit)} is pending. ${settings.upiId ? `You can pay via UPI: ${settings.upiId}. ` : ''}Thank you!`;

  return (
    <Sheet title={c.name} onClose={onClose}>
      <div className="row between"><span className="mute sm">{c.phone}</span><b className="num warn" style={{ fontSize: 20 }}>{Money.format(c.credit)} due</b></div>
      {c.credit > 0 && (
        <div className="card col" style={{ marginTop: 12 }}>
          <div className="row">
            <div className="grow"><Field label="Received ₹"><RupeeInput value={amt} onChange={setAmt} /></Field></div>
            <div className="chips" style={{ alignSelf: 'flex-end' }}>{['CASH', 'UPI'].map((m) => <button key={m} className={`chip ${method === m ? 'on' : ''}`} onClick={() => setMethod(m)}>{m}</button>)}</div>
          </div>
          <div className="row">
            <button className="btn sm" onClick={() => setAmt(c.credit)}>Full {Money.format(c.credit)}</button>
            <button className="btn good grow" disabled={amt <= 0} onClick={receive}>Record payment</button>
          </div>
          <a className="btn" target="_blank" rel="noreferrer" href={whatsappLink(c.phone, remind)}><MessageCircle size={16} /> Send WhatsApp reminder</a>
        </div>
      )}
      <div className="sec-title">History</div>
      <div className="list">
        {[...bills.map((b) => ({ t: b.createdAt, l: b.number, v: b.total, d: b.due })), ...pays.map((p) => ({ t: p.createdAt, l: `Payment (${p.method})`, v: -p.amount }))]
          .sort((a, b) => b.t - a.t).map((h, i) => (
            <div key={i} className="row between sm"><span>{h.l}<span className="xs mute"> · {fmtDate(h.t)}</span></span>
              <b className={`num ${h.v < 0 ? 'good' : ''}`}>{h.v < 0 ? '-' : ''}{Money.format(Math.abs(h.v))}</b></div>
          ))}
      </div>
    </Sheet>
  );
}
