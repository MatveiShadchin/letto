import { NextRequest, NextResponse } from 'next/server';
import { hasDatabase, query } from '@/lib/db';
import { PRODUCT_POPULARITY_ORDER_SQL, sortByPopularity } from '@/lib/product-popularity';
import { Product } from '@/types/product';
import { requireAdmin } from '@/lib/require-admin';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { revalidateProductPages } from '@/lib/revalidate-products';

const PRODUCT_COLUMNS =
  'id, name, description, details, price, image_url, category, stock, is_popular, popularity_score, created_at, featured_slot';

const SUPABASE_PRODUCT_FIELDS =
  'id, name, description, details, price, image_url, category, stock, is_popular, popularity_score, created_at, featured_slot';

function mapSupabaseProduct(row: Record<string, unknown>): Product {
  return {
    ...(row as unknown as Product),
    popularity_score: typeof row.popularity_score === 'number' ? row.popularity_score : 0,
  };
}

export async function GET() {
  try {
    if (!hasDatabase()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.from('products').select(SUPABASE_PRODUCT_FIELDS);

      if (error) throw error;
      return NextResponse.json({
        products: sortByPopularity(
          (data ?? []).map((row) => mapSupabaseProduct(row as Record<string, unknown>))
        ),
      });
    }

    const { rows } = await query<Product>(
      `SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY ${PRODUCT_POPULARITY_ORDER_SQL}`
    );
    return NextResponse.json({ products: rows });
  } catch (error) {
    console.error('GET /api/products:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Не удалось загрузить товары' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json();

    if (!hasDatabase()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: body.name,
          description: body.description ?? '',
          details: body.details ?? null,
          price: body.price ?? 0,
          image_url: body.image_url ?? '',
          category: body.category ?? '',
          stock: body.stock ?? 0,
          is_popular: body.is_popular ?? false,
        })
        .select(SUPABASE_PRODUCT_FIELDS)
        .single();

      if (error) throw error;
      revalidateProductPages();
      return NextResponse.json({ product: mapSupabaseProduct(data as Record<string, unknown>) });
    }

    const { rows } = await query<Product>(
      `INSERT INTO products (name, description, details, price, image_url, category, stock, is_popular, popularity_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${PRODUCT_COLUMNS}`,
      [
        body.name,
        body.description ?? '',
        body.details ?? null,
        body.price ?? 0,
        body.image_url ?? '',
        body.category ?? '',
        body.stock ?? 0,
        body.is_popular ?? false,
        body.popularity_score ?? 0,
      ]
    );
    revalidateProductPages();
    return NextResponse.json({ product: rows[0] });
  } catch (error) {
    console.error('POST /api/products:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Не удалось создать товар' },
      { status: 500 }
    );
  }
}
