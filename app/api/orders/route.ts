import { NextRequest, NextResponse } from 'next/server';
import { hasDatabase, query } from '@/lib/db';
import { requireAdmin } from '@/lib/require-admin';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { PICKUP_STORES } from '@/lib/store-locations';

function resolvePickupAddress(pickupStoreId: string | null | undefined): string | null {
  if (!pickupStoreId) return null;
  return PICKUP_STORES.find((store) => store.id === pickupStoreId)?.address ?? pickupStoreId;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const recipientAddress =
      body.recipient_address?.trim() ||
      [body.street, body.house].filter(Boolean).join(', ') ||
      null;

    if (!hasDatabase()) {
      const supabase = getSupabaseAdmin();
      const street =
        body.delivery_method === 'pickup'
          ? resolvePickupAddress(body.pickup_store)
          : recipientAddress;

      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_name: body.customer_name,
          phone: body.phone,
          street,
          house: body.delivery_method === 'courier' ? body.house ?? null : null,
          delivery_method: body.delivery_method,
          delivery_time: body.delivery_time ?? null,
          items: body.items ?? [],
          items_total: body.items_total ?? 0,
          delivery_cost: body.delivery_cost ?? 0,
          total: body.total ?? 0,
          status: 'new',
        })
        .select('id')
        .single();

      if (error) throw error;
      return NextResponse.json({ id: data.id });
    }

    const { rows } = await query(
      `INSERT INTO orders (
        customer_name, phone, recipient_name, recipient_phone, recipient_address, special_wishes,
        street, house, pickup_store, delivery_method, delivery_time,
        items, items_total, delivery_cost, total, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13, $14, $15, 'new')
      RETURNING id`,
      [
        body.customer_name,
        body.phone,
        body.recipient_name ?? null,
        body.recipient_phone ?? null,
        recipientAddress,
        body.special_wishes?.trim() || null,
        body.delivery_method === 'courier' ? recipientAddress : null,
        null,
        body.pickup_store ?? null,
        body.delivery_method,
        body.delivery_time ?? null,
        JSON.stringify(body.items ?? []),
        body.items_total ?? 0,
        body.delivery_cost ?? 0,
        body.total ?? 0,
      ]
    );

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
