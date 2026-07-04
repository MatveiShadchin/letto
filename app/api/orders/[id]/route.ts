import { NextRequest, NextResponse } from 'next/server';
import { hasDatabase, query } from '@/lib/db';
import { notifyOrderStatusChanged } from '@/lib/notifications';
import { normalizeOrderRow } from '@/lib/notifications/order-utils';
import { Order } from '@/types/order';
import { requireAdmin } from '@/lib/require-admin';
import { getSupabaseAdmin } from '@/lib/supabase-server';

const ALLOWED_STATUSES = new Set(['new', 'processing', 'completed', 'cancelled']);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const status = body.status;

    if (!ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Некорректный статус' }, { status: 400 });
    }

    if (!hasDatabase()) {
      const supabase = getSupabaseAdmin();
      const { data: existing } = await supabase
        .from('orders')
        .select('status')
        .eq('id', params.id)
        .maybeSingle();

      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', params.id)
        .select('*')
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
      }

      const order = normalizeOrderRow(data as Record<string, unknown>);
      void notifyOrderStatusChanged(order, existing?.status as Order['status']).catch((err) =>
        console.error('notifyOrderStatusChanged:', err)
      );

      return NextResponse.json({ order: data });
    }

    const { rows: beforeRows } = await query<{ status: Order['status'] }>(
      'SELECT status FROM orders WHERE id = $1',
      [params.id]
    );

    const { rows } = await query<Order>(
      `UPDATE orders SET status = $2 WHERE id = $1 RETURNING *`,
      [params.id, status]
    );

    if (!rows[0]) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    const order = normalizeOrderRow(rows[0] as unknown as Record<string, unknown>);
    void notifyOrderStatusChanged(order, beforeRows[0]?.status).catch((err) =>
      console.error('notifyOrderStatusChanged:', err)
    );

    return NextResponse.json({ order: rows[0] });
  } catch (error) {
    console.error('PATCH /api/orders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Не удалось обновить заказ' },
      { status: 500 }
    );
  }
}
