import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
  FileText, Download, Filter, Eye, EyeOff, Calendar, 
  Building, User, Settings, Search, RefreshCw, 
  ChevronDown, ChevronUp, Printer, FileSpreadsheet,
  FileBarChart, Columns, Settings2, BarChart3
} from 'lucide-react';
import CustomDatePicker from '../../../Components/DatePicker/DatePicker';

const GeneralLedgerReport = () => {
  const { auth, company, currencies } = usePage().props;
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState({
    date_from: new Date().toISOString().split('T')[0],
    date_to: new Date().toISOString().split('T')[0],
    account_codes: [],
    account_types: [],
    currency: company?.currency || 'USD',
    include_zero_balances: false,
    show_details: true,
    group_by: 'account', // account, type, period
    sort_by: 'account_code', // account_code, account_name, balance
    sort_order: 'asc'
  });
  
  const [visibleColumns, setVisibleColumns] = useState({
    account_code: true,
    account_name: true,
    account_type: true,
    opening_balance: true,
    debit_total: true,
    credit_total: true,
    closing_balance: true,
    transactions_count: true,
    last_transaction_date: true
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Account types for filtering
  const accountTypes = [
    { value: 'asset', label: 'Assets' },
    { value: 'liability', label: 'Liabilities' },
    { value: 'equity', label: 'Equity' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'expense', label: 'Expenses' }
  ];

  // Column definitions
  const columns = [
    { key: 'account_code', label: 'Account Code', width: '120px', type: 'text' },
    { key: 'account_name', label: 'Account Name', width: '200px', type: 'text' },
    { key: 'account_type', label: 'Type', width: '100px', type: 'text' },
    { key: 'opening_balance', label: 'Opening Balance', width: '150px', type: 'currency' },
    { key: 'debit_total', label: 'Debit Total', width: '150px', type: 'currency' },
    { key: 'credit_total', label: 'Credit Total', width: '150px', type: 'currency' },
    { key: 'closing_balance', label: 'Closing Balance', width: '150px', type: 'currency' },
    { key: 'transactions_count', label: 'Transactions', width: '100px', type: 'number' },
    { key: 'last_transaction_date', label: 'Last Transaction', width: '150px', type: 'date' }
  ];

  // Load report data
  const loadReportData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/reports/general-ledger/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify(filters)
      });
      
      const data = await response.json();
      setReportData(data.report || []);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export functions
  const exportToPDF = async () => {
    setExporting(true);
    try {
      const response = await fetch('/reports/general-ledger/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify({ filters, visibleColumns })
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `General_Ledger_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const response = await fetch('/reports/general-ledger/export/excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify({ filters, visibleColumns })
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `General_Ledger_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = async () => {
    setExporting(true);
    try {
      const response = await fetch('/reports/general-ledger/export/csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify({ filters, visibleColumns })
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `General_Ledger_Report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount, currency = filters.currency) => {
    const currencySymbol = currencies.find(c => c.value === currency)?.symbol || '$';
    return `${currencySymbol} ${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    });
  };

  // Calculate totals
  const calculateTotals = () => {
    const totals = reportData.reduce((acc, row) => {
      acc.opening_balance += parseFloat(row.opening_balance || 0);
      acc.debit_total += parseFloat(row.debit_total || 0);
      acc.credit_total += parseFloat(row.credit_total || 0);
      acc.closing_balance += parseFloat(row.closing_balance || 0);
      return acc;
    }, { opening_balance: 0, debit_total: 0, credit_total: 0, closing_balance: 0 });
    
    return totals;
  };

  const totals = calculateTotals();

  useEffect(() => {
    loadReportData();
  }, [filters]);

  return (
    <AppLayout title="General Ledger Report">
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <FileText className="w-6 h-6 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              General Ledger Report
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive financial report following international standards
            </p>
          </div>
        </div>
        
        <div className="page-actions">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary mr-2"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          
          <button
            onClick={() => setShowColumnSettings(!showColumnSettings)}
            className="btn btn-secondary mr-2"
          >
            <Columns className="w-4 h-4 mr-2" />
            Columns
          </button>
          
          <div className="dropdown">
            <button className="btn btn-primary dropdown-toggle">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <div className="dropdown-menu">
              <button onClick={exportToPDF} disabled={exporting} className="dropdown-item">
                <FileBarChart className="w-4 h-4 mr-2" />
                Export to PDF
              </button>
              <button onClick={exportToExcel} disabled={exporting} className="dropdown-item">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export to Excel
              </button>
              <button onClick={exportToCSV} disabled={exporting} className="dropdown-item">
                <FileText className="w-4 h-4 mr-2" />
                Export to CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="card-title">Report Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="btn-icon btn-icon-secondary"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date Range */}
              <div>
                <label className="form-label">From Date</label>
                <CustomDatePicker
                  selected={filters.date_from ? new Date(filters.date_from) : null}
                  onChange={(date) => setFilters({...filters, date_from: date ? date.toISOString().split('T')[0] : ''})}
                  type="date"
                  placeholder="Select from date"
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="form-label">To Date</label>
                <CustomDatePicker
                  selected={filters.date_to ? new Date(filters.date_to) : null}
                  onChange={(date) => setFilters({...filters, date_to: date ? date.toISOString().split('T')[0] : ''})}
                  type="date"
                  placeholder="Select to date"
                  className="form-input"
                />
              </div>
              
              {/* Currency */}
              <div>
                <label className="form-label">Currency</label>
                <select
                  value={filters.currency}
                  onChange={(e) => setFilters({...filters, currency: e.target.value})}
                  className="form-select"
                >
                  {currencies.map(currency => (
                    <option key={currency.value} value={currency.value}>
                      {currency.symbol} {currency.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Account Types */}
              <div>
                <label className="form-label">Account Types</label>
                <div className="space-y-2">
                  {accountTypes.map(type => (
                    <label key={type.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.account_types.includes(type.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({
                              ...filters, 
                              account_types: [...filters.account_types, type.value]
                            });
                          } else {
                            setFilters({
                              ...filters, 
                              account_types: filters.account_types.filter(t => t !== type.value)
                            });
                          }
                        }}
                        className="form-checkbox"
                      />
                      <span className="ml-2 text-sm">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Options */}
              <div>
                <label className="form-label">Options</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.include_zero_balances}
                      onChange={(e) => setFilters({...filters, include_zero_balances: e.target.checked})}
                      className="form-checkbox"
                    />
                    <span className="ml-2 text-sm">Include Zero Balances</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.show_details}
                      onChange={(e) => setFilters({...filters, show_details: e.target.checked})}
                      className="form-checkbox"
                    />
                    <span className="ml-2 text-sm">Show Transaction Details</span>
                  </label>
                </div>
              </div>
              
              {/* Sort Options */}
              <div>
                <label className="form-label">Sort By</label>
                <select
                  value={filters.sort_by}
                  onChange={(e) => setFilters({...filters, sort_by: e.target.value})}
                  className="form-select"
                >
                  <option value="account_code">Account Code</option>
                  <option value="account_name">Account Name</option>
                  <option value="balance">Balance</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={loadReportData}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Column Settings Panel */}
      {showColumnSettings && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="card-title">Column Settings</h3>
            <button
              onClick={() => setShowColumnSettings(false)}
              className="btn-icon btn-icon-secondary"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {columns.map(column => (
                <label key={column.key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={visibleColumns[column.key]}
                    onChange={(e) => setVisibleColumns({
                      ...visibleColumns, 
                      [column.key]: e.target.checked
                    })}
                    className="form-checkbox"
                  />
                  <span className="ml-2 text-sm">{column.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Report Content */}
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="card-title">General Ledger Report</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Period: {filters.date_from} to {filters.date_to} | 
                Currency: {filters.currency} | 
                Generated: {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => window.print()}
                className="btn btn-secondary"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
            </div>
          </div>
        </div>
        
        <div className="card-body p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
              <span className="ml-2">Loading report...</span>
            </div>
          ) : (
            <>
              {/* Report Table */}
              <div className="overflow-x-auto">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      {columns.map(column => (
                        visibleColumns[column.key] && (
                          <th key={column.key} style={{ width: column.width }}>
                            {column.label}
                          </th>
                        )
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row, index) => (
                      <tr key={index}>
                        {visibleColumns.account_code && (
                          <td className="font-mono text-sm">{row.account_code}</td>
                        )}
                        {visibleColumns.account_name && (
                          <td className="font-medium">{row.account_name}</td>
                        )}
                        {visibleColumns.account_type && (
                          <td>
                            <span className="badge badge-secondary">
                              {row.account_type}
                            </span>
                          </td>
                        )}
                        {visibleColumns.opening_balance && (
                          <td className="text-right font-mono">
                            {formatCurrency(row.opening_balance)}
                          </td>
                        )}
                        {visibleColumns.debit_total && (
                          <td className="text-right font-mono text-red-600">
                            {formatCurrency(row.debit_total)}
                          </td>
                        )}
                        {visibleColumns.credit_total && (
                          <td className="text-right font-mono text-green-600">
                            {formatCurrency(row.credit_total)}
                          </td>
                        )}
                        {visibleColumns.closing_balance && (
                          <td className="text-right font-mono font-bold">
                            {formatCurrency(row.closing_balance)}
                          </td>
                        )}
                        {visibleColumns.transactions_count && (
                          <td className="text-center">{row.transactions_count}</td>
                        )}
                        {visibleColumns.last_transaction_date && (
                          <td className="text-sm">
                            {row.last_transaction_date ? formatDate(row.last_transaction_date) : '-'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  
                  {/* Totals Row */}
                  <tfoot>
                    <tr className="bg-gray-50 dark:bg-gray-800 font-bold">
                      {visibleColumns.account_code && <td>Total</td>}
                      {visibleColumns.account_name && <td></td>}
                      {visibleColumns.account_type && <td></td>}
                      {visibleColumns.opening_balance && (
                        <td className="text-right font-mono">
                          {formatCurrency(totals.opening_balance)}
                        </td>
                      )}
                      {visibleColumns.debit_total && (
                        <td className="text-right font-mono text-red-600">
                          {formatCurrency(totals.debit_total)}
                        </td>
                      )}
                      {visibleColumns.credit_total && (
                        <td className="text-right font-mono text-green-600">
                          {formatCurrency(totals.credit_total)}
                        </td>
                      )}
                      {visibleColumns.closing_balance && (
                        <td className="text-right font-mono">
                          {formatCurrency(totals.closing_balance)}
                        </td>
                      )}
                      {visibleColumns.transactions_count && <td></td>}
                      {visibleColumns.last_transaction_date && <td></td>}
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {/* Report Summary */}
              <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reportData.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Accounts
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(totals.debit_total)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Debits
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(totals.credit_total)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Credits
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default GeneralLedgerReport;
