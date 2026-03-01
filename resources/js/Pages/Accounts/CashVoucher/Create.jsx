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
import FloatingCurrencyWidget from '../../../Components/FloatingCurrencyWidget.jsx';
import Select2 from '../../../Components/Select2.jsx';
import CustomDatePicker from '../../../Components/DatePicker/DatePicker.jsx';
import StorageWarning from '../../../Components/StorageWarning.jsx';

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

const CashVoucherCreate = () => {
  const { accounts = [], CashAccounts = [], voucher = null, entries = [], flash, currencies = [], company = null, preview_voucher_number = null, preview_voucher_numbers = {}, attachments: initialAttachments = [], currentPeriod = null } = usePage().props;
  const isEdit = !!voucher;
  const autoVoucherNumbering = true; // Always auto-generate voucher numbers
  const getAutoVoucherNumberByType = (type) => {
    if (type === 'Cash Payment') {
      return preview_voucher_numbers?.['Cash Payment'] || 'CPV0001';
    }

    if (type === 'Cash Receipt') {
      return preview_voucher_numbers?.['Cash Receipt'] || 'CRV0001';
    }

    return preview_voucher_number || '';
  };

  const defaultVoucherType = voucher?.voucher_sub_type || 'Cash Payment';
  const defaultPreviewVoucherNumber = getAutoVoucherNumberByType(defaultVoucherType);
  
  const [formData, setFormData] = useState({
    voucher_date: voucher?.voucher_date || new Date().toISOString().split('T')[0],
    voucher_number: voucher?.voucher_number || defaultPreviewVoucherNumber,
    voucher_sub_type: defaultVoucherType,
    Cash_account_id: voucher?.Cash_account_id || '',
    description: voucher?.description || '',
    reference_number: voucher?.reference_number || '',
    base_currency_code: company?.default_currency_code || 'PKR',
    entries: entries.length > 0 ? entries.map(entry => ({
      account_id: entry.account_id,
      description: entry.description || '',
      amount: (entry.debit_amount && parseFloat(entry.debit_amount) > 0)
        ? parseFloat(entry.debit_amount)
        : (entry.credit_amount && parseFloat(entry.credit_amount) > 0 ? parseFloat(entry.credit_amount) : null),
      currency_code: entry.currency_code || company?.default_currency_code || 'PKR',
      exchange_rate: entry.exchange_rate || 1.0,
      base_amount: (entry.base_debit_amount && parseFloat(entry.base_debit_amount) > 0)
        ? parseFloat(entry.base_debit_amount)
        : (entry.base_credit_amount && parseFloat(entry.base_credit_amount) > 0 ? parseFloat(entry.base_credit_amount) : null),
      attachment: entry.attachment || null
    })) : [
      { 
        account_id: null, 
        description: '', 
        amount: null,
        currency_code: company?.default_currency_code || 'PKR',
        exchange_rate: 1.0,
        base_amount: null,
        attachment: null
      }
    ]
  });
  
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingExchangeRate, setIsLoadingExchangeRate] = useState(false);
  const [exchangeRateSource, setExchangeRateSource] = useState('manual');
  const [attachments, setAttachments] = useState(() => {
    // Use initialAttachments from props if available (for edit mode)
    if (initialAttachments && Array.isArray(initialAttachments) && initialAttachments.length > 0) {
      console.log('Initializing attachments from props:', initialAttachments);
      return initialAttachments;
    }
    
    // Fallback to voucher.attachments if available
    if (!voucher?.attachments) return [];
    
    console.log('Initializing attachments from voucher:', { 
      type: typeof voucher.attachments, 
      value: voucher.attachments,
      isArray: Array.isArray(voucher.attachments)
    });
    
    // If it's a string, try to parse it as JSON
    if (typeof voucher.attachments === 'string') {
      try {
        const parsed = JSON.parse(voucher.attachments);
        console.log('Parsed attachments JSON:', parsed);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.warn('Failed to parse attachments JSON:', e);
        return [];
      }
    }
    
    // If it's already an array, return it
    return Array.isArray(voucher.attachments) ? voucher.attachments : [];
  });
  const [uploadingAttachments, setUploadingAttachments] = useState(false);

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
      if (!isSubmitting && isReadyToSubmit) {
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

  useEffect(() => {
    if (!isEdit && autoVoucherNumbering) {
      const nextVoucherNumber = getAutoVoucherNumberByType(formData.voucher_sub_type);
      if (nextVoucherNumber && formData.voucher_number !== nextVoucherNumber) {
        setFormData(prev => ({ ...prev, voucher_number: nextVoucherNumber }));
      }
    }
  }, [formData.voucher_sub_type, isEdit]);

  // Fetch exchange rate from API for specific entry
  const fetchExchangeRateForEntry = async (entryIndex, currencyCode) => {
    if (currencyCode === formData.base_currency_code) {
      updateEntry(entryIndex, 'exchange_rate', 1.0);
      return;
    }

    setIsLoadingExchangeRate(true);
    try {
      const response = await fetch(`/api/exchange-rate/${formData.base_currency_code}/${currencyCode}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.rate) {
          updateEntry(entryIndex, 'exchange_rate', data.rate);
          setAlert({ type: 'success', message: `Exchange rate updated for entry ${entryIndex + 1}: ${data.rate}` });
        } else {
          setAlert({ type: 'error', message: 'Failed to fetch exchange rate from API' });
        }
      } else {
        setAlert({ type: 'error', message: 'Failed to fetch exchange rate from API' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Error fetching exchange rate: ' + error.message });
    } finally {
      setIsLoadingExchangeRate(false);
    }
  };

  // Handle attachment upload
  const handleAttachmentUpload = async (files) => {
    console.log('Starting file upload process:', files);
    const maxSize = 300 * 1024; // 300KB
    const validFiles = [];
    const invalidFiles = [];

    // Validate files
    for (let file of files) {
      console.log('Validating file:', file.name, 'Size:', file.size, 'Type:', file.type);
      if (file.size > maxSize) {
        invalidFiles.push(`${file.name} (${(file.size / 1024).toFixed(1)}KB - exceeds 300KB limit)`);
      } else {
        validFiles.push(file);
      }
    }

    if (invalidFiles.length > 0) {
      setAlert({ type: 'error', message: `Files too large: ${invalidFiles.join(', ')}` });
      return;
    }

    if (validFiles.length === 0) {
      console.log('No valid files to upload');
      return;
    }

    console.log('Valid files to upload:', validFiles);

    setUploadingAttachments(true);
    try {
      const formData = new FormData();
      validFiles.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });

      const response = await fetch('/api/upload-attachments', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Upload response:', data);
        setAttachments(prev => {
          const currentAttachments = Array.isArray(prev) ? prev : [];
          const newAttachments = Array.isArray(data.attachments) ? data.attachments : [];
          return [...currentAttachments, ...newAttachments];
        });
                        setAlert({ type: 'success', message: `${validFiles.length} attachment(s) uploaded successfully` });
                        
                        // Clear the file input
                        const fileInput = document.getElementById('attachment-upload');
                        if (fileInput) {
                          fileInput.value = '';
                        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Upload failed:', errorData);
        setAlert({ type: 'error', message: errorData.message || 'Failed to upload attachments' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Error uploading attachments: ' + error.message });
    } finally {
      setUploadingAttachments(false);
    }
  };

  // Remove attachment
  const removeAttachment = (attachmentId) => {
    setAttachments(prev => {
      if (!Array.isArray(prev)) return [];
      // Handle both object attachments and string filenames
      if (typeof attachmentId === 'string' && !prev.some(att => att.id === attachmentId)) {
        // If attachmentId is a filename, filter by filename
        return prev.filter(att => att !== attachmentId && att.original_name !== attachmentId);
      }
      return prev.filter(att => att && att.id !== attachmentId);
    });
  };

  // Handle entry attachment upload
  const handleEntryAttachmentUpload = async (entryIndex, files) => {
    console.log('Starting entry attachment upload for entry:', entryIndex, files);
    const maxSize = 300 * 1024; // 300KB
    const validFiles = [];
    const invalidFiles = [];

    // Validate files
    for (let file of files) {
      console.log('Validating file:', file.name, 'Size:', file.size, 'Type:', file.type);
      if (file.size > maxSize) {
        invalidFiles.push(`${file.name} (${(file.size / 1024).toFixed(1)}KB - exceeds 300KB limit)`);
      } else {
        validFiles.push(file);
      }
    }

    if (invalidFiles.length > 0) {
      setAlert({ type: 'error', message: `Files too large: ${invalidFiles.join(', ')}` });
      return;
    }

    if (validFiles.length === 0) {
      console.log('No valid files to upload');
      return;
    }

    // Only allow one file per entry
    if (validFiles.length > 1) {
      setAlert({ type: 'error', message: 'Only one attachment per entry is allowed' });
      return;
    }

    console.log('Valid file to upload:', validFiles[0]);

    try {
      const formData = new FormData();
      formData.append('attachment', validFiles[0]);

      const response = await fetch('/api/upload-attachments', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Entry upload response:', data);
        
        // Update the specific entry with the attachment
        setFormData(prev => ({
          ...prev,
          entries: prev.entries.map((entry, index) => 
            index === entryIndex 
              ? { ...entry, attachment: data.attachments && data.attachments[0] ? data.attachments[0] : null }
              : entry
          )
        }));
        
        setAlert({ type: 'success', message: 'Attachment uploaded successfully for this entry' });
        
        // Clear the file input
        const fileInput = document.getElementById(`entry-attachment-${entryIndex}`);
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Entry upload failed:', errorData);
        setAlert({ type: 'error', message: errorData.message || 'Failed to upload attachment' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Error uploading attachment: ' + error.message });
    }
  };

  // Remove entry attachment
  const removeEntryAttachment = (entryIndex) => {
    setFormData(prev => ({
      ...prev,
      entries: prev.entries.map((entry, index) => 
        index === entryIndex 
          ? { ...entry, attachment: null }
          : entry
      )
    }));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate base currency amount for specific entry
  const calculateBaseAmountForEntry = (amount, exchangeRate) => {
    if (!amount || amount === '') return '';
    // Exchange rate is stored as base_currency/foreign_currency, so we need to invert it
    // If exchange rate is 0.00353 (PKR/USD), then 1 USD = 1/0.00353 = 283.286119 PKR
    const baseAmount = parseFloat(amount) * (1/exchangeRate);
    return baseAmount.toFixed(2);
  };

  // Update entry with base currency amount
  const updateEntryWithBaseAmount = (index, field, value) => {
    const entry = formData.entries[index];
    const baseAmount = calculateBaseAmountForEntry(value, entry.exchange_rate);
    
    setFormData(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => 
        i === index ? { 
          ...entry, 
          [field]: value === '' ? null : value,
          base_amount: baseAmount === '' ? null : baseAmount
        } : entry
      )
    }));
  };

  // Handle amount input events (onChange, onInput, onPaste)
  const handleAmountInput = (index, field, value) => {
    updateEntryWithBaseAmount(index, field, value);
  };

  // Handle paste events with delay to ensure value is processed
  const handlePaste = (index, field, event) => {
    setTimeout(() => {
      handleAmountInput(index, field, event.target.value);
    }, 10);
  };

  // Handle exchange rate input events
  const handleExchangeRateInput = (index, value) => {
    const newRate = parseFloat(value) || 0;
    updateEntry(index, 'exchange_rate', newRate);
    
    // Recalculate base amount when exchange rate changes
    const entry = formData.entries[index];
    if (entry.amount) {
      updateEntryWithBaseAmount(index, 'amount', entry.amount);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const totalAmount = formData.entries.reduce((sum, entry) => {
      return sum + (parseFloat(entry.amount) || 0);
    }, 0);

    const totalBaseAmount = formData.entries.reduce((sum, entry) => {
      return sum + (parseFloat(entry.base_amount) || 0);
    }, 0);

    return { totalAmount, totalBaseAmount };
  };

  const { totalAmount, totalBaseAmount } = calculateTotals();
  const isReadyToSubmit = !!formData.Cash_account_id && formData.entries.length >= 1 && totalBaseAmount > 0;

  // Add new entry
  const addEntry = () => {
    setFormData(prev => ({
      ...prev,
      entries: [...prev.entries, { 
        account_id: null, 
        description: '', 
        amount: null,
        currency_code: formData.base_currency_code,
        exchange_rate: 1.0,
        base_amount: null,
        attachment: null
      }]
    }));
  };

  // Remove entry
  const removeEntry = (index) => {
    if (formData.entries.length <= 1) {
      setAlert({ type: 'error', message: 'At least 1 detail entry is required' });
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

    // Debug: Log form data

    // Client-side validation
    console.log('Starting form submission validation...');
    console.log('Form data:', formData);
    console.log('Entries:', formData.entries);
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

    // Description is optional - no validation needed

    if (!formData.voucher_sub_type) {
      newErrors.voucher_sub_type = 'Voucher type is required';
    }

    if (!formData.Cash_account_id) {
      newErrors.Cash_account_id = 'Cash account is required';
    }

    if (totalBaseAmount <= 0) {
      newErrors.entries = 'At least one detail amount is required';
    }

    // Validate entries
    formData.entries.forEach((entry, index) => {
      console.log(`Validating entry ${index}:`, entry);
      
      if (!entry.account_id) {
        newErrors[`entries.${index}.account_id`] = 'Account is required';
        console.log(`Entry ${index}: Missing account_id`);
      }
      
      if (!entry.currency_code) {
        newErrors[`entries.${index}.currency_code`] = 'Currency is required';
        console.log(`Entry ${index}: Missing currency_code`);
      }
      
      if (!entry.exchange_rate || entry.exchange_rate <= 0) {
        newErrors[`entries.${index}.exchange_rate`] = 'Valid exchange rate is required';
        console.log(`Entry ${index}: Invalid exchange_rate:`, entry.exchange_rate);
      }
      
      const amount = parseFloat(entry.amount) || 0;
      
      console.log(`Entry ${index} amount:`, { amount });
      
      if (amount <= 0) {
        newErrors[`entries.${index}.amount`] = 'Amount is required';
      }
      
      if (formData.Cash_account_id && parseInt(entry.account_id) === parseInt(formData.Cash_account_id)) {
        newErrors[`entries.${index}.account_id`] = 'Detail account cannot be the selected Cash account';
      }
    });

    console.log('Validation errors:', newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation failed, errors:', newErrors);
      setErrors(newErrors);
      setAlert({ type: 'error', message: 'Please correct the errors below' });
      setIsSubmitting(false);
      return;
    }

    console.log('Client-side validation passed, preparing to submit...');
    

    try {
      // Debug: Log attachment state before submission
      console.log('Attachments state before submission:', attachments);
      console.log('Is array?', Array.isArray(attachments));
      console.log('Length:', attachments?.length);
      
      const submitData = {
        ...formData,
        voucher_number: (!isEdit && autoVoucherNumbering)
          ? getAutoVoucherNumberByType(formData.voucher_sub_type)
          : formData.voucher_number,
        Cash_account_id: formData.Cash_account_id ? parseInt(formData.Cash_account_id) : null,
        entries: formData.entries.map(entry => ({
          ...entry,
          account_id: entry.account_id ? parseInt(entry.account_id) : null,
          amount: entry.amount !== null && entry.amount !== '' ? parseFloat(entry.amount) : null,
          exchange_rate: entry.exchange_rate ? parseFloat(entry.exchange_rate) : 1.0,
          currency_code: entry.currency_code || formData.base_currency_code,
          base_amount: entry.base_amount !== null && entry.base_amount !== '' ? parseFloat(entry.base_amount) : null,
          attachment_id: entry.attachment ? entry.attachment.id : null
        })),
        attachments: Array.isArray(attachments) && attachments.length > 0 ? attachments.map(att => att.id || att) : []
      };
      
      console.log('Submit data attachments:', submitData.attachments);


      if (isEdit) {
        router.put(`/accounts/cash-voucher/${voucher.id}`, submitData, {
          onSuccess: () => {
            setAlert({ type: 'success', message: 'Cash voucher updated successfully!' });
            
            // Don't redirect automatically - let user see the success message
            // setTimeout(() => {
            //   router.visit('/accounts/journal-voucher');
            // }, 2000);
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
        router.post('/accounts/cash-voucher', submitData, {
          onSuccess: () => {
            console.log('Form submitted successfully!');
            setAlert({ type: 'success', message: 'Cash voucher created successfully!' });
            
            // Don't redirect automatically - let user see the success message
            // setTimeout(() => {
            //   router.visit('/accounts/journal-voucher');
            // }, 2000);
          },
          onError: (errors) => {
            console.log('Server validation errors:', errors);
            setErrors(errors);
            setAlert({ type: 'error', message: 'Please correct the errors below' });
          },
          onFinish: () => {
            setIsSubmitting(false);
          }
        });
      }
    } catch (error) {
      setAlert({ type: 'error', message: `An error occurred while ${isEdit ? 'updating' : 'creating'} the Cash voucher` });
      setIsSubmitting(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Cash Vouchers', icon: List, href: '/accounts/cash-voucher' },
    { label: isEdit ? 'Edit Cash Voucher' : 'Create Cash Voucher', icon: FileText, href: null }
  ];

  return (
    <App>
      <div>
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Storage Warning */}
        {company && (
          <StorageWarning 
            companyId={company.id} 
            showDetails={false}
          />
        )}

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

        {/* Period Status Alert */}
        {currentPeriod && (
          <div className={`mb-4 p-4 rounded-lg border ${
            currentPeriod.status === 'Open' 
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
              : currentPeriod.status === 'Locked'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
          }`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {currentPeriod.status === 'Open' && <CheckCircle className="h-5 w-5" />}
                {currentPeriod.status === 'Locked' && <AlertCircle className="h-5 w-5" />}
                {currentPeriod.status === 'Closed' && <X className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-1">
                  Accounting Period: {currentPeriod.period_name} (FY {currentPeriod.fiscal_year})
                </h3>
                <p className="text-sm mb-2">
                  <strong>Status:</strong> {currentPeriod.status}
                  {currentPeriod.is_adjustment_period && ' (Adjustment Period)'}
                </p>
                <p className="text-xs">
                  {currentPeriod.status === 'Open' && 'This period is active. You can create and post new transactions.'}
                  {currentPeriod.status === 'Locked' && 'This period is under review. You cannot post new transactions, but you can modify existing entries.'}
                  {currentPeriod.status === 'Closed' && 'This period is permanently closed. No transactions can be posted or modified without administrator intervention.'}
                </p>
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
                  {isEdit ? 'Edit Cash Voucher' : 'Create Cash Voucher'}
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {isEdit ? 'Update Cash voucher information' : 'Use Tab or Enter to navigate, Alt+A to add detail entry'}
                </p>
              </div>

              {/* Voucher Details and Attachments - Two Column Layout */}
              <div className="mb-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Voucher Details - Left Side */}
                  <div className="lg:col-span-2">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Cash Voucher Master</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="voucher_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Voucher Date *
                        </label>
                        <CustomDatePicker
                          selected={formData.voucher_date ? new Date(formData.voucher_date) : null}
                          onChange={(date) => setFormData(prev => ({ ...prev, voucher_date: date ? date.toISOString().split('T')[0] : '' }))}
                          type="date"
                          placeholder="Select voucher date"
                          className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.voucher_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                          required
                        />
                        {errors.voucher_date && (
                          <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors.voucher_date}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="voucher_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Voucher Number {!autoVoucherNumbering && !isEdit && '*'}
                        </label>
                        <input
                          type="text"
                          id="voucher_number"
                          name="voucher_number"
                          value={formData.voucher_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, voucher_number: e.target.value }))}
                          onKeyDown={handleKeyDown}
                          placeholder={autoVoucherNumbering ? (formData.voucher_number || 'Auto-generated') : 'Enter voucher number'}
                          disabled={autoVoucherNumbering || isEdit}
                          tabIndex={autoVoucherNumbering || isEdit ? -1 : 2}
                          className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            (autoVoucherNumbering || isEdit) ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60' : ''
                          } ${
                            errors.voucher_number ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                        {autoVoucherNumbering && (
                          <p className="mt-0.5 text-xs text-blue-600 dark:text-blue-400">
                            {formData.voucher_number ? `Voucher Number: ${formData.voucher_number}` : 'Auto-generated'}
                          </p>
                        )}
                        {errors.voucher_number && (
                          <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors.voucher_number}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="voucher_sub_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Voucher Type *
                        </label>
                        <select
                          id="voucher_sub_type"
                          name="voucher_sub_type"
                          value={formData.voucher_sub_type}
                          onChange={(e) => {
                            const selectedType = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              voucher_sub_type: selectedType,
                              voucher_number: isEdit
                                ? prev.voucher_number
                                : getAutoVoucherNumberByType(selectedType)
                            }));
                          }}
                          className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.voucher_sub_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <option value="Cash Payment">Cash Payment</option>
                          <option value="Cash Receipt">Cash Receipt</option>
                        </select>
                        {errors.voucher_sub_type && (
                          <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors.voucher_sub_type}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Cash Account *
                        </label>
                        <Select2
                          options={CashAccounts.map(account => ({
                            value: account.id,
                            label: `${account.account_code} - ${account.account_name}`,
                            subtext: account.account_type
                          }))}
                          value={formData.Cash_account_id || ''}
                          onChange={(selectedCashId) => setFormData(prev => ({ ...prev, Cash_account_id: selectedCashId }))}
                          placeholder="Search and select Cash account..."
                          name="Cash_account_id"
                          id="Cash_account_id"
                          error={errors.Cash_account_id}
                        />
                        {errors.Cash_account_id && (
                          <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors.Cash_account_id}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="reference_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Reference Number
                        </label>
                        <input
                          type="text"
                          id="reference_number"
                          name="reference_number"
                          value={formData.reference_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                          onKeyDown={handleKeyDown}
                          placeholder="Enter reference number"
                          tabIndex={3}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          onKeyDown={handleKeyDown}
                          placeholder="Enter voucher description"
                          rows={3}
                          tabIndex={5}
                          maxLength={250}
                          className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical ${
                            errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          }`}
                        />
                        <div className="flex justify-between items-center mt-1">
                          <div>
                            {errors.description && (
                              <p className="text-xs text-red-600 dark:text-red-400">{errors.description}</p>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <span className={formData.description.length > 200 ? 'text-orange-500' : formData.description.length > 230 ? 'text-red-500' : ''}>
                              {formData.description.length}
                            </span>
                            /250 characters
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attachments - Right Side */}
                  <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        Attachments
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                          <input
                            type="file"
                            multiple
                            onChange={(e) => handleAttachmentUpload(Array.from(e.target.files))}
                            className="hidden"
                            id="attachment-upload"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                          />
                          <label
                            htmlFor="attachment-upload"
                            className="cursor-pointer flex flex-col items-center justify-center py-4"
                          >
                            {uploadingAttachments ? (
                              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                <span className="text-sm">Uploading...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Click to upload files</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Max 300KB each</p>
                                </div>
                              </div>
                            )}
                          </label>
                        </div>
                        
                        {/* Media type information */}
                        <div className="mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            <strong>Supported formats:</strong> PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG, GIF
                          </span>
                        </div>

                        {/* Display uploaded attachments */}
                        {Array.isArray(attachments) && attachments.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploaded Files:</h4>
                            {attachments.map((attachment, idx) => (
                              <div key={attachment.id || attachment.original_name || attachment || idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded flex-shrink-0">
                                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{attachment.original_name || attachment}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{attachment.size ? formatFileSize(attachment.size) : ''}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <a
                                    href={attachment.url || `/storage/voucher-attachments/${attachment}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                                    title="View file"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => removeAttachment(attachment.id || attachment)}
                                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                    title="Remove file"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* Cash Detail Entries Section - Full Width */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Cash Detail Entries</h3>
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
                        {formData.entries.length > 1 && (
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

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Account *
                          </label>
                          <Select2
                            options={accounts
                              .filter(account => parseInt(account.id) !== parseInt(formData.Cash_account_id || 0))
                              .map(account => ({
                              value: account.id,
                              label: `${account.account_code} - ${account.account_name}`,
                              subtext: account.account_type
                            }))}
                            value={entry.account_id || ''}
                            onChange={(selectedAccountId) => {
                              updateEntry(index, 'account_id', selectedAccountId);
                              
                              // Auto-set currency based on account selection
                              if (selectedAccountId) {
                                const selectedAccount = accounts.find(acc => acc.id == selectedAccountId);
                                if (selectedAccount && selectedAccount.currency) {
                                  updateEntry(index, 'currency_code', selectedAccount.currency);
                                  // Fetch exchange rate if currency is different from base currency
                                  if (selectedAccount.currency !== formData.base_currency_code) {
                                    fetchExchangeRateForEntry(index, selectedAccount.currency);
                                  } else {
                                    updateEntry(index, 'exchange_rate', 1.0);
                                  }
                                }
                              }
                            }}
                            placeholder="Search and select account..."
                            name={`account_id_${index}`}
                            id={`account_id_${index}`}
                            tabIndex={10 + (index * 6) + 1}
                            onKeyDown={handleKeyDown}
                            error={errors[`entries.${index}.account_id`]}
                          />
                          {errors[`entries.${index}.account_id`] && (
                            <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors[`entries.${index}.account_id`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Currency
                          </label>
                          <Select2
                            options={currencies.length > 0 ? currencies.map(currency => ({
                              value: currency.value,
                              label: `${currency.symbol} ${currency.label}`,
                              subtext: currency.value
                            })) : [{ value: 'USD', label: '$ USD - United States Dollar', subtext: 'USD' }]}
                            value={entry.currency_code}
                            onChange={(selectedCurrency) => {
                              updateEntry(index, 'currency_code', selectedCurrency);
                              if (selectedCurrency !== formData.base_currency_code) {
                                fetchExchangeRateForEntry(index, selectedCurrency);
                              } else {
                                updateEntry(index, 'exchange_rate', 1.0);
                              }
                            }}
                            placeholder="Search and select currency..."
                            name={`currency_code_${index}`}
                            id={`currency_code_${index}`}
                            tabIndex={10 + (index * 6) + 2}
                            onKeyDown={handleKeyDown}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Exchange Rate
                          </label>
                          <div className="flex gap-1">
                            <input
                              type="number"
                              step="0.000001"
                              value={entry.exchange_rate}
                              onChange={(e) => handleExchangeRateInput(index, e.target.value)}
                              onInput={(e) => handleExchangeRateInput(index, e.target.value)}
                              onPaste={(e) => setTimeout(() => handleExchangeRateInput(index, e.target.value), 10)}
                              onKeyDown={handleKeyDown}
                              tabIndex={10 + (index * 6) + 3}
                              className="flex-1 px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="1.000000"
                            />
                            <button
                              type="button"
                              onClick={() => fetchExchangeRateForEntry(index, entry.currency_code)}
                              disabled={isLoadingExchangeRate || entry.currency_code === formData.base_currency_code}
                              className="px-2 py-2 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center"
                              title="Fetch current exchange rate"
                            >
                              {isLoadingExchangeRate ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : (
                                <Calculator size={12} />
                              )}
                            </button>
                          </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {entry.currency_code !== formData.base_currency_code ? (
                                `1 ${entry.currency_code} = ${(1/entry.exchange_rate).toFixed(6)} ${formData.base_currency_code}`
                              ) : (
                                'Base currency'
                              )}
                            </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Amount ({entry.currency_code}) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={entry.amount || ''}
                            onChange={(e) => handleAmountInput(index, 'amount', e.target.value)}
                            onInput={(e) => handleAmountInput(index, 'amount', e.target.value)}
                            onPaste={(e) => handlePaste(index, 'amount', e)}
                            onKeyDown={handleKeyDown}
                            onFocus={(e) => e.target.select()}
                            placeholder="0.00"
                            tabIndex={10 + (index * 6) + 4}
                            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                              errors[`entries.${index}.amount`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                          />
                          {entry.amount && entry.currency_code !== formData.base_currency_code && (
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Base: {entry.base_amount} {formData.base_currency_code}
                            </div>
                          )}
                        </div>



                        <div className="md:col-span-4">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={entry.description}
                            onChange={(e) => updateEntry(index, 'description', e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Entry description (optional)"
                            tabIndex={10 + (index * 6) + 6}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>

                        {/* Entry Attachment Section */}
                        <div className="md:col-span-4">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Attachment (Optional)
                          </label>
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3">
                            <input
                              type="file"
                              onChange={(e) => handleEntryAttachmentUpload(index, Array.from(e.target.files))}
                              className="hidden"
                              id={`entry-attachment-${index}`}
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                            />
                            <label
                              htmlFor={`entry-attachment-${index}`}
                              className="cursor-pointer flex flex-col items-center justify-center py-2"
                            >
                              {entry.attachment ? (
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded flex-shrink-0">
                                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{entry.attachment.original_name}</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(entry.attachment.size)}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <a
                                      href={entry.attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                                      title="View file"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => removeEntryAttachment(index)}
                                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                      title="Remove file"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100">Click to upload attachment</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Max 300KB - One file per entry</p>
                                  </div>
                                </div>
                              )}
                            </label>
                          </div>
                          <div className="mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              <strong>Supported:</strong> PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG, GIF
                            </span>
                          </div>
                        </div>
                      </div>

                      {errors[`entries.${index}.amount`] && (
                        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{errors[`entries.${index}.amount`]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>


              {/* Totals Summary Section - Full Width */}
              <div className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Base Currency Summary ({formData.base_currency_code})
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">Detail Total</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {totalBaseAmount.toFixed(2)} {formData.base_currency_code}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">Voucher Type</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formData.voucher_sub_type}
                      </span>
                    </div>
                    <div className="rounded-lg px-2 py-1 bg-green-100 dark:bg-green-900/30">
                      <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">Auto Cash Contra</span>
                      <div className="flex items-center justify-center gap-1.5">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          {totalBaseAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Show currency breakdown */}
                {(() => {
                  const currencyBreakdown = {};
                  formData.entries.forEach(entry => {
                    if (entry.currency_code && !currencyBreakdown[entry.currency_code]) {
                      currencyBreakdown[entry.currency_code] = { amount: 0 };
                    }
                    if (entry.currency_code) {
                      currencyBreakdown[entry.currency_code].amount += parseFloat(entry.amount) || 0;
                    }
                  });

                  return Object.keys(currencyBreakdown).length > 1 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Multi-Currency Breakdown
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(currencyBreakdown).map(([currency, amounts]) => (
                          <div key={currency} className="grid grid-cols-2 gap-3 text-center text-sm">
                            <div>
                              <span className="block text-xs font-medium text-gray-600 dark:text-gray-400">Amount</span>
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {amounts.amount.toFixed(2)} {currency}
                              </span>
                            </div>
                            <div className="rounded px-2 py-1 bg-green-100 dark:bg-green-900/30">
                              <span className="block text-xs font-medium text-gray-600 dark:text-gray-400">Auto Contra</span>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                {amounts.amount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
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
                    onClick={() => router.visit('/accounts/cash-voucher')}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                    tabIndex={-1}
                  >
                    <ArrowLeft size={16} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !isReadyToSubmit}
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

export default CashVoucherCreate;
