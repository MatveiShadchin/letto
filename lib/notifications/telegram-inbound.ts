import { hasDatabase, query } from '@/lib/db';
import {
  resendOrderCreatedToCustomer,
  saveMessengerLink,
} from '@/lib/notifications/dispatch';
import { normalizeOrderRow } from '@/lib/notifications/order-utils';
import { messagingConfig } from '@/lib/notifications/config';
import { relayTelegramViaGithub } from '@/lib/notifications/telegram-relay';

const ORDER_START_RE = /^\/start(?:@[\w_]+)?(?:\s+order_([0-9a-f-]{36}))?/i;

export interface TelegramUpdate {
  update_id?: number;
  message?: {
    message_id?: number;
    text?: string;
    chat?: { id?: number };
    from?: { id?: number; first_name?: string; username?: string };
    contact?: { phone_number?: string };
  };
}

async function sendTelegramWelcome(chatId: string, text: string): Promise<void> {
  const token = messagingConfig.telegram.botToken;
  if (!token) return;

  try {
    const response = await fetch(
      `${messagingConfig.telegram.apiBaseUrl.replace(/\/$/, '')}/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
      }
    );
    const data = (await response.json()) as { ok?: boolean };
    if (data.ok) return;
  } catch {
    // VPS may block api.telegram.org — relay from abroad
  }

  await relayTelegramViaGithub([{ chat_id: chatId, text }], token);
}

async function linkOrderTelegramChat(orderId: string, chatId: string): Promise<void> {
  if (!hasDatabase()) return;

  await query(`UPDATE orders SET telegram_chat_id = $2 WHERE id = $1`, [orderId, chatId]);
}

export async function processTelegramUpdate(update: TelegramUpdate): Promise<void> {
  const message = update.message;
  const chatId = message?.chat?.id;
  if (!chatId) return;

  const text = typeof message?.text === 'string' ? message.text.trim() : '';
  const phone = message?.contact?.phone_number;
  const username = message?.from?.username ?? null;

  await saveMessengerLink({
    channel: 'telegram',
    externalId: String(chatId),
    phone: phone ?? null,
    customerName: message?.from?.first_name ?? null,
    metadata: {
      username,
      lastText: text || null,
    },
  });

  const startMatch = text.match(ORDER_START_RE);
  if (!startMatch) return;

  const orderId = startMatch[1];
  const chatIdStr = String(chatId);

  if (orderId) {
    await linkOrderTelegramChat(orderId, chatIdStr);

    if (hasDatabase()) {
      const { rows } = await query<Record<string, unknown>>(
        `SELECT * FROM orders WHERE id = $1 LIMIT 1`,
        [orderId]
      );
      if (rows[0]) {
        const order = normalizeOrderRow(rows[0]);
        order.telegram_chat_id = chatIdStr;
        await resendOrderCreatedToCustomer(order);
        return;
      }
    }

    console.warn('[telegram inbound] order not found for resend', { orderId });
    return;
  }

  await sendTelegramWelcome(
    chatIdStr,
    [
      '🌸 LETTO — цветочный магазин',
      '',
      'Чтобы получать статус заказа в Telegram, оформите заказ на сайте и нажмите кнопку «Получать статус в Telegram».',
      '',
      'Если заказ уже оформлен — откройте ссылку из подтверждения на сайте (она содержит номер заказа).',
    ].join('\n')
  );
}

export async function processTelegramUpdates(updates: TelegramUpdate[]): Promise<number> {
  let maxUpdateId = 0;

  for (const update of updates) {
    if (typeof update.update_id === 'number') {
      maxUpdateId = Math.max(maxUpdateId, update.update_id);
    }
    await processTelegramUpdate(update);
  }

  return maxUpdateId;
}
