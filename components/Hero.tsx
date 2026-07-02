import Link from 'next/link';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';

export function Hero({
  featuredProduct,
  catalogProducts,
}: {
  featuredProduct: Product | null;
  catalogProducts?: Product[];
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#F3F2F1] to-white min-h-[600px]">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white rounded-full text-sm font-medium mb-4 antialiased tracking-tight">
                <Sparkles className="w-4 h-4" />
                Товар дня
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1A1A1A] leading-tight tracking-tighter antialiased">
                ЛУЧШИЕ БУКЕТЫ <span className="text-[#1A1A1A]">ДЛЯ ВАШИХ</span> МОМЕНТОВ
              </h1>
            </div>

            <p className="text-lg md:text-xl text-[#1A1A1A]/80 max-w-2xl antialiased tracking-tight">
              Свежие цветы и элегантные композиции, которые подчеркнут важность каждого момента.
              Быстрая доставка и безупречное качество.
            </p>

            <div className="flex">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center bg-[#5E4037] text-white hover:bg-[#4D3027] hover:text-white px-8 py-4 rounded-xl font-semibold transition-colors group antialiased tracking-tight"
              >
                Смотреть каталог
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#1A1A1A] antialiased tracking-tight">24/7</div>
                <div className="text-sm text-[#1A1A1A]/80 mt-1 antialiased tracking-tight">Заказы онлайн</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#1A1A1A] antialiased tracking-tight">2ч</div>
                <div className="text-sm text-[#1A1A1A]/80 mt-1 antialiased tracking-tight">Доставка по городу</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#1A1A1A] antialiased tracking-tight">100%</div>
                <div className="text-sm text-[#1A1A1A]/80 mt-1 antialiased tracking-tight">Свежесть цветов</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.05)] bg-white p-6">
              {featuredProduct ? (
                <div className="transform scale-105">
                  <ProductCard
                    product={featuredProduct}
                    priority
                    catalogProducts={catalogProducts}
                  />
                </div>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[#F3F2F1] rounded-xl">
                  <div className="text-[#1A1A1A]/40 mb-4 antialiased">Товар дня не назначен</div>
                  <Link
                    href="/admin"
                    className="text-sm text-[#1A1A1A]/60 hover:text-[#1A1A1A] underline antialiased tracking-tight"
                  >
                    Назначить в админ-панели
                  </Link>
                </div>
              )}
            </div>

            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#F3F2F1] rounded-full -z-10" />
            <div className="absolute -top-6 -right-6 w-40 h-40 bg-[#F3F2F1]/50 rounded-full -z-10" />
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#F3F2F1]/30 to-transparent rounded-full -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#F3F2F1] to-transparent rounded-full -translate-x-48 translate-y-48" />
    </section>
  );
}
