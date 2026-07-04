import { NextRequest, NextResponse } from 'next/server';
import { getChannelStatuses, getPublicBotLinks } from '@/lib/notifications';
import { requireAdmin } from '@/lib/require-admin';

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const baseUrl = request.nextUrl.origin;

  return NextResponse.json({
    channels: getChannelStatuses(),
    botLinks: getPublicBotLinks(),
    webhooks: {
      telegram: `${baseUrl}/api/webhooks/telegram`,
      vk: `${baseUrl}/api/webhooks/vk`,
      whatsapp: `${baseUrl}/api/webhooks/whatsapp`,
      max: `${baseUrl}/api/webhooks/max`,
    },
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
