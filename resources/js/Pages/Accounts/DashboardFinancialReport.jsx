import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { FileText, Calendar, Building2 } from 'lucide-react';
import App from '../App.jsx';

const DashboardFinancialReport = () => {
  const {
    reportTitle,
    reportDescription,
    reportType,
    currencySymbol = '$',
    accounts = [],
    totalBalance = 0,
    filters = {},
    generatedAt,
    company,
    error,
  } = usePage().props;

  const [fromDate, setFromDate] = useState(filters?.from_date || '');
  const [toDate, setToDate] = useState(filters?.to_date || '');

  const formatAmount = (amount) => {
    const value = Number(amount || 0);
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(value));

    return value < 0 ? `(${formatted})` : formatted;
  };

  const handleApplyFilters = () => {
    const params = {};
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;

    router.get(`/accounts/dashboard-report/${reportType}`, params, {
      preserveState: true,
      replace: true,
    });
  };

  return (
    <App>
      <div className="advanced-module-manager form-theme-system">
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title">
                <FileText className="title-icon" />
                {reportTitle || 'Financial Report'}
              </h1>
              <div className="stats-summary">
                <div className="stat-item">
                  <Building2 size={16} />
                  <span>{company?.company_name || 'Company'}</span>
                </div>
                <div className="stat-item">
                  <Calendar size={16} />
                  <span>{generatedAt ? new Date(generatedAt).toLocaleString() : 'Generated now'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="main-content p-6">
          {error ? (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
              {error}
            </div>
          ) : (
            <>
              <div className="mb-6 rounded-xl border border-slate-600 bg-slate-800/40 p-4">
                <p className="text-sm text-slate-300">{reportDescription}</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">From Date</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">To Date</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleApplyFilters}
                      className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Apply Date Filter
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-6 text-sm">
                  <div>
                    <span className="text-slate-400">Report Type: </span>
                    <span className="font-semibold text-white">{reportType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Accounts: </span>
                    <span className="font-semibold text-white">{accounts.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Balance: </span>
                    <span className="font-semibold text-emerald-400">
                      {currencySymbol}{formatAmount(totalBalance)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-600 bg-slate-800/40">
                <table className="min-w-full divide-y divide-slate-600">
                  <thead className="bg-slate-700/60">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-200">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-200">Account Code</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-200">Account Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-200">Account Type</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-200">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {accounts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                          No account data found for this report.
                        </td>
                      </tr>
                    ) : (
                      accounts.map((account, index) => (
                        <tr key={account.id} className="hover:bg-slate-700/30">
                          <td className="px-4 py-3 text-sm text-slate-300">{index + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-blue-300">{account.account_code}</td>
                          <td className="px-4 py-3 text-sm text-slate-100">{account.account_name}</td>
                          <td className="px-4 py-3 text-sm text-slate-300">{account.account_type}</td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-400">
                            {currencySymbol}{formatAmount(account.closing_balance)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </App>
  );
};

export default DashboardFinancialReport;
