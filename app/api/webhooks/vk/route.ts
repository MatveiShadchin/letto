import { NextRequest, NextResponse } from 'next/server';
import { messagingConfig } from '@/lib/notifications/config';
import { handleVkInboundMessage } from '@/lib/notifications/vk-inbound';
import { getVkApiGroupId } from '@/lib/vk-community';

function verifyVkSecret(request: NextRequest, body: Record<string, unknown>): boolean {
  const secret = messagingConfig.vk.webhookSecret;
  if (!secret) return true;

  const headerSecret = request.headers.get('x-vk-secret');
  if (headerSecret === secret) return true;

  return body?.secret === secret;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const type = body?.type;

    if (!verifyVkSecret(request, body)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const expectedGroupId = getVkApiGroupId();
    const eventGroupId = Number(body?.group_id);
    if (eventGroupId && eventGroupId !== expectedGroupId) {
      console.warn('[vk webhook] group_id mismatch', { eventGroupId, expectedGroupId });
    }

    if (type === 'confirmation') {
      const code = messagingConfig.vk.confirmationCode || 'letto_vk_ok';
      return new NextResponse(code, {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    if (type === 'message_new') {
      const object = body?.object as { message?: Record<string, unknown> } | undefined;
      const message = object?.message;
      const fromId = Number(message?.from_id);
      const peerId = Number(message?.peer_id);
      const userId = fromId > 0 ? fromId : peerId > 0 ? peerId : 0;
      const text = typeof message?.text === 'string' ? message.text : '';

      if (userId > 0) {
        void handleVkInboundMessage({
          userId,
          text,
          firstName: null,
        }).catch((error) => {
          console.error('[vk webhook] handle message failed:', error);
        });
      }
    }

    return new NextResponse('ok', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('POST /api/webhooks/vk:', error);
    return new NextResponse('ok', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
