import { hasDatabase, query } from '@/lib/db';
import {
  resendOrderCreatedToCustomer,
  saveMessengerLink,
} from '@/lib/notifications/dispatch';
import { normalizeOrderRow } from '@/lib/notifications/order-utils';
import { sendTelegramMessage } from '@/lib/notifications/telegram-api';
import {
  forwardCustomerMessageToSupportGroup,
  isSupportGroupChat,
  relaySupportGroupReplyToCustomer,
} from '@/lib/notifications/telegram-support';
import { TelegramUpdate } from '@/lib/notifications/telegram-types';

const ORDER_START_RE = /^\/start(?:@[\w_]+)?(?:\s+order_([0-9a-f-]{36}))?/i;

export type { TelegramUpdate } from '@/lib/notifications/telegram-types';

function isGroupChatId(chatId: number): boolean {
  return chatId < 0;
}

async function linkOrderTelegramChat(orderId: string, chatId: string): Promise<void> {
  if (!hasDatabase()) return;

  await query(`UPDATE orders SET telegram_chat_id = $2 WHERE id = $1`, [orderId, chatId]);
}

async function sendTelegramWelcome(chatId: string, text: string): Promise<void> {
  await sendTelegramMessage(chatId, text);
}

export async function processTelegramUpdate(update: TelegramUpdate): Promise<void> {
  const message = update.message;
  const chatId = message?.chat?.id;
  if (!chatId) return;

  if (isSupportGroupChat(chatId)) {
    await relaySupportGroupReplyToCustomer(update);
    return;
  }

  if (isGroupChatId(chatId)) {
    return;
  }

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
  if (startMatch) {
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
          try {
            await resendOrderCreatedToCustomer(order);
          } catch (error) {
            console.error('[telegram inbound] resend failed:', orderId, error);
          }
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
        'Напишите сюда любой вопрос по заказу — флорист ответит в этом чате.',
        '',
        'Если заказ уже оформлен на сайте — откройте ссылку «Получать статус в Telegram» из подтверждения.',
      ].join('\n')
    );
    return;
  }

  await forwardCustomerMessageToSupportGroup(update);
}

export async function processTelegramUpdates(updates: TelegramUpdate[]): Promise<number> {
  let maxUpdateId = 0;

  for (const update of updates) {
    if (typeof update.update_id === 'number') {
      maxUpdateId = Math.max(maxUpdateId, update.update_id);
    }

    try {
      await processTelegramUpdate(update);
    } catch (error) {
      console.error('[telegram inbound] update failed:', update.update_id, error);
    }
  }

  return maxUpdateId;
}
