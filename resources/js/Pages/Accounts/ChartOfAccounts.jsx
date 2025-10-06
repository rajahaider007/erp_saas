import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
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
  const { currencies = [], accounts: seededAccounts = [] } = props;

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
      // Level 2: Use parent's base code and append sequential number
      const baseCode = parentCode.substring(0, 5); // Get first 5 digits: 50000

      // Find next sequential number for this specific parent
      const existingAccounts = accounts.filter(acc =>
        acc.parent_account_id === parentId &&
        acc.account_level === 2
      );
      const nextNumber = existingAccounts.length + 1;

      // Format: 50000 + 4 + 0000000000 = 500040000000000 (15 digits total)
      // So we need: 5 (base) + 1 (sequential) + 9 (zeros) = 15 digits
      const paddedNumber = nextNumber.toString().padStart(1, '0'); // Just 1 digit for the sequential number
      const result = baseCode + paddedNumber + '0000000000'; // 10 zeros to make total 15


      return result;
    } else if (level === 3) {
      // Level 3: Use parent's full code as base and append sequential number
      // For example: if parent is 500010000000000, child should be 500010000000001
      const baseCode = parentCode.substring(0, 10);
      // Find next sequential number for this specific parent
      const existingAccounts = accounts.filter(acc =>
        acc.parent_account_id === parentId &&
        acc.account_level === 3
      );
      const nextNumber = existingAccounts.length + 1;
      return baseCode + nextNumber.toString().padStart(5, '0');
    }
    return '';
  };

  // Auto-detect account properties (system will handle this automatically)
  const getAccountProperties = (parentCode = '', level = 1) => {
    // Get user data from page props
    const { user } = props;

    // System will automatically detect these properties based on hierarchy
    return {
      is_parent: level < 3,
      is_child: level > 1,
      is_transactional: level === 3,
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
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Toggle account expansion
  const toggleAccount = (accountId) => {
    setExpandedAccounts(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  // Expand all categories
  const expandAll = () => {
    setExpandedCategories({
      assets: true,
      liabilities: true,
      equity: true,
      revenue: true,
      expenses: true
    });
    // Expand all accounts too
    const allAccountIds = {};
    accounts.forEach(account => {
      allAccountIds[account.id] = true;
    });
    setExpandedAccounts(allAccountIds);
  };

  // Collapse all categories
  const collapseAll = () => {
    setExpandedCategories({
      assets: false,
      liabilities: false,
      equity: false,
      revenue: false,
      expenses: false
    });
    setExpandedAccounts({});
  };

  // Open modal for add/edit
  const openModal = (mode, account = null, parentAccount = null) => {
    setModalMode(mode);
    setSelectedAccount(parentAccount); // Store parent account for code generation

    if (mode === 'edit' && account) {
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
      const level = parentAccount ? parentAccount.account_level + 1 : 1;
      const generatedCode = generateAccountCode(parentAccount?.account_code, level, parentAccount?.id);

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Auto-detect properties based on hierarchy
      const level = selectedAccount ? selectedAccount.account_level + 1 : 1;
      const autoDetectedProperties = getAccountProperties(formData.parent_account_id, level);

      // Prepare data with auto-detected properties
      const submitData = {
        ...formData,
        ...autoDetectedProperties,
        account_level: level
      };

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
          'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();

      if (result.success) {
        // Show success message
        if (modalMode === 'add') {
          await Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Account has been added successfully.',
            confirmButtonColor: '#3B82F6',
            confirmButtonText: 'OK'
          });
        } else {
          await Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Account has been updated successfully.',
            confirmButtonColor: '#3B82F6',
            confirmButtonText: 'OK'
          });
        }

        // Refresh accounts list
        window.location.reload();
        closeModal();
      } else {
        throw new Error(result.message || 'Operation failed');
      }

    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || 'Something went wrong. Please try again.',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'OK'
      });
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
          title: 'Cannot Delete!',
          text: 'Main account categories (Level 1) cannot be deleted. These are fundamental accounting categories.',
          confirmButtonColor: '#EF4444',
          confirmButtonText: 'OK'
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
          title: 'Cannot Delete Parent Account!',
          html: `
            <div class="text-left">
              <p class="mb-3">This account has child accounts that must be deleted first:</p>
              <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3">
                <strong>Child Accounts:</strong><br/>
                ${childNames}
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Please delete all child accounts first, then you can delete this parent account.
              </p>
            </div>
          `,
          confirmButtonColor: '#3B82F6',
          confirmButtonText: 'I Understand'
        });
        return;
      }

      // Proceed with deletion for accounts without children
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `You are about to delete "${account.account_name}". This action cannot be undone!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
          document.querySelector('input[name="_token"]')?.value ||
          window.Laravel?.csrfToken;

        if (!csrfToken) {
          throw new Error('CSRF token not found. Please refresh the page and try again.');
        }

        // Make API call
        const response = await fetch(`/api/chart-of-accounts/${account.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
          }
        });

        const result = await response.json();

        if (result.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Account has been deleted successfully.',
            confirmButtonColor: '#3B82F6',
            confirmButtonText: 'OK'
          });

          // Refresh accounts list
          window.location.reload();
        } else {
          throw new Error(result.message || 'Delete failed');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || 'Something went wrong. Please try again.',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'OK'
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
                    {account.short_code && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                        {account.short_code}
                      </span>
                    )}
                    {account.account_level === 3 && (
                      <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                        Transactional
                      </span>
                    )}
                    {account.account_level < 3 && (
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
                title="Edit Account"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(account)}
                className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                title="Delete Account"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {account.account_level < 3 && (
                <button
                  onClick={() => openModal('add', null, account)}
                  className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
                  title="Add Child Account"
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

  return (
    <App>
      <Head title="Chart of Accounts" />
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
                  Chart of Accounts
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage your accounting structure and account hierarchy
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={expandAll}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
              >
                <Expand className="h-4 w-4" />
                <span>Expand All</span>
              </button>
              <button
                onClick={collapseAll}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
              >
                <Minimize className="h-4 w-4" />
                <span>Collapse All</span>
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
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {category.accounts.length} accounts
                    </span>
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
                          No accounts in this category
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          Start by adding your first account to this category
                        </p>
                        <button
                          onClick={() => openModal('add')}
                          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 mx-auto"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Account</span>
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
                {modalMode === 'add' ? 'Add New Account' : 'Edit Account'}
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
                    Adding under: <span className="font-semibold">{selectedAccount.account_name} ({selectedAccount.account_code})</span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Code
                  </label>
                  <input
                    type="text"
                    value={formData.account_code}
                    onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter account code"
                    required
                    readOnly={modalMode === 'add'}
                  />
                  {modalMode === 'add' && formData.parent_account_id && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Auto-generated under parent account
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={formData.account_name}
                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter account name"
                    required
                  />
                </div>



                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Short Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.short_code}
                    onChange={(e) => setFormData({ ...formData, short_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., CASH, BANK, AR"
                    maxLength={20}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Company-specific short code for easy reference
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency
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
                    Auto-Detected Properties
                  </span>
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <p>• <strong>Account Type:</strong> Automatically inherited from parent account</p>
                  <p>• <strong>Company & Location:</strong> Auto-detected from current user session</p>
                  <p>• <strong>Parent/Child Status:</strong> Auto-determined by hierarchy level</p>
                  <p>• <strong>Transactional Status:</strong> Auto-determined (Level 3 accounts only)</p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                  <span>{modalMode === 'add' ? 'Add Account' : 'Update Account'}</span>
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
