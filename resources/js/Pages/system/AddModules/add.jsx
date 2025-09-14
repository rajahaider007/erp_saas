import React, { useState, useEffect } from 'react';
import { Type, Folder, Home, List, Plus } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import App from "../../App.jsx";
import { router, usePage } from '@inertiajs/react';

// Debug Panel removed per requirement

// Professional Breadcrumbs Component
const Breadcrumbs = ({ items }) => {
  return (
    <div className="breadcrumbs-themed">
      <nav className="breadcrumbs">
        {items.map((item, index) => (
          <div key={index} className="breadcrumb-item">
            <div className="breadcrumb-item-content">
              {item.icon && (
                <item.icon className={`breadcrumb-icon ${item.href
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

      <div className="breadcrumbs-description">
        Navigate through your application modules
      </div>
    </div>
  );
};

// Add Modules Form Component
const AddModulesForm = () => {
  const { errors: pageErrors, flash } = usePage().props;
  
  const moduleFields = [
    {
      name: 'module_name',
      label: 'Module Name',
      type: 'text',
      placeholder: 'Enter module name',
      icon: Type,
      required: true
    },
    {
      name: 'folder_name',
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
    },
    {
      name: 'sort_order',
      label: 'Order',
      type: 'number',
      placeholder: 'Enter display order',
      required: false,
      min: 0
    }
  ];

  // State for debugging and tracking
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [requestStatus, setRequestStatus] = useState('');

  // Handle page errors from Laravel
  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setErrors(pageErrors);
      setAlert({
        type: 'error',
        message: 'Please correct the errors below and try again.'
      });
    }
  }, [pageErrors]);

  // Handle flash messages
  useEffect(() => {
    if (flash?.success) {
      setAlert({
        type: 'success',
        message: flash.success
      });
    } else if (flash?.error) {
      setAlert({
        type: 'error',
        message: flash.error
      });
    }
  }, [flash]);

  const handleModuleSubmit = async (submittedFormData) => {
    console.log("Form submitted with data:", submittedFormData);
    setErrors({});
    setAlert(null);
    setRequestStatus('Sending request...');

    try {
      // Client-side validation using the actual submitted data
      const newErrors = {};

      if (!submittedFormData.module_name || !submittedFormData.module_name.trim()) {
        newErrors.module_name = 'Module name is required';
      } else if (submittedFormData.module_name.trim().length < 2) {
        newErrors.module_name = 'Module name must be at least 2 characters';
      }

      if (!submittedFormData.folder_name || !submittedFormData.folder_name.trim()) {
        newErrors.folder_name = 'Folder name is required';
      } else if (submittedFormData.folder_name.trim().length < 2) {
        newErrors.folder_name = 'Folder name must be at least 2 characters';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setAlert({
          type: 'error',
          message: 'Please correct the errors below and try again.'
        });
        setRequestStatus('Validation failed');
        return;
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('module_name', submittedFormData.module_name || '');
      formDataToSend.append('folder_name', submittedFormData.folder_name || '');
      formDataToSend.append('status', submittedFormData.status ? '1' : '0');
      if (submittedFormData.image) {
        formDataToSend.append('image', submittedFormData.image);
      }
      formDataToSend.append('description', submittedFormData.description || '');
      formDataToSend.append('sort_order', submittedFormData.sort_order || '0');

      // Debug log
      console.log('Sending FormData with:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      // Make the request using Inertia - FIXED: Use correct route
      router.post('/modules', formDataToSend, {
        forceFormData: true,
        onStart: () => {
          setRequestStatus('Request started');
        },
        onProgress: () => {
          setRequestStatus('Uploading...');
        },
        onSuccess: (page) => {
          setRequestStatus('Success');
          // no debug panel
          setAlert({
            type: 'success',
            message: 'Module created successfully!'
          });
        },
        onError: (errors) => {
          console.log('Server validation errors:', errors);
          setRequestStatus('Server validation failed');
          setErrors(errors);
          setAlert({
            type: 'error',
            message: 'Failed to create module. Please check the errors below.'
          });
        },
        onFinish: () => {
          setRequestStatus('Request finished');
        }
      });

    } catch (error) {
      console.error('Form submission error:', error);
      setRequestStatus('Exception: ' + error.message);
      setAlert({
        type: 'error',
        message: error.message || 'Failed to create module. Please try again.'
      });
    }
  };

  const handleReset = () => {
    setErrors({});
    setAlert(null);
    setRequestStatus('');
    setResponseData(null);
    setLastSubmittedData(null);
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
      href: null
    }
  ];

  return (
    <div>
      {/* Professional Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />


      {/* Alert Messages */}
      {alert && (
        <div className={`mb-4 p-4 rounded-lg animate-slideIn ${alert.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {alert.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{alert.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* FIXED: Simplified GeneralizedForm usage */}
      <GeneralizedForm
        title="Add Module"
        subtitle="Create a new module for your application"
        fields={moduleFields}
        onSubmit={handleModuleSubmit}
        submitText="Create Module"
        resetText="Clear Form"
        initialData={{ 
          module_name: '',
          folder_name: '',
          image: null,
          status: true,
          description: '',
          sort_order: 0
        }}
        showReset={true}
      />

      {/* Debug panel removed */}
    </div>
  );
};

// Main Add Component
const Add = () => {
  return (
    <App>
      {/* Main Content Card */}
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <AddModulesForm />
        </div>
      </div>
    </App>
  );
};

export default Add;