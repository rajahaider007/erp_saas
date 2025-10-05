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
  const { auth, company } = usePage().props;
  const user = auth?.user;
  const { canView } = usePermissions();

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
        { name: 'Journal Entries', route: '/accounts/journal-entries', icon: Edit },
        { name: 'Trial Balance', route: '/accounts/trial-balance', icon: BarChart3 }
      ]
    },
    {
      id: 2,
      name: 'Accounts Payable',
      description: 'Manage vendor invoices and payments',
      icon: Receipt,
      color: 'red',
      gradient: 'from-red-500 to-red-600',
      menus: [
        { name: 'Vendor Invoices', route: '/accounts/vendor-invoices', icon: Receipt },
        { name: 'Payments', route: '/accounts/payments', icon: CreditCard },
        { name: 'Aging Report', route: '/accounts/aging-report', icon: TrendingUp }
      ]
    },
    {
      id: 3,
      name: 'Accounts Receivable',
      description: 'Manage customer invoices and collections',
      icon: DollarSign,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      menus: [
        { name: 'Customer Invoices', route: '/accounts/customer-invoices', icon: FileText },
        { name: 'Collections', route: '/accounts/collections', icon: Banknote },
        { name: 'Aging Report', route: '/accounts/receivable-aging', icon: TrendingUp }
      ]
    },
    {
      id: 4,
      name: 'Financial Reports',
      description: 'Generate financial statements and reports',
      icon: PieChart,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      menus: [
        { name: 'Profit & Loss', route: '/accounts/profit-loss', icon: TrendingUp },
        { name: 'Balance Sheet', route: '/accounts/balance-sheet', icon: BarChart3 },
        { name: 'Cash Flow', route: '/accounts/cash-flow', icon: Activity }
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
                  <p className="text-2xl font-bold text-green-600">$125,430</p>
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
                  <p className="text-2xl font-bold text-blue-600">$45,230</p>
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
                  <p className="text-2xl font-bold text-orange-600">$12,450</p>
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
                  <p className="text-2xl font-bold text-purple-600">23.5%</p>
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
              href="/accounts/invoices/create"
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">
                  Create Invoice
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Generate a new invoice for your customers.
              </p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:text-blue-700">
                Create Now
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/accounts/payments/create"
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">
                  Record Payment
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Record a payment received from customers.
              </p>
              <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium group-hover:text-green-700">
                Record Now
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              href="/accounts/reports"
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
                href="/accounts/transactions"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Payment Received</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Invoice #INV-001 from ABC Corp</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+$2,500.00</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Vendor Payment</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Payment to XYZ Supplies</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">-$850.00</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Invoice Created</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Invoice #INV-002 for DEF Ltd</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">$1,200.00</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
};

export default AccountsDashboard;
