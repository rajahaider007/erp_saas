import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import SalesPageShell from '@/Components/Sales/PageShell';

export default function DeliveryOrderIndex({ deliveries, filters = {} }) {
  const [search, setSearch] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || '');

  const handleSearch = () => {
    router.get(route('sales.delivery.index'), {
      search,
      status: statusFilter,
    });
  };

  const handleDelete = (id) => {
    if (confirm('آپ یقینی ہیں کہ اس delivery کو حذف کریں گے؟')) {
      router.delete(route('sales.delivery.destroy', id));
    }
  };

  const getStateColor = (state) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      in_transit: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[state] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <SalesPageShell>
      <Head title="Delivery Orders" />
      <div className="mx-auto max-w-7xl text-gray-900 dark:text-gray-100">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Delivery Orders</h1>
          <Link
            href={route('sales.delivery.create')}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Plus size={20} />
            نیا Delivery
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">تلاش کریں</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Delivery یا Order کی تلاش کریں"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Search size={20} />
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">حالت</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100"
            >
              <option value="">تمام</option>
              <option value="draft">ڈرافٹ</option>
              <option value="assigned">مقرر کیا ہوا</option>
              <option value="in_transit">ترسیل میں</option>
              <option value="delivered">ڈیلیور شدہ</option>
              <option value="cancelled">منسوخ</option>
            </select>
          </div>
        </div>

        {deliveries.data && deliveries.data.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Delivery No</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Sales Order</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">حالت</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Tracking</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">اعمال</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {deliveries.data.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{delivery.delivery_no}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{delivery.sales_order?.sales_order_no}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{delivery.customer?.customer_name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStateColor(delivery.state)}`}>
                          {delivery.state}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{delivery.tracking_no || '-'}</td>
                      <td className="px-6 py-4 text-center text-sm">
                        <div className="flex justify-center gap-2">
                          {delivery.state === 'draft' && (
                            <Link
                              href={route('sales.delivery.edit', delivery.id)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="ترمیم"
                            >
                              <Edit size={18} />
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(delivery.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="حذف"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {deliveries.links && deliveries.links.length > 0 && (
              <div className="mt-6 flex justify-center gap-2">
                {deliveries.links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      link.active
                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-500 dark:text-gray-400">کوئی delivery نہیں ملا</p>
            <Link
              href={route('sales.delivery.create')}
              className="mt-4 inline-block text-blue-600 hover:text-blue-900 dark:text-blue-400"
            >
              نیا delivery بنائیں
            </Link>
          </div>
        )}
      </div>
    </SalesPageShell>
  );
}
