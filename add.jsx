import React, { useState } from 'react';
import { Type, Folder, ChevronRight, Home, List, Plus } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import App from "../../App.jsx";

// Professional Breadcrumbs Component
const Breadcrumbs = ({ items }) => {
  return (
    <div className="breadcrumbs-themed">
      <nav className="breadcrumbs">
        {items.map((item, index) => (
          <div key={index} className="breadcrumb-item">
            {/* Breadcrumb Item */}
            <div className="breadcrumb-item-content">
              {item.icon && (
                <item.icon className={`breadcrumb-icon ${
                  item.href 
                    ? 'breadcrumb-icon-link' 
                    : 'breadcrumb-icon-current'
                }`} />
              )}

              {item.href ? (
                <a
                  href={item.href}
                  className="breadcrumb-link-themed"
                >
                  {item.label}
                </a>
              ) : (
                <span className="breadcrumb-current-themed">
                  {item.label}
                </span>
              )}
            </div>
            
            {/* Separator */}
            {index < items.length - 1 && (
              <div className="breadcrumb-separator breadcrumb-separator-themed">
                <svg 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className="w-full h-full"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </nav>
      
      {/* Description using themed styles */}
      <div className="breadcrumbs-description">
        Navigate through your application modules
      </div>
    </div>
  );
};
// Add Modules Form Component
const AddModulesForm = () => {
  const moduleFields = [
    {
      name: 'moduleName',
      label: 'Module Name',
      type: 'text',
      placeholder: 'Enter module name',
      icon: Type,
      required: true
    },
    {
      name: 'folderName',
      label: 'Folder Name',
      type: 'text',
      placeholder: 'Enter folder name',
      icon: Folder,
      required: true
    },
    {
      name: 'image',
      label: 'Module Image',
      type: 'file-image',
      placeholder: 'Drag & drop module image or click to select',
      required: false
    },
    {
      name: 'status',
      label: 'Status',
      type: 'toggle',
      required: false
    }
  ];

  const handleModuleSubmit = async (formData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Here you would typically make an API call
          console.log('Module Form Data:', formData);

          // Example API call structure:
          // const response = await fetch('/api/modules', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(formData)
          // });

          // if (!response.ok) throw new Error('Failed to create module');

          resolve();
        } catch (error) {
          reject(new Error('Failed to create module. Please try again.'));
        }
      }, 2000);
    });
  };

  // Breadcrumb items configuration with correct routes
  const breadcrumbItems = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard'
    },
    {
      label: 'Modules',
      icon: List,
      href: '/system/AddModules'
    },
    {
      label: 'Add Module',
      icon: Plus,
      href: null // Current page, no link
    }
  ];

  return (
    <div>
      {/* Professional Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Form */}
      <GeneralizedForm
        title="Add Module"
        subtitle="Create a new module for your application"
        fields={moduleFields}
        onSubmit={handleModuleSubmit}
        submitText="Create Module"
        resetText="Clear Form"
        initialData={{ status: true }}
        showReset={true}
      />
    </div>
  );
};

// Main Add Component
const Add = () => {
  return (
    <App>
    
        {/* Main Content Card */}
        <div className=" rounded-xl shadow-lg form-container border-slate-200">
          <div className="p-6">
            <AddModulesForm />
          </div>
        </div>
      
    </App>
  );
};

export default Add;