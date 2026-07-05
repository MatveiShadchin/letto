'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/ProductImage';
import { useCart } from '@/contexts/CartContext';
import { DEFAULT_CART_EXTRAS } from '@/lib/cart-extras';
import {
  getCartRecommendationTitle,
  getCartRecommendedProducts,
} from '@/lib/product-recommendations';
import { Product } from '@/types/product';

export function CartRecommendations() {
  const { state, addToCart } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (state.items.length === 0) return;

    let cancelled = false;
    fetch('/api/products')
      .then((response) => response.json())
      .then((data: { products?: Product[] }) => {
        if (!cancelled && Array.isArray(data.products)) {
          setAllProducts(data.products);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [state.items.length]);

  const recommendations = useMemo(
    () => getCartRecommendedProducts(state.items, allProducts, 4),
    [state.items, allProducts]
  );

  if (recommendations.length === 0) return null;

  return (
    <div className="mt-6 pt-6 border-t border-[#F3F2F1]">
      <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4 tracking-tight">
        {getCartRecommendationTitle(state.items)}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {recommendations.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-[#F3F2F1] bg-[#FAFAF9] overflow-hidden flex flex-col"
          >
            <div className="aspect-square relative bg-[#F3F2F1]">
              <ProductImage
                src={item.image_url}
                alt={item.name}
                className="object-cover"
                size={160}
              />
            </div>
            <div className="p-3 flex flex-col flex-1 gap-2">
              <p className="text-xs text-[#1A1A1A]/80 line-clamp-2 leading-snug">{item.name}</p>
              <p className="text-sm font-bold text-[#1A1A1A]">
                {(item.price / 100).toFixed(0)} ₽
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-auto h-8 rounded-lg text-xs border-[#E8E4E0] hover:bg-white"
                onClick={() => addToCart(item, DEFAULT_CART_EXTRAS)}
              >
                В корзину
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
