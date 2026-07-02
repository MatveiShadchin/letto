/** Надёжные заставки для карточек товаров (всегда доступны из интернета) */
export const DEFAULT_PRODUCT_IMAGE =
  'https://placehold.co/800x800/F3F2F1/5E4037/png?text=%D0%9B%D0%B5%D1%82%D1%82%D0%BE';

export const PRODUCT_PLACEHOLDER_IMAGES = [
  'https://picsum.photos/seed/letto-flowers-1/800/800',
  'https://picsum.photos/seed/letto-flowers-2/800/800',
  'https://picsum.photos/seed/letto-flowers-3/800/800',
  'https://picsum.photos/seed/letto-flowers-4/800/800',
  'https://picsum.photos/seed/letto-flowers-5/800/800',
  'https://picsum.photos/seed/letto-flowers-6/800/800',
  'https://picsum.photos/seed/letto-flowers-7/800/800',
  'https://picsum.photos/seed/letto-flowers-8/800/800',
] as const;

export function getProductPlaceholder(index: number): string {
  return PRODUCT_PLACEHOLDER_IMAGES[index % PRODUCT_PLACEHOLDER_IMAGES.length];
}
