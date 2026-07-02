import { Product } from '@/types/product';
import { getPopularityScore } from '@/lib/product-popularity';

/** Какие категории предлагать к товару основной категории */
const COMPLEMENTARY_CATEGORIES: Record<string, string[]> = {
  букеты: ['шары', 'игрушки', 'вазы'],
  монобукеты: ['шары', 'игрушки', 'вазы'],
  гиганты: ['шары', 'вазы', 'композиции'],
  композиции: ['шары', 'игрушки', 'вазы'],
  шары: ['игрушки', 'букеты', 'вазы'],
  игрушки: ['шары', 'букеты', 'вазы'],
  вазы: ['букеты', 'композиции', 'монобукеты'],
};

const CATEGORY_LABELS: Record<string, string> = {
  букеты: 'Букеты',
  монобукеты: 'Монобукеты',
  гиганты: 'Гиганты',
  композиции: 'Композиции',
  шары: 'Шары',
  игрушки: 'Игрушки',
  вазы: 'Вазы',
};

function normalizeCategory(value: string): string {
  return value.trim().toLowerCase();
}

export function getRecommendationTitle(productCategory: string): string {
  const cat = normalizeCategory(productCategory);
  if (['букеты', 'монобукеты', 'гиганты', 'композиции'].includes(cat)) {
    return 'Дополните букет';
  }
  return 'Рекомендуем к покупке';
}

export function getCategoryLabel(category: string): string {
  const key = normalizeCategory(category);
  return CATEGORY_LABELS[key] ?? category;
}

export function getRecommendedProducts(
  product: Product,
  allProducts: Product[],
  limit = 4
): Product[] {
  const currentCategory = normalizeCategory(product.category);
  const complementary = COMPLEMENTARY_CATEGORIES[currentCategory] ?? [];
  const seen = new Set<string>([product.id]);
  const picked: Product[] = [];

  const tryAdd = (candidate: Product) => {
    if (seen.has(candidate.id)) return;
    seen.add(candidate.id);
    picked.push(candidate);
  };

  const categoriesToScan = [...complementary, currentCategory];

  for (const categorySlug of categoriesToScan) {
    if (picked.length >= limit) break;
    const matches = allProducts
      .filter((item) => normalizeCategory(item.category) === normalizeCategory(categorySlug))
      .sort((a, b) => getPopularityScore(b) - getPopularityScore(a));

    for (const item of matches) {
      if (picked.length >= limit) break;
      tryAdd(item);
    }
  }

  return picked.slice(0, limit);
}
