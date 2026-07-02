'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-[#2D2D2D] mb-2">Что-то пошло не так</h1>
      <p className="text-gray-600 mb-6 max-w-md">
        Произошла ошибка при загрузке страницы. Попробуйте обновить.
      </p>
      <Button onClick={reset} variant="brand">
        Попробовать снова
      </Button>
    </div>
  );
}
