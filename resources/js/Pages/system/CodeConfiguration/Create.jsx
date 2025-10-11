import React, { useState, useEffect } from 'react';
import { Code, Home, List, Plus, Edit, Building2, MapPin } from 'lucide-react';
import App from "../../App.jsx";
import GeneralizedForm from '../../../Components/GeneralizedForm';
import { usePage, router } from '@inertiajs/react';

const Breadcrumbs = ({ items }) => (
  <div className="breadcrumbs-themed">
    <nav className="breadcrumbs">
      {items.map((item, idx) => (
        <div key={idx} className="breadcrumb-item">
          <div className="breadcrumb-item-content">
            {item.icon && (<item.icon className={`breadcrumb-icon ${item.href ? 'breadcrumb-icon-link' : 'breadcrumb-icon-current'}`} />)}
            {item.href ? (<a href={item.href} className="breadcrumb-link-themed">{item.label}</a>) : (<span className="breadcrumb-current-themed">{item.label}</span>)}
          </div>
          {idx < items.length - 1 && (
            <div className="breadcrumb-separator breadcrumb-separator-themed">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            </div>
          )}
        </div>
      ))}
    </nav>
    <div className="breadcrumbs-description">
      {usePage().props?.configuration ? 'Update code configuration settings' : 'Create a new code configuration for account coding'}
    </div>
  </div>
);

