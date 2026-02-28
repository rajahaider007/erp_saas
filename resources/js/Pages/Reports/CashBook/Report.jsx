import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import {
  FileText, Download, Filter, Eye, EyeOff, Calendar, 
  Building, MapPin, Settings, Search, RefreshCw, 
  ChevronDown, ChevronUp, Printer, FileSpreadsheet,
  FileBarChart, Columns, Settings2, TrendingUp,
  AlertCircle, CreditCard, ArrowDown, ArrowUp, DollarSign, Database
} from 'lucide-react';
import App from '../../App.jsx';

/**
 * Cash Book Report Component
 * 
 * Displays cash and bank account transactions following IAS 7 (Cash Flow Statement)
 * Features:
 * - Track receipts and payments
 * - Opening and closing balances
 * - Multi-account view or single account focus
 * - Transaction details with date-wise listing
 */
const CashBookReport = () => {
  const { auth, cashBookData: initialData, accounts, filters: initialFilters, totals, company, error } = usePage().props;

  const [filters, setFilters] = useState({
    account_id: initialFilters?.account_id || '',
    from_date: initialFilters?.from_date || '',
    to_date: initialFilters?.to_date || '',
    view_type: initialFilters?.view_type || 'summary',
    search: initialFilters?.search || '',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [expandedAccounts, setExpandedAccounts] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // View type options
  const viewTypes = [
    { value: 'summary', label: 'Summary View' },
    { value: 'detailed', label: 'Detailed View' },
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    setLoading(true);
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== '' && filters[key] !== false) {
        params.append(key, filters[key]);
      }
    });

    router.get(route('accounts.reports.cash-book.report'), Object.fromEntries(params), {
      onFinish: () => setLoading(false)
    });
  };

  const handleResetFilters = () => {
    setFilters({
      account_id: '',
      from_date: '',
      to_date: '',
      view_type: 'summary',
      search: '',
    });
  };

  const handleBackToFilters = () => {
    router.get(route('accounts.reports.cash-book.search'));
  };

  const toggleAccountExpansion = (accountId) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (error) {
    return (
      <App>
        <div className="reports-container">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-center gap-3 text-red-800 dark:text-red-300">
                <AlertCircle className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Error</h3>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </App>
    );
  }

  return (
    <App>
      <div className="reports-container">
        {/* Header */}
        <div className="report-header">
          <div className="report-header-main">
            <div className="report-title-section">
              <h1 className="report-title">
                <CreditCard className="report-title-icon" />
                Cash Book Report
              </h1>
              <div className="report-stats-summary">
                <div className="report-stat-item">
                  <DollarSign size={16} />
                  <span>{initialData?.length || 0} Accounts</span>
                </div>
                {company && (
                  <div className="report-stat-item">
                    <Building size={16} />
                    <span>{company.company_name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="report-header-actions">
              <button
                className="report-btn"
                onClick={handleBackToFilters}
                title="Back to Filters"
              >
                <Filter size={20} />
                Change Filters
              </button>

              <button
                className="report-btn"
                onClick={handlePrint}
                title="Print Report"
              >
                <Printer size={20} />
                Print
              </button>

              {/* Export Dropdown */}
              <div className="dropdown">
                <button className="report-btn dropdown-toggle">
                  <Download size={20} />
                  Export
                  <ChevronDown size={16} />
                </button>
                <div className="dropdown-menu bg-slate-700 border-slate-600">
                  <button className="text-white hover:bg-slate-600">
                    <FileSpreadsheet size={16} />
                    Export as Excel
                  </button>
                  <button className="text-white hover:bg-slate-600">
                    <FileBarChart size={16} />
                    Export as PDF
                  </button>
                  <button className="text-white hover:bg-slate-600">
                    <FileText size={16} />
                    Export as CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Applied Filters Display */}
        <div className="applied-filters-container">
          <div className="applied-filters-title">Applied Filters:</div>
          <div className="applied-filters-list">
            {filters.account_id ? (
              <div className="filter-badge">
                <span className="filter-badge-label">Account:</span>
                <span className="filter-badge-value">Selected Account</span>
              </div>
            ) : (
              <div className="filter-badge">
                <span className="filter-badge-label">Scope:</span>
                <span className="filter-badge-value">All Cash/Bank Accounts</span>
              </div>
            )}
            {filters.from_date && (
              <div className="filter-badge">
                <span className="filter-badge-label">From:</span>
                <span className="filter-badge-value">{filters.from_date}</span>
              </div>
            )}
            {filters.to_date && (
              <div className="filter-badge">
                <span className="filter-badge-label">To:</span>
                <span className="filter-badge-value">{filters.to_date}</span>
              </div>
            )}
            {filters.view_type && (
              <div className="filter-badge">
                <span className="filter-badge-label">View:</span>
                <span className="filter-badge-value">{filters.view_type}</span>
              </div>
            )}
            {filters.search && (
              <div className="filter-badge">
                <span className="filter-badge-label">Search:</span>
                <span className="filter-badge-value">{filters.search}</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="report-content">
          <div className="data-table-container">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading cash book...</p>
              </div>
            ) : !initialData || initialData.length === 0 ? (
              <div className="empty-state">
                <Database className="empty-icon" />
                <h3>No cash or bank accounts found</h3>
                <p>No transactions available for the selected criteria</p>
              </div>
            ) : (
              <>
                {/* Grand Totals Summary */}
                {totals && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Opening Balance</p>
                          <p className="text-2xl font-bold text-white">
                            {formatCurrency(totals.total_opening_balance)}
                          </p>
                        </div>
                        <DollarSign className="w-8 h-8 text-gray-600" />
                      </div>
                    </div>

                    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Total Receipts</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(totals.total_receipts)}
                          </p>
                        </div>
                        <ArrowDown className="w-8 h-8 text-green-400" />
                      </div>
                    </div>

                    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400">Total Payments</p>
                          <p className="text-2xl font-bold text-red-600">
                            {formatCurrency(totals.total_payments)}
                          </p>
                        </div>
                        <ArrowUp className="w-8 h-8 text-red-400" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg border border-blue-700 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-blue-200">Closing Balance</p>
                          <p className="text-2xl font-bold text-blue-100">
                            {formatCurrency(totals.total_closing_balance)}
                          </p>
                        </div>
                        <CreditCard className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Cash Book Data by Account */}
                <div className="space-y-8">
                  {initialData.map((accountData) => (
                    <div key={accountData.account_id} className="account-section">
                      {/* Account Header */}
                      <div className="account-header bg-blue-900 text-white p-4 rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold">
                              {accountData.account_code} - {accountData.account_name}
                            </h3>
                            <p className="text-sm opacity-80">Currency: {accountData.currency}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">Opening Balance:</p>
                            <p className="text-lg font-bold">{formatCurrency(accountData.summary.opening_balance)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Account Summary Stats */}
                      <div className="px-6 py-4 bg-slate-750 border-b border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs uppercase font-semibold text-gray-400">Opening Balance</p>
                          <p className="text-lg font-bold text-white">
                            {formatCurrency(accountData.summary.opening_balance)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase font-semibold text-gray-400">Total Receipts</p>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(accountData.summary.total_receipts)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase font-semibold text-gray-400">Total Payments</p>
                          <p className="text-lg font-bold text-red-600">
                            {formatCurrency(accountData.summary.total_payments)}
                          </p>
                        </div>
                        <div className="bg-blue-900 rounded p-2">
                          <p className="text-xs uppercase font-semibold text-blue-200">Closing Balance</p>
                          <p className="text-lg font-bold text-blue-100">
                            {formatCurrency(accountData.summary.closing_balance)}
                          </p>
                        </div>
                      </div>

                      {/* Transactions Table */}
                      <div className="table-wrapper">
                        <table className="data-table bg-slate-800 text-white">
                          <thead>
                            <tr>
                              <th style={{width: '12%'}}>Date</th>
                              <th style={{width: '15%'}}>Reference</th>
                              <th style={{width: '35%'}}>Description</th>
                              <th style={{width: '14%'}} className="text-right">Receipt</th>
                              <th style={{width: '14%'}} className="text-right">Payment</th>
                              <th style={{width: '14%'}} className="text-right">Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {accountData.transactions && accountData.transactions.length === 0 ? (
                              <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                  No transactions found for this account
                                </td>
                              </tr>
                            ) : (
                              accountData.transactions && accountData.transactions.map((transaction, txIndex) => (
                                <tr key={txIndex} className="hover:bg-slate-700 text-white">
                                  <td>{formatDate(transaction.voucher_date)}</td>
                                  <td>{transaction.voucher_number}</td>
                                  <td>
                                    <div>
                                      <p className="font-medium">{transaction.description}</p>
                                      {transaction.reference_number && (
                                        <p className="text-xs text-gray-500">Ref: {transaction.reference_number}</p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="text-right">
                                    {transaction.receipt > 0 ? (
                                      <span className="text-green-600 font-semibold">
                                        {formatCurrency(transaction.receipt)}
                                      </span>
                                    ) : (
                                      <span className="text-gray-700">-</span>
                                    )}
                                  </td>
                                  <td className="text-right">
                                    {transaction.payment > 0 ? (
                                      <span className="text-red-600 font-semibold">
                                        {formatCurrency(transaction.payment)}
                                      </span>
                                    ) : (
                                      <span className="text-gray-700">-</span>
                                    )}
                                  </td>
                                  <td className="text-right font-bold">
                                    <span className={transaction.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                                      {formatCurrency(transaction.balance)}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>

                {/* IAS 7 Compliance Notes */}
                <div className="mt-6 bg-green-900 text-white rounded-lg border border-green-800 p-4">
                  <h3 className="font-semibold mb-2 text-green-200">
                    IAS 7 - Cash Flow Compliance
                  </h3>
                  <ul className="text-sm space-y-1 list-disc list-inside text-green-300">
                    <li>Cash book tracks all cash and bank account movements</li>
                    <li>Provides basis for operating, investing, and financing activities segregation</li>
                    <li>Running balance maintained for bank reconciliation support</li>
                    <li>All transactions recorded on cash receipt/payment basis</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </App>
  );
};

export default CashBookReport;
