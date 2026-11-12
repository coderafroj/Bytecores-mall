import { registerSW } from 'virtual:pwa-register';

registerSW({ onOfflineReady() { console.log('App ready to work offline'); } });

// Two entries so the shop counter never downloads the storefront (about 1.2 MB of JS it doesn't use).
const p = window.location.pathname;
if (p === '/pos' || p.startsWith('/pos/')) import('./posEntry.jsx');
else import('./storefrontEntry.jsx');
