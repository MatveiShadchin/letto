'use client';

import { ShoppingCart, X } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '@/contexts/CartContext';
import { ProductImage } from './ProductImage';
import { DEFAULT_CART_EXTRAS } from '@/lib/cart-extras';
import { Product } from '@/types/product';

export function ProductModal({
  product,
  isOpen,
  onClose,
}: {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { addToCart } = useCart();

  if (!isOpen || !product) return null;

  const formattedPrice = product?.price ? (product.price / 100).toFixed(0) + ' ₽' : '0 ₽';

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      >
        <div
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl animate-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 bg-[#F3F2F1] hover:bg-[#E8E6E4] rounded-lg transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5 text-[#1A1A1A]" />
          </button>

          <div className="grid md:grid-cols-2 gap-8 p-8">
            <div className="flex items-center justify-center">
              <div className="aspect-square w-full max-w-md overflow-hidden rounded-xl bg-[#F9F5F0] relative">
                <ProductImage
                  src={product?.image_url}
                  alt={product?.name || 'Товар'}
                  className="object-cover"
                  priority
                  size={600}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <p className="text-xs font-medium uppercase tracking-wide text-[#5E4037]/70 mb-2">
                {product.category}
              </p>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2 antialiased tracking-tight">
                {product?.name || 'Название товара'}
              </h2>

              <div className="text-3xl font-bold text-[#1A1A1A] mb-6 antialiased">
                {formattedPrice}
              </div>

              <div className="mb-6">
                <h3 className="text-base font-semibold text-[#1A1A1A] mb-2 antialiased">Описание</h3>
                <p className="text-[#1A1A1A]/70 leading-relaxed antialiased text-sm">
                  {product?.description || 'Описание товара отсутствует.'}
                </p>
              </div>

              {product?.details && (
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-[#1A1A1A] mb-2 antialiased">Детали</h3>
                  <p className="text-[#1A1A1A]/70 leading-relaxed antialiased text-sm">
                    {product.details}
                  </p>
                </div>
              )}

              <div className="mt-auto pt-2">
                <Button
                  onClick={() => addToCart(product, DEFAULT_CART_EXTRAS)}
                  variant="brand"
                  className="w-full h-12 rounded-xl font-semibold antialiased"
                >
                  <ShoppingCart className="mr-2 w-5 h-5" />
                  Добавить в корзину
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
