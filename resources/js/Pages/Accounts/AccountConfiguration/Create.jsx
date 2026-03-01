import React, { useState, useEffect } from 'react';
import { Home, List, Plus, Database } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import App from "../../App.jsx";
import { router, usePage } from '@inertiajs/react';

// Breadcrumbs Component
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
                <a href={item.href} className="breadcrumb-link-themed">
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
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="breadcrumbs-description">
        Configure chart of accounts for system functions
      </div>
    </div>
  );
};

// Create/Edit Account Configuration Form
const CreateAccountConfigurationForm = () => {
  const { errors: pageErrors, flash, id, edit_mode, configuration, accounts = [], configTypes = {} } = usePage().props;
  
  const accountOptions = (accounts || []).map(acc => ({
    value: acc.value,
    label: acc.label
  }));

  const configTypeOptions = Object.entries(configTypes || {}).map(([key, label]) => ({
    value: key,
    label: label
  }));

  const configFields = [
    {
      name: 'account_id',
      label: 'Select Account',
      type: 'select',
      placeholder: 'Search and select account',
      icon: Database,
      required: true,
      options: accountOptions
    },
    {
      name: 'config_type',
      label: 'Configuration Type',
      type: 'select',
      placeholder: 'What is this account used for?',
      icon: Home,
      required: true,
      options: configTypeOptions
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Optional: Notes about this configuration',
      icon: null,
      required: false
    },
    {
      name: 'is_active',
      label: 'Status',
      type: 'toggle',
      required: false
    }
  ];

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [requestStatus, setRequestStatus] = useState('');

  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setErrors(pageErrors);
      setAlert({
        type: 'error',
        message: 'Please correct the errors below and try again.'
      });
    }
  }, [pageErrors]);

  useEffect(() => {
    if (flash?.success) {
      setAlert({ type: 'success', message: flash.success });
    } else if (flash?.error) {
      setAlert({ type: 'error', message: flash.error });
    }
  }, [flash]);

  const handleSubmit = async (submittedFormData) => {
    setErrors({});
    setAlert(null);
    setRequestStatus('Sending request...');

    try {
      const newErrors = {};

      if (!submittedFormData.account_id) {
        newErrors.account_id = 'Account is required';
      }

      if (!submittedFormData.config_type) {
        newErrors.config_type = 'Configuration type is required';
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

      const formDataToSend = new FormData();
      formDataToSend.append('account_id', submittedFormData.account_id || '');
      formDataToSend.append('config_type', submittedFormData.config_type || '');
      formDataToSend.append('description', submittedFormData.description || '');
      formDataToSend.append('is_active', submittedFormData.is_active ? '1' : '0');

      const isEdit = edit_mode && id;
      const url = isEdit ? `/accounts/account-configuration/${id}` : '/accounts/account-configuration';
      
      if (isEdit) {
        formDataToSend.append('_method', 'PUT');
      }

      router.post(url, formDataToSend, {
        forceFormData: true,
        onStart: () => setRequestStatus('Request started'),
        onProgress: () => setRequestStatus('Uploading...'),
        onSuccess: (page) => setRequestStatus('Success'),
        onError: (errors) => {
          console.log('Server validation errors:', errors);
          setRequestStatus('Server validation failed');
          setErrors(errors);
        },
        onFinish: () => setRequestStatus('Request finished')
      });

    } catch (error) {
      console.error('Form submission error:', error);
      setRequestStatus('Exception: ' + error.message);
    }
  };

  const isEdit = edit_mode && id;

  const breadcrumbItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Account Configuration', icon: List, href: '/accounts/account-configuration' },
    { label: isEdit ? 'Edit Configuration' : 'Add Configuration', icon: Plus, href: null }
  ];

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />

      <GeneralizedForm
        title={isEdit ? "Edit Account Configuration" : "Add Account Configuration"}
        subtitle={isEdit ? "Update account mapping for system function" : "Map a chart of account to a system function"}
        fields={configFields}
        onSubmit={handleSubmit}
        submitText={isEdit ? "Update Configuration" : "Create Configuration"}
        resetText="Clear Form"
        initialData={isEdit && configuration ? {
          account_id: configuration.account_id || '',
          config_type: configuration.config_type || '',
          description: configuration.description || '',
          is_active: configuration.is_active || true
        } : {
          account_id: '',
          config_type: '',
          description: '',
          is_active: true
        }}
        showReset={true}
      />
    </div>
  );
};

// Main Create Component
const Create = () => {
  return (
    <App>
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <CreateAccountConfigurationForm />
        </div>
      </div>
    </App>
  );
};

export default Create;
