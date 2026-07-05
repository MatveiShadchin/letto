import { cache } from 'react';
import { hasDatabase, query } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { PRODUCT_POPULARITY_ORDER_SQL, sortByPopularity } from '@/lib/product-popularity';
import { Product } from '@/types/product';

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

async function getProductsFromSupabase(limit?: number): Promise<Product[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('products').select(SUPABASE_PRODUCT_FIELDS);

  if (error) throw error;

  const sorted = sortByPopularity(
    (data ?? []).map((row) => mapSupabaseProduct(row as Record<string, unknown>))
  );

  return limit ? sorted.slice(0, limit) : sorted;
}

export const getProducts = cache(async (options?: { limit?: number }): Promise<Product[]> => {
  if (!hasDatabase()) {
    return getProductsFromSupabase(options?.limit);
  }

  if (options?.limit) {
    const { rows } = await query<Product>(
      `SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY ${PRODUCT_POPULARITY_ORDER_SQL} LIMIT $1`,
      [options.limit]
    );
    return rows;
  }

  const { rows } = await query<Product>(
    `SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY ${PRODUCT_POPULARITY_ORDER_SQL}`
  );
  return rows;
});

export const getHomePageData = cache(async () => {
  const products = await getProducts({ limit: 12 });
  const featuredProduct = products[0] ?? null;
  const gridProducts = featuredProduct ? products.slice(1) : products;

  return {
    featuredProduct,
    gridProducts,
  };
});
