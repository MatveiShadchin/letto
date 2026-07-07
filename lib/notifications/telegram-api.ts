import { messagingConfig } from '@/lib/notifications/config';
import { relayTelegramViaGithub } from '@/lib/notifications/telegram-relay';

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

export interface TelegramSendResult {
  message_id?: number;
}

export async function callTelegramApi<T>(
  method: string,
  body: Record<string, unknown>
): Promise<T> {
  try {
    const response = await fetch(getTelegramApiUrl(method), {
      method: 'POST',
      headers: getTelegramApiHeaders(),
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as {
      ok: boolean;
      description?: string;
      result?: TelegramSendResult;
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

    const chatId = body.chat_id;
    const text = body.text;
    if (
      isNetworkError &&
      method === 'sendMessage' &&
      (typeof chatId === 'string' || typeof chatId === 'number') &&
      typeof text === 'string'
    ) {
      try {
        const relayed = await relayTelegramViaGithub(
          [{ chat_id: String(chatId), text }],
          messagingConfig.telegram.botToken
        );
        if (relayed) {
          return { ok: true, result: {} } as T;
        }
      } catch (relayError) {
        const relayMessage =
          relayError instanceof Error ? relayError.message : String(relayError);
        throw new Error(`${message}; relay: ${relayMessage}`);
      }
    }

    throw error;
  }
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options?: { replyToMessageId?: number }
): Promise<TelegramSendResult | undefined> {
  const data = await callTelegramApi<{ result?: TelegramSendResult }>('sendMessage', {
    chat_id: chatId,
    text,
    reply_to_message_id: options?.replyToMessageId,
  });
  return data.result;
}
