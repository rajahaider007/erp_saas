import React, { useCallback, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ClipboardList, FileText, Filter, Home, RefreshCcw, Search } from 'lucide-react';
import App from '../../App.jsx';
import Breadcrumbs from '@/Components/Breadcrumbs';
import CustomDatePicker from '@/Components/DatePicker/DatePicker';
import { useTranslations } from '@/hooks/useTranslations';
import { buildGrnSupplierInvoiceListingQueryString } from './gsiQueryString';
import { formatLocalYmd } from '@/utils/dateOnly';

export default function GrnSupplierInvoiceListingSearch() {
  const { vendorOptions = [], initialFilters = {}, error: bootError } = usePage().props;
  const { t } = useTranslations();
  const ts = useCallback((k, r = {}) => t(`inventory.reports.shared.${k}`, r), [t]);
  const tr = useCallback((k, r = {}) => t(`inventory.reports.grn_supplier_invoice_listing.${k}`, r), [t]);

  const [fromDate, setFromDate] = useState(initialFilters.date_from || '');
  const [toDate, setToDate] = useState(initialFilters.date_to || '');
  const [vendorId, setVendorId] = useState(initialFilters.vendor_id != null ? String(initialFilters.vendor_id) : '');
  const [status, setStatus] = useState(initialFilters.status || 'all');
  const [search, setSearch] = useState(initialFilters.search || '');
  const [sortBy, setSortBy] = useState(initialFilters.sort_by || 'voucher_date');
  const [sortOrder, setSortOrder] = useState(initialFilters.sort_order || 'desc');

  const runReport = useCallback(() => {
    const qs = buildGrnSupplierInvoiceListingQueryString({
      date_from: fromDate,
      date_to: toDate,
      vendor_id: vendorId,
      status,
      search,
      sort_by: sortBy,
      sort_order: sortOrder,
    });
    router.visit(`/inventory/reports/grn-supplier-invoice-listing/report?${qs}`);
  }, [fromDate, toDate, vendorId, status, search, sortBy, sortOrder]);

  const resetFilters = useCallback(() => {
    setFromDate('');
    setToDate('');
    setVendorId('');
    setStatus('all');
    setSearch('');
    setSortBy('voucher_date');
    setSortOrder('desc');
  }, []);

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
          <Breadcrumbs items={breadcrumbItems} description={tr('description')} />
        </div>
        {bootError && <div className="mx-4 mb-4 p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-sm">{bootError}</div>}
        <div className="manager-header mx-4 mt-2">
          <div className="header-main">
            <h1 className="page-title">
              <FileText className="title-icon" />
              {tr('title')}
            </h1>
            <button type="button" className="btn btn-secondary btn-sm" onClick={resetFilters}>
              <RefreshCcw size={18} />
            </button>
          </div>
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
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100"
                />
              </div>
              <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/80">
                <label className="text-xs font-semibold text-blue-400 mb-2 block">{tr('from_date')} / {tr('to_date')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <CustomDatePicker
                    selected={fromDate || null}
                    onChange={(d) => setFromDate(d ? formatLocalYmd(d) : '')}
                    type="date"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100"
                    isClearable
                  />
                  <CustomDatePicker
                    selected={toDate || null}
                    onChange={(d) => setToDate(d ? formatLocalYmd(d) : '')}
                    type="date"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100"
                    isClearable
                  />
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/80">
                <label className="text-xs font-semibold text-blue-400 mb-2 block">{tr('vendor')}</label>
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100"
                >
                  <option value="">{tr('vendor_all')}</option>
                  {vendorOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/80">
                <label className="text-xs font-semibold text-blue-400 mb-2 block">{tr('status')}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100"
                >
                  <option value="all">{tr('status_all')}</option>
                  <option value="draft">{tr('status_draft')}</option>
                  <option value="posted">{tr('status_posted')}</option>
                </select>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-5 border border-slate-600/80">
                <label className="text-xs font-semibold text-blue-400 mb-2 block">{tr('sort_by')}</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-gray-100">
                  <option value="voucher_date">{tr('sort_voucher_date')}</option>
                  <option value="invoice_number">{tr('sort_invoice_number')}</option>
                  <option value="vendor">{tr('sort_vendor')}</option>
                  <option value="status">{tr('sort_status')}</option>
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
