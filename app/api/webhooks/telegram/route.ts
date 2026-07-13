import { NextRequest, NextResponse } from 'next/server';
import { messagingConfig } from '@/lib/notifications/config';
import { processTelegramUpdate } from '@/lib/notifications/telegram-inbound';

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
    void processTelegramUpdate(update).catch((error) => {
      console.error('POST /api/webhooks/telegram async:', error);
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/webhooks/telegram:', error);
    return NextResponse.json({ ok: true });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
