'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductForm } from './ProductForm';
import { apiJson } from '@/lib/api-client';
import { getErrorMessage } from '@/lib/supabase';
import { getCategoryLabel } from '@/lib/product-recommendations';
import { Product } from '@/types/product';

export function Products({
  initialProducts,
  initialError,
}: {
  initialProducts: Product[];
  initialError: string | null;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { products } = await apiJson<{ products: Product[] }>('/api/products');
      setProducts(products);
    } catch (err) {
      console.error('Ошибка загрузки товаров:', err);
      setError(getErrorMessage(err, 'Не удалось загрузить товары'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (product: Product) => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: product.name,
        description: product.description,
        details: product.details ?? null,
        price: product.price,
        image_url: product.image_url,
        category: product.category,
        stock: product.stock,
        is_popular: product.is_popular ?? false,
        popularity_score: product.popularity_score ?? 0,
      };

      if (editingProduct?.id) {
        await apiJson(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(payload),
        });
      } else {
        await apiJson('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(payload),
        });
      }

      await fetchProducts();
      setShowForm(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Ошибка сохранения товара:', err);
      setError(getErrorMessage(err, 'Не удалось сохранить товар'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Удалить этот товар?')) return;

    try {
      setError(null);
      await apiJson(`/api/products/${id}`, { method: 'DELETE' });
      await fetchProducts();
    } catch (err) {
      console.error('Ошибка удаления товара:', err);
      setError(getErrorMessage(err, 'Не удалось удалить товар'));
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold mb-6">Управление товарами</h1>
        <div className="flex justify-center items-center h-64">
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Управление товарами</h1>
        <Button
          className="w-full sm:w-auto shrink-0 bg-[#2D2D2D] text-white hover:bg-[#3D3D3D] hover:text-white"
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить товар
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 flex items-center justify-between gap-4">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchProducts}>
            Повторить
          </Button>
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleSaveProduct}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      {saving && <p className="mb-4 text-sm text-gray-500">Сохранение...</p>}

      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 mb-2">Товаров пока нет</p>
          <p className="text-sm text-gray-500">Нажмите «Добавить товар», чтобы создать первый</p>
        </div>
      ) : (
        <>
          <div className="lg:hidden space-y-3">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow p-4 space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {getCategoryLabel(product.category)} · {(product.price / 100).toFixed(0)} ₽ · на складе:{' '}
                    {product.stock}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditingProduct(product);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Изменить
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">На складе</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getCategoryLabel(product.category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(product.price / 100).toFixed(0)} ₽
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}
    </div>
  );
}
