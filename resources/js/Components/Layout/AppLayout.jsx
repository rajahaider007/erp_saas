import React from 'react';
import Head from './Head';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Customizer from './Customizer';
import { useLayout } from '../../Contexts/LayoutContext';

const AppLayout = ({ children, title }) => {
  const { sidebarCollapsed, headerAsSidebar } = useLayout();

  return (
    <>
      <Head title={title} />
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className={`flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300 ${!headerAsSidebar ? (sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64') : ''
            }`}>
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