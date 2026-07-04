import { NextRequest, NextResponse } from 'next/server';
import { getChannelStatuses, getPublicBotLinks } from '@/lib/notifications';
import { isChannelConfigured } from '@/lib/notifications/config';
import { requireAdmin } from '@/lib/require-admin';
import { getVkApiGroupId, getVkCommunityUrl } from '@/lib/vk-community';

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const baseUrl = request.nextUrl.origin;
  const vkWebhookUrl = `${baseUrl}/api/webhooks/vk`;

  return NextResponse.json({
    channels: getChannelStatuses(),
    botLinks: getPublicBotLinks(),
    webhooks: {
      telegram: `${baseUrl}/api/webhooks/telegram`,
      vk: vkWebhookUrl,
      whatsapp: `${baseUrl}/api/webhooks/whatsapp`,
      max: `${baseUrl}/api/webhooks/max`,
    },
    vkSetup: {
      communityUrl: getVkCommunityUrl(),
      groupId: getVkApiGroupId(),
      configured: isChannelConfigured('vk'),
      callbackUrl: vkWebhookUrl,
      steps: [
        'Откройте тестовую группу → Управление → Работа с API → Callback API',
        `Укажите URL: ${vkWebhookUrl}`,
        'Включите событие «Входящее сообщение» (message_new)',
        'Скопируйте «Строку, которую должен вернуть сервер» в VK_CONFIRMATION_CODE',
        'Создайте ключ доступа сообщества и добавьте в VK_GROUP_TOKEN на сервере',
        'Перезапустите PM2: pm2 restart letto',
      ],
    },
  });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
