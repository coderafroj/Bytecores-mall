import { Money } from '../domain/money';
import { fmtDate, fmtTime } from './utils';

export default function Receipt({ inv, s }) {
  return (
    <div id="receipt">
      <div style={{ textAlign: 'center' }}>
        <b style={{ fontSize: 14 }}>{s.shopName}</b>
        {s.address && <div>{s.address}</div>}
        {s.phone && <div>Ph: {s.phone}</div>}
        {s.gstin && <div>GSTIN: {s.gstin}</div>}
      </div>
      <hr />
      <div className="r"><span>{inv.number}</span><span>{fmtDate(inv.createdAt)} {fmtTime(inv.createdAt)}</span></div>
      {inv.customer && <div>Customer: {inv.customer.name} {inv.customer.phone}</div>}
      {inv.status === 'void' && <div style={{ textAlign: 'center', fontWeight: 700 }}>*** CANCELLED ***</div>}
      <hr />
      {inv.lines.map((l, i) => (
        <div key={i} style={{ marginBottom: 3 }}>
          <div>{l.name}</div>
          <div className="r"><span>{l.qty} x {Money.format(l.net / l.qty)}</span><span>{Money.format(l.net)}</span></div>
        </div>
      ))}
      <hr />
      <div className="r"><span>Subtotal</span><span>{Money.format(inv.subtotal)}</span></div>
      {inv.discount > 0 && <div className="r"><span>Discount</span><span>-{Money.format(inv.discount)}</span></div>}
      {inv.gst > 0 && <>
        <div className="r"><span>Taxable value</span><span>{Money.format(inv.taxable)}</span></div>
        <div className="r"><span>CGST</span><span>{Money.format(inv.cgst)}</span></div>
        <div className="r"><span>SGST</span><span>{Money.format(inv.sgst)}</span></div>
      </>}
      {inv.roundOff !== 0 && <div className="r"><span>Round off</span><span>{Money.format(inv.roundOff)}</span></div>}
      <div className="r" style={{ fontWeight: 700, fontSize: 14 }}><span>TOTAL</span><span>{Money.format(inv.total)}</span></div>
      <hr />
      {inv.payments.map((p, i) => <div className="r" key={i}><span>{p.method}</span><span>{Money.format(p.amount)}</span></div>)}
      {inv.change > 0 && <div className="r"><span>Change</span><span>{Money.format(inv.change)}</span></div>}
      {inv.due > 0 && <div className="r" style={{ fontWeight: 700 }}><span>BALANCE DUE</span><span>{Money.format(inv.due)}</span></div>}
      <hr />
      <div style={{ textAlign: 'center' }}>{s.footerNote}</div>
    </div>
  );
}
