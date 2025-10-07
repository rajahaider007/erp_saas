import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { 
  DollarSign, ArrowRightLeft, Home, List, Calculator,
  RefreshCw, TrendingUp, TrendingDown
} from 'lucide-react';
import App from "../../App.jsx";
import axios from 'axios';

// Professional Breadcrumbs Component
const Breadcrumbs = ({ items }) => {
  return (
    <div className="breadcrumbs-themed">
      <nav className="breadcrumbs">
        {items.map((item, index) => (
          <div key={index} className="breadcrumb-item">
            <div className="breadcrumb-item-content">
              {item.icon && (
                <item.icon className={`breadcrumb-icon ${item.href
                  ? 'breadcrumb-icon-link'
                  : 'breadcrumb-icon-current'
                  }`} />
              )}

              {item.href ? (
                <a href={item.href} className="breadcrumb-link-themed">
                  {item.label}
                </a>
              ) : (
                <span className="breadcrumb-current-themed">
                  {item.label}
                </span>
              )}
            </div>

            {index < items.length - 1 && (
              <div className="breadcrumb-separator breadcrumb-separator-themed">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="breadcrumbs-description">
        Convert between currencies with live exchange rates
      </div>
    </div>
  );
};

const CurrencyConverter = () => {
  const { currencies: allCurrencies } = usePage().props;
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConvert = async () => {
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/system/currencies/convert', {
        amount: parseFloat(amount),
        from: fromCurrency,
        to: toCurrency
      });

      setResult(response.data);
    } catch (err) {
      setError('Failed to convert currency. Please try again.');
      console.error('Conversion error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  const breadcrumbItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: List, label: 'System', href: '/system' },
    { icon: DollarSign, label: 'Currencies', href: '/system/currencies' },
    { icon: Calculator, label: 'Converter' }
  ];

  return (
    <App>
      <div className="container-modern">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">💱 Currency Converter</h1>
            <p className="page-subtitle">Convert between currencies with real-time exchange rates</p>
          </div>
        </div>

        {/* Converter Card */}
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <div className="p-8">
              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setResult(null);
                  }}
                  className="w-full px-4 py-3 text-2xl font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                />
              </div>

              {/* Currency Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6">
                {/* From Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    From
                  </label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => {
                      setFromCurrency(e.target.value);
                      setResult(null);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  >
                    {allCurrencies.map((currency) => (
                      <option key={currency.id} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center mt-6 md:mt-0">
                  <button
                    onClick={handleSwapCurrencies}
                    className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    title="Swap currencies"
                  >
                    <ArrowRightLeft className="w-6 h-6" />
                  </button>
                </div>

                {/* To Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    To
                  </label>
                  <select
                    value={toCurrency}
                    onChange={(e) => {
                      setToCurrency(e.target.value);
                      setResult(null);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  >
                    {allCurrencies.map((currency) => (
                      <option key={currency.id} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Convert Button */}
              <div className="mb-6">
                <button
                  onClick={handleConvert}
                  disabled={loading}
                  className="w-full btn btn-primary py-4 text-lg font-semibold disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 mr-2" />
                      Convert Currency
                    </>
                  )}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* Result */}
              {result && !error && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {result.from_symbol} {parseFloat(result.from_amount).toLocaleString()} {result.from_currency}
                    </div>
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-300 mb-2">
                      {result.to_symbol} {parseFloat(result.to_amount).toLocaleString()}
                    </div>
                    <div className="text-lg text-gray-700 dark:text-gray-300">
                      {result.to_currency}
                    </div>
                    <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                      <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Exchange Rate: 1 {result.from_currency} = {result.exchange_rate} {result.to_currency}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              ℹ️ About Exchange Rates
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Exchange rates are updated regularly from reliable sources</li>
              <li>• Rates are for informational purposes and may vary from actual transaction rates</li>
              <li>• Historical rate data is available on individual currency pages</li>
              <li>• Base currency conversions ensure accuracy across all currency pairs</li>
            </ul>
          </div>
        </div>
      </div>
    </App>
  );
};

export default CurrencyConverter;

