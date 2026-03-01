import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
  Printer, 
  RefreshCcw,
  FileText,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useLayout } from '@/Contexts/LayoutContext';
import App from '../../App.jsx';

function ReportContent() {
  const { 
    company,
    incomeStatementData,
    fromDate,
    toDate,
    currencyCode,
    error
  } = usePage().props;

  const { theme, primaryColor } = useLayout();

  const [selectedFromDate, setSelectedFromDate] = useState(fromDate);
  const [selectedToDate, setSelectedToDate] = useState(toDate);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    setLoading(true);

    const params = new URLSearchParams({
      from_date: selectedFromDate,
      to_date: selectedToDate
    });

    router.get(`/accounts/income-statement?${params.toString()}`, {}, {
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

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 flex items-center gap-2 ${
            theme === 'dark' 
              ? 'text-gray-100' 
              : 'text-gray-900'
          }`}>
            <TrendingUp className={`w-8 h-8 ${
              primaryColor === 'blue' ? 'text-blue-600 dark:text-blue-400' :
              primaryColor === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' :
              primaryColor === 'purple' ? 'text-purple-600 dark:text-purple-400' :
              primaryColor === 'green' ? 'text-green-600 dark:text-green-400' :
              primaryColor === 'red' ? 'text-red-600 dark:text-red-400' :
              primaryColor === 'orange' ? 'text-orange-600 dark:text-orange-400' :
              primaryColor === 'teal' ? 'text-teal-600 dark:text-teal-400' :
              'text-pink-600 dark:text-pink-400'
            }`} />
            Income Statement (Statement of Comprehensive Income)
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
                From Date
              </label>
              <input
                type="date"
                value={selectedFromDate}
                onChange={(e) => setSelectedFromDate(e.target.value)}
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
                To Date
              </label>
              <input
                type="date"
                value={selectedToDate}
                onChange={(e) => setSelectedToDate(e.target.value)}
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

        {/* Income Statement Report */}
        {incomeStatementData && (
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
                Income Statement for the period {new Date(fromDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} 
                {' '} to {' '}
                {new Date(toDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Currency: {currencyCode}</p>
            </div>

            {/* === REVENUE SECTION === */}
            <div className="mb-8">
              <div className={`py-2 px-4 font-bold mb-4 rounded ${
                theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'
              }`}>REVENUE</div>

              <div className="ml-4 space-y-4">
                {/* Sales Revenue */}
                <div>
                  <div className={`font-semibold py-2 ml-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    {incomeStatementData.revenue.sales.label}
                  </div>
                  {incomeStatementData.revenue.sales.accounts.length > 0 && (
                    <div className={`ml-8 space-y-1 mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                      {incomeStatementData.revenue.sales.accounts.map((account, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{account.name}</span>
                          <span className="font-mono">{formatCurrency(account.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={`flex justify-between py-1 px-4 rounded ml-4 ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-900'
                  }`}>
                    <span className="font-semibold">{incomeStatementData.revenue.sales.label}</span>
                    <span className="font-mono font-semibold">{formatCurrency(incomeStatementData.revenue.sales.total)}</span>
                  </div>
                </div>

                {/* Service Revenue */}
                <div>
                  <div className={`font-semibold py-2 ml-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    {incomeStatementData.revenue.services.label}
                  </div>
                  {incomeStatementData.revenue.services.accounts.length > 0 && (
                    <div className={`ml-8 space-y-1 mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                      {incomeStatementData.revenue.services.accounts.map((account, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{account.name}</span>
                          <span className="font-mono">{formatCurrency(account.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={`flex justify-between py-1 px-4 rounded ml-4 ${
                    theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-900'
                  }`}>
                    <span className="font-semibold">{incomeStatementData.revenue.services.label}</span>
                    <span className="font-mono font-semibold">{formatCurrency(incomeStatementData.revenue.services.total)}</span>
                  </div>
                </div>

                {/* Other Revenue */}
                {incomeStatementData.revenue.other_operating.total !== 0 && (
                  <div>
                    <div className={`font-semibold py-2 ml-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                      {incomeStatementData.revenue.other_operating.label}
                    </div>
                    {incomeStatementData.revenue.other_operating.accounts.length > 0 && (
                      <div className={`ml-8 space-y-1 mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                        {incomeStatementData.revenue.other_operating.accounts.map((account, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{account.name}</span>
                            <span className="font-mono">{formatCurrency(account.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className={`flex justify-between py-1 px-4 rounded ml-4 ${
                      theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-900'
                    }`}>
                      <span className="font-semibold">{incomeStatementData.revenue.other_operating.label}</span>
                      <span className="font-mono font-semibold">{formatCurrency(incomeStatementData.revenue.other_operating.total)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Total Revenue */}
              <div className={`flex justify-between py-2 px-4 rounded font-bold text-lg border mt-4 ml-4 ${
                primaryColor === 'blue' ? (theme === 'dark' ? 'bg-blue-900/30 border-blue-700 text-blue-300' : 'bg-blue-100 border-blue-600 text-blue-900') :
                primaryColor === 'indigo' ? (theme === 'dark' ? 'bg-indigo-900/30 border-indigo-700 text-indigo-300' : 'bg-indigo-100 border-indigo-600 text-indigo-900') :
                primaryColor === 'purple' ? (theme === 'dark' ? 'bg-purple-900/30 border-purple-700 text-purple-300' : 'bg-purple-100 border-purple-600 text-purple-900') :
                primaryColor === 'green' ? (theme === 'dark' ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-green-100 border-green-600 text-green-900') :
                primaryColor === 'red' ? (theme === 'dark' ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-100 border-red-600 text-red-900') :
                primaryColor === 'orange' ? (theme === 'dark' ? 'bg-orange-900/30 border-orange-700 text-orange-300' : 'bg-orange-100 border-orange-600 text-orange-900') :
                primaryColor === 'teal' ? (theme === 'dark' ? 'bg-teal-900/30 border-teal-700 text-teal-300' : 'bg-teal-100 border-teal-600 text-teal-900') :
                (theme === 'dark' ? 'bg-pink-900/30 border-pink-700 text-pink-300' : 'bg-pink-100 border-pink-600 text-pink-900')
              }`}>
                <span>TOTAL REVENUE</span>
                <span className="font-mono">{formatCurrency(incomeStatementData.totalRevenue)}</span>
              </div>
            </div>

            {/* === COST OF GOODS SOLD SECTION === */}
            {incomeStatementData.totalCOGS !== 0 && (
              <div className="mb-8">
                <div className={`py-2 px-4 font-bold mb-4 rounded ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'
                }`}>COST OF GOODS SOLD</div>

                <div className="ml-4 space-y-3">
                  {incomeStatementData.costOfGoodsSold.purchases.accounts.length > 0 && (
                    <div>
                      <div className={`font-semibold py-2 ml-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                        {incomeStatementData.costOfGoodsSold.purchases.label}
                      </div>
                      <div className={`ml-8 space-y-1 mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                        {incomeStatementData.costOfGoodsSold.purchases.accounts.map((account, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{account.name}</span>
                            <span className="font-mono">{formatCurrency(account.amount)}</span>
                          </div>
                        ))}
                      </div>
                      <div className={`flex justify-between py-1 px-4 rounded ml-4 ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-900'
                      }`}>
                        <span className="font-semibold">{incomeStatementData.costOfGoodsSold.purchases.label}</span>
                        <span className="font-mono font-semibold">{formatCurrency(incomeStatementData.costOfGoodsSold.purchases.total)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Total COGS */}
                <div className={`flex justify-between py-2 px-4 rounded font-semibold text-base border mt-4 ml-4 ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}>
                  <span>TOTAL COST OF GOODS SOLD</span>
                  <span className="font-mono">{formatCurrency(incomeStatementData.totalCOGS)}</span>
                </div>

                {/* Gross Profit */}
                <div className={`flex justify-between py-2 px-4 rounded font-bold text-base border mt-2 ml-4 ${
                  theme === 'dark' ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-gray-200 border-gray-400 text-gray-900'
                }`}>
                  <span>GROSS PROFIT</span>
                  <span className="font-mono">{formatCurrency(incomeStatementData.grossProfit)}</span>
                </div>
              </div>
            )}

            {/* === OPERATING EXPENSES SECTION === */}
            {incomeStatementData.totalOperatingExpenses !== 0 && (
              <div className="mb-8">
                <div className={`py-2 px-4 font-bold mb-4 rounded ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'
                }`}>OPERATING EXPENSES</div>

                <div className="ml-4 space-y-4">
                  {incomeStatementData.operatingExpenses.selling_distribution.accounts.length > 0 && (
                    <div>
                      <div className={`font-semibold py-2 ml-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                        {incomeStatementData.operatingExpenses.selling_distribution.label}
                      </div>
                      <div className={`ml-8 space-y-1 mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                        {incomeStatementData.operatingExpenses.selling_distribution.accounts.map((account, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{account.name}</span>
                            <span className="font-mono">{formatCurrency(account.amount)}</span>
                          </div>
                        ))}
                      </div>
                      <div className={`flex justify-between py-1 px-4 rounded ml-4 ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-900'
                      }`}>
                        <span className="font-semibold">{incomeStatementData.operatingExpenses.selling_distribution.label}</span>
                        <span className="font-mono font-semibold">{formatCurrency(incomeStatementData.operatingExpenses.selling_distribution.total)}</span>
                      </div>
                    </div>
                  )}

                  {incomeStatementData.operatingExpenses.administrative.accounts.length > 0 && (
                    <div>
                      <div className={`font-semibold py-2 ml-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                        {incomeStatementData.operatingExpenses.administrative.label}
                      </div>
                      <div className={`ml-8 space-y-1 mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                        {incomeStatementData.operatingExpenses.administrative.accounts.map((account, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{account.name}</span>
                            <span className="font-mono">{formatCurrency(account.amount)}</span>
                          </div>
                        ))}
                      </div>
                      <div className={`flex justify-between py-1 px-4 rounded ml-4 ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-900'
                      }`}>
                        <span className="font-semibold">{incomeStatementData.operatingExpenses.administrative.label}</span>
                        <span className="font-mono font-semibold">{formatCurrency(incomeStatementData.operatingExpenses.administrative.total)}</span>
                      </div>
                    </div>
                  )}

                  {incomeStatementData.operatingExpenses.depreciation.accounts.length > 0 && (
                    <div>
                      <div className={`font-semibold py-2 ml-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                        {incomeStatementData.operatingExpenses.depreciation.label}
                      </div>
                      <div className={`ml-8 space-y-1 mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                        {incomeStatementData.operatingExpenses.depreciation.accounts.map((account, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{account.name}</span>
                            <span className="font-mono">{formatCurrency(account.amount)}</span>
                          </div>
                        ))}
                      </div>
                      <div className={`flex justify-between py-1 px-4 rounded ml-4 ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-900'
                      }`}>
                        <span className="font-semibold">{incomeStatementData.operatingExpenses.depreciation.label}</span>
                        <span className="font-mono font-semibold">{formatCurrency(incomeStatementData.operatingExpenses.depreciation.total)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Total Operating Expenses */}
                <div className={`flex justify-between py-2 px-4 rounded font-semibold text-base border mt-4 ml-4 ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}>
                  <span>TOTAL OPERATING EXPENSES</span>
                  <span className="font-mono">{formatCurrency(incomeStatementData.totalOperatingExpenses)}</span>
                </div>

                {/* Operating Profit */}
                <div className={`flex justify-between py-2 px-4 rounded font-bold text-base border mt-2 ml-4 ${
                  theme === 'dark' ? 'bg-gray-600 border-gray-500 text-gray-100' : 'bg-gray-200 border-gray-400 text-gray-900'
                }`}>
                  <span>OPERATING PROFIT</span>
                  <span className="font-mono">{formatCurrency(incomeStatementData.operatingProfit)}</span>
                </div>
              </div>
            )}

            {/* === FINANCE ITEMS SECTION === */}
            {(incomeStatementData.financeIncome !== 0 || incomeStatementData.financeExpenses !== 0) && (
              <div className="mb-8">
                <div className={`py-2 px-4 font-bold mb-4 rounded ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'
                }`}>FINANCE ITEMS & OTHER INCOME/EXPENSES</div>

                <div className="ml-4 space-y-3">
                  {incomeStatementData.financeItems.interest_revenue.accounts.length > 0 && (
                    <div>
                      <div className={`font-semibold py-2 ml-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                        {incomeStatementData.financeItems.interest_revenue.label}
                      </div>
                      <div className={`ml-8 space-y-1 mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                        {incomeStatementData.financeItems.interest_revenue.accounts.map((account, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{account.name}</span>
                            <span className="font-mono">{formatCurrency(account.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {incomeStatementData.financeItems.other_income.accounts.length > 0 && (
                    <div>
                      <div className={`font-semibold py-2 ml-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                        {incomeStatementData.financeItems.other_income.label}
                      </div>
                      <div className={`ml-8 space-y-1 mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                        {incomeStatementData.financeItems.other_income.accounts.map((account, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{account.name}</span>
                            <span className="font-mono">{formatCurrency(account.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {incomeStatementData.financeItems.interest_expense.accounts.length > 0 && (
                    <div>
                      <div className={`font-semibold py-2 ml-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                        {incomeStatementData.financeItems.interest_expense.label}
                      </div>
                      <div className={`ml-8 space-y-1 mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                        {incomeStatementData.financeItems.interest_expense.accounts.map((account, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{account.name}</span>
                            <span className="font-mono">{formatCurrency(account.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {incomeStatementData.financeItems.other_expenses.accounts.length > 0 && (
                    <div>
                      <div className={`font-semibold py-2 ml-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                        {incomeStatementData.financeItems.other_expenses.label}
                      </div>
                      <div className={`ml-8 space-y-1 mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                        {incomeStatementData.financeItems.other_expenses.accounts.map((account, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{account.name}</span>
                            <span className="font-mono">{formatCurrency(account.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Finance Summary */}
                <div className={`flex justify-between py-1 px-4 rounded ml-4 mt-3 ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-900'
                }`}>
                  <span className="font-semibold">Finance Income</span>
                  <span className="font-mono font-semibold">{formatCurrency(incomeStatementData.financeIncome)}</span>
                </div>
                <div className={`flex justify-between py-1 px-4 rounded ml-4 mt-2 ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-900'
                }`}>
                  <span className="font-semibold">Finance Expenses</span>
                  <span className="font-mono font-semibold">{formatCurrency(incomeStatementData.financeExpenses)}</span>
                </div>
              </div>
            )}

            {/* === PROFIT BEFORE TAX === */}
            <div className={`flex justify-between py-3 px-4 rounded font-bold text-lg border-2 mb-8 ml-4 ${
              theme === 'dark' ? 'bg-amber-900/30 border-amber-700 text-amber-300' : 'bg-amber-100 border-amber-600 text-amber-900'
            }`}>
              <span>PROFIT BEFORE TAX</span>
              <span className="font-mono">{formatCurrency(incomeStatementData.profitBeforeTax)}</span>
            </div>

            {/* === TAX EXPENSE === */}
            {incomeStatementData.taxExpense !== 0 && (
              <div className="mb-8">
                <div className={`py-2 px-4 font-bold mb-4 rounded ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'
                }`}>INCOME TAX</div>

                {incomeStatementData.taxAndProfit.tax_expense.accounts.length > 0 && (
                  <div className="ml-4">
                    <div className={`ml-8 space-y-1 mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                      {incomeStatementData.taxAndProfit.tax_expense.accounts.map((account, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{account.name}</span>
                          <span className="font-mono">{formatCurrency(account.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`flex justify-between py-2 px-4 rounded font-semibold text-base border ml-4 ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}>
                  <span>TOTAL TAX EXPENSE</span>
                  <span className="font-mono">{formatCurrency(incomeStatementData.taxExpense)}</span>
                </div>
              </div>
            )}

            {/* === PROFIT FOR THE PERIOD === */}
            <div className={`flex justify-between py-3 px-4 rounded font-bold text-lg border-2 ml-4 ${
              incomeStatementData.profitForPeriod >= 0 ? 
                (theme === 'dark' ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-green-100 border-green-600 text-green-900') :
                (theme === 'dark' ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-100 border-red-600 text-red-900')
            }`}>
              <span>NET PROFIT / (LOSS) FOR THE PERIOD</span>
              <span className="font-mono">{formatCurrency(incomeStatementData.profitForPeriod)}</span>
            </div>

            {/* Report Footer */}
            <div className={`mt-12 text-center text-sm border-t pt-6 ${
              theme === 'dark' ? 'border-gray-700 text-gray-500' : 'border-gray-900 text-gray-500'
            }`}>
              <p>This report has been generated from the accounting system.</p>
              <p>Generated on: {new Date().toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    );
}

export default function IncomeStatementReport() {
  return (
    <App title="Income Statement">
      <ReportContent />
    </App>
  );
}
