importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

workbox.setConfig({
  debug: false,
  modulePathPrefix: 'https://storage.googleapis.com/workbox-cdn/releases/7.0.0/'
});

const SITE_REVISION = '20260615205222';
const CACHE_PREFIX = 'paulwillard-nz';

workbox.core.setCacheNameDetails({
  prefix: CACHE_PREFIX,
  suffix: SITE_REVISION
});

workbox.core.clientsClaim();
workbox.precaching.cleanupOutdatedCaches();

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/history.html',
  '/testimonials.html',
  '/trucks.html',
  '/suspension.html',
  '/gst_calc.html',
  '/404.html',
  '/orbit-menu.html',
  '/index.css',
  '/app.js',
  '/assets/js/load-service-worker.js',
  '/manifest.json',
  '/favicon.ico',
  '/assets/favicon/favicon.ico',
  '/assets/favicon/favicon-16x16.png',
  '/assets/favicon/favicon-32x32.png',
  '/assets/favicon/favicon-96x96.png',
  '/assets/favicon/apple-icon-180x180.png',
  '/assets/favicon/android-icon-192x192.png',
  '/assets/favicon/android-icon-512x512.png',
  '/assets/fonts/inter-latin.woff2',
  '/assets/fonts/outfit-latin.woff2',
  '/assets/fonts/fira-code-latin.woff2',
  '/assets/images/optimized/paul-lw-220.webp',
  '/assets/bikesetup.xls'
];

workbox.precaching.precacheAndRoute(
  PRECACHE_URLS.map((url) => ({ url, revision: SITE_REVISION })),
  { cleanURLs: false }
);

workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: `${CACHE_PREFIX}-html-${SITE_REVISION}`,
    networkTimeoutSeconds: 4,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: `${CACHE_PREFIX}-assets-${SITE_REVISION}`,
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: `${CACHE_PREFIX}-images`,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 90,
        maxAgeSeconds: 30 * 24 * 60 * 60
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'font',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: `${CACHE_PREFIX}-fonts`,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 365 * 24 * 60 * 60
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
