import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  FileText,
  Calendar,
  CheckCircle,
  X,
  Home,
  List,
  DollarSign,
  Calculator,
  AlertCircle
} from 'lucide-react';
import App from '../../App.jsx';
import FloatingCurrencyWidget from '../../../Components/FloatingCurrencyWidget';

// Breadcrumbs Component
const Breadcrumbs = ({ items }) => {
  return (
    <div className="breadcrumbs-themed">
      <nav className="breadcrumbs">
        {items.map((item, index) => (
          <div key={index} className="breadcrumb-item">
            <div className="breadcrumb-item-content">
              {item.icon && (
                <item.icon className={`breadcrumb-icon ${item.href ? 'breadcrumb-icon-link' : 'breadcrumb-icon-current'}`} />
              )}
              {item.href ? (
                <a href={item.href} className="breadcrumb-link-themed">{item.label}</a>
              ) : (
                <span className="breadcrumb-current-themed">{item.label}</span>
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
      <div className="breadcrumbs-description">Navigate through your application modules</div>
    </div>
  );
};

const JournalVoucherCreate = () => {
  const { accounts = [], voucher = null, entries = [], flash, currencies = [], company = null } = usePage().props;
  const isEdit = !!voucher;
  const autoVoucherNumbering = company?.auto_voucher_numbering || false;
  
  const [formData, setFormData] = useState({
    voucher_date: voucher?.voucher_date || new Date().toISOString().split('T')[0],
    voucher_number: voucher?.voucher_number || '',
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

  // Auto-focus on first input
  useEffect(() => {
    const firstInput = document.querySelector('input[type="date"]');
    if (firstInput && !isEdit) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }, [isEdit]);

  // Keyboard navigation helper
  const handleKeyDown = (e, currentIndex, field) => {
    // Enter key to move to next field
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      
      // Find next input field
      const inputs = Array.from(document.querySelectorAll('input:not([disabled]):not([type="submit"]), select, textarea'));
      const currentInputIndex = inputs.indexOf(e.target);
      
      if (currentInputIndex !== -1 && currentInputIndex < inputs.length - 1) {
        inputs[currentInputIndex + 1].focus();
      }
    }
    
    // Alt+A to add new entry
    if (e.altKey && e.key === 'a') {
      e.preventDefault();
      addEntry();
      // Focus on the newly added entry's account field
      setTimeout(() => {
        const lastEntry = document.querySelector(`select[tabindex="${10 + (formData.entries.length * 4) + 1}"]`);
        if (lastEntry) lastEntry.focus();
      }, 100);
    }

    // Ctrl+S to submit
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (!isSubmitting && isBalanced) {
        handleSubmit(e);
      }
    }
  };

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

    // Validate voucher number if manual numbering is enabled
    if (!autoVoucherNumbering && !isEdit) {
      if (!formData.voucher_number || !formData.voucher_number.trim()) {
        newErrors.voucher_number = 'Voucher number is required';
      }
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

  const breadcrumbItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Journal Vouchers', icon: List, href: '/accounts/journal-voucher' },
    { label: isEdit ? 'Edit Journal Voucher' : 'Create Journal Voucher', icon: FileText, href: null }
  ];

  return (
    <App>
      <div>
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Alert Messages */}
        {alert && (
          <div className={`mb-4 p-4 rounded-lg animate-slideIn ${alert.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'}`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {alert.type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <X className="h-5 w-5" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{alert.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form Container */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <form onSubmit={handleSubmit} onKeyDown={(e) => handleKeyDown(e)}>
              {/* Form Header */}
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {isEdit ? 'Edit Journal Voucher' : 'Create Journal Voucher'}
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {isEdit ? 'Update journal voucher information' : 'Use Tab or Enter to navigate, Alt+A to add entry'}
                </p>
              </div>

              {/* Voucher Details Section */}
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Voucher Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Voucher Date *
                    </label>
                    <input
                      type="date"
                      value={formData.voucher_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, voucher_date: e.target.value }))}
                      onKeyDown={handleKeyDown}
                      tabIndex={1}
                      className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.voucher_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {errors.voucher_date && (
                      <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors.voucher_date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Voucher Number {!autoVoucherNumbering && !isEdit && '*'}
                    </label>
                    <input
                      type="text"
                      value={formData.voucher_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, voucher_number: e.target.value }))}
                      onKeyDown={handleKeyDown}
                      placeholder={autoVoucherNumbering ? 'Auto-generated' : 'Enter voucher number'}
                      disabled={autoVoucherNumbering || isEdit}
                      tabIndex={autoVoucherNumbering || isEdit ? -1 : 2}
                      className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        (autoVoucherNumbering || isEdit) ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60' : ''
                      } ${
                        errors.voucher_number ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {autoVoucherNumbering && (
                      <p className="mt-0.5 text-xs text-blue-600 dark:text-blue-400">Auto-generated</p>
                    )}
                    {errors.voucher_number && (
                      <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors.voucher_number}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      value={formData.reference_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter reference number"
                      tabIndex={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Currency
                    </label>
                    <select
                      value={formData.currency_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency_code: e.target.value }))}
                      onKeyDown={handleKeyDown}
                      tabIndex={4}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      {currencies.length > 0 ? (
                        currencies.map((currency) => (
                          <option key={currency.value} value={currency.value}>
                            {currency.symbol} {currency.label}
                          </option>
                        ))
                      ) : (
                        <option value="USD">USD - United States Dollar</option>
                      )}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter voucher description"
                      tabIndex={5}
                      className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Journal Entries Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Journal Entries</h3>
                  <button
                    type="button"
                    onClick={addEntry}
                    title="Add Entry (Alt+A)"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Plus size={16} />
                    Add Entry
                  </button>
                </div>

                {errors.entries && (
                  <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600 dark:text-red-400">{errors.entries}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {formData.entries.map((entry, index) => (
                    <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Entry {index + 1}</h4>
                        {formData.entries.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeEntry(index)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Remove Entry (Delete)"
                            tabIndex={-1}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-3">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Account *
                          </label>
                          <select
                            value={entry.account_id}
                            onChange={(e) => updateEntry(index, 'account_id', e.target.value)}
                            onKeyDown={handleKeyDown}
                            tabIndex={10 + (index * 4) + 1}
                            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors[`entries.${index}.account_id`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
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
                            <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors[`entries.${index}.account_id`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                            onKeyDown={handleKeyDown}
                            onFocus={(e) => e.target.select()}
                            placeholder="0.00"
                            tabIndex={10 + (index * 4) + 2}
                            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors[`entries.${index}.amount`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                            onKeyDown={handleKeyDown}
                            onFocus={(e) => e.target.select()}
                            placeholder="0.00"
                            tabIndex={10 + (index * 4) + 3}
                            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors[`entries.${index}.amount`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={entry.description}
                            onChange={(e) => updateEntry(index, 'description', e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Entry description (optional)"
                            tabIndex={10 + (index * 4) + 4}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      {errors[`entries.${index}.amount`] && (
                        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errors[`entries.${index}.amount`]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary Section */}
              <div className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">Total Debit</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {totalDebit.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">Total Credit</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {totalCredit.toFixed(2)}
                    </span>
                  </div>
                  <div className={`rounded-lg px-2 py-1 ${
                    isBalanced 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">Balance</span>
                    <div className="flex items-center justify-center gap-1.5">
                      {isBalanced ? (
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                      <span className={`text-lg font-bold ${
                        isBalanced ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {Math.abs(totalDebit - totalCredit).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">Tab</kbd> or <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">Enter</kbd> to navigate • 
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 ml-1">Alt+A</kbd> to add entry
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => router.visit('/accounts/journal-voucher')}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                    tabIndex={-1}
                  >
                    <ArrowLeft size={16} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !isBalanced}
                    className="flex items-center gap-1.5 px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {isEdit ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        {isEdit ? 'Update' : 'Create'} <kbd className="ml-1 px-1.5 py-0.5 bg-blue-700 rounded text-xs">Ctrl+S</kbd>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Floating Currency Widget */}
      <FloatingCurrencyWidget />
    </App>
  );
};

export default JournalVoucherCreate;
