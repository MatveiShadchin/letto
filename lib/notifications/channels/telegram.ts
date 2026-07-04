import { messagingConfig } from '@/lib/notifications/config';
import { MessengerChannelAdapter } from '@/lib/notifications/channel-base';
import { ChannelSendResult, OutboundNotification } from '@/types/notification';

async function callTelegramApi<T>(method: string, body: Record<string, unknown>): Promise<T> {
  const token = messagingConfig.telegram.botToken;
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as { ok: boolean; description?: string; result?: { message_id?: number } };
  if (!response.ok || !data.ok) {
    throw new Error(data.description || `Telegram API error (${response.status})`);
  }

  return data as T;
}

export const telegramChannel: MessengerChannelAdapter = {
  channel: 'telegram',

  isConfigured() {
    return Boolean(messagingConfig.telegram.botToken);
  },

  canDeliver(address: string) {
    return Boolean(address.trim());
  },

  async send(notification: OutboundNotification): Promise<ChannelSendResult> {
    const data = await callTelegramApi<{ result?: { message_id?: number } }>('sendMessage', {
      chat_id: notification.recipient.address,
      text: notification.text,
    });

    return {
      status: 'sent',
      providerMessageId: data.result?.message_id?.toString(),
    };
  },
};

export async function setTelegramWebhook(publicBaseUrl: string): Promise<void> {
  if (!messagingConfig.telegram.botToken) return;

  const secret = messagingConfig.telegram.webhookSecret;
  const webhookUrl = `${publicBaseUrl.replace(/\/$/, '')}/api/webhooks/telegram`;

  await callTelegramApi('setWebhook', {
    url: webhookUrl,
    secret_token: secret || undefined,
    allowed_updates: ['message'],
  });
}
