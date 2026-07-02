import { CartAddons, CartItemExtras } from '@/types/product';

export const ADDON_OPTIONS: Array<{
  key: keyof CartAddons;
  label: string;
  emoji: string;
}> = [
  { key: 'balloons', label: 'Шарики', emoji: '🎈' },
  { key: 'toys', label: 'Игрушки', emoji: '🧸' },
  { key: 'vases', label: 'Вазы', emoji: '🏺' },
];

export const EMPTY_ADDONS: CartAddons = { balloons: 0, toys: 0, vases: 0 };

export const DEFAULT_CART_EXTRAS: CartItemExtras = {
  postcardWanted: false,
  postcardText: '',
  addons: { ...EMPTY_ADDONS },
};

export function makeCartKey(productId: string, extras: CartItemExtras): string {
  const normalized = {
    postcardWanted: extras.postcardWanted,
    postcardText: extras.postcardText.trim(),
    addons: extras.addons,
  };
  return `${productId}:${JSON.stringify(normalized)}`;
}

export function hasAddons(addons: CartAddons): boolean {
  return addons.balloons > 0 || addons.toys > 0 || addons.vases > 0;
}

export function formatAddonsSummary(addons: CartAddons): string {
  return ADDON_OPTIONS.filter((opt) => addons[opt.key] > 0)
    .map((opt) => `${opt.label} ×${addons[opt.key]}`)
    .join(', ');
}
