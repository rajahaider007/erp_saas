import React, { useCallback, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ArrowRightLeft, BarChart3, Boxes, ClipboardList, FileSpreadsheet, FileText, GitCompare, History, Home, List } from 'lucide-react';
import App from '../../App.jsx';
import Breadcrumbs from '@/Components/Breadcrumbs';
import { useTranslations } from '@/hooks/useTranslations';

export default function InventoryReportsIndex() {
  const { error } = usePage().props;
  const { t } = useTranslations();
  const ts = useCallback((k, r = {}) => t(`inventory.reports.shared.${k}`, r), [t]);
  const ti = useCallback((k, r = {}) => t(`inventory.reports.index.${k}`, r), [t]);

  const breadcrumbItems = useMemo(
    () => [
      { label: t('inventory.shared.breadcrumb_home'), href: '/dashboard', icon: Home },
      { label: t('inventory.shared.breadcrumb_inventory'), href: '#', icon: ClipboardList },
      { label: ts('breadcrumb_module'), href: '/inventory/reports', icon: BarChart3 },
    ],
    [t, ts]
  );

  return (
    <App>
      <div className="page-container form-theme-system">
        <div className="breadcrumb-header px-4 pt-4">
          <Breadcrumbs items={breadcrumbItems} description={ti('description')} />
        </div>

        {error && (
          <div className="mx-4 mb-4 p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-sm">{error}</div>
        )}

        <div className="mx-4 mb-2 text-xs text-slate-500 dark:text-slate-400">{ts('standards_doc_hint')}</div>

        <div className="mx-4 mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <button
            type="button"
            onClick={() => router.visit('/inventory/reports/goods-receipt-register')}
            className="text-left rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-5 shadow-sm hover:border-indigo-400/60 transition-colors"
          >
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
              <ClipboardList size={20} />
              {ti('card_gr_title')}
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{ti('card_gr_body')}</p>
            <span className="mt-3 inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400">
              {ti('card_gr_link')} →
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.visit('/inventory/reports/purchase-order-lines')}
            className="text-left rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-5 shadow-sm hover:border-indigo-400/60 transition-colors"
          >
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
              <FileSpreadsheet size={20} />
              {ti('card_po_title')}
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{ti('card_po_body')}</p>
            <span className="mt-3 inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400">
              {ti('card_po_link')} →
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.visit('/inventory/reports/stock-position')}
            className="text-left rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-5 shadow-sm hover:border-indigo-400/60 transition-colors"
          >
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
              <Boxes size={20} />
              {ti('card_stock_title')}
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{ti('card_stock_body')}</p>
            <span className="mt-3 inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400">
              {ti('card_stock_link')} →
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.visit('/inventory/reports/grn-po-variance')}
            className="text-left rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-5 shadow-sm hover:border-indigo-400/60 transition-colors"
          >
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
              <GitCompare size={20} />
              {ti('card_gpv_title')}
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{ti('card_gpv_body')}</p>
            <span className="mt-3 inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400">{ti('card_gpv_link')} →</span>
          </button>

          <button
            type="button"
            onClick={() => router.visit('/inventory/reports/grn-supplier-invoice-listing')}
            className="text-left rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-5 shadow-sm hover:border-indigo-400/60 transition-colors"
          >
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
              <FileText size={20} />
              {ti('card_gsi_title')}
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{ti('card_gsi_body')}</p>
            <span className="mt-3 inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400">{ti('card_gsi_link')} →</span>
          </button>

          <button
            type="button"
            onClick={() => router.visit('/inventory/reports/purchase-requisition-lines')}
            className="text-left rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-5 shadow-sm hover:border-indigo-400/60 transition-colors"
          >
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
              <List size={20} />
              {ti('card_prl_title')}
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{ti('card_prl_body')}</p>
            <span className="mt-3 inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400">{ti('card_prl_link')} →</span>
          </button>

          <button
            type="button"
            onClick={() => router.visit('/inventory/reports/pr-to-po-conversion')}
            className="text-left rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-5 shadow-sm hover:border-indigo-400/60 transition-colors"
          >
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
              <ArrowRightLeft size={20} />
              {ti('card_p2p_title')}
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{ti('card_p2p_body')}</p>
            <span className="mt-3 inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400">{ti('card_p2p_link')} →</span>
          </button>

          <button
            type="button"
            onClick={() => router.visit('/inventory/reports/inventory-movements')}
            className="text-left rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-5 shadow-sm hover:border-indigo-400/60 transition-colors"
          >
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
              <History size={20} />
              {ti('card_imv_title')}
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{ti('card_imv_body')}</p>
            <span className="mt-3 inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400">{ti('card_imv_link')} →</span>
          </button>
        </div>
      </div>
    </App>
  );
}
