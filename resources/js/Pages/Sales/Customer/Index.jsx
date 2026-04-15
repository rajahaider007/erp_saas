import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import SalesPageShell from '@/Components/Sales/PageShell';

export default function CustomerIndex({ customers, filters }) {
  const [search, setSearch] = useState(filters?.search || '');

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('sales.customer.index'), { search }, { preserveScroll: true });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      router.delete(route('sales.customer.destroy', id));
    }
  };

  const rows = customers?.data ?? [];
  const isEmpty = rows.length === 0;

  return (
    <SalesPageShell>
      <Head title="Customers" />
      <div className="max-w-7xl mx-auto space-y-6 text-gray-900 dark:text-gray-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customers</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your customer database</p>
          </div>
          <Link
            href={route('sales.customer.create')}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Plus size={18} />
            Add Customer
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/30 p-4 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer name, code, or email..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Search
            </button>
          </form>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Customer Code</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Customer Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {!isEmpty ? (
                rows.map((customer) => (
                  <tr key={customer.id} className="transition hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200">{customer.customer_code}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{customer.customer_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{customer.customer_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{customer.primary_email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          customer.active_status
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                      >
                        {customer.active_status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Link
                          href={route('sales.customer.edit', customer.id)}
                          className="text-blue-600 transition hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 transition hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-600 dark:text-gray-400">
                    No customers found.{' '}
                    <Link href={route('sales.customer.create')} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                      Create one now
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {customers?.links && customers.links.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {customers.links.map((link, index) => (
              <Link
                key={index}
                href={link.url || '#'}
                className={`rounded px-3 py-1 text-sm ${
                  link.active
                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                    : link.url
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
                      : 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                }`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </div>
    </SalesPageShell>
  );
}
