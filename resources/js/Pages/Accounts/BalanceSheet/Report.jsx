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
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        </div>
      </App>
    );
  }

  return (
    <App title="Balance Sheet">
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            Balance Sheet (Statement of Financial Position)
          </h1>
          <p className="text-gray-600">
            As per International Accounting Standards (IAS 1)
          </p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleGenerateReport} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                As At Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comparative Date (Optional)
              </label>
              <input
                type="date"
                value={selectedComparativeDate}
                onChange={(e) => setSelectedComparativeDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Generate
              </button>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </form>
        </div>

        {/* Balance Sheet Report */}
        {balanceSheetData && (
          <div className="bg-white rounded-lg shadow-md p-8 print:shadow-none">
            {/* Report Header */}
            <div className="text-center border-b-2 border-gray-900 pb-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{company?.company_name}</h2>
              <p className="text-gray-600">{company?.legal_name}</p>
              <p className="text-sm text-gray-500">Balance Sheet as at {new Date(asAtDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="text-sm text-gray-500">Currency: {currencyCode}</p>
            </div>

            {/* Assets Section */}
            <div className="mb-8">
              <div className="bg-gray-100 py-2 px-4 font-bold text-gray-900 mb-4 rounded">
                ASSETS
              </div>

              {/* Current Assets */}
              <div className="ml-4 mb-6">
                <div className="font-semibold text-gray-800 py-2">Current Assets</div>
                <div className="ml-4 space-y-2 mb-3">
                  {balanceSheetData.assets.current.accounts.map((account, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700">
                      <span>{account.name} ({account.code})</span>
                      <span className="font-mono">{formatCurrency(account.balance)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between py-2 px-4 bg-gray-50 rounded font-semibold">
                  <span>Total Current Assets</span>
                  <span className="font-mono">{formatCurrency(balanceSheetData.assets.current.total)}</span>
                </div>
              </div>

              {/* Non-Current Assets */}
              <div className="ml-4 mb-6">
                <div className="font-semibold text-gray-800 py-2">Non-Current Assets</div>
                <div className="ml-4 space-y-2 mb-3">
                  {balanceSheetData.assets.non_current.accounts.map((account, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700">
                      <span>{account.name} ({account.code})</span>
                      <span className="font-mono">{formatCurrency(account.balance)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between py-2 px-4 bg-gray-50 rounded font-semibold">
                  <span>Total Non-Current Assets</span>
                  <span className="font-mono">{formatCurrency(balanceSheetData.assets.non_current.total)}</span>
                </div>
              </div>

              {/* Total Assets */}
              <div className="flex justify-between py-3 px-4 bg-blue-100 rounded font-bold text-lg border-2 border-blue-600">
                <span>TOTAL ASSETS</span>
                <span className="font-mono">{formatCurrency(balanceSheetData.totalAssets)}</span>
              </div>
            </div>

            {/* Liabilities Section */}
            <div className="mb-8">
              <div className="bg-gray-100 py-2 px-4 font-bold text-gray-900 mb-4 rounded">
                LIABILITIES
              </div>

              {/* Current Liabilities */}
              <div className="ml-4 mb-6">
                <div className="font-semibold text-gray-800 py-2">Current Liabilities</div>
                <div className="ml-4 space-y-2 mb-3">
                  {balanceSheetData.liabilities.current.accounts.map((account, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700">
                      <span>{account.name} ({account.code})</span>
                      <span className="font-mono">{formatCurrency(account.balance)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between py-2 px-4 bg-gray-50 rounded font-semibold">
                  <span>Total Current Liabilities</span>
                  <span className="font-mono">{formatCurrency(balanceSheetData.liabilities.current.total)}</span>
                </div>
              </div>

              {/* Non-Current Liabilities */}
              <div className="ml-4 mb-6">
                <div className="font-semibold text-gray-800 py-2">Non-Current Liabilities</div>
                <div className="ml-4 space-y-2 mb-3">
                  {balanceSheetData.liabilities.non_current.accounts.map((account, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700">
                      <span>{account.name} ({account.code})</span>
                      <span className="font-mono">{formatCurrency(account.balance)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between py-2 px-4 bg-gray-50 rounded font-semibold">
                  <span>Total Non-Current Liabilities</span>
                  <span className="font-mono">{formatCurrency(balanceSheetData.liabilities.non_current.total)}</span>
                </div>
              </div>

              {/* Total Liabilities */}
              <div className="flex justify-between py-3 px-4 bg-orange-100 rounded font-bold text-lg border-2 border-orange-600">
                <span>TOTAL LIABILITIES</span>
                <span className="font-mono">{formatCurrency(balanceSheetData.totalLiabilities)}</span>
              </div>
            </div>

            {/* Equity Section */}
            <div className="mb-8">
              <div className="bg-gray-100 py-2 px-4 font-bold text-gray-900 mb-4 rounded">
                EQUITY
              </div>

              {/* Share Capital */}
              <div className="ml-4 mb-6">
                <div className="font-semibold text-gray-800 py-2">{balanceSheetData.equity.share_capital.label}</div>
                <div className="ml-4 space-y-2 mb-3">
                  {balanceSheetData.equity.share_capital.accounts.map((account, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700">
                      <span>{account.name} ({account.code})</span>
                      <span className="font-mono">{formatCurrency(account.balance)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reserves */}
              <div className="ml-4 mb-6">
                <div className="font-semibold text-gray-800 py-2">{balanceSheetData.equity.reserves.label}</div>
                <div className="ml-4 space-y-2 mb-3">
                  {balanceSheetData.equity.reserves.accounts.map((account, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700">
                      <span>{account.name} ({account.code})</span>
                      <span className="font-mono">{formatCurrency(account.balance)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retained Earnings */}
              <div className="ml-4 mb-6">
                <div className="font-semibold text-gray-800 py-2">{balanceSheetData.equity.retained_earnings.label}</div>
                <div className="ml-4 space-y-2 mb-3">
                  {balanceSheetData.equity.retained_earnings.accounts.map((account, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700">
                      <span>{account.name} ({account.code})</span>
                      <span className="font-mono">{formatCurrency(account.balance)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Equity */}
              <div className="flex justify-between py-3 px-4 bg-green-100 rounded font-bold text-lg border-2 border-green-600">
                <span>TOTAL EQUITY</span>
                <span className="font-mono">{formatCurrency(balanceSheetData.totalEquity)}</span>
              </div>
            </div>

            {/* Balance Check */}
            <div className="flex justify-between py-3 px-4 bg-purple-100 rounded font-bold text-lg border-2 border-purple-600">
              <span>TOTAL LIABILITIES AND EQUITY</span>
              <span className="font-mono">{formatCurrency(balanceSheetData.totalLiabilitiesAndEquity)}</span>
            </div>

            {Math.abs(balanceSheetData.balancingCheck) > 0.01 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Balance sheet does not balance. Difference: {formatCurrency(balanceSheetData.balancingCheck)}
              </div>
            )}

            {/* Report Footer */}
            <div className="mt-12 text-center text-sm text-gray-500 border-t pt-6">
              <p>This report has been generated from the accounting system.</p>
              <p>Generated on: {new Date().toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </App>
  );
}
