import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { CACHE_NAMES } from './src/config.js'

export default defineConfig({
  base: '/whether/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Runtime caching rules (Workbox GenerateSW)
        runtimeCaching: [
          // Open-Meteo: NetworkFirst, 10s timeout
          // cache.put() is used internally by Workbox strategies, bypassing
          // Cache-Control: no-cache directives that Open-Meteo may return.
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: CACHE_NAMES.weatherData,
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 },  // 1h fallback ceiling
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // RainViewer manifest: StaleWhileRevalidate, 2 min expiry
          // Short TTL prevents stale tile timestamps from breaking radar overlays.
          {
            urlPattern: /^https:\/\/api\.rainviewer\.com\/public\/weather-maps\.json/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: CACHE_NAMES.radarManifest,
              expiration: { maxEntries: 1, maxAgeSeconds: 60 * 2 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // RainViewer tiles: CacheFirst, 200 entries, 10 min
          {
            urlPattern: /^https:\/\/tilecache\.rainviewer\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: CACHE_NAMES.radarTiles,
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 10 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // CartoDB tiles: CacheFirst, 500 entries, 7 days
          {
            urlPattern: /^https:\/\/[a-z]\.basemaps\.cartocdn\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: CACHE_NAMES.cartoTiles,
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'Whether',
        short_name: 'Whether',
        description: 'Personal weather dashboard',
        theme_color: '#0069cc',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/whether/',
        icons: [
          { src: 'icons/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.js'],
  },
})
