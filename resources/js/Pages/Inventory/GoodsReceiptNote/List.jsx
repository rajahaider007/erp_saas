import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import App from '../../App.jsx';
import { router, usePage } from '@inertiajs/react';
import {
  ClipboardList,
  Home,
  Plus,
  RefreshCcw,
  Search,
  Truck,
  Database,
  Edit3,
  Trash2,
  CheckCircle,
  FileText,
  ScrollText,
} from 'lucide-react';
import Swal from 'sweetalert2';
import Breadcrumbs from '@/Components/Breadcrumbs';
import CustomDatePicker from '@/Components/DatePicker/DatePicker';
import { useTranslations } from '@/hooks/useTranslations';
import { usePermissions } from '@/hooks/usePermissions';

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

function formatDisplayDate(value) {
  if (value == null || value === '') return '—';
  const s = typeof value === 'string' ? value.split('T')[0] : String(value);
  return s;
}

export default function GoodsReceiptNoteList() {
  const {
    grns,
    filters = {},
    vendorOptions = [],
    error,
    flash,
  } = usePage().props;
  const { t } = useTranslations();
  const tl = useCallback((k, r = {}) => t(`inventory.goods_receipt_note.list.${k}`, r), [t]);
  const { auth, hasRoutePermission } = usePermissions();

  const grnPermission = useCallback(
    (perm) => {
      if (auth?.user?.role === 'super_admin') return true;
      return hasRoutePermission('/inventory/goods-receipt-note', perm);
    },
    [auth?.user?.role, hasRoutePermission]
  );

  const paginated =
    grns && typeof grns === 'object' && Array.isArray(grns.data) ? grns : null;

  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status ?? 'all');
  const [vendorFilter, setVendorFilter] = useState(filters?.vendor_id || '');
  const [fromDate, setFromDate] = useState(filters?.from_date || '');
  const [toDate, setToDate] = useState(filters?.to_date || '');
  const [loading, setLoading] = useState(false);
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
      { value: 'qc_pending', label: tl('status_qc_pending') },
      { value: 'posted', label: tl('status_posted') },
    ],
    [tl]
  );

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: tl('breadcrumb_inventory'), icon: ClipboardList, href: '/erp-modules' },
      { label: tl('title'), icon: Truck, href: null },
    ],
    [t, tl]
  );

  const rows = paginated?.data ?? [];

  const statusLabel = (status) => {
    if (status === 'draft') return tl('status_draft');
    if (status === 'qc_pending') return tl('status_qc_pending');
    if (status === 'posted') return tl('status_posted');
    return status ?? '—';
  };

  const statusClass = (status) => {
    if (status === 'draft') {
      return 'px-2 py-0.5 rounded text-xs font-medium bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30';
    }
    if (status === 'qc_pending') {
      return 'px-2 py-0.5 rounded text-xs font-medium bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30';
    }
    if (status === 'posted') {
      return 'px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30';
    }
    return 'px-2 py-0.5 rounded text-xs font-medium bg-slate-500/15 text-slate-600 dark:text-slate-300 border border-slate-500/25';
  };

  const submitQcOne = async (row) => {
    const res = await Swal.fire({
      ...swalThemed,
      title: tl('submit_qc'),
      text: row.grn_number,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: tl('submit_qc'),
      cancelButtonText: t('common.actions.cancel'),
    });
    if (!res.isConfirmed) return;
    setLoading(true);
    router.post(
      `/inventory/goods-receipt-note/${row.id}/approve`,
      {},
      {
        preserveScroll: true,
        onFinish: () => setLoading(false),
      }
    );
  };

  const deleteOne = async (row) => {
    const res = await Swal.fire({
      ...swalThemed,
      title: tl('swal_delete_title'),
      text: tl('swal_delete_body', { number: row.grn_number }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: tl('swal_confirm_delete'),
      cancelButtonText: t('common.actions.cancel'),
    });
    if (!res.isConfirmed) return;
    setLoading(true);
    router.delete(`/inventory/goods-receipt-note/${row.id}`, {
      preserveScroll: true,
      onFinish: () => setLoading(false),
    });
  };

  return (
    <App>
      <div className="page-container form-theme-system">
        <div className="breadcrumb-header px-4 pt-4">
          <Breadcrumbs items={breadcrumbItems} description={tl('description')} />
        </div>

        {!flashBannerDismissed && flashMessage && (
          <div className="mx-4 mb-3 p-3 rounded-lg border border-current/20">{flashMessage.text}</div>
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
                <label className="filter-label" htmlFor="grn-filter-status">
                  {tl('status_label')}
                </label>
                <select
                  id="grn-filter-status"
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
                <label className="filter-label" htmlFor="grn-filter-vendor">
                  {tl('vendor_label')}
                </label>
                <select
                  id="grn-filter-vendor"
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

        <div className="flex justify-end mx-4 mb-3">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => router.visit('/inventory/goods-receipt-note/create')}
            disabled={!grnPermission('can_add')}
          >
            <Plus size={18} />
            {tl('new_grn')}
          </button>
        </div>

        <div className="main-content mx-4 mb-6">
          <div className="data-table-container">
            {rows.length === 0 ? (
              <div className="empty-state">
                <Database className="empty-icon" />
                <h3 className="m-0">{tl('empty')}</h3>
                <p className="text-center m-0 mt-2 max-w-md" style={{ color: 'var(--text-secondary, #64748b)' }}>
                  {tl('empty_hint')}
                </p>
                <button
                  type="button"
                  className="btn btn-primary mt-4"
                  onClick={() => router.visit('/inventory/goods-receipt-note/create')}
                  disabled={!grnPermission('can_add')}
                >
                  <Plus size={20} />
                  {tl('new_grn')}
                </button>
              </div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{tl('col_grn_number')}</th>
                        <th>{tl('col_receipt_date')}</th>
                        <th>{tl('col_po')}</th>
                        <th>{tl('col_vendor')}</th>
                        <th>{tl('col_lines')}</th>
                        <th>{tl('col_receive_at')}</th>
                        <th>{tl('col_status')}</th>
                        <th className="actions-header whitespace-nowrap">{tl('col_actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id} className="table-row">
                          <td>
                            <div className="module-info">
                              <div className="module-avatar">
                                <Truck className="w-6 h-6 text-emerald-600" />
                              </div>
                              <div className="module-details">
                                <div className="module-name font-mono">{row.grn_number}</div>
                                {row.grn_type ? (
                                  <div className="module-folder text-xs opacity-80">{row.grn_type}</div>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td>{formatDisplayDate(row.receipt_date)}</td>
                          <td>
                            <span className="font-mono text-sm">
                              {row.purchase_order?.po_number ?? '—'}
                            </span>
                          </td>
                          <td>
                            <span className="text-sm">
                              {row.vendor
                                ? `${row.vendor.account_code} · ${row.vendor.account_name}`
                                : '—'}
                            </span>
                          </td>
                          <td>{row.lines_count ?? 0}</td>
                          <td className="text-sm">{row.receive_location?.location_name ?? '—'}</td>
                          <td>
                            <span className={statusClass(row.status)}>{statusLabel(row.status)}</span>
                          </td>
                          <td>
                            <div className="actions-cell flex flex-wrap gap-1 justify-end">
                              {row.status === 'draft' && (
                                <>
                                  <button
                                    type="button"
                                    className="action-btn edit"
                                    title={tl('edit')}
                                    onClick={() => router.visit(`/inventory/goods-receipt-note/${row.id}/edit`)}
                                    disabled={loading || !grnPermission('can_edit')}
                                  >
                                    <Edit3 size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    className="action-btn copy"
                                    title={tl('submit_qc')}
                                    onClick={() => void submitQcOne(row)}
                                    disabled={loading || !grnPermission('can_edit')}
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    className="action-btn delete"
                                    title={tl('delete')}
                                    onClick={() => void deleteOne(row)}
                                    disabled={loading || !grnPermission('can_delete')}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                className="action-btn print-summary"
                                title={tl('invoice_summary')}
                                onClick={() =>
                                  window.open(
                                    `/inventory/goods-receipt-note/${row.id}/invoice/summary`,
                                    '_blank',
                                    'noopener,noreferrer'
                                  )
                                }
                                disabled={loading || !grnPermission('can_view')}
                              >
                                <FileText size={16} />
                              </button>
                              <button
                                type="button"
                                className="action-btn print-detailed"
                                title={tl('invoice_detailed')}
                                onClick={() =>
                                  window.open(
                                    `/inventory/goods-receipt-note/${row.id}/invoice/detailed`,
                                    '_blank',
                                    'noopener,noreferrer'
                                  )
                                }
                                disabled={loading || !grnPermission('can_view')}
                              >
                                <ScrollText size={16} />
                              </button>
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
                              router.visit(link.url, {
                                preserveState: true,
                                preserveScroll: true,
                                onFinish: () => setLoading(false),
                              });
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
