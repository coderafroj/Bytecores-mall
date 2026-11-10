import { useEffect, useRef, useState } from 'react';
import { X, Camera, ImagePlus } from 'lucide-react';
import { fileToThumb } from './utils';

export function Sheet({ title, onClose, children, footer }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="row between" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {children}
        {footer && <div style={{ marginTop: 14 }}>{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {hint && <span className="xs mute">{hint}</span>}
    </div>
  );
}

/** Rupee text input -> paise. Keeps what the user typed, reports paise upward. */
export function RupeeInput({ value, onChange, ...rest }) {
  const [txt, setTxt] = useState(value ? String(value / 100) : '');
  useEffect(() => { setTxt(value ? String(value / 100) : ''); }, [value]);
  return (
    <input
      className="inp num" inputMode="decimal" placeholder="0" value={txt} {...rest}
      onChange={(e) => {
        const v = e.target.value.replace(/[^0-9.]/g, '');
        setTxt(v);
        onChange(Math.round((parseFloat(v) || 0) * 100));
      }}
    />
  );
}

/** Camera barcode scanner. Uses the native BarcodeDetector (Chrome/Android). */
export function Scanner({ onCode, onClose, continuous = false }) {
  const video = useRef(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    let stream, raf, alive = true, last = '', lastAt = 0;
    (async () => {
      if (!('BarcodeDetector' in window)) { setErr('Camera scanning is not supported in this browser. Use a USB/Bluetooth scanner or type the code.'); return; }
      try {
        const det = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'] });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.current.srcObject = stream; await video.current.play();
        const tick = async () => {
          if (!alive) return;
          try {
            const codes = await det.detect(video.current);
            const c = codes[0]?.rawValue;
            if (c && (c !== last || Date.now() - lastAt > 1800)) {
              last = c; lastAt = Date.now();
              navigator.vibrate?.(40);
              onCode(c);
              if (!continuous) { onClose(); return; }
            }
          } catch { /* frame not ready */ }
          raf = setTimeout(tick, 160);
        };
        tick();
      } catch { setErr('Camera permission denied or no camera found.'); }
    })();
    return () => { alive = false; clearTimeout(raf); stream?.getTracks().forEach((t) => t.stop()); };
  }, []);
  return (
    <Sheet title="Scan barcode" onClose={onClose}>
      {err ? <div className="empty">{err}</div> : (
        <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', background: '#000' }}>
          <video ref={video} playsInline muted style={{ width: '100%', display: 'block', maxHeight: '55dvh', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: '30% 10%', border: '2px solid #fff', borderRadius: 12, boxShadow: '0 0 0 999px rgba(0,0,0,.35)' }} />
        </div>
      )}
      {continuous && !err && <p className="xs mute" style={{ textAlign: 'center' }}>Keep scanning — each item is added automatically.</p>}
    </Sheet>
  );
}

export const ScanButton = ({ onClick }) => (
  <button type="button" className="icon-btn" onClick={onClick} aria-label="Scan barcode"><Camera size={18} /></button>
);

/** Photo picker: laptop webcam, phone camera, or any file. Calls onChange(dataUrl | ''). */
export function PhotoField({ value, onChange }) {
  const file = useRef(null);
  const video = useRef(null);
  const [cam, setCam] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!cam) return;
    let stream, dead = false;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 960 } } })
      .then((s) => { if (dead) return s.getTracks().forEach((t) => t.stop()); stream = s; video.current.srcObject = s; video.current.play(); })
      .catch(() => { setErr('Camera nahi mila. "Gallery" se photo chuno.'); });
    return () => { dead = true; stream?.getTracks().forEach((t) => t.stop()); };
  }, [cam]);

  const snap = async () => { onChange(await fileToThumb(video.current)); setCam(false); };
  const pick = async (f) => { if (f) { try { onChange(await fileToThumb(f)); } catch { setErr('Ye photo open nahi hui'); } } };

  return (
    <div className="row" style={{ alignItems: 'stretch' }}>
      <div className="photo-box">{value ? <img src={value} alt="Product" /> : <ImagePlus size={26} className="mute" />}</div>
      <div className="col grow" style={{ gap: 8, justifyContent: 'center' }}>
        <div className="row" style={{ gap: 8 }}>
          <button type="button" className="btn sm grow" onClick={() => { setErr(''); setCam(true); }}><Camera size={15} /> Camera</button>
          <button type="button" className="btn sm grow" onClick={() => file.current.click()}>Gallery</button>
          {value && <button type="button" className="btn sm ghost" onClick={() => onChange('')}>Hatao</button>}
        </div>
        <span className="xs mute">{value ? `${Math.round((value.length * 0.75) / 1024)} KB · auto chhoti ki gayi` : 'Photo se billing tez hoti hai'}</span>
        {err && <span className="xs bad">{err}</span>}
        <input ref={file} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files[0]); e.target.value = ''; }} />
      </div>
      {cam && (
        <Sheet title="Photo kheencho" onClose={() => setCam(false)} footer={<button className="btn pri block" onClick={snap}><Camera size={16} /> Photo lo</button>}>
          <video ref={video} playsInline muted style={{ width: '100%', borderRadius: 14, background: '#000', maxHeight: '55dvh', objectFit: 'cover' }} />
          {err && <div className="empty">{err}</div>}
        </Sheet>
      )}
    </div>
  );
}
