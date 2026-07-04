import { NextRequest, NextResponse } from 'next/server';
import { messagingConfig } from '@/lib/notifications/config';
import { saveMessengerLink } from '@/lib/notifications/dispatch';

function verifySecret(request: NextRequest): boolean {
  const secret = messagingConfig.max.webhookSecret;
  if (!secret) return true;
  return request.headers.get('x-max-bot-api-secret') === secret;
}

export async function POST(request: NextRequest) {
  if (!verifySecret(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const update = await request.json();
    const message = update?.message ?? update?.payload?.message;
    const chatId = message?.chat_id ?? update?.chat_id;
    const text = typeof message?.text === 'string' ? message.text : '';
    const user = message?.sender ?? update?.user;

    if (chatId) {
      await saveMessengerLink({
        channel: 'max',
        externalId: String(chatId),
        phone: user?.phone ?? null,
        customerName: user?.name ?? user?.first_name ?? null,
        metadata: {
          userId: user?.user_id ?? null,
          lastText: text || null,
        },
      });
    }

    if (text.startsWith('/start') && chatId) {
      console.info('[max webhook] start', { chatId, text });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/webhooks/max:', error);
    return NextResponse.json({ ok: true });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
