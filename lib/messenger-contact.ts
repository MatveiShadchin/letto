import { NotifyChannel } from '@/types/notification';

export type CheckoutContactChannel = NotifyChannel | 'phone';

export const CHECKOUT_CONTACT_OPTIONS: Array<{
  value: CheckoutContactChannel;
  label: string;
  hint: string;
  placeholder: string;
}> = [
  {
    value: 'telegram',
    label: 'Telegram',
    hint: 'Username или номер, привязанный к Telegram',
    placeholder: '@username или +7 900 000-00-00',
  },
  {
    value: 'vk',
    label: 'ВКонтакте',
    hint: 'Ссылка на профиль или id пользователя',
    placeholder: 'vk.com/id123456 или id123456',
  },
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    hint: 'Номер WhatsApp для сообщений',
    placeholder: '+7 900 000-00-00',
  },
  {
    value: 'max',
    label: 'MAX',
    hint: 'Username или номер в MAX',
    placeholder: '@username или +7 900 000-00-00',
  },
  {
    value: 'phone',
    label: 'Только звонок',
    hint: 'Свяжемся по указанному телефону',
    placeholder: '',
  },
];

export function getCheckoutContactOption(channel: CheckoutContactChannel) {
  return CHECKOUT_CONTACT_OPTIONS.find((item) => item.value === channel);
}

function stripAt(value: string): string {
  return value.trim().replace(/^@+/, '');
}

function digitsOnly(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`;
  }
  if (digits.length === 10) {
    digits = `7${digits}`;
  }
  return digits;
}

function extractVkUserId(value: string): string {
  const trimmed = value.trim();
  const idMatch = trimmed.match(/(?:vk\.com\/|https?:\/\/vk\.com\/)id(\d+)/i);
  if (idMatch) return idMatch[1];

  const bareId = trimmed.match(/^id(\d+)$/i);
  if (bareId) return bareId[1];

  if (/^\d+$/.test(trimmed)) return trimmed;

  return stripAt(trimmed);
}

export function normalizeMessengerContactInput(
  channel: CheckoutContactChannel,
  value: string,
  fallbackPhone?: string
): {
  preferred_notify_channel: NotifyChannel | null;
  messenger_contact: string | null;
  telegram_chat_id: string | null;
  vk_user_id: string | null;
  whatsapp_phone: string | null;
  max_chat_id: string | null;
} {
  if (channel === 'phone') {
    return {
      preferred_notify_channel: null,
      messenger_contact: 'Только звонок',
      telegram_chat_id: null,
      vk_user_id: null,
      whatsapp_phone: null,
      max_chat_id: null,
    };
  }

  const trimmed = value.trim();
  const display = trimmed;

  switch (channel) {
    case 'telegram':
      return {
        preferred_notify_channel: 'telegram',
        messenger_contact: display,
        telegram_chat_id: stripAt(trimmed) || digitsOnly(trimmed) || null,
        vk_user_id: null,
        whatsapp_phone: null,
        max_chat_id: null,
      };
    case 'vk':
      return {
        preferred_notify_channel: 'vk',
        messenger_contact: display,
        telegram_chat_id: null,
        vk_user_id: extractVkUserId(trimmed) || null,
        whatsapp_phone: null,
        max_chat_id: null,
      };
    case 'whatsapp': {
      const phone = digitsOnly(trimmed || fallbackPhone || '');
      return {
        preferred_notify_channel: 'whatsapp',
        messenger_contact: display || fallbackPhone || null,
        telegram_chat_id: null,
        vk_user_id: null,
        whatsapp_phone: phone || null,
        max_chat_id: null,
      };
    }
    case 'max':
      return {
        preferred_notify_channel: 'max',
        messenger_contact: display,
        telegram_chat_id: null,
        vk_user_id: null,
        whatsapp_phone: null,
        max_chat_id: stripAt(trimmed) || digitsOnly(trimmed) || null,
      };
    default:
      return {
        preferred_notify_channel: null,
        messenger_contact: null,
        telegram_chat_id: null,
        vk_user_id: null,
        whatsapp_phone: null,
        max_chat_id: null,
      };
  }
}

export function validateMessengerContactInput(
  channel: CheckoutContactChannel,
  value: string,
  fallbackPhone?: string
): string | null {
  if (channel === 'phone') return null;

  const trimmed = value.trim();
  if (!trimmed && channel !== 'whatsapp') {
    return 'Укажите контакт для выбранного мессенджера';
  }

  switch (channel) {
    case 'telegram':
      if (stripAt(trimmed).length < 3 && digitsOnly(trimmed).length < 10) {
        return 'Укажите @username Telegram или номер телефона';
      }
      return null;
    case 'vk':
      if (extractVkUserId(trimmed).length < 2) {
        return 'Укажите ссылку vk.com/id… или id пользователя';
      }
      return null;
    case 'whatsapp': {
      const phone = digitsOnly(trimmed || fallbackPhone || '');
      if (phone.length < 11) {
        return 'Укажите номер WhatsApp';
      }
      return null;
    }
    case 'max':
      if (stripAt(trimmed).length < 2 && digitsOnly(trimmed).length < 10) {
        return 'Укажите username или номер в MAX';
      }
      return null;
    default:
      return null;
  }
}

export function formatOrderMessengerContact(order: {
  preferred_notify_channel?: string | null;
  messenger_contact?: string | null;
  telegram_chat_id?: string | null;
  vk_user_id?: string | null;
  whatsapp_phone?: string | null;
  max_chat_id?: string | null;
}): string {
  if (order.messenger_contact?.trim()) {
    const channelLabel = getCheckoutContactOption(
      (order.preferred_notify_channel as CheckoutContactChannel) || 'phone'
    )?.label;
    if (order.preferred_notify_channel && channelLabel) {
      return `${channelLabel}: ${order.messenger_contact.trim()}`;
    }
    return order.messenger_contact.trim();
  }

  if (order.preferred_notify_channel === 'telegram' && order.telegram_chat_id) {
    return `Telegram: @${order.telegram_chat_id.replace(/^@/, '')}`;
  }
  if (order.preferred_notify_channel === 'vk' && order.vk_user_id) {
    return `ВКонтакте: ${order.vk_user_id}`;
  }
  if (order.preferred_notify_channel === 'whatsapp' && order.whatsapp_phone) {
    return `WhatsApp: ${order.whatsapp_phone}`;
  }
  if (order.preferred_notify_channel === 'max' && order.max_chat_id) {
    return `MAX: ${order.max_chat_id}`;
  }

  return '—';
}
