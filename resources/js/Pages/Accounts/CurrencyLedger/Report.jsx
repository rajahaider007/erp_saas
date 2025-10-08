import React, { useEffect, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
  Search as SearchIcon, 
  Filter, 
  FileText,
  Database,
  Calendar,
  RefreshCcw,
  ChevronRight,
  BookOpen,
  TrendingUp,
  DollarSign,
  Globe,
  Download,
  Printer,
  FileSpreadsheet,
  FileText as FileTextIcon
} from 'lucide-react';
import App from '../../App.jsx';

const CurrencyLedgerReport = () => {
  const { 
    groupedData = {}, 
    accounts = [], 
    accountTotals = {},
    account, 
    company, 
    filters = {},
    totalDebit = 0,
    totalCredit = 0,
    flash
  } = usePage().props;

  // Load DataTables CSS and JS dynamically
  useEffect(() => {
    const loadDataTables = async () => {
      // Load CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css';
      document.head.appendChild(cssLink);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js';
      script.onload = () => {
        // Initialize DataTable
        if (window.$ && window.$.fn.DataTable) {
          window.$('#currencyLedgerTable').DataTable({
            language: {
              search: "Search transactions:",
              lengthMenu: "Show _MENU_ entries per page",
              info: "Showing _START_ to _END_ of _TOTAL_ entries",
              paginate: {
                first: '<i class="fas fa-angle-double-left"></i>',
                previous: '<i class="fas fa-angle-left"></i>',
                next: '<i class="fas fa-angle-right"></i>',
                last: '<i class="fas fa-angle-double-right"></i>'
              }
            },
            pageLength: 25,
            responsive: true,
            order: [[1, 'asc']], // Sort by date
            columnDefs: [
              { targets: [4, 5, 6, 7, 8], className: 'text-right' },
              { targets: [0], className: 'text-center' }
            ]
          });
        }
      };
      document.head.appendChild(script);
    };

    loadDataTables();

    return () => {
      // Cleanup
      const existingTable = window.$('#currencyLedgerTable').DataTable();
      if (existingTable) {
        existingTable.destroy();
      }
    };
  }, [ledgerData]);

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const formatExchangeRate = (rate) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    }).format(rate || 0);
  };

  // For running balance calculation in table
  let runningBalance = parseFloat(openingBalance);

  const handlePrint = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    window.open(`/accounts/currency-ledger/print?${params.toString()}`, '_blank');
  };

  const handleExportExcel = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    window.open(`/accounts/currency-ledger/export-excel?${params.toString()}`, '_blank');
  };

  const handleExportPDF = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    window.open(`/accounts/currency-ledger/export-pdf?${params.toString()}`, '_blank');
  };

  const handleChangeFilters = () => {
    router.get('/accounts/currency-ledger/search');
  };

  return (
    <App>
      <div className="reports-container">
        {/* Header */}
        <div className="report-header">
          <div className="report-header-main">
            <div className="report-title-section">
              <h1 className="report-title">
                <Globe className="report-title-icon" />
                Currency Ledger Report
              </h1>
              <div className="report-stats-summary">
                <div className="report-stat-item">
                  <Database size={16} />
                  <span>{account?.account_name || 'All Accounts'}</span>
                </div>
                <div className="report-stat-item">
                  <TrendingUp size={16} />
                  <span>{ledgerData.length} Transactions</span>
                </div>
                <div className="report-stat-item">
                  <DollarSign size={16} />
                  <span>Multi-Currency Report</span>
                </div>
              </div>
            </div>

            <div className="report-header-actions">
              <button
                onClick={handleChangeFilters}
                className="report-btn"
              >
                <Filter size={18} />
                Change Filters
              </button>
              <button
                onClick={handlePrint}
                className="report-btn"
              >
                <Printer size={18} />
                Print
              </button>
              <button
                onClick={handleExportExcel}
                className="report-btn"
              >
                <FileSpreadsheet size={18} />
                Export Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="report-btn"
              >
                <FileTextIcon size={18} />
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Flash Messages */}
        {flash?.success && (
          <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300 animate-slideIn">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{flash.success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Applied Filters */}
        <div className="applied-filters-container">
          <h3 className="applied-filters-title">Applied Filters:</h3>
          <div className="applied-filters-list">
            {filters.account_id && (
              <span className="filter-badge">
                <span className="filter-badge-label">Account:</span>
                <span className="filter-badge-value">{account?.account_name || 'Selected Account'}</span>
              </span>
            )}
            {filters.from_date && (
              <span className="filter-badge">
                <span className="filter-badge-label">From:</span>
                <span className="filter-badge-value">{formatDate(filters.from_date)}</span>
              </span>
            )}
            {filters.to_date && (
              <span className="filter-badge">
                <span className="filter-badge-label">To:</span>
                <span className="filter-badge-value">{formatDate(filters.to_date)}</span>
              </span>
            )}
            {filters.currency_code && (
              <span className="filter-badge">
                <span className="filter-badge-label">Currency:</span>
                <span className="filter-badge-value">{filters.currency_code}</span>
              </span>
            )}
            {filters.voucher_type && (
              <span className="filter-badge">
                <span className="filter-badge-label">Type:</span>
                <span className="filter-badge-value">{filters.voucher_type}</span>
              </span>
            )}
            {filters.status && (
              <span className="filter-badge">
                <span className="filter-badge-label">Status:</span>
                <span className="filter-badge-value">{filters.status}</span>
              </span>
            )}
          </div>
        </div>

        {/* Report Content */}
        <div className="report-content">
          <div className="data-table-container">
            <table id="currencyLedgerTable" className="data-table">
              <thead>
                <tr>
                  <th style={{width: '3%'}}>#</th>
                  <th style={{width: '10%'}}>Date</th>
                  <th style={{width: '12%'}}>Voucher No</th>
                  <th style={{width: '8%'}}>Type</th>
                  <th style={{width: '20%'}}>Description</th>
                  <th style={{width: '10%'}}>Currency</th>
                  <th style={{width: '8%'}}>Rate</th>
                  <th style={{width: '9%'}}>Original Debit</th>
                  <th style={{width: '9%'}}>Original Credit</th>
                  <th style={{width: '9%'}}>Base Debit</th>
                  <th style={{width: '9%'}}>Base Credit</th>
                  <th style={{width: '10%'}}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {/* Opening Balance */}
                {openingBalance !== 0 && (
                  <tr className="opening-balance-row">
                    <td className="text-center">-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>Opening</td>
                    <td>Balance brought forward</td>
                    <td className="text-right">-</td>
                    <td className="text-right">-</td>
                    <td className="text-right">-</td>
                    <td className="text-right">-</td>
                    <td className="text-right">-</td>
                    <td className="text-right">-</td>
                    <td className="text-right font-bold">{formatCurrency(openingBalance)}</td>
                  </tr>
                )}

                {/* Transaction Entries */}
                {ledgerData.map((entry, index) => {
                  const originalDebit = parseFloat(entry.debit_amount) || 0;
                  const originalCredit = parseFloat(entry.credit_amount) || 0;
                  const baseDebit = parseFloat(entry.base_debit_amount) || 0;
                  const baseCredit = parseFloat(entry.base_credit_amount) || 0;
                  const exchangeRate = parseFloat(entry.exchange_rate) || 1;
                  
                  runningBalance = runningBalance + baseDebit - baseCredit;

                  return (
                    <tr key={index}>
                      <td className="text-center">{index + 1}</td>
                      <td>{formatDate(entry.voucher_date)}</td>
                      <td>{entry.voucher_number}</td>
                      <td>{entry.voucher_type || 'JV'}</td>
                      <td>{entry.description || '-'}</td>
                      <td className="text-right">{entry.currency_code || 'USD'}</td>
                      <td className="text-right">{formatExchangeRate(exchangeRate)}</td>
                      <td className="text-right">
                        {originalDebit > 0 ? formatCurrency(originalDebit, entry.currency_code) : '-'}
                      </td>
                      <td className="text-right">
                        {originalCredit > 0 ? formatCurrency(originalCredit, entry.currency_code) : '-'}
                      </td>
                      <td className="text-right">
                        {baseDebit > 0 ? formatCurrency(baseDebit) : '-'}
                      </td>
                      <td className="text-right">
                        {baseCredit > 0 ? formatCurrency(baseCredit) : '-'}
                      </td>
                      <td className="text-right font-bold">{formatCurrency(runningBalance)}</td>
                    </tr>
                  );
                })}

                {/* Summary Row */}
                <tr className="summary-row">
                  <td colSpan="7" className="text-right font-bold">TOTAL:</td>
                  <td className="text-right font-bold">-</td>
                  <td className="text-right font-bold">-</td>
                  <td className="text-right font-bold">{formatCurrency(totalDebit)}</td>
                  <td className="text-right font-bold">{formatCurrency(totalCredit)}</td>
                  <td className="text-right font-bold">-</td>
                </tr>

                {/* Closing Balance */}
                <tr className="closing-balance">
                  <td colSpan="7" className="text-right font-bold">CLOSING BALANCE:</td>
                  <td className="text-right">-</td>
                  <td className="text-right">-</td>
                  <td className="text-right">-</td>
                  <td className="text-right">-</td>
                  <td className="text-right font-bold">{formatCurrency(closingBalance)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </App>
  );
};

export default CurrencyLedgerReport;
