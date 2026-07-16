import { NextRequest, NextResponse } from 'next/server';
import { hasDatabase, query } from '@/lib/db';
import {
  enrichOrderFromMessengerLinks,
  normalizeOrderRow,
} from '@/lib/notifications/order-utils';
import { notifyOrderCreated } from '@/lib/notifications';
import { parseCheckoutMessengerContact } from '@/lib/notifications/recipients';
import { requireAdmin } from '@/lib/require-admin';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { PICKUP_STORES } from '@/lib/store-locations';
import { Order } from '@/types/order';
import { validateOrderAgainstSoftLimits } from '@/lib/limits';
import {
  normalizeDeliveryMethod,
  validateOrderRequestFields,
} from '@/lib/order-request-validation';

function resolvePickupAddress(pickupStoreId: string | null | undefined): string | null {
  if (!pickupStoreId) return null;
  return PICKUP_STORES.find((store) => store.id === pickupStoreId)?.address ?? pickupStoreId;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Soft-limit guardrails (cannot be bypassed UI/manual/script)
    const validation = validateOrderAgainstSoftLimits({
      items: Array.isArray(body.items) ? body.items : [],
      items_total: body.items_total ?? 0,
      delivery_cost: body.delivery_cost ?? 0,
      total: body.total ?? 0,
    });
    if (!validation.ok) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    const fieldError = validateOrderRequestFields(body as Record<string, unknown>);
    if (fieldError) {
      return NextResponse.json({ error: fieldError }, { status: 400 });
    }

    const deliveryMethod = normalizeDeliveryMethod(body.delivery_method);
    body.delivery_method = deliveryMethod;

    const recipientAddress =
      body.recipient_address?.trim() ||
      [body.street, body.house].filter(Boolean).join(', ') ||
      null;

    const messenger = parseCheckoutMessengerContact(body);

    if (!hasDatabase()) {
      const supabase = getSupabaseAdmin();
      const street =
        deliveryMethod === 'pickup'
          ? resolvePickupAddress(body.pickup_store)
          : recipientAddress;

      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_name: body.customer_name,
          phone: body.phone,
          recipient_name: deliveryMethod === 'courier' ? body.recipient_name ?? null : null,
          recipient_phone: deliveryMethod === 'courier' ? body.recipient_phone ?? null : null,
          recipient_address: deliveryMethod === 'courier' ? recipientAddress : null,
          special_wishes: body.special_wishes?.trim() || null,
          street,
          house: deliveryMethod === 'courier' ? body.house ?? null : null,
          pickup_store: deliveryMethod === 'pickup' ? body.pickup_store ?? null : null,
          delivery_method: deliveryMethod,
          delivery_date: deliveryMethod === 'courier' ? body.delivery_date ?? null : null,
          delivery_time: deliveryMethod === 'courier' ? body.delivery_time ?? null : null,
          preferred_notify_channel: messenger.preferred_notify_channel ?? null,
          messenger_contact: messenger.messenger_contact ?? null,
          telegram_chat_id: messenger.telegram_chat_id ?? null,
          vk_user_id: messenger.vk_user_id ?? null,
          whatsapp_phone: messenger.whatsapp_phone ?? null,
          max_chat_id: messenger.max_chat_id ?? null,
          items: body.items ?? [],
          items_total: body.items_total ?? 0,
          delivery_cost: body.delivery_cost ?? 0,
          total: body.total ?? 0,
          status: 'new',
        })
        .select('id')
        .single();

      if (error) throw error;

      const order = normalizeOrderRow({ ...data, items: body.items ?? [] });
      void enrichOrderFromMessengerLinks(order)
        .then((enriched) => notifyOrderCreated(enriched))
        .catch((err) => console.error('notifyOrderCreated:', err));

      return NextResponse.json({ id: data.id });
    }

    const { rows } = await query<Order>(
      `INSERT INTO orders (
        customer_name, phone, recipient_name, recipient_phone, recipient_address, special_wishes,
        street, house, pickup_store, delivery_method, delivery_date, delivery_time,
        preferred_notify_channel, messenger_contact, telegram_chat_id, vk_user_id, whatsapp_phone, max_chat_id,
        items, items_total, delivery_cost, total, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19::jsonb, $20, $21, $22, 'new')
      RETURNING *`,
      [
        body.customer_name,
        body.phone,
        deliveryMethod === 'courier' ? body.recipient_name ?? null : null,
        deliveryMethod === 'courier' ? body.recipient_phone ?? null : null,
        deliveryMethod === 'courier' ? recipientAddress : null,
        typeof body.special_wishes === 'string' ? body.special_wishes.trim() || null : null,
        deliveryMethod === 'courier' ? recipientAddress : null,
        null,
        deliveryMethod === 'pickup' ? body.pickup_store ?? null : null,
        deliveryMethod,
        deliveryMethod === 'courier' ? body.delivery_date ?? null : null,
        deliveryMethod === 'courier' ? body.delivery_time ?? null : null,
        messenger.preferred_notify_channel ?? null,
        messenger.messenger_contact ?? null,
        messenger.telegram_chat_id ?? null,
        messenger.vk_user_id ?? null,
        messenger.whatsapp_phone ?? null,
        messenger.max_chat_id ?? null,
        JSON.stringify(body.items ?? []),
        body.items_total ?? 0,
        body.delivery_cost ?? 0,
        body.total ?? 0,
      ]
    );

    const order = normalizeOrderRow(rows[0] as unknown as Record<string, unknown>);
    void enrichOrderFromMessengerLinks(order)
      .then((enriched) => notifyOrderCreated(enriched))
      .catch((err) => console.error('notifyOrderCreated:', err));

    return NextResponse.json({ id: rows[0].id });
  } catch (error) {
    console.error('POST /api/orders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Не удалось оформить заказ' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    if (!hasDatabase()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ orders: data ?? [] });
    }

    const { rows } = await query('SELECT * FROM orders ORDER BY created_at DESC');
    return NextResponse.json({ orders: rows });
  } catch (error) {
    console.error('GET /api/orders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Не удалось загрузить заказы' },
      { status: 500 }
    );
  }
}
