import React, { useEffect, useMemo, useState, useCallback } from 'react';
import App from '../../App.jsx';
import { router, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';
import Breadcrumbs from '../../../Components/Breadcrumbs';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  ArrowUpDown,
  RefreshCcw,
  Database,
  ChevronLeft,
  ChevronRight,
  Home,
  List as ListIcon,
} from 'lucide-react';

const CustomAlert = {
  fire: ({ title, text, icon, showCancelButton = false, confirmButtonText = 'OK', cancelButtonText = 'Cancel', onConfirm, onCancel }) => {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:9999';
    const iconHtml =
      {
        success: '<div style="color:#10B981;font-size:48px;">✓</div>',
        error: '<div style="color:#EF4444;font-size:48px;">✗</div>',
        warning: '<div style="color:#F59E0B;font-size:48px;">⚠</div>',
        question: '<div style="color:#3B82F6;font-size:48px;">?</div>',
      }[icon] || '';
    el.innerHTML = `<div style="background:#fff;border-radius:12px;padding:32px;min-width:400px;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,.25)"> ${iconHtml}<h3 style="margin:20px 0 12px;font-size:20px;font-weight:600;color:#1F2937">${title}</h3><p style="margin:0 0 24px;color:#6B7280">${text}</p><div style="display:flex;gap:12px;justify-content:center;">${showCancelButton ? `<button id='c' style='background:#F3F4F6;color:#374151;border:none;padding:12px 24px;border-radius:8px;font-weight:500;cursor:pointer'>${cancelButtonText}</button>` : ''}<button id='o' style="background:${icon === 'error' || icon === 'warning' ? '#EF4444' : '#3B82F6'};color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:500;cursor:pointer">${confirmButtonText}</button></div></div>`;
    document.body.appendChild(el);
    el.querySelector('#o').addEventListener('click', () => {
      document.body.removeChild(el);
      onConfirm && onConfirm();
    });
    const c = el.querySelector('#c');
    c &&
      c.addEventListener('click', () => {
        document.body.removeChild(el);
        onCancel && onCancel();
      });
  },
};

