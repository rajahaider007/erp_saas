import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import App from '../../App.jsx';
import { usePermissions } from '../../../hooks/usePermissions';
import {
  Settings,
  Users,
  Shield,
  Database,
  Building,
  Package,
  Layers,
  Menu,
  ChevronRight,
  BarChart3,
  Activity,
  Clock,
  Star
} from 'lucide-react';

const SystemDashboard = () => {
  const { auth, company } = usePage().props;
  const user = auth?.user;
  const { canView } = usePermissions();

  // System module sections and menus
  const systemSections = [
    {
      id: 1,
      name: 'Module Management',
      description: 'Manage system modules and their configurations',
      icon: Package,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      menus: [
        { name: 'Modules', route: '/system/AddModules', icon: Package },
        { name: 'Sections', route: '/system/sections', icon: Layers },
        { name: 'Menus', route: '/system/menus', icon: Menu }
      ]
    },
    {
      id: 2,
      name: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      menus: [
        { name: 'Users', route: '/system/users', icon: Users },
        { name: 'Roles', route: '/system/roles', icon: Shield },
        { name: 'Permissions', route: '/system/permissions', icon: Shield }
      ]
    },
    {
      id: 3,
      name: 'Organization',
      description: 'Manage companies, locations, and departments',
      icon: Building,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      menus: [
        { name: 'Companies', route: '/system/companies', icon: Building },
        { name: 'Locations', route: '/system/locations', icon: Building },
        { name: 'Departments', route: '/system/departments', icon: Users }
      ]
    },
    {
      id: 4,
      name: 'Package Management',
      description: 'Manage packages and their features',
      icon: Package,
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
      menus: [
        { name: 'Packages', route: '/system/packages', icon: Package },
        { name: 'Package Features', route: '/system/package-features', icon: Layers }
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
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                  <Settings className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    System Administration
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Manage your ERP system configuration and settings
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back,</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {user?.fname ? `${user.fname} ${user.lname}`.trim() : 'Administrator'}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Modules</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Companies</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                  <Building className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">System Health</p>
                  <p className="text-2xl font-bold text-green-600">98%</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          {/* System Sections */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <Database className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white ml-3">
                System Management
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {systemSections.map((section) => (
                <SectionCard key={section.id} section={section} />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white ml-3">
                Recent Activity
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">New user registered</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">John Doe joined the system</p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">2 min ago</span>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Module updated</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">HR module configuration changed</p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">1 hour ago</span>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                  <Building className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">Company added</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">New company "Tech Corp" registered</p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">3 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
};

export default SystemDashboard;
