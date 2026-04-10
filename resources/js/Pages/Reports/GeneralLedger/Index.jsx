import React, { useState, useEffect, useMemo } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';
import AppLayout from '@/Layouts/AppLayout';
import {
  FileText, Download, Filter, Eye, EyeOff, Calendar, 
  Building, User, Settings, Search, RefreshCw, 
  ChevronDown, ChevronUp, Printer, FileSpreadsheet,
  FileBarChart, Columns, Settings2, BarChart3
} from 'lucide-react';
import CustomDatePicker from '../../../Components/DatePicker/DatePicker';
import { formatLocalYmd, todayLocalYmd } from '@/utils/dateOnly';

const GeneralLedgerReport = () => {
  const { auth, company, currencies } = usePage().props;
  const { t } = useTranslations();

  const translateLedgerAccountType = (type) => {
    if (type == null || type === '') return type;
    const lower = String(type).trim().toLowerCase();
    const keyBy = {
      asset: 'type_asset',
      assets: 'type_asset',
      liability: 'type_liability',
      liabilities: 'type_liability',
      equity: 'type_equity',
      revenue: 'type_revenue',
      expense: 'type_expense',
      expenses: 'type_expense',
    };
    const idx = keyBy[lower];
    return idx ? t(`reports.general_ledger.index.${idx}`) : type;
  };

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState({
    date_from: todayLocalYmd(),
    date_to: todayLocalYmd(),
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

  const accountTypes = useMemo(() => [
    { value: 'asset', label: t('reports.general_ledger.index.type_asset') },
    { value: 'liability', label: t('reports.general_ledger.index.type_liability') },
    { value: 'equity', label: t('reports.general_ledger.index.type_equity') },
    { value: 'revenue', label: t('reports.general_ledger.index.type_revenue') },
    { value: 'expense', label: t('reports.general_ledger.index.type_expense') }
  ], [t]);

  const columns = useMemo(() => [
    { key: 'account_code', label: t('reports.general_ledger.index.col_account_code'), width: '120px', type: 'text' },
    { key: 'account_name', label: t('reports.general_ledger.index.col_account_name'), width: '200px', type: 'text' },
    { key: 'account_type', label: t('reports.general_ledger.index.col_type'), width: '100px', type: 'text' },
    { key: 'opening_balance', label: t('reports.general_ledger.index.col_opening_balance'), width: '150px', type: 'currency' },
    { key: 'debit_total', label: t('reports.general_ledger.index.col_debit_total'), width: '150px', type: 'currency' },
    { key: 'credit_total', label: t('reports.general_ledger.index.col_credit_total'), width: '150px', type: 'currency' },
    { key: 'closing_balance', label: t('reports.general_ledger.index.col_closing_balance'), width: '150px', type: 'currency' },
    { key: 'transactions_count', label: t('reports.general_ledger.index.col_transactions'), width: '100px', type: 'number' },
    { key: 'last_transaction_date', label: t('reports.general_ledger.index.col_last_transaction'), width: '150px', type: 'date' }
  ], [t]);

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
      a.download = `General_Ledger_Report_${todayLocalYmd()}.pdf`;
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
      a.download = `General_Ledger_Report_${todayLocalYmd()}.xlsx`;
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
      a.download = `General_Ledger_Report_${todayLocalYmd()}.csv`;
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
    <AppLayout title={t('reports.general_ledger.index.general_ledger_report')}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <FileText className="w-6 h-6 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('reports.general_ledger.index.general_ledger_report')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('reports.general_ledger.index.subtitle')}
            </p>
          </div>
        </div>
        
        <div className="page-actions">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary mr-2"
          >
            <Filter className="w-4 h-4 mr-2" />
            {t('reports.general_ledger.index.filters')}
          </button>
          
          <button
            onClick={() => setShowColumnSettings(!showColumnSettings)}
            className="btn btn-secondary mr-2"
          >
            <Columns className="w-4 h-4 mr-2" />
            {t('reports.general_ledger.index.columns')}
          </button>
          
          <div className="dropdown">
            <button className="btn btn-primary dropdown-toggle">
              <Download className="w-4 h-4 mr-2" />
              {t('reports.general_ledger.index.export')}
            </button>
            <div className="dropdown-menu">
              <button onClick={exportToPDF} disabled={exporting} className="dropdown-item">
                <FileBarChart className="w-4 h-4 mr-2" />
                {t('reports.general_ledger.index.export_pdf')}
              </button>
              <button onClick={exportToExcel} disabled={exporting} className="dropdown-item">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                {t('reports.general_ledger.index.export_excel')}
              </button>
              <button onClick={exportToCSV} disabled={exporting} className="dropdown-item">
                <FileText className="w-4 h-4 mr-2" />
                {t('reports.general_ledger.index.export_csv')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="card-title">{t('reports.general_ledger.index.report_filters')}</h3>
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
                <label className="form-label">{t('reports.general_ledger.index.from_date')}</label>
                <CustomDatePicker
                  selected={filters.date_from || null}
                  onChange={(date) => setFilters({...filters, date_from: date ? formatLocalYmd(date) : ''})}
                  type="date"
                  placeholder={t('reports.general_ledger.index.select_from_date')}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="form-label">{t('reports.general_ledger.index.to_date')}</label>
                <CustomDatePicker
                  selected={filters.date_to || null}
                  onChange={(date) => setFilters({...filters, date_to: date ? formatLocalYmd(date) : ''})}
                  type="date"
                  placeholder={t('reports.general_ledger.index.select_to_date')}
                  className="form-input"
                />
              </div>
              
              {/* Currency */}
              <div>
                <label className="form-label">{t('reports.general_ledger.index.currency')}</label>
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
                <label className="form-label">{t('reports.general_ledger.index.account_types')}</label>
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
                              account_types: filters.account_types.filter((at) => at !== type.value)
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
                <label className="form-label">{t('reports.general_ledger.index.options')}</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.include_zero_balances}
                      onChange={(e) => setFilters({...filters, include_zero_balances: e.target.checked})}
                      className="form-checkbox"
                    />
                    <span className="ml-2 text-sm">{t('reports.general_ledger.index.include_zero_balances')}</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.show_details}
                      onChange={(e) => setFilters({...filters, show_details: e.target.checked})}
                      className="form-checkbox"
                    />
                    <span className="ml-2 text-sm">{t('reports.general_ledger.index.show_transaction_details')}</span>
                  </label>
                </div>
              </div>
              
              {/* Sort Options */}
              <div>
                <label className="form-label">{t('reports.general_ledger.index.sort_by')}</label>
                <select
                  value={filters.sort_by}
                  onChange={(e) => setFilters({...filters, sort_by: e.target.value})}
                  className="form-select"
                >
                  <option value="account_code">{t('reports.general_ledger.index.account_code')}</option>
                  <option value="account_name">{t('reports.general_ledger.index.account_name')}</option>
                  <option value="balance">{t('reports.general_ledger.index.balance')}</option>
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
                {loading ? t('reports.general_ledger.index.generating_report') : t('reports.general_ledger.index.generate_report')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Column Settings Panel */}
      {showColumnSettings && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="card-title">{t('reports.general_ledger.index.column_settings')}</h3>
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
              <h3 className="card-title">{t('reports.general_ledger.index.general_ledger_report')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('reports.general_ledger.index.period_line', { from: filters.date_from, to: filters.date_to })}
                {' | '}
                {t('reports.general_ledger.index.currency_line', { currency: filters.currency })}
                {' | '}
                {t('reports.general_ledger.index.generated_line', { date: new Date().toLocaleDateString() })}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => window.print()}
                className="btn btn-secondary"
              >
                <Printer className="w-4 h-4 mr-2" />
                {t('reports.general_ledger.index.print')}
              </button>
            </div>
          </div>
        </div>
        
        <div className="card-body p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
              <span className="ml-2">{t('reports.general_ledger.index.loading_report')}</span>
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
                              {translateLedgerAccountType(row.account_type)}
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
                      {visibleColumns.account_code && <td>{t('reports.general_ledger.index.total')}</td>}
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
                      {t('reports.general_ledger.index.total_accounts')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(totals.debit_total)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('reports.general_ledger.index.total_debits')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(totals.credit_total)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('reports.general_ledger.index.total_credits')}
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
