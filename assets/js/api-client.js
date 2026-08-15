/* Qoffa Secure API Client
 * The browser never receives a Baserow token.
 * Set window.QOFFA_API_BASE to the deployed backend origin before publishing.
 */
(function installSecureApiClient() {
  'use strict';

  const originalFetch = window.fetch.bind(window);
  const apiBase = String(window.QOFFA_API_BASE || '').replace(/\/$/, '');
  const baserowHostnames = new Set(['api.baserow.io']);

  function getUrl(input) {
    if (typeof input === 'string' || input instanceof URL) {
      return new URL(String(input), window.location.href);
    }
    if (input && input.url) return new URL(input.url, window.location.href);
    return null;
  }

  function cloneWithoutSecrets(init) {
    const next = { ...(init || {}) };
    const headers = new Headers(next.headers || {});
    headers.delete('authorization');
    headers.delete('x-api-key');
    headers.delete('x-baserow-token');
    next.headers = headers;
    return next;
  }

  function backendUrl(path, search = '') {
    const base = apiBase || '';
    return `${base}${path}${search}`;
  }

  function mapBaserowRequest(url, init) {
    const match = url.pathname.match(/\/api\/database\/rows\/table\/(\d+)(?:\/(\d+))?/);
    if (!match) return null;

    const tableId = match[1];
    const rowId = match[2];
    const method = String((init && init.method) || 'GET').toUpperCase();
    const search = url.search || '';

    if (tableId === '882093') {
      if (method === 'GET') {
        return backendUrl(rowId ? `/api/products/${encodeURIComponent(rowId)}` : '/api/products', search);
      }
      if (method === 'PATCH' && rowId) {
        return backendUrl(`/api/products/${encodeURIComponent(rowId)}/weights`, '');
      }
    }

    if (tableId === '852045' && method === 'POST') return backendUrl('/api/orders', '');
    if (tableId === '852927' && method === 'POST') return backendUrl('/api/sold-products', '');
    if (tableId === '908045' && method === 'POST') return backendUrl('/api/contact', '');
    if ((tableId === '887021' || tableId === '1062179') && method === 'GET') return backendUrl('/api/banners', search);
    if (tableId === '887021' && method === 'POST') return backendUrl('/api/contact-legacy', '');

    if (method === 'GET') {
      return backendUrl(`/api/public-table/${encodeURIComponent(tableId)}`, search);
    }

    return null;
  }

  window.fetch = function secureFetch(input, init) {
    const url = getUrl(input);
    if (!url || !baserowHostnames.has(url.hostname)) {
      return originalFetch(input, init);
    }

    const mappedUrl = mapBaserowRequest(url, init);
    if (!mappedUrl) {
      return Promise.reject(new Error('Blocked unsupported direct Baserow request'));
    }

    if (!apiBase) {
      console.error('[Qoffa security] Backend URL is not configured. Set window.QOFFA_API_BASE.');
    }

    return originalFetch(mappedUrl, cloneWithoutSecrets(init));
  };

  window.QoffaSecureApi = Object.freeze({
    baseUrl: apiBase,
    request(path, init) {
      return originalFetch(backendUrl(path), cloneWithoutSecrets(init));
    }
  });
})();
