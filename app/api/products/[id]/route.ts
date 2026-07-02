import { NextRequest, NextResponse } from 'next/server';
import { hasDatabase, query } from '@/lib/db';
import { Product } from '@/types/product';
import { requireAdmin } from '@/lib/require-admin';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { revalidateProductPages } from '@/lib/revalidate-products';

const PRODUCT_COLUMNS =
  'id, name, description, details, price, image_url, category, stock, is_popular, popularity_score, created_at, featured_slot';

const SUPABASE_PRODUCT_FIELDS =
  'id, name, description, details, price, image_url, category, stock, is_popular, created_at, featured_slot';

function mapSupabaseProduct(row: Record<string, unknown>): Product {
  return {
    ...(row as unknown as Product),
    popularity_score: typeof row.popularity_score === 'number' ? row.popularity_score : 0,
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json();

    if (!hasDatabase()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('products')
        .update({
          name: body.name,
          description: body.description ?? '',
          details: body.details ?? null,
          price: body.price ?? 0,
          image_url: body.image_url ?? '',
          category: body.category ?? '',
          stock: body.stock ?? 0,
          is_popular: body.is_popular ?? false,
        })
        .eq('id', params.id)
        .select(SUPABASE_PRODUCT_FIELDS)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
      }

      revalidateProductPages();
      return NextResponse.json({ product: mapSupabaseProduct(data as Record<string, unknown>) });
    }

    const { rows } = await query<Product>(
      `UPDATE products
       SET name = $2, description = $3, details = $4, price = $5, image_url = $6,
           category = $7, stock = $8, is_popular = COALESCE($9, is_popular),
           popularity_score = COALESCE($10, popularity_score)
       WHERE id = $1
       RETURNING ${PRODUCT_COLUMNS}`,
      [
        params.id,
        body.name,
        body.description ?? '',
        body.details ?? null,
        body.price ?? 0,
        body.image_url ?? '',
        body.category ?? '',
        body.stock ?? 0,
        body.is_popular ?? null,
        body.popularity_score ?? null,
      ]
    );

    if (!rows[0]) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    revalidateProductPages();
    return NextResponse.json({ product: rows[0] });
  } catch (error) {
    console.error('PUT /api/products:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Не удалось обновить товар' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    if (!hasDatabase()) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.from('products').delete().eq('id', params.id).select('id');

      if (error) throw error;
      if (!data?.length) {
        return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
      }

      revalidateProductPages();
      return NextResponse.json({ ok: true });
    }

    const { rowCount } = await query('DELETE FROM products WHERE id = $1', [params.id]);
    if (!rowCount) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }
    revalidateProductPages();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/products:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Не удалось удалить товар' },
      { status: 500 }
    );
  }
}
