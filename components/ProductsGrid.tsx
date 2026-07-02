import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';

interface ProductsGridProps {
  products: Product[];
  catalogProducts?: Product[];
}

export function ProductsGrid({ products, catalogProducts }: ProductsGridProps) {
  const allProducts = catalogProducts ?? products;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 3}
          catalogProducts={allProducts}
        />
      ))}
    </div>
  );
}
