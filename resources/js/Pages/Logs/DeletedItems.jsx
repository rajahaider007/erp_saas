import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { Trash2, Search, RotateCcw, Eye, AlertTriangle, Clock, User, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DeletedItems({ deletedItems, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [table, setTable] = useState(filters.table || '');
    const [restoring, setRestoring] = useState(null);

    const handleFilter = () => {
        router.get(route('logs.deleted-items'), {
            search,
            table
        });
    };

    const handleRestore = async (id) => {
        if (!confirm('Are you sure you want to restore this item?')) {
            return;
        }

        setRestoring(id);

        try {
            const response = await fetch(route('logs.restore', id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });

            const data = await response.json();

            if (data.success) {
                alert('Item restored successfully!');
                router.reload();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            alert('Error restoring item. Please try again.');
        } finally {
            setRestoring(null);
        }
    };

    const getDaysRemainingClass = (days) => {
        if (days <= 7) return 'text-red-600 font-bold';
        if (days <= 30) return 'text-yellow-600 font-semibold';
        return 'text-green-600';
    };

    return (
        <AppLayout>
            <Head title="Deleted Items Recovery" />

            <div className="form-theme-system min-h-screen p-6">
                {/* Header */}
                <div className="manager-header">
                    <div className="header-main">
                        <div className="title-section">
                            <h1 className="page-title">
                                <Trash2 className="title-icon" size={32} />
                                Deleted Items Recovery
                            </h1>
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle size={20} className="text-yellow-600" />
                                    <div>
                                        <p className="text-sm font-semibold text-yellow-800">
                                            Items are automatically deleted after 90 days
                                        </p>
                                        <p className="text-xs text-yellow-700 mt-1">
                                            Restore important data before expiry to prevent permanent loss
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="stats-summary mt-4">
                                <div className="stat-item">
                                    <Trash2 size={16} />
                                    <span>Total: {deletedItems.total} items</span>
                                </div>
                            </div>
                        </div>
                        <div className="header-actions">
                            <Link href={route('logs.activity')} className="btn btn-secondary btn-sm">
                                <Calendar size={16} />
                                Activity Logs
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="filter-group">
                        <div className="search-container">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search deleted items..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                            />
                        </div>

                        <select
                            className="filter-select"
                            value={table}
                            onChange={(e) => setTable(e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="transactions">Journal Vouchers</option>
                            <option value="tbl_chart_of_accounts">Chart of Accounts</option>
                            <option value="tbl_users">Users</option>
                        </select>
                    </div>

                    <div className="view-controls">
                        <button onClick={handleFilter} className="btn btn-primary btn-sm">
                            <Search size={16} />
                            Search
                        </button>
                        <button onClick={() => router.get(route('logs.deleted-items'))} className="btn btn-secondary btn-sm">
                            <RotateCcw size={16} />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Deleted Items Grid */}
                <div className="main-content">
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-4">
                            {deletedItems.data.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-300"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            {/* Item Identifier */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-red-100 rounded-lg">
                                                    <Trash2 size={20} className="text-red-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-800">
                                                        {item.record_identifier || `Record #${item.original_id}`}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        Type: {item.original_table}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Deletion Info */}
                                            <div className="grid grid-cols-2 gap-4 mt-4">
                                                <div className="flex items-center gap-2">
                                                    <User size={14} className="text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Deleted By</p>
                                                        <p className="text-sm font-semibold text-gray-700">
                                                            {item.deleted_by_name}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} className="text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Deleted On</p>
                                                        <p className="text-sm font-semibold text-gray-700">
                                                            {new Date(item.deleted_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Delete Reason */}
                                            {item.delete_reason && (
                                                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                    <p className="text-xs text-gray-500">Reason for Deletion</p>
                                                    <p className="text-sm text-gray-700 mt-1">
                                                        {item.delete_reason}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Recovery Info & Actions */}
                                        <div className="ml-6 text-right">
                                            <div className="mb-4">
                                                <p className="text-xs text-gray-500 mb-1">Recovery Expires In</p>
                                                <p className={`text-2xl font-bold ${getDaysRemainingClass(item.days_remaining)}`}>
                                                    {item.days_remaining} days
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(item.recovery_expires_at).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => handleRestore(item.id)}
                                                    disabled={restoring === item.id}
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    {restoring === item.id ? (
                                                        <>
                                                            <div className="loading-spinner" style={{width: 16, height: 16}}></div>
                                                            Restoring...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <RotateCcw size={16} />
                                                            Restore
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {deletedItems.data.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="empty-state">
                                        <Trash2 size={48} className="empty-icon" />
                                        <p className="text-gray-500 mt-4 text-lg font-semibold">No deleted items found</p>
                                        <p className="text-sm text-gray-400 mt-2">All clear! No items waiting for recovery.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {deletedItems.last_page > 1 && (
                            <div className="pagination-container mt-6">
                                <div className="pagination-info">
                                    <p className="results-info">
                                        Showing {deletedItems.from} to {deletedItems.to} of {deletedItems.total} items
                                    </p>
                                </div>

                                <div className="pagination-controls">
                                    <button
                                        className="pagination-btn"
                                        disabled={deletedItems.current_page === 1}
                                        onClick={() => router.get(deletedItems.prev_page_url)}
                                    >
                                        <ChevronLeft size={16} />
                                    </button>

                                    <div className="page-numbers">
                                        {[...Array(deletedItems.last_page)].map((_, i) => {
                                            const page = i + 1;
                                            if (
                                                page === 1 ||
                                                page === deletedItems.last_page ||
                                                (page >= deletedItems.current_page - 1 && page <= deletedItems.current_page + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={page}
                                                        className={`pagination-btn ${page === deletedItems.current_page ? 'active' : ''}`}
                                                        onClick={() => router.get(route('logs.deleted-items', { ...filters, page }))}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            } else if (
                                                page === deletedItems.current_page - 2 ||
                                                page === deletedItems.current_page + 2
                                            ) {
                                                return <span key={page} className="pagination-ellipsis">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>

                                    <button
                                        className="pagination-btn"
                                        disabled={deletedItems.current_page === deletedItems.last_page}
                                        onClick={() => router.get(deletedItems.next_page_url)}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

