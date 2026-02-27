import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
  Printer, 
  RefreshCcw,
  FileText,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import App from '../../App.jsx';

export default function IncomeStatementReport() {
  const { 
    company,
    incomeStatementData,
    fromDate,
    toDate,
    currencyCode,
    error
  } = usePage().props;

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
      <App title="Income Statement">
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
    <App title="Income Statement">
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            Income Statement (Statement of Comprehensive Income)
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
                From Date
              </label>
              <input
                type="date"
                value={selectedFromDate}
                onChange={(e) => setSelectedFromDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={selectedToDate}
                onChange={(e) => setSelectedToDate(e.target.value)}
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

        {/* Income Statement Report */}
        {incomeStatementData && (
          <div className="bg-white rounded-lg shadow-md p-8 print:shadow-none">
            {/* Report Header */}
            <div className="text-center border-b-2 border-gray-900 pb-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{company?.company_name}</h2>
              <p className="text-gray-600">{company?.legal_name}</p>
              <p className="text-sm text-gray-500">
                Income Statement for the period {new Date(fromDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} 
                {' '} to {' '}
                {new Date(toDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
              <p className="text-sm text-gray-500">Currency: {currencyCode}</p>
            </div>

            {/* Revenue Section */}
            <div className="mb-8">
              <div className="bg-gray-100 py-2 px-4 font-bold text-gray-900 mb-4 rounded">
                REVENUE
              </div>

              <div className="ml-4 space-y-6">
                {/* Sales Revenue */}
                <div>
                  <div className="font-semibold text-gray-800 py-2 ml-4">{incomeStatementData.revenue.sales.label}</div>
                  <div className="ml-8 space-y-1 mb-2">
                    {incomeStatementData.revenue.sales.accounts.map((account, idx) => (
                      <div key={idx} className="flex justify-between text-gray-700">
                        <span>{account.name}</span>
                        <span className="font-mono">{formatCurrency(account.amount)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between py-2 px-4 bg-gray-50 rounded ml-4">
                    <span className="font-semibold">{incomeStatementData.revenue.sales.label}</span>
                    <span className="font-mono font-semibold">{formatCurrency(incomeStatementData.revenue.sales.total)}</span>
                  </div>
                </div>

                {/* Service Revenue */}
                <div>
                  <div className="font-semibold text-gray-800 py-2 ml-4">{incomeStatementData.revenue.services.label}</div>
                  <div className="ml-8 space-y-1 mb-2">
                    {incomeStatementData.revenue.services.accounts.map((account, idx) => (
                      <div key={idx} className="flex justify-between text-gray-700">
                        <span>{account.name}</span>
                        <span className="font-mono">{formatCurrency(account.amount)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between py-2 px-4 bg-gray-50 rounded ml-4">
                    <span className="font-semibold">{incomeStatementData.revenue.services.label}</span>
                    <span className="font-mono font-semibold">{formatCurrency(incomeStatementData.revenue.services.total)}</span>
                  </div>
                </div>

                {/* Other Revenue */}
                {incomeStatementData.revenue.other_operating.total > 0 && (
                  <div>
                    <div className="font-semibold text-gray-800 py-2 ml-4">{incomeStatementData.revenue.other_operating.label}</div>
                    <div className="ml-8 space-y-1 mb-2">
                      {incomeStatementData.revenue.other_operating.accounts.map((account, idx) => (
                        <div key={idx} className="flex justify-between text-gray-700">
                          <span>{account.name}</span>
                          <span className="font-mono">{formatCurrency(account.amount)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between py-2 px-4 bg-gray-50 rounded ml-4">
                      <span className="font-semibold">{incomeStatementData.revenue.other_operating.label}</span>
                      <span className="font-mono font-semibold">{formatCurrency(incomeStatementData.revenue.other_operating.total)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between py-3 px-4 bg-blue-100 rounded font-bold text-lg border border-blue-600 mt-4 ml-4">
                <span>TOTAL REVENUE</span>
                <span className="font-mono">{formatCurrency(incomeStatementData.totalRevenue)}</span>
              </div>
            </div>

            {/* Cost of Goods Sold */}
            {incomeStatementData.totalCOGS > 0 && (
              <div className="mb-8">
                <div className="bg-gray-100 py-2 px-4 font-bold text-gray-900 mb-4 rounded">
                  COST OF GOODS SOLD
                </div>

                <div className="ml-8 space-y-2 mb-4">
                  {incomeStatementData.costOfGoodsSold.purchases.accounts.map((account, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700">
                      <span>{account.name}</span>
                      <span className="font-mono">{formatCurrency(account.amount)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between py-3 px-4 bg-orange-100 rounded font-bold border border-orange-600 ml-4">
                  <span>TOTAL COST OF GOODS SOLD</span>
                  <span className="font-mono">{formatCurrency(incomeStatementData.totalCOGS)}</span>
                </div>

                <div className="flex justify-between py-3 px-4 bg-blue-50 rounded font-bold mt-2 ml-4">
                  <span>GROSS PROFIT</span>
                  <span className="font-mono">{formatCurrency(incomeStatementData.grossProfit)}</span>
                </div>
              </div>
            )}

            {/* Operating Expenses */}
            {incomeStatementData.totalOperatingExpenses > 0 && (
              <div className="mb-8">
                <div className="bg-gray-100 py-2 px-4 font-bold text-gray-900 mb-4 rounded">
                  OPERATING EXPENSES
                </div>

                <div className="ml-4 space-y-4">
                  {/* Selling Expenses */}
                  {incomeStatementData.operatingExpenses.selling.total > 0 && (
                    <div>
                      <div className="font-semibold text-gray-800 py-2 ml-4">{incomeStatementData.operatingExpenses.selling.label}</div>
                      <div className="ml-8 space-y-1">
                        {incomeStatementData.operatingExpenses.selling.accounts.map((account, idx) => (
                          <div key={idx} className="flex justify-between text-gray-700">
                            <span>{account.name}</span>
                            <span className="font-mono">{formatCurrency(account.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Distribution Expenses */}
                  {incomeStatementData.operatingExpenses.distribution.total > 0 && (
                    <div>
                      <div className="font-semibold text-gray-800 py-2 ml-4">{incomeStatementData.operatingExpenses.distribution.label}</div>
                      <div className="ml-8 space-y-1">
                        {incomeStatementData.operatingExpenses.distribution.accounts.map((account, idx) => (
                          <div key={idx} className="flex justify-between text-gray-700">
                            <span>{account.name}</span>
                            <span className="font-mono">{formatCurrency(account.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Administrative Expenses */}
                  {incomeStatementData.operatingExpenses.administrative.total > 0 && (
                    <div>
                      <div className="font-semibold text-gray-800 py-2 ml-4">{incomeStatementData.operatingExpenses.administrative.label}</div>
                      <div className="ml-8 space-y-1">
                        {incomeStatementData.operatingExpenses.administrative.accounts.map((account, idx) => (
                          <div key={idx} className="flex justify-between text-gray-700">
                            <span>{account.name}</span>
                            <span className="font-mono">{formatCurrency(account.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Depreciation */}
                  {incomeStatementData.operatingExpenses.depreciation.total > 0 && (
                    <div>
                      <div className="font-semibold text-gray-800 py-2 ml-4">{incomeStatementData.operatingExpenses.depreciation.label}</div>
                      <div className="ml-8 space-y-1">
                        {incomeStatementData.operatingExpenses.depreciation.accounts.map((account, idx) => (
                          <div key={idx} className="flex justify-between text-gray-700">
                            <span>{account.name}</span>
                            <span className="font-mono">{formatCurrency(account.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between py-3 px-4 bg-orange-100 rounded font-bold border border-orange-600 mt-4 ml-4">
                  <span>TOTAL OPERATING EXPENSES</span>
                  <span className="font-mono">{formatCurrency(incomeStatementData.totalOperatingExpenses)}</span>
                </div>

                <div className="flex justify-between py-3 px-4 bg-blue-50 rounded font-bold mt-2 ml-4">
                  <span>OPERATING PROFIT</span>
                  <span className="font-mono">{formatCurrency(incomeStatementData.operatingProfit)}</span>
                </div>
              </div>
            )}

            {/* Finance Items */}
            {(incomeStatementData.financeIncome > 0 || incomeStatementData.financeExpenses > 0) && (
              <div className="mb-8">
                <div className="bg-gray-100 py-2 px-4 font-bold text-gray-900 mb-4 rounded">
                  NON-OPERATING ITEMS
                </div>

                <div className="ml-8 space-y-2">
                  {incomeStatementData.financeItems.interest_revenue.total > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>{incomeStatementData.financeItems.interest_revenue.label}</span>
                      <span className="font-mono">{formatCurrency(incomeStatementData.financeItems.interest_revenue.total)}</span>
                    </div>
                  )}
                  {incomeStatementData.financeItems.other_income.total > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>{incomeStatementData.financeItems.other_income.label}</span>
                      <span className="font-mono">{formatCurrency(incomeStatementData.financeItems.other_income.total)}</span>
                    </div>
                  )}
                  {incomeStatementData.financeItems.interest_expense.total > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>({incomeStatementData.financeItems.interest_expense.label})</span>
                      <span className="font-mono">({formatCurrency(incomeStatementData.financeItems.interest_expense.total)})</span>
                    </div>
                  )}
                  {incomeStatementData.financeItems.other_expenses.total > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>({incomeStatementData.financeItems.other_expenses.label})</span>
                      <span className="font-mono">({formatCurrency(incomeStatementData.financeItems.other_expenses.total)})</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Profit Before Tax */}
            <div className="flex justify-between py-3 px-4 bg-amber-100 rounded font-bold text-lg border-2 border-amber-600 mb-8">
              <span>PROFIT BEFORE TAX</span>
              <span className="font-mono">{formatCurrency(incomeStatementData.profitBeforeTax)}</span>
            </div>

            {/* Tax Expense */}
            {incomeStatementData.taxExpense > 0 && (
              <div className="mb-8">
                <div className="ml-8 space-y-2 mb-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Income Tax Expense</span>
                    <span className="font-mono">({formatCurrency(incomeStatementData.taxExpense)})</span>
                  </div>
                </div>
              </div>
            )}

            {/* Profit for the Period */}
            <div className={`flex justify-between py-3 px-4 rounded font-bold text-lg border-2 ${incomeStatementData.profitForPeriod >= 0 ? 'bg-green-100 border-green-600' : 'bg-red-100 border-red-600'}`}>
              <span>PROFIT FOR THE PERIOD</span>
              <span className="font-mono">{formatCurrency(incomeStatementData.profitForPeriod)}</span>
            </div>

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
