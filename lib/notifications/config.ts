import { ChannelRuntimeStatus, NotifyChannel } from '@/types/notification';

import { getVkCommunityUrl, getVkWriteUrl } from '@/lib/vk-community';

function env(name: string): string {
  return process.env[name]?.trim() || '';
}

export const messagingConfig = {
  telegram: {
    botToken: env('TELEGRAM_BOT_TOKEN'),
    adminChatId: env('TELEGRAM_ADMIN_CHAT_ID'),
    webhookSecret: env('TELEGRAM_WEBHOOK_SECRET'),
    botUsername: env('NEXT_PUBLIC_TELEGRAM_BOT_USERNAME'),
    apiBaseUrl: env('TELEGRAM_API_BASE_URL') || 'https://api.telegram.org',
    proxyKey: env('TELEGRAM_PROXY_KEY'),
  },
  vk: {
    groupToken: env('VK_GROUP_TOKEN'),
    groupId: env('VK_GROUP_ID'),
    confirmationCode: env('VK_CONFIRMATION_CODE'),
    webhookSecret: env('VK_WEBHOOK_SECRET'),
  },
  whatsapp: {
    provider: env('WHATSAPP_PROVIDER') || 'meta',
    apiUrl: env('WHATSAPP_API_URL'),
    accessToken: env('WHATSAPP_ACCESS_TOKEN'),
    phoneNumberId: env('WHATSAPP_PHONE_NUMBER_ID'),
    webhookVerifyToken: env('WHATSAPP_WEBHOOK_VERIFY_TOKEN'),
  },
  max: {
    botToken: env('MAX_BOT_TOKEN'),
    apiBaseUrl: env('MAX_API_BASE_URL') || 'https://platform-api2.max.ru',
    webhookSecret: env('MAX_WEBHOOK_SECRET'),
    botUsername: env('NEXT_PUBLIC_MAX_BOT_USERNAME'),
  },
} as const;

export function isChannelConfigured(channel: NotifyChannel): boolean {
  switch (channel) {
    case 'telegram':
      return Boolean(messagingConfig.telegram.botToken);
    case 'vk':
      return Boolean(messagingConfig.vk.groupToken);
    case 'whatsapp':
      return Boolean(
        messagingConfig.whatsapp.accessToken && messagingConfig.whatsapp.phoneNumberId
      );
    case 'max':
      return Boolean(messagingConfig.max.botToken);
    default:
      return false;
  }
}

export function getChannelStatuses(): ChannelRuntimeStatus[] {
  return [
    {
      channel: 'telegram',
      configured: isChannelConfigured('telegram'),
      label: 'Telegram',
      notes: messagingConfig.telegram.botUsername
        ? `@${messagingConfig.telegram.botUsername.replace(/^@/, '')}`
        : 'Задайте TELEGRAM_BOT_TOKEN',
    },
    {
      channel: 'vk',
      configured: isChannelConfigured('vk'),
      label: 'ВКонтакте',
      notes: messagingConfig.vk.groupId
        ? `Сообщество ${messagingConfig.vk.groupId}`
        : 'Задайте VK_GROUP_TOKEN и VK_GROUP_ID',
    },
    {
      channel: 'whatsapp',
      configured: isChannelConfigured('whatsapp'),
      label: 'WhatsApp',
      notes: messagingConfig.whatsapp.provider
        ? `Провайдер: ${messagingConfig.whatsapp.provider}`
        : 'Задайте WHATSAPP_ACCESS_TOKEN и WHATSAPP_PHONE_NUMBER_ID',
    },
    {
      channel: 'max',
      configured: isChannelConfigured('max'),
      label: 'MAX',
      notes: messagingConfig.max.botUsername
        ? `@${messagingConfig.max.botUsername.replace(/^@/, '')}`
        : 'Задайте MAX_BOT_TOKEN (после верификации на dev.max.ru)',
    },
  ];
}

export function getPublicBotLinks() {
  const telegram = messagingConfig.telegram.botUsername
    ? `https://t.me/${messagingConfig.telegram.botUsername.replace(/^@/, '')}`
    : null;
  const max = messagingConfig.max.botUsername
    ? `https://max.ru/${messagingConfig.max.botUsername.replace(/^@/, '')}`
    : null;
  const vk = getVkCommunityUrl();
  const vkWrite = getVkWriteUrl();

  return { telegram, max, vk, vkWrite };
}
