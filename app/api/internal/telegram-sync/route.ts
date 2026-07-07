import { NextRequest, NextResponse } from 'next/server';
import { messagingConfig } from '@/lib/notifications/config';
import {
  getTelegramUpdateOffset,
  setTelegramUpdateOffset,
} from '@/lib/notifications/telegram-offset';
import { processTelegramUpdates } from '@/lib/notifications/telegram-inbound';
import { getSupportGroupId } from '@/lib/notifications/telegram-support';

function verifySyncSecret(request: NextRequest): boolean {
  const secret = messagingConfig.telegram.webhookSecret;
  if (!secret) return false;
  return request.headers.get('x-telegram-sync-secret') === secret;
}

export async function GET(request: NextRequest) {
  if (!verifySyncSecret(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const offset = await getTelegramUpdateOffset();
  return NextResponse.json({
    offset,
    support_group_id: getSupportGroupId(),
  });
}

export async function POST(request: NextRequest) {
  if (!verifySyncSecret(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const updates = Array.isArray(body.updates) ? body.updates : [];
    const maxUpdateId = await processTelegramUpdates(updates);

    if (maxUpdateId > 0) {
      await setTelegramUpdateOffset(maxUpdateId + 1);
    }

    return NextResponse.json({
      ok: true,
      processed: updates.length,
      nextOffset: maxUpdateId > 0 ? maxUpdateId + 1 : await getTelegramUpdateOffset(),
    });
  } catch (error) {
    console.error('POST /api/internal/telegram-sync:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
