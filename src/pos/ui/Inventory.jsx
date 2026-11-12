import { useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { Search, Plus, PackagePlus, Pencil, Trash2, Download, Upload } from 'lucide-react';
import { db } from '../data/db';
import { ProductRepo } from '../data/repositories';
import { Money } from '../domain/money';
import { useProductImages } from './useProductImages';
import { Sheet, Field, RupeeInput, Scanner, ScanButton, PhotoField } from './common';
import { downloadFile, toCSV, parseCSV } from './utils';

const GST = [0, 5, 12, 18, 28];
const blank = (s) => ({ name: '', sku: '', barcode: '', category: '', costPrice: 0, mrp: 0, sellPrice: 0, gstRate: s.gstEnabled ? 18 : 0, stock: 0, lowStockAt: s.lowStockDefault, unit: 'pcs', image: '' });
const blankLike = (p) => ({ ...p, id: undefined, name: '', sku: '', barcode: '', costPrice: 0, mrp: 0, sellPrice: 0, stock: 0, image: '' });

export default function Inventory({ settings }) {
  const products = useLiveQuery(() => db.products.toArray(), [], []);
  const [q, setQ] = useState('');
  const [f, setF] = useState('all');
  const [edit, setEdit] = useState(null);
  const [restock, setRestock] = useState(null);
  const [limit, setLimit] = useState(60);
  const fileRef = useRef();

  const counts = useMemo(() => ({
    low: products.filter((p) => p.stock > 0 && p.stock <= p.lowStockAt).length,
    out: products.filter((p) => p.stock <= 0).length,
  }), [products]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return products
      .filter((p) => !t || [p.name, p.sku, p.barcode, p.category].some((x) => (x || '').toLowerCase().includes(t)))
      .filter((p) => f === 'all' || (f === 'out' ? p.stock <= 0 : p.stock > 0 && p.stock <= p.lowStockAt))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, q, f]);

  const visible = useMemo(() => list.slice(0, limit), [list, limit]);
  const imgOf = useProductImages(visible);

  const exportCSV = () => downloadFile('products.csv', toCSV([
    ['name', 'sku', 'barcode', 'category', 'cost', 'mrp', 'price', 'gst', 'stock', 'lowstock', 'unit'],
    ...products.map((p) => [p.name, p.sku, p.barcode, p.category, p.costPrice / 100, p.mrp / 100, p.sellPrice / 100, p.gstRate, p.stock, p.lowStockAt, p.unit]),
  ]));

  const importCSV = async (file) => {
    try {
      const rows = parseCSV(await file.text());
      const head = rows.shift().map((h) => h.trim().toLowerCase());
      const col = (r, k) => (r[head.indexOf(k)] ?? '').trim();
      if (head.indexOf('name') < 0 || head.indexOf('price') < 0) throw new Error('CSV needs at least "name" and "price" columns');
      let ok = 0, skipped = 0;
      for (const r of rows) {
        try {
          const sku = col(r, 'sku');
          const existing = sku ? await db.products.where('sku').equals(sku).first() : null;
          await ProductRepo.save({
            id: existing?.id, name: col(r, 'name'), sku, barcode: col(r, 'barcode'), category: col(r, 'category'),
            costPrice: Money.toPaise(col(r, 'cost')), mrp: Money.toPaise(col(r, 'mrp')), sellPrice: Money.toPaise(col(r, 'price')),
            gstRate: col(r, 'gst') || 0, stock: col(r, 'stock') || 0, lowStockAt: col(r, 'lowstock') || settings.lowStockDefault, unit: col(r, 'unit') || 'pcs',
          });
          ok++;
        } catch { skipped++; }
      }
      toast.success(`Imported ${ok} products${skipped ? `, ${skipped} rows skipped` : ''}`);
    } catch (e) { toast.error(e.message); }
  };

  return (
    <>
      <div className="row" style={{ marginBottom: 8 }}>
        <div className="search grow"><Search size={18} /><input className="inp" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <button className="btn pri" onClick={() => setEdit(blank(settings))}><Plus size={16} /> Add</button>
      </div>
      <div className="chips">
        {[['all', `All (${products.length})`], ['low', `Low (${counts.low})`], ['out', `Out (${counts.out})`]].map(([k, l]) => (
          <button key={k} className={`chip ${f === k ? 'on' : ''}`} onClick={() => setF(k)}>{l}</button>
        ))}
        <button className="chip" onClick={exportCSV}><Download size={13} /> CSV</button>
        <button className="chip" onClick={() => fileRef.current.click()}><Upload size={13} /> Import</button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => { e.target.files[0] && importCSV(e.target.files[0]); e.target.value = ''; }} />
      </div>

      {!products.length ? (
        <div className="empty card"><b>Add your first product</b>
          <p className="sm">Enter cost price (what you paid) and selling price. Profit is calculated automatically on every bill.</p>
          <button className="btn pri" onClick={() => setEdit(blank(settings))}><Plus size={16} /> Add product</button>
          <p className="xs">Have many products? Import a CSV with columns: name, sku, barcode, category, cost, mrp, price, gst, stock</p>
        </div>
      ) : (
        <div className="list">
          {visible.map((p) => {
            const src = imgOf(p);
            const margin = p.sellPrice ? ((p.sellPrice - p.costPrice) / p.sellPrice) * 100 : 0;
            return (
              <div className="item" key={p.id}>
                {src ? <img src={src} alt="" className="thumb" style={{ width: 48, height: 48 }} decoding="async" /> : <div className="avatar">{p.name[0]?.toUpperCase()}</div>}
                <div className="grow">
                  <div className="b trunc">{p.name}</div>
                  <div className="xs mute trunc">{p.category} · {p.sku}</div>
                  <div className="row xs" style={{ gap: 6, marginTop: 3 }}>
                    <span className="num b">{Money.format(p.sellPrice)}</span>
                    <span className="mute">cost {Money.format(p.costPrice)}</span>
                    <span className={margin < 10 ? 'warn' : 'good'}>{margin.toFixed(0)}%</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`tag ${p.stock <= 0 ? 'bad' : p.stock <= p.lowStockAt ? 'warn' : 'good'}`}>{p.stock} {p.unit}</span>
                  <div className="row" style={{ gap: 4, marginTop: 6, justifyContent: 'flex-end' }}>
                    <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => setRestock(p)} aria-label="Add stock"><PackagePlus size={15} /></button>
                    <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => setEdit(p)} aria-label="Edit"><Pencil size={15} /></button>
                  </div>
                </div>
              </div>
            );
          })}
          {limit < list.length && <button className="btn block" onClick={() => setLimit((l) => l + 60)}>Aur dikhao ({list.length - limit} baaki)</button>}
          {!list.length && <div className="empty">Kuch nahi mila</div>}
        </div>
      )}

      {edit && <ProductForm initial={edit} gst={settings.gstEnabled} categories={[...new Set(products.map((p) => p.category))]} onClose={() => setEdit(null)} />}
      {restock && <RestockSheet p={restock} onClose={() => setRestock(null)} />}
    </>
  );
}

