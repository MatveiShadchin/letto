'use client';

import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { Button } from './ui/button';
import { PostcardDialog } from './PostcardDialog';
import { useCart } from '@/contexts/CartContext';
import { ProductImage } from './ProductImage';
import { EMPTY_ADDONS } from '@/lib/cart-extras';
import { getRecommendationTitle, getRecommendedProducts } from '@/lib/product-recommendations';
import { Product } from '@/types/product';

export function ProductModal({
  product,
  isOpen,
  onClose,
  catalogProducts,
}: {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  catalogProducts?: Product[];
}) {
  const { addToCart } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>(catalogProducts ?? []);
  const [postcardOpen, setPostcardOpen] = useState(false);
  const [postcardProduct, setPostcardProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (catalogProducts?.length) {
      setAllProducts(catalogProducts);
      return;
    }

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
  }, [isOpen, catalogProducts]);

  const recommendations = useMemo(
    () => getRecommendedProducts(product, allProducts, 4),
    [product, allProducts]
  );

  if (!isOpen || !product) return null;

  const formattedPrice = product?.price ? (product.price / 100).toFixed(0) + ' ₽' : '0 ₽';

  const openPostcardFor = (item: Product) => {
    setPostcardProduct(item);
    setPostcardOpen(true);
  };

  const handleClose = () => {
    setPostcardProduct(null);
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
                  onClick={() => openPostcardFor(product)}
                  variant="brand"
                  className="w-full h-12 rounded-xl font-semibold antialiased"
                >
                  <ShoppingCart className="mr-2 w-5 h-5" />
                  Добавить в корзину
                </Button>
              </div>
            </div>
          </div>

          {recommendations.length > 0 && (
            <div className="border-t border-[#F3F2F1] px-8 pb-8 pt-6">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4 tracking-tight">
                {getRecommendationTitle(product.category)}
              </h3>
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
                        onClick={() => openPostcardFor(item)}
                      >
                        В корзину
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <PostcardDialog
        open={postcardOpen}
        onOpenChange={(open) => {
          setPostcardOpen(open);
          if (!open) setPostcardProduct(null);
        }}
        baseExtras={{ addons: { ...EMPTY_ADDONS } }}
        onConfirm={(extras) => {
          if (postcardProduct) {
            addToCart(postcardProduct, extras);
          }
          setPostcardProduct(null);
        }}
      />
    </>
  );
}
