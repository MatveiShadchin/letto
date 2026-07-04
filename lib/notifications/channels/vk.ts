import { messagingConfig } from '@/lib/notifications/config';
import { MessengerChannelAdapter } from '@/lib/notifications/channel-base';
import { ChannelSendResult, OutboundNotification } from '@/types/notification';

async function vkApi<T>(method: string, params: Record<string, string | number>): Promise<T> {
  const token = messagingConfig.vk.groupToken;
  const search = new URLSearchParams({
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    access_token: token,
    v: '5.199',
  });

  const response = await fetch(`https://api.vk.com/method/${method}?${search.toString()}`);
  const data = (await response.json()) as { error?: { error_msg?: string }; response?: T };

  if (!response.ok || data.error) {
    throw new Error(data.error?.error_msg || `VK API error (${response.status})`);
  }

  return data.response as T;
}

export const vkChannel: MessengerChannelAdapter = {
  channel: 'vk',

  isConfigured() {
    return Boolean(messagingConfig.vk.groupToken);
  },

  canDeliver(address: string) {
    return /^\d+$/.test(address.trim());
  },

  async send(notification: OutboundNotification): Promise<ChannelSendResult> {
    const response = await vkApi<{ message_id?: number }>('messages.send', {
      user_id: notification.recipient.address,
      random_id: Date.now(),
      message: notification.text,
    });

    return {
      status: 'sent',
      providerMessageId: response?.message_id?.toString(),
    };
  },
};
