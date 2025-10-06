import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Calculator,
  FileText,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  X,
  Database,
  RefreshCcw,
  Download,
  ChevronDown,
  Settings,
  Users,
  TrendingUp
} from 'lucide-react';
import App from '../../App.jsx';

const JournalVoucherCreate = () => {
  const { accounts = [], voucher = null, entries = [], flash } = usePage().props;
  const isEdit = !!voucher;
  
  const [formData, setFormData] = useState({
    voucher_date: voucher?.voucher_date || new Date().toISOString().split('T')[0],
    description: voucher?.description || '',
    reference_number: voucher?.reference_number || '',
    currency_code: voucher?.currency_code || 'USD',
    exchange_rate: voucher?.exchange_rate || 1.0,
    entries: entries.length > 0 ? entries.map(entry => ({
      account_id: entry.account_id,
      description: entry.description || '',
      debit_amount: entry.debit_amount || '',
      credit_amount: entry.credit_amount || ''
    })) : [
      { account_id: '', description: '', debit_amount: '', credit_amount: '' },
      { account_id: '', description: '', debit_amount: '', credit_amount: '' }
    ]
  });
  
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle flash messages
  useEffect(() => {
    if (flash?.success) {
      setAlert({ type: 'success', message: flash.success });
      setTimeout(() => setAlert(null), 5000);
    } else if (flash?.error) {
      setAlert({ type: 'error', message: flash.error });
      setTimeout(() => setAlert(null), 5000);
    }
  }, [flash]);

  // Calculate totals
  const calculateTotals = () => {
    const totalDebit = formData.entries.reduce((sum, entry) => {
      return sum + (parseFloat(entry.debit_amount) || 0);
    }, 0);
    
    const totalCredit = formData.entries.reduce((sum, entry) => {
      return sum + (parseFloat(entry.credit_amount) || 0);
    }, 0);
    
    return { totalDebit, totalCredit };
  };

  const { totalDebit, totalCredit } = calculateTotals();
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  // Add new entry
  const addEntry = () => {
    setFormData(prev => ({
      ...prev,
      entries: [...prev.entries, { account_id: '', description: '', debit_amount: '', credit_amount: '' }]
    }));
  };

  // Remove entry
  const removeEntry = (index) => {
    if (formData.entries.length <= 2) {
      setAlert({ type: 'error', message: 'At least 2 entries are required for double entry' });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      entries: prev.entries.filter((_, i) => i !== index)
    }));
  };

  // Update entry
  const updateEntry = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setAlert(null);

    // Client-side validation
    const newErrors = {};

    if (!formData.voucher_date) {
      newErrors.voucher_date = 'Voucher date is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!isBalanced) {
      newErrors.entries = 'Total debits must equal total credits';
    }

    // Validate entries
    formData.entries.forEach((entry, index) => {
      if (!entry.account_id) {
        newErrors[`entries.${index}.account_id`] = 'Account is required';
      }
      
      const debit = parseFloat(entry.debit_amount) || 0;
      const credit = parseFloat(entry.credit_amount) || 0;
      
      if (debit === 0 && credit === 0) {
        newErrors[`entries.${index}.amount`] = 'Either debit or credit amount is required';
      }
      
      if (debit > 0 && credit > 0) {
        newErrors[`entries.${index}.amount`] = 'Cannot have both debit and credit amounts';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: 'Please correct the errors below' });
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEdit) {
        router.put(`/accounts/journal-voucher/${voucher.id}`, formData, {
          onSuccess: () => {
            setAlert({ type: 'success', message: 'Journal voucher updated successfully!' });
          },
          onError: (errors) => {
            setErrors(errors);
            setAlert({ type: 'error', message: 'Please correct the errors below' });
          },
          onFinish: () => {
            setIsSubmitting(false);
          }
        });
      } else {
        router.post('/accounts/journal-voucher', formData, {
          onSuccess: () => {
            setAlert({ type: 'success', message: 'Journal voucher created successfully!' });
          },
          onError: (errors) => {
            setErrors(errors);
            setAlert({ type: 'error', message: 'Please correct the errors below' });
          },
          onFinish: () => {
            setIsSubmitting(false);
          }
        });
      }
    } catch (error) {
      setAlert({ type: 'error', message: `An error occurred while ${isEdit ? 'updating' : 'creating'} the journal voucher` });
      setIsSubmitting(false);
    }
  };

  return (
    <App>
      <div className="advanced-module-manager">
        {/* Enhanced Header */}
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title">
                <Database className="title-icon" />
                {isEdit ? 'Edit Journal Voucher' : 'Create Journal Voucher'}
              </h1>
              <div className="stats-summary">
                <div className="stat-item">
                  <TrendingUp size={16} />
                  <span>{accounts?.length || 0} Accounts Available</span>
                </div>
                <div className="stat-item">
                  <Users size={16} />
                  <span>{formData.entries?.length || 0} Entries</span>
                </div>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="btn btn-icon"
                onClick={() => router.visit('/accounts/journal-voucher')}
                title="Back to List"
              >
                <ArrowLeft size={20} />
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => router.visit('/accounts/journal-voucher')}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting || !isBalanced}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {isEdit ? 'Update Voucher' : 'Create Voucher'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Voucher Details */}
            <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-sm border border-white/20 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Voucher Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voucher Date *
                </label>
                <input
                  type="date"
                  value={formData.voucher_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, voucher_date: e.target.value }))}
                  className={`w-full px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.voucher_date ? 'border-red-300' : ''
                  }`}
                />
                {errors.voucher_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.voucher_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={formData.reference_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                  placeholder="Enter reference number"
                  className="w-full px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={formData.currency_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency_code: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="PKR">PKR</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exchange Rate
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.exchange_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, exchange_rate: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter voucher description"
                rows={3}
                className={`w-full px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-300' : ''
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>

            {/* Journal Entries */}
            <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-sm border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Journal Entries</h2>
                <button
                  type="button"
                  onClick={addEntry}
                  className="btn btn-primary"
                  style={{ background: '#10B981' }}
                >
                  <Plus size={20} />
                  Add Entry
                </button>
              </div>

            {errors.entries && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.entries}</p>
              </div>
            )}

            <div className="space-y-4">
              {formData.entries.map((entry, index) => (
                <div key={index} className="bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Entry {index + 1}</h3>
                    {formData.entries.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeEntry(index)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account *
                      </label>
                      <select
                        value={entry.account_id}
                        onChange={(e) => updateEntry(index, 'account_id', e.target.value)}
                        className={`w-full px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`entries.${index}.account_id`] ? 'border-red-300' : ''
                        }`}
                      >
                        <option value="">Select Account</option>
                        {accounts.map(account => (
                          <option key={account.id} value={account.id}>
                            {account.account_code} - {account.account_name}
                          </option>
                        ))}
                      </select>
                      {errors[`entries.${index}.account_id`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`entries.${index}.account_id`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Debit Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={entry.debit_amount}
                        onChange={(e) => {
                          updateEntry(index, 'debit_amount', e.target.value);
                          if (e.target.value > 0) {
                            updateEntry(index, 'credit_amount', '');
                          }
                        }}
                        placeholder="0.00"
                        className={`w-full px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`entries.${index}.amount`] ? 'border-red-300' : ''
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Credit Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={entry.credit_amount}
                        onChange={(e) => {
                          updateEntry(index, 'credit_amount', e.target.value);
                          if (e.target.value > 0) {
                            updateEntry(index, 'debit_amount', '');
                          }
                        }}
                        placeholder="0.00"
                        className={`w-full px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`entries.${index}.amount`] ? 'border-red-300' : ''
                        }`}
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={entry.description}
                      onChange={(e) => updateEntry(index, 'description', e.target.value)}
                      placeholder="Enter entry description"
                      className="w-full px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {errors[`entries.${index}.amount`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`entries.${index}.amount`]}</p>
                  )}
                </div>
              ))}
            </div>
            </div>

            {/* Totals Summary */}
            <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-sm border border-white/20 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Totals Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/40 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Debit</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formData.currency_code} {totalDebit.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="bg-white/40 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Credit</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formData.currency_code} {totalCredit.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className={`rounded-lg p-4 border border-white/30 backdrop-blur-sm ${
                isBalanced ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Balance</span>
                  <div className="flex items-center">
                    {isBalanced ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <X className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <span className={`text-lg font-semibold ${
                      isBalanced ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formData.currency_code} {(totalDebit - totalCredit).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </App>
  );
};

export default JournalVoucherCreate;
