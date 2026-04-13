import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, FileText, Home, RefreshCw } from 'lucide-react';
import App from '../../App.jsx';
import Breadcrumbs from '@/Components/Breadcrumbs';
import { useTranslations } from '@/hooks/useTranslations';
import { buildGrnSupplierInvoiceListingQueryString } from './gsiQueryString';

function fmtDate(v) {
  if (v == null || v === '') return '—';
  return typeof v === 'string' ? v.split('T')[0] : String(v);
}

export default function GrnSupplierInvoiceListingReport() {
  const { appliedFilters = {}, error: bootError } = usePage().props;
  const { t } = useTranslations();
  const ts = useCallback((k, r = {}) => t(`inventory.reports.shared.${k}`, r), [t]);
  const tr = useCallback((k, r = {}) => t(`inventory.reports.grn_supplier_invoice_listing.${k}`, r), [t]);

  const [filters, setFilters] = useState(() => ({
    date_from: appliedFilters.date_from || '',
    date_to: appliedFilters.date_to || '',
    vendor_id: appliedFilters.vendor_id != null ? String(appliedFilters.vendor_id) : '',
    status: appliedFilters.status || 'all',
    search: appliedFilters.search || '',
    sort_by: appliedFilters.sort_by || 'voucher_date',
    sort_order: appliedFilters.sort_order || 'desc',
  }));
  const [perPage, setPerPage] = useState(50);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const exportBase = useCallback(() => `?${buildGrnSupplierInvoiceListingQueryString({ ...filters })}`, [filters]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/inventory/reports/grn-supplier-invoice-listing/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          date_from: filters.date_from || null,
          date_to: filters.date_to || null,
          vendor_id: filters.vendor_id ? Number(filters.vendor_id) : null,
          status: filters.status,
          search: filters.search.trim() || null,
          sort_by: filters.sort_by,
          sort_order: filters.sort_order,
          per_page: perPage,
          page,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setRows([]);
        setFetchError(data.message || ts('no_data'));
        return;
      }
      setRows(data.rows || []);
      if (data.meta) setMeta(data.meta);
    } catch (e) {
      setFetchError(String(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page, perPage, ts]);

  useEffect(() => {
    if (!bootError) void fetchData();
  }, [bootError, fetchData]);

  const breadcrumbItems = useMemo(
    () => [
      { label: t('inventory.shared.breadcrumb_home'), href: '/dashboard', icon: Home },
      { label: t('inventory.shared.breadcrumb_inventory'), href: '#', icon: ClipboardList },
      { label: ts('breadcrumb_module'), href: '/inventory/reports', icon: ClipboardList },
      { label: tr('title'), href: '/inventory/reports/grn-supplier-invoice-listing', icon: FileText },
    ],
    [t, ts, tr]
  );

  return (
    <App>
      <div className="advanced-module-manager form-theme-system min-h-screen">
        <div className="breadcrumb-header px-4 pt-4">
          <Breadcrumbs items={breadcrumbItems} description={tr('report_lead')} />
        </div>
        {(bootError || fetchError) && (
          <div className="mx-4 mb-4 p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-sm">{bootError || fetchError}</div>
        )}
        <div className="manager-header mx-4 mt-2 flex flex-wrap justify-between gap-2">
          <h1 className="page-title">
            <FileText className="title-icon" />
            {tr('report_heading')}
          </h1>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => router.visit(`/inventory/reports/grn-supplier-invoice-listing?${buildGrnSupplierInvoiceListingQueryString({ ...filters })}`)}>
              <ArrowLeft size={16} />
              {tr('change_filters')}
            </button>
            <a className="btn btn-secondary btn-sm" href={`/inventory/reports/grn-supplier-invoice-listing/export/csv${exportBase()}`}>
              {tr('export_csv')}
            </a>
            <a className="btn btn-secondary btn-sm" href={`/inventory/reports/grn-supplier-invoice-listing/export/excel${exportBase()}`}>
              {tr('export_excel')}
            </a>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => void fetchData()} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
        <div className="manager-content px-4 pb-10 overflow-x-auto">
          <table className="data-table min-w-full text-sm">
            <thead>
              <tr>
                <th>{tr('col_invoice')}</th>
                <th>{tr('col_voucher_date')}</th>
                <th>{tr('col_supplier_inv_date')}</th>
                <th>{tr('col_due')}</th>
                <th>{tr('col_vendor')}</th>
                <th>{tr('col_status')}</th>
                <th className="text-right">{tr('col_linked_grns')}</th>
                <th>{tr('col_posted')}</th>
                <th>{tr('col_reference')}</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500">
                    {ts('loading')}
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr key={r.id}>
                    <td className="font-mono text-xs">{r.invoice_number}</td>
                    <td>{fmtDate(r.voucher_date)}</td>
                    <td>{fmtDate(r.supplier_invoice_date)}</td>
                    <td>{fmtDate(r.due_date)}</td>
                    <td className="max-w-[200px] truncate">
                      {r.vendor_code} — {r.vendor_name}
                    </td>
                    <td>{r.status}</td>
                    <td className="text-right">{r.linked_grn_count}</td>
                    <td className="font-mono text-xs">{r.posted_transaction_id ?? '—'}</td>
                    <td className="max-w-[160px] truncate">{r.reference_number || '—'}</td>
                  </tr>
                ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500">
                    {ts('no_data')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {meta.total > 0 && (
            <div className="mt-3 text-sm text-slate-400 flex justify-between">
              <span>
                {ts('page')} {meta.current_page} {ts('of')} {meta.last_page}
              </span>
              <div className="flex gap-2">
                <button type="button" className="btn btn-secondary btn-sm" disabled={meta.current_page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  {ts('prev')}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={meta.current_page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {ts('next')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </App>
  );
}
