import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import App from '../../App.jsx';
import {
  Settings,
  Users,
  Package,
  ShoppingCart,
  FileText,
  BarChart3,
  Building,
  CreditCard,
  Calendar,
  Mail,
  Bell,
  Shield,
  Database,
  Globe,
  Zap,
  Star,
  ChevronRight,
  Grid3X3,
  Layout,
  Monitor,
  ArrowLeft,
  Home
} from 'lucide-react';

const DynamicModuleDashboard = () => {
  const { module, sections, menus, company } = usePage().props;

  // Icon mapping for sections
  const iconMap = {
    'settings': Settings,
    'users': Users,
    'package': Package,
    'shopping-cart': ShoppingCart,
    'file-text': FileText,
    'bar-chart': BarChart3,
    'building': Building,
    'credit-card': CreditCard,
    'calendar': Calendar,
    'mail': Mail,
    'bell': Bell,
    'shield': Shield,
    'database': Database,
    'globe': Globe,
    'zap': Zap,
    'star': Star,
    'default': Settings
  };

  // Group menus by sections
  const groupedMenus = sections.map(section => ({
    ...section,
    menus: menus.filter(menu => menu.section_id === section.id)
  }));

  const SectionCard = ({ section }) => {
    const Icon = iconMap[section.icon?.toLowerCase()] || iconMap.default;
    
    return (
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6 hover:shadow-2xl transition-all duration-500">
        <div className="flex items-center mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white ml-4">
            {section.section_name}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {section.menus.map((menu) => (
            <Link
              key={menu.id}
              href={menu.route || '#'}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/80 dark:to-gray-600/80 backdrop-blur-sm rounded-xl hover:from-gray-100/80 hover:to-gray-200/80 dark:hover:from-gray-600/80 dark:hover:to-gray-500/80 transition-all duration-300 border border-gray-200/50 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <Settings className="h-4 w-4" />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {menu.menu_name}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <App>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/erp-modules"
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold mb-2">{module.module_name}</h1>
                <p className="text-xl text-blue-100">
                  Access {module.module_name} features and manage your business operations
                </p>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Grid3X3 className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Module Content - Clean Design */}
        <div className="text-center py-12">
          <div className="p-6 rounded-3xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-gray-700/50 inline-block mb-8">
            <Grid3X3 className="h-20 w-20 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to {module.module_name}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            This module is currently under development. We're working hard to bring you the best experience.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>Coming Soon</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>In Development</span>
            </div>
          </div>
        </div>

        {/* Back to Modules */}
        <div className="text-center">
          <Link
            href="/erp-modules"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Modules
          </Link>
        </div>
      </div>
    </App>
  );
};

export default DynamicModuleDashboard;
