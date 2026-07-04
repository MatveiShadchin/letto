import { NextRequest, NextResponse } from 'next/server';
import { messagingConfig } from '@/lib/notifications/config';
import { saveMessengerLink } from '@/lib/notifications/dispatch';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const type = body?.type;

    if (type === 'confirmation') {
      return new NextResponse(messagingConfig.vk.confirmationCode || 'ok', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    if (type === 'message_new') {
      const object = body?.object?.message;
      const userId = object?.from_id || object?.peer_id;
      const text = typeof object?.text === 'string' ? object.text : '';

      if (userId) {
        await saveMessengerLink({
          channel: 'vk',
          externalId: String(userId),
          metadata: { lastText: text || null },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/webhooks/vk:', error);
    return NextResponse.json({ ok: true });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
