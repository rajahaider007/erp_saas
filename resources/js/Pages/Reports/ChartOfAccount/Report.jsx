import React, { useState, useEffect } from 'react';
import { Head, usePage, router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
  FileText, Download, Filter, Eye, EyeOff, Calendar, 
  Building, MapPin, Settings, Search, RefreshCw, 
  ChevronDown, ChevronUp, Printer, FileSpreadsheet,
  FileBarChart, Columns, Settings2, BarChart3, TrendingUp,
  AlertCircle
} from 'lucide-react';

/**
 * Chart of Account Report Component
 * 
 * Displays a comprehensive Chart of Accounts following IFRS standards
 * Features:
 * - Hierarchical account structure (Levels 1-4)
 * - Account balances and classifications
 * - Filtering by type, status, level
 * - Account analysis and balance visualization
 */
const ChartOfAccountReport = () => {
  const { auth, chartOfAccountData: initialData, filters: initialFilters, totals, company, error } = usePage().props;
  
  const [filters, setFilters] = useState({
    level: initialFilters?.level || 'all',
    account_type: initialFilters?.account_type || '',
    status: initialFilters?.status || 'Active',
    hide_zero: initialFilters?.hide_zero || false,
    sort_by: initialFilters?.sort_by || 'code',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Account levels
  const levels = [
    { value: 'all', label: 'All Levels' },
    { value: '1', label: 'Level 1 (Main Categories)' },
    { value: '2', label: 'Level 2 (Categories)' },
    { value: '3', label: 'Level 3 (Subcategories)' },
    { value: '4', label: 'Level 4 (Transactional)' },
  ];

  // Account types
  const accountTypes = [
    { value: '', label: 'All Types' },
    { value: 'Asset', label: 'Assets' },
    { value: 'Liability', label: 'Liabilities' },
    { value: 'Equity', label: 'Equity' },
    { value: 'Revenue', label: 'Revenue' },
    { value: 'Expense', label: 'Expenses' },
  ];

  // Account statuses
  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];

  // Sort options
  const sortOptions = [
    { value: 'code', label: 'By Code' },
    { value: 'name', label: 'By Name' },
    { value: 'balance', label: 'By Balance' },
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

    router.get(route('accounts.reports.chart-of-account.report'), Object.fromEntries(params), {
      onFinish: () => setLoading(false)
    });
  };

  const handleResetFilters = () => {
    setFilters({
      level: 'all',
      account_type: '',
      status: 'Active',
      hide_zero: false,
      sort_by: 'code',
    });
    setSearchTerm('');
  };

  const toggleRowExpansion = (accountId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedRows(newExpanded);
  };

  const getAccountTypeColor = (type) => {
    const colors = {
      'Asset': 'bg-blue-50 border-l-4 border-blue-500',
      'Liability': 'bg-red-50 border-l-4 border-red-500',
      'Equity': 'bg-green-50 border-l-4 border-green-500',
      'Revenue': 'bg-purple-50 border-l-4 border-purple-500',
      'Expense': 'bg-orange-50 border-l-4 border-orange-500',
    };
    return colors[type] || 'bg-gray-50 border-l-4 border-gray-300';
  };

  const getStatusBadge = (status) => {
    return status === 'Active' 
      ? 'inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full'
      : 'inline-block px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value || 0);
  };

  // Filter data based on search term
  const filteredData = initialData.filter(account =>
    account.account_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.account_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <AppLayout>
        <Head title="Chart of Accounts Report" />
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
      <Head title="Chart of Accounts Report" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chart of Accounts Report</h1>
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
                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Level
                  </label>
                  <select
                    value={filters.level}
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {levels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Account Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <select
                    value={filters.account_type}
                    onChange={(e) => handleFilterChange('account_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {accountTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sort_by}
                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sortOptions.map(sort => (
                      <option key={sort.value} value={sort.value}>
                        {sort.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hide Zero Balances */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hide_zero}
                      onChange={(e) => handleFilterChange('hide_zero', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Hide Zero Balances</span>
                  </label>
                </div>
              </div>

              {/* Search */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by code or name..."
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

        {/* Totals Summary */}
        {totals && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Total Debits</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totals.total_debit)}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Total Credits</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totals.total_credit)}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredData.length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totals.total_balance)}
              </p>
            </div>
          </div>
        )}

        {/* Chart of Accounts Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Code</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">Opening</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">Debit</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">Credit</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No accounts found matching the criteria
                    </td>
                  </tr>
                ) : (
                  filteredData.map((account, index) => (
                    <tr
                      key={account.id}
                      className={`border-b border-gray-200 hover:bg-gray-50 ${getAccountTypeColor(account.account_type)}`}
                    >
                      <td className="px-6 py-3 font-mono text-gray-900">
                        {account.account_code}
                      </td>
                      <td className="px-6 py-3 text-gray-900">
                        <div style={{ paddingLeft: `${account.level_indent || 0}px` }}>
                          {account.account_name}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        <span className="text-xs font-semibold px-2 py-1 bg-gray-200 text-gray-800 rounded">
                          {account.account_type}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={getStatusBadge(account.status)}>
                          {account.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right text-gray-900 font-mono">
                        {formatCurrency(account.opening_balance)}
                      </td>
                      <td className="px-6 py-3 text-right text-blue-600 font-mono">
                        {formatCurrency(account.total_debit)}
                      </td>
                      <td className="px-6 py-3 text-right text-red-600 font-mono">
                        {formatCurrency(account.total_credit)}
                      </td>
                      <td className="px-6 py-3 text-right font-mono font-semibold">
                        <span className={account.current_balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(account.current_balance)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* IFRS Compliance Notes */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">IFRS Compliance Notes</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Chart follows IAS 1 - Presentation of Financial Statements</li>
            <li>Account hierarchy supports segment reporting requirements (IFRS 8)</li>
            <li>Account levels track balance sheet and income statement items</li>
            <li>All transactions are recorded using double-entry principle</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};

export default ChartOfAccountReport;
