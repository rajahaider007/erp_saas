import React, { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { LayoutProvider, useLayout } from '@/Contexts/LayoutContext';
import Header from '@/Components/Layout/Header';
import Sidebar from '@/Components/Layout/Sidebar';
import Footer from '@/Components/Layout/Footer';
import LicenseAlert from '@/Components/LicenseAlert';

// ThemeWrapper component to handle dark mode class
const ThemeWrapper = ({ children }) => {
  const { theme } = useLayout();

  useEffect(() => {
    // Apply theme class to document element
    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', systemDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  return children;
};

export default function App({ children }) {
  return (
    <LayoutProvider>
      <ThemeWrapper>
        <Head title={usePage().props?.pageTitle ? `${usePage().props.pageTitle} - ERP System` : 'ERP System'} />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-4">
              {children}
            </main>
          </div>
          <Footer />
          <LicenseAlert />
        </div>
      </ThemeWrapper>
    </LayoutProvider>
  );
}