export interface SoftLimits {
  maxItemsPerOrder: number;
  maxQuantityPerItem: number;
  maxAddonsPerItem: number;
  maxOrderTotalRubles: number;
}

// Read soft limits from env with safe defaults
export function getSoftLimits(): SoftLimits {
  const n = (v: string | undefined, d: number) => {
    const x = Number(v);
    return Number.isFinite(x) && x > 0 ? x : d;
  };
  return {
    maxItemsPerOrder: n(process.env.SOFT_MAX_ITEMS_PER_ORDER, 30),
    maxQuantityPerItem: n(process.env.SOFT_MAX_QTY_PER_ITEM, 10),
    maxAddonsPerItem: n(process.env.SOFT_MAX_ADDONS_PER_ITEM, 10),
    maxOrderTotalRubles: n(process.env.SOFT_MAX_ORDER_TOTAL_RUB, 200_000),
  };
}

type OrderItemInput = {
  id: string;
  name?: string;
  quantity: number;
  price: number; // in cents
  addons?: { balloons?: number; toys?: number; vases?: number };
};

export function validateOrderAgainstSoftLimits(input: {
  items: OrderItemInput[];
  items_total: number; // cents
  delivery_cost: number; // cents
  total: number; // cents
}): { ok: true } | { ok: false; reason: string } {
  const limits = getSoftLimits();

  const items = Array.isArray(input.items) ? input.items : [];
  if (items.length === 0) {
    return { ok: false, reason: 'Пустая корзина' };
  }
  if (items.length > limits.maxItemsPerOrder) {
    return { ok: false, reason: `Слишком много позиций: максимум ${limits.maxItemsPerOrder}` };
  }

  let computedItemsTotal = 0;
  for (const it of items) {
    const qty = Math.floor(Number(it.quantity) || 0);
    if (!it.id || qty <= 0) {
      return { ok: false, reason: 'Некорректные позиции в корзине' };
    }
    if (qty > limits.maxQuantityPerItem) {
      return {
        ok: false,
        reason: `Максимум ${limits.maxQuantityPerItem} шт. на один товар`,
      };
    }
    const price = Math.floor(Number(it.price) || 0);
    if (price < 0) return { ok: false, reason: 'Некорректная цена позиции' };
    const addons = it.addons || {};
    const addonsSum =
      Math.max(0, Number(addons.balloons) || 0) +
      Math.max(0, Number(addons.toys) || 0) +
      Math.max(0, Number(addons.vases) || 0);
    if (addonsSum > limits.maxAddonsPerItem) {
      return {
        ok: false,
        reason: `Слишком много дополнений к товару: максимум ${limits.maxAddonsPerItem}`,
      };
    }
    computedItemsTotal += price * qty;
  }

  // Tolerate small rounding mismatch (±1 rub)
  const mismatch = Math.abs(computedItemsTotal - Math.floor(Number(input.items_total) || 0));
  if (mismatch > 100) {
    return { ok: false, reason: 'Сумма по позициям не совпадает' };
  }

  const delivery = Math.max(0, Math.floor(Number(input.delivery_cost) || 0));
  const total = Math.floor(Number(input.total) || 0);
  if (total !== computedItemsTotal + delivery) {
    return { ok: false, reason: 'Итоговая сумма некорректна' };
  }
  if (total > limits.maxOrderTotalRubles * 100) {
    return {
      ok: false,
      reason: `Сумма заказа превышает лимит ${limits.maxOrderTotalRubles.toLocaleString('ru-RU')} ₽`,
    };
  }

  return { ok: true };
}

