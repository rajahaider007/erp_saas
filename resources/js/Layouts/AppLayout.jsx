import React from 'react';
import { LayoutProvider, useLayout } from '../Contexts/LayoutContext';
import { RahjAiAssistantProvider } from '../Contexts/RahjAiAssistantContext';

import Header from '../Components/Layout/Header';
import Sidebar from '../Components/Layout/Sidebar';
import Footer from '../Components/Layout/Footer';

const AppLayout = ({ children, title }) => {
  return (
    <LayoutProvider>
      <RahjAiAssistantProvider>
        <AppContent title={title}>
          {children}
        </AppContent>
      </RahjAiAssistantProvider>
    </LayoutProvider>
  );
};

const AppContent = ({ children, title }) => {
  const { IntegratedCustomizer } = useLayout();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto transition-all duration-300"
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