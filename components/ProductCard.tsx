'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { ProductModal } from './ProductModal';
import { PostcardDialog } from './PostcardDialog';
import { useCart } from '@/contexts/CartContext';
import { ProductImage } from './ProductImage';
import { EMPTY_ADDONS } from '@/lib/cart-extras';
import { Product } from '@/types/product';

export function ProductCard({
  product,
  priority = false,
  catalogProducts,
}: {
  product: Product;
  priority?: boolean;
  catalogProducts?: Product[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postcardOpen, setPostcardOpen] = useState(false);
  const { addToCart } = useCart();

  if (!product) return null;

  const formattedPrice = product?.price ? (product.price / 100).toFixed(0) + ' ₽' : '0 ₽';

  return (
    <>
      <div className="group bg-white rounded-xl overflow-hidden border border-[#F3F2F1] shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full antialiased">
        <div className="aspect-square overflow-hidden relative bg-[#F3F2F1]">
          <ProductImage
            src={product?.image_url}
            alt={product?.name || 'Товар'}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={priority}
          />
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="text-2xl font-bold text-[#1A1A1A] mb-2 tracking-tight antialiased">
            {formattedPrice}
          </div>

          <h3 className="text-sm text-[#1A1A1A]/80 mb-4 line-clamp-2 tracking-tight antialiased">
            {product?.name || 'Название товара'}
          </h3>

          <div className="mt-auto px-1">
            <div className="flex gap-2">
              <Button
                onClick={() => setPostcardOpen(true)}
                variant="brand"
                className="flex-1 h-10 rounded-xl font-medium tracking-tight antialiased text-sm"
              >
                <ShoppingCart className="w-4 h-4 mr-1.5 shrink-0" />
                В корзину
              </Button>

              <Button
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                className="flex-1 h-10 border-[#1A1A1A]/20 text-[#1A1A1A] hover:bg-[#F3F2F1] rounded-xl font-medium tracking-tight antialiased text-sm"
              >
                Подробнее
              </Button>
            </div>
          </div>
        </div>
      </div>

      <PostcardDialog
        open={postcardOpen}
        onOpenChange={setPostcardOpen}
        baseExtras={{ addons: { ...EMPTY_ADDONS } }}
        onConfirm={(extras) => addToCart(product, extras)}
      />

      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        catalogProducts={catalogProducts}
      />
    </>
  );
}
