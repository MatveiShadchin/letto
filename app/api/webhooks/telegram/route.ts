import { NextRequest, NextResponse } from 'next/server';
import { messagingConfig } from '@/lib/notifications/config';
import { saveMessengerLink } from '@/lib/notifications/dispatch';

function verifySecret(request: NextRequest): boolean {
  const secret = messagingConfig.telegram.webhookSecret;
  if (!secret) return true;
  return request.headers.get('x-telegram-bot-api-secret-token') === secret;
}

export async function POST(request: NextRequest) {
  if (!verifySecret(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const update = await request.json();
    const message = update?.message;
    const chatId = message?.chat?.id;
    const text = typeof message?.text === 'string' ? message.text.trim() : '';
    const phone = message?.contact?.phone_number as string | undefined;

    if (chatId) {
      await saveMessengerLink({
        channel: 'telegram',
        externalId: String(chatId),
        phone: phone ?? null,
        customerName: message?.from?.first_name ?? null,
        metadata: {
          username: message?.from?.username ?? null,
          lastText: text || null,
        },
      });
    }

    // /start order_<uuid> — привязка чата к заказу (следующий этап)
    if (text.startsWith('/start') && chatId) {
      console.info('[telegram webhook] start', { chatId, text });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/webhooks/telegram:', error);
    return NextResponse.json({ ok: true });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
