const CACHE_NAME = 'qoffa-smart-v4';
const SCOPE_ROOT = new URL('./', self.registration.scope);
const STATIC_PATHS = [
  './',
  'products/',
  'product-detail/',
  'bundles/',
  'order/',
  'about/',
  'contact/',
  'terms/',
  'return-policy/',
  'manifest.json',
  'assets/js/route-helper.js',
  'assets/js/runtime-config.js',
  'assets/js/api-client.js',
  'assets/js/main.js',
  'assets/js/modal.js',
  'assets/js/reorder-modal.js',
  'assets/js/reorder-popup-loader.js',
  'assets/js/image-tools.js',
  'assets/js/home.js',
  'assets/js/about.js',
  'assets/js/contact.js',
  'assets/js/order.js',
  'assets/js/blog.js',
  'assets/js/inventory-sync.js',
  'assets/js/shipping-promo.js',
  'assets/js/reorder-init.js',
  'assets/js/order-tracker.js',
  'assets/js/cart.js',
  'assets/js/header-search.js',
  'assets/images/logo.png',
];
const STATIC_ASSETS = STATIC_PATHS.map((path) => new URL(path, SCOPE_ROOT).toString());

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => undefined))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames
        .filter((name) => name !== CACHE_NAME)
        .map((name) => caches.delete(name))
    ))
  );
  self.clients.claim();
});

function blockedBaserowResponse() {
  return new Response(JSON.stringify({ error: 'Direct Baserow access is blocked' }), {
    status: 403,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.hostname === 'api.baserow.io') {
    event.respondWith(Promise.resolve(blockedBaserowResponse()));
    return;
  }

  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    event.respondWith(fetch(request));
    return;
  }

  const scopePath = new URL('./', self.registration.scope).pathname;
  const isWithinScope = url.pathname.startsWith(scopePath);
  const isStatic = isWithinScope && (
    url.pathname.endsWith('/')
    || url.pathname.endsWith('.html')
    || url.pathname.includes('/assets/')
    || url.pathname.endsWith('/manifest.json')
  );

  if (!isStatic) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
