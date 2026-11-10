import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Download, Upload, Lock, ShieldCheck } from 'lucide-react';
import { SettingsRepo, BackupService, wipeAllData } from '../data/repositories';
import { Field } from './common';
import { downloadFile, sha256 } from './utils';

export default function Settings({ settings }) {
  const [s, setS] = useState(settings);
  const [persisted, setPersisted] = useState(null);
  const fileRef = useRef();
  useEffect(() => { navigator.storage?.persisted?.().then(setPersisted); }, []);
  const set = (k) => (e) => setS((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const saveInfo = async () => {
    await SettingsRepo.save({
      shopName: s.shopName.trim() || 'My Shop', address: s.address, phone: s.phone, gstin: s.gstin.toUpperCase(),
      invoicePrefix: (s.invoicePrefix || 'BM').toUpperCase(), upiId: s.upiId, footerNote: s.footerNote,
      lowStockDefault: Number(s.lowStockDefault) || 0, roundOff: !!s.roundOff, gstEnabled: !!s.gstEnabled,
    });
    toast.success('Settings saved');
  };
  const backup = async () => {
    const data = await BackupService.exportAll();
    downloadFile(`bytecores-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data), 'application/json');
    await BackupService.markBackedUp(); toast.success('Backup downloaded. Keep it on Google Drive / WhatsApp too.');
  };
  const restore = async (file) => {
    if (!window.confirm('Restore will REPLACE all data on this device with the backup. Continue?')) return;
    try { await BackupService.importAll(JSON.parse(await file.text())); toast.success('Backup restored'); } catch (e) { toast.error(e.message); }
  };
  const wipe = async () => {
    if (window.prompt('This deletes ALL products, bills and customers on this device. Type DELETE to confirm.') !== 'DELETE') return;
    await wipeAllData(); localStorage.removeItem('pos_draft_v1'); localStorage.removeItem('pos_held_v1'); toast.success('All data erased');
  };
  const persist = async () => { const ok = await navigator.storage?.persist?.(); setPersisted(!!ok); toast[ok ? 'success' : 'error'](ok ? 'Storage is now protected from auto-cleanup' : 'Browser refused. Install the app to home screen first.'); };

  return (
    <div className="col">
      <div className="card row between">
        <div className="grow"><b>GST billing</b>
          <div className="xs mute">{s.gstEnabled ? 'ON: bill par GST tod ke dikhega (CGST/SGST). Product mein GST % chuno.' : 'OFF: bill par sirf kul rakam dikhegi. Jab GST shuru karna ho tab ON karo.'}</div></div>
        <label className="row" style={{ gap: 8 }}><input type="checkbox" style={{ width: 24, height: 24 }} checked={!!s.gstEnabled} onChange={set('gstEnabled')} /><b>{s.gstEnabled ? 'ON' : 'OFF'}</b></label>
      </div>
      <div className="card col">
        <b>Shop details (printed on bills)</b>
        <Field label="Shop name"><input className="inp" value={s.shopName} onChange={set('shopName')} /></Field>
        <Field label="Address"><textarea className="inp" value={s.address} onChange={set('address')} /></Field>
        <div className="grid g2">
          <Field label="Phone"><input className="inp num" inputMode="tel" value={s.phone} onChange={set('phone')} /></Field>
          <Field label={s.gstEnabled ? 'GSTIN' : 'GSTIN (GST ON karne par)'}><input className="inp" value={s.gstin} onChange={set('gstin')} maxLength={15} /></Field>
          <Field label="Bill prefix"><input className="inp" value={s.invoicePrefix} onChange={set('invoicePrefix')} maxLength={5} /></Field>
          <Field label="UPI ID"><input className="inp" value={s.upiId} onChange={set('upiId')} placeholder="shop@upi" /></Field>
        </div>
        <Field label="Footer note"><input className="inp" value={s.footerNote} onChange={set('footerNote')} /></Field>
        <div className="grid g2">
          <Field label="Default low-stock alert"><input className="inp num" inputMode="numeric" value={s.lowStockDefault} onChange={set('lowStockDefault')} /></Field>
          <label className="row" style={{ alignSelf: 'flex-end', minHeight: 44 }}><input type="checkbox" checked={!!s.roundOff} onChange={set('roundOff')} /> Round bill to nearest ₹</label>
        </div>
        <button className="btn pri" onClick={saveInfo}>Save settings</button>
      </div>

      <div className="card col">
        <b><Lock size={15} style={{ verticalAlign: -2 }} /> PIN lock</b>
        <p className="xs mute" style={{ margin: 0 }}>
          <b>Malik PIN</b>: poora software (profit, stock, reports). <b>Staff PIN</b>: sirf billing counter, cost / profit / rate badalna nahi dikhega.
          {' '}Malik PIN: {settings.pinHash ? 'ON' : 'OFF'} · Staff PIN: {settings.staffPinHash ? 'ON' : 'OFF'}
        </p>
        <PinRow label="Malik PIN" has={!!settings.pinHash} onSave={(h) => SettingsRepo.save({ pinHash: h })} onClear={() => SettingsRepo.save({ pinHash: '', staffPinHash: '' })} sha={sha256} other={settings.staffPinHash} />
        <PinRow label="Staff PIN" has={!!settings.staffPinHash} disabled={!settings.pinHash} onSave={(h) => SettingsRepo.save({ staffPinHash: h })} onClear={() => SettingsRepo.save({ staffPinHash: '' })} sha={sha256} other={settings.pinHash} />
        {!settings.pinHash && <span className="xs warn">Pehle Malik PIN lagao, phir Staff PIN.</span>}
      </div>

      <div className="card col">
        <b><ShieldCheck size={15} style={{ verticalAlign: -2 }} /> Data safety</b>
        <p className="xs mute" style={{ margin: 0 }}>Everything is stored on this phone and works with no internet. Take a backup weekly, and before changing phone or clearing the browser.</p>
        <div className="grid g2">
          <button className="btn pri" onClick={backup}><Download size={16} /> Backup now</button>
          <button className="btn" onClick={() => fileRef.current.click()}><Upload size={16} /> Restore</button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { e.target.files[0] && restore(e.target.files[0]); e.target.value = ''; }} />
        <div className="row between sm"><span>Protected from browser auto-cleanup: <b className={persisted ? 'good' : 'warn'}>{persisted ? 'Yes' : 'No'}</b></span>{!persisted && <button className="btn sm" onClick={persist}>Protect</button>}</div>
        <div className="xs mute">{settings.lastBackupAt ? `Last backup: ${new Date(settings.lastBackupAt).toLocaleString('en-IN')}` : 'No backup taken yet'}</div>
      </div>

      <div className="card col" style={{ borderColor: 'var(--bad)' }}>
        <b className="bad">Danger zone</b>
        <button className="btn bad" onClick={wipe}>Erase all data on this device</button>
      </div>
    </div>
  );
}

function PinRow({ label, has, disabled, onSave, onClear, sha, other }) {
  const [pin, setPin] = useState('');
  const save = async () => {
    if (!/^\d{4}$/.test(pin)) return toast.error('PIN 4 ank ka hona chahiye');
    const h = await sha('bm:' + pin);
    if (h === other) return toast.error('Malik aur Staff ka PIN alag rakho');
    await onSave(h); setPin(''); toast.success(`${label} lag gaya`);
  };
  return (
    <div className="row">
      <input className="inp num grow" inputMode="numeric" maxLength={4} disabled={disabled} placeholder={`${label} (4 ank)`} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
      <button className="btn pri" disabled={disabled} onClick={save}>{has ? 'Badlo' : 'Lagao'}</button>
      {has && <button className="btn" onClick={() => onClear().then(() => toast.success(`${label} hata diya`))}>Hatao</button>}
    </div>
  );
}
