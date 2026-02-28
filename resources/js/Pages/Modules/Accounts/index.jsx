import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import App from '../../App.jsx';
import { usePermissions } from '../../../hooks/usePermissions';
import {
  CreditCard,
  DollarSign,
  FileText,
  TrendingUp,
  PieChart,
  Receipt,
  Calculator,
  Banknote,
  ChevronRight,
  BarChart3,
  Activity,
  Clock,
  Star,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

const AccountsDashboard = () => {
  const { auth, company, dashboardStats, recentTransactions, accountsSummary, currencySymbol } = usePage().props;
  const user = auth?.user;
  const { canView } = usePermissions();

  // Helper function to get icon component by name
  const getIconComponent = (iconName) => {
    const icons = {
      FileText,
      CreditCard,
      DollarSign,
      Receipt,
      Banknote,
      Star,
      TrendingUp,
      Activity
    };
    return icons[iconName] || FileText;
  };

  // Helper function to get color classes
  const getColorClasses = (color, isCredit) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400'
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400'
      },
      red: {
        bg: 'bg-red-100 dark:bg-red-900/20',
        text: 'text-red-600 dark:text-red-400'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400'
      },
      orange: {
        bg: 'bg-orange-100 dark:bg-orange-900/20',
        text: 'text-orange-600 dark:text-orange-400'
      },
      gray: {
        bg: 'bg-gray-100 dark:bg-gray-900/20',
        text: 'text-gray-600 dark:text-gray-400'
      }
    };
    return colors[color] || colors.gray;
  };

  // Accounts module sections and menus
  const accountsSections = [
    {
      id: 1,
      name: 'General Ledger',
      description: 'Manage chart of accounts and general ledger entries',
      icon: FileText,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      menus: [
        { name: 'Chart of Accounts', route: '/accounts/chart-of-accounts', icon: FileText },
        { name: 'Journal Voucher', route: '/accounts/journal-voucher', icon: Edit },
        { name: 'Trial Balance', route: '/accounts/trial-balance', icon: BarChart3 }
      ]
    },
    {
      id: 2,
      name: 'Financial Reports',
      description: 'Generate financial statements and reports',
      icon: Receipt,
      color: 'red',
      gradient: 'from-red-500 to-red-600',
      menus: [
        { name: 'General Ledger', route: '/accounts/general-ledger', icon: FileText },
        { name: 'Balance Sheet', route: '/accounts/balance-sheet', icon: BarChart3 },
        { name: 'Income Statement', route: '/accounts/income-statement', icon: TrendingUp }
      ]
    },
    {
      id: 3,
      name: 'Configuration',
      description: 'Configure accounting settings and fiscal year',
      icon: DollarSign,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      menus: [
        { name: 'Fiscal Year', route: '/accounts/fiscal-year-configuration', icon: Clock },
        { name: 'Voucher Configuration', route: '/accounts/voucher-number-configuration', icon: FileText },
        { name: 'Code Configuration', route: '/accounts/code-configuration', icon: Calculator }
      ]
    },
    {
      id: 4,
      name: 'Currency & Ledger',
      description: 'Manage currencies and currency ledger',
      icon: PieChart,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      menus: [
        { name: 'Currencies', route: '/system/currencies', icon: DollarSign },
        { name: 'Currency Ledger', route: '/accounts/currency-ledger', icon: BarChart3 },
        { name: 'Opening Voucher', route: '/accounts/opening-voucher', icon: Star }
      ]
    }
  ];

  const getSectionIcon = (iconComponent) => {
    const Icon = iconComponent;
    return <Icon className="h-6 w-6" />;
  };

  const SectionCard = ({ section }) => {
    const Icon = section.icon;
    
    return (
      <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${section.gradient} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{section.name}</h3>
                <p className="text-white/80 text-sm">{section.description}</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* Menus */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-3">
            {section.menus.map((menu, index) => (
              <Link
                key={index}
                href={menu.route}
                className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className={`p-2 rounded-lg bg-gradient-to-r ${section.gradient} text-white`}>
                  <menu.icon className="h-4 w-4" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300">
                  {menu.name}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <App>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                  <CreditCard className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Financial Management
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Manage your accounting, invoicing, and financial reporting
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back,</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {user?.fname ? `${user.fname} ${user.lname}`.trim() : 'Accountant'}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
                  {user?.fname ? user.fname.charAt(0) : 'A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardStats?.totalRevenue?.currency}{dashboardStats?.totalRevenue?.value || '0.00'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current Year</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding Invoices</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboardStats?.outstandingInvoices?.currency}{dashboardStats?.outstandingInvoices?.value || '0.00'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {dashboardStats?.outstandingInvoices?.count || 0} invoices
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending Payments</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {dashboardStats?.pendingPayments?.currency}{dashboardStats?.pendingPayments?.value || '0.00'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {dashboardStats?.pendingPayments?.count || 0} payments
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
                  <Receipt className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboardStats?.profitMargin?.value || '0.0'}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {currencySymbol}{dashboardStats?.profitMargin?.profit || '0.00'} profit
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              href="/accounts/journal-voucher/create"
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">
                  Create Journal Entry
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Create a new journal voucher entry.
              </p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:text-blue-700">
                Create Now
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/accounts/opening-voucher/create"
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                  <Star className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">
                  Opening Balance
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Record opening balances for accounts.
              </p>
              <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium group-hover:text-green-700">
                Create Now
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/accounts/balance-sheet"
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                  <PieChart className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">
                  View Reports
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Access financial reports and analytics.
              </p>
              <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-medium group-hover:text-purple-700">
                View Reports
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* Accounts Sections */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                <Calculator className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white ml-3">
                Accounting Management
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {accountsSections.map((section) => (
                <SectionCard key={section.id} section={section} />
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white ml-3">
                  Recent Transactions
                </h3>
              </div>
              <Link
                href="/accounts/journal-voucher"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentTransactions && recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => {
                  const Icon = getIconComponent(transaction.icon);
                  const colorClasses = getColorClasses(transaction.color, transaction.isCredit);
                  
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${colorClasses.bg} ${colorClasses.text}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{transaction.type}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {transaction.reference} - {transaction.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${colorClasses.text}`}>
                          {transaction.isCredit ? '+' : '-'}{transaction.currency}{transaction.amount}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.timeAgo}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-xl inline-flex">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">No recent transactions found</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Transactions will appear here once you start posting vouchers
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </App>
  );
};

export default AccountsDashboard;
