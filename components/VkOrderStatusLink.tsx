import { getVkWriteUrl } from '@/lib/vk-community';

interface VkOrderStatusLinkProps {
  customerPhone?: string;
  orderId?: string | null;
  className?: string;
}

export function VkOrderStatusLink({
  customerPhone,
  orderId,
  className = '',
}: VkOrderStatusLinkProps) {
  const shortId = orderId ? orderId.slice(0, 8) : null;
  const prefill = [
    'Здравствуйте! Заказ с сайта LETTO.',
    customerPhone ? `Телефон: ${customerPhone}` : null,
    shortId ? `Номер заказа: ${shortId}` : null,
  ]
    .filter(Boolean)
    .join(' ');

  const href = getVkWriteUrl(prefill);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#0077FF] text-white hover:bg-[#0066DD] px-6 py-3 font-medium transition-colors ${className}`}
    >
      Получать статус заказа в ВКонтакте
    </a>
  );
}
