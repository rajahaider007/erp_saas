import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Clock,
  AlertCircle,
  ShoppingCart,
  ChevronRight,
  Plus,
  Receipt,
} from 'lucide-react';
import App from '@/Pages/App.jsx';

function formatMoney(amount, symbol = '$') {
  const n = Number(amount) || 0;
  return `${symbol}${n.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
}

export default function Dashboard({ kpis, recent_orders, recent_invoices }) {
  const { auth, company } = usePage().props;
  const user = auth?.user;
  const currencySymbol = company?.currency_symbol || company?.default_currency_symbol || '$';

  const statCard = (label, valueNode, Icon, tone) => {
    const tones = {
      green: {
        iconWrap: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
        value: 'text-green-600 dark:text-green-400',
      },
      blue: {
        iconWrap: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        value: 'text-blue-600 dark:text-blue-400',
      },
      orange: {
        iconWrap: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
        value: 'text-orange-600 dark:text-orange-400',
      },
      purple: {
        iconWrap: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
        value: 'text-purple-600 dark:text-purple-400',
      },
    };
    const t = tones[tone] || tones.blue;
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
            <div className={`text-2xl font-bold mt-2 text-gray-900 dark:text-white ${typeof valueNode === 'string' ? t.value : ''}`}>
              {valueNode}
            </div>
          </div>
          <div className={`p-3 rounded-xl ${t.iconWrap}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <App>
      <Head title="Sales Dashboard" />
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-slate-200/80 dark:border-gray-700 overflow-hidden">
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                  <ShoppingCart className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales Dashboard</h1>
                  <p className="text-gray-600 dark:text-gray-300">Track your sales performance and key metrics</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {user?.fname ? `${user.fname} ${user.lname || ''}`.trim() : 'User'}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                  {user?.fname ? user.fname.charAt(0) : 'S'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statCard(
              'Sales This Month',
              formatMoney(kpis?.total_sales_this_month, currencySymbol),
              TrendingUp,
              'green',
            )}
            {statCard(
              'Invoiced This Month',
              formatMoney(kpis?.total_invoiced_this_month, currencySymbol),
              DollarSign,
              'blue',
            )}
            {statCard(
              'Outstanding AR',
              formatMoney(kpis?.total_outstanding_ar, currencySymbol),
              AlertCircle,
              'orange',
            )}
            {statCard('Active Customers', kpis?.active_customers ?? 0, Users, 'purple')}
            {statCard('Pending Quotations', kpis?.pending_quotes ?? 0, FileText, 'blue')}
            {statCard('Overdue Orders', kpis?.overdue_sales_orders ?? 0, Clock, 'orange')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              href={route('sales.customer.create')}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-blue-200 dark:hover:border-blue-800/40"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">New Customer</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Add a customer to your sales master data.</p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300">
                Create now
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href={route('sales.quotation.create')}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/40"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">New Quotation</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Prepare and send a quotation to your customer.</p>
              <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                Create now
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href={route('sales.invoice.create')}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-purple-200 dark:hover:border-purple-800/40"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                  <Receipt className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">New Invoice</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Record a customer invoice for billing and AR.</p>
              <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium group-hover:text-purple-700 dark:group-hover:text-purple-300">
                Create now
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Sales Orders</h2>
                <Link href={route('sales.order.index')} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  View all
                </Link>
              </div>
              <div className="overflow-x-auto p-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2 px-3 font-semibold">SO Number</th>
                      <th className="py-2 px-3 font-semibold">Customer</th>
                      <th className="py-2 px-3 font-semibold">Amount</th>
                      <th className="py-2 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent_orders && recent_orders.length > 0 ? (
                      recent_orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-b border-gray-100 dark:border-gray-700/80 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                          <td className="py-2 px-3">
                            <Link href={route('sales.order.edit', order.id)} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                              {order.so_number}
                            </Link>
                          </td>
                          <td className="py-2 px-3 text-gray-800 dark:text-gray-200">{order.customer?.customer_name || '—'}</td>
                          <td className="py-2 px-3 text-gray-900 dark:text-gray-100">
                            {formatMoney(order.amount_total_base, currencySymbol)}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                order.state === 'closed'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  : order.state === 'confirmed'
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                              }`}
                            >
                              {order.state}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 px-3 text-center text-gray-500 dark:text-gray-400">
                          No recent sales orders.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Invoices</h2>
                <Link href={route('sales.invoice.index')} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  View all
                </Link>
              </div>
              <div className="overflow-x-auto p-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2 px-3 font-semibold">Invoice #</th>
                      <th className="py-2 px-3 font-semibold">Customer</th>
                      <th className="py-2 px-3 font-semibold">Amount</th>
                      <th className="py-2 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent_invoices && recent_invoices.length > 0 ? (
                      recent_invoices.slice(0, 5).map((invoice) => (
                        <tr key={invoice.id} className="border-b border-gray-100 dark:border-gray-700/80 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                          <td className="py-2 px-3">
                            <Link href={route('sales.invoice.edit', invoice.id)} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                              {invoice.invoice_no}
                            </Link>
                          </td>
                          <td className="py-2 px-3 text-gray-800 dark:text-gray-200">{invoice.customer?.customer_name || '—'}</td>
                          <td className="py-2 px-3 text-gray-900 dark:text-gray-100">
                            {formatMoney(invoice.amount_total_base, currencySymbol)}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                invoice.payment_status === 'paid'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                  : invoice.payment_status === 'partial'
                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              }`}
                            >
                              {invoice.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 px-3 text-center text-gray-500 dark:text-gray-400">
                          No recent invoices.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
}
