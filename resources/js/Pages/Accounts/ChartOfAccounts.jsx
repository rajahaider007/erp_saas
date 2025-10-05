import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
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
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    assets: true,
    liabilities: true,
    equity: true,
    revenue: true,
    expenses: true
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [formData, setFormData] = useState({
    account_code: '',
    account_name: '',
    account_type: 'Assets',
    account_subtype: '',
    parent_account_id: null,
    normal_balance: 'Debit',
    opening_balance: 0.00,
    currency: 'USD',
    is_parent: false,
    is_child: false,
    is_transactional: false,
    status: 'Active',
    tax_category: 'Taxable',
    reporting_category: '',
    cost_center: '',
    department: '',
    min_balance: null,
    max_balance: null,
    requires_approval: false,
    comp_id: null,
    location_id: null
  });

  // Sample data structure
  const accountCategories = [
    {
      id: 'assets',
      name: 'Assets',
      code: '100000000000000',
      icon: Building,
      color: 'blue',
      accounts: [
        {
          id: 1,
          account_code: '100000000000000',
          account_name: 'Current Assets',
          account_type: 'Assets',
          account_subtype: 'Current Assets',
          parent_account_id: null,
          account_level: 1,
          normal_balance: 'Debit',
          current_balance: 0.00,
          is_parent: true,
          is_child: false,
          is_transactional: false,
          status: 'Active',
          children: [
            {
              id: 2,
              account_code: '100000000000001',
              account_name: 'Cash & Cash Equivalents',
              account_type: 'Assets',
              account_subtype: 'Current Assets',
              parent_account_id: 1,
              account_level: 2,
              normal_balance: 'Debit',
              current_balance: 0.00,
              is_parent: true,
              is_child: false,
              is_transactional: false,
              status: 'Active',
              children: [
                {
                  id: 3,
                  account_code: '100000000000002',
                  account_name: 'Petty Cash',
                  account_type: 'Assets',
                  account_subtype: 'Current Assets',
                  parent_account_id: 2,
                  account_level: 3,
                  normal_balance: 'Debit',
                  current_balance: 0.00,
                  is_parent: false,
                  is_child: true,
                  is_transactional: true,
                  status: 'Active'
                },
                {
                  id: 4,
                  account_code: '100000000000003',
                  account_name: 'Cash in Hand',
                  account_type: 'Assets',
                  account_subtype: 'Current Assets',
                  parent_account_id: 2,
                  account_level: 3,
                  normal_balance: 'Debit',
                  current_balance: 0.00,
                  is_parent: false,
                  is_child: true,
                  is_transactional: true,
                  status: 'Active'
                }
              ]
            }
          ]
        }
      ]
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

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
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
  };

  // Open modal for add/edit
  const openModal = (mode, account = null) => {
    setModalMode(mode);
    setSelectedAccount(account);
    
    if (mode === 'edit' && account) {
      setFormData({
        account_code: account.account_code,
        account_name: account.account_name,
        account_type: account.account_type,
        account_subtype: account.account_subtype || '',
        parent_account_id: account.parent_account_id,
        normal_balance: account.normal_balance,
        opening_balance: account.opening_balance || 0.00,
        currency: account.currency || 'USD',
        is_parent: account.is_parent,
        is_child: account.is_child,
        is_transactional: account.is_transactional,
        status: account.status,
        tax_category: account.tax_category || 'Taxable',
        reporting_category: account.reporting_category || '',
        cost_center: account.cost_center || '',
        department: account.department || '',
        min_balance: account.min_balance,
        max_balance: account.max_balance,
        requires_approval: account.requires_approval || false,
        comp_id: account.comp_id,
        location_id: account.location_id
      });
    } else {
      setFormData({
        account_code: '',
        account_name: '',
        account_type: 'Assets',
        account_subtype: '',
        parent_account_id: null,
        normal_balance: 'Debit',
        opening_balance: 0.00,
        currency: 'USD',
        is_parent: false,
        is_child: false,
        is_transactional: false,
        status: 'Active',
        tax_category: 'Taxable',
        reporting_category: '',
        cost_center: '',
        department: '',
        min_balance: null,
        max_balance: null,
        requires_approval: false,
        comp_id: null,
        location_id: null
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
        account_type: 'Assets',
        account_subtype: '',
        parent_account_id: null,
        normal_balance: 'Debit',
        opening_balance: 0.00,
        currency: 'USD',
        is_parent: false,
        is_child: false,
        is_transactional: false,
        status: 'Active',
        tax_category: 'Taxable',
        reporting_category: '',
        cost_center: '',
        department: '',
        min_balance: null,
        max_balance: null,
        requires_approval: false,
        comp_id: null,
        location_id: null
      });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // AJAX call will be implemented here
      console.log('Form submitted:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      
      closeModal();
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Something went wrong. Please try again.',
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
        // AJAX call will be implemented here
        console.log('Delete account:', account);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Account has been deleted successfully.',
          confirmButtonColor: '#3B82F6',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Something went wrong. Please try again.',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'OK'
      });
    }
  };

  // Render account tree
  const renderAccountTree = (accounts, level = 0) => {
    return accounts.map((account) => (
      <div key={account.id} className="ml-4">
        <div className={`flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${level > 0 ? 'ml-4' : ''}`}>
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full ${
              account.account_type === 'Assets' ? 'bg-blue-500' :
              account.account_type === 'Liabilities' ? 'bg-red-500' :
              account.account_type === 'Equity' ? 'bg-green-500' :
              account.account_type === 'Revenue' ? 'bg-emerald-500' :
              'bg-orange-500'
            }`} />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
                  {account.account_code}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {account.account_name}
                </span>
                {account.is_transactional && (
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                    Transactional
                  </span>
                )}
                {account.is_parent && (
                  <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                    Parent
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {account.account_type} • {account.normal_balance} • Balance: ${account.current_balance.toLocaleString()}
              </div>
            </div>
          </div>
          
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
            <button
              onClick={() => openModal('add', account)}
              className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
              title="Add Child Account"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {account.children && account.children.length > 0 && (
          <div className="ml-4">
            {renderAccountTree(account.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <App>
      <Head title="Chart of Accounts" />
      
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
              <button
                onClick={() => openModal('add')}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>Add Account</span>
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
                      <div className="space-y-2">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Code
                  </label>
                  <input
                    type="text"
                    value={formData.account_code}
                    onChange={(e) => setFormData({...formData, account_code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter account code"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={formData.account_name}
                    onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter account name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Type
                  </label>
                  <select
                    value={formData.account_type}
                    onChange={(e) => setFormData({...formData, account_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="Assets">Assets</option>
                    <option value="Liabilities">Liabilities</option>
                    <option value="Equity">Equity</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Expenses">Expenses</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Normal Balance
                  </label>
                  <select
                    value={formData.normal_balance}
                    onChange={(e) => setFormData({...formData, normal_balance: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="Debit">Debit</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Opening Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.opening_balance}
                    onChange={(e) => setFormData({...formData, opening_balance: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="USD">🇺🇸 USD - United States Dollar</option>
                    <option value="EUR">🇪🇺 EUR - Euro</option>
                    <option value="GBP">🇬🇧 GBP - British Pound Sterling</option>
                    <option value="JPY">🇯🇵 JPY - Japanese Yen</option>
                    <option value="CHF">🇨🇭 CHF - Swiss Franc</option>
                    <option value="CAD">🇨🇦 CAD - Canadian Dollar</option>
                    <option value="AUD">🇦🇺 AUD - Australian Dollar</option>
                    <option value="NZD">🇳🇿 NZD - New Zealand Dollar</option>
                    <option value="CNY">🇨🇳 CNY - Chinese Yuan</option>
                    <option value="HKD">🇭🇰 HKD - Hong Kong Dollar</option>
                    <option value="SGD">🇸🇬 SGD - Singapore Dollar</option>
                    <option value="KRW">🇰🇷 KRW - South Korean Won</option>
                    <option value="INR">🇮🇳 INR - Indian Rupee</option>
                    <option value="PKR">🇵🇰 PKR - Pakistani Rupee</option>
                    <option value="BDT">🇧🇩 BDT - Bangladeshi Taka</option>
                    <option value="LKR">🇱🇰 LKR - Sri Lankan Rupee</option>
                    <option value="NPR">🇳🇵 NPR - Nepalese Rupee</option>
                    <option value="THB">🇹🇭 THB - Thai Baht</option>
                    <option value="MYR">🇲🇾 MYR - Malaysian Ringgit</option>
                    <option value="IDR">🇮🇩 IDR - Indonesian Rupiah</option>
                    <option value="PHP">🇵🇭 PHP - Philippine Peso</option>
                    <option value="VND">🇻🇳 VND - Vietnamese Dong</option>
                    <option value="AED">🇦🇪 AED - UAE Dirham</option>
                    <option value="SAR">🇸🇦 SAR - Saudi Riyal</option>
                    <option value="QAR">🇶🇦 QAR - Qatari Riyal</option>
                    <option value="KWD">🇰🇼 KWD - Kuwaiti Dinar</option>
                    <option value="BHD">🇧🇭 BHD - Bahraini Dinar</option>
                    <option value="OMR">🇴🇲 OMR - Omani Rial</option>
                    <option value="JOD">🇯🇴 JOD - Jordanian Dinar</option>
                    <option value="LBP">🇱🇧 LBP - Lebanese Pound</option>
                    <option value="EGP">🇪🇬 EGP - Egyptian Pound</option>
                    <option value="ZAR">🇿🇦 ZAR - South African Rand</option>
                    <option value="NGN">🇳🇬 NGN - Nigerian Naira</option>
                    <option value="KES">🇰🇪 KES - Kenyan Shilling</option>
                    <option value="GHS">🇬🇭 GHS - Ghanaian Cedi</option>
                    <option value="SEK">🇸🇪 SEK - Swedish Krona</option>
                    <option value="NOK">🇳🇴 NOK - Norwegian Krone</option>
                    <option value="DKK">🇩🇰 DKK - Danish Krone</option>
                    <option value="PLN">🇵🇱 PLN - Polish Zloty</option>
                    <option value="CZK">🇨🇿 CZK - Czech Koruna</option>
                    <option value="HUF">🇭🇺 HUF - Hungarian Forint</option>
                    <option value="RON">🇷🇴 RON - Romanian Leu</option>
                    <option value="BGN">🇧🇬 BGN - Bulgarian Lev</option>
                    <option value="HRK">🇭🇷 HRK - Croatian Kuna</option>
                    <option value="RSD">🇷🇸 RSD - Serbian Dinar</option>
                    <option value="BRL">🇧🇷 BRL - Brazilian Real</option>
                    <option value="MXN">🇲🇽 MXN - Mexican Peso</option>
                    <option value="ARS">🇦🇷 ARS - Argentine Peso</option>
                    <option value="CLP">🇨🇱 CLP - Chilean Peso</option>
                    <option value="COP">🇨🇴 COP - Colombian Peso</option>
                    <option value="PEN">🇵🇪 PEN - Peruvian Sol</option>
                    <option value="UYU">🇺🇾 UYU - Uruguayan Peso</option>
                    <option value="BOB">🇧🇴 BOB - Bolivian Boliviano</option>
                    <option value="VES">🇻🇪 VES - Venezuelan Bolívar</option>
                    <option value="RUB">🇷🇺 RUB - Russian Ruble</option>
                    <option value="TRY">🇹🇷 TRY - Turkish Lira</option>
                    <option value="ILS">🇮🇱 ILS - Israeli Shekel</option>
                    <option value="UAH">🇺🇦 UAH - Ukrainian Hryvnia</option>
                    <option value="BYN">🇧🇾 BYN - Belarusian Ruble</option>
                    <option value="KZT">🇰🇿 KZT - Kazakhstani Tenge</option>
                    <option value="UZS">🇺🇿 UZS - Uzbekistani Som</option>
                    <option value="KGS">🇰🇬 KGS - Kyrgyzstani Som</option>
                    <option value="TJS">🇹🇯 TJS - Tajikistani Somoni</option>
                    <option value="TMT">🇹🇲 TMT - Turkmenistani Manat</option>
                    <option value="AFN">🇦🇫 AFN - Afghan Afghani</option>
                    <option value="IRR">🇮🇷 IRR - Iranian Rial</option>
                    <option value="IQD">🇮🇶 IQD - Iraqi Dinar</option>
                    <option value="SYP">🇸🇾 SYP - Syrian Pound</option>
                    <option value="YER">🇾🇪 YER - Yemeni Rial</option>
                    <option value="SOS">🇸🇴 SOS - Somali Shilling</option>
                    <option value="ETB">🇪🇹 ETB - Ethiopian Birr</option>
                    <option value="TZS">🇹🇿 TZS - Tanzanian Shilling</option>
                    <option value="UGX">🇺🇬 UGX - Ugandan Shilling</option>
                    <option value="RWF">🇷🇼 RWF - Rwandan Franc</option>
                    <option value="BIF">🇧🇮 BIF - Burundian Franc</option>
                    <option value="MWK">🇲🇼 MWK - Malawian Kwacha</option>
                    <option value="ZMW">🇿🇲 ZMW - Zambian Kwacha</option>
                    <option value="BWP">🇧🇼 BWP - Botswana Pula</option>
                    <option value="NAD">🇳🇦 NAD - Namibian Dollar</option>
                    <option value="SZL">🇸🇿 SZL - Swazi Lilangeni</option>
                    <option value="LSL">🇱🇸 LSL - Lesotho Loti</option>
                    <option value="MUR">🇲🇺 MUR - Mauritian Rupee</option>
                    <option value="SCR">🇸🇨 SCR - Seychellois Rupee</option>
                    <option value="MAD">🇲🇦 MAD - Moroccan Dirham</option>
                    <option value="TND">🇹🇳 TND - Tunisian Dinar</option>
                    <option value="DZD">🇩🇿 DZD - Algerian Dinar</option>
                    <option value="LYD">🇱🇾 LYD - Libyan Dinar</option>
                    <option value="SDG">🇸🇩 SDG - Sudanese Pound</option>
                    <option value="SSP">🇸🇸 SSP - South Sudanese Pound</option>
                    <option value="CDF">🇨🇩 CDF - Congolese Franc</option>
                    <option value="XAF">🇨🇲 XAF - Central African CFA Franc</option>
                    <option value="XOF">🇸🇳 XOF - West African CFA Franc</option>
                    <option value="GMD">🇬🇲 GMD - Gambian Dalasi</option>
                    <option value="GNF">🇬🇳 GNF - Guinean Franc</option>
                    <option value="SLL">🇸🇱 SLL - Sierra Leonean Leone</option>
                    <option value="LRD">🇱🇷 LRD - Liberian Dollar</option>
                    <option value="CVE">🇨🇻 CVE - Cape Verdean Escudo</option>
                    <option value="STN">🇸🇹 STN - São Tomé and Príncipe Dobra</option>
                    <option value="AOA">🇦🇴 AOA - Angolan Kwanza</option>
                    <option value="ZWL">🇿🇼 ZWL - Zimbabwean Dollar</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company
                  </label>
                  <select
                    value={formData.comp_id || ''}
                    onChange={(e) => setFormData({...formData, comp_id: e.target.value ? parseInt(e.target.value) : null})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select Company</option>
                    <option value="1">Acme Corporation</option>
                    <option value="2">Tech Solutions Ltd</option>
                    <option value="3">Global Industries</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <select
                    value={formData.location_id || ''}
                    onChange={(e) => setFormData({...formData, location_id: e.target.value ? parseInt(e.target.value) : null})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select Location</option>
                    <option value="1">Head Office - New York</option>
                    <option value="2">Branch Office - London</option>
                    <option value="3">Regional Office - Dubai</option>
                    <option value="4">Local Office - Karachi</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_parent}
                    onChange={(e) => setFormData({...formData, is_parent: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Parent Account</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_transactional}
                    onChange={(e) => setFormData({...formData, is_transactional: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Transactional</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.requires_approval}
                    onChange={(e) => setFormData({...formData, requires_approval: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Requires Approval</span>
                </label>
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
