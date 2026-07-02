import { PICKUP_STORES } from '@/lib/store-locations';
import { formatAddonsSummary, hasAddons } from '@/lib/cart-extras';
import { Order, OrderLineItem } from '@/types/order';

export function getPickupStoreLabel(pickupStoreId: string | null | undefined): string | null {
  if (!pickupStoreId) return null;
  const store = PICKUP_STORES.find((item) => item.id === pickupStoreId);
  return store ? `${store.title} — ${store.address}` : pickupStoreId;
}

export function formatRublesFromKopecks(value: number): string {
  return `${(value / 100).toFixed(0)} ₽`;
}

export function normalizeOrderItems(
  items: Order['items'] | string | null | undefined
): OrderLineItem[] {
  if (!items) return [];
  if (typeof items === 'string') {
    try {
      const parsed = JSON.parse(items) as OrderLineItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(items) ? items : [];
}

export function formatOrderItemExtras(item: OrderLineItem): string[] {
  const lines: string[] = [];
  if (item.postcardWanted) {
    lines.push(`Открытка: ${item.postcardText?.trim() || 'текст не указан'}`);
  }
  if (item.addons && hasAddons(item.addons as { balloons: number; toys: number; vases: number })) {
    lines.push(`Дополнения: ${formatAddonsSummary(item.addons as { balloons: number; toys: number; vases: number })}`);
  }
  return lines;
}

export function formatOrderDetails(order: Order): string {
  const lines: string[] = ['Заказ с сайта', ''];
  lines.push(`Заказчик: ${order.customer_name || '—'}`);
  lines.push(`Телефон заказчика: ${order.phone || '—'}`);
  lines.push('');

  if (order.delivery_method === 'pickup') {
    lines.push('Способ: самовывоз');
    lines.push(`Точка: ${getPickupStoreLabel(order.pickup_store) || '—'}`);
  } else {
    lines.push('Способ: курьер');
    lines.push(`Получатель: ${order.recipient_name || '—'}`);
    lines.push(`Телефон получателя: ${order.recipient_phone || '—'}`);
    const address =
      order.recipient_address ||
      [order.street, order.house].filter(Boolean).join(', ') ||
      '—';
    lines.push(`Адрес: ${address}`);
    lines.push(`Время: ${order.delivery_time || '—'}`);
  }

  if (order.special_wishes?.trim()) {
    lines.push('');
    lines.push(`Особые пожелания: ${order.special_wishes.trim()}`);
  }

  lines.push('');
  lines.push('Состав заказа:');
  for (const item of normalizeOrderItems(order.items)) {
    lines.push(
      `• ${item.name} — ${item.quantity} шт. × ${formatRublesFromKopecks(item.price)}`
    );
    for (const extra of formatOrderItemExtras(item)) {
      lines.push(`  ${extra}`);
    }
  }

  lines.push('');
  lines.push(`Товары: ${formatRublesFromKopecks(order.items_total)}`);
  lines.push(`Доставка: ${formatRublesFromKopecks(order.delivery_cost)}`);
  lines.push(`Итого: ${formatRublesFromKopecks(order.total)}`);

  return lines.join('\n');
}

export function isOrderProcessed(status: Order['status']): boolean {
  return status === 'completed' || status === 'cancelled';
}
