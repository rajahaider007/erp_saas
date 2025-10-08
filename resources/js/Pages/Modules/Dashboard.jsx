import React from 'react';
import App from '../App.jsx';
import { 
  Package, 
  Grid3X3, 
  ArrowRight, 
  TrendingUp,
  BarChart3,
  Settings,
  Users,
  FileText
} from 'lucide-react';

export default function ModuleDashboard({ moduleName = 'Module' }) {
  return (
    <App>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4 flex items-center">
                <Package className="h-10 w-10 mr-4" />
                {moduleName} Dashboard
              </h1>
              <p className="text-xl text-blue-100 mb-6">
                Manage your {moduleName.toLowerCase()} module features and data
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-blue-100">
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Module Management</span>
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

        {/* Module Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                <FileText className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Records</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                <Grid3X3 className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Features</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
                <Settings className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Settings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Module Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{moduleName} Features</h2>
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {moduleName} Module Dashboard
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This module dashboard is currently under development. Features and statistics will be added soon.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center text-gray-400 text-sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Coming Soon
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
              <span className="text-blue-900 dark:text-blue-100 font-medium">View Records</span>
            </div>
            
            <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
              <span className="text-green-900 dark:text-green-100 font-medium">Manage Users</span>
            </div>
            
            <div className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
              <span className="text-purple-900 dark:text-purple-100 font-medium">Module Settings</span>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
}
