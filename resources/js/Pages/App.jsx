import React, { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';
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

function AppHead() {
  const { t } = useTranslations();
  const { pageTitle } = usePage().props;
  const appName = t('common.app.name');
  const headTitle = pageTitle
    ? t('common.app.head_with_page', { page: pageTitle, app: appName })
    : t('common.app.head_default');
  return <Head title={headTitle} />;
}

export default function App({ children }) {
  const { locale, supportedLocales } = usePage().props;

  useEffect(() => {
    const info = Array.isArray(supportedLocales) && supportedLocales.find((l) => l.code === locale);
    document.documentElement.lang = locale || 'en';
    document.documentElement.dir = (info && info.dir) || 'ltr';
  }, [locale, supportedLocales]);

  return (
    <LayoutProvider>
      <ThemeWrapper>
        <AppHead />
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <Header />
          <div className="flex min-h-0 flex-1">
            <Sidebar />
            <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4">
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