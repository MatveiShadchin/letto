export const categories = [
  { value: 'all', label: 'Все товары' },
  { value: 'букеты', label: 'Букеты' },
  { value: 'монобукеты', label: 'Монобукеты' },
  { value: 'композиции', label: 'Композиции, корзины с цветами' },
  { value: 'комнатные растения', label: 'Комнатные растения' },
  { value: 'шары', label: 'Шары' },
  { value: 'игрушки', label: 'Игрушки' },
] as const;

export type CatalogCategoryValue = (typeof categories)[number]['value'];

/** Категории для фильтров и админки (без «Все товары») */
export const productCategories = categories.filter((item) => item.value !== 'all');

export const priceRanges = [
  { value: 'all', label: 'Любая цена' },
  { value: '0-1000', label: 'до 1000 руб' },
  { value: '1000-3000', label: '1000-3000 руб' },
  { value: '3000-5000', label: '3000-5000 руб' },
  { value: '5000+', label: 'от 5000 руб' },
];
