import { formatOrderDetails } from '@/lib/order-display';
import { Order } from '@/types/order';
import { NotifyEvent } from '@/types/notification';

const STATUS_LABELS: Record<Order['status'], string> = {
  new: 'принят',
  processing: 'в работе',
  completed: 'выполнен',
  cancelled: 'отменён',
};

function orderSummary(order: Order): string {
  return formatOrderDetails(order);
}

export function buildNotificationText(event: NotifyEvent, order: Order): string {
  const shortId = order.id.slice(0, 8);

  switch (event) {
    case 'order_created':
      return [
        `🌸 LETTO — заказ №${shortId} принят`,
        '',
        orderSummary(order),
        '',
        'Мы свяжемся с вами для подтверждения.',
      ].join('\n');

    case 'order_status_changed':
      return [
        `🌸 LETTO — заказ №${shortId}`,
        `Статус: ${STATUS_LABELS[order.status]}`,
        '',
        orderSummary(order),
      ].join('\n');

    case 'order_admin_alert':
      return [
        `🆕 Новый заказ №${shortId}`,
        '',
        orderSummary(order),
        order.special_wishes?.trim() ? `\nПожелания: ${order.special_wishes.trim()}` : '',
      ]
        .filter(Boolean)
        .join('\n');

    default:
      return orderSummary(order);
  }
}
