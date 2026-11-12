import { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from 'sonner';
import PosApp from './pos/ui/PosApp.jsx';

// Lean entry for the shop counter: no storefront, redux or analytics. Clerk is only used to
// prove "this is the admin" to the sync server; the counter itself works without it.
const KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// If Clerk cannot start (no internet on the very first load), run the counter without it.
class ClerkGuard extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { globalThis.__posNoClerk = true; return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
const app = (
  <BrowserRouter>
    <Toaster position="top-center" richColors />
    <Routes>
      <Route path="/pos/*" element={<PosApp />} />
      <Route path="*" element={<Navigate to="/pos/bill" replace />} />
    </Routes>
  </BrowserRouter>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {KEY ? <ClerkGuard fallback={app}><ClerkProvider publishableKey={KEY} afterSignOutUrl="/">{app}</ClerkProvider></ClerkGuard> : app}
  </StrictMode>,
);
