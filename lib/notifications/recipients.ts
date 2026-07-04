import { Order } from '@/types/order';
import {
  NotificationRecipient,
  NotifyAudience,
  NotifyChannel,
  OrderMessengerContact,
} from '@/types/notification';

function recipientForChannel(
  channel: NotifyChannel,
  contact: OrderMessengerContact & { phone?: string }
): NotificationRecipient | null {
  switch (channel) {
    case 'telegram':
      return contact.telegram_chat_id
        ? { channel, address: contact.telegram_chat_id }
        : null;
    case 'vk':
      return contact.vk_user_id ? { channel, address: contact.vk_user_id } : null;
    case 'whatsapp':
      return contact.whatsapp_phone || contact.phone
        ? { channel, address: (contact.whatsapp_phone || contact.phone)! }
        : null;
    case 'max':
      return contact.max_chat_id ? { channel, address: contact.max_chat_id } : null;
    default:
      return null;
  }
}

export function resolveCustomerRecipients(order: Order): NotificationRecipient[] {
  const channels: NotifyChannel[] = order.preferred_notify_channel
    ? [order.preferred_notify_channel]
    : ['telegram', 'vk', 'whatsapp', 'max'];

  const recipients: NotificationRecipient[] = [];

  for (const channel of channels) {
    const recipient = recipientForChannel(channel, order);
    if (recipient) {
      recipients.push(recipient);
    }
  }

  return recipients;
}

export function resolveAdminRecipients(): NotificationRecipient[] {
  const recipients: NotificationRecipient[] = [];
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();

  if (adminChatId) {
    recipients.push({ channel: 'telegram', address: adminChatId });
  }

  return recipients;
}

export function pickAudienceRecipients(
  order: Order,
  audience: NotifyAudience
): NotificationRecipient[] {
  return audience === 'admin' ? resolveAdminRecipients() : resolveCustomerRecipients(order);
}

export function parseMessengerContactFromBody(
  body: Record<string, unknown>
): OrderMessengerContact {
  const channel = body.preferred_notify_channel;
  const validChannel =
    channel === 'telegram' ||
    channel === 'vk' ||
    channel === 'whatsapp' ||
    channel === 'max'
      ? channel
      : null;

  return {
    preferred_notify_channel: validChannel,
    telegram_chat_id:
      typeof body.telegram_chat_id === 'string' ? body.telegram_chat_id.trim() || null : null,
    vk_user_id: typeof body.vk_user_id === 'string' ? body.vk_user_id.trim() || null : null,
    whatsapp_phone:
      typeof body.whatsapp_phone === 'string' ? body.whatsapp_phone.trim() || null : null,
    max_chat_id: typeof body.max_chat_id === 'string' ? body.max_chat_id.trim() || null : null,
  };
}
