import { NextRequest, NextResponse } from 'next/server';
import { hasDatabase, query } from '@/lib/db';
import { Product } from '@/types/product';
import { Order } from '@/types/order';
import { requireAdmin } from '@/lib/require-admin';
import { getSupabaseAdmin } from '@/lib/supabase-server';

const PRODUCT_COLUMNS =
  'id, name, description, details, price, image_url, category, stock, is_popular, popularity_score, created_at, featured_slot';

const SUPABASE_PRODUCT_FIELDS =
  'id, name, description, details, price, image_url, category, stock, is_popular, created_at, featured_slot';

type RecentOrder = Pick<Order, 'id' | 'customer_name' | 'total' | 'created_at'>;

function mapSupabaseProduct(row: Record<string, unknown>): Product {
  return {
    ...(row as unknown as Product),
    popularity_score: typeof row.popularity_score === 'number' ? row.popularity_score : 0,
  };
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    if (!hasDatabase()) {
      const supabase = getSupabaseAdmin();

      const [productsRes, inquiriesRes, ordersCountRes, ordersRes, productsCountRes] =
        await Promise.all([
          supabase
            .from('products')
            .select(SUPABASE_PRODUCT_FIELDS)
            .order('created_at', { ascending: false })
            .limit(3),
          supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
          supabase.from('orders').select('id', { count: 'exact', head: true }),
          supabase
            .from('orders')
            .select('id, customer_name, total, created_at')
            .order('created_at', { ascending: false })
            .limit(3),
          supabase.from('products').select('id', { count: 'exact', head: true }),
        ]);

      if (productsRes.error) throw productsRes.error;
      if (inquiriesRes.error) throw inquiriesRes.error;
      if (ordersCountRes.error) throw ordersCountRes.error;
      if (ordersRes.error) throw ordersRes.error;
      if (productsCountRes.error) throw productsCountRes.error;

      return NextResponse.json({
        stats: {
          productsCount: productsCountRes.count ?? 0,
          newInquiriesCount: inquiriesRes.count ?? 0,
          ordersCount: ordersCountRes.count ?? 0,
        },
        recentProducts: (productsRes.data ?? []).map((row) =>
          mapSupabaseProduct(row as Record<string, unknown>)
        ),
        recentOrders: (ordersRes.data ?? []) as RecentOrder[],
      });
    }

    const [productsRes, inquiriesRes, ordersCountRes, ordersRes] = await Promise.all([
      query<Product>(
        `SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY created_at DESC LIMIT 3`
      ),
      query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM inquiries WHERE status = 'new'`
      ),
      query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM orders`),
      query<RecentOrder>(
        `SELECT id, customer_name, total, created_at FROM orders ORDER BY created_at DESC LIMIT 3`
      ),
    ]);

    const productsCountRes = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM products`
    );

    return NextResponse.json({
      stats: {
        productsCount: Number(productsCountRes.rows[0]?.count ?? 0),
        newInquiriesCount: Number(inquiriesRes.rows[0]?.count ?? 0),
        ordersCount: Number(ordersCountRes.rows[0]?.count ?? 0),
      },
      recentProducts: productsRes.rows,
      recentOrders: ordersRes.rows,
    });
  } catch (error) {
    console.error('GET /api/admin/dashboard:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Не удалось загрузить статистику' },
      { status: 500 }
    );
  }
}