function ProductForm({ initial, categories, gst, onClose }) {
  const [p, setP] = useState(initial);
  const [scan, setScan] = useState(false);
  const [existing, setExisting] = useState('');
  useEffect(() => { if (initial.id && initial.hasImage) db.images.get(initial.id).then((r) => setExisting(r?.data || '')); }, [initial.id, initial.hasImage]);
  const set = (k) => (v) => setP((x) => ({ ...x, [k]: v }));
  const margin = p.sellPrice ? ((p.sellPrice - p.costPrice) / p.sellPrice) * 100 : 0;
  const rate = gst ? p.gstRate : 0;
  const profit = Math.round((p.sellPrice * 100) / (100 + rate)) - p.costPrice; // GST-exclusive profit

  const submit = async (next = false) => {
    try {
      await ProductRepo.save(p); toast.success(`${p.name} save ho gaya`);
      if (next) setP({ ...blankLike(p) }); else onClose();   // keep category / GST / unit so the next item is 3 taps
    } catch (e) { toast.error(e.message); }
  };
  const remove = async () => {
    if (!window.confirm(`"${p.name}" hata dein? Purane bills mein ye safe rahega. Cloud se bhi hat jayega.`)) return;
    await ProductRepo.remove(p.id); onClose();
  };

  return (
    <Sheet title={p.id ? 'Edit product' : 'New product'} onClose={onClose}
      footer={<div className="row">
        {p.id && <button className="btn bad" onClick={remove}><Trash2 size={16} /></button>}
        {!p.id && <button className="btn grow" onClick={() => submit(true)}>Save + agla</button>}
        <button className="btn pri grow" onClick={() => submit(false)}>Save</button>
      </div>}>
      <div className="col">
        <PhotoField value={p.image !== undefined ? p.image : existing} onChange={set('image')} />
        <Field label="Samaan ka naam"><input className="inp" value={p.name} onChange={(e) => set('name')(e.target.value)} autoFocus={!p.id} /></Field>
        <div className="grid g2">
          <Field label="Category">
            <input className="inp" list="cats" value={p.category} onChange={(e) => set('category')(e.target.value)} placeholder="e.g. Mobile" />
            <datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
          <Field label="Unit">
            <select className="inp" value={p.unit} onChange={(e) => set('unit')(e.target.value)}>{['pcs', 'kg', 'g', 'ltr', 'box', 'pair', 'm'].map((u) => <option key={u}>{u}</option>)}</select>
          </Field>
        </div>
        <div className="grid g2">
          <Field label="Barcode"><div className="row"><input className="inp num grow" value={p.barcode} onChange={(e) => set('barcode')(e.target.value)} /><ScanButton onClick={() => setScan(true)} /></div></Field>
          <Field label="SKU" hint="Auto if empty"><input className="inp" value={p.sku} onChange={(e) => set('sku')(e.target.value)} /></Field>
        </div>
        <div className="grid g3">
          <Field label="Cost ₹ (paid)"><RupeeInput value={p.costPrice} onChange={set('costPrice')} /></Field>
          <Field label="MRP ₹"><RupeeInput value={p.mrp} onChange={set('mrp')} /></Field>
          <Field label="Sell ₹"><RupeeInput value={p.sellPrice} onChange={set('sellPrice')} /></Field>
        </div>
        {p.sellPrice > 0 && (
          <div className={`card row between ${profit < 0 ? 'bad' : 'good'}`} style={{ background: profit < 0 ? 'var(--bad-soft)' : 'var(--good-soft)' }}>
            <span className="b sm">Profit per piece</span>
            <span className="b num">{Money.format(profit)} ({margin.toFixed(0)}% margin)</span>
          </div>
        )}
        <div className="grid g3">
          {gst ? <Field label="GST %"><select className="inp" value={p.gstRate} onChange={(e) => set('gstRate')(Number(e.target.value))}>{GST.map((g) => <option key={g} value={g}>{g}%</option>)}</select></Field> : <div />}
          <Field label="Stock"><input className="inp num" inputMode="decimal" value={p.stock} onChange={(e) => set('stock')(e.target.value)} /></Field>
          <Field label="Low alert"><input className="inp num" inputMode="numeric" value={p.lowStockAt} onChange={(e) => set('lowStockAt')(e.target.value)} /></Field>
        </div>
      </div>
      {scan && <Scanner onCode={(c) => set('barcode')(c)} onClose={() => setScan(false)} />}
    </Sheet>
  );
}

function RestockSheet({ p, onClose }) {
  const [qty, setQty] = useState('');
  const [cost, setCost] = useState(p.costPrice);
  const n = parseFloat(qty) || 0;
  const avg = p.stock + n > 0 ? Math.round((p.costPrice * Math.max(0, p.stock) + cost * n) / (Math.max(0, p.stock) + n)) : cost;
  const submit = async () => {
    try { await ProductRepo.addStock(p.id, n, cost); toast.success(`+${n} ${p.unit} added`); onClose(); } catch (e) { toast.error(e.message); }
  };
  return (
    <Sheet title={`Add stock · ${p.name}`} onClose={onClose}
      footer={<button className="btn pri block" disabled={n <= 0} onClick={submit}>Add {n || ''} to stock</button>}>
      <div className="grid g2">
        <Field label="Quantity bought"><input className="inp num" inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} autoFocus /></Field>
        <Field label="Cost per piece ₹"><RupeeInput value={cost} onChange={setCost} /></Field>
      </div>
      <p className="sm mute">Stock {p.stock} → <b>{p.stock + n}</b>. Average cost becomes <b>{Money.format(avg)}</b> so your profit stays accurate when buy rates change.</p>
    </Sheet>
  );
}
