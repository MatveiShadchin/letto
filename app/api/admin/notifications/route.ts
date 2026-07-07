import { NextRequest, NextResponse } from 'next/server';
import { getChannelStatuses, getPublicBotLinks } from '@/lib/notifications';
import { isChannelConfigured, messagingConfig } from '@/lib/notifications/config';
import { getSupportGroupId, isSupportGroupConfigured } from '@/lib/notifications/telegram-support';
import { requireAdmin } from '@/lib/require-admin';
import { getVkApiGroupId, getVkCommunityUrl } from '@/lib/vk-community';

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const baseUrl = request.nextUrl.origin;
  const vkWebhookUrl = `${baseUrl}/api/webhooks/vk`;
  const supportGroupId = getSupportGroupId();

  return NextResponse.json({
    channels: getChannelStatuses(),
    botLinks: getPublicBotLinks(),
    webhooks: {
      telegram: `${baseUrl}/api/webhooks/telegram`,
      vk: vkWebhookUrl,
      whatsapp: `${baseUrl}/api/webhooks/whatsapp`,
      max: `${baseUrl}/api/webhooks/max`,
    },
    telegramSupport: {
      configured: isSupportGroupConfigured(),
      supportGroupId: supportGroupId || null,
      steps: [
        'Создайте группу в Telegram (например «LETTO — заказы»).',
        'Добавьте бота @' +
          (messagingConfig.telegram.botUsername?.replace(/^@/, '') || 'letto_flowers_bot') +
          ' в группу и дайте право читать сообщения.',
        'В @BotFather: /setprivacy → выберите бота → Disable (иначе бот не увидит сообщения в группе).',
        'Узнайте id группы (например через getUpdates после сообщения в группе, id вида -100…).',
        'На сервере в .env.local: TELEGRAM_SUPPORT_GROUP_ID=-100… (можно тот же id, что TELEGRAM_ADMIN_CHAT_ID).',
        'pm2 restart letto',
        'Клиент пишет боту в личку → сообщение появляется в группе. Ответьте реплаем — клиент получит ответ от LETTO.',
      ],
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
