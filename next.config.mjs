import withPWA from '@ducanh2912/next-pwa';

// OFFLINE ARCHITECTURE NOTE:
// This is an SSR app — pages are rendered server-side on every request.
// They cannot be statically precached during the build like a classic SPA.
// Instead, we use NetworkFirst runtime caching: pages are cached on first
// visit while online. The cache warmup in (protected)/layout.js pre-fetches
// critical routes after auth so users don't need to manually visit each page.
//
// HARD LIMIT: API routes (/api/*) require a live server. There is no offline
// support for data mutations (sales, inventory edits). The OfflineBanner
// communicates this to users. Queueing mutations for later sync (Background
// Sync API) is a future enhancement if offline-first POS is needed.

const withPWAConfig = withPWA({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,

  // BUG-2 FIX: was true — force reload on reconnect wipes the POS Redux cart.
  // The OfflineBanner component already handles reconnect UI gracefully.
  reloadOnOnline: false,

  disable: process.env.NODE_ENV === 'development',

  fallbacks: {
    // Serve offline.html for any navigate request that fails with no cache hit.
    // Note: this only fires for request.mode === 'navigate', NOT RSC fetches.
    document: '/offline.html',
  },

  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
    clientsClaim: true,

    // BUG-6 partial fix: explicitly precache offline.html and icons.
    // The plugin adds fallbacks.document to additionalManifestEntries internally,
    // but being explicit here is safer and self-documenting.
    additionalManifestEntries: [
      { url: '/offline.html', revision: '1' },
      { url: '/manifest.json', revision: '1' },
      { url: '/icon-192.png', revision: '1' },
      { url: '/icon-512.png', revision: '1' },
    ],

    runtimeCaching: [
      {
        // Next.js static chunks — content-hashed filenames, cache forever.
        urlPattern: /^https?:\/\/.*\/_next\/static\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'next-static',
          // BUG-4 FIX: never cache non-200 responses (e.g. 302 redirects).
          cacheableResponse: { statuses: [0, 200] },
          expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      {
        // Next.js image optimisation endpoint.
        urlPattern: /^https?:\/\/.*\/_next\/image\?.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'next-image',
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        // Public static assets: icons, logo, fonts.
        urlPattern:
          /^https?:\/\/.*\/(?!api\/).*\.(png|jpg|jpeg|svg|ico|webp|woff2?|ttf)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-assets',
          cacheableResponse: { statuses: [0, 200] },
          expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },

      // BUG-1 FIX — Split the old single 'pages' entry into two:
      //
      // WHY: Next.js App Router uses RSC (React Server Components) for
      // client-side navigation. A link click fetches /page?_rsc=<hash>
      // which returns a special RSC payload (NOT full HTML). A browser
      // refresh requests /page (no _rsc param) which expects full HTML.
      // If both are stored under the same cache, or if one is served for
      // the other, the result is either a cache miss or corrupted content.
      //
      // BUG-3 FIX: Both entries use request.mode / searchParams guards
      // that do NOT match /_next/* URLs, eliminating the double-caching
      // conflict with the next-static and next-image entries above.

      {
        // Entry A: Full-page HTML — fires on refresh, direct URL entry,
        // browser back/forward, and anything with request.mode === 'navigate'.
        // This is the response that gets served on an offline refresh.
        urlPattern: ({ url, request }) =>
          request.mode === 'navigate' &&
          !url.pathname.startsWith('/_next/') &&
          !url.pathname.startsWith('/api/'),
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-html',
          networkTimeoutSeconds: 3,
          // BUG-4 FIX: only cache clean 200 responses — never cache
          // auth redirects (302 to /login) or server errors (500).
          cacheableResponse: { statuses: [0, 200] },
          expiration: { maxEntries: 30, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
      {
        // Entry B: RSC payloads — fires on Next.js client-side navigation
        // (Link clicks, router.push). These are partial streaming responses,
        // NOT HTML. Cache them separately with a shorter TTL since they
        // reflect server-rendered data that goes stale faster.
        urlPattern: ({ url }) =>
          url.searchParams.has('_rsc') &&
          !url.pathname.startsWith('/api/'),
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-rsc',
          networkTimeoutSeconds: 3,
          cacheableResponse: { statuses: [0, 200] },
          expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 }, // 1 hour
        },
      },

      // API routes are intentionally excluded from all caching.
      // They require a live server connection and must never be served stale.
    ],
  },
});

export default withPWAConfig({});
