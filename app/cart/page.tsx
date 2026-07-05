'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartRecommendations } from '@/components/CartRecommendations';
import { FloristHoursNotice } from '@/components/FloristHoursNotice';
import { PostcardSection, isPostcardValid } from '@/components/PostcardSection';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { ProductImage } from '@/components/ProductImage';
import { formatCourierDeliveryHint } from '@/lib/delivery';
import { formatAddonsSummary, hasAddons } from '@/lib/cart-extras';

export default function CartPage() {
  const router = useRouter();
  const { state, removeFromCart, updateQuantity, clearCart, setOrderPostcard } = useCart();
  const [postcardError, setPostcardError] = useState<string | null>(null);
  const deliveryHint = formatCourierDeliveryHint(state.total);

  const handleCheckout = () => {
    if (!isPostcardValid(state.orderPostcard)) {
      if (state.orderPostcard?.wanted) {
        setPostcardError('Укажите текст на открытке');
      } else {
        setPostcardError('Выберите, нужна ли открытка к букету');
      }
      return;
    }

    setPostcardError(null);
    router.push('/checkout');
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 text-[#1A1A1A]/30 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Корзина пуста</h1>
            <p className="text-[#1A1A1A]/70 mb-6">Добавьте товары из каталога</p>
            <Link href="/catalog">
              <Button variant="brand" className="rounded-xl">
                Перейти в каталог
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-6">Корзина</h1>

        <FloristHoursNotice className="mb-6" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#E8E4E0] p-6 shadow-sm">
              <div className="space-y-6">
                {state.items.map((item) => (
                  <div key={item.cartKey} className="flex items-center border-b border-[#F3F2F1] pb-6">
                    <div className="w-24 h-24 bg-[#F9F5F0] rounded-xl mr-4 flex-shrink-0 relative overflow-hidden">
                      <ProductImage
                        src={item.image_url}
                        alt={item.name}
                        className="object-cover rounded-xl"
                        size={96}
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-[#1A1A1A] mb-1">{item.name}</h3>
                      <p className="text-sm text-[#1A1A1A]/60 mb-1 line-clamp-2">{item.description}</p>
                      {hasAddons(item.addons) && (
                        <p className="text-xs text-[#1A1A1A]/50 mb-2">
                          {formatAddonsSummary(item.addons)}
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center flex-wrap gap-3">
                          <div className="flex items-center border border-[#E8E4E0] rounded-xl">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="px-3">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeFromCart(item.cartKey)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Удалить
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-[#1A1A1A]">
                            {((item.price * item.quantity) / 100).toFixed(0)} ₽
                          </div>
                          <div className="text-sm text-[#1A1A1A]/50">
                            {(item.price / 100).toFixed(0)} ₽ × {item.quantity}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <CartRecommendations />

              <PostcardSection
                className="mt-6"
                value={state.orderPostcard}
                onChange={(postcard) => {
                  setPostcardError(null);
                  setOrderPostcard(postcard);
                }}
              />

              {postcardError && (
                <p className="mt-3 text-sm text-red-600">{postcardError}</p>
              )}

              <div className="mt-6 pt-6 border-t border-[#F3F2F1]">
                <Button
                  variant="outline"
                  className="rounded-xl text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                  onClick={clearCart}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Очистить корзину
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-[#E8E4E0] p-6 sticky top-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Итого</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-[#1A1A1A]/70">Товары ({state.itemCount})</span>
                  <span className="font-medium text-[#1A1A1A]">{(state.total / 100).toFixed(0)} ₽</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#1A1A1A]/70">Доставка курьером</span>
                  <span className="font-medium text-[#1A1A1A] text-right">{deliveryHint}</span>
                </div>
                <div className="border-t border-[#F3F2F1] pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-[#1A1A1A]">К оплате</span>
                    <span className="text-[#5E4037]">{(state.total / 100).toFixed(0)} ₽</span>
                  </div>
                  {state.orderPostcard?.wanted && (
                    <p className="text-xs text-[#5E4037]/85 mt-2">
                      Открытка: «{state.orderPostcard.text}»
                    </p>
                  )}
                  <p className="text-xs text-[#1A1A1A]/50 mt-2">
                    Итог с доставкой рассчитается при оформлении
                  </p>
                </div>
              </div>

              <Button
                variant="brand"
                className="w-full rounded-xl mb-4"
                onClick={handleCheckout}
              >
                Перейти к оформлению
              </Button>

              <p className="text-sm text-[#1A1A1A]/50 text-center">
                Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
