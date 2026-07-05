import { ProductCard } from './ProductCard';
import { Product } from '@/types/product';

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-[#1A1A1A] antialiased tracking-tight">Каталог товаров</h2>
        <div className="bg-white rounded-xl border-2 border-dashed border-[#F3F2F1] p-12 text-center">
          <div className="text-[#1A1A1A]/70 mb-4 antialiased">В этой категории пока нет товаров</div>
          <a
            href="/admin"
            className="text-sm text-[#1A1A1A]/70 hover:text-[#1A1A1A] underline antialiased"
          >
            Добавить товары в админ-панели
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8 text-[#1A1A1A] antialiased tracking-tight">
        Каталог товаров
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 4}
          />
        ))}
      </div>
    </section>
  );
}
