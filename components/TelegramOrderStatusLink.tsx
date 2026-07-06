import { getPublicBotLinks } from '@/lib/notifications/config';

interface TelegramOrderStatusLinkProps {
  orderId?: string | null;
  className?: string;
}

export function TelegramOrderStatusLink({
  orderId,
  className = '',
}: TelegramOrderStatusLinkProps) {
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, '');
  const botLink =
    getPublicBotLinks().telegram ||
    (botUsername ? `https://t.me/${botUsername}` : null);

  if (!botLink || !orderId) return null;

  const href = `${botLink}?start=order_${orderId}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#2AABEE] text-white hover:bg-[#229ED9] px-6 py-3 font-medium transition-colors ${className}`}
    >
      Получать статус заказа в Telegram
    </a>
  );
}
