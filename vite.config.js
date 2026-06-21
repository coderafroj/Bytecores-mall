import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
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
