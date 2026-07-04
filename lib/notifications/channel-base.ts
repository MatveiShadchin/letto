import { hasDatabase, query } from '@/lib/db';
import {
  ChannelSendResult,
  NotifyAudience,
  NotifyChannel,
  NotifyEvent,
  OutboundNotification,
} from '@/types/notification';

export interface MessengerChannelAdapter {
  channel: NotifyChannel;
  isConfigured(): boolean;
  canDeliver(address: string): boolean;
  send(notification: OutboundNotification): Promise<ChannelSendResult>;
}

export async function logNotification(
  notification: OutboundNotification,
  result: ChannelSendResult
): Promise<void> {
  if (!hasDatabase()) {
    console.info('[notification]', {
      channel: notification.recipient.channel,
      event: notification.event,
      audience: notification.audience,
      status: result.status,
      error: result.error,
    });
    return;
  }

  try {
    await query(
      `INSERT INTO notification_log (
        order_id, channel, event, audience, recipient, status, error, payload
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
      [
        notification.orderId ?? null,
        notification.recipient.channel,
        notification.event,
        notification.audience,
        notification.recipient.address,
        result.status,
        result.error ?? null,
        JSON.stringify({ text: notification.text }),
      ]
    );
  } catch (error) {
    console.error('notification_log insert failed:', error);
  }
}

export async function sendViaChannel(
  adapter: MessengerChannelAdapter,
  notification: OutboundNotification
): Promise<ChannelSendResult> {
  if (!adapter.isConfigured()) {
    return {
      status: 'skipped',
      error: `${adapter.channel}: канал не настроен (нет токена в .env.local)`,
    };
  }

  if (!adapter.canDeliver(notification.recipient.address)) {
    return {
      status: 'skipped',
      error: `${adapter.channel}: нет адреса получателя`,
    };
  }

  try {
    const result = await adapter.send(notification);
    await logNotification(notification, result);
    return result;
  } catch (error) {
    const failed: ChannelSendResult = {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка отправки',
    };
    await logNotification(notification, failed);
    return failed;
  }
}
