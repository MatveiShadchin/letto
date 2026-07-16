import { getVkCommunityShortLabel, getVkCommunityUrl } from '@/lib/vk-community';

export const ORDER_PHONES = [
  { href: 'tel:+79617959560', label: '+7 (961) 795-95-60', storeId: 'makeeva' },
  { href: 'tel:+79123052260', label: '+7 (912) 305-22-60', storeId: 'oktyabr' },
] as const;

/** Телефон в шапке сайта — точка на пр. Октября */
export const HEADER_PHONE = ORDER_PHONES.find((phone) => phone.storeId === 'oktyabr')!;

export const VK_URL = getVkCommunityUrl();
export const VK_LABEL = getVkCommunityShortLabel();

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
