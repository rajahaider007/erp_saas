import React, { useCallback, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ClipboardList, Filter, History, Home, RefreshCcw, Search } from 'lucide-react';
import App from '../../App.jsx';
import Breadcrumbs from '@/Components/Breadcrumbs';
import CustomDatePicker from '@/Components/DatePicker/DatePicker';
import { useTranslations } from '@/hooks/useTranslations';
import { buildInventoryMovementsQueryString } from './imvQueryString';
import { formatLocalYmd } from '@/utils/dateOnly';

export default function InventoryMovementsSearch() {
  const { initialFilters = {}, error: bootError } = usePage().props;
  const { t } = useTranslations();
  const ts = useCallback((k, r = {}) => t(`inventory.reports.shared.${k}`, r), [t]);
  const tr = useCallback((k, r = {}) => t(`inventory.reports.inventory_movements.${k}`, r), [t]);

  const [fromDate, setFromDate] = useState(initialFilters.date_from || '');
  const [toDate, setToDate] = useState(initialFilters.date_to || '');
  const [search, setSearch] = useState(initialFilters.search || '');
  const [sortBy, setSortBy] = useState(initialFilters.sort_by || 'voucher_date');
  const [sortOrder, setSortOrder] = useState(initialFilters.sort_order || 'desc');

  const runReport = useCallback(() => {
    const qs = buildInventoryMovementsQueryString({
      date_from: fromDate,
      date_to: toDate,
      search,
      sort_by: sortBy,
      sort_order: sortOrder,
    });
    router.visit(`/inventory/reports/inventory-movements/report?${qs}`);
  }, [fromDate, toDate, search, sortBy, sortOrder]);

  const resetFilters = useCallback(() => {
    setFromDate('');
    setToDate('');
    setSearch('');
    setSortBy('voucher_date');
    setSortOrder('desc');
  }, []);

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
          <Breadcrumbs items={breadcrumbItems} description={tr('search_lead')} />
        </div>
        {bootError && <div className="mx-4 mb-4 p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-sm">{bootError}</div>}
        <div className="manager-header mx-4 mt-2 flex justify-between">
          <h1 className="page-title">
            <History className="title-icon" />
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
                <label className="text-xs font-semibold text-blue-400 mb-2 block">
                  {tr('from_date')} / {tr('to_date')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <CustomDatePicker selected={fromDate || null} onChange={(d) => setFromDate(d ? formatLocalYmd(d) : '')} type="date" className="w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-gray-100" isClearable />
                  <CustomDatePicker selected={toDate || null} onChange={(d) => setToDate(d ? formatLocalYmd(d) : '')} type="date" className="w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-gray-100" isClearable />
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/80 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-blue-400 mb-2 block">{tr('sort_by')}</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-gray-100">
                    <option value="voucher_date">{tr('sort_voucher_date')}</option>
                    <option value="grn_number">{tr('sort_grn_number')}</option>
                    <option value="item_code">{tr('sort_item_code')}</option>
                    <option value="quantity_delta">{tr('sort_qty')}</option>
                    <option value="posted_transaction_id">{tr('sort_posted_voucher')}</option>
                    <option value="line_value">{tr('sort_line_value')}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-blue-400 mb-2 block">{tr('sort_order')}</label>
                  <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-gray-100">
                    <option value="desc">{tr('sort_desc')}</option>
                    <option value="asc">{tr('sort_asc')}</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="filter-card-footer px-5 pb-5">
              <button type="button" className="btn btn-primary" onClick={runReport}>
                {tr('run_report')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
}
