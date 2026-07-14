'use client';

import { useEffect } from 'react';
import { getVkOrderStatusWriteUrl } from '@/lib/vk-community';

interface VkOrderStatusLinkProps {
  customerPhone?: string;
  orderId?: string | null;
  className?: string;
  /** Сразу открыть чат ВК с номером заказа (после оформления) */
  autoRedirect?: boolean;
}

export function VkOrderStatusLink({
  customerPhone,
  orderId,
  className = '',
  autoRedirect = false,
}: VkOrderStatusLinkProps) {
  const href = getVkOrderStatusWriteUrl({ customerPhone, orderId });

  useEffect(() => {
    if (!autoRedirect || !href) return;
    // Небольшая пауза — клиент успевает увидеть «Заказ оформлен»
    const timer = window.setTimeout(() => {
      window.location.assign(href);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [autoRedirect, href]);

  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#0077FF] text-white hover:bg-[#0066DD] px-6 py-3 font-medium transition-colors ${className}`}
    >
      {autoRedirect ? 'Открываем ВК…' : 'Написать сообществу ВК'}
    </a>
  );
}
