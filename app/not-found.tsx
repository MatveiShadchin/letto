import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-[#2D2D2D] mb-2">Страница не найдена</h1>
      <p className="text-gray-600 mb-6">Такой страницы нет на сайте Летто.</p>
      <Link href="/">
        <Button variant="brand">
          На главную
        </Button>
      </Link>
    </div>
  );
}
