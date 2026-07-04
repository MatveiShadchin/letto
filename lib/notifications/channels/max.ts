import { messagingConfig } from '@/lib/notifications/config';
import { MessengerChannelAdapter } from '@/lib/notifications/channel-base';
import { ChannelSendResult, OutboundNotification } from '@/types/notification';

async function maxApi<T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const token = messagingConfig.max.botToken;
  const baseUrl = messagingConfig.max.apiBaseUrl.replace(/\/$/, '');

  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as { message?: string; error?: string; message_id?: string };

  if (!response.ok) {
    throw new Error(data.message || data.error || `MAX API error (${response.status})`);
  }

  return data as T;
}

export const maxChannel: MessengerChannelAdapter = {
  channel: 'max',

  isConfigured() {
    return Boolean(messagingConfig.max.botToken);
  },

  canDeliver(address: string) {
    return Boolean(address.trim());
  },

  async send(notification: OutboundNotification): Promise<ChannelSendResult> {
    const data = await maxApi<{ message_id?: string }>('/messages', {
      chat_id: notification.recipient.address,
      text: notification.text,
    });

    return {
      status: 'sent',
      providerMessageId: data.message_id,
    };
  },
};
