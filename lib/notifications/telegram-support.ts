import { hasDatabase, query } from '@/lib/db';
import { messagingConfig } from '@/lib/notifications/config';
import { sendTelegramMessage } from '@/lib/notifications/telegram-api';
import { TelegramUpdate } from '@/lib/notifications/telegram-types';

const ORDER_START_RE = /^\/start(?:@[\w_]+)?(?:\s+order_([0-9a-f-]{36}))?/i;

export function getSupportGroupId(): string | null {
  return (
    messagingConfig.telegram.supportGroupId?.trim() ||
    messagingConfig.telegram.adminChatId?.trim() ||
    null
  );
}

export function isSupportGroupConfigured(): boolean {
  return Boolean(getSupportGroupId() && messagingConfig.telegram.botToken);
}

function isGroupChatId(chatId: number): boolean {
  return chatId < 0;
}

export function isSupportGroupChat(chatId: number): boolean {
  const groupId = getSupportGroupId();
  if (!groupId) return false;
  return String(chatId) === groupId;
}

async function findLatestOrderForCustomer(customerChatId: string): Promise<{
  id: string;
  customer_name: string;
} | null> {
  if (!hasDatabase()) return null;

  const { rows } = await query<{ id: string; customer_name: string }>(
    `SELECT id, customer_name
     FROM orders
     WHERE telegram_chat_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [customerChatId]
  );

  return rows[0] ?? null;
}

async function saveRelayMapping(input: {
  groupChatId: string;
  groupMessageId: number;
  customerChatId: string;
  orderId?: string | null;
  customerName?: string | null;
}): Promise<void> {
  if (!hasDatabase()) return;

  await query(
    `INSERT INTO telegram_support_relay (
      group_chat_id, group_message_id, customer_chat_id, order_id, customer_name
    ) VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (group_chat_id, group_message_id) DO NOTHING`,
    [
      input.groupChatId,
      input.groupMessageId,
      input.customerChatId,
      input.orderId ?? null,
      input.customerName ?? null,
    ]
  );
}

async function findCustomerByGroupReply(
  groupChatId: string,
  replyToMessageId: number
): Promise<{ customer_chat_id: string; customer_name: string | null } | null> {
  if (!hasDatabase()) return null;

  const { rows } = await query<{ customer_chat_id: string; customer_name: string | null }>(
    `SELECT customer_chat_id, customer_name
     FROM telegram_support_relay
     WHERE group_chat_id = $1 AND group_message_id = $2
     LIMIT 1`,
    [groupChatId, replyToMessageId]
  );

  return rows[0] ?? null;
}

function formatCustomerHeader(input: {
  customerName?: string | null;
  username?: string | null;
  customerChatId: string;
  orderId?: string | null;
}): string {
  const name = input.customerName?.trim() || 'Клиент';
  const username = input.username ? `@${input.username.replace(/^@/, '')}` : null;
  const orderLine = input.orderId ? `📦 Заказ №${input.orderId.slice(0, 8)}` : '📦 Заказ не привязан';

  return [
    `💬 ${name}${username ? ` (${username})` : ''}`,
    orderLine,
    `🆔 chat: ${input.customerChatId}`,
    '─────────────',
  ].join('\n');
}

export async function forwardCustomerMessageToSupportGroup(
  update: TelegramUpdate
): Promise<boolean> {
  const groupId = getSupportGroupId();
  const message = update.message;
  const customerChatId = message?.chat?.id;
  const text = typeof message?.text === 'string' ? message.text.trim() : '';

  if (!groupId || !customerChatId || isGroupChatId(customerChatId) || !text) {
    return false;
  }

  if (ORDER_START_RE.test(text)) {
    return false;
  }

  const from = message?.from;
  if (from?.is_bot) {
    return false;
  }

  const order = await findLatestOrderForCustomer(String(customerChatId));
  const header = formatCustomerHeader({
    customerName: from?.first_name ?? order?.customer_name ?? null,
    username: from?.username ?? null,
    customerChatId: String(customerChatId),
    orderId: order?.id ?? null,
  });

  const groupText = `${header}\n${text}\n\n↩️ Ответьте реплаем на это сообщение — клиент получит ответ от LETTO.`;

  const sent = await sendTelegramMessage(groupId, groupText);
  if (!sent?.message_id) {
    return false;
  }

  await saveRelayMapping({
    groupChatId: groupId,
    groupMessageId: sent.message_id,
    customerChatId: String(customerChatId),
    orderId: order?.id ?? null,
    customerName: from?.first_name ?? order?.customer_name ?? null,
  });

  await sendTelegramMessage(
    customerChatId,
    '🌸 Сообщение передано флористу. Ответим здесь в ближайшее время.'
  );

  return true;
}

export async function relaySupportGroupReplyToCustomer(
  update: TelegramUpdate
): Promise<boolean> {
  const message = update.message;
  const groupChatId = message?.chat?.id;
  const replyTo = message?.reply_to_message;
  const text = typeof message?.text === 'string' ? message.text.trim() : '';

  if (!groupChatId || !isSupportGroupChat(groupChatId) || !replyTo?.message_id || !text) {
    return false;
  }

  if (message?.from?.is_bot) {
    return false;
  }

  if (text.startsWith('/')) {
    return false;
  }

  const mapping = await findCustomerByGroupReply(String(groupChatId), replyTo.message_id);
  if (!mapping) {
    await sendTelegramMessage(
      groupChatId,
      '⚠️ Не найден клиент для этого реплая. Ответьте именно на сообщение с текстом клиента (блок 💬).'
    );
    return false;
  }

  await sendTelegramMessage(
    mapping.customer_chat_id,
    `🌸 LETTO:\n\n${text}`
  );

  await sendTelegramMessage(
    groupChatId,
    `✅ Отправлено клиенту${mapping.customer_name ? ` (${mapping.customer_name})` : ''}.`,
    { replyToMessageId: message.message_id }
  );

  return true;
}
