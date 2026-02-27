import React, { useState, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
  Calendar, 
  Plus, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertCircle,
  Settings,
  RefreshCcw,
  Save
} from 'lucide-react';
import { useLayout } from '@/Contexts/LayoutContext';
import App from '../../App.jsx';

function PageContent() {
  const { 
    company, 
    fiscalYears = [], 
    selectedYear, 
    periods = [],
    currentFiscalYear,
    flash = {}
  } = usePage().props;

  const { theme, primaryColor } = useLayout();

  const [loading, setLoading] = useState(false);
  const [newYear, setNewYear] = useState((parseInt(selectedYear) + 1).toString());
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const [newStatus, setNewStatus] = useState('Open');

  const handleCreateYear = async (e) => {
    e.preventDefault();
    setLoading(true);

    router.post('/accounts/fiscal-year-configuration/create-year', {
      year: newYear,
      comp_id: company?.id
    }, {
      onSuccess: () => {
        setLoading(false);
        setNewYear((parseInt(newYear) + 1).toString());
      },
      onError: () => {
        setLoading(false);
      }
    });
  };

  const handleUpdatePeriodStatus = (periodId, status) => {
    if (loading) return;
    
    setLoading(true);
    router.post('/accounts/fiscal-year-configuration/update-period-status', {
      period_id: periodId,
      status: status
    }, {
      onSuccess: () => {
        setLoading(false);
        setSelectedPeriodId(null);
      },
      onError: () => {
        setLoading(false);
      }
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 flex items-center gap-2 ${
            theme === 'dark' 
              ? 'text-gray-100' 
              : 'text-gray-900'
          }`}>
            <Calendar className={`w-8 h-8 ${
              primaryColor === 'blue' ? 'text-blue-600 dark:text-blue-400' :
              primaryColor === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' :
              primaryColor === 'purple' ? 'text-purple-600 dark:text-purple-400' :
              primaryColor === 'green' ? 'text-green-600 dark:text-green-400' :
              primaryColor === 'red' ? 'text-red-600 dark:text-red-400' :
              primaryColor === 'orange' ? 'text-orange-600 dark:text-orange-400' :
              primaryColor === 'teal' ? 'text-teal-600 dark:text-teal-400' :
              'text-pink-600 dark:text-pink-400'
            }`} />
            Fiscal Year Configuration
          </h1>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Manage fiscal years and accounting periods according to IAS 1 standards
          </p>
        </div>

        {/* Flash Messages */}
        {flash?.success && (
          <div className={`mb-6 p-4 border rounded-lg flex items-center gap-2 ${
            theme === 'dark'
              ? 'bg-green-900/20 border-green-700 text-green-300'
              : 'bg-green-50 border-green-200 text-green-800'
          }`}>
            <CheckCircle2 className="w-5 h-5" />
            {flash.success}
          </div>
        )}

        {flash?.error && (
          <div className={`mb-6 p-4 border rounded-lg flex items-center gap-2 ${
            theme === 'dark'
              ? 'bg-red-900/20 border-red-700 text-red-300'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <AlertCircle className="w-5 h-5" />
            {flash.error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Fiscal Years List */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg shadow-md p-6 ${
              theme === 'dark'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-900'
            }`}>
              <h2 className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>Fiscal Years</h2>
              
              <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
                {fiscalYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      const params = new URLSearchParams(window.location.search);
                      params.set('fiscal_year', year);
                      router.get(`/accounts/fiscal-year-configuration?${params.toString()}`, {}, {
                        preserveState: true,
                        preserveScroll: true
                      });
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedYear === year
                        ? primaryColor === 'blue' ? 'bg-blue-600 dark:bg-blue-500 text-white' :
                          primaryColor === 'indigo' ? 'bg-indigo-600 dark:bg-indigo-500 text-white' :
                          primaryColor === 'purple' ? 'bg-purple-600 dark:bg-purple-500 text-white' :
                          primaryColor === 'green' ? 'bg-green-600 dark:bg-green-500 text-white' :
                          primaryColor === 'red' ? 'bg-red-600 dark:bg-red-500 text-white' :
                          primaryColor === 'orange' ? 'bg-orange-600 dark:bg-orange-500 text-white' :
                          primaryColor === 'teal' ? 'bg-teal-600 dark:bg-teal-500 text-white' :
                          'bg-pink-600 dark:bg-pink-500 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    FY {year}
                    {year === currentFiscalYear && (
                      <span className="text-xs ml-2">(Current)</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Create New Year Form */}
              <form onSubmit={handleCreateYear} className={`border-t pt-4 ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Create New Year
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    placeholder="YYYY"
                    maxLength="4"
                    className={`flex-1 px-3 py-2 border rounded-lg transition-colors focus:outline-none ${
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
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2 ${
                      primaryColor === 'blue' ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600' :
                      primaryColor === 'indigo' ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600' :
                      primaryColor === 'purple' ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600' :
                      primaryColor === 'green' ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600' :
                      primaryColor === 'red' ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600' :
                      primaryColor === 'orange' ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600' :
                      primaryColor === 'teal' ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600' :
                      'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Content - Periods */}
          <div className="lg:col-span-3">
            <div className={`rounded-lg shadow-md p-6 ${
              theme === 'dark'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-900'
            }`}>
              <h2 className={`text-lg font-semibold mb-6 ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Fiscal Year {selectedYear} - Periods
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <th className={`text-left py-3 px-4 font-semibold ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>#</th>
                      <th className={`text-left py-3 px-4 font-semibold ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Period Name</th>
                      <th className={`text-left py-3 px-4 font-semibold ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Type</th>
                      <th className={`text-left py-3 px-4 font-semibold ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Date Range</th>
                      <th className={`text-center py-3 px-4 font-semibold ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Status</th>
                      <th className={`text-center py-3 px-4 font-semibold ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periods && periods.length > 0 ? (
                      periods.map((period) => (
                        <tr key={period.id} className={`border-b transition-colors ${
                          theme === 'dark'
                            ? 'border-gray-700 hover:bg-gray-700/50'
                            : 'border-gray-100 hover:bg-gray-50'
                        }`}>
                          <td className={`py-4 px-4 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                          }`}>{period.period_number}</td>
                          <td className={`py-4 px-4 font-medium ${
                            theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                            {period.period_name}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-block px-3 py-1 text-xs rounded-full ${
                              primaryColor === 'blue' ? 
                                (theme === 'dark' ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-800') :
                              primaryColor === 'indigo' ? 
                                (theme === 'dark' ? 'bg-indigo-900/50 text-indigo-200' : 'bg-indigo-100 text-indigo-800') :
                              primaryColor === 'purple' ? 
                                (theme === 'dark' ? 'bg-purple-900/50 text-purple-200' : 'bg-purple-100 text-purple-800') :
                              primaryColor === 'green' ? 
                                (theme === 'dark' ? 'bg-green-900/50 text-green-200' : 'bg-green-100 text-green-800') :
                              primaryColor === 'red' ? 
                                (theme === 'dark' ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-800') :
                              primaryColor === 'orange' ? 
                                (theme === 'dark' ? 'bg-orange-900/50 text-orange-200' : 'bg-orange-100 text-orange-800') :
                              primaryColor === 'teal' ? 
                                (theme === 'dark' ? 'bg-teal-900/50 text-teal-200' : 'bg-teal-100 text-teal-800') :
                                (theme === 'dark' ? 'bg-pink-900/50 text-pink-200' : 'bg-pink-100 text-pink-800')
                            }`}>
                              {period.period_type}
                            </span>
                          </td>
                          <td className={`py-4 px-4 text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                              period.status === 'Open' ? 
                                (theme === 'dark' ? 'bg-green-900/50 text-green-200' : 'bg-green-100 text-green-800') :
                              period.status === 'Locked' ? 
                                (theme === 'dark' ? 'bg-yellow-900/50 text-yellow-200' : 'bg-yellow-100 text-yellow-800') :
                                (theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800')
                            }`}>
                              {period.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {period.status === 'Open' && !period.is_adjustment_period && (
                              <button
                                onClick={() => handleUpdatePeriodStatus(period.id, 'Locked')}
                                disabled={loading}
                                className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded disabled:opacity-50 transition-colors ${
                                  theme === 'dark'
                                    ? 'bg-yellow-900/50 text-yellow-200 hover:bg-yellow-900'
                                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                }`}
                                title="Lock period for review"
                              >
                                <Lock className="w-3 h-3" />
                                Lock
                              </button>
                            )}
                            {period.status === 'Locked' && !period.is_adjustment_period && (
                              <button
                                onClick={() => handleUpdatePeriodStatus(period.id, 'Closed')}
                                disabled={loading}
                                className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded disabled:opacity-50 transition-colors ${
                                  theme === 'dark'
                                    ? 'bg-green-900/50 text-green-200 hover:bg-green-900'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                                }`}
                                title="Close period permanently"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Close
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className={`py-8 text-center ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          No periods configured. Create a fiscal year first.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Information Box */}
              <div className={`mt-6 p-4 border rounded-lg ${
                theme === 'dark'
                  ? 'bg-blue-900/20 border-blue-700 text-blue-200'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                <h3 className={`font-semibold mb-2 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-900'
                }`}>
                  <AlertCircle className="w-4 h-4" />
                  Period Management Information
                </h3>
                <ul className={`text-sm space-y-1 ml-6 list-disc ${
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                }`}>
                  <li>Periods are automatically created when a fiscal year is created</li>
                  <li><strong>Open:</strong> Period is active and transactions can be posted</li>
                  <li><strong>Locked:</strong> Period is under review, no new transactions can be posted but existing entries can be modified</li>
                  <li><strong>Closed:</strong> Period is permanently closed, no changes allowed</li>
                  <li>Adjustment periods allow for year-end accruals and corrections</li>
                  <li>All transactions must be posted before closing a period</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}

export default function FiscalYearConfiguration() {
  return (
    <App title="Fiscal Year Configuration">
      <PageContent />
    </App>
  );
}
