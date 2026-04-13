import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, Home, List, RefreshCw } from 'lucide-react';
import App from '../../App.jsx';
import Breadcrumbs from '@/Components/Breadcrumbs';
import { useTranslations } from '@/hooks/useTranslations';
import { buildPurchaseRequisitionLinesQueryString } from './prlQueryString';

function fmtDate(v) {
  if (v == null || v === '') return '—';
  return typeof v === 'string' ? v.split('T')[0] : String(v);
}

export default function PurchaseRequisitionLinesReport() {
  const { appliedFilters = {}, error: bootError } = usePage().props;
  const { t } = useTranslations();
  const ts = useCallback((k, r = {}) => t(`inventory.reports.shared.${k}`, r), [t]);
  const tr = useCallback((k, r = {}) => t(`inventory.reports.purchase_requisition_lines.${k}`, r), [t]);

  const [filters, setFilters] = useState(() => ({
    date_from: appliedFilters.date_from || '',
    date_to: appliedFilters.date_to || '',
    status: appliedFilters.status || 'all',
    department_id: appliedFilters.department_id != null ? String(appliedFilters.department_id) : '',
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

  const exportBase = useCallback(() => `?${buildPurchaseRequisitionLinesQueryString({ ...filters })}`, [filters]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/inventory/reports/purchase-requisition-lines/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          date_from: filters.date_from || null,
          date_to: filters.date_to || null,
          status: filters.status,
          department_id: filters.department_id ? Number(filters.department_id) : null,
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
      { label: tr('title'), href: '/inventory/reports/purchase-requisition-lines', icon: List },
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
            <List className="title-icon" />
            {tr('report_heading')}
          </h1>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => router.visit(`/inventory/reports/purchase-requisition-lines?${buildPurchaseRequisitionLinesQueryString({ ...filters })}`)}>
              <ArrowLeft size={16} />
              {tr('change_filters')}
            </button>
            <a className="btn btn-secondary btn-sm" href={`/inventory/reports/purchase-requisition-lines/export/csv${exportBase()}`}>
              {tr('export_csv')}
            </a>
            <a className="btn btn-secondary btn-sm" href={`/inventory/reports/purchase-requisition-lines/export/excel${exportBase()}`}>
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
                <th>{tr('col_status')}</th>
                <th>{tr('col_dept')}</th>
                <th className="text-right">{tr('col_line')}</th>
                <th>{tr('col_item')}</th>
                <th>{tr('col_uom')}</th>
                <th className="text-right">{tr('col_qty')}</th>
                <th className="text-right">{tr('col_est_unit')}</th>
                <th className="text-right">{tr('col_line_value')}</th>
                <th>{tr('col_need_by')}</th>
                <th>{tr('col_currency')}</th>
                <th>{tr('col_requester')}</th>
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
                  <tr key={r.line_id}>
                    <td className="font-mono text-xs">{r.pr_number}</td>
                    <td>{fmtDate(r.pr_date)}</td>
                    <td>{r.pr_status}</td>
                    <td>{r.department_name || '—'}</td>
                    <td className="text-right">{r.line_no}</td>
                    <td className="max-w-[200px] truncate">
                      {r.item_code} {r.item_name ? `— ${r.item_name}` : ''}
                    </td>
                    <td>{r.uom_code || '—'}</td>
                    <td className="text-right">{r.quantity}</td>
                    <td className="text-right">{r.estimated_unit_price ?? '—'}</td>
                    <td className="text-right">{r.line_value_estimate ?? '—'}</td>
                    <td>{fmtDate(r.need_by_date)}</td>
                    <td>{r.currency_code || '—'}</td>
                    <td>{r.requested_by || '—'}</td>
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
