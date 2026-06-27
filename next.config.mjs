import withPWA from '@ducanh2912/next-pwa';

const pwaConfig = withPWA({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        // Next.js static chunks (_next/static)
        urlPattern: /^https?:\/\/.*\/_next\/static\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'next-static',
          expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      {
        // Next.js image optimization
        urlPattern: /^https?:\/\/.*\/_next\/image\?.*/i,
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'next-image' },
      },
      {
        // Static files from /public (icons, manifest, images, fonts)
        urlPattern: /^https?:\/\/.*\/(?!api\/).*\.(png|jpg|jpeg|svg|ico|webp|woff2?|ttf)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-assets',
          expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      {
        // App pages (HTML navigation) — NOT api routes
        urlPattern: ({ url }) => {
          return url.pathname.startsWith('/') && !url.pathname.startsWith('/api/');
        },
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages',
          networkTimeoutSeconds: 5,
          expiration: { maxEntries: 30, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
      // API routes intentionally have no cache rule — they require the server
    ],
  },
});

export default pwaConfig({});
