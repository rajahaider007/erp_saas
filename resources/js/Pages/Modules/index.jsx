import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { usePermissions } from '../../hooks/usePermissions';
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
  Lock,
  Unlock,
  ChevronRight,
  Grid3X3,
  Layout,
  Monitor
} from 'lucide-react';

const ModulesPage = () => {
  const { auth, company } = usePage().props;
  const user = auth?.user;
  const { canView } = usePermissions();

  // Get modules with permissions - Dynamic from database
  const getModules = () => {
    // Get modules from database through availableModules
    const { availableModules } = usePage().props;
    
    // Icon mapping for dynamic modules
    const iconMap = {
      'system': Settings,
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

    // Color gradients for dynamic modules
    const gradientMap = {
      'blue': 'from-blue-500 to-blue-600',
      'green': 'from-green-500 to-green-600',
      'purple': 'from-purple-500 to-purple-600',
      'orange': 'from-orange-500 to-orange-600',
      'emerald': 'from-emerald-500 to-emerald-600',
      'indigo': 'from-indigo-500 to-indigo-600',
      'pink': 'from-pink-500 to-pink-600',
      'cyan': 'from-cyan-500 to-cyan-600',
      'red': 'from-red-500 to-red-600',
      'yellow': 'from-yellow-500 to-yellow-600',
      'teal': 'from-teal-500 to-teal-600',
      'violet': 'from-violet-500 to-violet-600'
    };

    // Generate random gradient if not specified
    const getRandomGradient = () => {
      const gradients = Object.values(gradientMap);
      return gradients[Math.floor(Math.random() * gradients.length)];
    };

    // Create modules array from database data
    const modules = availableModules?.map((module, index) => {
      const Icon = iconMap[module.folder_name?.toLowerCase()] || iconMap.default;
      const gradient = gradientMap[module.color] || getRandomGradient();
      
      return {
        id: module.id,
        name: module.module_name,
        description: module.description || `Access ${module.module_name} module for comprehensive business management`,
        icon: Icon,
        color: module.color || 'blue',
        gradient: gradient,
        route: `/${module.folder_name}/dashboard`,
        hasAccess: true, // All modules from database are accessible
        isDisabled: false,
        features: module.features || ['Management', 'Reports', 'Analytics', 'Settings'],
        status: module.status ? 'active' : 'inactive',
        created_at: module.created_at,
        updated_at: module.updated_at,
        folder_name: module.folder_name,
        slug: module.slug
      };
    }) || [];

    return modules;
  };

  const modules = getModules();
  const accessibleModules = modules.filter(module => module.hasAccess);
  const disabledModules = modules.filter(module => !module.hasAccess);

  const ModuleCard = ({ module, isDisabled = false }) => {
    const Icon = module.icon;
    
    return (
      <div className={`group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl shadow-2xl transition-all duration-700 hover:shadow-3xl dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/50 ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.03] cursor-pointer hover:-translate-y-3'
      }`}>
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-900/10 dark:to-gray-800/5" />
        
        {/* Animated Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-10 transition-all duration-700`} />
        
        {/* Modern Shimmer Effect */}
        {!isDisabled && (
          <div className="absolute inset-0 -top-4 -left-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-700" />
        )}
        
        {/* Card Content - Compact */}
        <div className="relative p-4 z-10">
          {/* Header with Modern Design */}
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${module.gradient} text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
              <Icon className="h-6 w-6" />
            </div>
            
            {isDisabled ? (
              <div className="flex items-center space-x-1 text-gray-400 bg-gray-100/50 dark:bg-gray-700/50 backdrop-blur-sm px-2 py-1 rounded-full border border-gray-200/50">
                <Lock className="h-3 w-3" />
                <span className="text-xs font-medium">Restricted</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-green-600 bg-green-50/80 dark:bg-green-900/20 backdrop-blur-sm px-2 py-1 rounded-full border border-green-200/50 group-hover:bg-green-100/80 dark:group-hover:bg-green-900/30 transition-all duration-300">
                <Unlock className="h-3 w-3" />
                <span className="text-xs font-medium">Active</span>
              </div>
            )}
          </div>

          {/* Module Info - Compact */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
              {module.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300 line-clamp-2">
              {module.description}
            </p>
          </div>

          {/* Enhanced Features - Compact */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {module.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-300 ${
                    isDisabled 
                      ? 'bg-gray-100/50 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400'
                      : `bg-gradient-to-r ${module.gradient} text-white group-hover:shadow-md group-hover:scale-105`
                  }`}
                >
                  {feature}
                </span>
              ))}
              {module.features.length > 3 && (
                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100/50 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
                  +{module.features.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Modern Action Button - Compact */}
          {!isDisabled && (
            <div className="flex items-center justify-between p-2 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-700/80 dark:to-gray-600/80 backdrop-blur-sm rounded-xl group-hover:from-gray-100/80 group-hover:to-gray-200/80 dark:group-hover:from-gray-600/80 dark:group-hover:to-gray-500/80 transition-all duration-300 border border-gray-200/50">
              <span className="text-xs text-gray-700 dark:text-gray-200 font-medium">
                Access Module
              </span>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gray-700 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </div>
          )}
        </div>

        {/* Modern Hover Border with Gradient */}
        {!isDisabled && (
          <div className={`absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r ${module.gradient} opacity-0 group-hover:opacity-100 transition-all duration-700`}
               style={{ padding: '3px' }}>
            <div className="w-full h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl" />
          </div>
        )}

        {/* Enhanced Glow Effect */}
        {!isDisabled && (
          <div className={`absolute -inset-2 bg-gradient-to-r ${module.gradient} rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-700`} />
        )}

        {/* Status Indicator */}
        <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
          module.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
        } group-hover:scale-125 transition-transform duration-300`} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>
      
      {/* Header Section - Compact */}
      <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl shadow-2xl border-b border-white/20 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="p-2 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <Grid3X3 className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              ERP Modules
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-4">
              Access your business modules and manage your organization efficiently.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">System Online</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="font-medium">{modules.length} Modules Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Accessible Modules */}
        {accessibleModules.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                <Unlock className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white ml-3">
                Accessible Modules ({accessibleModules.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {accessibleModules.map((module) => (
                <Link
                  key={module.id}
                  href={module.route}
                  className="block"
                >
                  <ModuleCard module={module} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Disabled Modules */}
        {disabledModules.length > 0 && (
          <div>
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white ml-3">
                Restricted Modules ({disabledModules.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {disabledModules.map((module) => (
                <div key={module.id}>
                  <ModuleCard module={module} isDisabled={true} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {modules.length === 0 && (
          <div className="text-center py-12">
            <div className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 inline-block mb-6">
              <Layout className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Modules Available
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Contact your administrator to get access to modules.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border-t border-white/20 dark:border-gray-700/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Welcome to {company?.company_name || 'ERP Enterprise'} - Your Business Management Solution
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulesPage;