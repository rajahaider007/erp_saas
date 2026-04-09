import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import App from '../../App.jsx';
import { router, usePage } from '@inertiajs/react';
import {
  ClipboardList,
  Home,
  Plus,
  RefreshCcw,
  Search,
  CheckCircle,
  Trash2,
  X,
  Edit3,
  Database,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import Breadcrumbs from '@/Components/Breadcrumbs';
import CustomDatePicker from '@/Components/DatePicker/DatePicker';
import { useTranslations } from '@/hooks/useTranslations';

function formatDisplayDate(value) {
  if (value == null || value === '') return '—';
  const s = typeof value === 'string' ? value.split('T')[0] : String(value);
  return s;
}

const swalThemed = {
  background: 'rgba(30, 41, 59, 0.95)',
  color: '#F1F5F9',
  backdrop: 'rgba(0, 0, 0, 0.8)',
  customClass: {
    popup: 'swal-dark-theme',
    title: 'swal-dark-title',
    content: 'swal-dark-content',
    htmlContainer: 'swal-dark-content',
    confirmButton: 'swal-dark-confirm',
    cancelButton: 'swal-dark-cancel',
    denyButton: 'swal-dark-cancel',
  },
};

export default function PurchaseOrderList() {
  const { orders, filters = {}, vendorOptions = [], error, flash } = usePage().props;
  const { t } = useTranslations();
  const tl = useCallback((k, r = {}) => t(`inventory.purchase_order.list.${k}`, r), [t]);

  const paginated =
    orders && typeof orders === 'object' && Array.isArray(orders.data) ? orders : null;

  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status ?? 'all');
  const [vendorFilter, setVendorFilter] = useState(filters?.vendor_id || '');
  const [fromDate, setFromDate] = useState(filters?.from_date || '');
  const [toDate, setToDate] = useState(filters?.to_date || '');
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const filterStateRef = useRef({
    statusFilter,
    vendorFilter,
    fromDate,
    toDate,
  });
  filterStateRef.current = { statusFilter, vendorFilter, fromDate, toDate };

  const flashMessage = useMemo(() => {
    if (flash?.success) return { type: 'success', text: flash.success };
    if (flash?.error) return { type: 'error', text: flash.error };
    if (error) return { type: 'error', text: error };
    return null;
  }, [flash?.success, flash?.error, error]);

  const flashMessageKey = flashMessage ? `${flashMessage.type}:${flashMessage.text}` : '';
  const [flashBannerDismissed, setFlashBannerDismissed] = useState(false);

  useEffect(() => {
    setFlashBannerDismissed(false);
  }, [flashMessageKey]);

  useEffect(() => {
    if (flash?.success) {
      void Swal.fire({
        ...swalThemed,
        icon: 'success',
        title: t('common.flash.success_title'),
        text: flash.success,
        confirmButtonText: t('common.flash.great'),
      });
    } else if (flash?.error) {
      void Swal.fire({
        ...swalThemed,
        icon: 'error',
        title: t('common.flash.error_title'),
        text: flash.error,
        confirmButtonText: t('common.flash.ok'),
      });
    }
  }, [flash?.success, flash?.error, t]);

  useEffect(() => {
    setSearchTerm(filters?.search || '');
  }, [filters?.search]);

  useEffect(() => {
    setStatusFilter(filters?.status ?? 'all');
  }, [filters?.status]);

  useEffect(() => {
    setVendorFilter(filters?.vendor_id || '');
  }, [filters?.vendor_id]);

  useEffect(() => {
    setFromDate(filters?.from_date || '');
  }, [filters?.from_date]);

  useEffect(() => {
    setToDate(filters?.to_date || '');
  }, [filters?.to_date]);

  const pushQuery = useCallback((patch) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '' || v === 'all') {
        params.delete(k);
      } else {
        params.set(k, String(v));
      }
    });
    if (!('page' in patch)) {
      params.set('page', '1');
    }
    router.get(`${window.location.pathname}?${params.toString()}`, {}, { preserveState: true, preserveScroll: true });
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      const serverSearch = filters?.search || '';
      if (searchTerm.trim() === String(serverSearch).trim()) return;
      const f = filterStateRef.current;
      pushQuery({
        search: searchTerm.trim(),
        status: f.statusFilter,
        vendor_id: f.vendorFilter,
        from_date: f.fromDate,
        to_date: f.toDate,
      });
    }, 400);
    return () => clearTimeout(id);
  }, [searchTerm, filters?.search, pushQuery]);

  const resetAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setVendorFilter('');
    setFromDate('');
    setToDate('');
    const params = new URLSearchParams();
    params.set('page', '1');
    router.get(`${window.location.pathname}?${params.toString()}`, {}, { preserveState: true, preserveScroll: true });
  };

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: tl('status_all') },
      { value: 'draft', label: tl('status_draft') },
      { value: 'approved', label: tl('status_approved') },
    ],
    [tl]
  );

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: tl('breadcrumb_inventory'), icon: ClipboardList, href: '/erp-modules' },
      { label: tl('title'), icon: ClipboardList, href: null },
    ],
    [t, tl]
  );

  const rows = paginated?.data ?? [];
  const total = paginated?.total ?? 0;
  const draftCountOnPage = useMemo(() => rows.filter((r) => r.status === 'draft').length, [rows]);

  const draftRowIds = useMemo(() => rows.filter((r) => r.status === 'draft').map((r) => r.id), [rows]);

  const draftSelectedCount = useMemo(
    () => selectedIds.filter((id) => draftRowIds.includes(id)).length,
    [selectedIds, draftRowIds]
  );

  const handleSelectAllDrafts = (checked) => {
    if (checked) {
      setSelectedIds([...new Set([...selectedIds.filter((id) => !draftRowIds.includes(id)), ...draftRowIds])]);
    } else {
      setSelectedIds(selectedIds.filter((id) => !draftRowIds.includes(id)));
    }
  };

  const toggleRow = (row, checked) => {
    if (row.status !== 'draft') return;
    if (checked) {
      setSelectedIds((prev) => [...new Set([...prev, row.id])]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== row.id));
    }
  };

  const approveOne = async (row) => {
    const res = await Swal.fire({
      ...swalThemed,
      title: tl('approve'),
      text: row.po_number,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: tl('approve'),
      cancelButtonText: t('common.actions.cancel'),
    });
    if (!res.isConfirmed) return;
    setLoading(true);
    router.post(
      `/inventory/purchase-order/${row.id}/approve`,
      {},
      {
        preserveScroll: true,
        onFinish: () => {
          setLoading(false);
          setSelectedIds([]);
        },
      }
    );
  };

  const deleteOne = async (row) => {
    const res = await Swal.fire({
      ...swalThemed,
      title: tl('swal_delete_title'),
      html: tl('swal_delete_body', { number: row.po_number }),
      icon: 'warning',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: tl('swal_recycle'),
      denyButtonText: tl('swal_permanent'),
      cancelButtonText: tl('swal_cancel'),
    });
    if (res.isDismissed) return;
    setLoading(true);
    const permanent = res.isDenied;
    const url = permanent ? `/inventory/purchase-order/${row.id}?permanent=1` : `/inventory/purchase-order/${row.id}`;
    router.delete(url, {
      preserveScroll: true,
      onFinish: () => {
        setLoading(false);
        setSelectedIds((prev) => prev.filter((id) => id !== row.id));
      },
    });
  };

  const bulkApprove = async () => {
    const draftOnly = selectedIds.filter((id) => draftRowIds.includes(id));
    if (draftOnly.length === 0) {
      await Swal.fire({
        ...swalThemed,
        title: tl('swal_bulk_approve_title'),
        text: tl('no_drafts_selected'),
        icon: 'info',
      });
      return;
    }
    const res = await Swal.fire({
      ...swalThemed,
      title: tl('swal_bulk_approve_title'),
      text: tl('swal_bulk_approve_text', { count: draftOnly.length }),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: tl('bulk_approve'),
      cancelButtonText: t('common.actions.cancel'),
    });
    if (!res.isConfirmed) return;
    setLoading(true);
    router.post(
      '/inventory/purchase-order/bulk-approve',
      { ids: draftOnly },
      {
        preserveScroll: true,
        onFinish: () => {
          setLoading(false);
          setSelectedIds([]);
        },
      }
    );
  };

  const allDraftsOnPageSelected = draftRowIds.length > 0 && draftRowIds.every((id) => selectedIds.includes(id));

  return (
    <App>
      <div className="advanced-module-manager form-theme-system">
        <div className="px-4 pt-4 max-w-[100vw]">
          <Breadcrumbs items={breadcrumbItems} description={tl('description')} />
        </div>

        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title">
                <Database className="title-icon" />
                {tl('title')}
              </h1>
              <div className="stats-summary">
                <div className="stat-item">
                  <TrendingUp size={16} />
                  <span>{tl('subtitle', { count: total })}</span>
                </div>
                <div className="stat-item">
                  <Users size={16} />
                  <span>
                    {draftCountOnPage} {tl('status_draft')}
                  </span>
                </div>
              </div>
            </div>

            <div className="header-actions">
              <button
                type="button"
                className="btn btn-icon"
                onClick={() => {
                  setLoading(true);
                  router.reload({ onFinish: () => setLoading(false) });
                }}
                disabled={loading}
                title={tl('refresh')}
              >
                <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
              <a href="/inventory/purchase-order/create" className="btn btn-primary">
                <Plus size={20} />
                {tl('new_po')}
              </a>
            </div>
          </div>
        </div>

        {flashMessage && !flashBannerDismissed && (
          <div
            className={`mb-4 mx-4 p-4 rounded-lg border animate-slideIn relative pr-12 ${
              flashMessage.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
            }`}
            role={flashMessage.type === 'success' ? 'status' : 'alert'}
          >
            <div className="flex items-start gap-3">
              {flashMessage.type === 'success' ? (
                <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
              ) : (
                <XCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
              )}
              <p className="text-sm font-medium m-0">{flashMessage.text}</p>
            </div>
            <button
              type="button"
              className="absolute top-3 right-3 rounded-md p-1 text-current opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={() => setFlashBannerDismissed(true)}
              aria-label={t('common.actions.close')}
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="modern-filters-container mx-4">
          <div className="filters-toolbar">
            <div className="search-section">
              <div className={`search-input-wrapper ${searchTerm ? 'has-value' : ''}`}>
                <Search className="search-icon" size={18} />
                <input
                  type="search"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={tl('search_placeholder')}
                  aria-label={tl('search_label')}
                />
              </div>

              <div className={`filter-group ${fromDate || toDate ? 'has-value' : ''}`}>
                <span className="filter-label">
                  {tl('from_date')} / {tl('to_date')}
                </span>
                <div className="date-inputs">
                  <CustomDatePicker
                    selected={fromDate ? new Date(fromDate) : null}
                    onChange={(date) => {
                      const v = date ? date.toISOString().split('T')[0] : '';
                      setFromDate(v);
                      pushQuery({
                        search: searchTerm.trim(),
                        status: statusFilter,
                        vendor_id: vendorFilter,
                        from_date: v,
                        to_date: toDate,
                      });
                    }}
                    type="date"
                    placeholder={tl('from_date')}
                    className="date-input"
                    isClearable
                  />
                  <CustomDatePicker
                    selected={toDate ? new Date(toDate) : null}
                    onChange={(date) => {
                      const v = date ? date.toISOString().split('T')[0] : '';
                      setToDate(v);
                      pushQuery({
                        search: searchTerm.trim(),
                        status: statusFilter,
                        vendor_id: vendorFilter,
                        from_date: fromDate,
                        to_date: v,
                      });
                    }}
                    type="date"
                    placeholder={tl('to_date')}
                    className="date-input"
                    isClearable
                  />
                </div>
              </div>

              <div className={`filter-group ${statusFilter !== 'all' ? 'has-value' : ''}`}>
                <label className="filter-label" htmlFor="po-filter-status">
                  {tl('status_label')}
                </label>
                <select
                  id="po-filter-status"
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => {
                    const v = e.target.value;
                    setStatusFilter(v);
                    pushQuery({
                      search: searchTerm.trim(),
                      status: v,
                      vendor_id: vendorFilter,
                      from_date: fromDate,
                      to_date: toDate,
                    });
                  }}
                >
                  {statusOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`filter-group ${vendorFilter ? 'has-value' : ''}`}>
                <label className="filter-label" htmlFor="po-filter-vendor">
                  {tl('vendor_label')}
                </label>
                <select
                  id="po-filter-vendor"
                  className="filter-select"
                  value={vendorFilter}
                  onChange={(e) => {
                    const v = e.target.value;
                    setVendorFilter(v);
                    pushQuery({
                      search: searchTerm.trim(),
                      status: statusFilter,
                      vendor_id: v,
                      from_date: fromDate,
                      to_date: toDate,
                    });
                  }}
                >
                  <option value="">{tl('vendor_all')}</option>
                  {(vendorOptions || []).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <button type="button" className="reset-btn" onClick={resetAllFilters} title={tl('reset_filters')}>
                <RefreshCcw size={16} />
              </button>
            </div>
          </div>
        </div>

        {draftSelectedCount > 0 && (
          <div className="bulk-actions-bar mx-4 rounded-xl overflow-hidden">
            <div className="selection-info">
              <CheckCircle2 size={20} />
              <span>{tl('selected_count', { count: draftSelectedCount })}</span>
            </div>
            <div className="bulk-actions">
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)' }}
                onClick={bulkApprove}
                disabled={loading}
                title={tl('bulk_approve')}
              >
                <CheckCircle size={16} />
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)' }}
                onClick={() => setSelectedIds([])}
                disabled={loading}
                title={tl('clear_selection')}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="main-content mx-4 mb-6">
          <div className="data-table-container">
            {rows.length === 0 ? (
              <div className="empty-state">
                <Database className="empty-icon" />
                <h3 className="m-0">{tl('empty')}</h3>
                <p className="text-center m-0 mt-2 max-w-md" style={{ color: 'var(--text-secondary, #64748b)' }}>
                  {tl('description')}
                </p>
                <a href="/inventory/purchase-order/create" className="btn btn-primary mt-4">
                  <Plus size={20} />
                  {tl('new_po')}
                </a>
              </div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="checkbox-cell">
                          {draftRowIds.length > 0 ? (
                            <input
                              type="checkbox"
                              className="checkbox"
                              checked={allDraftsOnPageSelected}
                              onChange={(e) => handleSelectAllDrafts(e.target.checked)}
                              title={tl('status_draft')}
                              aria-label={tl('status_draft')}
                            />
                          ) : null}
                        </th>
                        <th>{tl('col_po_number')}</th>
                        <th>{tl('col_po_date')}</th>
                        <th>{tl('col_vendor')}</th>
                        <th>{tl('col_pr')}</th>
                        <th>{tl('col_lines')}</th>
                        <th>{tl('col_status')}</th>
                        <th>{tl('col_ship_to')}</th>
                        <th className="actions-header">{tl('col_actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id} className="table-row">
                          <td>
                            {row.status === 'draft' ? (
                              <input
                                type="checkbox"
                                className="checkbox"
                                checked={selectedIds.includes(row.id)}
                                onChange={(e) => toggleRow(row, e.target.checked)}
                                aria-label={`${tl('col_po_number')} ${row.po_number}`}
                              />
                            ) : (
                              <span className="inline-block w-4" />
                            )}
                          </td>
                          <td>
                            <div className="module-info">
                              <div className="module-avatar">
                                <FileText className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="module-details">
                                <div className="module-name">{row.po_number}</div>
                                {row.vendor_reference ? (
                                  <div className="module-folder">{row.vendor_reference}</div>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="date-cell">
                              <Calendar size={14} />
                              <span>{formatDisplayDate(row.po_date)}</span>
                            </div>
                          </td>
                          <td>
                            {row.vendor
                              ? `${row.vendor.account_code} — ${row.vendor.account_name}`
                              : '—'}
                          </td>
                          <td>{row.purchase_requisition?.pr_number ?? '—'}</td>
                          <td className="tabular-nums">{row.lines_count ?? '—'}</td>
                          <td>
                            <div className="status-container">
                              <span
                                className={`status-badge status-${(row.status || '').toLowerCase()}`}
                                style={{
                                  backgroundColor:
                                    row.status === 'approved'
                                      ? '#10B98115'
                                      : row.status === 'draft'
                                        ? '#F59E0B15'
                                        : '#64748B15',
                                  color:
                                    row.status === 'approved'
                                      ? '#10B981'
                                      : row.status === 'draft'
                                        ? '#F59E0B'
                                        : '#64748B',
                                }}
                              >
                                <span
                                  className="status-dot"
                                  style={{
                                    backgroundColor:
                                      row.status === 'approved'
                                        ? '#10B981'
                                        : row.status === 'draft'
                                          ? '#F59E0B'
                                          : '#64748B',
                                  }}
                                />
                                {row.status}
                              </span>
                            </div>
                          </td>
                          <td>{row.ship_to_location?.location_name ?? '—'}</td>
                          <td>
                            <div className="actions-cell">
                              {row.status === 'draft' && (
                                <>
                                  <button
                                    type="button"
                                    className="action-btn edit"
                                    title={tl('edit')}
                                    onClick={() => {
                                      router.visit(`/inventory/purchase-order/${row.id}/edit`);
                                    }}
                                    disabled={loading}
                                  >
                                    <Edit3 size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    className="action-btn copy"
                                    title={tl('approve')}
                                    onClick={() => approveOne(row)}
                                    disabled={loading}
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    className="action-btn delete"
                                    title={tl('delete')}
                                    onClick={() => deleteOne(row)}
                                    disabled={loading}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {paginated && paginated.last_page > 1 && (
                  <div className="pagination-container">
                    <div className="pagination-info">
                      <div className="results-info">
                        {tl('page_summary', {
                          from: paginated.from ?? 0,
                          to: paginated.to ?? 0,
                          total: paginated.total,
                        })}
                      </div>
                    </div>
                    <div className="pagination-controls">
                      {paginated.links?.map((link, idx) => {
                        if (link.url === null) {
                          return (
                            <span
                              key={idx}
                              className="pagination-btn opacity-50 cursor-default px-3 py-1"
                              dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                          );
                        }
                        return (
                          <button
                            key={idx}
                            type="button"
                            className={`pagination-btn ${link.active ? 'active' : ''}`}
                            onClick={() => {
                              setLoading(true);
                              router.visit(link.url, { preserveState: true, preserveScroll: true, onFinish: () => setLoading(false) });
                            }}
                            disabled={loading}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </App>
  );
}
