import React, { useState, useEffect } from 'react';
import { 
  DollarSign, X, Calculator, RefreshCw, ArrowRightLeft,
  TrendingUp, Minimize2, Maximize2
} from 'lucide-react';
import axios from 'axios';
import { usePage } from '@inertiajs/react';

const FloatingCurrencyWidget = ({ defaultOpen = false }) => {
  const { currencies, company } = usePage().props;
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState(company?.currency || 'USD');
  const [toCurrency, setToCurrency] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);

  // Set initial "to" currency (different from company currency)
  useEffect(() => {
    if (currencies && currencies.length > 0 && !toCurrency) {
      const firstDifferent = currencies.find(c => c.value !== fromCurrency);
      if (firstDifferent) {
        setToCurrency(firstDifferent.value);
      }
    }
  }, [currencies, fromCurrency]);

  // Auto-convert when amount or currencies change
  useEffect(() => {
    if (amount && fromCurrency && toCurrency && parseFloat(amount) > 0) {
      const debounceTimer = setTimeout(() => {
        handleConvert();
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [amount, fromCurrency, toCurrency]);

  const handleConvert = async () => {
    if (!amount || parseFloat(amount) <= 0) {
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
      setExchangeRate(response.data.exchange_rate);
    } catch (err) {
      setError('Failed to convert. Please try again.');
      console.error('Conversion error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setResult(null);
  };

  const handleRefresh = () => {
    setResult(null);
    setExchangeRate(null);
    handleConvert();
  };

  const getCurrencySymbol = (code) => {
    const currency = currencies?.find(c => c.value === code);
    return currency?.symbol || code;
  };

  const getCurrencyLabel = (code) => {
    const currency = currencies?.find(c => c.value === code);
    return currency?.label || code;
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 group"
          title="Currency Calculator"
        >
          <Calculator className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`fixed ${isMinimized ? 'bottom-6 right-6' : 'bottom-0 right-0'} z-50 transition-all duration-300`}
      style={{
        width: isMinimized ? 'auto' : '420px',
        height: isMinimized ? 'auto' : 'auto',
        maxHeight: isMinimized ? 'auto' : '90vh'
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Currency Calculator</h3>
                <p className="text-blue-100 text-xs">Real-time conversion</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            {/* Company Currency Badge */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-300 font-medium">Company Currency</p>
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                    {getCurrencySymbol(company?.currency || 'USD')} {company?.currency || 'USD'}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 text-xl font-bold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* Currency Selectors */}
            <div className="space-y-3 mb-4">
              {/* From Currency */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  From
                </label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {currencies?.map((currency) => (
                    <option key={currency.value} value={currency.value}>
                      {currency.symbol} {currency.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center -my-1">
                <button
                  onClick={handleSwap}
                  className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-2 rounded-full transition-colors"
                  title="Swap currencies"
                >
                  <ArrowRightLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* To Currency */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  To
                </label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {currencies?.map((currency) => (
                    <option key={currency.value} value={currency.value}>
                      {currency.symbol} {currency.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Convert Button */}
            <button
              onClick={handleConvert}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  <span>Convert Now</span>
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Result */}
            {result && !error && (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 p-6 rounded-xl border-2 border-green-200 dark:border-green-700 space-y-3">
                <div className="text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Result</p>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-300">
                    {result.to_symbol} {parseFloat(result.to_amount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {result.to_currency}
                  </p>
                </div>

                <div className="pt-3 border-t border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span>Exchange Rate</span>
                    </div>
                    <button
                      onClick={handleRefresh}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                      title="Refresh rate"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Refresh
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">
                    1 {result.from_currency} = {parseFloat(result.exchange_rate).toFixed(4)} {result.to_currency}
                  </p>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                  <p>Live rates from external API</p>
                </div>
              </div>
            )}

            {/* Quick Convert Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Quick amounts:</p>
              <div className="grid grid-cols-4 gap-2">
                {[100, 500, 1000, 5000].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="px-2 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    {quickAmount}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                💱 Real-time currency conversion powered by live exchange rates
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingCurrencyWidget;

