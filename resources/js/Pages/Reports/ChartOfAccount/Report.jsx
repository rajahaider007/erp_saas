import React, { useState, useEffect } from 'react';
import { Head, usePage, router, Link } from '@inertiajs/react';
import {
  FileText, Download, Filter, Eye, EyeOff, Calendar, 
  Building, MapPin, Settings, Search, RefreshCw, 
  ChevronDown, ChevronUp, Printer, FileSpreadsheet,
  FileBarChart, Columns, Settings2, BarChart3, TrendingUp,
  AlertCircle, Database, DollarSign, List
} from 'lucide-react';
import App from '../../App.jsx';

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

  const getStatusBadge = (status) => {
    return status === 'Active' 
      ? 'inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-full'
      : 'inline-block px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm rounded-full';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  const handleBackToFilters = () => {
    router.get(route('accounts.reports.chart-of-account.search'));
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter data based on search term
  const filteredData = initialData.filter(account =>
    account.account_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.account_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <FileText className="report-title-icon" />
                Chart of Accounts Report
              </h1>
              <div className="report-stats-summary">
                <div className="report-stat-item">
                  <List size={16} />
                  <span>{filteredData?.length || 0} Accounts</span>
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
            {filters.level && (
              <div className="filter-badge">
                <span className="filter-badge-label">Level:</span>
                <span className="filter-badge-value">{filters.level === 'all' ? 'All Levels' : `Level ${filters.level}`}</span>
              </div>
            )}
            {filters.account_type && (
              <div className="filter-badge">
                <span className="filter-badge-label">Type:</span>
                <span className="filter-badge-value">{filters.account_type}</span>
              </div>
            )}
            {filters.status && (
              <div className="filter-badge">
                <span className="filter-badge-label">Status:</span>
                <span className="filter-badge-value">{filters.status}</span>
              </div>
            )}
            {filters.hide_zero && (
              <div className="filter-badge">
                <span className="filter-badge-label">View:</span>
                <span className="filter-badge-value">Hide Zero Balances</span>
              </div>
            )}
            {filters.sort_by && (
              <div className="filter-badge">
                <span className="filter-badge-label">Sort:</span>
                <span className="filter-badge-value">By {filters.sort_by}</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="report-content">
          <div className="data-table-container">
            {/* Advanced Filters Panel */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-700 transition-colors text-white"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold">Advanced Filters</span>
                </div>
                {showFilters ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {showFilters && (
                <div className="px-6 py-4 border-t border-slate-700 bg-slate-750">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Level Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Account Level
                      </label>
                      <select
                        value={filters.level}
                        onChange={(e) => handleFilterChange('level', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Account Type
                      </label>
                      <select
                        value={filters.account_type}
                        onChange={(e) => handleFilterChange('account_type', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Sort By
                      </label>
                      <select
                        value={filters.sort_by}
                        onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <span className="text-sm text-gray-300">Hide Zero Balances</span>
                      </label>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Search className="inline-block w-4 h-4 mr-1" />
                      Search Accounts
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by code or name..."
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    />
                  </div>

                  {/* Filter Actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={handleApplyFilters}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Applying...' : 'Apply Filters'}
                    </button>
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 bg-slate-600 text-gray-200 rounded-lg hover:bg-slate-500 transition-colors"
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
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Debits</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {formatCurrency(totals.total_debit)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Credits</p>
                      <p className="text-2xl font-bold text-red-400">
                        {formatCurrency(totals.total_credit)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-red-600 transform rotate-180" />
                  </div>
                </div>
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Accounts</p>
                      <p className="text-2xl font-bold text-white">
                        {filteredData.length}
                      </p>
                    </div>
                    <List className="w-8 h-8 text-gray-600" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg border border-green-700 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-green-200">Total Balance</p>
                      <p className="text-2xl font-bold text-green-100">
                        {formatCurrency(totals.total_balance)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Chart of Accounts Table */}
            {filteredData.length === 0 ? (
              <div className="empty-state">
                <Database className="empty-icon" />
                <h3>No accounts found</h3>
                <p>No accounts match the selected criteria</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table bg-slate-800 text-white">
                  <thead>
                    <tr>
                      <th style={{width: '12%'}}>Code</th>
                      <th style={{width: '25%'}}>Name</th>
                      <th style={{width: '10%'}}>Type</th>
                      <th style={{width: '8%'}}>Status</th>
                      <th style={{width: '11%'}} className="text-right">Opening</th>
                      <th style={{width: '11%'}} className="text-right">Debit</th>
                      <th style={{width: '11%'}} className="text-right">Credit</th>
                      <th style={{width: '12%'}} className="text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((account, index) => (
                      <tr
                        key={account.id}
                        className="hover:bg-slate-700 text-white border-b border-slate-700"
                      >
                        <td className="font-mono text-blue-300">
                          {account.account_code}
                        </td>
                        <td>
                          <div style={{ paddingLeft: `${account.level_indent || 0}px` }}>
                            {account.account_name}
                          </div>
                        </td>
                        <td>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            account.account_type === 'Asset' ? 'bg-blue-900 text-blue-200' :
                            account.account_type === 'Liability' ? 'bg-red-900 text-red-200' :
                            account.account_type === 'Equity' ? 'bg-green-900 text-green-200' :
                            account.account_type === 'Revenue' ? 'bg-purple-900 text-purple-200' :
                            'bg-orange-900 text-orange-200'
                          }`}>
                            {account.account_type}
                          </span>
                        </td>
                        <td>
                          <span className={getStatusBadge(account.status)}>
                            {account.status}
                          </span>
                        </td>
                        <td className="text-right text-gray-300 font-mono">
                          {formatCurrency(account.opening_balance)}
                        </td>
                        <td className="text-right text-blue-400 font-mono">
                          {formatCurrency(account.total_debit)}
                        </td>
                        <td className="text-right text-red-400 font-mono">
                          {formatCurrency(account.total_credit)}
                        </td>
                        <td className="text-right font-mono font-semibold">
                          <span className={account.current_balance >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {formatCurrency(account.current_balance)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* IFRS Compliance Notes */}
            <div className="mt-6 bg-blue-900 text-white rounded-lg border border-blue-800 p-4">
              <h3 className="font-semibold mb-2 text-blue-200">
                <FileText className="inline-block w-5 h-5 mr-2" />
                IFRS Compliance Notes
              </h3>
              <ul className="text-sm space-y-1 list-disc list-inside text-blue-300">
                <li>Chart follows IAS 1 - Presentation of Financial Statements</li>
                <li>Account hierarchy supports segment reporting requirements (IFRS 8)</li>
                <li>Account levels track balance sheet and income statement items</li>
                <li>All transactions are recorded using double-entry principle</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
};

export default ChartOfAccountReport;
