/**
 * Cloudflare Worker — прокси к api.telegram.org для VPS в РФ.
 * Деплой: npx wrangler deploy (из папки deploy/telegram-proxy)
 */
export default {
  async fetch(request, env) {
    const expectedKey = env.PROXY_KEY || '';
    if (expectedKey && request.headers.get('X-Letto-Tg-Proxy-Key') !== expectedKey) {
      return new Response('Forbidden', { status: 403 });
    }

    const url = new URL(request.url);
    if (!url.pathname.startsWith('/bot')) {
      return new Response('Not found', { status: 404 });
    }

    const target = `https://api.telegram.org${url.pathname}${url.search}`;
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('X-Letto-Tg-Proxy-Key');

    const init = {
      method: request.method,
      headers,
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = request.body;
    }

    return fetch(target, init);
  },
};
