import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Plus, Trash2, AlertCircle, Coins, ArrowLeft } from 'lucide-react';
import App from '../../App.jsx';

export default function CashConfiguration() {
  const { cashHead, cashCodes = [], compId, locationId, flash } = usePage().props;
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cash_location: '',
    account_code: '',
    custodian: '',
    currency: 'PKR',
    is_transactional: true
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (flash?.success) {
      setAlert({ type: 'success', message: flash.success });
      setShowForm(false);
      setFormData({
        cash_location: '',
        account_code: '',
        custodian: '',
        currency: 'PKR',
        is_transactional: true
      });
      setTimeout(() => setAlert(null), 5000);
    } else if (flash?.error) {
      setAlert({ type: 'error', message: flash.error });
      setTimeout(() => setAlert(null), 5000);
    }
  }, [flash]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    router.post('/accounts/code-configuration/cash', formData, {
      onError: (errors) => {
        setErrors(errors);
      }
    });
  };

  const handleDelete = (codeId, cashLocation) => {
    if (confirm(`Are you sure you want to delete cash account "${cashLocation}"?`)) {
      router.delete(`/accounts/code-configuration/${codeId}`);
    }
  };

  return (
    <App>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.visit('/accounts/code-configuration')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Code Configuration
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Coins className="h-8 w-8 text-yellow-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Cash Account Code Configuration
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage cash account codes for different locations or custodians
          </p>
        </div>

        {/* Alert Messages */}
        {alert && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              alert.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
            }`}
          >
            {alert.message}
          </div>
        )}

        {/* Master Cash Account Info */}
        {cashHead && (
          <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Master Account:</strong> {cashHead.account_code} - {cashHead.account_name}
            </p>
          </div>
        )}

        {!cashHead && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-300 mb-2">
                Cash Account Master Not Found
              </p>
              <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                You need to create a "Cash Accounts" head account (Level 3) in Chart of Accounts first.
              </p>
              <a
                href="/accounts/chart-of-accounts"
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Go to Chart of Accounts
              </a>
            </div>
          </div>
        )}

        {/* Create Button */}
        {cashHead && (
          <div className="mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Cash Account
            </button>
          </div>
        )}

        {/* Cash Accounts List */}
        <div className="space-y-4">
          {cashCodes.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No cash accounts configured yet. Create one to get started.
              </p>
            </div>
          ) : (
            cashCodes.map((code) => (
              <div
                key={code.id}
                className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-sm font-semibold rounded">
                        {code.account_code}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {code.account_name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mt-3">
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Custodian</p>
                        <p>{code.short_code || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</p>
                        <p>{code.currency}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-3 text-xs">
                      <span className={`px-2 py-1 rounded ${
                        code.status === 'Active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                        {code.status}
                      </span>
                      {code.is_transactional && (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded">
                          Transactional
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(code.id, code.account_name)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete cash account"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Create Cash Account
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cash Location/Description *
                  </label>
                  <input
                    type="text"
                    value={formData.cash_location}
                    onChange={(e) => setFormData({ ...formData, cash_location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    placeholder="e.g., Office Cash Box - Lahore"
                    required
                  />
                  {errors.cash_location && <p className="text-red-600 text-xs mt-1">{errors.cash_location}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Code *
                  </label>
                  <input
                    type="text"
                    value={formData.account_code}
                    onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    placeholder="e.g., 1010-001"
                    required
                  />
                  {errors.account_code && <p className="text-red-600 text-xs mt-1">{errors.account_code}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Custodian / Responsible Person
                  </label>
                  <input
                    type="text"
                    value={formData.custodian}
                    onChange={(e) => setFormData({ ...formData, custodian: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    placeholder="e.g., Ali Ahmed"
                  />
                  {errors.custodian && <p className="text-red-600 text-xs mt-1">{errors.custodian}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Currency *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  >
                    <option value="PKR">PKR - Pakistani Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_transactional"
                    checked={formData.is_transactional}
                    onChange={(e) => setFormData({ ...formData, is_transactional: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="is_transactional" className="text-sm text-gray-700 dark:text-gray-300">
                    This account accepts transactions
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setErrors({});
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </App>
  );
}
