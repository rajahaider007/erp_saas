import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import SalesPageShell from '@/Components/Sales/PageShell';

export default function QuotationIndex({ quotations, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleSearch = () => {
        router.get(route('sales.quotation.index'), {
            search,
            status: statusFilter,
        });
    };

    const handleDelete = (id) => {
        if (confirm('آپ یقینی ہیں کہ اس quotation کو حذف کریں گے؟')) {
            router.delete(route('sales.quotation.destroy', id));
        }
    };

    const getStateColor = (state) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        };
        return colors[state] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    };

    return (
        <SalesPageShell>
            <Head title="Quotations" />
            <div className="max-w-7xl mx-auto text-gray-900 dark:text-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quotations</h1>
                    <Link
                        href={route('sales.quotation.create')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                        <Plus size={20} />
                        نیا Quotation
                    </Link>
                </div>

                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تلاش کریں</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Quotation یا Customer کی تلاش کریں"
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                            />
                            <button
                                onClick={handleSearch}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                <Search size={20} />
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">حالت</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100"
                        >
                            <option value="">تمام</option>
                            <option value="draft">ڈرافٹ</option>
                            <option value="sent">بھیجی ہوئی</option>
                            <option value="confirmed">تصدیق شدہ</option>
                            <option value="cancelled">منسوخ</option>
                            <option value="expired">ختم شدہ</option>
                        </select>
                    </div>
                </div>

                {quotations.data && quotations.data.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-600">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Quotation No</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Customer</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">مقدار</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">حالت</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">تاریخ</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">اعمال</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                    {quotations.data.map((quotation) => (
                                        <tr key={quotation.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                {quotation.quotation_no}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                {quotation.customer?.customer_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white font-medium">
                                                {parseFloat(quotation.amount_total).toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStateColor(quotation.state)}`}>
                                                    {quotation.state}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                                {new Date(quotation.quotation_date).toLocaleDateString('ur-PK')}
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm">
                                                <div className="flex justify-center gap-2">
                                                    {quotation.state === 'draft' && (
                                                        <Link
                                                            href={route('sales.quotation.edit', quotation.id)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="ترمیم"
                                                        >
                                                            <Edit size={18} />
                                                        </Link>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(quotation.id)}
                                                        className="text-red-600 hover:text-red-900"
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

                        {quotations.links && quotations.links.length > 0 && (
                            <div className="mt-6 flex justify-center gap-2">
                                {quotations.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 rounded-lg text-sm ${
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
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">کوئی quotation نہیں ملا</p>
                        <Link
                            href={route('sales.quotation.create')}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mt-4 inline-block"
                        >
                            نیا quotation بنائیں
                        </Link>
                    </div>
                )}
            </div>
        </SalesPageShell>
    );
}
