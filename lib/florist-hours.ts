export const FLORIST_OPEN_HOUR = 8;
export const FLORIST_CLOSE_HOUR = 20;
export const URGENT_CUTOFF_MINUTES_BEFORE_CLOSE = 15;
export const PICKUP_AVAILABLE_24_7 = true;
export const STORE_TIMEZONE =
  process.env.NEXT_PUBLIC_STORE_TIMEZONE?.trim() || 'Asia/Yekaterinburg';

export const DELIVERY_TIME_SLOTS = [
  '8:30-10:00',
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

export const DELIVERY_DATE_HORIZON_DAYS = 7;

function getStoreTimeParts(date = new Date()): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  totalMinutes: number;
  dateKey: string;
} {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: STORE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === 'year')?.value ?? 0);
  const month = Number(parts.find((part) => part.type === 'month')?.value ?? 0);
  const day = Number(parts.find((part) => part.type === 'day')?.value ?? 0);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);
  const dateKey = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return { year, month, day, hour, minute, totalMinutes: hour * 60 + minute, dateKey };
}

/** Календарная дата магазина в формате YYYY-MM-DD. */
export function getStoreDateKey(date = new Date()): string {
  return getStoreTimeParts(date).dateKey;
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return utc.toISOString().slice(0, 10);
}

/** Дата для отображения: 16.07.2026 */
export function formatDeliveryDateRu(dateKey: string | null | undefined): string {
  if (!dateKey) return '—';
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateKey;
  return `${match[3]}.${match[2]}.${match[1]}`;
}

/**
 * Разбор даты, которую клиент набрал вручную.
 * Поддерживает ДД.ММ.ГГГГ, ДД.ММ.ГГ, ГГГГ-ММ-ДД.
 * Возвращает YYYY-MM-DD или null.
 */
export function parseFlexibleDeliveryDate(value: string | null | undefined): string | null {
  const raw = (value ?? '').trim();
  if (!raw) return null;

  const dotted = raw.match(/^(\d{1,2})[./](\d{1,2})[./](\d{2}|\d{4})$/);
  if (dotted) {
    const day = Number(dotted[1]);
    const month = Number(dotted[2]);
    let year = Number(dotted[3]);
    if (dotted[3].length === 2) {
      year += year >= 70 ? 1900 : 2000;
    }
    const dateKey = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return isValidDateKey(dateKey) ? dateKey : null;
  }

  if (isValidDateKey(raw)) return raw;
  return null;
}

function isValidDateKey(dateKey: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
  const [year, month, day] = dateKey.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return (
    utc.getUTCFullYear() === year &&
    utc.getUTCMonth() === month - 1 &&
    utc.getUTCDate() === day
  );
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

/** Есть ли ещё доступные интервалы на указанную дату. */
export function hasAvailableDeliverySlotsForDate(
  dateKey: string,
  now = new Date()
): boolean {
  return getAvailableDeliverySlots(dateKey, now).length > 0;
}

/** Ближайшая дата, на которую ещё можно выбрать доставку. */
export function getEarliestDeliveryDateKey(now = new Date()): string {
  const todayKey = getStoreDateKey(now);
  for (let offset = 0; offset <= DELIVERY_DATE_HORIZON_DAYS; offset += 1) {
    const dateKey = addDaysToDateKey(todayKey, offset);
    if (hasAvailableDeliverySlotsForDate(dateKey, now)) {
      return dateKey;
    }
  }
  return addDaysToDateKey(todayKey, 1);
}

export function getLatestDeliveryDateKey(now = new Date()): string {
  return addDaysToDateKey(getStoreDateKey(now), DELIVERY_DATE_HORIZON_DAYS);
}

/**
 * Доступные интервалы на выбранную дату.
 * Без подписей «сегодня»/«завтра» — дату выбирают отдельно.
 */
export function getAvailableDeliverySlots(
  dateKey?: string,
  now = new Date()
): Array<{
  value: string;
  label: string;
}> {
  const selectedDate = dateKey && isValidDateKey(dateKey) ? dateKey : getEarliestDeliveryDateKey(now);
  const { dateKey: todayKey, totalMinutes } = getStoreTimeParts(now);
  const processing = getFloristProcessingStatus(now);

  if (selectedDate < todayKey) {
    return [];
  }

  if (selectedDate === todayKey) {
    if (!processing.canProcessToday) {
      return [];
    }

    return DELIVERY_TIME_SLOTS.filter((slot) => parseSlotStartMinutes(slot) > totalMinutes).map(
      (slot) => ({ value: slot, label: slot })
    );
  }

  // Будущие дни — все интервалы
  return DELIVERY_TIME_SLOTS.map((slot) => ({ value: slot, label: slot }));
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
