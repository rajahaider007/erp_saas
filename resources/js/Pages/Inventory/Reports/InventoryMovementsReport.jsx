import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, History, Home, RefreshCw } from 'lucide-react';
import App from '../../App.jsx';
import Breadcrumbs from '@/Components/Breadcrumbs';
import { useTranslations } from '@/hooks/useTranslations';
import { buildInventoryMovementsQueryString } from './imvQueryString';

function fmtDate(v) {
  if (v == null || v === '') return '—';
  return typeof v === 'string' ? v.split('T')[0] : String(v);
}

export default function InventoryMovementsReport() {
  const { appliedFilters = {}, error: bootError } = usePage().props;
  const { t } = useTranslations();
  const ts = useCallback((k, r = {}) => t(`inventory.reports.shared.${k}`, r), [t]);
  const tr = useCallback((k, r = {}) => t(`inventory.reports.inventory_movements.${k}`, r), [t]);

  const [filters] = useState(() => ({
    date_from: appliedFilters.date_from || '',
    date_to: appliedFilters.date_to || '',
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

  const exportBase = useCallback(() => `?${buildInventoryMovementsQueryString({ ...filters })}`, [filters]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/inventory/reports/inventory-movements/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          date_from: filters.date_from || null,
          date_to: filters.date_to || null,
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
      { label: tr('title'), href: '/inventory/reports/inventory-movements', icon: History },
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
            <History className="title-icon" />
            {tr('report_heading')}
          </h1>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => router.visit(`/inventory/reports/inventory-movements?${buildInventoryMovementsQueryString({ ...filters })}`)}>
              <ArrowLeft size={16} />
              {tr('change_filters')}
            </button>
            <a className="btn btn-secondary btn-sm" href={`/inventory/reports/inventory-movements/export/csv${exportBase()}`}>
              {tr('export_csv')}
            </a>
            <a className="btn btn-secondary btn-sm" href={`/inventory/reports/inventory-movements/export/excel${exportBase()}`}>
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
                <th>{tr('col_voucher_date')}</th>
                <th>{tr('col_grn')}</th>
                <th className="text-right">{tr('col_grn_line')}</th>
                <th>{tr('col_item')}</th>
                <th>{tr('col_uom')}</th>
                <th className="text-right">{tr('col_qty')}</th>
                <th className="text-right">{tr('col_unit_cost')}</th>
                <th className="text-right">{tr('col_line_value')}</th>
                <th>{tr('col_currency')}</th>
                <th className="text-right">{tr('col_posted_voucher')}</th>
                <th>{tr('col_source')}</th>
                <th>{tr('col_movement_at')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={12} className="text-center text-slate-500 py-8">
                    {ts('no_data')}
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.movement_id}>
                  <td>{fmtDate(r.voucher_date)}</td>
                  <td>{r.grn_number}</td>
                  <td className="text-right">{r.goods_receipt_note_line_id}</td>
                  <td>
                    {r.item_code} {r.item_name ? `— ${r.item_name}` : ''}
                  </td>
                  <td>{r.uom_code || '—'}</td>
                  <td className="text-right">{r.quantity_delta}</td>
                  <td className="text-right">{r.unit_cost != null ? r.unit_cost : '—'}</td>
                  <td className="text-right">{r.line_value_foreign}</td>
                  <td>{r.document_currency_code || '—'}</td>
                  <td className="text-right">{r.posted_transaction_id}</td>
                  <td className="max-w-[140px] truncate" title={r.source_type}>
                    {r.source_type}
                  </td>
                  <td className="whitespace-nowrap text-xs">{r.movement_at ? String(r.movement_at).replace('T', ' ').slice(0, 19) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {meta.last_page > 1 && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <span>
                {ts('page')} {meta.current_page} {ts('of')} {meta.last_page} ({meta.total})
              </span>
              <label className="flex items-center gap-2">
                {ts('per_page')}
                <select
                  className="bg-slate-800 border rounded px-2 py-1"
                  value={String(perPage)}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {[25, 50, 100, 200].map((n) => (
                    <option key={n} value={String(n)}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                {ts('prev')}
              </button>
              <button type="button" className="btn btn-secondary btn-sm" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>
                {ts('next')}
              </button>
            </div>
          )}
        </div>
      </div>
    </App>
  );
}
