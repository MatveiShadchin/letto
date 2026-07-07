import { NextRequest, NextResponse } from 'next/server';
import { messagingConfig } from '@/lib/notifications/config';
import { getSupportGroupId } from '@/lib/notifications/telegram-support';
import { hasDatabase, query } from '@/lib/db';

function verifySyncSecret(request: NextRequest): boolean {
  const secret = messagingConfig.telegram.webhookSecret;
  if (!secret) return false;
  return request.headers.get('x-telegram-sync-secret') === secret;
}

export async function POST(request: NextRequest) {
  if (!verifySyncSecret(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const groupChatId = getSupportGroupId();
    const groupMessageId = Number(body.group_message_id);
    const customerChatId = String(body.customer_chat_id ?? '').trim();

    if (!groupChatId || !Number.isFinite(groupMessageId) || !customerChatId) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (!hasDatabase()) {
      return NextResponse.json({ ok: true, stored: false });
    }

    await query(
      `INSERT INTO telegram_support_relay (
        group_chat_id, group_message_id, customer_chat_id, order_id, customer_name
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (group_chat_id, group_message_id) DO NOTHING`,
      [
        groupChatId,
        groupMessageId,
        customerChatId,
        typeof body.order_id === 'string' ? body.order_id : null,
        typeof body.customer_name === 'string' ? body.customer_name : null,
      ]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/internal/telegram-support-register:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Register failed' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
