const DEFAULT_VK_GROUP_ID = '240024216';

export function getVkGroupId(): string {
  return (
    process.env.NEXT_PUBLIC_VK_GROUP_ID?.trim() ||
    process.env.VK_GROUP_ID?.trim() ||
    DEFAULT_VK_GROUP_ID
  );
}

export function getVkCommunityUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_VK_URL?.trim();
  if (fromEnv) return fromEnv;
  return `https://vk.com/club${getVkGroupId()}`;
}

export function getVkCommunityShortLabel(): string {
  const url = getVkCommunityUrl();
  try {
    const path = new URL(url).pathname.replace(/^\//, '');
    return path || `club${getVkGroupId()}`;
  } catch {
    return `club${getVkGroupId()}`;
  }
}

/** Ссылка «написать сообществу» */
export function getVkWriteUrl(prefillMessage?: string): string {
  const groupId = getVkGroupId();
  const message = prefillMessage?.trim();
  if (message) {
    return `https://vk.com/write-${groupId}?message=${encodeURIComponent(message)}`;
  }
  return `https://vk.me/club${groupId}`;
}

/** Сообщение в группу с телефоном и номером заказа (для статуса после оформления) */
export function getVkOrderStatusWriteUrl(input?: {
  customerPhone?: string | null;
  orderId?: string | null;
}): string {
  const shortId = input?.orderId ? input.orderId.slice(0, 8) : null;
  const phone = input?.customerPhone?.trim() || null;
  const prefill = [
    'Здравствуйте! Заказ с сайта LETTO.',
    phone ? `Телефон: ${phone}` : null,
    shortId ? `Номер заказа: ${shortId}` : null,
  ]
    .filter(Boolean)
    .join(' ');

  return getVkWriteUrl(prefill);
}

export function getVkApiGroupId(): number {
  const id = Number(getVkGroupId());
  return Number.isFinite(id) ? id : Number(DEFAULT_VK_GROUP_ID);
}
