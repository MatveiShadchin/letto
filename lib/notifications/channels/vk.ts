import { messagingConfig } from '@/lib/notifications/config';
import { MessengerChannelAdapter } from '@/lib/notifications/channel-base';
import { ChannelSendResult, OutboundNotification } from '@/types/notification';

interface VkApiResponse<T> {
  error?: { error_code?: number; error_msg?: string };
  response?: T;
}

async function vkApi<T>(
  method: string,
  params: Record<string, string | number>
): Promise<T> {
  const token = messagingConfig.vk.groupToken;
  if (!token) {
    throw new Error('VK_GROUP_TOKEN не задан');
  }

  const body = new URLSearchParams({
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    access_token: token,
    v: '5.199',
  });

  const response = await fetch(`https://api.vk.com/method/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = (await response.json()) as VkApiResponse<T>;

  if (!response.ok || data.error) {
    throw new Error(data.error?.error_msg || `VK API error (${response.status})`);
  }

  return data.response as T;
}

export async function sendVkMessage(
  userId: string | number,
  message: string
): Promise<{ message_id?: number }> {
  return vkApi<{ message_id?: number }>('messages.send', {
    user_id: userId,
    random_id: Math.floor(Math.random() * 2_000_000_000),
    message,
  });
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
    const response = await sendVkMessage(
      notification.recipient.address,
      notification.text
    );

    return {
      status: 'sent',
      providerMessageId: response?.message_id?.toString(),
    };
  },
};
