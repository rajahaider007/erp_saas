import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRightLeft, ClipboardList, Home, RefreshCw } from 'lucide-react';
import App from '../../App.jsx';
import Breadcrumbs from '@/Components/Breadcrumbs';
import { useTranslations } from '@/hooks/useTranslations';
import { buildPrToPoConversionQueryString } from './p2pQueryString';

function fmtDate(v) {
  if (v == null || v === '') return '—';
  return typeof v === 'string' ? v.split('T')[0] : String(v);
}

export default function PrToPoConversionReport() {
  const { appliedFilters = {}, error: bootError } = usePage().props;
  const { t } = useTranslations();
  const ts = useCallback((k, r = {}) => t(`inventory.reports.shared.${k}`, r), [t]);
  const tr = useCallback((k, r = {}) => t(`inventory.reports.pr_to_po_conversion.${k}`, r), [t]);

  const [filters, setFilters] = useState(() => ({
    date_from: appliedFilters.date_from || '',
    date_to: appliedFilters.date_to || '',
    pr_status: appliedFilters.pr_status || 'all',
    po_linked_only: Boolean(appliedFilters.po_linked_only),
    search: appliedFilters.search || '',
    sort_by: appliedFilters.sort_by || 'pr_date',
    sort_order: appliedFilters.sort_order || 'desc',
  }));
  const [perPage, setPerPage] = useState(50);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const exportBase = useCallback(() => `?${buildPrToPoConversionQueryString({ ...filters })}`, [filters]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/inventory/reports/pr-to-po-conversion/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          date_from: filters.date_from || null,
          date_to: filters.date_to || null,
          pr_status: filters.pr_status,
          po_linked_only: filters.po_linked_only,
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
      { label: tr('title'), href: '/inventory/reports/pr-to-po-conversion', icon: ArrowRightLeft },
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
            <ArrowRightLeft className="title-icon" />
            {tr('report_heading')}
          </h1>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => router.visit(`/inventory/reports/pr-to-po-conversion?${buildPrToPoConversionQueryString({ ...filters })}`)}>
              <ArrowLeft size={16} />
              {tr('change_filters')}
            </button>
            <a className="btn btn-secondary btn-sm" href={`/inventory/reports/pr-to-po-conversion/export/csv${exportBase()}`}>
              {tr('export_csv')}
            </a>
            <a className="btn btn-secondary btn-sm" href={`/inventory/reports/pr-to-po-conversion/export/excel${exportBase()}`}>
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
                <th>{tr('col_pr')}</th>
                <th>{tr('col_pr_date')}</th>
                <th>{tr('col_pr_status')}</th>
                <th className="text-right">{tr('col_pr_line')}</th>
                <th>{tr('col_item')}</th>
                <th className="text-right">{tr('col_pr_qty')}</th>
                <th>{tr('col_po')}</th>
                <th>{tr('col_po_date')}</th>
                <th>{tr('col_po_status')}</th>
                <th className="text-right">{tr('col_po_line')}</th>
                <th className="text-right">{tr('col_po_ordered')}</th>
                <th>{tr('col_vendor')}</th>
                <th className="text-right">{tr('col_days')}</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={13} className="text-center py-8 text-slate-500">
                    {ts('loading')}
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr key={r.pr_line_id}>
                    <td className="font-mono text-xs">{r.pr_number}</td>
                    <td>{fmtDate(r.pr_date)}</td>
                    <td>{r.pr_status}</td>
                    <td className="text-right">{r.pr_line_no}</td>
                    <td className="max-w-[180px] truncate">
                      {r.item_code} {r.item_name ? `— ${r.item_name}` : ''}
                    </td>
                    <td className="text-right">{r.pr_quantity}</td>
                    <td className="font-mono text-xs">{r.po_number || '—'}</td>
                    <td>{fmtDate(r.po_date)}</td>
                    <td>{r.po_status || '—'}</td>
                    <td className="text-right">{r.po_line_no ?? '—'}</td>
                    <td className="text-right">{r.po_ordered_qty ?? '—'}</td>
                    <td className="max-w-[160px] truncate">{r.vendor_code ? `${r.vendor_code} — ${r.vendor_name}` : '—'}</td>
                    <td className="text-right">{r.days_pr_to_po ?? '—'}</td>
                  </tr>
                ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={13} className="text-center py-8 text-slate-500">
                    {ts('no_data')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </App>
  );
}
