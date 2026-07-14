/**
 * Cloudflare Worker — ПРИЁМ webhook от Telegram (вне РФ) и прокси на LETTO.
 * Решает таймаут: Telegram → VPS в РФ.
 *
 * Деплой:
 *   cd deploy/telegram-webhook-proxy
 *   npx wrangler secret put WEBHOOK_SECRET   # = TELEGRAM_WEBHOOK_SECRET
 *   npx wrangler deploy
 * Затем:
 *   node deploy/set-telegram-webhook.mjs https://<worker>.workers.dev
 */
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('OK', { status: 200 });
    }

    const secret = env.WEBHOOK_SECRET || '';
    const header = request.headers.get('X-Telegram-Bot-Api-Secret-Token') || '';
    if (secret && header !== secret) {
      return new Response('Forbidden', { status: 403 });
    }

    const target = (env.LETTO_WEBHOOK_URL || 'https://testletto.ru/api/webhooks/telegram').replace(
      /\/$/,
      ''
    );

    try {
      const body = await request.arrayBuffer();
      const res = await fetch(target, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Bot-Api-Secret-Token': header || secret,
        },
        body,
      });
      // Telegram требует быстрый 200 — не ждём обработку ошибок LETTO
      if (!res.ok) {
        console.error('upstream', res.status, await res.text());
      }
    } catch (error) {
      console.error('forward failed', error);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
