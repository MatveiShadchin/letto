import { messagingConfig } from '@/lib/notifications/config';
import { MessengerChannelAdapter } from '@/lib/notifications/channel-base';
import {
  callTelegramApi,
  normalizeTelegramChatId,
} from '@/lib/notifications/telegram-api';
import { ChannelSendResult, OutboundNotification } from '@/types/notification';

export { normalizeTelegramChatId, sendTelegramMessage } from '@/lib/notifications/telegram-api';

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
      chat_id: normalizeTelegramChatId(notification.recipient.address),
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
