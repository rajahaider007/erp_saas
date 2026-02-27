import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '../../../../Components/Layout/AppLayout';
import {
  FileText, Download, Filter, Eye, EyeOff, Calendar, 
  Building, MapPin, Settings, Search, RefreshCw, 
  ChevronDown, ChevronUp, Printer, FileSpreadsheet,
  FileBarChart, Columns, Settings2, TrendingUp,
  AlertCircle, CreditCard, ArrowDown, ArrowUp, DollarSign
} from 'lucide-react';

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

  if (error) {
    return (
      <AppLayout>
        <Head title="Cash Book Report" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Error</h3>
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Head title="Cash Book Report" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cash Book Report</h1>
            {company && (
              <p className="text-gray-600 text-sm mt-2">
                {company.company_name}
              </p>
            )}
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>

        {/* Filter Panel */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-700">Filters</span>
            </div>
            {showFilters ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {showFilters && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Bank/Cash Account Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank/Cash Account
                  </label>
                  <select
                    value={filters.account_id}
                    onChange={(e) => handleFilterChange('account_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Accounts</option>
                    {accounts && accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.account_code} - {account.account_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* From Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.from_date}
                    onChange={(e) => handleFilterChange('from_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* To Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.to_date}
                    onChange={(e) => handleFilterChange('to_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* View Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    View Type
                  </label>
                  <select
                    value={filters.view_type}
                    onChange={(e) => handleFilterChange('view_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {viewTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by reference, description, or voucher number..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filter Actions */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleApplyFilters}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Applying...' : 'Apply Filters'}
                </button>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Grand Totals Summary */}
        {totals && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Opening Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totals.total_opening_balance)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Receipts</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totals.total_receipts)}
                  </p>
                </div>
                <ArrowDown className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totals.total_payments)}
                  </p>
                </div>
                <ArrowUp className="w-8 h-8 text-red-400" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-semibold">Closing Balance</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(totals.total_closing_balance)}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>
        )}

        {/* Cash Book Data by Account */}
        <div className="space-y-6">
          {initialData && initialData.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No cash or bank accounts found</p>
            </div>
          ) : (
            initialData && initialData.map((accountData, index) => (
              <div key={accountData.account_id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Account Header */}
                <button
                  onClick={() => toggleAccountExpansion(accountData.account_id)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 border-b border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">
                        {accountData.account_code} - {accountData.account_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Currency: {accountData.currency}
                      </p>
                    </div>
                  </div>
                  {expandedAccounts.has(accountData.account_id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                {expandedAccounts.has(accountData.account_id) && (
                  <>
                    {/* Account Summary */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold">Opening Balance</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(accountData.summary.opening_balance)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold">Total Receipts</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(accountData.summary.total_receipts)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold">Total Payments</p>
                        <p className="text-lg font-bold text-red-600">
                          {formatCurrency(accountData.summary.total_payments)}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded p-2">
                        <p className="text-xs text-blue-700 uppercase font-semibold">Closing Balance</p>
                        <p className="text-lg font-bold text-blue-900">
                          {formatCurrency(accountData.summary.closing_balance)}
                        </p>
                      </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700">Date</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700">Reference</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700">Description</th>
                            <th className="px-6 py-3 text-right font-semibold text-gray-700">Receipt</th>
                            <th className="px-6 py-3 text-right font-semibold text-gray-700">Payment</th>
                            <th className="px-6 py-3 text-right font-semibold text-gray-700">Balance</th>
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
                              <tr key={txIndex} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-3 text-gray-900 font-mono">
                                  {formatDate(transaction.voucher_date)}
                                </td>
                                <td className="px-6 py-3 text-gray-900 font-mono">
                                  {transaction.voucher_number}
                                </td>
                                <td className="px-6 py-3 text-gray-700">
                                  <div>
                                    <p className="font-medium">{transaction.description}</p>
                                    {transaction.reference_number && (
                                      <p className="text-xs text-gray-600">Ref: {transaction.reference_number}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-3 text-right font-mono">
                                  {transaction.receipt > 0 ? (
                                    <span className="text-green-600 font-semibold">
                                      {formatCurrency(transaction.receipt)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-3 text-right font-mono">
                                  {transaction.payment > 0 ? (
                                    <span className="text-red-600 font-semibold">
                                      {formatCurrency(transaction.payment)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-3 text-right font-mono font-semibold">
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
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* IAS 7 Compliance Notes */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">IAS 7 - Cash Flow Compliance</h3>
          <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
            <li>Cash book tracks all cash and bank account movements</li>
            <li>Provides basis for operating, investing, and financing activities segregation</li>
            <li>Running balance maintained for bank reconciliation support</li>
            <li>All transactions recorded on cash receipt/payment basis</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};

export default CashBookReport;
