'use client';

import { useEffect, useState } from 'react';
import { apiJson } from '@/lib/api-client';
import { Product } from '@/types/product';
import { Order } from '@/types/order';

type RecentOrder = Pick<Order, 'id' | 'customer_name' | 'total' | 'created_at'>;

interface DashboardStats {
  productsCount: number;
  newInquiriesCount: number;
  ordersCount: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    productsCount: 0,
    newInquiriesCount: 0,
    ordersCount: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiJson<{
        stats: DashboardStats;
        recentProducts: Product[];
        recentOrders: RecentOrder[];
      }>('/api/admin/dashboard');

      setStats(data.stats);
      setRecentProducts(data.recentProducts);
      setRecentOrders(data.recentOrders);
    } catch (err) {
      console.error('Ошибка загрузки дашборда:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'Не удалось загрузить данные';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Обзор</h1>
        <button
          type="button"
          onClick={fetchDashboardData}
          disabled={loading}
          className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-50"
        >
          Обновить
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[['Товаров в каталоге', stats.productsCount], ['Новые заявки', stats.newInquiriesCount], ['Заказов', stats.ordersCount]].map(
          ([label, value]) => (
            <div key={label as string} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-500">{label}</h3>
              {loading ? (
                <div className="h-9 w-16 bg-gray-200 rounded mt-2 animate-pulse" />
              ) : (
                <p className="text-3xl font-bold mt-2">{value}</p>
              )}
            </div>
          )
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Последние товары</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : recentProducts.length === 0 ? (
            <p className="text-sm text-gray-500">Товаров пока нет</p>
          ) : (
            <div className="space-y-4">
              {recentProducts.map((product) => (
                <div key={product.id} className="border-b pb-2">
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-gray-500">
                    {(product.price / 100).toFixed(0)} ₽ · {formatDate(product.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Последние заказы</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500">Заказов пока нет</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="border-b pb-2">
                  <p className="text-sm font-medium">{order.customer_name}</p>
                  <p className="text-xs text-gray-500">
                    {(order.total / 100).toFixed(0)} ₽ · {formatDate(order.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
