import React from 'react';
import App from '@/Pages/App.jsx';

/**
 * Sales module pages: same global shell (sidebar/header/footer) and card chrome
 * as Accounts configuration screens.
 */
export default function SalesPageShell({ children }) {
  return (
    <App>
      <div className="rounded-xl shadow-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </App>
  );
}
