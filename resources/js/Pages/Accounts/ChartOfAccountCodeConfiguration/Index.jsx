import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash2, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import App from '../../App.jsx';

export default function ChartOfAccountCodeConfigurationIndex() {
  const { level3Accounts = [], compId, locationId } = usePage().props;
  const [expandedLevel3, setExpandedLevel3] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedLevel3, setSelectedLevel3] = useState(null);
  const [formData, setFormData] = useState({
    account_code: '',
    account_name: '',
    account_type: 'Asset',
    is_transactional: true
  });
  const [errors, setErrors] = useState({});

  const handleSelectLevel3 = (account) => {
    setSelectedLevel3(account);
    setExpandedLevel3(expandedLevel3 === account.id ? null : account.id);
  };

  const handleCreateCode = (level3Account) => {
    setSelectedLevel3(level3Account);
    setShowForm(true);
    setFormData({
      account_code: '',
      account_name: '',
      account_type: level3Account.account_type,
      is_transactional: true
    });
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedLevel3) {
      setErrors({ level3_account_id: 'Please select a Level 3 account' });
      return;
    }

    router.post('/accounts/code-configuration', {
      level3_account_id: selectedLevel3.id,
      account_code: formData.account_code,
      account_name: formData.account_name,
      account_type: formData.account_type,
      is_transactional: formData.is_transactional
    }, {
      onSuccess: () => {
        setShowForm(false);
        setFormData({
          account_code: '',
          account_name: '',
          account_type: 'Asset',
          is_transactional: true
        });
      },
      onError: (errors) => {
        setErrors(errors);
      }
    });
  };

  const handleDeleteCode = (codeId, codeName) => {
    if (confirm(`Are you sure you want to delete account code "${codeName}"?`)) {
      router.delete(`/accounts/code-configuration/${codeId}`, {
        onSuccess: () => {
          // Success handled by flash message
        }
      });
    }
  };

  return (
    <App>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Chart of Account Code Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage Level 4 account codes under Level 3 accounts (IAS 1 Compliance)
          </p>
        </div>

        {/* Information Box */}
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                About Level 4 Accounts
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                Level 4 accounts are the most detailed transactional accounts. Select a Level 3 account (e.g., "Bank Accounts", "Cash") 
                to create specific Level 4 codes such as individual bank accounts or cash locations.
              </p>
              <div className="flex gap-4 text-sm">
                <a href="/accounts/code-configuration/bank" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                  Quick: Bank Accounts →
                </a>
                <a href="/accounts/code-configuration/cash" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                  Quick: Cash Accounts →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Levels 3 Accounts and Their Level 4 Codes */}
        <div className="space-y-4">
          {level3Accounts.length === 0 ? (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No Level 3 accounts found. Please create them in Chart of Accounts first.
              </p>
              <a
                href="/accounts/chart-of-accounts"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Chart of Accounts
              </a>
            </div>
          ) : (
            level3Accounts.map((level3) => (
              <div key={level3.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Level 3 Header */}
                <div
                  className="p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-between"
                  onClick={() => handleSelectLevel3(level3)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <ChevronRight
                      className={`h-5 w-5 text-gray-600 dark:text-gray-400 transition-transform ${
                        expandedLevel3 === level3.id ? 'rotate-90' : ''
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {level3.account_code} - {level3.account_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Type: {level3.account_type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateCode(level3);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded lg:hover:bg-green-700 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Level 4
                  </button>
                </div>

                {/* Level 4 Codes */}
                {expandedLevel3 === level3.id && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    {level3.child_accounts && level3.child_accounts.length > 0 ? (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {level3.child_accounts.map((code, index) => (
                          <div key={code.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-semibold rounded">
                                    L4
                                  </span>
                                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                                    {code.account_code}
                                  </p>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-2">
                                  {code.account_name}
                                </p>
                                <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                                  <span>Type: {code.account_type}</span>
                                  <span>
                                    Status: <span className={code.status === 'Active' ? 'text-green-600' : 'text-red-600'}>
                                      {code.status}
                                    </span>
                                  </span>
                                  {code.is_transactional && (
                                    <span className="flex items-center gap-1 text-green-600">
                                      <CheckCircle className="h-3 w-3" /> Transactional
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleDeleteCode(code.id, code.account_code)}
                                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                  title="Delete code"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No Level 4 codes created yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Form Modal */}
        {showForm && selectedLevel3 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Create Level 4 Code
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Under: <span className="font-semibold">{selectedLevel3.account_code} - {selectedLevel3.account_name}</span>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Code *
                  </label>
                  <input
                    type="text"
                    value={formData.account_code}
                    onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., 1010-01"
                    required
                  />
                  {errors.account_code && <p className="text-red-600 text-xs mt-1">{errors.account_code}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    value={formData.account_name}
                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., HBL - Current Account"
                    required
                  />
                  {errors.account_name && <p className="text-red-600 text-xs mt-1">{errors.account_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Type *
                  </label>
                  <select
                    value={formData.account_type}
                    onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                    <option value="Equity">Equity</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Expense">Expense</option>
                    <option value="Contra-Asset">Contra-Asset</option>
                    <option value="Contra-Revenue">Contra-Revenue</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_transactional"
                    checked={formData.is_transactional}
                    onChange={(e) => setFormData({ ...formData, is_transactional: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="is_transactional" className="text-sm text-gray-700 dark:text-gray-300">
                    This is a transactional account (can post journals)
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
                    Create Code
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
