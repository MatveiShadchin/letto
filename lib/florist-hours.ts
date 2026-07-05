export const FLORIST_OPEN_HOUR = 8;
export const FLORIST_CLOSE_HOUR = 20;
export const URGENT_CUTOFF_MINUTES_BEFORE_CLOSE = 15;
export const PICKUP_AVAILABLE_24_7 = true;
export const STORE_TIMEZONE =
  process.env.NEXT_PUBLIC_STORE_TIMEZONE?.trim() || 'Asia/Yekaterinburg';

export const DELIVERY_TIME_SLOTS = [
  '10:00-12:00',
  '12:00-14:00',
  '14:00-16:00',
  '16:00-18:00',
  '18:00-20:00',
] as const;

export type FloristHoursStatus = 'open' | 'urgent_closed' | 'closed';
export type FloristHoursMode = 'courier' | 'pickup' | 'both';

export interface FloristHoursInfo {
  status: FloristHoursStatus;
  title: string;
  message: string;
  canProcessToday: boolean;
  deliveryDayLabel: 'сегодня' | 'завтра';
  workingHoursLabel: string;
  pickupHoursLabel: string;
}

function getStoreTimeParts(date = new Date()): { hour: number; minute: number; totalMinutes: number } {
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    timeZone: STORE_TIMEZONE,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);

  return { hour, minute, totalMinutes: hour * 60 + minute };
}

function parseSlotStartMinutes(slot: string): number {
  const match = slot.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[1]) * 60 + Number(match[2]);
}

function getFloristProcessingStatus(now = new Date()): {
  status: FloristHoursStatus;
  canProcessToday: boolean;
  deliveryDayLabel: 'сегодня' | 'завтра';
} {
  const { totalMinutes } = getStoreTimeParts(now);
  const openMinutes = FLORIST_OPEN_HOUR * 60;
  const closeMinutes = FLORIST_CLOSE_HOUR * 60;
  const urgentCutoffMinutes = closeMinutes - URGENT_CUTOFF_MINUTES_BEFORE_CLOSE;

  if (totalMinutes < openMinutes || totalMinutes >= closeMinutes) {
    return { status: 'closed', canProcessToday: false, deliveryDayLabel: 'завтра' };
  }

  if (totalMinutes >= urgentCutoffMinutes) {
    return { status: 'urgent_closed', canProcessToday: false, deliveryDayLabel: 'завтра' };
  }

  return { status: 'open', canProcessToday: true, deliveryDayLabel: 'сегодня' };
}

export function getFloristHoursInfo(
  now = new Date(),
  mode: FloristHoursMode = 'both'
): FloristHoursInfo {
  const processing = getFloristProcessingStatus(now);
  const workingHoursLabel = `${FLORIST_OPEN_HOUR}:00–${FLORIST_CLOSE_HOUR}:00`;
  const pickupHoursLabel = 'круглосуточно';

  if (mode === 'pickup') {
    if (processing.canProcessToday) {
      return {
        ...processing,
        title: 'Самовывоз — круглосуточно',
        message:
          'Забрать заказ можно в любое время. Букет соберут в рабочее время флористов (8:00–20:00).',
        workingHoursLabel,
        pickupHoursLabel,
      };
    }

    if (processing.status === 'urgent_closed') {
      return {
        ...processing,
        title: 'Самовывоз — круглосуточно',
        message:
          'Срочные заказы сегодня уже не собираем — букет будет готов завтра с 8:00. Забрать можно в любое время.',
        workingHoursLabel,
        pickupHoursLabel,
      };
    }

    return {
      ...processing,
      title: 'Самовывоз — круглосуточно',
      message:
        'Сейчас флористы не работают — букет соберут завтра с 8:00. Пункты самовывоза открыты круглосуточно.',
      workingHoursLabel,
      pickupHoursLabel,
    };
  }

  if (mode === 'courier') {
    if (processing.canProcessToday) {
      return {
        ...processing,
        title: 'Доставка курьером',
        message: 'Флористы работают с 8:00 до 20:00. Заказ обработаем в рабочее время.',
        workingHoursLabel,
        pickupHoursLabel,
      };
    }

    if (processing.status === 'urgent_closed') {
      return {
        ...processing,
        title: 'Срочная доставка сегодня недоступна',
        message:
          'До закрытия меньше 15 минут — срочные букеты сегодня не собираем. Заказ обработаем завтра с 8:00.',
        workingHoursLabel,
        pickupHoursLabel,
      };
    }

    return {
      ...processing,
      title: 'Доставка сейчас недоступна',
      message:
        'Флористы работают с 8:00 до 20:00. Заказ примём, обработка и доставка — с 8:00 следующего дня.',
      workingHoursLabel,
      pickupHoursLabel,
    };
  }

  // both — корзина и общий блок
  if (processing.canProcessToday) {
    return {
      ...processing,
      title: 'Режим работы',
      message:
        'Самовывоз — круглосуточно. Доставка курьером и сбор букетов — с 8:00 до 20:00.',
      workingHoursLabel,
      pickupHoursLabel,
    };
  }

  if (processing.status === 'urgent_closed') {
    return {
      ...processing,
      title: 'Срочные заказы сегодня уже не принимаем',
      message:
        'Сбор букетов — завтра с 8:00. Самовывоз по-прежнему круглосуточный.',
      workingHoursLabel,
      pickupHoursLabel,
    };
  }

  return {
    ...processing,
    title: 'Сбор заказов начнётся утром',
    message:
      'Флористы работают с 8:00 до 20:00. Заказ примём сейчас, сбор — с 8:00. Самовывоз — круглосуточно.',
    workingHoursLabel,
    pickupHoursLabel,
  };
}

export function getAvailableDeliverySlots(now = new Date()): Array<{
  value: string;
  label: string;
}> {
  const processing = getFloristProcessingStatus(now);
  const { totalMinutes } = getStoreTimeParts(now);

  return DELIVERY_TIME_SLOTS.map((slot) => {
    if (!processing.canProcessToday) {
      return { value: slot, label: `${slot} (завтра)` };
    }

    const slotStart = parseSlotStartMinutes(slot);
    if (slotStart <= totalMinutes) {
      return { value: slot, label: `${slot} (завтра)` };
    }

    return { value: slot, label: `${slot} (сегодня)` };
  });
}

export function formatFloristProcessingNote(
  deliveryMethod: 'courier' | 'pickup' = 'courier',
  now = new Date()
): string {
  const processing = getFloristProcessingStatus(now);

  if (deliveryMethod === 'pickup') {
    if (processing.canProcessToday) {
      return 'Заказ принят. Букет соберут в рабочее время (8:00–20:00). Самовывоз — круглосуточно.';
    }
    return 'Заказ принят. Букет будет готов с 8:00. Забрать можно круглосуточно.';
  }

  if (processing.canProcessToday) {
    return 'Мы свяжемся с вами для подтверждения в рабочее время (8:00–20:00).';
  }
  return 'Заказ принят. Доставка и сбор — с 8:00 следующего дня.';
}
