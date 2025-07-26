if (!self.define) {
  let e,
    s = {};
  const i = (i, n) => (
    (i = new URL(i + ".js", n).href),
    s[i] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = i), (e.onload = s), document.head.appendChild(e);
        } else (e = i), importScripts(i), s();
      }).then(() => {
        let e = s[i];
        if (!e) throw new Error(`Module ${i} didn’t register its module`);
        return e;
      })
  );
  self.define = (n, t) => {
    const a =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[a]) return;
    let c = {};
    const r = (e) => i(e, a),
      o = { module: { uri: a }, exports: c, require: r };
    s[a] = Promise.all(n.map((e) => o[e] || r(e))).then((e) => (t(...e), c));
  };
}
define(["./workbox-4754cb34"], function (e) {
  "use strict";
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/app-build-manifest.json",
          revision: "0a9ed4a2ed8947d01a015fe2a63e751f",
        },
        {
          url: "/_next/static/HWxVgIbvim-p98jrXuNTF/_buildManifest.js",
          revision: "2ec694eb52ae4f523f265a46bae4d768",
        },
        {
          url: "/_next/static/HWxVgIbvim-p98jrXuNTF/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/chunks/23-181027d0d94b030c.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/chunks/278-b4404277521a9490.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/chunks/30a37ab2-863a10cc4a2f3d67.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/chunks/444-f980a9dd0300b819.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/chunks/795d4814-c78dedb40f7aab16.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/chunks/862-65f16c71eeea9b99.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/chunks/871-8c75afd8a88f6d06.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/chunks/8e1d74a4-6bd511f863788db8.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/chunks/app/_not-found/page-3cf76bbd96d8ceeb.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/chunks/app/home/inventory/%5BinventoryId%5D/page-d236656d03139ccf.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/chunks/app/home/page-13f71dff18810595.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/chunks/app/layout-fe19950e2b64ced0.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/chunks/app/login/page-1283142705afd8ff.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/chunks/app/page-a91248dad22c6a6d.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/chunks/fd9d1056-e158016523ed90e0.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/chunks/framework-f66176bb897dc684.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/chunks/main-app-9f67a468a599f2aa.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/chunks/main-bc107b0753b6bd44.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/chunks/pages/_app-6a626577ffa902a4.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/chunks/pages/_error-1be831200e60c5c0.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js",
          revision: "79330112775102f91e1010318bae2bd3",
        },
        {
          url: "/_next/static/chunks/webpack-c11f89cc682f879f.js",
          revision: "HWxVgIbvim-p98jrXuNTF",
        },
        {
          url: "/_next/static/css/822b944f43ea991f.css",
          revision: "822b944f43ea991f",
        },
        {
          url: "/_next/static/media/26a46d62cd723877-s.woff2",
          revision: "befd9c0fdfa3d8a645d5f95717ed6420",
        },
        {
          url: "/_next/static/media/55c55f0601d81cf3-s.woff2",
          revision: "43828e14271c77b87e3ed582dbff9f74",
        },
        {
          url: "/_next/static/media/581909926a08bbc8-s.woff2",
          revision: "f0b86e7c24f455280b8df606b89af891",
        },
        {
          url: "/_next/static/media/8e9860b6e62d6359-s.woff2",
          revision: "01ba6c2a184b8cba08b0d57167664d75",
        },
        {
          url: "/_next/static/media/97e0cb1ae144a2a9-s.woff2",
          revision: "e360c61c5bd8d90639fd4503c829c2dc",
        },
        {
          url: "/_next/static/media/df0a9ae256c0569c-s.woff2",
          revision: "d54db44de5ccb18886ece2fda72bdfe0",
        },
        {
          url: "/_next/static/media/e4af272ccee01ff0-s.p.woff2",
          revision: "65850a373e258f1c897a2b3d75eb74de",
        },
        {
          url: "/icons/invenzo-128.ico",
          revision: "1d25de1e313cfe4c4f40545078668f41",
        },
        {
          url: "/icons/invenzo-512.ico",
          revision: "c88f3de1222e23d428bae691836cc4f1",
        },
        { url: "/manifest.json", revision: "91c8fdd7dce0899a07c826326b6cf561" },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: i,
              state: n,
            }) =>
              s && "opaqueredirect" === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: "OK",
                    headers: s.headers,
                  })
                : s,
          },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const s = e.pathname;
        return !s.startsWith("/api/auth/") && !!s.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "others",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      "GET"
    );
});
