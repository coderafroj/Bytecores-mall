import { Money } from '../domain/money';
// Pure helpers (no React) shared by the POS screens.
export function downloadFile(name, text, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([type.startsWith('text/csv') ? '\uFEFF' + text : text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export const toCSV = (rows) =>
  rows.map((r) => r.map((c) => { const s = String(c ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(',')).join('\n');

export function parseCSV(text) {
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim() !== ''));
}

export const fmtDate = (t) => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export const fmtTime = (t) => new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });


export async function sha256(text) {
  if (!crypto?.subtle) return btoa(unescape(encodeURIComponent(text)));
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
/**
 * Photo -> small square thumbnail (data URL). 256px WebP/JPEG is ~8-15 KB, so
 * 2,000 products cost ~25 MB at most and the grid stays instant, even offline.
 */
export async function fileToThumb(source, size = 256, quality = 0.72) {
  const bmp = source instanceof HTMLVideoElement ? source : await createImageBitmap(source, { imageOrientation: 'from-image' });
  const w = bmp.videoWidth || bmp.width, h = bmp.videoHeight || bmp.height;
  const side = Math.min(w, h);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  c.getContext('2d').drawImage(bmp, (w - side) / 2, (h - side) / 2, side, side, 0, 0, size, size);
  bmp.close?.();
  let url = c.toDataURL('image/webp', quality);
  if (!url.startsWith('data:image/webp')) url = c.toDataURL('image/jpeg', quality); // Safari
  return url;
}


export function receiptText(inv, s) {
  const L = [`*${s.shopName}*`];
  if (s.address) L.push(s.address);
  if (s.phone) L.push(`Ph: ${s.phone}`);
  L.push(`Bill: ${inv.number}`, `${fmtDate(inv.createdAt)} ${fmtTime(inv.createdAt)}`, '');
  inv.lines.forEach((l) => L.push(`${l.name} x${l.qty} = ${Money.format(l.net)}`));
  L.push('');
  if (inv.discount) L.push(`Discount: -${Money.format(inv.discount)}`);
  L.push(`*Total: ${Money.format(inv.total)}*`);
  if (inv.due > 0) L.push(`Balance due: ${Money.format(inv.due)}`);
  if (s.upiId && inv.due > 0) L.push(`Pay via UPI: ${s.upiId}`);
  if (s.footerNote) L.push('', s.footerNote);
  return L.join('\n');
}

export function whatsappLink(phone, text) {
  const p = (phone || '').replace(/\D/g, '').slice(-10);
  return `https://wa.me/${p ? '91' + p : ''}?text=${encodeURIComponent(text)}`;
}

