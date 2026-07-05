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
  return isBouquetCategory(productCategory) ? 'Дополните букет' : 'Рекомендуем к покупке';
}

export function getCategoryLabel(category: string): string {
  const key = normalizeCategory(category);
  return CATEGORY_LABELS[key] ?? category;
}

const BOUQUET_CATEGORIES = ['букеты', 'монобукеты', 'гиганты', 'композиции'];

function isBouquetCategory(category: string): boolean {
  return BOUQUET_CATEGORIES.includes(normalizeCategory(category));
}

export function getCartRecommendationTitle(cartItems: Product[]): string {
  return cartItems.some((item) => isBouquetCategory(item.category))
    ? 'Дополните букет'
    : 'Рекомендуем к покупке';
}

export function getCartRecommendedProducts(
  cartItems: Product[],
  allProducts: Product[],
  limit = 4
): Product[] {
  const inCartIds = new Set(cartItems.map((item) => item.id));
  const seen = new Set<string>(inCartIds);
  const picked: Product[] = [];

  for (const cartItem of cartItems) {
    if (picked.length >= limit) break;

    const recommendations = getRecommendedProducts(cartItem, allProducts, limit);
    for (const item of recommendations) {
      if (picked.length >= limit) break;
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      picked.push(item);
    }
  }

  return picked.slice(0, limit);
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
