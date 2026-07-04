import { hasDatabase, query } from '@/lib/db';
import { MessengerChannelAdapter, sendViaChannel } from '@/lib/notifications/channel-base';
import { maxChannel } from '@/lib/notifications/channels/max';
import { telegramChannel } from '@/lib/notifications/channels/telegram';
import { vkChannel } from '@/lib/notifications/channels/vk';
import { whatsappChannel } from '@/lib/notifications/channels/whatsapp';
import { pickAudienceRecipients } from '@/lib/notifications/recipients';
import { buildNotificationText } from '@/lib/notifications/templates';
import { Order } from '@/types/order';
import {
  ChannelSendResult,
  NotifyAudience,
  NotifyChannel,
  NotifyEvent,
  OutboundNotification,
} from '@/types/notification';

const channelAdapters: Record<NotifyChannel, MessengerChannelAdapter> = {
  telegram: telegramChannel,
  vk: vkChannel,
  whatsapp: whatsappChannel,
  max: maxChannel,
};

export interface DispatchSummary {
  event: NotifyEvent;
  audience: NotifyAudience;
  results: Array<ChannelSendResult & { channel: NotifyChannel; address: string }>;
}

async function dispatchToRecipients(
  order: Order,
  event: NotifyEvent,
  audience: NotifyAudience
): Promise<DispatchSummary> {
  const text = buildNotificationText(event, order);
  const recipients = pickAudienceRecipients(order, audience);
  const results: DispatchSummary['results'] = [];

  for (const recipient of recipients) {
    const adapter = channelAdapters[recipient.channel];
    const notification: OutboundNotification = {
      event,
      audience,
      orderId: order.id,
      text,
      recipient,
    };

    const result = await sendViaChannel(adapter, notification);
    results.push({ ...result, channel: recipient.channel, address: recipient.address });
  }

  if (recipients.length === 0) {
    console.info(`[notifications] ${event}/${audience}: нет получателей для заказа ${order.id}`);
  }

  return { event, audience, results };
}

export async function notifyOrderCreated(order: Order): Promise<DispatchSummary[]> {
  return Promise.all([
    dispatchToRecipients(order, 'order_created', 'customer'),
    dispatchToRecipients(order, 'order_admin_alert', 'admin'),
  ]);
}

export async function notifyOrderStatusChanged(
  order: Order,
  previousStatus?: Order['status']
): Promise<DispatchSummary[]> {
  if (previousStatus === order.status) {
    return [];
  }

  return [await dispatchToRecipients(order, 'order_status_changed', 'customer')];
}

export async function saveMessengerLink(input: {
  channel: NotifyChannel;
  externalId: string;
  phone?: string | null;
  customerName?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (!hasDatabase()) return;

  await query(
    `INSERT INTO messenger_links (channel, external_id, phone, customer_name, metadata)
     VALUES ($1, $2, $3, $4, $5::jsonb)
     ON CONFLICT (channel, external_id)
     DO UPDATE SET
       phone = COALESCE(EXCLUDED.phone, messenger_links.phone),
       customer_name = COALESCE(EXCLUDED.customer_name, messenger_links.customer_name),
       metadata = messenger_links.metadata || EXCLUDED.metadata,
       linked_at = NOW()`,
    [
      input.channel,
      input.externalId,
      input.phone ?? null,
      input.customerName ?? null,
      JSON.stringify(input.metadata ?? {}),
    ]
  );
}

export async function findMessengerLinksByPhone(phone: string) {
  if (!hasDatabase()) return [];

  const normalized = phone.replace(/\D/g, '');
  const { rows } = await query<{
    channel: NotifyChannel;
    external_id: string;
    phone: string | null;
    customer_name: string | null;
    metadata: Record<string, unknown>;
  }>(
    `SELECT channel, external_id, phone, customer_name, metadata
     FROM messenger_links
     WHERE regexp_replace(COALESCE(phone, ''), '\\D', '', 'g') = $1`,
    [normalized]
  );

  return rows;
}
