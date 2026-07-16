import Link from 'next/link';
import { productCategories } from '@/data/products';
import { ORDER_PHONES, PICKUP_STORES, VK_URL } from '@/lib/store-locations';

export function Footer() {
  return (
    <footer className="bg-[#2D2D2D] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Летто</h3>
            <p className="text-gray-300 mb-4">
              Цветочный магазин с душой. Дарим эмоции через цветы.
            </p>
            <a
              href={VK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20 transition-colors"
            >
              Мы ВКонтакте
            </a>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Быстрые ссылки</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-[#F9F5F0]">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-gray-300 hover:text-[#F9F5F0]">
                  Каталог
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-gray-300 hover:text-[#F9F5F0]">
                  Отзывы
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="text-gray-300 hover:text-[#F9F5F0]">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Категории</h4>
            <ul className="space-y-2">
              {productCategories.map((category) => (
                <li key={category.value}>
                  <Link
                    href={`/catalog?category=${encodeURIComponent(category.value)}`}
                    className="text-gray-300 hover:text-[#F9F5F0]"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <div className="space-y-3 text-gray-300">
              {ORDER_PHONES.map((phone) => (
                <a key={phone.href} href={phone.href} className="block hover:text-[#F9F5F0]">
                  {phone.label}
                </a>
              ))}
              {PICKUP_STORES.map((store) => (
                <p key={store.id}>{store.address}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2026 Летто. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
