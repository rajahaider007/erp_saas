import React, { useCallback, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ArrowRightLeft, ClipboardList, Filter, Home, RefreshCcw, Search } from 'lucide-react';
import App from '../../App.jsx';
import Breadcrumbs from '@/Components/Breadcrumbs';
import CustomDatePicker from '@/Components/DatePicker/DatePicker';
import { useTranslations } from '@/hooks/useTranslations';
import { buildPrToPoConversionQueryString } from './p2pQueryString';
import { formatLocalYmd } from '@/utils/dateOnly';

export default function PrToPoConversionSearch() {
  const { initialFilters = {}, error: bootError } = usePage().props;
  const { t } = useTranslations();
  const ts = useCallback((k, r = {}) => t(`inventory.reports.shared.${k}`, r), [t]);
  const tr = useCallback((k, r = {}) => t(`inventory.reports.pr_to_po_conversion.${k}`, r), [t]);

  const [fromDate, setFromDate] = useState(initialFilters.date_from || '');
  const [toDate, setToDate] = useState(initialFilters.date_to || '');
  const [prStatus, setPrStatus] = useState(initialFilters.pr_status || 'all');
  const [poLinkedOnly, setPoLinkedOnly] = useState(Boolean(initialFilters.po_linked_only));
  const [search, setSearch] = useState(initialFilters.search || '');
  const [sortBy, setSortBy] = useState(initialFilters.sort_by || 'pr_date');
  const [sortOrder, setSortOrder] = useState(initialFilters.sort_order || 'desc');

  const runReport = useCallback(() => {
    const qs = buildPrToPoConversionQueryString({
      date_from: fromDate,
      date_to: toDate,
      pr_status: prStatus,
      po_linked_only: poLinkedOnly,
      search,
      sort_by: sortBy,
      sort_order: sortOrder,
    });
    router.visit(`/inventory/reports/pr-to-po-conversion/report?${qs}`);
  }, [fromDate, toDate, prStatus, poLinkedOnly, search, sortBy, sortOrder]);

  const resetFilters = useCallback(() => {
    setFromDate('');
    setToDate('');
    setPrStatus('all');
    setPoLinkedOnly(false);
    setSearch('');
    setSortBy('pr_date');
    setSortOrder('desc');
  }, []);

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
          <Breadcrumbs items={breadcrumbItems} description={tr('description')} />
        </div>
        {bootError && <div className="mx-4 mb-4 p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-sm">{bootError}</div>}
        <div className="manager-header mx-4 mt-2 flex justify-between">
          <h1 className="page-title">
            <ArrowRightLeft className="title-icon" />
            {tr('title')}
          </h1>
          <button type="button" className="btn btn-secondary btn-sm" onClick={resetFilters}>
            <RefreshCcw size={18} />
          </button>
        </div>
        <div className="manager-content px-4 pb-10">
          <div className="filter-card">
            <div className="filter-card-header flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-100">{tr('search_heading')}</h2>
            </div>
            <div className="filter-card-body grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/80">
                <label className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-2">
                  <Search size={14} />
                  {tr('search_placeholder')}
                </label>
                <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-gray-100" />
              </div>
              <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/80">
                <label className="text-xs font-semibold text-blue-400 mb-2 block">{tr('from_date')} / {tr('to_date')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <CustomDatePicker selected={fromDate || null} onChange={(d) => setFromDate(d ? formatLocalYmd(d) : '')} type="date" className="w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-gray-100" isClearable />
                  <CustomDatePicker selected={toDate || null} onChange={(d) => setToDate(d ? formatLocalYmd(d) : '')} type="date" className="w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-gray-100" isClearable />
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/80">
                <label className="text-xs font-semibold text-blue-400 mb-2 block">{tr('pr_status')}</label>
                <select value={prStatus} onChange={(e) => setPrStatus(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-gray-100">
                  <option value="all">{tr('pr_status_all')}</option>
                  <option value="draft">{tr('pr_status_draft')}</option>
                  <option value="approved">{tr('pr_status_approved')}</option>
                </select>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/80 flex items-center">
                <label className="flex items-center gap-3 cursor-pointer text-gray-200">
                  <input type="checkbox" className="rounded border-slate-500 w-4 h-4" checked={poLinkedOnly} onChange={(e) => setPoLinkedOnly(e.target.checked)} />
                  <span>{tr('po_linked_only')}</span>
                </label>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/80">
                <label className="text-xs font-semibold text-blue-400 mb-2 block">{tr('sort_by')}</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-gray-100">
                  <option value="pr_date">{tr('sort_pr_date')}</option>
                  <option value="pr_number">{tr('sort_pr_number')}</option>
                  <option value="po_number">{tr('sort_po_number')}</option>
                  <option value="item_code">{tr('sort_item_code')}</option>
                </select>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/80">
                <label className="text-xs font-semibold text-blue-400 mb-2 block">{tr('sort_order')}</label>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-gray-100">
                  <option value="asc">{tr('sort_asc')}</option>
                  <option value="desc">{tr('sort_desc')}</option>
                </select>
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-3">
              <button type="button" className="btn btn-primary" onClick={runReport}>
                {tr('run_report')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => router.visit('/inventory/reports')}>
                {tr('back_hub')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
}
