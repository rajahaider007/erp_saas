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
                {/* Professional Header */}
                <div className="recovery-header">
                    <div className="header-content">
                        <div className="header-left">
                            <div className="page-title-section">
                                <div className="title-icon-wrapper">
                                    <Trash2 size={32} className="title-icon" />
                                </div>
                                <div className="title-text">
                                    <h1 className="page-title">Deleted Items Recovery</h1>
                                    <p className="page-subtitle">Restore and manage deleted system data</p>
                                </div>
                            </div>
                        </div>
                        <div className="header-right">
                            <Link href={route('logs.activity')} className="btn-secondary-professional">
                                <Calendar size={16} />
                                Activity Logs
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Professional Warning Card */}
                <div className="warning-card">
                    <div className="warning-content">
                        <div className="warning-icon">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="warning-text">
                            <h3 className="warning-title">Automatic Deletion Notice</h3>
                            <p className="warning-description">
                                Items are automatically deleted after 90 days. Restore important data before expiry to prevent permanent loss.
                            </p>
                        </div>
                        <div className="warning-badge">
                            <span className="badge-critical">Critical</span>
                        </div>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="stats-overview">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Trash2 size={20} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{deletedItems.total}</div>
                            <div className="stat-label">Total Items</div>
                        </div>
                    </div>
                </div>

                {/* Professional Filters */}
                <div className="professional-filters-container">
                    <div className="filters-row">
                        <div className="filter-group">
                            <label className="filter-label">🔍 Search Items</label>
                            <div className="search-container">
                                <Search className="search-icon" size={20} />
                                <input
                                    type="text"
                                    className="professional-search-input"
                                    placeholder="Search deleted items..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                                />
                            </div>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">📋 Filter by Type</label>
                            <select
                                className="professional-select"
                                value={table}
                                onChange={(e) => setTable(e.target.value)}
                            >
                                <option value="">📊 All Types</option>
                                <option value="transactions">📝 Journal Vouchers</option>
                                <option value="tbl_chart_of_accounts">📈 Chart of Accounts</option>
                                <option value="tbl_users">👥 Users</option>
                            </select>
                        </div>

                        <div className="filter-actions">
                            <button onClick={handleFilter} className="btn-primary-professional">
                                <Search size={16} />
                                Search
                            </button>
                            <button onClick={() => router.get(route('logs.deleted-items'))} className="btn-secondary-professional">
                                <RotateCcw size={16} />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Professional Deleted Items Grid */}
                <div className="main-content">
                    <div className="deleted-items-grid">
                        {deletedItems.data.map((item) => (
                            <div key={item.id} className="deleted-item-card">
                                <div className="item-header">
                                    <div className="item-icon">
                                        <Trash2 size={24} />
                                    </div>
                                    <div className="item-info">
                                        <h3 className="item-title">
                                            {item.record_identifier || `Record #${item.original_id}`}
                                        </h3>
                                        <p className="item-type">
                                            📋 {item.original_table}
                                        </p>
                                    </div>
                                    <div className="item-status">
                                        <span className={`status-badge ${getDaysRemainingClass(item.days_remaining).includes('red') ? 'critical' : getDaysRemainingClass(item.days_remaining).includes('yellow') ? 'warning' : 'safe'}`}>
                                            {item.days_remaining} days left
                                        </span>
                                    </div>
                                </div>

                                <div className="item-details">
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <User size={16} />
                                            </div>
                                            <div className="detail-content">
                                                <div className="detail-label">Deleted By</div>
                                                <div className="detail-value">{item.deleted_by_name}</div>
                                            </div>
                                        </div>

                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <Clock size={16} />
                                            </div>
                                            <div className="detail-content">
                                                <div className="detail-label">Deleted On</div>
                                                <div className="detail-value">
                                                    {new Date(item.deleted_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {item.delete_reason && (
                                        <div className="reason-section">
                                            <div className="reason-label">📝 Reason for Deletion</div>
                                            <div className="reason-text">{item.delete_reason}</div>
                                        </div>
                                    )}
                                </div>

                                <div className="item-actions">
                                    <div className="recovery-info">
                                        <div className="recovery-label">⏰ Recovery Expires</div>
                                        <div className="recovery-date">
                                            {new Date(item.recovery_expires_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRestore(item.id)}
                                        disabled={restoring === item.id}
                                        className="btn-restore"
                                    >
                                        {restoring === item.id ? (
                                            <>
                                                <div className="loading-spinner" style={{width: 16, height: 16}}></div>
                                                Restoring...
                                            </>
                                        ) : (
                                            <>
                                                <RotateCcw size={16} />
                                                Restore Item
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}

                        {deletedItems.data.length === 0 && (
                            <div className="empty-state-container">
                                <div className="empty-state">
                                    <div className="empty-icon">
                                        <Trash2 size={64} />
                                    </div>
                                    <div className="empty-title">No Deleted Items</div>
                                    <div className="empty-description">All clear! No items waiting for recovery.</div>
                                    <div className="empty-badge">
                                        <span className="badge-success">🛡️ System Clean</span>
                                    </div>
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
        </AppLayout>
    );
}

