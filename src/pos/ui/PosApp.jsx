import { lazy, Suspense, useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Lock as LockIcon, House, Package, ScanLine, ChartColumn, Ellipsis, Users, ReceiptText, Wallet, Settings as Cog, Store, Delete, ChevronRight } from 'lucide-react';
import { SettingsRepo } from '../data/repositories';
import { DEFAULT_SETTINGS } from '../data/db';
import { sha256 } from './utils';
import SyncRunner, { SyncChip } from './SyncRunner';
import Home from './Home';
import Billing from './Billing';
import Inventory from './Inventory';
import './pos.css';

const Reports = lazy(() => import('./Reports'));
const Customers = lazy(() => import('./Customers'));
const Bills = lazy(() => import('./Bills'));
const Expenses = lazy(() => import('./Expenses'));
const Settings = lazy(() => import('./Settings'));

const NAV = [
  { to: '/pos', end: true, label: 'Home', icon: House },
  { to: '/pos/stock', label: 'Stock', icon: Package },
  { to: '/pos/bill', label: 'Bill', icon: ScanLine, bill: true },
  { to: '/pos/reports', label: 'Reports', icon: ChartColumn },
  { to: '/pos/more', label: 'More', icon: Ellipsis },
];
const TITLES = { '/pos': 'Dashboard', '/pos/stock': 'Stock', '/pos/bill': 'New bill', '/pos/reports': 'Reports', '/pos/more': 'More', '/pos/bills': 'Bills', '/pos/customers': 'Customers & Udhaar', '/pos/expenses': 'Expenses', '/pos/settings': 'Settings' };

function PinLock({ ownerHash, staffHash, onOpen }) {
  const [pin, setPin] = useState('');
  const [bad, setBad] = useState(false);
  const press = async (d) => {
    const next = (pin + d).slice(0, 4); setPin(next); setBad(false);
    if (next.length === 4) {
      const h = await sha256('bm:' + next);
      if (h === ownerHash) onOpen('owner');
      else if (staffHash && h === staffHash) onOpen('staff');
      else { setBad(true); navigator.vibrate?.(120); setTimeout(() => setPin(''), 350); }
    }
  };
  // laptop: type the PIN on the keyboard too
  useEffect(() => {
    const k = (e) => { if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') setPin((p) => p.slice(0, -1)); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });
  return (
    <div className="lock">
      <div style={{ textAlign: 'center' }}>
        <Store size={34} style={{ color: 'var(--brand)' }} />
        <h2 style={{ margin: '6px 0 0' }}>PIN daalo</h2>
        <div className="pin-dots" aria-live="polite" aria-label={`${pin.length} of 4 digits entered`}>{[0, 1, 2, 3].map((i) => <i key={i} className={i < pin.length ? 'f' : ''} style={bad ? { borderColor: 'var(--bad)' } : {}} />)}</div>
        <div className="keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <button key={n} onClick={() => press(String(n))}>{n}</button>)}
          <span /><button onClick={() => press('0')}>0</button><button onClick={() => setPin((p) => p.slice(0, -1))} aria-label="Backspace"><Delete size={20} /></button>
        </div>
      </div>
    </div>
  );
}

function More() {
  const items = [
    ['/pos/bills', ReceiptText, 'Bills & returns', 'Reprint, share or cancel a bill'],
    ['/pos/customers', Users, 'Customers & udhaar', 'Collect pending payments'],
    ['/pos/expenses', Wallet, 'Expenses', 'Rent, salary, electricity'],
    ['/pos/settings', Cog, 'Settings & backup', 'Shop details, PIN, backup'],
  ];
  return (
    <div className="list">
      {items.map(([to, Icon, t, d]) => (
        <Link to={to} key={to} className="item" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="avatar"><Icon size={18} /></div><div className="grow"><div className="b">{t}</div><div className="xs mute">{d}</div></div><ChevronRight size={18} className="mute" />
        </Link>
      ))}
      <Link to="/admin" className="item" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="avatar"><Store size={18} /></div><div className="grow"><div className="b">Online store admin</div><div className="xs mute">Needs internet</div></div><ChevronRight size={18} className="mute" />
      </Link>
    </div>
  );
}

export default function PosApp() {
  const loc = useLocation();
  const navigate = useNavigate();
  const stored = useLiveQuery(() => SettingsRepo.get(), []);
  const settings = stored || DEFAULT_SETTINGS;
  // role is remembered for this browser tab only. The admin panel sets it to 'owner' after a real admin login.
  const [role, setRole] = useState(() => sessionStorage.getItem('pos_role'));

  useEffect(() => {
    document.title = `${settings.shopName} POS`;
  }, [settings.shopName]);

  if (!stored) return <div className="pos"><SyncRunner /></div>;
  const needsPin = !!settings.pinHash;
  const activeRole = needsPin ? role : 'owner';          // no PIN set => owner (first-time setup)
  if (needsPin && !role) {
    return <div className="pos"><SyncRunner /><PinLock ownerHash={settings.pinHash} staffHash={settings.staffPinHash} onOpen={(r) => { sessionStorage.setItem('pos_role', r); setRole(r); }} /></div>;
  }
  const lock = () => { sessionStorage.removeItem('pos_role'); setRole(null); };
  const staff = activeRole === 'staff';
  if (staff && loc.pathname !== '/pos/bill') return <Navigate to="/pos/bill" replace />;

  const link = (n) => (
    <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive || (n.to === '/pos/more' && ['/pos/bills', '/pos/customers', '/pos/expenses', '/pos/settings'].includes(loc.pathname)) ? 'on' : '') + (n.bill ? ' bill' : '')}>
      {n.bill ? <span className="pill"><n.icon size={22} color="#fff" /></span> : <n.icon size={21} />}
      {n.label}
    </NavLink>
  );

  return (
    <div className={`pos pos-shell ${staff ? "staff" : ""}`}>
      <aside className="pos-rail" hidden={staff}><div className="brand">{settings.shopName}</div>{NAV.slice(0, 4).map(link)}
        <NavLink to="/pos/customers">Customers</NavLink><NavLink to="/pos/bills">Bills</NavLink><NavLink to="/pos/expenses">Expenses</NavLink><NavLink to="/pos/settings">Settings</NavLink></aside>
      <div className="pos-body">
        <header className="pos-top">
          <h1>{staff ? settings.shopName : TITLES[loc.pathname] || settings.shopName}</h1>
          <SyncChip onOpenSettings={() => navigate('/pos/settings')} />
          {needsPin && <button className="icon-btn" onClick={lock} aria-label="Lock karo" title="Lock karo"><LockIcon size={17} /></button>}
        </header>
        <main className="pos-main">
          <Suspense fallback={<div className="empty">Loading…</div>}>
            <Routes>
              <Route index element={<Home settings={settings} needsPin={needsPin} />} />
              <Route path="bill" element={<Billing settings={settings} role={activeRole} />} />
              <Route path="stock" element={<Inventory settings={settings} />} />
              <Route path="reports" element={<Reports />} />
              <Route path="more" element={<More />} />
              <Route path="bills" element={<Bills settings={settings} />} />
              <Route path="customers" element={<Customers settings={settings} />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="settings" element={<Settings key={JSON.stringify(settings)} settings={settings} />} />
              <Route path="*" element={<Navigate to="/pos" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <SyncRunner />
      <nav className="pos-nav" aria-label="Main" hidden={staff}>{NAV.map(link)}</nav>
    </div>
  );
}
