import React from 'react';
import { LayoutProvider, useLayout } from './Contexts/LayoutContext';

import Header from './Components/Layout/Header';
import Sidebar from './Components/Layout/Sidebar';
import Footer from './Components/Layout/Footer';

const AppLayout = ({ children, title }) => {
  return (
    <LayoutProvider>
      <AppContent title={title}>
        {children}
      </AppContent>
    </LayoutProvider>
  );
};

const AppContent = ({ children, title }) => {
  const { IntegratedCustomizer } = useLayout();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main
          className={`
    flex-1  overflow-y-auto transition-all duration-300
    ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
  `}
        >
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>

      </div>
      <Footer />

      {/* This is now included from the context */}
      <IntegratedCustomizer />
    </div>
  );
};

export default AppLayout;