import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCcw,
  Database,
  Calendar,
  FileText,
  Printer,
  ChevronDown,
  Globe,
  DollarSign
} from 'lucide-react';
import App from '../../App.jsx';

const CurrencyLedgerReport = () => {
  const { groupedData = {}, accounts = [], accountTotals = {}, account, company, filters, flash, totalDebit, totalCredit } = usePage().props;
  
  const [loading, setLoading] = useState(false);

  // Initialize DataTables for each account group
  useEffect(() => {
    const loadDataTable = () => {
      // Check if DataTable is already loaded
      if (window.$ && window.$.fn.DataTable) {
        initializeDataTables();
        return;
      }

      // Load DataTable CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://cdn.datatables.net/1.13.7/css/jquery.dataTables.min.css';
      document.head.appendChild(cssLink);

      // Load jQuery
      const jqueryScript = document.createElement('script');
      jqueryScript.src = 'https://code.jquery.com/jquery-3.7.0.min.js';
      jqueryScript.onload = () => {
        // Load DataTable JS
        const dataTableScript = document.createElement('script');
        dataTableScript.src = 'https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js';
        dataTableScript.onload = initializeDataTables;
        document.head.appendChild(dataTableScript);
      };
      document.head.appendChild(jqueryScript);
    };

    const initializeDataTables = () => {
      if (window.$ && window.$.fn.DataTable) {
        // Initialize DataTable for each account
        accounts.forEach((accountData) => {
          const tableId = `currency-data-table-${accountData.id}`;
          const tableElement = document.querySelector(`#${tableId}`);
          
          if (tableElement && !window.$(`#${tableId}`).hasClass('dataTable')) {
            window.$(`#${tableId}`).DataTable({
              responsive: true,
              pageLength: 10,
              lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
              order: [[0, 'asc']], // Sort by date ascending
              columnDefs: [
                { targets: [0], type: 'date' },
                { targets: [5, 6, 7, 8, 9], type: 'num' },
                { 
                  targets: [5, 6, 7, 8, 9], 
                  className: 'text-right',
                  render: function(data, type, row) {
                    if (type === 'display' && data && data !== '-') {
                      return new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }).format(parseFloat(data));
                    }
                    return data;
                  }
                }
              ],
              language: {
                search: '<i class="fas fa-search"></i> Search:',
                lengthMenu: '<i class="fas fa-list-ol"></i> Show _MENU_ entries',
                info: '<i class="fas fa-info-circle"></i> Showing _START_ to _END_ of _TOTAL_ entries',
                infoEmpty: '<i class="fas fa-exclamation-circle"></i> No entries available',
                infoFiltered: '<i class="fas fa-filter"></i> (filtered from _MAX_ total entries)',
                paginate: {
                  first: '<i class="fas fa-angle-double-left"></i>',
                  last: '<i class="fas fa-angle-double-right"></i>', 
                  next: '<i class="fas fa-angle-right"></i>',
                  previous: '<i class="fas fa-angle-left"></i>'
                },
                emptyTable: '<i class="fas fa-database"></i> No transaction data available',
                zeroRecords: '<i class="fas fa-search"></i> No matching records found',
                processing: '<i class="fas fa-spinner fa-spin"></i> Processing...',
                loadingRecords: '<i class="fas fa-spinner fa-spin"></i> Loading...'
              },
              dom: '<"top"lf>rt<"bottom"ip><"clear">',
              initComplete: function() {
                // Add custom styling after initialization
                this.api().columns().every(function() {
                  var column = this;
                  var header = column.header();
                  
                  // Add custom classes to headers
                  window.$(header).addClass('text-center font-semibold');
                  
                  // Style the search input
                  var searchInput = window.$('.dataTables_filter input');
                  searchInput.addClass('form-control bg-slate-700 text-white border-slate-600 placeholder-gray-400');
                  
                  // Style the length select
                  var lengthSelect = window.$('.dataTables_length select');
                  lengthSelect.addClass('form-select bg-slate-700 text-white border-slate-600');
                  
                  // Style pagination buttons
                  window.$('.paginate_button').addClass('btn btn-sm btn-outline-secondary mx-1');
                  window.$('.paginate_button.current').addClass('btn-primary');
                });
                
                // Style info text
                window.$('.dataTables_info').addClass('text-gray-300 text-sm');
              }
            });
          }
        });
      }
    };

    loadDataTable();

    // Cleanup function
    return () => {
      if (window.$) {
        accounts.forEach((accountData) => {
          const tableId = `currency-data-table-${accountData.id}`;
          if (window.$(`#${tableId}`).hasClass('dataTable')) {
            window.$(`#${tableId}`).DataTable().destroy();
          }
        });
      }
    };
  }, [accounts]);

  const handleBackToFilters = () => {
    // Preserve all current filters in the URL
    const currentParams = new URLSearchParams(window.location.search);
    const searchParams = new URLSearchParams();
    
    // Copy all relevant filter parameters
    const filterKeys = [
      'account_id', 'from_date', 'to_date', 'search', 'currency_code', 
      'voucher_type', 'status', 'min_amount', 'max_amount'
    ];
    
    filterKeys.forEach(key => {
      if (currentParams.has(key)) {
        searchParams.set(key, currentParams.get(key));
      }
    });
    
    const queryString = searchParams.toString();
    const url = queryString ? `/accounts/currency-ledger/search?${queryString}` : '/accounts/currency-ledger/search';
    router.get(url);
  };

  const handlePrint = () => {
    const params = new URLSearchParams(window.location.search);
    window.open(`/accounts/currency-ledger/print?${params.toString()}`, '_blank');
  };

  const handleExportPDF = () => {
    const params = new URLSearchParams(window.location.search);
    window.open(`/accounts/currency-ledger/export-pdf?${params.toString()}`, '_blank');
  };

  const handleExportExcel = () => {
    const params = new URLSearchParams(window.location.search);
    window.open(`/accounts/currency-ledger/export-excel?${params.toString()}`, '_blank');
  };

  const handleExportAllDataTables = () => {
    // Export all DataTables data to CSV
    if (window.$ && window.$.fn.DataTable) {
      let allData = [];
      
      accounts.forEach((accountData) => {
        const tableId = `currency-data-table-${accountData.id}`;
        const table = window.$(`#${tableId}`).DataTable();
        
        if (table) {
          // Get all data from the table
          const tableData = table.data().toArray();
          
          // Add account header
          allData.push([`Account: ${accountData.account_code} - ${accountData.account_name}`]);
          allData.push(['Date', 'Voucher No', 'Type', 'Currency', 'Rate', 'Debit', 'Credit', 'Base Debit', 'Base Credit', 'Balance']);
          
          // Add table data
          tableData.forEach(row => {
            allData.push(row);
          });
          
          // Add totals
          const totals = accountTotals[accountData.id] || {};
          allData.push(['', '', '', '', '', '', '', 'Account Total', totals.total_debit || 0, totals.total_credit || 0, '']);
          allData.push(['', '', '', '', '', '', '', 'Closing Balance', '', '', totals.closing_balance || 0]);
          allData.push([]); // Empty row for spacing
        }
      });
      
      // Convert to CSV and download
      const csvContent = allData.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Currency_Ledger_All_Accounts_${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
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

  // Running balance is now calculated per account in the grouped display

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
                  <FileText size={16} />
                  <span>{accounts?.length || 0} Accounts</span>
                </div>
                <div className="report-stat-item">
                  <Database size={16} />
                  <span>{Object.values(groupedData).flat().length || 0} Transactions</span>
                </div>
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
                  <button className="text-white hover:bg-slate-600" onClick={handleExportAllDataTables}>
                    <Database size={16} />
                    Export All Tables (CSV)
                  </button>
                  <button className="text-white hover:bg-slate-600" onClick={handleExportExcel}>
                    <FileText size={16} />
                    Export as Excel
                  </button>
                  <button className="text-white hover:bg-slate-600" onClick={handleExportPDF}>
                    <FileText size={16} />
                    Export as PDF
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
              {account && (
                <div className="filter-badge">
                  <span className="filter-badge-label">Account:</span>
                  <span className="filter-badge-value">{account.account_code} - {account.account_name}</span>
                </div>
              )}
              {!account && (
                <div className="filter-badge">
                  <span className="filter-badge-label">Scope:</span>
                  <span className="filter-badge-value">All Accounts</span>
                </div>
              )}
              {filters?.from_date && (
                <div className="filter-badge">
                  <span className="filter-badge-label">From:</span>
                  <span className="filter-badge-value">{filters.from_date}</span>
                </div>
              )}
              {filters?.to_date && (
                <div className="filter-badge">
                  <span className="filter-badge-label">To:</span>
                  <span className="filter-badge-value">{filters.to_date}</span>
                </div>
              )}
              {filters?.currency_code && (
                <div className="filter-badge">
                  <span className="filter-badge-label">Currency:</span>
                  <span className="filter-badge-value">{filters.currency_code}</span>
                </div>
              )}
              {filters?.voucher_type && (
                <div className="filter-badge">
                  <span className="filter-badge-label">Type:</span>
                  <span className="filter-badge-value">{filters.voucher_type}</span>
                </div>
              )}
              {filters?.status && (
                <div className="filter-badge">
                  <span className="filter-badge-label">Status:</span>
                  <span className="filter-badge-value">{filters.status}</span>
                </div>
              )}
              {filters?.min_amount && (
                <div className="filter-badge">
                  <span className="filter-badge-label">Min Amount:</span>
                  <span className="filter-badge-value">{filters.min_amount}</span>
                </div>
              )}
              {filters?.max_amount && (
                <div className="filter-badge">
                  <span className="filter-badge-label">Max Amount:</span>
                  <span className="filter-badge-value">{filters.max_amount}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="report-content">
          <div className="data-table-container">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading currency ledger...</p>
              </div>
            ) : accounts?.length === 0 ? (
              <div className="empty-state">
                <Database className="empty-icon" />
                <h3>No transactions found</h3>
                <p>Try adjusting your filters or date range</p>
              </div>
            ) : (
              <div className="space-y-8">
                {accounts.map((accountData) => {
                  const accountTransactions = groupedData[accountData.id] || [];
                  const totals = accountTotals[accountData.id] || {};
                  let runningBalance = parseFloat(totals.opening_balance || 0);

                  return (
                    <div key={accountData.id} className="account-section">
                      {/* Account Header */}
                      <div className="account-header bg-blue-900 text-white p-4 rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold">
                              {accountData.account_code} - {accountData.account_name}
                            </h3>
                            <p className="text-sm opacity-80">{accountData.account_type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">Opening Balance:</p>
                            <p className="text-lg font-bold">{formatCurrency(totals.opening_balance || 0)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Account DataTable */}
                      <div className="table-wrapper">
                        <table id={`currency-data-table-${accountData.id}`} className="data-table bg-slate-800 text-white">
                          <thead>
                            <tr>
                              <th style={{width: '10%'}}>Date</th>
                              <th style={{width: '12%'}}>Voucher No</th>
                              <th style={{width: '8%'}}>Type</th>
                              <th style={{width: '8%'}}>Currency</th>
                              <th style={{width: '8%'}}>Rate</th>
                              <th style={{width: '10%'}} className="text-right">Debit</th>
                              <th style={{width: '10%'}} className="text-right">Credit</th>
                              <th style={{width: '10%'}} className="text-right">Base Debit</th>
                              <th style={{width: '10%'}} className="text-right">Base Credit</th>
                              <th style={{width: '14%'}} className="text-right">Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Opening Balance Row */}
                            {totals.opening_balance !== 0 && (
                              <tr className="opening-balance-row bg-slate-700 text-white font-bold">
                                <td>Opening</td>
                                <td>-</td>
                                <td>Balance</td>
                                <td>-</td>
                                <td>-</td>
                                <td className="text-right">-</td>
                                <td className="text-right">-</td>
                                <td className="text-right">-</td>
                                <td className="text-right">-</td>
                                <td className="text-right">
                                  {formatCurrency(totals.opening_balance || 0)}
                                </td>
                              </tr>
                            )}

                            {/* Transaction Entries */}
                            {accountTransactions.map((entry, index) => {
                              const baseDebit = parseFloat(entry.base_debit_amount) || 0;
                              const baseCredit = parseFloat(entry.base_credit_amount) || 0;
                              const debit = parseFloat(entry.debit_amount) || 0;
                              const credit = parseFloat(entry.credit_amount) || 0;
                              runningBalance = runningBalance + baseDebit - baseCredit;

                              return (
                                <tr key={`${accountData.id}-${index}`} className="hover:bg-slate-700 text-white">
                                  <td>{formatDate(entry.voucher_date)}</td>
                                  <td>{entry.voucher_number}</td>
                                  <td>{entry.voucher_type || 'JV'}</td>
                                  <td>{entry.currency_code || '-'}</td>
                                  <td className="text-right">{entry.exchange_rate || '-'}</td>
                                  <td className="text-right">
                                    {debit > 0 ? formatCurrency(debit) : '-'}
                                  </td>
                                  <td className="text-right">
                                    {credit > 0 ? formatCurrency(credit) : '-'}
                                  </td>
                                  <td className="text-right">
                                    {baseDebit > 0 ? formatCurrency(baseDebit) : '-'}
                                  </td>
                                  <td className="text-right">
                                    {baseCredit > 0 ? formatCurrency(baseCredit) : '-'}
                                  </td>
                                  <td className="text-right font-bold">
                                    {formatCurrency(runningBalance)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            {/* Account Totals */}
                            <tr className="total-row bg-slate-700 text-white font-bold">
                              <td colSpan="5">Account Total:</td>
                              <td className="text-right">-</td>
                              <td className="text-right">-</td>
                              <td className="text-right">{formatCurrency(totals.total_debit || 0)}</td>
                              <td className="text-right">{formatCurrency(totals.total_credit || 0)}</td>
                              <td className="text-right">-</td>
                            </tr>

                            {/* Account Closing Balance */}
                            <tr className="closing-balance-row bg-slate-600 text-white font-bold">
                              <td colSpan="5">Closing Balance:</td>
                              <td className="text-right">-</td>
                              <td className="text-right">-</td>
                              <td className="text-right">-</td>
                              <td className="text-right">-</td>
                              <td className="text-right">{formatCurrency(totals.closing_balance || 0)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  );
                })}

                {/* Grand Totals Summary */}
                {accounts.length > 1 && (
                  <div className="grand-totals bg-green-900 text-white p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Grand Totals - All Accounts</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm opacity-80">Total Debit</p>
                        <p className="text-2xl font-bold">{formatCurrency(totalDebit)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm opacity-80">Total Credit</p>
                        <p className="text-2xl font-bold">{formatCurrency(totalCredit)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm opacity-80">Net Balance</p>
                        <p className="text-2xl font-bold">{formatCurrency(totalDebit - totalCredit)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
    </App>
  );
};

export default CurrencyLedgerReport;
