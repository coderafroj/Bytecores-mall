import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { Search, Trash2, Minus, Plus, Pause, Play, Printer, MessageCircle, Check, ShoppingBag, ArrowLeft, LayoutGrid, List } from 'lucide-react';
import { db } from '../data/db';
import { ProductRepo, InvoiceRepo } from '../data/repositories';
import { InvoiceCalculator } from '../domain/invoiceCalculator';
import { Money } from '../domain/money';
import { Sheet, Field, RupeeInput, Scanner, ScanButton } from './common';
import Receipt from './Receipt';
import { useProductImages } from './useProductImages';
import { receiptText, whatsappLink } from './utils';

const DRAFT = 'pos_draft_v2';
const HELD = 'pos_held_v2';
const PAGE = 48;
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };
const EMPTY_DISCOUNT = { type: 'flat', value: 0 };

export default function Billing({ settings, role }) {
  const owner = role === 'owner';
  const products = useLiveQuery(() => db.products.toArray(), [], []);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('pos_bill_view') || 'grid');
  const toggleView = (m) => { setViewMode(m); localStorage.setItem('pos_bill_view', m); };
  const [limit, setLimit] = useState(PAGE);
  const [cart, setCart] = useState(() => load(DRAFT, {}).lines || []);
  const [discount, setDiscount] = useState(() => load(DRAFT, {}).discount || EMPTY_DISCOUNT);
  const [held, setHeld] = useState(() => load(HELD, []));
  const [open, setOpen] = useState(false);
  const [pay, setPay] = useState(false);
  const [done, setDone] = useState(null);
  const [scan, setScan] = useState(false);
  const searchRef = useRef(null);
  const sentinel = useRef(null);

  useEffect(() => { save(DRAFT, { lines: cart, discount }); }, [cart, discount]);
  useEffect(() => { save(HELD, held); }, [held]);

  /* ---------- O(n) indexes, rebuilt only when products change ---------- */
  const { sorted, hay, byId, categories } = useMemo(() => {
    const sorted = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0) || a.name.localeCompare(b.name)); // best sellers first
    const hay = new Map(), byId = new Map(), cats = new Set();
    for (const p of sorted) {
      hay.set(p.id, `${p.name} ${p.sku} ${p.barcode} ${p.category}`.toLowerCase());
      byId.set(p.id, p); cats.add(p.category);
    }
    return { sorted, hay, byId, categories: ['All', ...cats] };
  }, [products]);

  /* ---------- per-keystroke work is a single O(n) pass ---------- */
  const shown = useMemo(() => {
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
    const out = [];
    for (const p of sorted) {
      if (cat !== 'All' && p.category !== cat) continue;
      const h = hay.get(p.id);
      if (tokens.every((t) => h.includes(t))) out.push(p);
    }
    return out;
  }, [sorted, hay, q, cat]);
  useEffect(() => setLimit(PAGE), [q, cat]);

  // endless scroll: only PAGE tiles are in the DOM at first, more load as you reach the end
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && setLimit((l) => l + PAGE), { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, [shown.length, limit]);

  const visible = useMemo(() => shown.slice(0, limit), [shown, limit]);
  const imgOf = useProductImages(useMemo(() => [...visible, ...cart.map((l) => byId.get(l.productId)).filter(Boolean)], [visible, cart, byId]));
  const qtyById = useMemo(() => new Map(cart.map((l) => [l.productId, l.qty])), [cart]);

  /* ---------- cart ---------- */
  const add = useCallback((p, n = 1) => {
    if (p.stock <= 0) return toast.error(`${p.name} ka stock khatam hai`);
    setCart((c) => {
      const i = c.findIndex((l) => l.productId === p.id);
      if (i >= 0) {
        if (c[i].qty + n > p.stock) { toast.error(`Sirf ${p.stock} bache hain`); return c; }
        return c.map((l, k) => (k === i ? { ...l, qty: l.qty + n } : l));
      }
      return [...c, { productId: p.id, name: p.name, qty: n, unitPrice: p.sellPrice, costPrice: p.costPrice, gstRate: p.gstRate, stock: p.stock }];
    });
    navigator.vibrate?.(12);
  }, []);
  const setQty = (id, qty) => setCart((c) => c.flatMap((l) => {
    if (l.productId !== id) return [l];
    if (qty <= 0) return [];
    if (qty > l.stock) { toast.error(`Sirf ${l.stock} bache hain`); return [{ ...l, qty: l.stock }]; }
    return [{ ...l, qty }];
  }));
  const setPrice = (id, unitPrice) => setCart((c) => c.map((l) => (l.productId === id ? { ...l, unitPrice } : l)));
  const clear = () => { setCart([]); setDiscount(EMPTY_DISCOUNT); setOpen(false); };

  const byCode = async (code) => {
    const p = await ProductRepo.findByCode(code);
    if (!p) return toast.error(`Code ${code} nahi mila`);
    add(p); toast.success(p.name);
  };
  const onSearchKey = async (e) => {
    if (e.key !== 'Enter' || !q.trim()) return;
    const p = await ProductRepo.findByCode(q); // USB/Bluetooth scanner types the code and presses Enter
    if (p) { add(p); setQ(''); } else if (shown.length === 1) { add(shown[0]); setQ(''); }
  };

  /* GST switch: when off, every bill is a plain total */
  const effective = useMemo(() => cart.map((l) => ({ ...l, gstRate: settings.gstEnabled ? l.gstRate : 0 })), [cart, settings.gstEnabled]);
  const calc = useMemo(() => InvoiceCalculator.calculate(effective, owner ? discount : EMPTY_DISCOUNT, { roundOff: settings.roundOff }), [effective, discount, owner, settings.roundOff]);

  const hold = () => {
    if (!cart.length) return;
    setHeld((h) => [...h, { at: Date.now(), lines: cart, discount, total: calc.total }]);
    clear(); toast.success('Bill roka gaya. Upar "Roka hua" se wapas lo.');
  };
  const resume = (i) => {
    if (cart.length) return toast.error('Pehle ye bill poora ya hold karo');
    setCart(held[i].lines); setDiscount(held[i].discount);
    setHeld((h) => h.filter((_, k) => k !== i));
  };

  /* keyboard: F2 search, F4 / Ctrl+Enter pay */
  useEffect(() => {
    const k = (e) => {
      if (pay || done || scan) return;
      if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus(); }
      if ((e.key === 'F4' || (e.key === 'Enter' && e.ctrlKey)) && cart.length) { e.preventDefault(); setPay(true); }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [pay, done, scan, cart.length]);

  const cartPanel = (
    <div className={`cart-panel card col ${open ? 'open' : ''}`} style={{ gap: 0 }}>
      <div className="row between" style={{ marginBottom: 6 }}>
        <div className="row">
          <button className="icon-btn" style={{ display: open ? 'grid' : 'none' }} onClick={() => setOpen(false)} aria-label="Wapas"><ArrowLeft size={18} /></button>
          <b style={{ fontSize: 18 }}>Bill</b>
          <span className="tag mute">{calc.itemCount} item</span>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn sm" onClick={hold} disabled={!cart.length}><Pause size={14} /> Roko</button>
          <button className="btn sm ghost" onClick={clear} disabled={!cart.length} aria-label="Bill saaf karo"><Trash2 size={14} /></button>
        </div>
      </div>

      {!cart.length ? (
        <div className="empty"><ShoppingBag size={34} /><div className="b" style={{ marginTop: 6 }}>Samaan ki photo dabao</div><div className="xs">ya barcode scan karo</div></div>
      ) : (
        <div style={{ overflow: 'auto', maxHeight: 'calc(100dvh - 330px)' }}>
          {calc.lines.map((l) => {
            const img = imgOf(byId.get(l.productId));
            return (
              <div className="line" key={l.productId} style={{ gridTemplateColumns: 'auto 1fr auto' }}>
                {img ? <img className="thumb" src={img} alt="" /> : <div className="thumb avatar" style={{ width: 44, height: 44 }}>{l.name[0]}</div>}
                <div className="grow">
                  <div className="b sm">{l.name}</div>
                  {owner ? (
                    <div className="row xs mute" style={{ gap: 4 }}>₹
                      <input className="inp num" style={{ minHeight: 28, width: 76, padding: '0 6px' }} inputMode="decimal"
                        defaultValue={l.unitPrice / 100} key={l.productId + ':' + l.unitPrice} aria-label="Rate"
                        onBlur={(e) => setPrice(l.productId, Math.round((parseFloat(e.target.value) || 0) * 100))} />
                      {l.unitPrice < l.costPrice && <span className="tag bad">ghate mein</span>}
                    </div>
                  ) : <div className="xs mute num">{Money.format(l.unitPrice)} each</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="b num">{Money.format(l.net + l.discountShare)}</div>
                  <div className="qty" style={{ marginTop: 4 }}>
                    <button onClick={() => setQty(l.productId, l.qty - 1)} aria-label="Kam"><Minus size={14} /></button>
                    <input className="num" inputMode="numeric" value={l.qty} onChange={(e) => setQty(l.productId, parseInt(e.target.value) || 0)} aria-label="Quantity" />
                    <button onClick={() => setQty(l.productId, l.qty + 1)} aria-label="Zyada"><Plus size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="col" style={{ marginTop: 12 }}>
        {owner && cart.length > 0 && (
          <div className="row">
            <div className="chips" style={{ flex: 'none' }}>
              {['flat', 'percent'].map((t) => <button key={t} className={`chip ${discount.type === t ? 'on' : ''}`} onClick={() => setDiscount({ type: t, value: 0 })}>{t === 'flat' ? '₹ chhoot' : '% chhoot'}</button>)}
            </div>
            <div className="grow">
              {discount.type === 'flat'
                ? <RupeeInput value={discount.value} onChange={(v) => setDiscount({ type: 'flat', value: v })} aria-label="Chhoot" />
                : <input className="inp num" inputMode="decimal" placeholder="0" value={discount.value || ''} aria-label="Chhoot percent" onChange={(e) => setDiscount({ type: 'percent', value: Math.min(100, parseFloat(e.target.value) || 0) })} />}
            </div>
          </div>
        )}
        {calc.discount > 0 && <div className="row between sm good"><span>Chhoot</span><span className="num">-{Money.format(calc.discount)}</span></div>}
        {settings.gstEnabled && calc.gst > 0 && <div className="row between xs mute"><span>GST shamil</span><span className="num">{Money.format(calc.gst)}</span></div>}
        <div className="row between" style={{ alignItems: 'flex-end' }}>
          <span className="b mute">Kul rakam</span>
          <span className="total-big num">{Money.format(calc.total)}</span>
        </div>
        {owner && calc.profit < 0 && <div className="tag bad">Ye bill ghate mein hai ({Money.format(calc.profit)})</div>}
        <button className="btn pri block" style={{ minHeight: 56, fontSize: 18 }} disabled={!cart.length} onClick={() => setPay(true)}>
          Paisa lo <span className="kbd" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.5)' }}>F4</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="bill-wrap">
        <div>
          <div className="row" style={{ marginBottom: 8 }}>
            <div className="search grow">
              <Search size={18} />
              <input ref={searchRef} className="inp" style={{ minHeight: 50, fontSize: 16 }} placeholder="Naam ya barcode likho (F2)" value={q}
                onChange={(e) => setQ(e.target.value)} onKeyDown={onSearchKey} aria-label="Samaan dhundo" enterKeyHint="search" />
            </div>
            <ScanButton onClick={() => setScan(true)} />
            <div className="row" style={{ gap: 2, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12, padding: 2, flex: 'none' }}>
              <button
                type="button"
                className="icon-btn"
                style={{ width: 38, height: 38, border: 'none', borderRadius: 9, background: viewMode === 'grid' ? 'var(--brand-soft)' : 'transparent', color: viewMode === 'grid' ? 'var(--brand)' : 'var(--mute)' }}
                onClick={() => toggleView('grid')}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                type="button"
                className="icon-btn"
                style={{ width: 38, height: 38, border: 'none', borderRadius: 9, background: viewMode === 'list' ? 'var(--brand-soft)' : 'transparent', color: viewMode === 'list' ? 'var(--brand)' : 'var(--mute)' }}
                onClick={() => toggleView('list')}
                title="List View"
                aria-label="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>
          <div className="chips">
            {held.map((h, i) => <button key={h.at} className="chip" style={{ borderColor: 'var(--warn)' }} onClick={() => resume(i)}><Play size={12} /> Roka hua {Money.format(h.total, { compact: true })}</button>)}
            {categories.map((c) => <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c === 'All' ? 'Sab' : c}</button>)}
          </div>

          {!products.length ? (
            <div className="empty card"><b>Abhi koi samaan nahi hai</b><div className="sm">Pehle "Stock" mein jaakar samaan aur photo daalo.</div></div>
          ) : (
            <>
              {viewMode === 'list' ? (
                <div className="bill-list">
                  {visible.map((p) => {
                    const n = qtyById.get(p.id) || 0;
                    const src = imgOf(p);
                    return (
                      <button
                        key={p.id}
                        className={`bill-item ${p.stock <= 0 ? 'out' : ''}`}
                        onClick={() => add(p)}
                        aria-label={`${p.name} ${Money.format(p.sellPrice)}`}
                      >
                        <div className="bill-item-thumb">
                          {src ? <img src={src} alt="" decoding="async" /> : p.name[0]?.toUpperCase()}
                          {n > 0 && <span className="in-cart">{n}</span>}
                        </div>
                        <div className="grow" style={{ textAlign: 'left', minWidth: 0 }}>
                          <div className="b sm trunc">{p.name}</div>
                          <div className="xs mute trunc">{p.category} {p.barcode ? `· ${p.barcode}` : ''}</div>
                          <div className="row xs" style={{ gap: 6, marginTop: 3 }}>
                            <span className="num b" style={{ fontSize: 14 }}>{Money.format(p.sellPrice)}</span>
                            <span className={`tag xs ${p.stock <= 0 ? 'bad' : p.stock <= p.lowStockAt ? 'warn' : 'good'}`}>
                              {p.stock <= 0 ? 'Khatam' : `${p.stock} ${p.unit || 'pcs'}`}
                            </span>
                          </div>
                        </div>
                        <span className="btn sm pri" style={{ minHeight: 32, padding: '0 12px', fontSize: 13, flex: 'none' }}>
                          + Add
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="ptiles">
                  {visible.map((p) => {
                    const n = qtyById.get(p.id) || 0;
                    const src = imgOf(p);
                    return (
                      <button key={p.id} className={`ptile ${p.stock <= 0 ? 'out' : ''}`} onClick={() => add(p)} aria-label={`${p.name} ${Money.format(p.sellPrice)}`}>
                        {n > 0 && <span className="in-cart">{n}</span>}
                        <div className="img">{src ? <img src={src} alt="" decoding="async" /> : p.name[0]?.toUpperCase()}</div>
                        <div className="meta">
                          <span className="nm">{p.name}</span>
                          <div className="row between" style={{ marginTop: 'auto', alignItems: 'center' }}>
                            <span className="pr num">{Money.format(p.sellPrice)}</span>
                            <span className={`tag xs ${p.stock <= 0 ? 'bad' : p.stock <= p.lowStockAt ? 'warn' : 'good'}`} style={{ padding: '2px 6px', fontSize: 11 }}>
                              {p.stock <= 0 ? '0' : `${p.stock} ${p.unit || 'pcs'}`}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {limit < shown.length && <div ref={sentinel} className="empty xs">Aur dikha rahe hain…</div>}
              {!shown.length && <div className="empty">“{q}” nahi mila</div>}
            </>
          )}
        </div>
        {cartPanel}
      </div>

      {cart.length > 0 && !open && (
        <button className="cart-bar" onClick={() => setOpen(true)} aria-label="Bill dekho">
          <span className="row" style={{ gap: 8 }}>
            <ShoppingBag size={20} />
            <b style={{ fontSize: 15 }}>{calc.itemCount} {calc.itemCount === 1 ? 'item' : 'items'}</b>
          </span>
          <span className="row" style={{ gap: 6 }}>
            <b className="num" style={{ fontSize: 17 }}>{Money.format(calc.total)}</b>
            <span style={{ fontSize: 14, fontWeight: 700, opacity: 0.9 }}>· Bill dekho →</span>
          </span>
        </button>
      )}

      {scan && <Scanner continuous onCode={byCode} onClose={() => setScan(false)} />}
      {pay && <PaySheet calc={calc} lines={effective} discount={owner ? discount : EMPTY_DISCOUNT} settings={settings} onClose={() => setPay(false)}
        onDone={(inv) => { setPay(false); clear(); setDone(inv); }} />}
      {done && (
        <Sheet title="Bill ho gaya ✓" onClose={() => setDone(null)}
          footer={<div className="grid g2">
            <button className="btn" onClick={() => window.print()}><Printer size={16} /> Print</button>
            <a className="btn" href={whatsappLink(done.customer?.phone, receiptText(done, settings))} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a>
            <button className="btn pri block" autoFocus style={{ gridColumn: '1/-1', minHeight: 54, fontSize: 17 }} onClick={() => setDone(null)}><Check size={18} /> Naya bill</button>
          </div>}>
          {done.change > 0 && <div className="card" style={{ background: 'var(--good-soft)', marginBottom: 10 }}>
            <div className="xs mute">Customer ko wapas do</div><div className="total-big num good">{Money.format(done.change)}</div></div>}
          <Receipt inv={done} s={settings} />
        </Sheet>
      )}
    </>
  );
}

const METHODS = [['CASH', 'Cash'], ['UPI', 'UPI / QR'], ['CARD', 'Card'], ['UDHAAR', 'Udhaar']];

function PaySheet({ calc, lines, discount, settings, onClose, onDone }) {
  const total = calc.total;
  const [method, setMethod] = useState('CASH');
  const [got, setGot] = useState(total);       // cash received
  const [paidNow, setPaidNow] = useState(0);   // udhaar: part paid now
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);

  const phoneOk = phone.replace(/\D/g, '').length >= 10;
  const change = method === 'CASH' ? Math.max(0, got - total) : 0;
  const short = method === 'CASH' && got < total;
  const udhaarDue = method === 'UDHAAR' ? Math.max(0, total - paidNow) : 0;
  const blocked = busy || short || (method === 'UDHAAR' && !phoneOk);

  // quick cash buttons: next round notes above the total
  const quick = useMemo(() => {
    const set = new Set();
    for (const step of [50, 100, 200, 500, 2000]) { const v = Math.ceil(total / (step * 100)) * step * 100; if (v > total) set.add(v); }
    return [...set].slice(0, 4);
  }, [total]);

  const submit = async () => {
    if (blocked) return;
    setBusy(true);
    try {
      const payments = method === 'UDHAAR' ? (paidNow > 0 ? [{ method: 'CASH', amount: Math.min(paidNow, total) }] : []) : [{ method, amount: total }];
      const inv = await InvoiceRepo.createSale({ lines, discount, payments, customer: name.trim() || phoneOk ? { name: name.trim(), phone } : null, settings });
      onDone({ ...inv, change });
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <Sheet title="Paisa lo" onClose={onClose}
      footer={<button className="btn good block" style={{ minHeight: 58, fontSize: 18 }} disabled={blocked} onClick={submit}>
        {method === 'UDHAAR' ? `${Money.format(udhaarDue)} udhaar likho` : 'Bill banao'} <span className="kbd" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.5)' }}>Enter</span></button>}>
      <div onKeyDown={(e) => { if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') { e.preventDefault(); submit(); } }}>
        <div style={{ textAlign: 'center', margin: '2px 0 12px' }}>
          <div className="xs mute">Kul rakam</div>
          <div className="total-big num" style={{ fontSize: 52 }}>{Money.format(total)}</div>
        </div>
        <div className="chips" style={{ justifyContent: 'center' }}>
          {METHODS.map(([k, l]) => <button key={k} className={`chip cash-chip ${method === k ? 'on' : ''}`} onClick={() => setMethod(k)}>{l}</button>)}
        </div>

        {method === 'CASH' && (
          <div className="col" style={{ marginTop: 10 }}>
            <Field label="Customer ne kitna diya?"><RupeeInput value={got} onChange={setGot} autoFocus /></Field>
            <div className="chips">
              <button className="chip cash-chip" onClick={() => setGot(total)}>Theek {Money.format(total)}</button>
              {quick.map((v) => <button key={v} className="chip cash-chip" onClick={() => setGot(v)}>{Money.format(v)}</button>)}
            </div>
            <div className="card row between" style={{ background: short ? 'var(--bad-soft)' : 'var(--good-soft)' }}>
              <span className="b">{short ? 'Kam hai' : 'Wapas do'}</span>
              <span className="total-big num" style={{ fontSize: 30 }}>{Money.format(short ? total - got : change)}</span>
            </div>
          </div>
        )}
        {method === 'UDHAAR' && (
          <div className="col" style={{ marginTop: 10 }}>
            <Field label="Abhi kitna diya? (0 = poora udhaar)"><RupeeInput value={paidNow} onChange={setPaidNow} /></Field>
            <div className="card row between" style={{ background: 'var(--warn-soft)' }}><span className="b">Baaki udhaar</span><b className="num" style={{ fontSize: 22 }}>{Money.format(udhaarDue)}</b></div>
          </div>
        )}
        {(method === 'UPI' && settings.upiId) && <div className="card sm" style={{ marginTop: 10 }}>UPI ID: <b>{settings.upiId}</b>. Payment aane ke baad hi “Bill banao” dabao.</div>}

        <div className="grid g2" style={{ marginTop: 12 }}>
          <Field label={method === 'UDHAAR' ? 'Customer ka naam' : 'Naam (optional)'}><input className="inp" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label={method === 'UDHAAR' ? 'Mobile number (zaroori)' : 'Mobile (WhatsApp bill ke liye)'}><input className="inp num" inputMode="tel" maxLength={13} value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
        </div>
      </div>
    </Sheet>
  );
}
