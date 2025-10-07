import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Globe, Download, Filter } from 'lucide-react';
import axios from 'axios';

/**
 * Multi-Currency Report Component
 * Displays financial data with multi-currency support
 */
const MultiCurrencyReport = ({ 
  title = "Multi-Currency Report",
  data = [],
  baseCurrency = 'USD',
  showConversion = true,
  allowExport = true
}) => {
  const [displayCurrency, setDisplayCurrency] = useState(baseCurrency);
  const [currencies, setCurrencies] = useState([]);
  const [convertedData, setConvertedData] = useState(data);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCurrencies();
  }, []);

  useEffect(() => {
    if (showConversion && displayCurrency !== baseCurrency) {
      convertData();
    } else {
      setConvertedData(data);
    }
  }, [displayCurrency, data]);

  const loadCurrencies = async () => {
    try {
      const response = await axios.get('/system/currencies/api/active');
      setCurrencies(response.data);
    } catch (error) {
      console.error('Error loading currencies:', error);
    }
  };

  const convertData = async () => {
    setLoading(true);
    try {
      const converted = [];
      for (const item of data) {
        const response = await axios.post('/system/currencies/convert', {
          amount: item.amount,
          from: item.currency || baseCurrency,
          to: displayCurrency
        });
        converted.push({
          ...item,
          convertedAmount: response.data.to_amount,
          convertedCurrency: displayCurrency,
          exchangeRate: response.data.exchange_rate
        });
      }
      setConvertedData(converted);
    } catch (error) {
      console.error('Error converting data:', error);
      setConvertedData(data);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return convertedData.reduce((sum, item) => {
      return sum + (item.convertedAmount || item.amount || 0);
    }, 0);
  };

  const exportReport = () => {
    // Create CSV content
    const headers = ['Description', 'Original Amount', 'Original Currency', 'Converted Amount', 'Display Currency'];
    const rows = convertedData.map(item => [
      item.description || '',
      item.amount || 0,
      item.currency || baseCurrency,
      item.convertedAmount || item.amount || 0,
      displayCurrency
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `multi-currency-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getCurrencySymbol = (currencyCode) => {
    const currency = currencies.find(c => c.value === currencyCode);
    return currency ? currency.symbol : currencyCode;
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              <Globe className="w-5 h-5 inline mr-2" />
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              View amounts in different currencies
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {showConversion && currencies.length > 0 && (
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                <select
                  value={displayCurrency}
                  onChange={(e) => setDisplayCurrency(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {currencies.map((currency) => (
                    <option key={currency.value} value={currency.value}>
                      {currency.symbol} {currency.value}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {allowExport && (
              <button
                onClick={exportReport}
                className="btn btn-secondary btn-sm"
                title="Export to CSV"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Description</th>
              <th className="text-right">Original Amount</th>
              {showConversion && displayCurrency !== baseCurrency && (
                <>
                  <th className="text-right">Converted Amount</th>
                  <th className="text-center">Exchange Rate</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Converting...</span>
                  </div>
                </td>
              </tr>
            ) : convertedData.length > 0 ? (
              <>
                {convertedData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.description || '-'}</td>
                    <td className="text-right font-medium">
                      {getCurrencySymbol(item.currency || baseCurrency)} {parseFloat(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      {item.currency && <span className="ml-2 text-sm text-gray-500">{item.currency}</span>}
                    </td>
                    {showConversion && displayCurrency !== baseCurrency && (
                      <>
                        <td className="text-right font-semibold text-blue-600 dark:text-blue-400">
                          {getCurrencySymbol(displayCurrency)} {parseFloat(item.convertedAmount || item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <span className="ml-2 text-sm">{displayCurrency}</span>
                        </td>
                        <td className="text-center text-sm text-gray-600 dark:text-gray-400">
                          {item.exchangeRate ? `1 ${item.currency} = ${parseFloat(item.exchangeRate).toFixed(4)} ${displayCurrency}` : '-'}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                <tr className="bg-gray-50 dark:bg-gray-800 font-bold">
                  <td>Total</td>
                  <td className="text-right">
                    {getCurrencySymbol(displayCurrency)} {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="ml-2 text-sm">{displayCurrency}</span>
                  </td>
                  {showConversion && displayCurrency !== baseCurrency && (
                    <td colSpan="2"></td>
                  )}
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <TrendingUp className="w-4 h-4 mr-2" />
          Exchange rates are updated regularly. Amounts shown are for reference purposes.
        </div>
      </div>
    </div>
  );
};

export default MultiCurrencyReport;

