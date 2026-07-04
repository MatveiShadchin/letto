import { NextRequest, NextResponse } from 'next/server';
import { messagingConfig } from '@/lib/notifications/config';
import { saveMessengerLink } from '@/lib/notifications/dispatch';

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('hub.mode');
  const token = request.nextUrl.searchParams.get('hub.verify_token');
  const challenge = request.nextUrl.searchParams.get('hub.challenge');
  const verifyToken = messagingConfig.whatsapp.webhookVerifyToken;

  if (mode === 'subscribe' && token && verifyToken && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entries = body?.entry ?? [];

    for (const entry of entries) {
      for (const change of entry?.changes ?? []) {
        const value = change?.value;
        const messages = value?.messages ?? [];

        for (const message of messages) {
          const phone = message?.from;
          const text = message?.text?.body;

          if (phone) {
            await saveMessengerLink({
              channel: 'whatsapp',
              externalId: String(phone),
              phone: String(phone),
              metadata: { lastText: typeof text === 'string' ? text : null },
            });
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/webhooks/whatsapp:', error);
    return NextResponse.json({ ok: true });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
