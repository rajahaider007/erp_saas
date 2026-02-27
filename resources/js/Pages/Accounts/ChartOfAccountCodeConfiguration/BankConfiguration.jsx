import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Plus, Trash2, AlertCircle, DollarSign, Building2, ArrowLeft } from 'lucide-react';
import App from '../../App.jsx';

export default function BankConfiguration() {
  const { bankHead, bankCodes = [], compId, locationId, flash } = usePage().props;
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    bank_name: '',
    account_code: '',
    account_number: '',
    branch: '',
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
        bank_name: '',
        account_code: '',
        account_number: '',
        branch: '',
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
    
    router.post('/accounts/code-configuration/bank', formData, {
      onError: (errors) => {
        setErrors(errors);
      }
    });
  };

  const handleDelete = (codeId, bankName) => {
    if (confirm(`Are you sure you want to delete bank account "${bankName}"?`)) {
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
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Bank Account Code Configuration
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage bank account codes for each bank account
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

        {/* Master Bank Account Info */}
        {bankHead && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Master Account:</strong> {bankHead.account_code} - {bankHead.account_name}
            </p>
          </div>
        )}

        {!bankHead && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-300 mb-2">
                Bank Account Master Not Found
              </p>
              <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                You need to create a "Bank Accounts" head account (Level 3) in Chart of Accounts first.
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
        {bankHead && (
          <div className="mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Bank Account
            </button>
          </div>
        )}

        {/* Bank Accounts List */}
        <div className="space-y-4">
          {bankCodes.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No bank accounts configured yet. Create one to get started.
              </p>
            </div>
          ) : (
            bankCodes.map((code) => (
              <div
                key={code.id}
                className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-semibold rounded">
                        {code.account_code}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {code.account_name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mt-3">
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number</p>
                        <p className="font-mono">{code.short_code || '-'}</p>
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
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                          Transactional
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(code.id, code.account_name)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete bank account"
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
                Create Bank Account
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., HBL - Current Account"
                    required
                  />
                  {errors.bank_name && <p className="text-red-600 text-xs mt-1">{errors.bank_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Code *
                  </label>
                  <input
                    type="text"
                    value={formData.account_code}
                    onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., 1020-001"
                    required
                  />
                  {errors.account_code && <p className="text-red-600 text-xs mt-1">{errors.account_code}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., 1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., Lahore Main Branch"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Currency *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
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
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
