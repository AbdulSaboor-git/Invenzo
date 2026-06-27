import withPWA from '@ducanh2912/next-pwa';

const withPWAConfig = withPWA({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',

  // Serve offline.html for any navigation request that fails AND has no cache hit
  fallbacks: {
    document: '/offline.html',
  },

  workboxOptions: {
    disableDevLogs: true,

    // Activate the SW immediately on install — don't wait for old SW to die
    skipWaiting: true,
    clientsClaim: true,

    runtimeCaching: [
      {
        // Next.js static chunks — cache forever, they're content-hashed
        urlPattern: /^https?:\/\/.*\/_next\/static\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'next-static',
          expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      {
        // Next.js image optimisation
        urlPattern: /^https?:\/\/.*\/_next\/image\?.*/i,
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'next-image' },
      },
      {
        // Public static assets (icons, manifest, images, fonts)
        urlPattern:
          /^https?:\/\/.*\/(?!api\/).*\.(png|jpg|jpeg|svg|ico|webp|woff2?|ttf)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-assets',
          expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      {
        // App pages (HTML navigation) — NOT api routes.
        // NetworkFirst: try server, fall back to cache, then offline.html via fallbacks.
        urlPattern: ({ url }) =>
          url.pathname.startsWith('/') && !url.pathname.startsWith('/api/'),
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages',
          // After 3s without a server response, serve from cache immediately
          networkTimeoutSeconds: 3,
          expiration: { maxEntries: 30, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
      // API routes have no entry — they require the server and must never be cached
    ],
  },
});

export default withPWAConfig({});
