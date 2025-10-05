import React from 'react';
import { Link } from '@inertiajs/react';
import App from '../App.jsx';
import FormThemeSystem from './FormThemeSystem';
import { Grid3X3, ArrowRight, Star, Zap } from 'lucide-react';

export default function Dashboard() {
  return (
   <App>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">Welcome to ERP Enterprise</h1>
              <p className="text-xl text-blue-100 mb-6">
                Your comprehensive business management solution
              </p>
              <div className="flex items-center space-x-4">
                <Link
                  href="/erp-modules"
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg"
                >
                  <Grid3X3 className="h-5 w-5 mr-2" />
                  Explore Modules
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
                <div className="flex items-center space-x-2 text-blue-100">
                  <Star className="h-5 w-5" />
                  <span className="font-medium">Professional Edition</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Zap className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/erp-modules"
            className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                <Grid3X3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">
                Modules
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              Access all your business modules and manage your organization efficiently.
            </p>
            <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:text-blue-700">
              Explore Modules
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">
                Analytics
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              View business insights and performance metrics across all modules.
            </p>
            <div className="flex items-center text-gray-400 text-sm">
              Coming Soon
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">
                Quick Actions
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              Perform common tasks and access frequently used features.
            </p>
            <div className="flex items-center text-gray-400 text-sm">
              Coming Soon
            </div>
          </div>
        </div>
        
        {/* Form Theme System */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Form Theme System</h2>
          <FormThemeSystem />
        </div>
      </div>
    </App>
  )
}