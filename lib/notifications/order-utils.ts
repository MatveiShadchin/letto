import { findMessengerLinksByPhone } from '@/lib/notifications/dispatch';
import { normalizeOrderItems } from '@/lib/order-display';
import { Order } from '@/types/order';
import { NotifyChannel } from '@/types/notification';

export function normalizeOrderRow(row: Record<string, unknown>): Order {
  const items = normalizeOrderItems(row.items as Order['items']);

  return {
    id: String(row.id),
    customer_name: String(row.customer_name ?? ''),
    phone: String(row.phone ?? ''),
    recipient_name: (row.recipient_name as string | null) ?? null,
    recipient_phone: (row.recipient_phone as string | null) ?? null,
    recipient_address: (row.recipient_address as string | null) ?? null,
    special_wishes: (row.special_wishes as string | null) ?? null,
    street: (row.street as string | null) ?? null,
    house: (row.house as string | null) ?? null,
    pickup_store: (row.pickup_store as string | null) ?? null,
    delivery_method: row.delivery_method === 'pickup' ? 'pickup' : 'courier',
    delivery_time: (row.delivery_time as string | null) ?? null,
    items,
    items_total: Number(row.items_total ?? 0),
    delivery_cost: Number(row.delivery_cost ?? 0),
    total: Number(row.total ?? 0),
    status: (row.status as Order['status']) ?? 'new',
    preferred_notify_channel: (row.preferred_notify_channel as NotifyChannel | null) ?? null,
    telegram_chat_id: (row.telegram_chat_id as string | null) ?? null,
    vk_user_id: (row.vk_user_id as string | null) ?? null,
    whatsapp_phone: (row.whatsapp_phone as string | null) ?? null,
    max_chat_id: (row.max_chat_id as string | null) ?? null,
    created_at: row.created_at ? String(row.created_at) : undefined,
  };
}

export async function enrichOrderFromMessengerLinks(order: Order): Promise<Order> {
  const hasAnyId =
    order.telegram_chat_id ||
    order.vk_user_id ||
    order.whatsapp_phone ||
    order.max_chat_id;

  if (hasAnyId || !order.phone) {
    return order;
  }

  const links = await findMessengerLinksByPhone(order.phone);
  if (!links.length) {
    return order;
  }

  const enriched = { ...order };

  for (const link of links) {
    if (link.channel === 'telegram' && !enriched.telegram_chat_id) {
      enriched.telegram_chat_id = link.external_id;
    }
    if (link.channel === 'vk' && !enriched.vk_user_id) {
      enriched.vk_user_id = link.external_id;
    }
    if (link.channel === 'whatsapp' && !enriched.whatsapp_phone) {
      enriched.whatsapp_phone = link.phone || link.external_id;
    }
    if (link.channel === 'max' && !enriched.max_chat_id) {
      enriched.max_chat_id = link.external_id;
    }
  }

  return enriched;
}
