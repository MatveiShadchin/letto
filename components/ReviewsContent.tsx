import Link from 'next/link';
import { ChevronRight, MessageCircle, Quote, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Review } from '@/types/review';

const stats = [
  { value: '4.9', label: 'Средняя оценка' },
  { value: '500+', label: 'Довольных клиентов' },
  { value: '98%', label: 'Рекомендуют нас' },
  { value: '2 ч', label: 'Средняя доставка' },
];

function formatReviewDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Оценка ${rating} из 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? 'fill-[#C9A227] text-[#C9A227]' : 'fill-[#E8E6E4] text-[#E8E6E4]'
          }`}
        />
      ))}
    </div>
  );
}

function AuthorAvatar({ name, accent }: { name: string; accent: string }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);

  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${accent} text-sm font-semibold text-[#5E4037] ring-2 ring-white shadow-sm`}
    >
      {initials}
    </div>
  );
}

export function ReviewsContent({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <div className="min-h-[50vh] bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-3">Отзывы</h1>
          <p className="text-[#1A1A1A]/70">Отзывы скоро появятся здесь</p>
        </div>
      </div>
    );
  }

  const featured = reviews[0];

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#F3F2F1] via-white to-[#F9F5F0]">
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-[#F3F2F1]/60 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[#F3F2F1]/40 -translate-x-1/2 translate-y-1/2" />

        <div className="container relative mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#5E4037] px-4 py-2 text-sm font-medium text-white mb-6">
              <Sparkles className="h-4 w-4" />
              Отзывы клиентов
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] tracking-tight leading-tight mb-4">
              Нам доверяют самые важные моменты
            </h1>
            <p className="text-lg text-[#1A1A1A]/75 tracking-tight max-w-2xl">
              Реальные отзывы о букетах, доставке и сервисе Летто. Мы читаем каждый
              комментарий и отвечаем лично.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#F3F2F1] bg-white/80 backdrop-blur-sm px-6 py-5 text-center shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
              >
                <div className="text-3xl font-bold text-[#5E4037] tracking-tight">{stat.value}</div>
                <div className="text-sm text-[#1A1A1A]/70 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 -mt-6 mb-12 relative z-10">
        <div className="rounded-2xl border border-[#F3F2F1] bg-white p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col lg:flex-row lg:items-start gap-8">
            <div className="flex-1">
              <Quote className="h-10 w-10 text-[#5E4037]/20 mb-4" />
              <p className="text-xl md:text-2xl text-[#1A1A1A] leading-relaxed font-medium tracking-tight">
                «{featured.text}»
              </p>
            </div>
            <div className="lg:w-64 shrink-0 lg:border-l lg:border-[#F3F2F1] lg:pl-8">
              <div className="flex items-center gap-3 mb-3">
                <AuthorAvatar name={featured.author} accent={featured.accent} />
                <div>
                  <p className="font-semibold text-[#1A1A1A]">{featured.author}</p>
                  <p className="text-sm text-[#1A1A1A]/60">{formatReviewDate(featured.review_date)}</p>
                </div>
              </div>
              <StarRating rating={featured.rating} />
              {featured.bouquet && (
                <p className="text-sm text-[#5E4037] font-medium mt-3">{featured.bouquet}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-8 tracking-tight">Все отзывы</h2>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="group flex flex-col rounded-2xl border border-[#F3F2F1] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <AuthorAvatar name={review.author} accent={review.accent} />
                  <div>
                    <h3 className="font-semibold text-[#1A1A1A]">{review.author}</h3>
                    <p className="text-xs text-[#1A1A1A]/55">{formatReviewDate(review.review_date)}</p>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>

              {review.bouquet && (
                <span className="inline-flex self-start rounded-full bg-[#F9F5F0] px-3 py-1 text-xs font-medium text-[#5E4037] mb-3">
                  {review.bouquet}
                </span>
              )}

              <p className="text-[#1A1A1A]/80 leading-relaxed flex-grow">{review.text}</p>

              {review.company_response && (
                <div className="mt-5 rounded-xl bg-[#F9F5F0] border border-[#F3F2F1] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="h-4 w-4 text-[#5E4037]" />
                    <span className="text-sm font-semibold text-[#5E4037]">Ответ Летто</span>
                  </div>
                  <p className="text-sm text-[#1A1A1A]/75 leading-relaxed">{review.company_response}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#5E4037] text-white">
        <div className="container mx-auto px-4 py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              Хотите такой же восторг?
            </h2>
            <p className="text-white/80 max-w-xl">
              Выберите букет в каталоге — доставим свежие цветы с фото перед отправкой.
            </p>
          </div>
          <Button
            asChild
            className="bg-white text-[#5E4037] hover:bg-[#F9F5F0] h-12 px-8 text-base font-semibold shrink-0 rounded-xl"
          >
            <Link href="/catalog">
              Смотреть каталог
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
