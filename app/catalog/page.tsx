import { CatalogPageClient } from '@/components/CatalogPageClient';
import { getProducts } from '@/lib/products-server';

export const dynamic = 'force-dynamic';

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const products = await getProducts();
  const initialCategory =
    searchParams.category && searchParams.category !== 'all' ? searchParams.category : undefined;

  return <CatalogPageClient initialProducts={products} initialCategory={initialCategory} />;
}
