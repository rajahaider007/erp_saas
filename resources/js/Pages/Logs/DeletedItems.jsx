import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';
import AppLayout from '../../Layouts/AppLayout';
import {
    Trash2,
    Search,
    RotateCcw,
    AlertTriangle,
    Clock,
    User,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Shield,
    Globe,
    X,
    FileWarning,
} from 'lucide-react';

const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

export default function DeletedItems({ deletedItems, filters, tableOptions = [] }) {
    const { t } = useTranslations();
    const [search, setSearch] = useState(filters.search || '');
    const [table, setTable] = useState(filters.table || '');
    const [busyId, setBusyId] = useState(null);
    const [busyAction, setBusyAction] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [modal, setModal] = useState(null);

    const handleFilter = () => {
        router.get(route('logs.deleted-items'), {
            search,
            table,
            per_page: filters.per_page,
        });
    };

    const postJson = async (url) => {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({}),
        });
        return response.json().then((data) => ({ ok: response.ok, data }));
    };

    const runRestore = async (id) => {
        setBusyId(id);
        setBusyAction('restore');
        setFeedback(null);
        try {
            const { ok, data } = await postJson(route('logs.restore', id));
            if (ok && data.success) {
                setFeedback({ type: 'success', message: data.message });
                setModal(null);
                router.reload({ preserveScroll: true });
            } else {
                setFeedback({ type: 'error', message: data.message || 'Error' });
            }
        } catch {
            setFeedback({ type: 'error', message: t('logs.deleted_items.restore_item') });
        } finally {
            setBusyId(null);
            setBusyAction(null);
        }
    };

    const runPurge = async (id) => {
        setBusyId(id);
        setBusyAction('purge');
        setFeedback(null);
        try {
            const { ok, data } = await postJson(route('logs.purge-recovery', id));
            if (ok && data.success) {
                setFeedback({ type: 'success', message: data.message });
                setModal(null);
                router.reload({ preserveScroll: true });
            } else {
                setFeedback({ type: 'error', message: data.message || 'Error' });
            }
        } catch {
            setFeedback({ type: 'error', message: t('logs.deleted_items.remove_backup') });
        } finally {
            setBusyId(null);
            setBusyAction(null);
        }
    };

    const daysRemainingBadge = (days) => {
        const n = Math.max(0, Number(days) || 0);
        if (n <= 7) return { className: 'critical', label: t('logs.deleted_items.days_left', { n }) };
        if (n <= 30) return { className: 'warning', label: t('logs.deleted_items.days_left', { n }) };
        return { className: 'safe', label: t('logs.deleted_items.days_left', { n }) };
    };

    const displayName = (item) => (item.deleted_by_name || '').trim() || t('logs.deleted_items.unknown_user');

    return (
        <AppLayout>
            <Head title={t('logs.deleted_items.deleted_items_recovery')} />

            <div className="form-theme-system min-h-screen p-6">
                <div className="recovery-header">
                    <div className="header-content">
                        <div className="header-left">
                            <div className="page-title-section">
                                <div className="title-icon-wrapper">
                                    <Trash2 size={32} className="title-icon" />
                                </div>
                                <div className="title-text">
                                    <h1 className="page-title">{t('logs.deleted_items.deleted_items_recovery')}</h1>
                                    <p className="page-subtitle">{t('logs.deleted_items.restore_and_manage_deleted_system_data')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="header-right">
                            <Link href={route('logs.activity')} className="btn-secondary-professional">
                                <Calendar size={16} />
                                <span>{t('logs.deleted_items.activity_logs')}</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="recovery-trust-card">
                    <div className="recovery-trust-icon">
                        <Shield size={22} />
                    </div>
                    <p className="recovery-trust-text">{t('logs.deleted_items.trust_intro')}</p>
                </div>

                {feedback && (
                    <div className={`recovery-feedback recovery-feedback--${feedback.type}`} role="status">
                        {feedback.type === 'success' ? <RotateCcw size={18} /> : <FileWarning size={18} />}
                        <span>{feedback.message}</span>
                        <button type="button" className="recovery-feedback-dismiss" onClick={() => setFeedback(null)} aria-label={t('logs.deleted_items.cancel')}>
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div className="warning-card">
                    <div className="warning-content">
                        <div className="warning-icon">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="warning-text">
                            <h3 className="warning-title">{t('logs.deleted_items.automatic_deletion_notice')}</h3>
                            <p className="warning-description">{t('logs.deleted_items.automatic_deletion_body')}</p>
                        </div>
                        <div className="warning-badge">
                            <span className="badge-critical">{t('logs.deleted_items.critical')}</span>
                        </div>
                    </div>
                </div>

                <div className="stats-overview">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Trash2 size={20} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{deletedItems.total}</div>
                            <div className="stat-label">{t('logs.deleted_items.total_items')}</div>
                        </div>
                    </div>
                </div>

                <div className="professional-filters-container">
                    <div className="filters-row">
                        <div className="filter-group">
                            <label className="filter-label">{t('logs.deleted_items.search_label')}</label>
                            <div className="search-container">
                                <Search className="search-icon" size={20} />
                                <input
                                    type="text"
                                    className="professional-search-input"
                                    placeholder={t('logs.deleted_items.search_deleted_items')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                />
                            </div>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">{t('logs.deleted_items.filter_by_type')}</label>
                            <select className="professional-select" value={table} onChange={(e) => setTable(e.target.value)}>
                                <option value="">{t('logs.deleted_items.all_types')}</option>
                                {tableOptions.map((tbl) => (
                                    <option key={tbl} value={tbl}>
                                        {tbl}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-actions">
                            <button type="button" onClick={handleFilter} className="btn-primary-professional">
                                <Search size={16} />
                                <span>{t('logs.deleted_items.search')}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => router.get(route('logs.deleted-items'))}
                                className="btn-secondary-professional"
                            >
                                <RotateCcw size={16} />
                                <span>{t('logs.deleted_items.reset')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="main-content">
                    <div className="deleted-items-grid">
                        {deletedItems.data.map((item) => {
                            const badge = daysRemainingBadge(item.days_remaining);
                            return (
                                <div key={item.id} className="deleted-item-card">
                                    <div className="item-header">
                                        <div className="item-icon">
                                            <Trash2 size={24} />
                                        </div>
                                        <div className="item-info">
                                            <h3 className="item-title">{item.record_identifier || `ID ${item.original_id}`}</h3>
                                            <p className="item-type">{item.original_table}</p>
                                        </div>
                                        <div className="item-status">
                                            <span className={`status-badge ${badge.className}`}>{badge.label}</span>
                                        </div>
                                    </div>

                                    <div className="item-details">
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <div className="detail-icon">
                                                    <User size={16} />
                                                </div>
                                                <div className="detail-content">
                                                    <div className="detail-label">{t('logs.deleted_items.deleted_by')}</div>
                                                    <div className="detail-value">{displayName(item)}</div>
                                                </div>
                                            </div>
                                            <div className="detail-item">
                                                <div className="detail-icon">
                                                    <Clock size={16} />
                                                </div>
                                                <div className="detail-content">
                                                    <div className="detail-label">{t('logs.deleted_items.deleted_on')}</div>
                                                    <div className="detail-value">{new Date(item.deleted_at).toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div className="detail-item detail-item--full">
                                                <div className="detail-icon">
                                                    <Globe size={16} />
                                                </div>
                                                <div className="detail-content">
                                                    <div className="detail-label">{t('logs.deleted_items.deleted_from_ip')}</div>
                                                    <div className="detail-value">{item.delete_ip || '—'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {item.delete_reason && (
                                            <div className="reason-section">
                                                <div className="reason-label">{t('logs.deleted_items.delete_reason')}</div>
                                                <div className="reason-text">{item.delete_reason}</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="item-actions item-actions--split">
                                        <div className="recovery-info">
                                            <div className="recovery-label">{t('logs.deleted_items.recovery_expires')}</div>
                                            <div className="recovery-date">{new Date(item.recovery_expires_at).toLocaleString()}</div>
                                        </div>
                                        <div className="item-actions-buttons">
                                            <button
                                                type="button"
                                                onClick={() => setModal({ type: 'restore', item })}
                                                disabled={busyId === item.id}
                                                className="btn-restore"
                                            >
                                                <RotateCcw size={16} />
                                                {busyId === item.id && busyAction === 'restore'
                                                    ? t('logs.deleted_items.restoring')
                                                    : t('logs.deleted_items.restore_item')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setModal({ type: 'purge', item })}
                                                disabled={busyId === item.id}
                                                className="btn-purge-permanent"
                                            >
                                                <Trash2 size={16} />
                                                {busyId === item.id && busyAction === 'purge'
                                                    ? t('logs.deleted_items.removing')
                                                    : t('logs.deleted_items.remove_backup')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {deletedItems.data.length === 0 && (
                            <div className="empty-state-container">
                                <div className="empty-state">
                                    <div className="empty-icon">
                                        <Trash2 size={64} />
                                    </div>
                                    <div className="empty-title">{t('logs.deleted_items.no_deleted_items')}</div>
                                    <div className="empty-description">{t('logs.deleted_items.all_clear_no_items_waiting_for_recovery')}</div>
                                    <div className="empty-badge">
                                        <span className="badge-success">{t('logs.deleted_items.system_clean')}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {deletedItems.last_page > 1 && (
                        <div className="pagination-container mt-6">
                            <div className="pagination-info">
                                <p className="results-info">
                                    Showing {deletedItems.from} to {deletedItems.to} of {deletedItems.total} items
                                </p>
                            </div>
                            <div className="pagination-controls">
                                <button
                                    type="button"
                                    className="pagination-btn"
                                    disabled={deletedItems.current_page === 1}
                                    onClick={() => deletedItems.prev_page_url && router.get(deletedItems.prev_page_url)}
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
                                                    type="button"
                                                    className={`pagination-btn ${page === deletedItems.current_page ? 'active' : ''}`}
                                                    onClick={() =>
                                                        router.get(route('logs.deleted-items'), {
                                                            ...filters,
                                                            page,
                                                        })
                                                    }
                                                >
                                                    {page}
                                                </button>
                                            );
                                        }
                                        if (page === deletedItems.current_page - 2 || page === deletedItems.current_page + 2) {
                                            return (
                                                <span key={page} className="pagination-ellipsis">
                                                    ...
                                                </span>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                                <button
                                    type="button"
                                    className="pagination-btn"
                                    disabled={deletedItems.current_page === deletedItems.last_page}
                                    onClick={() => deletedItems.next_page_url && router.get(deletedItems.next_page_url)}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {modal && (
                <div className="recovery-modal-overlay" role="presentation" onClick={() => !busyId && setModal(null)}>
                    <div className="recovery-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                        <h2 className="recovery-modal-title">
                            {modal.type === 'restore'
                                ? t('logs.deleted_items.confirm_restore_title')
                                : t('logs.deleted_items.confirm_purge_title')}
                        </h2>
                        <p className="recovery-modal-body">
                            {modal.type === 'restore'
                                ? t('logs.deleted_items.confirm_restore_body', { table: modal.item.original_table })
                                : t('logs.deleted_items.confirm_purge_body')}
                        </p>
                        <p className="recovery-modal-meta">
                            <strong>{modal.item.record_identifier || `ID ${modal.item.original_id}`}</strong>
                            <span className="recovery-modal-meta-sep">·</span>
                            {modal.item.original_table}
                        </p>
                        <div className="recovery-modal-actions">
                            <button type="button" className="btn-secondary-professional" disabled={!!busyId} onClick={() => setModal(null)}>
                                {t('logs.deleted_items.cancel')}
                            </button>
                            {modal.type === 'restore' ? (
                                <button type="button" className="btn-restore" disabled={!!busyId} onClick={() => runRestore(modal.item.id)}>
                                    {busyId === modal.item.id ? t('logs.deleted_items.restoring') : t('logs.deleted_items.confirm_restore_action')}
                                </button>
                            ) : (
                                <button type="button" className="btn-purge-permanent" disabled={!!busyId} onClick={() => runPurge(modal.item.id)}>
                                    {busyId === modal.item.id ? t('logs.deleted_items.removing') : t('logs.deleted_items.confirm_purge_action')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
