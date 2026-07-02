'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProductImage } from '@/components/ProductImage';
import { useCart } from '@/contexts/CartContext';
import { apiJson } from '@/lib/api-client';
import { formatAddonsSummary, hasAddons } from '@/lib/cart-extras';
import {
  calcDeliveryCostRubles,
  formatDeliveryLine,
  FREE_DELIVERY_THRESHOLD_RUBLES,
} from '@/lib/delivery';
import { PICKUP_STORES, PickupStoreId } from '@/lib/store-locations';
import { cn } from '@/lib/utils';

export default function CheckoutPage() {
  const { state, clearCart } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<'courier' | 'pickup'>('courier');
  const [pickupStoreId, setPickupStoreId] = useState<PickupStoreId>(PICKUP_STORES[0].id);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    deliveryTime: '',
    specialWishes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const deliveryCostRub = calcDeliveryCostRubles(state.total, deliveryMethod);
  const itemsTotal = state.total / 100;
  const total = itemsTotal + deliveryCostRub;

  const timeSlots = [
    '10:00-12:00',
    '12:00-14:00',
    '14:00-16:00',
    '16:00-18:00',
    '18:00-20:00',
    '20:00-22:00',
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (state.items.length === 0) {
      setError('Корзина пуста');
      return;
    }

    if (!formData.customerName.trim()) {
      setError('Укажите имя заказчика');
      return;
    }

    if (!formData.customerPhone.trim()) {
      setError('Укажите телефон заказчика');
      return;
    }

    if (deliveryMethod === 'pickup' && !pickupStoreId) {
      setError('Выберите точку самовывоза');
      return;
    }

    if (deliveryMethod === 'courier') {
      if (!formData.recipientName.trim()) {
        setError('Укажите имя получателя');
        return;
      }
      if (!formData.recipientPhone.trim()) {
        setError('Укажите телефон получателя');
        return;
      }
      if (!formData.recipientAddress.trim()) {
        setError('Укажите адрес доставки');
        return;
      }
      if (!formData.deliveryTime) {
        setError('Выберите время доставки');
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);

      await apiJson('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.customerName.trim(),
          phone: formData.customerPhone.trim(),
          recipient_name: deliveryMethod === 'courier' ? formData.recipientName.trim() : null,
          recipient_phone: deliveryMethod === 'courier' ? formData.recipientPhone.trim() : null,
          recipient_address:
            deliveryMethod === 'courier' ? formData.recipientAddress.trim() : null,
          special_wishes: formData.specialWishes.trim() || null,
          pickup_store: deliveryMethod === 'pickup' ? pickupStoreId : null,
          delivery_method: deliveryMethod,
          delivery_time: deliveryMethod === 'courier' ? formData.deliveryTime : null,
          items: state.items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            postcardWanted: item.postcardWanted,
            postcardText: item.postcardText,
            addons: item.addons,
          })),
          items_total: state.total,
          delivery_cost: deliveryCostRub * 100,
          total: state.total + deliveryCostRub * 100,
        }),
      });

      clearCart();
      setSuccess(true);
    } catch (err) {
      console.error('Ошибка оформления заказа:', err);
      setError(err instanceof Error ? err.message : 'Не удалось оформить заказ');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFAF9]">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">Заказ оформлен</h1>
          <p className="text-[#1A1A1A]/70 mb-8">Спасибо! Мы свяжемся с вами для подтверждения.</p>
          <Link
            href="/catalog"
            className="inline-block rounded-xl bg-[#5E4037] text-white hover:bg-[#4A3329] hover:text-white px-6 py-3"
          >
            Вернуться в каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="container mx-auto px-4 py-8">
        <nav className="text-sm text-[#1A1A1A]/60 mb-6">
          <Link href="/" className="hover:text-[#5E4037]">
            Главная
          </Link>
          <span className="mx-2">/</span>
          <Link href="/cart" className="hover:text-[#5E4037]">
            Корзина
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#1A1A1A] font-medium">Оформление заказа</span>
        </nav>

        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-8">Оформление заказа</h1>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-[#E8E4E0] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">Заказчик</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="customerName"
                    className="block text-sm font-medium text-[#1A1A1A] mb-2"
                  >
                    Имя *
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-[#E8E4E0] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E4037]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="customerPhone"
                    className="block text-sm font-medium text-[#1A1A1A] mb-2"
                  >
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    id="customerPhone"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-[#E8E4E0] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E4037]"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E8E4E0] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">Способ получения</h2>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="courier"
                    checked={deliveryMethod === 'courier'}
                    onChange={() => setDeliveryMethod('courier')}
                    className="h-4 w-4 text-[#5E4037] focus:ring-[#5E4037]"
                  />
                  <span className="text-[#1A1A1A]">Курьером</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={deliveryMethod === 'pickup'}
                    onChange={() => setDeliveryMethod('pickup')}
                    className="h-4 w-4 text-[#5E4037] focus:ring-[#5E4037]"
                  />
                  <span className="text-[#1A1A1A]">Самовывоз</span>
                </label>
              </div>

              {deliveryMethod === 'courier' && (
                <p className="mt-4 text-sm text-[#1A1A1A]/60">
                  Доставка бесплатно при заказе от{' '}
                  {FREE_DELIVERY_THRESHOLD_RUBLES.toLocaleString('ru-RU')} ₽
                </p>
              )}

              {deliveryMethod === 'pickup' && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-[#1A1A1A]">Выберите точку самовывоза *</p>
                  {PICKUP_STORES.map((store) => (
                    <label
                      key={store.id}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
                        pickupStoreId === store.id
                          ? 'border-[#5E4037] bg-[#F9F5F0]'
                          : 'border-[#E8E4E0] bg-[#FAFAF9] hover:border-[#5E4037]/30'
                      )}
                    >
                      <input
                        type="radio"
                        name="pickupStore"
                        value={store.id}
                        checked={pickupStoreId === store.id}
                        onChange={() => setPickupStoreId(store.id)}
                        className="mt-1 h-4 w-4 text-[#5E4037] focus:ring-[#5E4037]"
                      />
                      <div>
                        <p className="font-semibold text-[#1A1A1A]">{store.title}</p>
                        <p className="text-sm text-[#1A1A1A]/70">{store.address}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {deliveryMethod === 'courier' && (
              <>
                <div className="rounded-2xl border border-[#E8E4E0] bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">Получатель</h2>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="recipientName"
                          className="block text-sm font-medium text-[#1A1A1A] mb-2"
                        >
                          Имя получателя *
                        </label>
                        <input
                          type="text"
                          id="recipientName"
                          name="recipientName"
                          value={formData.recipientName}
                          onChange={handleInputChange}
                          required
                          className="w-full rounded-xl border border-[#E8E4E0] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E4037]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="recipientPhone"
                          className="block text-sm font-medium text-[#1A1A1A] mb-2"
                        >
                          Телефон получателя *
                        </label>
                        <input
                          type="tel"
                          id="recipientPhone"
                          name="recipientPhone"
                          value={formData.recipientPhone}
                          onChange={handleInputChange}
                          required
                          className="w-full rounded-xl border border-[#E8E4E0] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E4037]"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="recipientAddress"
                        className="block text-sm font-medium text-[#1A1A1A] mb-2"
                      >
                        Адрес доставки *
                      </label>
                      <input
                        type="text"
                        id="recipientAddress"
                        name="recipientAddress"
                        value={formData.recipientAddress}
                        onChange={handleInputChange}
                        required
                        placeholder="Город, улица, дом, подъезд, этаж, квартира"
                        className="w-full rounded-xl border border-[#E8E4E0] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E4037]"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E8E4E0] bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">Время доставки</h2>
                  <div>
                    <label
                      htmlFor="deliveryTime"
                      className="block text-sm font-medium text-[#1A1A1A] mb-2"
                    >
                      Интервал *
                    </label>
                    <select
                      id="deliveryTime"
                      name="deliveryTime"
                      value={formData.deliveryTime}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-xl border border-[#E8E4E0] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E4037]"
                    >
                      <option value="">Выберите время</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="rounded-2xl border border-[#E8E4E0] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">Особые пожелания</h2>
              <textarea
                id="specialWishes"
                name="specialWishes"
                value={formData.specialWishes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Пожелания к заказу, доставке или упаковке"
                className="w-full rounded-xl border border-[#E8E4E0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5E4037] resize-none"
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-[#E8E4E0] bg-white p-6 sticky top-8 shadow-sm">
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">Ваш заказ</h2>

              <div className="space-y-3 mb-4">
                {state.items.map((item) => (
                  <div key={item.cartKey} className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3 min-w-0">
                      <div className="w-12 h-12 bg-[#F9F5F0] rounded-xl overflow-hidden relative shrink-0">
                        <ProductImage
                          src={item.image_url}
                          alt={item.name}
                          className="object-cover"
                          size={48}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1A1A1A]">{item.name}</p>
                        <p className="text-xs text-[#1A1A1A]/60">
                          {item.quantity} × {(item.price / 100).toFixed(0)} ₽
                        </p>
                        {item.postcardWanted && (
                          <p className="text-xs text-[#5E4037]/80 mt-0.5 truncate">
                            Открытка: {item.postcardText}
                          </p>
                        )}
                        {hasAddons(item.addons) && (
                          <p className="text-xs text-[#1A1A1A]/50 mt-0.5">
                            {formatAddonsSummary(item.addons)}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="font-semibold text-[#1A1A1A] shrink-0">
                      {((item.price * item.quantity) / 100).toFixed(0)} ₽
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-[#F3F2F1] pt-4">
                <div className="flex justify-between">
                  <span className="text-[#1A1A1A]">Товары</span>
                  <span className="text-[#1A1A1A]">{itemsTotal.toFixed(0)} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#1A1A1A]">Доставка</span>
                  <span className="text-[#1A1A1A]">
                    {formatDeliveryLine(state.total, deliveryMethod)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-[#F3F2F1] pt-2">
                  <span className="text-[#1A1A1A]">Итого</span>
                  <span className="text-[#5E4037]">{total.toFixed(0)} ₽</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || state.items.length === 0}
                className="w-full mt-6 rounded-xl bg-[#5E4037] text-white hover:text-white py-3 text-lg hover:bg-[#4A3329] transition-colors disabled:opacity-50"
              >
                {submitting ? 'Оформляем...' : 'Подтвердить заказ'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
