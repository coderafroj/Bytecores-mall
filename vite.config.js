import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * `npm run dev` has no Vercel, so /api/* would 404. This serves the sync route from the same file
 * (api/pos-sync.js) so cloud sync works locally too. It reads your .env (including the secret ones).
 */
function devApi() {
  return {
    name: 'dev-api-pos-sync',
    apply: 'serve',
    configureServer(server) {
      for (const [k, v] of Object.entries(loadEnv(server.config.mode, process.cwd(), ''))) if (!(k in process.env)) process.env[k] = v;
      server.middlewares.use('/api/pos-sync', async (req, res) => {
        const send = (code, obj) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); };
        try {
          let raw = '';
          for await (const chunk of req) raw += chunk;
          let body = {};
          try { body = raw ? JSON.parse(raw) : {}; } catch { return send(400, { error: 'bad json' }); }
          const mod = await server.ssrLoadModule('/api/pos-sync.js');
          const out = { setHeader: (k, v) => res.setHeader(k, v), status(c) { res.statusCode = c; return out; }, json: (o) => send(res.statusCode || 200, o) };
          await mod.default({ method: req.method, headers: req.headers, body }, out);
        } catch (e) { send(500, { error: 'dev_api_error', message: e.message }); }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    devApi(),
    react(),
    tailwindcss(),
    VitePWA({ 
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'favicon.svg'],
      manifest: {
        name: 'Bytecores Mall POS',
        short_name: 'Bytecores POS',
        description: "India's #1 Premium Tech Store & POS",
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/pos/bill',
        scope: '/',
        shortcuts: [{ name: 'New bill', short_name: 'Bill', url: '/pos/bill' }, { name: 'Stock', short_name: 'Stock', url: '/pos/stock' }],
        icons: [
          {
            src: '/favicon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/favicon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 20000000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 }, cacheableResponse: { statuses: [0, 200] } }
          },
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/cloud\.appwrite\.io\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'appwrite-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
