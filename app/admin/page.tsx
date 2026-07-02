import { AdminPageClient } from '@/components/admin/AdminPageClient';
import { getProducts } from '@/lib/products-server';
import { Product } from '@/types/product';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  let initialProducts: Product[] = [];
  let initialProductsError: string | null = null;

  try {
    initialProducts = await getProducts();
  } catch {
    initialProductsError = 'Не удалось загрузить товары';
  }

  return (
    <AdminPageClient
      initialProducts={initialProducts}
      initialProductsError={initialProductsError}
    />
  );
}
