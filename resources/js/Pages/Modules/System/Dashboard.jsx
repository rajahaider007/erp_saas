import React from 'react';
import App from '../../App.jsx';
import { useTranslations } from '@/hooks/useTranslations';
import { 
  Settings, 
  Users, 
  Building2, 
  Package, 
  Shield, 
  BarChart3,
  Grid3X3,
  ArrowRight,
  TrendingUp,
  Database,
  Globe,
  Key,
  HardDrive
} from 'lucide-react';

export default function SystemDashboard() {
  const { t } = useTranslations();
  const systemModules = [
    {
      gridKey: 'user_management',
      icon: Users,
      href: '/system/users',
      color: 'bg-blue-500',
      stats: { total: 25, active: 23 }
    },
    {
      gridKey: 'company_management',
      icon: Building2,
      href: '/system/companies',
      color: 'bg-green-500',
      stats: { total: 5, active: 4 }
    },
    {
      gridKey: 'module_management',
      icon: Package,
      href: '/system/AddModules',
      color: 'bg-purple-500',
      stats: { total: 12, active: 10 }
    },
    {
      gridKey: 'package_management',
      icon: Shield,
      href: '/system/packages',
      color: 'bg-orange-500',
      stats: { total: 8, active: 7 }
    },
    {
      gridKey: 'location_management',
      icon: Globe,
      href: '/system/locations',
      color: 'bg-teal-500',
      stats: { total: 15, active: 12 }
    },
    {
      gridKey: 'department_management',
      icon: Grid3X3,
      href: '/system/departments',
      color: 'bg-pink-500',
      stats: { total: 20, active: 18 }
    },
    {
      gridKey: 'currency_management',
      icon: Database,
      href: '/system/currencies',
      color: 'bg-indigo-500',
      stats: { total: 10, active: 8 }
    },
    {
      gridKey: 'menu_management',
      icon: Key,
      href: '/system/menus',
      color: 'bg-red-500',
      stats: { total: 45, active: 42 }
    },
    {
      gridKey: 'storage',
      icon: HardDrive,
      href: '/system/attachment-manager',
      color: 'bg-slate-600',
      stats: { total: 0, active: 0 }
    }
  ];

  const mg = (key) => `modules.system.dashboard.modules_grid.${key}`;

  return (
    <App>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4 flex items-center">
                <Settings className="h-10 w-10 me-4 shrink-0" />
                {t('modules.system.dashboard.title')}
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                {t('modules.system.dashboard.subtitle')}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">{t('modules.system.dashboard.system_administration')}</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <BarChart3 className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                <Users className="h-6 w-6" />
              </div>
              <div className="ms-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('modules.system.dashboard.total_users')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">25</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="ms-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('modules.system.dashboard.companies')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">5</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                <Package className="h-6 w-6" />
              </div>
              <div className="ms-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('modules.system.dashboard.modules')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
                <Shield className="h-6 w-6" />
              </div>
              <div className="ms-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('modules.system.dashboard.packages')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Modules Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('modules.system.dashboard.system_management_modules')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemModules.map((module, index) => (
              <a
                key={index}
                href={module.href}
                className="group bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${module.color} rounded-xl text-white group-hover:scale-110 transition-transform`}>
                    <module.icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-all rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t(`${mg(module.gridKey)}.name`)}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {t(`${mg(module.gridKey)}.description`)}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {t('modules.system.dashboard.label_total')}:{' '}
                      <span className="font-medium text-gray-700 dark:text-gray-200">{module.stats.total}</span>
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      {t('modules.system.dashboard.label_active')}:{' '}
                      <span className="font-medium">{module.stats.active}</span>
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('modules.system.dashboard.quick_actions')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/system/users/create"
              className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 me-3 shrink-0" />
              <span className="text-blue-900 dark:text-blue-100 font-medium">{t('modules.system.dashboard.add_new_user')}</span>
            </a>
            
            <a
              href="/system/companies/create"
              className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <Building2 className="h-5 w-5 text-green-600 dark:text-green-400 me-3 shrink-0" />
              <span className="text-green-900 dark:text-green-100 font-medium">{t('modules.system.dashboard.add_company')}</span>
            </a>
            
            <a
              href="/system/AddModules/add"
              className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Package className="h-5 w-5 text-purple-600 dark:text-purple-400 me-3 shrink-0" />
              <span className="text-purple-900 dark:text-purple-100 font-medium">{t('modules.system.dashboard.create_module')}</span>
            </a>
            
            <a
              href="/system/attachment-manager"
              className="flex items-center p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/30 transition-colors"
            >
              <HardDrive className="h-5 w-5 text-slate-600 dark:text-slate-400 me-3 shrink-0" />
              <span className="text-slate-900 dark:text-slate-100 font-medium">{t('modules.system.dashboard.storage_attachments')}</span>
            </a>
          </div>
        </div>
      </div>
    </App>
  );
}
