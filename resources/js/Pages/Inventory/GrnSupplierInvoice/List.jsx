import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import App from '../../App.jsx';
import { router, usePage } from '@inertiajs/react';
import { ClipboardList, Home, Plus, Search, Edit3, Trash2, Receipt, FileText, ScrollText, BookOpen } from 'lucide-react';
import Swal from 'sweetalert2';
import Breadcrumbs from '@/Components/Breadcrumbs';
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

export default function GrnSupplierInvoiceList() {
  const { invoices, filters = {}, error, flash } = usePage().props;
  const { t } = useTranslations();
  const tl = useCallback((k, r = {}) => t(`inventory.grn_supplier_invoice.list.${k}`, r), [t]);
  const { auth, hasRoutePermission } = usePermissions();

  const siPermission = useCallback(
    (perm) => {
      if (auth?.user?.role === 'super_admin') return true;
      return hasRoutePermission('/inventory/grn-supplier-invoice', perm);
    },
    [auth?.user?.role, hasRoutePermission]
  );

  const showNoFormRights = useCallback(() => {
    void Swal.fire({
      ...swalThemed,
      icon: 'warning',
      title: t('common.flash.warning_title'),
      text: tl('no_form_rights'),
      confirmButtonText: t('common.flash.ok'),
    });
  }, [t, tl]);

  const showPostedNotEditable = useCallback(() => {
    void Swal.fire({
      ...swalThemed,
      icon: 'info',
      title: t('common.flash.warning_title'),
      text: tl('posted_not_editable'),
      confirmButtonText: t('common.flash.ok'),
    });
  }, [t, tl]);

  const goNewInvoice = useCallback(() => {
    if (!siPermission('can_add')) {
      showNoFormRights();
      return;
    }
    router.visit('/inventory/grn-supplier-invoice/create');
  }, [siPermission, showNoFormRights]);

  const openSiPrint = useCallback(
    (path) => {
      if (!siPermission('can_view')) {
        showNoFormRights();
        return;
      }
      window.open(path, '_blank', 'noopener,noreferrer');
    },
    [siPermission, showNoFormRights]
  );

  const goEditInvoice = useCallback(
    (row) => {
      if (row.status !== 'draft') {
        showPostedNotEditable();
        return;
      }
      if (!siPermission('can_edit')) {
        showNoFormRights();
        return;
      }
      router.visit(`/inventory/grn-supplier-invoice/${row.id}/edit`);
    },
    [siPermission, showNoFormRights, showPostedNotEditable]
  );

  const paginated =
    invoices && typeof invoices === 'object' && Array.isArray(invoices.data) ? invoices : null;

  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status ?? 'all');
  const [loading, setLoading] = useState(false);
  const filterStateRef = useRef({ statusFilter });
  filterStateRef.current = { statusFilter };

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
      });
    }, 400);
    return () => clearTimeout(id);
  }, [searchTerm, filters?.search, pushQuery]);

  const resetAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    const params = new URLSearchParams();
    params.set('page', '1');
    router.get(`${window.location.pathname}?${params.toString()}`, {}, { preserveState: true, preserveScroll: true });
  };

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: tl('status_all') },
      { value: 'draft', label: tl('status_draft') },
      { value: 'posted', label: tl('status_posted') },
    ],
    [tl]
  );

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: tl('breadcrumb_inventory'), icon: ClipboardList, href: '/erp-modules' },
      { label: tl('title'), icon: Receipt, href: null },
    ],
    [t, tl]
  );

  const rows = paginated?.data ?? [];

  const statusLabel = (status) => {
    if (status === 'draft') return tl('status_draft');
    if (status === 'posted') return tl('status_posted');
    return status ?? '—';
  };

  const statusClass = (status) => {
    if (status === 'draft') {
      return 'px-2 py-0.5 rounded text-xs font-medium bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30';
    }
    if (status === 'posted') {
      return 'px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30';
    }
    return 'px-2 py-0.5 rounded text-xs font-medium bg-slate-500/15 text-slate-600 dark:text-slate-300 border border-slate-500/25';
  };

  const deleteOne = async (row) => {
    if (!siPermission('can_delete')) {
      showNoFormRights();
      return;
    }
    const res = await Swal.fire({
      ...swalThemed,
      title: tl('swal_delete_title'),
      text: tl('swal_delete_body', { number: row.invoice_number }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: tl('swal_confirm_delete'),
      cancelButtonText: t('common.actions.cancel'),
    });
    if (!res.isConfirmed) return;
    setLoading(true);
    router.delete(`/inventory/grn-supplier-invoice/${row.id}`, {
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
            </div>
            <div className="filters-section flex flex-wrap gap-2 items-center">
              <select
                className="form-select min-w-[10rem]"
                value={statusFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setStatusFilter(v);
                  pushQuery({ search: searchTerm.trim(), status: v });
                }}
                aria-label={tl('status_label')}
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button type="button" className="btn btn-secondary btn-sm" onClick={resetAllFilters}>
                {tl('reset_filters')}
              </button>
            </div>
            <div className="actions-section">
              <button
                type="button"
                className="btn btn-primary"
                onClick={goNewInvoice}
                disabled={loading}
              >
                <Plus size={18} />
                {tl('new_invoice')}
              </button>
            </div>
          </div>
        </div>

        <div className="mx-4 mt-4">
          {rows.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="m-0 text-lg">{tl('empty')}</p>
              <p className="mt-2 text-sm m-0">{tl('empty_hint')}</p>
            </div>
          ) : (
            <>
              <div className="table-responsive rounded-lg border border-slate-200/80 dark:border-slate-700 overflow-hidden">
                <table className="data-table w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th>{tl('col_invoice_number')}</th>
                      <th>{tl('col_vendor')}</th>
                      <th>{tl('col_grn_count')}</th>
                      <th>{tl('col_voucher_date')}</th>
                      <th>{tl('col_status')}</th>
                      <th className="text-end">{tl('col_actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td className="font-mono font-medium">{row.invoice_number}</td>
                        <td>
                          {row.vendor
                            ? `${row.vendor.account_code} · ${row.vendor.account_name}`
                            : '—'}
                        </td>
                        <td>{row.goods_receipt_notes_count ?? 0}</td>
                        <td>{formatDisplayDate(row.voucher_date)}</td>
                        <td>
                          <span className={statusClass(row.status)}>{statusLabel(row.status)}</span>
                        </td>
                        <td className="text-end">
                          <div className="actions-cell flex flex-wrap gap-1 justify-end">
                            <button
                              type="button"
                              className="action-btn print-summary"
                              title={tl('print_summary')}
                              onClick={() =>
                                openSiPrint(`/inventory/grn-supplier-invoice/${row.id}/invoice/summary`)
                              }
                              disabled={loading}
                            >
                              <FileText size={16} />
                            </button>
                            <button
                              type="button"
                              className="action-btn print-detailed"
                              title={tl('print_detailed')}
                              onClick={() =>
                                openSiPrint(`/inventory/grn-supplier-invoice/${row.id}/invoice/detailed`)
                              }
                              disabled={loading}
                            >
                              <ScrollText size={16} />
                            </button>
                            {row.status === 'posted' && row.posted_transaction_id ? (
                              <button
                                type="button"
                                className="action-btn print-voucher"
                                title={tl('print_voucher')}
                                onClick={() =>
                                  openSiPrint(`/inventory/grn-supplier-invoice/${row.id}/invoice/voucher`)
                                }
                                disabled={loading}
                              >
                                <BookOpen size={16} />
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="action-btn edit"
                              title={tl('edit')}
                              onClick={() => goEditInvoice(row)}
                              disabled={loading}
                            >
                              <Edit3 size={16} />
                            </button>
                            {row.status === 'draft' && (
                              <button
                                type="button"
                                className="action-btn delete"
                                title={tl('delete')}
                                onClick={() => void deleteOne(row)}
                                disabled={loading}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {paginated && paginated.last_page > 1 && (
                <div className="pagination-container mt-4">
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
                          className={`pagination-btn px-3 py-1 ${link.active ? 'active' : ''}`}
                          onClick={() => router.visit(link.url, { preserveState: true, preserveScroll: true })}
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
    </App>
  );
}
