import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Head } from './Head';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Customizer from './Customizer';

const AppLayout = ({ children, title }) => {
  const { locale, supportedLocales } = usePage().props;

  // Set document direction and lang for RTL (e.g. Urdu) and accessibility
  useEffect(() => {
    const info = Array.isArray(supportedLocales) && supportedLocales.find((l) => l.code === locale);
    document.documentElement.lang = locale || 'en';
    document.documentElement.dir = (info && info.dir) || 'ltr';
  }, [locale, supportedLocales]);

  return (
    <>
      <Head title={title} />
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300">
            <div className="container mx-auto px-4 py-6">
              {children}
            </div>
          </main>
        </div>
        <Footer />
        <Customizer />
      </div>
    </>
  );
};

export default AppLayout;