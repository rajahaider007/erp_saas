import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import SalesPageShell from '@/Components/Sales/PageShell';

export default function PaymentIndex({ payments, filters = {} }) {
  const [search, setSearch] = useState(filters.search || '');
  const [methodFilter, setMethodFilter] = useState(filters.method || '');

  const handleSearch = () => {
    router.get(route('sales.payment.index'), {
      search,
      method: methodFilter,
    });
  };

  const handleDelete = (id) => {
    if (confirm('آپ یقینی ہیں کہ اس payment کو حذف کریں گے؟')) {
      router.delete(route('sales.payment.destroy', id));
    }
  };

  const getMethodColor = (method) => {
    const colors = {
      bank_transfer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      cheque: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      cash: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      online: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      credit_card: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return colors[method] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <SalesPageShell>
      <Head title="Sales Payments" />
      <div className="mx-auto max-w-7xl text-gray-900 dark:text-gray-100">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales Payments</h1>
          <Link
            href={route('sales.payment.create')}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Plus size={20} />
            نیا ادائیگی
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
                placeholder="Payment یا Customer کی تلاش کریں"
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
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">طریقہ</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100"
            >
              <option value="">تمام</option>
              <option value="bank_transfer">بینک منتقلی</option>
              <option value="cheque">چیک</option>
              <option value="cash">نقد</option>
              <option value="online">آن لائن</option>
              <option value="credit_card">کریڈٹ کارڈ</option>
            </select>
          </div>
        </div>

        {payments.data && payments.data.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Payment No</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Customer</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">مقدار</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">طریقہ</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">تاریخ</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">اعمال</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {payments.data.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{payment.payment_no}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{payment.customer?.customer_name}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                        {parseFloat(payment.payment_amount).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getMethodColor(payment.payment_method)}`}>
                          {payment.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(payment.payment_date).toLocaleDateString('ur-PK')}
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={route('sales.payment.show', payment.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="دیکھیں"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(payment.id)}
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

            {payments.links && payments.links.length > 0 && (
              <div className="mt-6 flex justify-center gap-2">
                {payments.links.map((link, index) => (
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
            <p className="text-lg text-gray-500 dark:text-gray-400">کوئی ادائیگی نہیں ملی</p>
            <Link
              href={route('sales.payment.create')}
              className="mt-4 inline-block text-blue-600 hover:text-blue-900 dark:text-blue-400"
            >
              نیا ادائیگی درج کریں
            </Link>
          </div>
        )}
      </div>
    </SalesPageShell>
  );
}
