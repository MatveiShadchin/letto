import Link from 'next/link';
import {
  Truck,
  Store,
  Clock,
  Wallet,
  Camera,
  Gift,
  Phone,
  MapPin,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  COURIER_DELIVERY_COST_RUBLES,
  FREE_DELIVERY_THRESHOLD_RUBLES,
} from '@/lib/delivery';
import {
  DELIVERY_TIME_SLOTS,
  FLORIST_CLOSE_HOUR,
  FLORIST_OPEN_HOUR,
} from '@/lib/florist-hours';
import { ORDER_PHONES, PICKUP_STORES } from '@/lib/store-locations';

const workingHours = `${String(FLORIST_OPEN_HOUR).padStart(2, '0')}:00–${String(FLORIST_CLOSE_HOUR).padStart(2, '0')}:00`;

export default function DeliveryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2 text-[#1A1A1A]">Доставка и оплата</h1>
      <p className="text-[#1A1A1A]/70 mb-8 max-w-2xl">
        Всё о времени, условиях и способах получения заказа — коротко и по делу
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="rounded-2xl border-[#E8E4E0] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#5E4037]/10 text-[#5E4037]">
              <Truck className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Доставка курьером</h2>
          </div>
          <ul className="space-y-3 text-[#1A1A1A]/80">
            <li>
              Стоимость — <strong className="text-[#1A1A1A]">{COURIER_DELIVERY_COST_RUBLES} ₽</strong>
            </li>
            <li>
              Бесплатно при заказе от{' '}
              <strong className="text-[#1A1A1A]">
                {FREE_DELIVERY_THRESHOLD_RUBLES.toLocaleString('ru-RU')} ₽
              </strong>
            </li>
            <li>Интервалы доставки: {DELIVERY_TIME_SLOTS.join(', ')}</li>
            <li>Сбор и доставка букетов — ежедневно с {workingHours}</li>
            <li>Перед выездом отправим фото букета в мессенджер</li>
          </ul>
        </Card>

        <Card className="rounded-2xl border-[#E8E4E0] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#5E4037]/10 text-[#5E4037]">
              <Store className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Самовывоз</h2>
          </div>
          <ul className="space-y-3 text-[#1A1A1A]/80">
            <li>
              Самовывоз — <strong className="text-[#1A1A1A]">круглосуточно</strong> и бесплатно
            </li>
            <li>Букет собирают ежедневно с {workingHours}</li>
            <li>Забрать заказ можно в любое удобное время после сборки</li>
          </ul>
          <div className="mt-5 space-y-3">
            {PICKUP_STORES.map((store) => {
              const phone = ORDER_PHONES.find((item) => item.storeId === store.id);
              return (
                <div
                  key={store.id}
                  className="rounded-xl border border-[#E8E4E0] bg-[#FAFAF9] px-4 py-3"
                >
                  <p className="font-medium text-[#1A1A1A]">{store.title}</p>
                  <p className="mt-1 flex items-start gap-2 text-sm text-[#1A1A1A]/75">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5E4037]" />
                    {store.address}
                  </p>
                  {phone ? (
                    <a
                      href={phone.href}
                      className="mt-1 inline-flex items-center gap-1.5 text-sm text-[#1A1A1A]/75 hover:text-[#5E4037]"
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      {phone.label}
                    </a>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="rounded-2xl border-[#E8E4E0] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#5E4037]/10 text-[#5E4037]">
              <Clock className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Время и сроки</h2>
          </div>
          <ul className="space-y-3 text-[#1A1A1A]/80">
            <li>Заказы принимаем круглосуточно онлайн</li>
            <li>Флористы работают ежедневно с {workingHours}</li>
            <li>
              Если оформили заказ вечером или ночью — соберём и доставим на следующий день с{' '}
              {String(FLORIST_OPEN_HOUR).padStart(2, '0')}:00
            </li>
            <li>Дату и интервал доставки выбираете при оформлении</li>
          </ul>
        </Card>

        <Card className="rounded-2xl border-[#E8E4E0] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#5E4037]/10 text-[#5E4037]">
              <Wallet className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-[#1A1A1A]">Оплата</h2>
          </div>
          <ul className="space-y-3 text-[#1A1A1A]/80">
            <li>Оплата при получении — наличными или картой</li>
            <li>Самовывоз: оплата в магазине при выдаче заказа</li>
            <li>Курьер: оплата курьеру при доставке</li>
            <li>Итоговую сумму и стоимость доставки видно при оформлении</li>
          </ul>
        </Card>
      </div>

      <Card className="rounded-2xl border-[#E8E4E0] p-6 mb-8">
        <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">Как оформить заказ</h2>
        <ol className="space-y-3 text-[#1A1A1A]/80 list-decimal list-inside">
          <li>Выберите букет в каталоге и добавьте в корзину</li>
          <li>При желании добавьте бесплатную открытку и дополнения</li>
          <li>Укажите способ получения: курьер или самовывоз</li>
          <li>Выберите дату, время и контактные данные</li>
          <li>Отправьте заказ — мы подтвердим его и пришлём статус в мессенджер</li>
        </ol>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="rounded-2xl border-[#E8E4E0] p-6">
          <div className="flex items-center gap-3 mb-3">
            <Camera className="h-5 w-5 text-[#5E4037]" />
            <h3 className="text-lg font-semibold text-[#1A1A1A]">Фото перед отправкой</h3>
          </div>
          <p className="text-[#1A1A1A]/80">
            Перед доставкой отправим фото готового букета в Telegram или ВКонтакте — можно
            согласовать детали до выезда курьера.
          </p>
        </Card>

        <Card className="rounded-2xl border-[#E8E4E0] p-6">
          <div className="flex items-center gap-3 mb-3">
            <Gift className="h-5 w-5 text-[#5E4037]" />
            <h3 className="text-lg font-semibold text-[#1A1A1A]">Бесплатная открытка</h3>
          </div>
          <p className="text-[#1A1A1A]/80">
            К заказу можно добавить открытку с вашим текстом — без дополнительной оплаты.
          </p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/catalog"
          className="inline-flex items-center justify-center rounded-full bg-[#5E4037] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4A3329] transition-colors"
        >
          Смотреть каталог
        </Link>
        <Link
          href="/contacts"
          className="inline-flex items-center justify-center rounded-full border border-[#E8E4E0] bg-white px-6 py-3 text-sm font-semibold text-[#1A1A1A] hover:bg-[#F5F3F0] transition-colors"
        >
          Адреса и контакты
        </Link>
      </div>
    </div>
  );
}
