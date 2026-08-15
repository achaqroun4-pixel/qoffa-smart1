/* Qoffa clean URL helper. Works on a custom domain and a GitHub Pages project path. */
(function installQoffaRoute() {
  'use strict';

  const knownPages = new Set([
    'products',
    'product-detail',
    'bundles',
    'order',
    'about',
    'contact',
    'terms',
    'return-policy',
  ]);

  function siteBasePath() {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.length && knownPages.has(segments[segments.length - 1])) {
      segments.pop();
    }
    return `/${segments.length ? `${segments.join('/')}/` : ''}`;
  }

  window.QoffaRoute = function qoffaRoute(page = 'home', query = '') {
    const base = siteBasePath();
    const suffix = query ? (String(query).startsWith('?') || String(query).startsWith('#') ? String(query) : `?${query}`) : '';
    if (!page || page === 'home' || page === 'index') return `${base}${suffix}`;
    return `${base}${String(page).replace(/^\/+|\/+$/g, '')}/${suffix}`;
  };

  window.QoffaAsset = function qoffaAsset(path) {
    const cleanPath = String(path || '').replace(/^\/+/, '');
    return `${siteBasePath()}${cleanPath}`;
  };
})();
