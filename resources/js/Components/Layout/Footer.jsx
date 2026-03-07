import React from 'react';
import { Link } from '@inertiajs/react';
import { HelpCircle } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`
        mt-auto border-t border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-900
        transition-colors duration-200
      `}
    >
      <div className="mx-auto max-w-full px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          {/* Left: Copyright + app name */}
          <p className="text-xs text-gray-500 dark:text-gray-400 order-2 sm:order-1">
            © {currentYear} ERP System
          </p>

          {/* Right: Optional links + version */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 order-1 sm:order-2">
            <Link
              href="/help"
              className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Help
            </Link>
            <Link
              href="/terms"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Privacy
            </Link>
            <span className="text-gray-400 dark:text-gray-500" aria-hidden="true">
              •
            </span>
            <span className="tabular-nums">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
