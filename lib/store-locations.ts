export const ORDER_PHONES = [
  { href: 'tel:+79617959560', label: '+7 (961) 795-95-60', storeId: 'makeeva' },
  { href: 'tel:+79123052260', label: '+7 (912) 305-22-60', storeId: 'oktyabr' },
] as const;

export const VK_URL = 'https://vk.com/letto14';

export const PICKUP_STORES = [
  {
    id: 'makeeva',
    title: 'Летто · пр. Макеева',
    address: 'пр. Макеева, 65/3',
  },
  {
    id: 'oktyabr',
    title: 'Летто · пр. Октября',
    address: 'пр. Октября, 38А',
  },
] as const;

export type PickupStoreId = (typeof PICKUP_STORES)[number]['id'];
