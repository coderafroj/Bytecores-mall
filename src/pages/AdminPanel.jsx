import { useEffect } from 'react';

/**
 * The admin console is now just the shop counter. AdminRoute (App.jsx) has already checked
 * that this Clerk user is the admin, so open the counter as owner in its own lean app.
 */
export default function AdminPanel() {
  useEffect(() => {
    sessionStorage.setItem('pos_role', 'owner');
    window.location.replace('/pos/bill');
  }, []);
  return <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', fontWeight: 700 }}>Counter khul raha hai…</div>;
}
