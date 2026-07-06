import { messagingConfig } from '@/lib/notifications/config';
import { MessengerChannelAdapter } from '@/lib/notifications/channel-base';
import { relayTelegramViaGithub } from '@/lib/notifications/telegram-relay';
import { ChannelSendResult, OutboundNotification } from '@/types/notification';

export function normalizeTelegramChatId(address: string): string {
  const trimmed = address.trim();
  if (!trimmed) return trimmed;
  if (/^-?\d+$/.test(trimmed)) return trimmed;
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

function getTelegramApiUrl(method: string): string {
  const token = messagingConfig.telegram.botToken;
  const base = messagingConfig.telegram.apiBaseUrl.replace(/\/$/, '');
  return `${base}/bot${token}/${method}`;
}

function getTelegramApiHeaders(): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const proxyKey = messagingConfig.telegram.proxyKey;
  if (proxyKey) {
    headers['X-Letto-Tg-Proxy-Key'] = proxyKey;
  }
  return headers;
}

async function callTelegramApi<T>(method: string, body: Record<string, unknown>): Promise<T> {
  try {
    const response = await fetch(getTelegramApiUrl(method), {
      method: 'POST',
      headers: getTelegramApiHeaders(),
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as {
      ok: boolean;
      description?: string;
      result?: { message_id?: number };
    };
    if (!response.ok || !data.ok) {
      throw new Error(data.description || `Telegram API error (${response.status})`);
    }

    return data as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isNetworkError =
      message.includes('fetch failed') ||
      message.includes('ETIMEDOUT') ||
      message.includes('ENETUNREACH');

    if (
      isNetworkError &&
      method === 'sendMessage' &&
      typeof body.chat_id === 'string' &&
      typeof body.text === 'string'
    ) {
      const relayed = await relayTelegramViaGithub(
        [{ chat_id: body.chat_id, text: body.text }],
        messagingConfig.telegram.botToken
      );
      if (relayed) {
        return { ok: true, result: {} } as T;
      }
    }

    throw error;
  }
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
