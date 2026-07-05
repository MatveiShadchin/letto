export const FLORIST_OPEN_HOUR = 8;
export const FLORIST_CLOSE_HOUR = 20;
export const URGENT_CUTOFF_MINUTES_BEFORE_CLOSE = 15;
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

export interface FloristHoursInfo {
  status: FloristHoursStatus;
  title: string;
  message: string;
  canProcessToday: boolean;
  deliveryDayLabel: 'сегодня' | 'завтра';
  workingHoursLabel: string;
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

export function getFloristHoursInfo(now = new Date()): FloristHoursInfo {
  const { totalMinutes } = getStoreTimeParts(now);
  const openMinutes = FLORIST_OPEN_HOUR * 60;
  const closeMinutes = FLORIST_CLOSE_HOUR * 60;
  const urgentCutoffMinutes = closeMinutes - URGENT_CUTOFF_MINUTES_BEFORE_CLOSE;
  const workingHoursLabel = `${FLORIST_OPEN_HOUR}:00–${FLORIST_CLOSE_HOUR}:00`;

  if (totalMinutes < openMinutes || totalMinutes >= closeMinutes) {
    return {
      status: 'closed',
      title: 'Сейчас магазин закрыт',
      message:
        'Флористы работают с 8:00 до 20:00. Заказ мы примём, но обработка начнётся завтра с 8:00.',
      canProcessToday: false,
      deliveryDayLabel: 'завтра',
      workingHoursLabel,
    };
  }

  if (totalMinutes >= urgentCutoffMinutes) {
    return {
      status: 'urgent_closed',
      title: 'Срочные заказы сегодня уже не принимаем',
      message:
        'До закрытия осталось меньше 15 минут. Срочные букеты сегодня не собираем — заказ обработаем завтра с 8:00.',
      canProcessToday: false,
      deliveryDayLabel: 'завтра',
      workingHoursLabel,
    };
  }

  return {
    status: 'open',
    title: 'Флористы на связи',
    message: 'Работаем с 8:00 до 20:00. Заказ обработаем в рабочее время.',
    canProcessToday: true,
    deliveryDayLabel: 'сегодня',
    workingHoursLabel,
  };
}

export function getAvailableDeliverySlots(now = new Date()): Array<{
  value: string;
  label: string;
}> {
  const info = getFloristHoursInfo(now);
  const { totalMinutes } = getStoreTimeParts(now);

  return DELIVERY_TIME_SLOTS.map((slot) => {
    if (!info.canProcessToday) {
      return { value: slot, label: `${slot} (завтра)` };
    }

    const slotStart = parseSlotStartMinutes(slot);
    if (slotStart <= totalMinutes) {
      return { value: slot, label: `${slot} (завтра)` };
    }

    return { value: slot, label: `${slot} (сегодня)` };
  });
}

export function formatFloristProcessingNote(now = new Date()): string {
  const info = getFloristHoursInfo(now);
  if (info.canProcessToday) {
    return 'Мы свяжемся с вами для подтверждения в рабочее время (8:00–20:00).';
  }
  return 'Заказ принят. Флористы обработают его завтра с 8:00.';
}
