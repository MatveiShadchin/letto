import { getPublicSiteUrl } from '@/lib/site-url';
import { sendVkMessage } from '@/lib/notifications/channels/vk';
import { saveMessengerLink } from '@/lib/notifications/dispatch';
import { normalizeOrderRow } from '@/lib/notifications/order-utils';
import { buildNotificationText } from '@/lib/notifications/templates';
import { Order } from '@/types/order';

const PHONE_PATTERN = /(?:\+7|8)[\s(-]*\d{3}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/;

function normalizePhoneDigits(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`;
  }
  if (digits.length === 10) {
    digits = `7${digits}`;
  }
  return digits;
}

function extractPhone(text: string): string | null {
  const match = text.match(PHONE_PATTERN);
  if (!match) return null;
  const normalized = normalizePhoneDigits(match[0]);
  return normalized.length >= 11 ? normalized : null;
}

function phoneLast10(phone: string): string {
  return normalizePhoneDigits(phone).slice(-10);
}

export async function linkVkUserToOrdersByPhone(
  vkUserId: string,
  phone: string
): Promise<Order[]> {
  if (!hasDatabase()) return [];

  const last10 = phoneLast10(phone);

  const { rows } = await query(
    `UPDATE orders
     SET vk_user_id = $1,
         preferred_notify_channel = COALESCE(preferred_notify_channel, 'vk')
     WHERE right(regexp_replace(phone, '\\D', '', 'g'), 10) = $2
       AND created_at > NOW() - INTERVAL '60 days'
     RETURNING *`,
    [vkUserId, last10]
  );

  await saveMessengerLink({
    channel: 'vk',
    externalId: vkUserId,
    phone,
    metadata: { linkedBy: 'phone' },
  });

  return rows.map((row) => normalizeOrderRow(row as Record<string, unknown>));
}

export async function handleVkInboundMessage(input: {
  userId: number;
  text: string;
  firstName?: string | null;
}): Promise<void> {
  const vkUserId = String(input.userId);
  const text = input.text.trim();
  const lower = text.toLowerCase();

  await saveMessengerLink({
    channel: 'vk',
    externalId: vkUserId,
    customerName: input.firstName ?? null,
    metadata: { lastText: text || null },
  });

  if (!text) {
    await sendVkMessage(
      vkUserId,
      'Здравствуйте! Это LETTO 🌸\n\nОтправьте номер телефона с заказа — привяжем чат и будем присылать статус.'
    );
    return;
  }

  const phone = extractPhone(text);
  if (phone) {
    const linked = await linkVkUserToOrdersByPhone(vkUserId, phone);
    if (linked.length === 0) {
      await sendVkMessage(
        vkUserId,
        `Заказ с таким телефоном не найден. Оформите заказ на сайте или проверьте номер.\n\nСайт: ${getPublicSiteUrl()}`
      );
      return;
    }

    await sendVkMessage(vkUserId, buildNotificationText('order_created', linked[0]));
    return;
  }

  if (lower === 'start' || lower === 'начать' || lower.includes('привет') || lower.includes('здравств')) {
    await sendVkMessage(
      vkUserId,
      'Здравствуйте! Это цветочный магазин LETTO 🌸\n\nЧтобы получать статус заказа здесь, отправьте номер телефона, который указывали при оформлении на сайте.'
    );
    return;
  }

  if (lower.includes('статус') || lower.includes('заказ')) {
    if (!hasDatabase()) {
      await sendVkMessage(vkUserId, 'Сервис временно недоступен. Попробуйте позже.');
      return;
    }

    const { rows } = await query(
      `SELECT * FROM orders
       WHERE vk_user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [vkUserId]
    );

    if (rows[0]) {
      const order = normalizeOrderRow(rows[0] as Record<string, unknown>);
      await sendVkMessage(vkUserId, buildNotificationText('order_status_changed', order));
      return;
    }

    await sendVkMessage(
      vkUserId,
      'Пока нет привязанных заказов. Отправьте номер телефона с сайта — мы найдём заказ и подключим уведомления.'
    );
    return;
  }

  await sendVkMessage(
    vkUserId,
    'Спасибо за сообщение! Отправьте номер телефона с заказа — подключим уведомления о статусе.\n\nИли напишите «статус», если заказ уже привязан.'
  );
}
