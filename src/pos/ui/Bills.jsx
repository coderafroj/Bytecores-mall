import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { Search, Printer, MessageCircle, Undo2 } from 'lucide-react';
import { db } from '../data/db';
import { InvoiceRepo } from '../data/repositories';
import { Money } from '../domain/money';
import { Sheet } from './common';
import { fmtDate, fmtTime } from './utils';
import Receipt from './Receipt';
import { receiptText, whatsappLink } from './utils';

export default function Bills({ settings }) {
  const invoices = useLiveQuery(() => db.invoices.orderBy('createdAt').reverse().limit(300).toArray(), [], []);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const t = q.trim().toLowerCase();
  const list = invoices.filter((i) => !t || i.number.toLowerCase().includes(t) || (i.customer?.name || '').toLowerCase().includes(t) || (i.customer?.phone || '').includes(t));

  const voidBill = async (inv) => {
    if (!window.confirm(`Cancel ${inv.number}? Stock will be returned and any udhaar reversed.`)) return;
    try { await InvoiceRepo.voidInvoice(inv.id); toast.success('Bill cancelled, stock restored'); setSel(null); } catch (e) { toast.error(e.message); }
  };

  return (
    <>
      <div className="search" style={{ marginBottom: 10 }}><Search size={18} /><input className="inp" placeholder="Bill no, customer, phone" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="list">
        {list.map((i, idx) => {
          const day = fmtDate(i.createdAt); const head = idx === 0 || fmtDate(list[idx - 1].createdAt) !== day;
          return (
            <div key={i.id} className="col" style={{ gap: 8 }}>
              {head && <div className="sec-title" style={{ margin: '10px 2px 0' }}>{day}</div>}
              <button className="item" onClick={() => setSel(i)}>
                <div className="grow"><div className="b">{i.number} {i.status === 'void' && <span className="tag bad">Cancelled</span>} {i.due > 0 && i.status !== 'void' && <span className="tag warn">Udhaar</span>}</div>
                  <div className="xs mute">{fmtTime(i.createdAt)} · {i.itemCount} items {i.customer ? `· ${i.customer.name}` : ''}</div></div>
                <b className="num" style={i.status === 'void' ? { textDecoration: 'line-through' } : {}}>{Money.format(i.total)}</b>
              </button>
            </div>
          );
        })}
        {!list.length && <div className="empty card">No bills found</div>}
      </div>
      {sel && (
        <Sheet title={sel.number} onClose={() => setSel(null)}
          footer={<div className="grid g2">
            <button className="btn" onClick={() => window.print()}><Printer size={16} /> Print</button>
            <a className="btn" target="_blank" rel="noreferrer" href={whatsappLink(sel.customer?.phone, receiptText(sel, settings))}><MessageCircle size={16} /> Share</a>
            {sel.status !== 'void' && <button className="btn bad block" style={{ gridColumn: '1/-1' }} onClick={() => voidBill(sel)}><Undo2 size={16} /> Cancel / return bill</button>}
          </div>}>
          <Receipt inv={sel} s={settings} />
          <p className="xs mute">Profit on this bill: {Money.format(sel.profit)}</p>
        </Sheet>
      )}
    </>
  );
}
