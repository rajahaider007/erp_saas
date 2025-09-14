import React from 'react';
import Header from '@/Components/Layout/Header';
import { Head } from '../Components/Layout/Head';
import { Link } from '@inertiajs/react';

const Welcome = () => {
  return (
    <>
      <Head title="Welcome" />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
              ERP
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Enterprise ERP System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Professional SAAS ERP Solution
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="flex flex-col space-y-4">
              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </Link>
              {/* <Link
                href="/register"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:text-blue-300 dark:bg-blue-900/30 dark:hover:bg-blue-800/30"
              >
                Register
              </Link> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Welcome;