'use client';

import { useEffect, useState } from 'react';
import { LoginForm } from '@/components/admin/LoginForm';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Product } from '@/types/product';

export function AdminPageClient({
  initialProducts,
  initialProductsError,
}: {
  initialProducts: Product[];
  initialProductsError: string | null;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/login', { credentials: 'include' })
      .then((response) => response.json())
      .then((data) => setIsAuthenticated(Boolean(data.authenticated)))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F3F2F1] text-[#1A1A1A]">
        Загрузка...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <AdminLayout
      initialProducts={initialProducts}
      initialProductsError={initialProductsError}
      onLogout={() => setIsAuthenticated(false)}
    />
  );
}
