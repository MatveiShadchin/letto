import { Product } from '@/types/product';

export function getPopularityScore(product: Product): number {
  return (product.is_popular ? 1_000_000 : 0) + (product.popularity_score ?? 0);
}

function getCreatedAtTimestamp(value: unknown): number {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function sortByPopularity(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const scoreDiff = getPopularityScore(b) - getPopularityScore(a);
    if (scoreDiff !== 0) return scoreDiff;
    return getCreatedAtTimestamp(b.created_at) - getCreatedAtTimestamp(a.created_at);
  });
}

export const PRODUCT_POPULARITY_ORDER_SQL = `
  (CASE WHEN is_popular THEN 1000000 ELSE 0 END) + COALESCE(popularity_score, 0) DESC,
  created_at DESC
`;
