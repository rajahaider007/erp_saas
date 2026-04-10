import React, { useCallback, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Boxes, ClipboardList, Filter, Home, RefreshCcw, Search } from 'lucide-react';
import App from '../../App.jsx';
import Breadcrumbs from '@/Components/Breadcrumbs';
import CustomDatePicker from '@/Components/DatePicker/DatePicker';
import { useTranslations } from '@/hooks/useTranslations';
import { buildStockPositionQueryString } from './spQueryString';
import { formatLocalYmd, todayLocalYmd } from '@/utils/dateOnly';

export default function StockPositionSearch() {
  const { initialFilters = {}, error: bootError } = usePage().props;
  const { t } = useTranslations();
  const ts = useCallback((k, r = {}) => t(`inventory.reports.shared.${k}`, r), [t]);
  const tr = useCallback((k, r = {}) => t(`inventory.reports.stock_position.${k}`, r), [t]);

  const [asOfDate, setAsOfDate] = useState(initialFilters.as_of_date || todayLocalYmd());
  const [postedOnly, setPostedOnly] = useState(Boolean(initialFilters.posted_only));
  const [search, setSearch] = useState(initialFilters.search || '');
  const [sortBy, setSortBy] = useState(initialFilters.sort_by || 'item_code');
  const [sortOrder, setSortOrder] = useState(initialFilters.sort_order || 'asc');

  const runReport = useCallback(() => {
    const qs = buildStockPositionQueryString({
      as_of_date: asOfDate,
      posted_only: postedOnly,
      search,
      sort_by: sortBy,
      sort_order: sortOrder,
    });
    router.visit(`/inventory/reports/stock-position/report?${qs}`);
  }, [asOfDate, postedOnly, search, sortBy, sortOrder]);

  const resetFilters = useCallback(() => {
    setAsOfDate(todayLocalYmd());
    setPostedOnly(false);
    setSearch('');
    setSortBy('item_code');
    setSortOrder('asc');
  }, []);

  const breadcrumbItems = useMemo(
    () => [
      { label: t('inventory.shared.breadcrumb_home'), href: '/dashboard', icon: Home },
      { label: t('inventory.shared.breadcrumb_inventory'), href: '#', icon: ClipboardList },
      { label: ts('breadcrumb_module'), href: '/inventory/reports', icon: ClipboardList },
      { label: tr('title'), href: '/inventory/reports/stock-position', icon: Boxes },
    ],
    [t, ts, tr]
  );

  return (
    <App>
      <div className="advanced-module-manager form-theme-system min-h-screen">
        <div className="breadcrumb-header px-4 pt-4">
          <Breadcrumbs items={breadcrumbItems} description={tr('description')} />
        </div>

        {bootError && (
          <div className="mx-4 mb-4 p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-sm">{bootError}</div>
        )}

        <div className="manager-header mx-4 mt-2">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title">
                <Boxes className="title-icon" />
                {tr('title')}
              </h1>
              <div className="stats-summary">
                <div className="stat-item">
                  <Filter size={16} />
                  <span>{tr('search_lead')}</span>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={resetFilters} title={tr('reset_filters')}>
                <RefreshCcw size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="manager-content px-4 pb-10">
          <div className="filter-card">
            <div className="filter-card-header">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-100">{tr('search_heading')}</h2>
              </div>
            </div>

            <div className="filter-card-body">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/80 space-y-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wide">
                    <Search size={14} />
                    {tr('search_placeholder')}
                  </label>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={tr('search_placeholder')}
                  />
                </div>

                <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/80">
                  <label className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wide mb-3">
                    {tr('as_of_date')}
                  </label>
                  <CustomDatePicker
                    selected={asOfDate || null}
                    onChange={(d) => setAsOfDate(d ? formatLocalYmd(d) : todayLocalYmd())}
                    type="date"
                    placeholder={tr('as_of_date')}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100"
                    isClearable={false}
                  />
                  <p className="mt-2 text-xs text-slate-400">{tr('as_of_hint')}</p>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/80 flex flex-col justify-center">
                  <label className="flex items-center gap-3 cursor-pointer text-gray-200">
                    <input
                      type="checkbox"
                      className="rounded border-slate-500 w-4 h-4 text-blue-500 focus:ring-blue-500"
                      checked={postedOnly}
                      onChange={(e) => setPostedOnly(e.target.checked)}
                    />
                    <span>{tr('posted_only')}</span>
                  </label>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/80">
                  <label className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-2 block">{tr('sort_by')}</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="item_code">{tr('sort_item_code')}</option>
                      <option value="qty_on_hand">{tr('sort_qty')}</option>
                      <option value="value_on_hand">{tr('sort_value')}</option>
                    </select>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="asc">{tr('sort_asc')}</option>
                      <option value="desc">{tr('sort_desc')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button type="button" className="btn btn-primary" onClick={runReport}>
                  {tr('run_report')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
}