export default function List() {
  const { items, filters = {}, config, error, flash } = usePage().props;
  const { t } = useTranslations();
  const ml = useCallback((k, r = {}) => t(`inventory.master_data.list.${k}`, r), [t]);
  const td = useCallback((k, r = {}) => t(`common.data_table.${k}`, r), [t]);
  const ts = useCallback((k) => t(`common.status.${k}`), [t]);

  const paginated = items && !Array.isArray(items) && Array.isArray(items.data) ? items : null;

  const masterKey = config?.key || '';

  const listTitle = useMemo(() => {
    const k = `inventory.master_data.masters.${masterKey}.title`;
    const v = t(k);
    return v === k ? config?.title || ml('title_fallback') : v;
  }, [t, masterKey, config?.title, ml]);

  const columns = useMemo(() => {
    const configured = config?.list_columns || {};
    return Object.keys(configured).map((key) => {
      const lk = `inventory.master_data.masters.${masterKey}.list_columns.${key}`;
      const lt = t(lk);
      const label = lt === lk ? configured[key] : lt;
      return { key, label };
    });
  }, [config, t, masterKey]);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(() => {
    if (filters?.is_active === true || filters?.is_active === 1 || filters?.is_active === '1') return '1';
    if (filters?.is_active === false || filters?.is_active === 0 || filters?.is_active === '0') return '0';
    return 'all';
  });
  const [sortConfig, setSortConfig] = useState({
    key: filters?.sort_by || config?.default_sort || config?.key_field || 'id',
    direction: filters?.sort_order || 'asc',
  });
  const [currentPage, setCurrentPage] = useState(paginated?.current_page || 1);

  const tPag = useCallback((k, rep = {}) => t(`inventory.item_category_coding.list.${k}`, rep), [t]);

  useEffect(() => {
    if (paginated?.current_page) setCurrentPage(paginated.current_page);
  }, [paginated?.current_page]);

  const pushQuery = (obj) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(obj).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '' || v === 'all') params.delete(k);
      else params.set(k, String(v));
    });
    if (!('page' in obj)) params.set('page', '1');
    router.get(`${window.location.pathname}?${params.toString()}`, {}, { preserveState: true, preserveScroll: true });
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    pushQuery({ search: term });
  };

  const handleStatusFilter = (s) => {
    setStatusFilter(s);
    if (s === 'all') pushQuery({ is_active: '' });
    else pushQuery({ is_active: s });
  };

  const handleSort = (key) => {
    const dir = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction: dir });
    pushQuery({ sort_by: key, sort_order: dir });
  };

  const handlePageChange = (p) => {
    setCurrentPage(p);
    const params = new URLSearchParams(window.location.search);
    params.set('page', String(p));
    router.get(`${window.location.pathname}?${params.toString()}`, {}, { preserveState: true, preserveScroll: true });
  };

  const handleDelete = (row) => {
    CustomAlert.fire({
      title: td('confirm_delete_title'),
      text: ml('confirm_delete'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: td('confirm_delete_ok'),
      cancelButtonText: t('common.actions.cancel'),
      onConfirm: () => {
        setLoading(true);
        router.delete(`/inventory/master-data/${config.key}/${row.id}`, { onFinish: () => setLoading(false) });
      },
    });
  };

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: t('inventory.shared.filter_all_status') },
      { value: '1', label: ts('active') },
      { value: '0', label: ts('inactive') },
    ],
    [t, ts]
  );

  const rows = paginated?.data ?? [];
  const basePath = config?.key ? `/inventory/master-data/${config.key}` : '';
  const createHref = config?.key ? `${basePath}/create` : '#';

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: listTitle, icon: ListIcon, href: null },
    ],
    [t, listTitle]
  );

  return (
    <App>
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <Breadcrumbs items={breadcrumbItems} description={t('inventory.shared.list_browse_description')} />
          {flash?.success && (
            <div className="alert-success-themed mb-4" role="status">
              <p className="m-0">{flash.success}</p>
            </div>
          )}
          {flash?.error && (
            <div className="alert-error-themed mb-4" role="alert">
              <p className="m-0">{flash.error}</p>
            </div>
          )}
          {error && (
            <div className="alert-error-themed mb-4" role="alert">
              <p className="m-0">{error}</p>
            </div>
          )}
          <div className="advanced-module-manager">
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title">
                <Database className="title-icon" />
                {listTitle}
              </h1>
              {paginated && (
                <div className="stats-summary">
                  <div className="stat-item">
                    <span>{td('stat_total', { count: paginated.total || 0 })}</span>
                  </div>
                  <div className="stat-item">
                    <span>{td('stat_active', { count: rows.filter((r) => r.is_active).length || 0 })}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="btn btn-icon"
                onClick={() => window.location.reload()}
                title={ml('refresh')}
                disabled={loading}
              >
                <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
              {config?.key && (
                <a href={createHref} className="btn btn-primary">
                  <Plus size={20} />
                  {ml('add_new')}
                </a>
              )}
            </div>
          </div>

          <div className="modern-filters-container">
            <div className="filters-toolbar">
              <div className="search-section">
                <div className="search-input-wrapper">
                  <Search className="search-icon" size={18} />
                  <input
                    type="text"
                    className="search-input"
                    placeholder={ml('search')}
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">{ml('status')}</label>
                  <select className="filter-select" value={statusFilter} onChange={(e) => handleStatusFilter(e.target.value)}>
                    {statusOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="reset-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    const params = new URLSearchParams();
                    params.set('page', '1');
                    router.get(`${window.location.pathname}?${params.toString()}`, {}, { preserveState: true, preserveScroll: true });
                  }}
                  title={ml('reset_all_filters')}
                >
                  <RefreshCcw size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="data-table-container">
            {!paginated ? (
              <div className="empty-state">
                <Database className="empty-icon" />
                <h3>{ml('no_records')}</h3>
              </div>
            ) : rows.length === 0 ? (
              <div className="empty-state">
                <Database className="empty-icon" />
                <h3>{ml('no_records')}</h3>
                {config?.key && (
                  <a href={createHref} className="btn btn-primary">
                    <Plus size={20} />
                    {ml('add_new')}
                  </a>
                )}
              </div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="sortable" onClick={() => handleSort('id')}>
                          <div className="th-content">
                            {ml('id')}
                            <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'id' ? 'active' : ''}`} />
                          </div>
                        </th>
                        {columns.map((column) => (
                          <th key={column.key} className="sortable" onClick={() => handleSort(column.key)}>
                            <div className="th-content">
                              {column.label}
                              <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === column.key ? 'active' : ''}`} />
                            </div>
                          </th>
                        ))}
                        <th className="sortable" onClick={() => handleSort('is_active')}>
                          <div className="th-content">
                            {ml('status')}
                            <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'is_active' ? 'active' : ''}`} />
                          </div>
                        </th>
                        <th className="actions-header">{ml('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id} className="table-row">
                          <td>
                            <span className="module-id">#{row.id}</span>
                          </td>
                          {columns.map((column) => (
                            <td key={`${row.id}-${column.key}`}>
                              <div className="module-details">
                                <div className="module-name">{String(row[column.key] ?? '')}</div>
                              </div>
                            </td>
                          ))}
                          <td>
                            <span className={`status-badge status-${row.is_active ? 'active' : 'inactive'}`}>
                              {row.is_active ? ts('active') : ts('inactive')}
                            </span>
                          </td>
                          <td>
                            <div className="actions-cell">
                              <button
                                type="button"
                                className="action-btn edit"
                                title={t('common.actions.edit')}
                                onClick={() => router.get(`${basePath}/${row.id}/edit`)}
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                type="button"
                                className="action-btn delete"
                                title={t('common.actions.delete')}
                                onClick={() => handleDelete(row)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pagination-container">
                  <div className="pagination-info">
                    <div className="results-info">
                      {td('showing_entries', {
                        from: paginated.from || 0,
                        to: paginated.to || 0,
                        total: paginated.total || 0,
                      })}
                    </div>
                  </div>
                  <div className="pagination-controls">
                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(1)}
                      title={tPag('first_page')}
                    >
                      <ChevronLeft size={14} />
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      title={tPag('previous_page')}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <div className="page-numbers">
                      {Array.from({ length: Math.min(7, paginated.last_page || 1) }, (_, index) => {
                        let pageNumber;
                        const totalPages = paginated.last_page || 1;
                        if (totalPages <= 7) pageNumber = index + 1;
                        else if (currentPage <= 4) pageNumber = index + 1;
                        else if (currentPage > totalPages - 4) pageNumber = totalPages - 6 + index;
                        else pageNumber = currentPage - 3 + index;
                        return (
                          <button
                            key={pageNumber}
                            type="button"
                            className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={currentPage >= (paginated.last_page || 1)}
                      onClick={() => handlePageChange(currentPage + 1)}
                      title={tPag('next_page')}
                    >
                      <ChevronRight size={14} />
                    </button>
                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={currentPage >= (paginated.last_page || 1)}
                      onClick={() => handlePageChange(paginated.last_page || 1)}
                      title={tPag('last_page')}
                    >
                      <ChevronRight size={14} />
                      <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="quick-jump">
                    <span>{tPag('go_to')}</span>
                    <input
                      type="number"
                      min={1}
                      max={paginated.last_page || 1}
                      value={currentPage}
                      onChange={(e) => {
                        const p = Math.max(1, Math.min(paginated.last_page || 1, Number(e.target.value) || 1));
                        handlePageChange(p);
                      }}
                      className="jump-input"
                    />
                    <span>{tPag('page_of_total', { total: paginated.last_page || 1 })}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
        </div>
      </div>
    </App>
  );
}
