import React, { useState, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
  Download, 
  Printer, 
  RefreshCcw,
  FileText,
  Calendar,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useLayout } from '@/Contexts/LayoutContext';
import App from '../../App.jsx';

export default function BalanceSheetReport() {
  const { 
    company,
    balanceSheetData,
    comparativeData,
    asAtDate,
    comparativeDate,
    currencyCode,
    error
  } = usePage().props;

  const { theme, primaryColor } = useLayout();

  const [selectedDate, setSelectedDate] = useState(asAtDate);
  const [selectedComparativeDate, setSelectedComparativeDate] = useState(comparativeDate || '');
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    setLoading(true);

    const params = new URLSearchParams({
      as_at_date: selectedDate,
      comparative_date: selectedComparativeDate
    });

    router.get(`/accounts/balance-sheet?${params.toString()}`, {}, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setLoading(false)
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  if (error) {
    return (
      <App title="Balance Sheet">
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
      </App>
    );
  }

  return (
    <App title="Balance Sheet">
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
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
            As per International Accounting Standards (IAS 1)
          </p>
        </div>

        {/* Filter Section */}
        <div className={`rounded-lg shadow-md p-6 mb-8 ${
          theme === 'dark'
            ? 'bg-gray-800 text-white'
            : 'bg-white text-gray-900'
        }`}>
          <form onSubmit={handleGenerateReport} className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800'
                    : 'border-gray-300 bg-white text-gray-900 focus:ring-2'
                } ${
                  primaryColor === 'blue' ? 'focus:ring-blue-500' :
                  primaryColor === 'indigo' ? 'focus:ring-indigo-500' :
                  primaryColor === 'purple' ? 'focus:ring-purple-500' :
                  primaryColor === 'green' ? 'focus:ring-green-500' :
                  primaryColor === 'red' ? 'focus:ring-red-500' :
                  primaryColor === 'orange' ? 'focus:ring-orange-500' :
                  primaryColor === 'teal' ? 'focus:ring-teal-500' :
                  'focus:ring-pink-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Comparative Date (Optional)
              </label>
              <input
                type="date"
                value={selectedComparativeDate}
                onChange={(e) => setSelectedComparativeDate(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800'
                    : 'border-gray-300 bg-white text-gray-900 focus:ring-2'
                } ${
                  primaryColor === 'blue' ? 'focus:ring-blue-500' :
                  primaryColor === 'indigo' ? 'focus:ring-indigo-500' :
                  primaryColor === 'purple' ? 'focus:ring-purple-500' :
                  primaryColor === 'green' ? 'focus:ring-green-500' :
                  primaryColor === 'red' ? 'focus:ring-red-500' :
                  primaryColor === 'orange' ? 'focus:ring-orange-500' :
                  primaryColor === 'teal' ? 'focus:ring-teal-500' :
                  'focus:ring-pink-500'
                }`}
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-2 ${
                  primaryColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600' :
                  primaryColor === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600' :
                  primaryColor === 'purple' ? 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600' :
                  primaryColor === 'green' ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600' :
                  primaryColor === 'red' ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600' :
                  primaryColor === 'orange' ? 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600' :
                  primaryColor === 'teal' ? 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600' :
                  'bg-pink-600 hover:bg-pink-700 dark:bg-pink-700 dark:hover:bg-pink-600'
                }`}
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
        </div>

        {/* Balance Sheet Report */}
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
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Balance Sheet as at {new Date(asAtDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Currency: {currencyCode}</p>
            </div>

            {/* Assets Section */}
            <div className="mb-8">
              <div className={`py-2 px-4 font-bold mb-4 rounded ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-100'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                ASSETS
              </div>

              {/* Current Assets */}
              <div className="ml-4 mb-6">
                <div className={`font-semibold py-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                }`}>Current Assets</div>
                <div className="ml-4 space-y-2 mb-3">
                  {balanceSheetData.assets.current.accounts.map((account, idx) => (
                    <div key={idx} className={`flex justify-between ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      <span>{account.name} ({account.code})</span>
                      <span className="font-mono">{formatCurrency(account.balance)}</span>
                    </div>
                  ))}
                </div>
                <div className={`flex justify-between py-2 px-4 rounded font-semibold ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-200'
                    : 'bg-gray-50 text-gray-900'
                }`}>
                  <span>Total Current Assets</span>
                  <span className="font-mono">{formatCurrency(balanceSheetData.assets.current.total)}</span>
                </div>
              </div>

              {/* Non-Current Assets */}
              <div className="ml-4 mb-6">
                <div className={`font-semibold py-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                }`}>Non-Current Assets</div>
                <div className="ml-4 space-y-2 mb-3">
                  {balanceSheetData.assets.non_current.accounts.map((account, idx) => (
                    <div key={idx} className={`flex justify-between ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      <span>{account.name} ({account.code})</span>
                      <span className="font-mono">{formatCurrency(account.balance)}</span>
                    </div>
                  ))}
                </div>
                <div className={`flex justify-between py-2 px-4 rounded font-semibold ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-200'
                    : 'bg-gray-50 text-gray-900'
                }`}>
                  <span>Total Non-Current Assets</span>
                  <span className="font-mono">{formatCurrency(balanceSheetData.assets.non_current.total)}</span>
                </div>
              </div>

              {/* Total Assets */}
              <div className={`flex justify-between py-3 px-4 rounded font-bold text-lg border-2 ${
                primaryColor === 'blue' ? 
                  (theme === 'dark' ? 'bg-blue-900/30 border-blue-700 text-blue-300' : 'bg-blue-100 border-blue-600 text-blue-900') :
                primaryColor === 'indigo' ? 
                  (theme === 'dark' ? 'bg-indigo-900/30 border-indigo-700 text-indigo-300' : 'bg-indigo-100 border-indigo-600 text-indigo-900') :
                primaryColor === 'purple' ? 
                  (theme === 'dark' ? 'bg-purple-900/30 border-purple-700 text-purple-300' : 'bg-purple-100 border-purple-600 text-purple-900') :
                primaryColor === 'green' ? 
                  (theme === 'dark' ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-green-100 border-green-600 text-green-900') :
                primaryColor === 'red' ? 
                  (theme === 'dark' ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-100 border-red-600 text-red-900') :
                primaryColor === 'orange' ? 
                  (theme === 'dark' ? 'bg-orange-900/30 border-orange-700 text-orange-300' : 'bg-orange-100 border-orange-600 text-orange-900') :
                primaryColor === 'teal' ? 
                  (theme === 'dark' ? 'bg-teal-900/30 border-teal-700 text-teal-300' : 'bg-teal-100 border-teal-600 text-teal-900') :
                  (theme === 'dark' ? 'bg-pink-900/30 border-pink-700 text-pink-300' : 'bg-pink-100 border-pink-600 text-pink-900')
              }`}>
                <span>TOTAL ASSETS</span>
                <span className="font-mono">{formatCurrency(balanceSheetData.totalAssets)}</span>
              </div>
            </div>

            {/* Liabilities Section */}
            <div className="mb-8">
              <div className={`py-2 px-4 font-bold mb-4 rounded ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-100'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                LIABILITIES
              </div>

              {/* Current Liabilities */}
              <div className="ml-4 mb-6">
                <div className={`font-semibold py-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                }`}>Current Liabilities</div>
                <div className="ml-4 space-y-2 mb-3">
                  {balanceSheetData.liabilities.current.accounts.map((account, idx) => (
                    <div key={idx} className={`flex justify-between ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      <span>{account.name} ({account.code})</span>
                      <span className="font-mono">{formatCurrency(account.balance)}</span>
                    </div>
                  ))}
                </div>
                <div className={`flex justify-between py-2 px-4 rounded font-semibold ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-200'
                    : 'bg-gray-50 text-gray-900'
                }`}>
                  <span>Total Current Liabilities</span>
                  <span className="font-mono">{formatCurrency(balanceSheetData.liabilities.current.total)}</span>
                </div>
              </div>

              {/* Non-Current Liabilities */}
              <div className="ml-4 mb-6">
                <div className={`font-semibold py-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                }`}>Non-Current Liabilities</div>
                <div className="ml-4 space-y-2 mb-3">
                  {balanceSheetData.liabilities.non_current.accounts.map((account, idx) => (
                    <div key={idx} className={`flex justify-between ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      <span>{account.name} ({account.code})</span>
                      <span className="font-mono">{formatCurrency(account.balance)}</span>
                    </div>
                  ))}
                </div>
                <div className={`flex justify-between py-2 px-4 rounded font-semibold ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-200'
                    : 'bg-gray-50 text-gray-900'
                }`}>
                  <span>Total Non-Current Liabilities</span>
                  <span className="font-mono">{formatCurrency(balanceSheetData.liabilities.non_current.total)}</span>
                </div>
              </div>

              {/* Total Liabilities */}
              <div className={`flex justify-between py-3 px-4 rounded font-bold text-lg border-2 ${
                theme === 'dark'
                  ? 'bg-orange-900/30 border-orange-700 text-orange-300'
                  : 'bg-orange-100 border-orange-600 text-orange-900'
              }`}>
                <span>TOTAL LIABILITIES</span>
                <span className="font-mono">{formatCurrency(balanceSheetData.totalLiabilities)}</span>
              </div>
            </div>

            {/* Equity Section */}
            <div className="mb-8">
              <div className={`py-2 px-4 font-bold mb-4 rounded ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-100'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                EQUITY
              </div>

              {/* Share Capital */}
              <div className="ml-4 mb-6">
                <div className={`font-semibold py-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                }`}>{balanceSheetData.equity.share_capital.label}</div>
                <div className="ml-4 space-y-2 mb-3">
                  {balanceSheetData.equity.share_capital.accounts.map((account, idx) => (
                    <div key={idx} className={`flex justify-between ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      <span>{account.name} ({account.code})</span>
                      <span className="font-mono">{formatCurrency(account.balance)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reserves */}
              <div className="ml-4 mb-6">
                <div className={`font-semibold py-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                }`}>{balanceSheetData.equity.reserves.label}</div>
                <div className="ml-4 space-y-2 mb-3">
                  {balanceSheetData.equity.reserves.accounts.map((account, idx) => (
                    <div key={idx} className={`flex justify-between ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      <span>{account.name} ({account.code})</span>
                      <span className="font-mono">{formatCurrency(account.balance)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retained Earnings */}
              <div className="ml-4 mb-6">
                <div className={`font-semibold py-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                }`}>{balanceSheetData.equity.retained_earnings.label}</div>
                <div className="ml-4 space-y-2 mb-3">
                  {balanceSheetData.equity.retained_earnings.accounts.map((account, idx) => (
                    <div key={idx} className={`flex justify-between ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      <span>{account.name} ({account.code})</span>
                      <span className="font-mono">{formatCurrency(account.balance)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Equity */}
              <div className={`flex justify-between py-3 px-4 rounded font-bold text-lg border-2 ${
                theme === 'dark'
                  ? 'bg-green-900/30 border-green-700 text-green-300'
                  : 'bg-green-100 border-green-600 text-green-900'
              }`}>
                <span>TOTAL EQUITY</span>
                <span className="font-mono">{formatCurrency(balanceSheetData.totalEquity)}</span>
              </div>
            </div>

            {/* Balance Check */}
            <div className={`flex justify-between py-3 px-4 rounded font-bold text-lg border-2 ${
              theme === 'dark'
                ? 'bg-purple-900/30 border-purple-700 text-purple-300'
                : 'bg-purple-100 border-purple-600 text-purple-900'
            }`}>
              <span>TOTAL LIABILITIES AND EQUITY</span>
              <span className="font-mono">{formatCurrency(balanceSheetData.totalLiabilitiesAndEquity)}</span>
            </div>

            {Math.abs(balanceSheetData.balancingCheck) > 0.01 && (
              <div className={`mt-4 p-4 border rounded-lg flex items-center gap-2 ${
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
              <p>This report has been generated from the accounting system.</p>
              <p>Generated on: {new Date().toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </App>
  );
}
