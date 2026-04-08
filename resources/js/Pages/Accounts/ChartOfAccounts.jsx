import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';
import App from '../App.jsx';
import Swal from 'sweetalert2';
import {
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Expand,
  Minimize,
  Search,
  Filter,
  RefreshCw,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building,
  CreditCard,
  Users,
  Settings,
  Eye,
  MoreHorizontal,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

const ChartOfAccounts = () => {
  const { props } = usePage();
  const { t } = useTranslations();
  const { currencies = [], accounts: seededAccounts = [], error } = props;

  const [accounts, setAccounts] = useState(seededAccounts);
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    assets: true,
    liabilities: true,
    equity: true,
    revenue: true,
    expenses: true
  });
  const [expandedAccounts, setExpandedAccounts] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [formData, setFormData] = useState({
    account_code: '',
    account_name: '',
    short_code: '',
    account_type: 'Assets',
    parent_account_id: null,
    currency: 'USD',
    status: 'Active'
  });

  // Load saved expanded state on component mount
  useEffect(() => {
    loadExpandedState();
  }, []);

  // Generate account code based on hierarchy (sequential, not random)
 // Generate account code based on hierarchy (sequential, not random)
const generateAccountCode = (parentCode = '', level = 1, parentId = null) => {
  if (level === 1) {
    // Level 1: 100000000000000, 200000000000000, etc.
    const typeCodes = {
      'Assets': '100000000000000',
      'Liabilities': '200000000000000',
      'Equity': '300000000000000',
      'Revenue': '400000000000000',
      'Expenses': '500000000000000'
    };
    return typeCodes[formData.account_type] || '100000000000000';
  } else if (level === 2) {
    const existingAccountsInDB = accounts.filter(acc =>
      acc.parent_account_id === parentId &&
      acc.account_level === 2
    );
    
    // Get the highest existing number to avoid duplicates
    let nextNumber = 1;
    if (existingAccountsInDB.length > 0) {
      const existingNumbers = existingAccountsInDB.map(acc => {
        const code = acc.account_code;
        const numberPart = code.substring(1, 5); // Get positions 1-4 (4 digits)
        return parseInt(numberPart) || 0;
      });
      nextNumber = Math.max(...existingNumbers) + 1;
    }
    
    // Build: 1 + 0001 + 0000000000 = 100010000000000
    const firstDigit = parentCode.charAt(0); // "1"
    const result = firstDigit + nextNumber.toString().padStart(4, '0') + '0000000000';
    return result;
  } else if (level === 3) {
    // Level 3: Parent is Level 2 (e.g., 100010000000000)
    // Child should be: 100010001000000 (7 base + 2 sequence + 6 zeros)
    const baseCode = parentCode.substring(0, 7); // Get first 7 digits (1000100)
    
    // Find next sequential number for this specific parent
    const existingAccounts = accounts.filter(acc =>
      acc.parent_account_id === parentId &&
      acc.account_level === 3
    );
    
    // Get the highest existing number to avoid duplicates
    let nextNumber = 1;
    if (existingAccounts.length > 0) {
      const existingNumbers = existingAccounts.map(acc => {
        const code = acc.account_code;
        const numberPart = code.substring(7, 9); // Get positions 7-8 (2 digits)
        return parseInt(numberPart) || 0;
      });
      nextNumber = Math.max(...existingNumbers) + 1;
    }
    
    return baseCode + nextNumber.toString().padStart(2, '0') + '000000';
  } else if (level === 4) {
    // Level 4: Parent is Level 3 (e.g., 100010001000000)
    // Child should be: 100010001000001
    const baseCode = parentCode.substring(0, 12); // Get first 12 digits (100010001000)
    
    // Find next sequential number for this specific parent
    const existingAccounts = accounts.filter(acc =>
      acc.parent_account_id === parentId &&
      acc.account_level === 4
    );
    
    // Get the highest existing number to avoid duplicates
    let nextNumber = 1;
    if (existingAccounts.length > 0) {
      const existingNumbers = existingAccounts.map(acc => {
        const code = acc.account_code;
        const numberPart = code.substring(12, 15); // Get the last 3 digits (positions 12-14)
        return parseInt(numberPart) || 0;
      });
      nextNumber = Math.max(...existingNumbers) + 1;
    }
    
    return baseCode + nextNumber.toString().padStart(3, '0');
  }
  return '';
};

  // Auto-detect account properties (system will handle this automatically)
  const getAccountProperties = (parentCode = '', level = 1) => {
    // Get user data from page props
    const { user } = props;

    // System will automatically detect these properties based on hierarchy
    return {
      is_transactional: level === 4,
      comp_id: user?.comp_id || 1, // Get from logged-in user
      location_id: user?.location_id || 1 // Get from logged-in user
    };
  };

  // Dynamic categories based on seeded data
  const getAccountCategories = () => {
    const categories = [
      {
        id: 'assets',
        name: 'Assets',
        code: '100000000000000',
        icon: Building,
        color: 'blue',
        accounts: []
      },
      {
        id: 'liabilities',
        name: 'Liabilities',
        code: '200000000000000',
        icon: CreditCard,
        color: 'red',
        accounts: []
      },
      {
        id: 'equity',
        name: 'Equity',
        code: '300000000000000',
        icon: Users,
        color: 'green',
        accounts: []
      },
      {
        id: 'revenue',
        name: 'Revenue',
        code: '400000000000000',
        icon: TrendingUp,
        color: 'emerald',
        accounts: []
      },
      {
        id: 'expenses',
        name: 'Expenses',
        code: '500000000000000',
        icon: TrendingDown,
        color: 'orange',
        accounts: []
      }
    ];

    // Group accounts by type and create proper hierarchy
    accounts.forEach(account => {
      const categoryId = account.account_type.toLowerCase();
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        // Only add Level 1 accounts (main categories) to the category level
        // Level 2 and Level 3 accounts should only appear under their parents
        if (account.account_level === 1) {
          category.accounts.push(account);
        }
      }
    });

    // Sort accounts within each category by level and code
    categories.forEach(category => {
      category.accounts.sort((a, b) => {
        if (a.account_level !== b.account_level) {
          return a.account_level - b.account_level;
        }
        return a.account_code.localeCompare(b.account_code);
      });
    });

    return categories;
  };

  const accountCategories = getAccountCategories();

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newState = {
        ...prev,
        [categoryId]: !prev[categoryId]
      };
      // Save to localStorage
      saveExpandedStateToLocalStorage(newState, expandedAccounts);
      return newState;
    });
  };

  // Toggle account expansion
  const toggleAccount = (accountId) => {
    setExpandedAccounts(prev => {
      const newState = {
        ...prev,
        [accountId]: !prev[accountId]
      };
      // Save to localStorage
      saveExpandedStateToLocalStorage(expandedCategories, newState);
      return newState;
    });
  };

  // Expand all categories
  const expandAll = () => {
    const newCategories = {
      assets: true,
      liabilities: true,
      equity: true,
      revenue: true,
      expenses: true
    };
    // Expand all accounts too
    const allAccountIds = {};
    accounts.forEach(account => {
      allAccountIds[account.id] = true;
    });
    
    setExpandedCategories(newCategories);
    setExpandedAccounts(allAccountIds);
    
    // Save to localStorage
    saveExpandedStateToLocalStorage(newCategories, allAccountIds);
  };

  // Collapse all categories
  const collapseAll = () => {
    const newCategories = {
      assets: false,
      liabilities: false,
      equity: false,
      revenue: false,
      expenses: false
    };
    const emptyAccounts = {};
    
    setExpandedCategories(newCategories);
    setExpandedAccounts(emptyAccounts);
    
    // Save to localStorage
    saveExpandedStateToLocalStorage(newCategories, emptyAccounts);
  };

  // Open modal for add/edit
  const openModal = (mode, account = null, parentAccount = null) => {
    setModalMode(mode);
    
    if (mode === 'edit' && account) {
      setSelectedAccount(account); // Store the account being edited
      setFormData({
        account_code: account.account_code,
        account_name: account.account_name,
        short_code: account.short_code || '',
        account_type: account.account_type,
        parent_account_id: account.parent_account_id,
        currency: account.currency || 'USD',
        status: account.status
      });
    } else {
      setSelectedAccount(parentAccount); // Store parent account for code generation
      const level = parentAccount ? parentAccount.account_level + 1 : 1;
      const generatedCode = generateAccountCode(parentAccount?.account_code, level, parentAccount?.id);

      // Debug: Log the generated code
      console.log('Generated account code:', generatedCode, 'for level:', level, 'parent:', parentAccount?.account_code);

      setFormData({
        account_code: generatedCode,
        account_name: '',
        short_code: '',
        account_type: parentAccount ? parentAccount.account_type : 'Assets',
        parent_account_id: parentAccount?.id || null,
        currency: 'USD',
        status: 'Active'
      });
    }

    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedAccount(null);
    setFormData({
      account_code: '',
      account_name: '',
      short_code: '',
      account_type: 'Assets',
      parent_account_id: null,
      currency: 'USD',
      status: 'Active'
    });
  };

  // Save expanded state to localStorage before refresh
  const saveExpandedState = () => {
    const stateToSave = {
      expandedAccounts,
      expandedCategories
    };
    localStorage.setItem('chartOfAccountsState', JSON.stringify(stateToSave));
  };

  // Save expanded state to localStorage (helper function)
  const saveExpandedStateToLocalStorage = (categories, accounts) => {
    const stateToSave = {
      expandedAccounts: accounts,
      expandedCategories: categories
    };
    localStorage.setItem('chartOfAccountsState', JSON.stringify(stateToSave));
  };

  // Load expanded state from localStorage
  const loadExpandedState = () => {
    try {
      const savedState = localStorage.getItem('chartOfAccountsState');
      if (savedState) {
        const state = JSON.parse(savedState);
        setExpandedAccounts(state.expandedAccounts || {});
        setExpandedCategories(state.expandedCategories || {
          assets: true,
          liabilities: true,
          equity: true,
          revenue: true,
          expenses: true
        });
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
  };

  // Refresh accounts data with AJAX call
  const refreshAccounts = async () => {
    try {
      setLoading(true);
      
      // Get CSRF token
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
        document.querySelector('input[name="_token"]')?.value ||
        window.Laravel?.csrfToken;

      if (!csrfToken) {
        throw new Error('CSRF token not found. Please refresh the page and try again.');
      }

      const response = await fetch('/api/chart-of-accounts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
        },
        credentials: 'same-origin', // Include cookies for session
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setAccounts(data.data);
        } else {
          console.error('Failed to refresh accounts:', data.message);
        }
      } else {
        console.error('Failed to refresh accounts');
      }
    } catch (error) {
      console.error('Error refreshing accounts:', error);
      // Fallback to page reload if AJAX fails
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Auto-detect properties based on hierarchy
      const level = modalMode === 'edit' 
        ? (selectedAccount ? selectedAccount.account_level : 1)  // For edits, use existing level
        : (selectedAccount ? selectedAccount.account_level + 1 : 1);  // For new accounts, use parent level + 1
      const autoDetectedProperties = getAccountProperties(formData.parent_account_id, level);

      // Prepare data with only required fields for backend
      const submitData = {
        account_code: formData.account_code,
        account_name: formData.account_name,
        short_code: formData.short_code,
        account_type: formData.account_type,
        currency: formData.currency,
        status: formData.status,
        parent_account_id: formData.parent_account_id,
        account_level: level
      };

      // Debug: Log the data being sent
      console.log('Submitting data:', submitData);

      // Make API call
      const url = modalMode === 'add'
        ? '/api/chart-of-accounts'
        : `/api/chart-of-accounts/${selectedAccount.id}`;

      const method = modalMode === 'add' ? 'POST' : 'PUT';

      // Get CSRF token
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
        document.querySelector('input[name="_token"]')?.value ||
        window.Laravel?.csrfToken;

      if (!csrfToken) {
        throw new Error('CSRF token not found. Please refresh the page and try again.');
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
        },
        credentials: 'same-origin', // Include cookies for session
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      // Debug: Log the response
      console.log('API Response:', result);

      if (result.success) {
        // Show success message
        if (modalMode === 'add') {
          await Swal.fire({
            icon: 'success',
            title: t('common.flash.success_title'),
            text: t('accounts.chart_of_accounts.msg_account_added'),
            confirmButtonColor: '#3B82F6',
            confirmButtonText: t('common.flash.ok'),
            background: 'rgba(30, 41, 59, 0.95)',
            color: '#F1F5F9',
            backdrop: 'rgba(0, 0, 0, 0.8)',
            customClass: {
              popup: 'swal-dark-theme',
              title: 'swal-dark-title',
              content: 'swal-dark-content',
              confirmButton: 'swal-dark-confirm'
            }
          });
        } else {
          await Swal.fire({
            icon: 'success',
            title: t('common.flash.updated_title'),
            text: t('accounts.chart_of_accounts.msg_account_updated'),
            confirmButtonColor: '#3B82F6',
            confirmButtonText: t('common.flash.ok'),
            background: 'rgba(30, 41, 59, 0.95)',
            color: '#F1F5F9',
            backdrop: 'rgba(0, 0, 0, 0.8)',
            customClass: {
              popup: 'swal-dark-theme',
              title: 'swal-dark-title',
              content: 'swal-dark-content',
              confirmButton: 'swal-dark-confirm'
            }
          });
        }

        // Update local state optimistically instead of page reload
        if (modalMode === 'add') {
          // For new accounts, we need to fetch fresh data since we don't have the new account details
          await refreshAccounts();
        } else {
          // For updates, we can update the local state directly
          setAccounts(prevAccounts => 
            prevAccounts.map(account => 
              account.id === selectedAccount.id 
                ? { ...account, ...formData }
                : account
            )
          );
        }
        
        closeModal();
      } else {
        // If it's a validation error, throw it with the response data
        if (result.errors) {
          const validationError = new Error(t('accounts.chart_of_accounts.msg_validation_failed'));
          validationError.response = result;
          throw validationError;
        }
        throw new Error(result.message || t('accounts.chart_of_accounts.msg_operation_failed'));
      }

    } catch (error) {
      console.error('Error:', error);

      // Check if it's a validation error
      if (error.message && error.message.includes('Validation failed') && error.response) {
        let errorMessage = t('accounts.chart_of_accounts.msg_please_check_form_data');
        
        // Try to extract specific validation errors from the response
        if (error.response && error.response.errors) {
          const errorDetails = Object.values(error.response.errors).flat().join(', ');
          errorMessage = t('accounts.chart_of_accounts.msg_validation_errors', { details: errorDetails });
        }
        
        await Swal.fire({
          icon: 'error',
          title: t('accounts.chart_of_accounts.validation_error'),
          text: errorMessage,
          confirmButtonColor: '#EF4444',
          confirmButtonText: t('common.flash.ok'),
          background: 'rgba(30, 41, 59, 0.95)',
          color: '#F1F5F9',
          backdrop: 'rgba(0, 0, 0, 0.8)',
          customClass: {
            popup: 'swal-dark-theme',
            title: 'swal-dark-title',
            content: 'swal-dark-content',
            confirmButton: 'swal-dark-confirm'
          }
        });
      } else {
        await Swal.fire({
          icon: 'error',
          title: t('common.flash.error_title'),
          text: error.message || t('accounts.chart_of_accounts.msg_something_went_wrong'),
          confirmButtonColor: '#EF4444',
          confirmButtonText: t('common.flash.ok'),
          background: 'rgba(30, 41, 59, 0.95)',
          color: '#F1F5F9',
          backdrop: 'rgba(0, 0, 0, 0.8)',
          customClass: {
            popup: 'swal-dark-theme',
            title: 'swal-dark-title',
            content: 'swal-dark-content',
            confirmButton: 'swal-dark-confirm'
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (account) => {
    try {
      // Check if it's a Level 1 account (main categories)
      if (account.account_level === 1) {
        await Swal.fire({
          icon: 'error',
          title: t('accounts.chart_of_accounts.cannot_delete'),
          text: t('accounts.chart_of_accounts.msg_main_categories_cannot_delete'),
          confirmButtonColor: '#EF4444',
          confirmButtonText: t('common.flash.ok'),
          background: 'rgba(30, 41, 59, 0.95)',
          color: '#F1F5F9',
          backdrop: 'rgba(0, 0, 0, 0.8)',
          customClass: {
            popup: 'swal-dark-theme',
            title: 'swal-dark-title',
            content: 'swal-dark-content',
            confirmButton: 'swal-dark-confirm'
          }
        });
        return;
      }

      // Check if account has children
      const hasChildren = accounts.some(acc => acc.parent_account_id === account.id);

      if (hasChildren) {
        const childAccounts = accounts.filter(acc => acc.parent_account_id === account.id);
        const childNames = childAccounts.map(child => child.account_name).join(', ');

        await Swal.fire({
          icon: 'warning',
          title: t('accounts.chart_of_accounts.cannot_delete_parent'),
          html: `
            <div class="text-left">
              <p class="mb-3">${t('accounts.chart_of_accounts.this_account_has_child_accounts_that_mus')}</p>
              <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3">
                <strong>${t('accounts.chart_of_accounts.child_accounts')}</strong><br/>
                ${childNames}
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                ${t('accounts.chart_of_accounts.msg_delete_children_first')}
              </p>
            </div>
          `,
          confirmButtonColor: '#3B82F6',
          confirmButtonText: t('accounts.chart_of_accounts.i_understand'),
          background: 'rgba(30, 41, 59, 0.95)',
          color: '#F1F5F9',
          backdrop: 'rgba(0, 0, 0, 0.8)',
          customClass: {
            popup: 'swal-dark-theme',
            title: 'swal-dark-title',
            content: 'swal-dark-content',
            confirmButton: 'swal-dark-confirm'
          }
        });
        return;
      }

      // Proceed with deletion for accounts without children
      const result = await Swal.fire({
        title: t('common.data_table.confirm_delete_title'),
        text: t('common.data_table.confirm_delete_text', { name: account.account_name }),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: t('common.data_table.confirm_delete_ok'),
        cancelButtonText: t('common.actions.cancel'),
        background: 'rgba(30, 41, 59, 0.95)',
        color: '#F1F5F9',
        backdrop: 'rgba(0, 0, 0, 0.8)',
        customClass: {
          popup: 'swal-dark-theme',
          title: 'swal-dark-title',
          content: 'swal-dark-content',
          confirmButton: 'swal-dark-confirm',
          cancelButton: 'swal-dark-cancel'
        }
      });

      if (result.isConfirmed) {
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
          document.querySelector('input[name="_token"]')?.value ||
          window.Laravel?.csrfToken;

        if (!csrfToken) {
          throw new Error(t('accounts.chart_of_accounts.msg_csrf_not_found'));
        }

        // Make API call
        const response = await fetch(`/api/chart-of-accounts/${account.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json',
          },
          credentials: 'same-origin', // Include cookies for session
        });

        const result = await response.json();

        if (result.success) {
          await Swal.fire({
            icon: 'success',
            title: t('common.flash.deleted_title'),
            text: t('accounts.chart_of_accounts.msg_account_deleted'),
            confirmButtonColor: '#3B82F6',
            confirmButtonText: t('common.flash.ok'),
            background: 'rgba(30, 41, 59, 0.95)',
            color: '#F1F5F9',
            backdrop: 'rgba(0, 0, 0, 0.8)',
            customClass: {
              popup: 'swal-dark-theme',
              title: 'swal-dark-title',
              content: 'swal-dark-content',
              confirmButton: 'swal-dark-confirm'
            }
          });

          // Update local state optimistically instead of page reload
          setAccounts(prevAccounts => 
            prevAccounts.filter(acc => acc.id !== account.id)
          );
        } else {
          throw new Error(result.message || t('accounts.chart_of_accounts.msg_delete_failed'));
        }
      }
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        icon: 'error',
        title: t('common.flash.error_title'),
        text: error.message || t('accounts.chart_of_accounts.msg_something_went_wrong'),
        confirmButtonColor: '#EF4444',
        confirmButtonText: t('common.flash.ok'),
        background: 'rgba(30, 41, 59, 0.95)',
        color: '#F1F5F9',
        backdrop: 'rgba(0, 0, 0, 0.8)',
        customClass: {
          popup: 'swal-dark-theme',
          title: 'swal-dark-title',
          content: 'swal-dark-content',
          confirmButton: 'swal-dark-confirm'
        }
      });
    }
  };

  // Render account tree with accordion functionality
  const renderAccountTree = (accountsToRender, level = 0) => {
    return accountsToRender.map((account) => {
      const hasChildren = accounts.some(acc => acc.parent_account_id === account.id);
      const isExpanded = expandedAccounts[account.id];

      return (
        <div key={account.id} className={`${level > 0 ? 'ml-4' : ''} mb-2`}>
          <div className={`flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200`}>
            <div className="flex items-center space-x-3 flex-1">
              {/* Accordion Toggle Button */}
              {hasChildren && (
                <button
                  onClick={() => toggleAccount(account.id)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
                  title={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}

              {/* Account Info */}
              <div className="flex items-center space-x-3 flex-1">
                <div className={`w-2 h-2 rounded-full ${account.account_type === 'Assets' ? 'bg-blue-500' :
                  account.account_type === 'Liabilities' ? 'bg-red-500' :
                    account.account_type === 'Equity' ? 'bg-green-500' :
                      account.account_type === 'Revenue' ? 'bg-emerald-500' :
                        'bg-orange-500'
                  }`} />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
                      {account.account_code}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {account.account_name}
                    </span>
                    {account.short_code && account.short_code !== 'NULL' && account.short_code.trim() !== '' && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                        {account.short_code}
                      </span>
                    )}
                    {account.account_level === 4 && (
                      <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                        Transactional
                      </span>
                    )}
                    {account.account_level < 4 && (
                      <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                        Parent
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {account.account_type} • Level {account.account_level} • {account.currency}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => openModal('edit', account)}
                className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                title={t('accounts.chart_of_accounts.edit_account')}
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(account)}
                className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                title={t('accounts.chart_of_accounts.delete_account')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {account.account_level < 4 && (
                <button
                  onClick={() => openModal('add', null, account)}
                  className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
                  title={t('accounts.chart_of_accounts.add_child_account')}
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Children Accounts - Only render if parent is expanded */}
          {hasChildren && isExpanded && (
            <div className="mt-3 ml-4 space-y-2">
              {renderAccountTree(
                accounts.filter(acc => acc.parent_account_id === account.id),
                level + 1
              )}
            </div>
          )}
        </div>
      );
    });
  };

  // Show error if company/location info is missing
  if (error) {
    return (
      <App>
        <Head title={t('accounts.chart_of_accounts.chart_of_accounts')} />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center mb-2">
              {t('accounts.chart_of_accounts.configuration_required')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
              {error}
            </p>
            <div className="text-center">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('accounts.chart_of_accounts.go_to_dashboard')}
              </button>
            </div>
          </div>
        </div>
      </App>
    );
  }

  return (
    <App>
      <Head title={t('accounts.chart_of_accounts.chart_of_accounts')} />
      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('accounts.chart_of_accounts.chart_of_accounts')}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('accounts.chart_of_accounts.manage_structure')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={expandAll}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
              >
                <Expand className="h-4 w-4" />
                <span>{t('accounts.chart_of_accounts.expand_all')}</span>
              </button>
              <button
                onClick={collapseAll}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
              >
                <Minimize className="h-4 w-4" />
                <span>{t('accounts.chart_of_accounts.collapse_all')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Account Categories */}
        <div className="space-y-4">
          {accountCategories.map((category) => {
            const Icon = category.icon;
            const isExpanded = expandedCategories[category.id];

            return (
              <div key={category.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl bg-${category.color}-100 dark:bg-${category.color}-900/20`}>
                      <Icon className={`h-6 w-6 text-${category.color}-600 dark:text-${category.color}-400`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Code: {category.code}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    {category.accounts.length > 0 ? (
                      <div className="space-y-3">
                        {renderAccountTree(category.accounts)}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl inline-block mb-4">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          {t('accounts.chart_of_accounts.no_accounts_in_category')}
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          {t('accounts.chart_of_accounts.start_by_adding_first_account')}
                        </p>
                        <button
                          onClick={() => openModal('add')}
                          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 mx-auto"
                        >
                          <Plus className="h-4 w-4" />
                          <span>{t('accounts.chart_of_accounts.add_account')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100 animate-slideUp">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {modalMode === 'add' ? t('accounts.chart_of_accounts.add_new_account') : t('accounts.chart_of_accounts.edit_account')}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Parent Account Info */}
              {modalMode === 'add' && selectedAccount && (
                <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    {t('accounts.chart_of_accounts.adding_under')}: <span className="font-semibold">{selectedAccount.account_name} ({selectedAccount.account_code})</span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('accounts.chart_of_accounts.account_code')}
                  </label>
                  <input
                    type="text"
                    value={formData.account_code}
                    onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder={t('accounts.chart_of_accounts.enter_account_code')}
                    required
                    readOnly={modalMode === 'add'}
                  />
                  {modalMode === 'add' && formData.parent_account_id && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {t('accounts.chart_of_accounts.auto_generated_under_parent')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('accounts.chart_of_accounts.account_name')}
                  </label>
                  <input
                    type="text"
                    value={formData.account_name}
                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder={t('accounts.chart_of_accounts.enter_account_name')}
                    required
                  />
                </div>



                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('accounts.chart_of_accounts.short_code_optional')}
                  </label>
                  <input
                    type="text"
                    value={formData.short_code}
                    onChange={(e) => setFormData({ ...formData, short_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder={t('accounts.chart_of_accounts.eg_cash_bank_ar')}
                    maxLength={20}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('accounts.chart_of_accounts.company_specific_short_code_help')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('accounts.chart_of_accounts.currency')}
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.id} value={currency.code}>
                        {currency.symbol} {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Auto-detected fields - System will handle these automatically */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    {t('accounts.chart_of_accounts.auto_detected_properties')}
                  </span>
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <p>• <strong>{t('accounts.chart_of_accounts.account_type')}</strong> {t('accounts.chart_of_accounts.automatically_inherited_from_parent_acco')}</p>
                  <p>• <strong>{t('accounts.chart_of_accounts.company__location')}</strong> {t('accounts.chart_of_accounts.autodetected_from_current_user_session')}</p>
                  <p>• <strong>{t('accounts.chart_of_accounts.transactional_status')}</strong> {t('accounts.chart_of_accounts.autodetermined_level_4_accounts_only')}</p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                >
                  {t('common.actions.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                  <span>{modalMode === 'add' ? t('accounts.chart_of_accounts.add_account') : t('common.actions.update')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </App>
  );
};

export default ChartOfAccounts;
