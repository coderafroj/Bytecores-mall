import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { liveQuery } from 'dexie';
import { Cloud, CloudOff, RefreshCw, TriangleAlert, WifiOff } from 'lucide-react';
import { sync, loadLastSync } from '../sync/engine';
import { hasClerk, useSyncState } from './useSync';


/** Gives the sync engine the admin's Clerk session (needed only to talk to /api/pos-sync). */
function ClerkAuth() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const ref = useRef(getToken);
  ref.current = getToken;
  useEffect(() => {
    if (!isLoaded) return;
    sync.setAuth({ getToken: () => ref.current(), signedIn: !!isSignedIn });
    sync.syncNow();
  }, [isLoaded, isSignedIn]);
  return null;
}

/** Background sync: on start, when internet returns, shortly after any local change, and every minute. */
export default function SyncRunner() {
  useEffect(() => {
    loadLastSync();
    let timer;
    const kick = (ms) => { clearTimeout(timer); timer = setTimeout(() => sync.syncNow(), ms); };
    const sub = liveQuery(() => sync.pendingCount()).subscribe({ next: (n) => { sync.setPending(n); if (n > 0) kick(3000); }, error: () => {} });
    const online = () => kick(500);
    const visible = () => document.visibilityState === 'visible' && kick(500);
    window.addEventListener('online', online);
    document.addEventListener('visibilitychange', visible);
    const iv = setInterval(() => kick(0), 60_000);
    return () => { sub.unsubscribe(); clearTimeout(timer); clearInterval(iv); window.removeEventListener('online', online); document.removeEventListener('visibilitychange', visible); };
  }, []);
  return hasClerk() ? <ClerkAuth /> : null;
}

export function SyncChip({ onOpenSettings }) {
  const s = useSyncState();
  const offline = typeof navigator !== 'undefined' && !navigator.onLine;
  let icon = <Cloud size={15} />, label = 'Cloud mein safe', tone = 'good', action = () => sync.syncNow();
  if (s.status === 'syncing') { icon = <RefreshCw size={15} className="spin" />; label = 'Sync ho raha…'; tone = 'mute'; }
  else if (offline || s.status === 'offline') { icon = <WifiOff size={15} />; label = s.pending ? `Offline · ${s.pending} baaki` : 'Offline'; tone = 'warn'; }
  else if (s.status === 'auth') { icon = <CloudOff size={15} />; label = 'Login karo'; tone = 'warn'; action = () => { window.location.href = '/admin'; }; }
  else if (s.status === 'config' || s.status === 'error') { icon = <TriangleAlert size={15} />; label = 'Sync error'; tone = 'bad'; action = onOpenSettings; }
  else if (s.pending > 0) { icon = <RefreshCw size={15} />; label = `${s.pending} baaki`; tone = 'mute'; }
  return <button className={`sync-chip ${tone}`} onClick={action} title={s.message || 'Cloud sync'} aria-label={label}>{icon}<span>{label}</span></button>;
}
