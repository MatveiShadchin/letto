export const FREE_DELIVERY_THRESHOLD_RUBLES = 7000;
export const COURIER_DELIVERY_COST_RUBLES = 350;

export function calcDeliveryCostRubles(
  itemsTotalKopecks: number,
  method: 'courier' | 'pickup'
): number {
  if (method === 'pickup') return 0;
  if (itemsTotalKopecks / 100 >= FREE_DELIVERY_THRESHOLD_RUBLES) return 0;
  return COURIER_DELIVERY_COST_RUBLES;
}

export function formatCourierDeliveryHint(itemsTotalKopecks: number): string {
  const itemsTotalRub = itemsTotalKopecks / 100;
  if (itemsTotalRub >= FREE_DELIVERY_THRESHOLD_RUBLES) {
    return 'Бесплатно';
  }
  return `${COURIER_DELIVERY_COST_RUBLES} ₽ (бесплатно от ${FREE_DELIVERY_THRESHOLD_RUBLES.toLocaleString('ru-RU')} ₽)`;
}

export function formatDeliveryLine(
  itemsTotalKopecks: number,
  method: 'courier' | 'pickup'
): string {
  const cost = calcDeliveryCostRubles(itemsTotalKopecks, method);
  if (method === 'pickup' || cost === 0) return 'Бесплатно';
  return `${cost} ₽`;
}
