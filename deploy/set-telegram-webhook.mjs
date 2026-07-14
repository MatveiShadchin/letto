#!/usr/bin/env node
/**
 * Установка Telegram webhook на HTTPS-домен (запускать НЕ с VPS в РФ —
 * api.telegram.org снаружи доступен нормально).
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN=... TELEGRAM_WEBHOOK_SECRET=... node deploy/set-telegram-webhook.mjs
 *   node deploy/set-telegram-webhook.mjs https://testletto.ru
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const baseUrl = (process.argv[2] || 'https://testletto.ru').replace(/\/$/, '');

function loadEnv() {
  try {
    const raw = readFileSync(join(__dirname, '..', '.env.local'), 'utf8');
    const env = {};
    for (const line of raw.split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) env[m[1].trim()] = m[2].trim();
    }
    return env;
  } catch {
    return {};
  }
}

const env = { ...loadEnv(), ...process.env };
const token = env.TELEGRAM_BOT_TOKEN;
const secret = env.TELEGRAM_WEBHOOK_SECRET;

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN не найден в .env.local или окружении');
  process.exit(1);
}

const webhookUrl = `${baseUrl}/api/webhooks/telegram`;
const body = {
  url: webhookUrl,
  allowed_updates: ['message'],
  drop_pending_updates: true,
};
if (secret) body.secret_token = secret;

const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
const data = await res.json();
console.log(JSON.stringify(data, null, 2));

if (!data.ok) process.exit(1);

const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
const info = await infoRes.json();
console.log('Webhook info:', JSON.stringify(info.result, null, 2));
console.log(`OK → ${webhookUrl}`);
