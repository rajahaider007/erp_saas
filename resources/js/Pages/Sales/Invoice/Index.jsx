import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Search, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import SalesPageShell from '@/Components/Sales/PageShell';

export default function InvoiceIndex({ invoices, filters = {} }) {
  const [search, setSearch] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || '');

  const handleSearch = () => {
    router.get(route('sales.invoice.index'), {
      search,
      status: statusFilter,
    });
  };

  const handleDelete = (id) => {
    if (confirm('آپ یقینی ہیں کہ اس invoice کو حذف کریں گے؟')) {
      router.delete(route('sales.invoice.destroy', id));
    }
  };

  const handlePost = (id) => {
    if (confirm('آپ یقینی ہیں کہ اس invoice کو post کریں گے؟')) {
      router.post(route('sales.invoice.post', id));
    }
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      unpaid: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      partial: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <SalesPageShell>
      <Head title="Sales Invoices" />
      <div className="mx-auto max-w-7xl text-gray-900 dark:text-gray-100">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales Invoices</h1>
          <Link
            href={route('sales.invoice.create')}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Plus size={20} />
            نیا بل
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
                placeholder="Invoice یا Customer کی تلاش کریں"
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
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">حالتِ ادائیگی</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100"
            >
              <option value="">تمام</option>
              <option value="unpaid">ادا نہیں شدہ</option>
              <option value="partial">جزوی ادا</option>
              <option value="paid">ادا شدہ</option>
            </select>
          </div>
        </div>

        {invoices.data && invoices.data.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Invoice No</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Customer</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">مقدار</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">حالتِ ادائیگی</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Due Date</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">اعمال</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {invoices.data.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{invoice.invoice_no}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{invoice.customer?.customer_name}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                        {parseFloat(invoice.amount_total).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusColor(invoice.payment_status)}`}>
                          {invoice.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('ur-PK') : '-'}
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        <div className="flex justify-center gap-2">
                          {invoice.state === 'draft' && (
                            <>
                              <Link
                                href={route('sales.invoice.edit', invoice.id)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="ترمیم"
                              >
                                <Edit size={18} />
                              </Link>
                              <button
                                type="button"
                                onClick={() => handlePost(invoice.id)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                title="Post"
                              >
                                <CheckCircle size={18} />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(invoice.id)}
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

            {invoices.links && invoices.links.length > 0 && (
              <div className="mt-6 flex justify-center gap-2">
                {invoices.links.map((link, index) => (
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
            <p className="text-lg text-gray-500 dark:text-gray-400">کوئی invoice نہیں ملا</p>
            <Link
              href={route('sales.invoice.create')}
              className="mt-4 inline-block text-blue-600 hover:text-blue-900 dark:text-blue-400"
            >
              نیا بل بنائیں
            </Link>
          </div>
        )}
      </div>
    </SalesPageShell>
  );
}