const CodeConfigurationForm = () => {
  const { configuration, companies, locations, codeTypes } = usePage().props;
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [requestStatus, setRequestStatus] = useState('');
  const [filteredLocations, setFilteredLocations] = useState(locations || []);

  const isEditMode = !!configuration;

  const handleCompanyChange = (companyId, formData, setFormData) => {
    setFormData({ ...formData, company_id: companyId, location_id: '' });
    if (companyId) {
      const filtered = locations.filter(loc => loc.company_id == companyId);
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(locations);
    }
  };

  const fields = [
    { 
      name: 'company_id', 
      label: 'Company', 
      type: 'select', 
      required: false, 
      options: [
        { value: '', label: 'All Companies (Parent Level)' },
        ...companies.map(c => ({ value: c.id, label: c.name }))
      ],
      icon: Building2,
      onChange: handleCompanyChange
    },
    { 
      name: 'location_id', 
      label: 'Location', 
      type: 'select', 
      required: false, 
      options: [
        { value: '', label: 'All Locations' },
        ...filteredLocations.map(l => ({ value: l.id, label: l.name }))
      ],
      icon: MapPin
    },
    { 
      name: 'code_type', 
      label: 'Code Type', 
      type: 'select', 
      required: true, 
      options: codeTypes.map(t => ({ value: t.value, label: t.label })),
      icon: Code
    },
    { 
      name: 'code_name', 
      label: 'Code Name', 
      type: 'text', 
      required: true, 
      placeholder: 'Enter display name (e.g., Customer Code)', 
      icon: Code 
    },
    { 
      name: 'account_level', 
      label: 'Account Level', 
      type: 'select', 
      required: true, 
      options: [
        { value: 2, label: 'Level 2 - Sub Account' },
        { value: 3, label: 'Level 3 - Detail Account' }
      ]
    },
    { 
      name: 'prefix', 
      label: 'Code Prefix', 
      type: 'text', 
      required: false, 
      placeholder: 'e.g., CUST, BANK, VEND (optional)'
    },
    { 
      name: 'separator', 
      label: 'Separator', 
      type: 'text', 
      required: false, 
      placeholder: 'e.g., - or / (default: -)',
      maxLength: 5
    },
    { 
      name: 'number_length', 
      label: 'Number Length', 
      type: 'number', 
      required: true, 
      min: 1,
      max: 10,
      placeholder: 'Number of digits (e.g., 4 for 0001)'
    },
    { 
      name: 'next_number', 
      label: 'Next Number', 
      type: 'number', 
      required: true, 
      min: 1,
      placeholder: 'Starting number (e.g., 1)'
    },
    { 
      name: 'description', 
      label: 'Description', 
      type: 'textarea', 
      required: false, 
      placeholder: 'Describe the purpose of this code configuration',
      rows: 3
    },
    { 
      name: 'is_active', 
      label: 'Active', 
      type: 'toggle', 
      required: false 
    },
  ];

  useEffect(() => {
    if (isEditMode && configuration.company_id) {
      const filtered = locations.filter(loc => loc.company_id == configuration.company_id);
      setFilteredLocations(filtered);
    }
  }, [isEditMode]);

  const handleSubmit = async (submittedFormData) => {
    setErrors({});
    setAlert(null);
    setRequestStatus('Sending request...');

    const newErrors = {};
    if (!submittedFormData.code_type || !submittedFormData.code_type.trim()) {
      newErrors.code_type = 'Code type is required';
    }
    if (!submittedFormData.code_name || !submittedFormData.code_name.trim()) {
      newErrors.code_name = 'Code name is required';
    }
    if (!submittedFormData.account_level) {
      newErrors.account_level = 'Account level is required';
    }
    if (!submittedFormData.number_length || submittedFormData.number_length < 1) {
      newErrors.number_length = 'Number length must be at least 1';
    }
    if (!submittedFormData.next_number || submittedFormData.next_number < 1) {
      newErrors.next_number = 'Next number must be at least 1';
    }
    
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: 'Please correct the errors below and try again.' });
      setRequestStatus('Validation failed');
      return;
    }

    const submitData = {
      ...submittedFormData,
      separator: submittedFormData.separator || '-',
      _method: isEditMode ? 'put' : 'post'
    };

    const url = isEditMode ? `/system/code-configurations/${configuration.id}` : '/system/code-configurations';
    const method = isEditMode ? 'post' : 'post';

    router[method](url, submitData, {
      onSuccess: () => { 
        setRequestStatus('Success'); 
        setAlert({ type: 'success', message: `Code configuration ${isEditMode ? 'updated' : 'created'} successfully!` }); 
      },
      onError: (errs) => { 
        setErrors(errs); 
        setAlert({ type: 'error', message: `Failed to ${isEditMode ? 'update' : 'create'} code configuration. Please check the errors below.` }); 
        setRequestStatus('Server validation failed'); 
      }
    });
  };

  const breadcrumbItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Code Configurations', icon: List, href: '/system/code-configurations' },
    { label: isEditMode ? 'Edit Configuration' : 'Add Configuration', icon: isEditMode ? Edit : Plus, href: null },
  ];

  const initialData = isEditMode ? {
    company_id: configuration.company_id || '',
    location_id: configuration.location_id || '',
    code_type: configuration.code_type,
    code_name: configuration.code_name,
    account_level: configuration.account_level,
    prefix: configuration.prefix || '',
    separator: configuration.separator || '-',
    number_length: configuration.number_length,
    next_number: configuration.next_number,
    description: configuration.description || '',
    is_active: configuration.is_active
  } : {
    company_id: '', 
    location_id: '', 
    code_type: '', 
    code_name: '', 
    account_level: 2, 
    prefix: '', 
    separator: '-', 
    number_length: 4, 
    next_number: 1, 
    description: '', 
    is_active: true 
  };

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />
      {alert && (
        <div className={`mb-4 p-4 rounded-lg animate-slideIn ${alert.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {alert.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              )}
            </div>
            <div className="ml-3"><p className="text-sm font-medium">{alert.message}</p></div>
          </div>
        </div>
      )}
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Code className="w-7 h-7 text-blue-600" />
              {isEditMode ? `Edit Configuration: ${configuration.code_name}` : 'Add Code Configuration'}
            </h1>
            <p className="text-gray-600">
              {isEditMode ? 'Update code configuration details and settings' : 'Create a new code configuration for account coding structure'}
            </p>
          </div>

          <GeneralizedForm
            title=""
            subtitle=""
            fields={fields}
            onSubmit={handleSubmit}
            submitText={isEditMode ? "Update Configuration" : "Create Configuration"}
            resetText={isEditMode ? "Reset Changes" : "Clear Form"}
            initialData={initialData}
            showReset={true}
          />
        </div>
      </div>
    </div>
  );
};

const Create = () => (
  <App>
    <div className="rounded-xl shadow-lg form-container border-slate-200">
      <div className="p-6">
        <CodeConfigurationForm />
      </div>
    </div>
  </App>
);

export default Create;

