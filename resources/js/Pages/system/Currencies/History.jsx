import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
  DollarSign, Home, List, Clock, TrendingUp, TrendingDown,
  Calendar, Database, Minus, ArrowLeft
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
        View exchange rate history and trends
      </div>
    </div>
  );
};

const CurrencyHistory = () => {
  const { currency, history } = usePage().props;
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChartData(selectedPeriod);
  }, [selectedPeriod]);

  const loadChartData = async (days) => {
    setLoading(true);
    try {
      const response = await axios.get(`/system/currencies/${currency.id}/history-data?days=${days}`);
      setChartData(response.data);
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRateChangeIcon = (change) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getRateChangeColor = (change) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const breadcrumbItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: List, label: 'System', href: '/system' },
    { icon: DollarSign, label: 'Currencies', href: '/system/currencies' },
    { icon: Clock, label: `${currency.code} History` }
  ];

  return (
    <App>
      <div className="container-modern">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              {currency.symbol} {currency.name} ({currency.code})
            </h1>
            <p className="page-subtitle">Exchange Rate History & Trends</p>
          </div>
          <div className="page-actions">
            <button
              onClick={() => router.visit('/system/currencies')}
              className="btn btn-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Currencies
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {parseFloat(currency.exchange_rate).toFixed(4)}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Records</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {history.total}
                </p>
              </div>
              <Database className="w-10 h-10 text-purple-500" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {currency.is_active ? '✅ Active' : '❌ Inactive'}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Base Currency</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {currency.is_base_currency ? '⭐ Yes' : 'No'}
                </p>
              </div>
              <Calendar className="w-10 h-10 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Rate History Period
            </h3>
            <div className="flex space-x-2">
              {[7, 30, 90, 180, 365].map((days) => (
                <button
                  key={days}
                  onClick={() => setSelectedPeriod(days)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedPeriod === days
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {days}D
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              📊 Rate Change History
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Exchange Rate</th>
                  <th>Previous Rate</th>
                  <th>Change</th>
                  <th>Source</th>
                  <th>Provider</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {history.data.length > 0 ? (
                  history.data.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(record.effective_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="font-semibold">
                        {parseFloat(record.exchange_rate).toFixed(6)}
                      </td>
                      <td className="text-gray-600 dark:text-gray-400">
                        {record.previous_rate ? parseFloat(record.previous_rate).toFixed(6) : '-'}
                      </td>
                      <td>
                        <div className="flex items-center">
                          {getRateChangeIcon(record.rate_change)}
                          <span className={`ml-2 font-medium ${getRateChangeColor(record.rate_change)}`}>
                            {record.rate_change ? `${record.rate_change > 0 ? '+' : ''}${parseFloat(record.rate_change).toFixed(2)}%` : '-'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          record.source === 'api' ? 'badge-success' :
                          record.source === 'system' ? 'badge-info' :
                          'badge-warning'
                        }`}>
                          {record.source}
                        </span>
                      </td>
                      <td className="text-gray-600 dark:text-gray-400">
                        {record.api_provider || '-'}
                      </td>
                      <td className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {record.notes || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      No history records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {history.links && history.links.length > 3 && (
            <div className="pagination">
              {history.links.map((link, index) => (
                <button
                  key={index}
                  onClick={() => link.url && router.visit(link.url)}
                  disabled={!link.url}
                  className={`pagination-button ${link.active ? 'active' : ''}`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </App>
  );
};

export default CurrencyHistory;

