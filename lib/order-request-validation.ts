import {
  DELIVERY_TIME_SLOTS,
  getAvailableDeliverySlots,
  getEarliestDeliveryDateKey,
  getLatestDeliveryDateKey,
} from '@/lib/florist-hours';
import { PICKUP_STORES } from '@/lib/store-locations';

type DeliveryMethod = 'courier' | 'pickup';

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Базовая серверная проверка полей оформления (поверх soft-limits). */
export function validateOrderRequestFields(body: Record<string, unknown>): string | null {
  const customerName = asTrimmedString(body.customer_name);
  const phone = asTrimmedString(body.phone);
  const deliveryMethod = body.delivery_method === 'pickup' ? 'pickup' : 'courier';

  if (!customerName) return 'Укажите имя заказчика';
  if (!phone) return 'Укажите телефон заказчика';

  if (deliveryMethod === 'pickup') {
    const pickupStore = asTrimmedString(body.pickup_store);
    if (!pickupStore) return 'Выберите точку самовывоза';
    if (!PICKUP_STORES.some((store) => store.id === pickupStore)) {
      return 'Некорректная точка самовывоза';
    }
    return null;
  }

  if (!asTrimmedString(body.recipient_name)) return 'Укажите имя получателя';
  if (!asTrimmedString(body.recipient_phone)) return 'Укажите телефон получателя';

  const address =
    asTrimmedString(body.recipient_address) ||
    [asTrimmedString(body.street), asTrimmedString(body.house)].filter(Boolean).join(', ');
  if (!address) return 'Укажите адрес доставки';

  const deliveryDate = asTrimmedString(body.delivery_date);
  const deliveryTime = asTrimmedString(body.delivery_time);
  if (!deliveryDate) return 'Выберите дату доставки';
  if (!deliveryTime) return 'Выберите время доставки';

  const minDate = getEarliestDeliveryDateKey();
  const maxDate = getLatestDeliveryDateKey();
  if (deliveryDate < minDate || deliveryDate > maxDate) {
    return 'Выберите доступную дату доставки';
  }

  if (!(DELIVERY_TIME_SLOTS as readonly string[]).includes(deliveryTime)) {
    return 'Выберите корректный интервал доставки';
  }

  const slots = getAvailableDeliverySlots(deliveryDate);
  if (!slots.some((slot) => slot.value === deliveryTime)) {
    return 'Выбранный интервал недоступен на эту дату';
  }

  return null;
}

export function normalizeDeliveryMethod(value: unknown): DeliveryMethod {
  return value === 'pickup' ? 'pickup' : 'courier';
}
