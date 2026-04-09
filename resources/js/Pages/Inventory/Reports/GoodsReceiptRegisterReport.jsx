import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, FileSpreadsheet, Home, Printer, RefreshCw } from 'lucide-react';
import App from '../../App.jsx';
import Breadcrumbs from '@/Components/Breadcrumbs';
import { useTranslations } from '@/hooks/useTranslations';
import { buildGoodsReceiptRegisterQueryString } from './grrQueryString';

function fmtDate(v) {
  if (v == null || v === '') return '—';
  return typeof v === 'string' ? v.split('T')[0] : String(v);
}

function fmtNum(n, d = 4) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: 0 });
}

export default function GoodsReceiptRegisterReport() {
  const { vendorOptions = [], appliedFilters = {}, error: bootError } = usePage().props;
  const { t } = useTranslations();
  const ts = useCallback((k, r = {}) => t(`inventory.reports.shared.${k}`, r), [t]);
  const tr = useCallback((k, r = {}) => t(`inventory.reports.goods_receipt_register.${k}`, r), [t]);

  const [filters, setFilters] = useState(() => ({
    date_from: appliedFilters.date_from || '',
    date_to: appliedFilters.date_to || '',
    date_basis: appliedFilters.date_basis || 'receipt',
    vendor_id:
      appliedFilters.vendor_id != null && appliedFilters.vendor_id !== ''
        ? String(appliedFilters.vendor_id)
        : '',
    status: appliedFilters.status || 'all',
    posted_only: Boolean(appliedFilters.posted_only),
    search: appliedFilters.search || '',
    sort_by: appliedFilters.sort_by || 'receipt_date',
    sort_order: appliedFilters.sort_order || 'desc',
  }));

  const [perPage, setPerPage] = useState(
    appliedFilters.per_page != null ? Number(appliedFilters.per_page) : 50
  );
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, per_page: 50, current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const exportBase = useCallback(() => {
    const qs = buildGoodsReceiptRegisterQueryString({
      ...filters,
      vendor_id: filters.vendor_id,
    });
    return qs ? `?${qs}` : '';
  }, [filters]);

  const fetchData = useCallback(
    async (opts = {}) => {
      const usePageNum = opts.page ?? page;
      const usePerPage = opts.perPage ?? perPage;
      setLoading(true);
      setFetchError(null);
      try {
        const body = {
          date_from: filters.date_from || null,
          date_to: filters.date_to || null,
          date_basis: filters.date_basis,
          vendor_id: filters.vendor_id ? parseInt(filters.vendor_id, 10) : null,
          status: filters.status === 'all' ? null : filters.status,
          posted_only: filters.posted_only,
          search: filters.search.trim() || null,
          sort_by: filters.sort_by,
          sort_order: filters.sort_order,
          per_page: usePerPage,
          page: usePageNum,
        };
        const res = await fetch('/inventory/reports/goods-receipt-register/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
          body: JSON.stringify(body),
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
        setFetchError(String(e?.message || e));
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [filters, page, perPage, ts]
  );

  useEffect(() => {
    if (bootError) return;
    void fetchData();
  }, [bootError, fetchData]);

  const breadcrumbItems = useMemo(
    () => [
      { label: t('inventory.shared.breadcrumb_home'), href: '/dashboard', icon: Home },
      { label: t('inventory.shared.breadcrumb_inventory'), href: '#', icon: ClipboardList },
      { label: ts('breadcrumb_module'), href: '/inventory/reports', icon: ClipboardList },
      { label: tr('title'), href: '/inventory/reports/goods-receipt-register', icon: ClipboardList },
    ],
    [t, ts, tr]
  );

  const goChangeFilters = useCallback(() => {
    const qs = buildGoodsReceiptRegisterQueryString({
      ...filters,
      vendor_id: filters.vendor_id,
    });
    const path = qs
      ? `/inventory/reports/goods-receipt-register?${qs}`
      : '/inventory/reports/goods-receipt-register';
    router.visit(path);
  }, [filters]);

  const handlePrint = useCallback(() => {
    const path = `/inventory/reports/goods-receipt-register/print${exportBase()}`;
    window.open(path, '_blank', 'noopener,noreferrer');
  }, [exportBase]);

  const scopeChips = useMemo(() => {
    const chips = [];
    if (filters.date_from || filters.date_to) {
      chips.push(`${fmtDate(filters.date_from)} → ${fmtDate(filters.date_to)}`);
    }
    chips.push(
      filters.date_basis === 'posting' ? tr('date_basis_posting') : tr('date_basis_receipt')
    );
    if (filters.vendor_id) {
      const v = vendorOptions.find((o) => o.value === filters.vendor_id);
      chips.push(v ? v.label : `${tr('vendor')}: ${filters.vendor_id}`);
    }
    if (filters.status !== 'all') chips.push(`${tr('status')}: ${filters.status}`);
    if (filters.posted_only) chips.push(tr('posted_only'));
    if (filters.search.trim()) chips.push(filters.search.trim());
    return chips;
  }, [filters, vendorOptions, tr]);

  const updateSort = (sortBy, sortOrder) => {
    setFilters((f) => ({ ...f, sort_by: sortBy, sort_order: sortOrder }));
    setPage(1);
  };

  return (
    <App>
      <div className="advanced-module-manager form-theme-system min-h-screen">
        <div className="breadcrumb-header px-4 pt-4">
          <Breadcrumbs items={breadcrumbItems} description={tr('report_lead')} />
        </div>

        {(bootError || fetchError) && (
          <div className="mx-4 mb-4 p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-sm">
            {bootError || fetchError}
          </div>
        )}

        <div className="manager-header mx-4 mt-2">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title">
                <FileSpreadsheet className="title-icon" />
                {tr('report_heading')}
              </h1>
              <div className="stats-summary flex-wrap">
                {scopeChips.map((c) => (
                  <span key={c} className="stat-item rounded-full bg-slate-700/80 px-3 py-1 text-xs border border-slate-600">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="header-actions flex-wrap">
              <button type="button" className="btn btn-secondary btn-sm" onClick={goChangeFilters}>
                <ArrowLeft size={16} />
                {tr('change_filters')}
              </button>
              <a
                className="btn btn-secondary btn-sm"
                href={`/inventory/reports/goods-receipt-register/export/csv${exportBase()}`}
              >
                {tr('export_csv')}
              </a>
              <a
                className="btn btn-secondary btn-sm"
                href={`/inventory/reports/goods-receipt-register/export/excel${exportBase()}`}
              >
                {tr('export_excel')}
              </a>
              <a
                className="btn btn-secondary btn-sm"
                href={`/inventory/reports/goods-receipt-register/export/pdf${exportBase()}`}
              >
                {tr('export_pdf')}
              </a>
              <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint}>
                <Printer size={16} />
                {tr('print')}
              </button>
            </div>
          </div>
        </div>

        <p className="mx-4 text-xs text-slate-500 dark:text-slate-400">{tr('pdf_limit_hint')}</p>

        <div className="manager-content px-4 pb-10">
          <div className="rounded-xl border border-slate-600/60 bg-slate-900/40 overflow-hidden shadow-lg">
            <div className="flex flex-wrap items-end gap-3 px-4 py-3 border-b border-slate-600/60 bg-slate-800/50">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">{tr('sort_by')}</label>
                <select
                  className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-sm text-gray-100"
                  value={filters.sort_by}
                  onChange={(e) => updateSort(e.target.value, filters.sort_order)}
                >
                  <option value="receipt_date">{tr('sort_receipt_date')}</option>
                  <option value="grn_number">{tr('sort_grn_number')}</option>
                  <option value="vendor">{tr('sort_vendor')}</option>
                  <option value="item_code">{tr('sort_item_code')}</option>
                  <option value="line_amount">{tr('sort_line_amount')}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">{tr('sort_order')}</label>
                <select
                  className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-sm text-gray-100"
                  value={filters.sort_order}
                  onChange={(e) => updateSort(filters.sort_by, e.target.value)}
                >
                  <option value="asc">{tr('sort_asc')}</option>
                  <option value="desc">{tr('sort_desc')}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">{ts('per_page')}</label>
                <select
                  className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-sm text-gray-100"
                  value={String(perPage)}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    setPerPage(n);
                    setPage(1);
                  }}
                >
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                </select>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm ml-auto"
                onClick={() => void fetchData({ page })}
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                {ts('apply')}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left whitespace-nowrap">{tr('col_grn')}</th>
                    <th className="text-left whitespace-nowrap">{tr('col_receipt_date')}</th>
                    <th className="text-left whitespace-nowrap">{tr('col_posting_date')}</th>
                    <th className="text-left whitespace-nowrap">{tr('col_po')}</th>
                    <th className="text-left whitespace-nowrap">{tr('col_vendor')}</th>
                    <th className="text-right whitespace-nowrap">{tr('col_line')}</th>
                    <th className="text-left whitespace-nowrap">{tr('col_item')}</th>
                    <th className="text-left whitespace-nowrap">{tr('col_uom')}</th>
                    <th className="text-right whitespace-nowrap">{tr('col_receipt_qty')}</th>
                    <th className="text-right whitespace-nowrap">{tr('col_accepted_qty')}</th>
                    <th className="text-right whitespace-nowrap">{tr('col_rejected_qty')}</th>
                    <th className="text-right whitespace-nowrap">{tr('col_unit_cost')}</th>
                    <th className="text-right whitespace-nowrap">{tr('col_line_amount')}</th>
                    <th className="text-left whitespace-nowrap">{tr('col_currency')}</th>
                    <th className="text-left whitespace-nowrap">{tr('col_lot')}</th>
                    <th className="text-left whitespace-nowrap">{tr('col_expiry')}</th>
                    <th className="text-left whitespace-nowrap">{tr('col_grn_status')}</th>
                    <th className="text-left whitespace-nowrap">{tr('col_posted')}</th>
                    <th className="text-left whitespace-nowrap">{tr('col_posted_voucher')}</th>
                    <th className="text-left whitespace-nowrap">{tr('col_match')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={20} className="px-3 py-8 text-center text-slate-500">
                        {ts('loading')}
                      </td>
                    </tr>
                  )}
                  {!loading && rows.length === 0 && (
                    <tr>
                      <td colSpan={20} className="px-3 py-8 text-center text-slate-500">
                        {ts('no_data')}
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    rows.map((r) => (
                      <tr key={r.line_id}>
                        <td className="whitespace-nowrap font-mono text-xs">{r.grn_number}</td>
                        <td className="whitespace-nowrap">{fmtDate(r.receipt_date)}</td>
                        <td className="whitespace-nowrap">{fmtDate(r.posting_date)}</td>
                        <td className="whitespace-nowrap">{r.po_number || '—'}</td>
                        <td className="whitespace-nowrap max-w-[200px] truncate" title={`${r.vendor_code} — ${r.vendor_name}`}>
                          {r.vendor_code} — {r.vendor_name}
                        </td>
                        <td className="text-right">{r.line_no}</td>
                        <td className="max-w-[220px] truncate" title={r.item_name || r.item_description}>
                          {r.item_code || '—'} {r.item_name ? `— ${r.item_name}` : ''}
                        </td>
                        <td>{r.uom_code || '—'}</td>
                        <td className="text-right">{fmtNum(r.receipt_qty)}</td>
                        <td className="text-right">{fmtNum(r.accepted_qty)}</td>
                        <td className="text-right">{fmtNum(r.rejected_qty)}</td>
                        <td className="text-right">{fmtNum(r.unit_cost, 6)}</td>
                        <td className="text-right font-medium">{fmtNum(r.line_amount, 2)}</td>
                        <td>{r.currency_code || '—'}</td>
                        <td className="font-mono text-xs">{r.lot_batch_no || '—'}</td>
                        <td className="whitespace-nowrap">{fmtDate(r.expiry_date)}</td>
                        <td>{r.grn_status}</td>
                        <td>{r.posted ? ts('yes') : ts('no')}</td>
                        <td className="font-mono text-xs">{r.posted_transaction_id ?? '—'}</td>
                        <td className="text-xs">{r.three_way_match_status || '—'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {!loading && meta.last_page > 1 && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <span className="text-slate-600 dark:text-slate-300">
                {ts('page')} {meta.current_page} {ts('of')} {meta.last_page} ({meta.total})
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={meta.current_page <= 1}
                onClick={() => {
                  const p = Math.max(1, page - 1);
                  setPage(p);
                }}
              >
                {ts('prev')}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => {
                  setPage(page + 1);
                }}
              >
                {ts('next')}
              </button>
            </div>
          )}

          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400"
              onClick={() => router.visit('/inventory/reports')}
            >
              <ArrowLeft size={16} />
              {tr('back_hub')}
            </button>
          </div>
        </div>
      </div>
    </App>
  );
}
