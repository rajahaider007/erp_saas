import React, { useState, useEffect } from 'react';
import { router, usePage, Head } from '@inertiajs/react';
import { 
  Printer, 
  RefreshCcw,
  FileText,
  AlertCircle,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useLayout } from '@/Contexts/LayoutContext';
import App from '../../App.jsx';
import Print from '../../Print.jsx';
import axios from 'axios';
import './print-styles.css';

function PrintReportContent() {
  const { 
    company,
    balanceSheetData,
    asAtDate,
    currencyCode,
    error
  } = usePage().props;

  const [selectedDate, setSelectedDate] = useState(asAtDate);

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#dc2626' }}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  const formatCurrency = (value) => {
    const absValue = Math.abs(value || 0);
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(absValue);
    
    return value < 0 ? `(${formatted})` : formatted;
  };

  const renderPrintHierarchy = (data) => {
    if (!data || !data.children || data.children.length === 0) {
      return null;
    }

    return (
      <div>
        <div style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '2px solid #000', padding: '5px 0', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{data.name}</span>
            <span style={{ fontFamily: "'Courier New', monospace", textAlign: 'right' }}>{formatCurrency(data.total)}</span>
          </div>
        </div>

        {data.children.map((level2, idx2) => (
          <div key={idx2}>
            <div style={{ fontSize: '10pt', fontWeight: '600', padding: '3px 0 3px 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{level2.name}</span>
                <span style={{ fontFamily: "'Courier New', monospace", textAlign: 'right', minWidth: '120px' }}>{formatCurrency(level2.total)}</span>
              </div>
            </div>

            {level2.children && level2.children.map((level3, idx3) => (
              <div key={idx3} style={{ fontSize: '10pt', padding: '2px 0 2px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{level3.name}</span>
                  <span style={{ fontFamily: "'Courier New', monospace", textAlign: 'right', minWidth: '120px' }}>{formatCurrency(level3.balance)}</span>
                </div>
              </div>
            ))}

            <div style={{ fontSize: '10pt', fontWeight: '600', padding: '3px 0 3px 10px', borderTop: '1px solid #000', marginTop: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total {level2.name}</span>
                <span style={{ fontFamily: "'Courier New', monospace", textAlign: 'right', minWidth: '120px' }}>{formatCurrency(level2.total)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          .print-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #000;
          }
          .print-company-name {
            font-size: 20pt;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .print-report-title {
            font-size: 12pt;
            margin-bottom: 3px;
          }
          .print-report-info {
            font-size: 10pt;
          }
          .print-content-grid {
            display: table;
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          .print-column-wrapper {
            display: table-row;
          }
          .print-column {
            display: table-cell;
            width: 49%;
            vertical-align: top;
            padding: 15px;
            border: 2px solid #000;
          }
          .print-column:first-child {
            border-right: 1px solid #000;
          }
          .print-column-title {
            font-size: 13pt;
            font-weight: bold;
            text-align: center;
            padding-bottom: 8px;
            margin-bottom: 15px;
            border-bottom: 2px solid #000;
            text-transform: uppercase;
          }
          .print-section {
            margin-bottom: 15px;
          }
          .print-grand-total {
            font-size: 11pt;
            font-weight: bold;
            padding: 8px;
            margin-top: 15px;
            border: 2px solid #000;
            background: #f0f0f0;
          }
          .print-footer {
            text-align: center;
            font-size: 9pt;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #000;
          }
          .print-footer p {
            margin: 3px 0;
          }
        `}
      </style>

      <div className="print-header">
        <div className="print-company-name">{company?.company_name}</div>
        <div className="print-report-title">Balance Sheet as at {new Date(asAtDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div className="print-report-info">Currency: {currencyCode}</div>
      </div>

      {balanceSheetData && (
        <>
          <div className="print-content-grid">
            <div className="print-column-wrapper">
              {/* LEFT: Capital & Liabilities */}
              <div className="print-column">
                <div className="print-column-title">Capital & Liabilities</div>
                
                {/* Equity */}
                {balanceSheetData.equity && balanceSheetData.equity.children && balanceSheetData.equity.children.length > 0 && (
                  <div className="print-section">
                    {renderPrintHierarchy(balanceSheetData.equity)}
                  </div>
                )}
                
                {/* Liabilities */}
                {balanceSheetData.liabilities && balanceSheetData.liabilities.children && balanceSheetData.liabilities.children.length > 0 && (
                  <div className="print-section">
                    {renderPrintHierarchy(balanceSheetData.liabilities)}
                  </div>
                )}
                
                <div className="print-grand-total">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>TOTAL CAPITAL & LIABILITIES</span>
                    <span style={{ fontFamily: "'Courier New', monospace" }}>{formatCurrency(balanceSheetData.totalLiabilitiesAndEquity)}</span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Assets */}
              <div className="print-column">
                <div className="print-column-title">Property & Assets</div>
                
                {balanceSheetData.assets && balanceSheetData.assets.children && balanceSheetData.assets.children.length > 0 && (
                  <div className="print-section">
                    {renderPrintHierarchy(balanceSheetData.assets)}
                  </div>
                )}
                
                <div className="print-grand-total">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>TOTAL PROPERTY & ASSETS</span>
                    <span style={{ fontFamily: "'Courier New', monospace" }}>{formatCurrency(balanceSheetData.totalAssets)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="print-footer">
            <p>This report has been prepared in accordance with International Accounting Standards (IAS 1).</p>
            <p>Generated on: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </>
      )}
    </>
  );
}

function ReportContent() {
  const { 
    company,
    balanceSheetData,
    asAtDate,
    currencyCode,
    error
  } = usePage().props;
  const { theme, primaryColor } = useLayout();

  const [selectedDate, setSelectedDate] = useState(asAtDate);
  const [loading, setLoading] = useState(false);
  const [drillDownData, setDrillDownData] = useState(null);
  const [drillDownLoading, setDrillDownLoading] = useState(false);
  const [selectedLevel3, setSelectedLevel3] = useState(null);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    setLoading(true);

    const params = new URLSearchParams({
      as_at_date: selectedDate,
    });

    router.get(`/accounts/balance-sheet?${params.toString()}`, {}, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setLoading(false)
    });
  };

  const handlePrint = () => {
    const params = new URLSearchParams({
      as_at_date: selectedDate,
      print_view: '1'
    });
    window.open(`/accounts/balance-sheet?${params.toString()}`, '_blank', 'width=1200,height=800');
  };

  const handleLevel3Click = async (level3Account) => {
    if (selectedLevel3 && selectedLevel3.id === level3Account.id) {
      // Close if already open
      setSelectedLevel3(null);
      setDrillDownData(null);
      return;
    }

    setSelectedLevel3(level3Account);
    setDrillDownLoading(true);
    setDrillDownData(null);

    try {
      const response = await axios.get('/accounts/balance-sheet/level4-details', {
        params: {
          level3_account_id: level3Account.id,
          as_at_date: selectedDate
        }
      });
      setDrillDownData(response.data.accounts);
    } catch (err) {
      console.error('Error fetching Level 4 details:', err);
      alert('Failed to load account details');
    } finally {
      setDrillDownLoading(false);
    }
  };

  const formatCurrency = (value) => {
    const absValue = Math.abs(value || 0);
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(absValue);
    
    // Show negative values in parentheses (accounting standard)
    return value < 0 ? `(${formatted})` : formatted;
  };

  const getIndentClass = (level) => {
    switch(level) {
      case 1: return 'pl-0 font-bold text-lg';
      case 2: return 'pl-4 font-semibold text-base';
      case 3: return 'pl-8 text-sm';
      default: return 'pl-12 text-xs';
    }
  };

  const getColorForLevel = (level) => {
    switch(level) {
      case 1: return theme === 'dark' ? 'text-red-400' : 'text-red-600'; // RED
      case 2: return theme === 'dark' ? 'text-green-400' : 'text-green-600'; // GREEN
      case 3: return theme === 'dark' ? 'text-gray-200' : 'text-gray-900'; // BLACK
      default: return theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
    }
  };

  const renderAccountHierarchy = (data, showTotal = true) => {
    if (!data || !data.children || data.children.length === 0) {
      return null;
    }

    return (
      <div className="space-y-1">
        {/* Level 1 Heading */}
        <div className={`${getIndentClass(1)} ${getColorForLevel(1)} py-2 border-b-2 ${
          theme === 'dark' ? 'border-red-700' : 'border-red-500'
        }`}>
          <div className="flex justify-between items-center">
            <span className="uppercase">{data.name}</span>
            {showTotal && <span className="font-mono">{formatCurrency(data.total)}</span>}
          </div>
        </div>

        {/* Level 2 and Level 3 Accounts */}
        {data.children.map((level2, idx2) => (
          <div key={idx2}>
            {/* Level 2 */}
            <div className={`${getIndentClass(2)} ${getColorForLevel(2)} py-1.5`}>
              <div className="flex justify-between items-center">
                <span>{level2.name}</span>
                {showTotal && <span className="font-mono">{formatCurrency(level2.total)}</span>}
              </div>
            </div>

            {/* Level 3 Accounts */}
            {level2.children && level2.children.map((level3, idx3) => (
              <div key={idx3}>
                <div 
                  className={`${getIndentClass(3)} ${getColorForLevel(3)} py-1 cursor-pointer hover:bg-opacity-10 ${
                    theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                  } flex justify-between items-center group`}
                  onClick={() => handleLevel3Click(level3)}
                >
                  <span className="flex items-center gap-2">
                    {level3.has_children && (
                      selectedLevel3 && selectedLevel3.id === level3.id 
                        ? <ChevronDown className="w-4 h-4" />
                        : <ChevronRight className="w-4 h-4" />
                    )}
                    <span className={level3.has_children ? 'underline decoration-dotted' : ''}>
                      {level3.name}
                    </span>
                  </span>
                  <span className="font-mono">{formatCurrency(level3.balance)}</span>
                </div>
                
                {/* Level 4 Drill-down */}
                {selectedLevel3 && selectedLevel3.id === level3.id && drillDownData && (
                  <div className={`${getIndentClass(4)} mt-2 mb-3 p-3 rounded border ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-600' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="text-xs font-semibold mb-2 text-blue-600 dark:text-blue-400">
                      Level 4 Transactional Accounts:
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className={`border-b ${
                          theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                        }`}>
                          <th className="text-left py-1 px-2">Account Code</th>
                          <th className="text-left py-1 px-2">Account Name</th>
                          <th className="text-right py-1 px-2">Debit</th>
                          <th className="text-right py-1 px-2">Credit</th>
                          <th className="text-right py-1 px-2">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {drillDownData.map((acc, idx) => (
                          <tr key={idx} className={`border-b last:border-b-0 ${
                            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                          }`}>
                            <td className="py-1 px-2 font-mono">{acc.code}</td>
                            <td className="py-1 px-2">{acc.name}</td>
                            <td className="py-1 px-2 text-right font-mono">{formatCurrency(acc.debit)}</td>
                            <td className="py-1 px-2 text-right font-mono">{formatCurrency(acc.credit)}</td>
                            <td className="py-1 px-2 text-right font-mono font-semibold">{formatCurrency(acc.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}

            {/* Level 2 Total */}
            {showTotal && (
              <div className={`${getIndentClass(2)} ${getColorForLevel(2)} py-1 border-t ${
                theme === 'dark' ? 'border-green-700' : 'border-green-500'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total {level2.name}</span>
                  <span className="font-mono font-semibold">{formatCurrency(level2.total)}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Level 1 Total */}
        {showTotal && (
          <div className={`${getIndentClass(1)} ${getColorForLevel(1)} py-2 border-t-2 mt-2 ${
            theme === 'dark' ? 'border-red-700' : 'border-red-500'
          }`}>
            <div className="flex justify-between items-center">
              <span className="font-bold uppercase">Total {data.name}</span>
              <span className="font-mono font-bold">{formatCurrency(data.total)}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render function for print view
  const renderPrintHierarchy = (data) => {
    if (!data || !data.children || data.children.length === 0) {
      return null;
    }

    return (
      <div>
        {/* Level 1 Heading */}
        <div className="level-1">
          <div className="account-row">
            <span className="uppercase">{data.name}</span>
            <span className="amount">{formatCurrency(data.total)}</span>
          </div>
        </div>

        {/* Level 2 and Level 3 Accounts */}
        {data.children.map((level2, idx2) => (
          <div key={idx2}>
            {/* Level 2 */}
            <div className="level-2">
              <div className="account-row">
                <span>{level2.name}</span>
                <span className="amount">{formatCurrency(level2.total)}</span>
              </div>
            </div>

            {/* Level 3 Accounts */}
            {level2.children && level2.children.map((level3, idx3) => (
              <div key={idx3} className="level-3">
                <div className="account-row">
                  <span>{level3.name}</span>
                  <span className="amount">{formatCurrency(level3.balance)}</span>
                </div>
              </div>
            ))}

            {/* Level 2 Total */}
            <div className="level-2-total">
              <div className="account-row">
                <span>Total {level2.name}</span>
                <span className="amount">{formatCurrency(level2.total)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className={`p-4 border rounded-lg flex items-center gap-2 ${
          theme === 'dark'
            ? 'bg-red-900/20 border-red-700 text-red-300'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      </div>
    );
  }

  // This section is for print view rendering (never reaches here in practice)
  if (false) {
    return null;
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 flex items-center gap-2 ${
          theme === 'dark' 
            ? 'text-gray-100' 
            : 'text-gray-900'
        }`}>
          <FileText className={`w-8 h-8 ${
            primaryColor === 'blue' ? 'text-blue-600 dark:text-blue-400' :
            primaryColor === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' :
            primaryColor === 'purple' ? 'text-purple-600 dark:text-purple-400' :
            primaryColor === 'green' ? 'text-green-600 dark:text-green-400' :
            primaryColor === 'red' ? 'text-red-600 dark:text-red-400' :
            primaryColor === 'orange' ? 'text-orange-600 dark:text-orange-400' :
            primaryColor === 'teal' ? 'text-teal-600 dark:text-teal-400' :
            'text-pink-600 dark:text-pink-400'
          }`} />
          Balance Sheet (Statement of Financial Position)
        </h1>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          International Accounting Standards - IAS 1 Format
        </p>
      </div>

      {/* Filter Section */}
      <div className={`rounded-lg shadow-md p-6 mb-8 no-print ${
        theme === 'dark'
          ? 'bg-gray-800 text-white'
          : 'bg-white text-gray-900'
      }`}>
        <form onSubmit={handleGenerateReport} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              As At Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              }`}
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-500 hover:bg-blue-600'
              } disabled:opacity-50`}
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Generate
            </button>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </form>

        {/* Legend */}
        <div className={`mt-4 pt-4 border-t ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Level 1 (Main Categories)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Level 2 (Sub-categories)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-700 dark:bg-gray-300 rounded"></div>
              <span>Level 3 (Accounts - Click to see details)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Sheet Report - Horizontal Layout */}
      {balanceSheetData && (
        <div className={`rounded-lg shadow-md p-8 print:shadow-none ${
          theme === 'dark'
            ? 'bg-gray-800 text-white'
            : 'bg-white text-gray-900'
        }`}>
          {/* Report Header */}
          <div className={`text-center border-b-2 pb-6 mb-8 ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-900'
          }`}>
            <h2 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>{company?.company_name}</h2>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{company?.legal_name}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Balance Sheet as at {new Date(asAtDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Currency: {currencyCode}</p>
          </div>

          {/* Horizontal Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT SIDE: LIABILITIES */}
            <div className={`border-r-2 pr-8 ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
            }`}>
              <h3 className={`text-xl font-bold mb-6 pb-2 border-b-2 text-center ${
                theme === 'dark' ? 'border-orange-700 text-orange-400' : 'border-orange-500 text-orange-700'
              }`}>
                LIABILITIES
              </h3>

              {/* Equity */}
              {balanceSheetData.equity && (
                <div className="mb-8">
                  {renderAccountHierarchy(balanceSheetData.equity)}
                </div>
              )}

              {/* Liabilities */}
              {balanceSheetData.liabilities && (
                <div className="mb-8">
                  {renderAccountHierarchy(balanceSheetData.liabilities)}
                </div>
              )}

              {/* Total Liabilities & Equity */}
              <div className={`py-4 px-4 rounded font-bold text-lg border-2 mt-8 ${
                theme === 'dark'
                  ? 'bg-orange-900/30 border-orange-700 text-orange-300'
                  : 'bg-orange-100 border-orange-600 text-orange-900'
              }`}>
                <div className="flex justify-between items-center">
                  <span>TOTAL LIABILITIES</span>
                  <span className="font-mono">{formatCurrency(balanceSheetData.totalLiabilitiesAndEquity)}</span>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: ASSETS */}
            <div className="pl-8">
              <h3 className={`text-xl font-bold mb-6 pb-2 border-b-2 text-center ${
                theme === 'dark' ? 'border-blue-700 text-blue-400' : 'border-blue-500 text-blue-700'
              }`}>
                ASSETS
              </h3>

              {/* Assets */}
              {balanceSheetData.assets && (
                <div className="mb-8">
                  {renderAccountHierarchy(balanceSheetData.assets)}
                </div>
              )}

              {/* Total Assets */}
              <div className={`py-4 px-4 rounded font-bold text-lg border-2 mt-8 ${
                theme === 'dark'
                  ? 'bg-blue-900/30 border-blue-700 text-blue-300'
                  : 'bg-blue-100 border-blue-600 text-blue-900'
              }`}>
                <div className="flex justify-between items-center">
                  <span>TOTAL ASSETS</span>
                  <span className="font-mono">{formatCurrency(balanceSheetData.totalAssets)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Check Warning */}
          {Math.abs(balanceSheetData.balancingCheck) > 0.01 && (
            <div className={`mt-8 p-4 border rounded-lg flex items-center gap-2 ${
              theme === 'dark'
                ? 'bg-red-900/20 border-red-700 text-red-300'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <AlertCircle className="w-5 h-5" />
              Balance sheet does not balance. Difference: {formatCurrency(balanceSheetData.balancingCheck)}
            </div>
          )}

          {/* Report Footer */}
          <div className={`mt-12 text-center text-sm border-t pt-6 ${
            theme === 'dark'
              ? 'border-gray-700 text-gray-500'
              : 'border-gray-900 text-gray-500'
          }`}>
            <p>This report has been prepared in accordance with International Accounting Standards (IAS 1).</p>
            <p>Generated on: {new Date().toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BalanceSheetReport() {
  const isPrintView = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('print_view') === '1';

  if (isPrintView) {
    // Use Print wrapper for print view (no system UI, no layout context needed)
    return (
      <Print title="Balance Sheet">
        <PrintReportContent />
      </Print>
    );
  }

  return (
    <App title="Balance Sheet">
      <ReportContent />
    </App>
  );
}
