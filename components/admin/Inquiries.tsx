'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Mail, ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiJson } from '@/lib/api-client';
import {
  formatOrderDetails,
  formatOrderItemExtras,
  formatRublesFromKopecks,
  getPickupStoreLabel,
  isOrderProcessed,
  normalizeOrderItems,
} from '@/lib/order-display';
import { Inquiry } from '@/types/inquiry';
import { Order } from '@/types/order';

type Entry =
  | { kind: 'inquiry'; data: Inquiry }
  | { kind: 'order'; data: Order };

function getTimestamp(value: unknown): number {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function Inquiries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      const [inquiriesData, ordersData] = await Promise.all([
        apiJson<{ inquiries: Inquiry[] }>('/api/inquiries'),
        apiJson<{ orders: Order[] }>('/api/orders'),
      ]);

      const merged: Entry[] = [
        ...(inquiriesData.inquiries ?? []).map((data) => ({ kind: 'inquiry' as const, data })),
        ...(ordersData.orders ?? []).map((data) => ({ kind: 'order' as const, data })),
      ].sort((a, b) => getTimestamp(b.data.created_at) - getTimestamp(a.data.created_at));

      setEntries(merged);
    } catch (err) {
      console.error('Ошибка загрузки заявок:', err);
      setError(err instanceof Error ? err.message : 'Не удалось загрузить заявки');
    } finally {
      setLoading(false);
    }
  };

  const newCount = useMemo(
    () =>
      entries.filter((entry) =>
        entry.kind === 'inquiry'
          ? entry.data.status === 'new'
          : !isOrderProcessed(entry.data.status)
      ).length,
    [entries]
  );

  const handleInquiryStatusChange = async (inquiry: Inquiry) => {
    const nextStatus = inquiry.status === 'new' ? 'responded' : 'new';

    await apiJson(`/api/inquiries/${inquiry.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });

    setEntries((prev) =>
      prev.map((entry) =>
        entry.kind === 'inquiry' && entry.data.id === inquiry.id
          ? { ...entry, data: { ...entry.data, status: nextStatus } }
          : entry
      )
    );

    if (selectedEntry?.kind === 'inquiry' && selectedEntry.data.id === inquiry.id) {
      setSelectedEntry({ kind: 'inquiry', data: { ...inquiry, status: nextStatus } });
    }
  };

  const handleOrderStatusChange = async (order: Order) => {
    const nextStatus = isOrderProcessed(order.status) ? 'new' : 'completed';

    await apiJson(`/api/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });

    setEntries((prev) =>
      prev.map((entry) =>
        entry.kind === 'order' && entry.data.id === order.id
          ? { ...entry, data: { ...entry.data, status: nextStatus } }
          : entry
      )
    );

    if (selectedEntry?.kind === 'order' && selectedEntry.data.id === order.id) {
      setSelectedEntry({ kind: 'order', data: { ...order, status: nextStatus } });
    }
  };

  const handleStatusChange = async (entry: Entry) => {
    try {
      setError(null);
      if (entry.kind === 'inquiry') {
        await handleInquiryStatusChange(entry.data);
      } else {
        await handleOrderStatusChange(entry.data);
      }
    } catch (err) {
      console.error('Ошибка обновления:', err);
      setError(err instanceof Error ? err.message : 'Не удалось обновить статус');
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('ru-RU');
  };

  const isProcessed = (entry: Entry) =>
    entry.kind === 'inquiry'
      ? entry.data.status === 'responded'
      : isOrderProcessed(entry.data.status);

  const entryName = (entry: Entry) =>
    entry.kind === 'inquiry' ? entry.data.name : entry.data.customer_name || '—';

  const entryContact = (entry: Entry) => {
    if (entry.kind === 'inquiry') {
      return entry.data.phone || entry.data.email || '—';
    }
    return entry.data.phone || '—';
  };

  const entrySummary = (entry: Entry) => {
    if (entry.kind === 'inquiry') {
      return entry.data.message;
    }
    const items = normalizeOrderItems(entry.data.items);
    const itemsText = items.map((item) => `${item.name} ×${item.quantity}`).join(', ');
    return `${itemsText || 'Без товаров'} · ${formatRublesFromKopecks(entry.data.total)}`;
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold mb-6">Заявки и заказы</h1>
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Заявки и заказы</h1>
          <p className="text-sm text-gray-500 mt-1">
            Сообщения с сайта и оформленные заказы в одном списке
          </p>
        </div>
        {newCount > 0 && (
          <span className="self-start rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
            Новых: {newCount}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 flex items-center justify-between gap-4">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchEntries}>
            Повторить
          </Button>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Заявок и заказов пока нет
        </div>
      ) : (
        <>
          <div className="lg:hidden space-y-3">
            {entries.map((entry) => (
              <div
                key={`${entry.kind}-${entry.data.id}`}
                className="bg-white rounded-lg shadow p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold shrink-0 ${
                      entry.kind === 'order'
                        ? 'bg-[#F3EBE6] text-[#5E4037]'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {entry.kind === 'order' ? (
                      <>
                        <ShoppingBag className="h-3 w-3" /> Заказ
                      </>
                    ) : (
                      <>
                        <Mail className="h-3 w-3" /> Заявка
                      </>
                    )}
                  </span>
                  <span
                    className={`px-2 text-xs font-semibold rounded-full shrink-0 ${
                      isProcessed(entry)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {isProcessed(entry) ? 'обработан' : 'новый'}
                  </span>
                </div>

                <div>
                  <p className="font-medium text-gray-900">{entryName(entry)}</p>
                  <p className="text-sm text-gray-500">{entryContact(entry)}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(entry.data.created_at)}
                  </p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{entrySummary(entry)}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    Просмотр
                  </Button>
                  <Button
                    variant={isProcessed(entry) ? 'outline' : 'brand'}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleStatusChange(entry)}
                  >
                    {isProcessed(entry) ? (
                      <>
                        <X className="h-4 w-4 mr-1" /> Переоткрыть
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" /> Обработано
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тип
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Имя
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Контакт
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Кратко
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.map((entry) => (
                <tr key={`${entry.kind}-${entry.data.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                        entry.kind === 'order'
                          ? 'bg-[#F3EBE6] text-[#5E4037]'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {entry.kind === 'order' ? (
                        <>
                          <ShoppingBag className="h-3 w-3" /> Заказ
                        </>
                      ) : (
                        <>
                          <Mail className="h-3 w-3" /> Заявка
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entryName(entry)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entryContact(entry)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {entrySummary(entry)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(entry.data.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        isProcessed(entry)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isProcessed(entry) ? 'обработан' : 'новый'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedEntry(entry)}>
                      Просмотр
                    </Button>
                    <Button
                      variant={isProcessed(entry) ? 'outline' : 'brand'}
                      size="sm"
                      onClick={() => handleStatusChange(entry)}
                    >
                      {isProcessed(entry) ? (
                        <>
                          <X className="h-4 w-4 mr-1" /> Переоткрыть
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Обработано
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}

      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl p-4 sm:p-6 w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-start gap-3 mb-4">
              <h2 className="text-lg sm:text-xl font-bold pr-2">
                {selectedEntry.kind === 'order' ? 'Детали заказа' : 'Детали заявки'}
              </h2>
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setSelectedEntry(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {selectedEntry.kind === 'inquiry' ? (
              <InquiryDetails inquiry={selectedEntry.data} formatDate={formatDate} />
            ) : (
              <OrderDetails order={selectedEntry.data} formatDate={formatDate} />
            )}

            <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setSelectedEntry(null)}
              >
                Закрыть
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={() => {
                  handleStatusChange(selectedEntry);
                  setSelectedEntry(null);
                }}
                variant={isProcessed(selectedEntry) ? 'outline' : 'brand'}
              >
                {isProcessed(selectedEntry) ? (
                  <>
                    <X className="h-4 w-4 mr-1" /> Переоткрыть
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" /> Отметить как обработанное
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InquiryDetails({
  inquiry,
  formatDate,
}: {
  inquiry: Inquiry;
  formatDate: (value?: string) => string;
}) {
  return (
    <div className="space-y-4">
      <DetailField label="От" value={inquiry.name} />
      {inquiry.email && <DetailField label="Email" value={inquiry.email} />}
      {inquiry.phone && <DetailField label="Телефон" value={inquiry.phone} />}
      <DetailField label="Дата" value={formatDate(inquiry.created_at)} />
      <DetailField label="Сообщение" value={inquiry.message} multiline />
    </div>
  );
}

function OrderDetails({
  order,
  formatDate,
}: {
  order: Order;
  formatDate: (value?: string) => string;
}) {
  const items = normalizeOrderItems(order.items);
  const recipientAddress =
    order.recipient_address || [order.street, order.house].filter(Boolean).join(', ');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatOrderDetails(order));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-gray-500">Заказ от {formatDate(order.created_at)}</p>
        <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={handleCopy}>
          Скопировать
        </Button>
      </div>

      <DetailField label="Заказчик" value={order.customer_name || '—'} />
      <DetailField label="Телефон заказчика" value={order.phone || '—'} />
      <DetailField
        label="Способ получения"
        value={order.delivery_method === 'pickup' ? 'Самовывоз' : 'Курьер'}
      />

      {order.delivery_method === 'pickup' ? (
        <DetailField
          label="Точка самовывоза"
          value={getPickupStoreLabel(order.pickup_store) || '—'}
        />
      ) : (
        <>
          <DetailField label="Имя получателя" value={order.recipient_name || '—'} />
          <DetailField label="Телефон получателя" value={order.recipient_phone || '—'} />
          <DetailField label="Адрес доставки" value={recipientAddress || '—'} />
          <DetailField label="Время доставки" value={order.delivery_time || '—'} />
        </>
      )}

      {order.special_wishes?.trim() && (
        <DetailField label="Особые пожелания" value={order.special_wishes.trim()} multiline />
      )}

      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">Состав заказа</h3>
        <div className="rounded-lg border border-gray-200 divide-y">
          {items.length === 0 ? (
            <p className="p-3 text-sm text-gray-500">Товары не указаны</p>
          ) : (
            items.map((item) => {
              const extras = formatOrderItemExtras(item);
              return (
                <div key={`${item.id}-${item.name}`} className="p-3 text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatRublesFromKopecks(item.price * item.quantity)}
                    </span>
                  </div>
                  {extras.map((line) => (
                    <p key={line} className="text-xs text-gray-500 pl-1">
                      {line}
                    </p>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Товары</span>
          <span>{formatRublesFromKopecks(order.items_total)}</span>
        </div>
        <div className="flex justify-between">
          <span>Доставка</span>
          <span>{formatRublesFromKopecks(order.delivery_cost)}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2">
          <span>Итого</span>
          <span>{formatRublesFromKopecks(order.total)}</span>
        </div>
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500">{label}</h3>
      <p className={`mt-1 text-sm text-gray-900 ${multiline ? 'whitespace-pre-line' : ''}`}>
        {value}
      </p>
    </div>
  );
}
