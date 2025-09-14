import React, { useState } from 'react';
import { MapPin, Home, List, Plus, Building } from 'lucide-react';
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
      {usePage().props?.location ? 'Edit location details' : 'Add new location for your company'}
    </div>
  </div>
);

const LocationForm = () => {
  const { location, companies } = usePage().props;
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [requestStatus, setRequestStatus] = useState('');

  const isEditMode = !!location;

  const fields = [
    { 
      name: 'company_id', 
      label: 'Company', 
      type: 'select', 
      required: true, 
      options: companies.map(c => ({ value: c.id, label: c.company_name })),
      icon: Building
    },
    { 
      name: 'location_name', 
      label: 'Location Name', 
      type: 'text', 
      required: true, 
      placeholder: 'Enter location name (e.g., Main Office, Branch Office)', 
      icon: MapPin 
    },
    { 
      name: 'address', 
      label: 'Address', 
      type: 'text', 
      required: false, 
      placeholder: 'Street address'
    },
    { 
      name: 'city', 
      label: 'City', 
      type: 'text', 
      required: false, 
      placeholder: 'City name'
    },
    { 
      name: 'state', 
      label: 'State/Province', 
      type: 'text', 
      required: false, 
      placeholder: 'State or Province'
    },
    { 
      name: 'country', 
      label: 'Country', 
      type: 'text', 
      required: false, 
      placeholder: 'Country name'
    },
    { 
      name: 'postal_code', 
      label: 'Postal Code', 
      type: 'text', 
      required: false, 
      placeholder: 'ZIP or postal code'
    },
    { 
      name: 'phone', 
      label: 'Phone', 
      type: 'text', 
      required: false, 
      placeholder: 'Contact phone number'
    },
    { 
      name: 'email', 
      label: 'Email', 
      type: 'email', 
      required: false, 
      placeholder: 'Contact email address'
    },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'toggle', 
      required: false 
    },
    { 
      name: 'sort_order', 
      label: 'Sort Order', 
      type: 'number', 
      required: false, 
      min: 0,
      placeholder: 'Display order (0 = first)'
    },
  ];

  const handleSubmit = async (submittedFormData) => {
    setErrors({});
    setAlert(null);
    setRequestStatus('Sending request...');

    const newErrors = {};
    if (!submittedFormData.company_id) {
      newErrors.company_id = 'Please select a company';
    }
    if (!submittedFormData.location_name || !submittedFormData.location_name.trim()) {
      newErrors.location_name = 'Location name is required';
    }
    
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: 'Please correct the errors below and try again.' });
      setRequestStatus('Validation failed');
      return;
    }

    const submitData = {
      ...submittedFormData,
      _method: isEditMode ? 'put' : 'post'
    };

    const url = isEditMode ? `/system/locations/${location.id}` : '/system/locations';
    const method = isEditMode ? 'post' : 'post'; // Using POST with _method for edit

    router[method](url, submitData, {
      onSuccess: () => { 
        setRequestStatus('Success'); 
        setAlert({ type: 'success', message: `Location ${isEditMode ? 'updated' : 'created'} successfully!` }); 
      },
      onError: (errs) => { 
        setErrors(errs); 
        setAlert({ type: 'error', message: `Failed to ${isEditMode ? 'update' : 'create'} location. Please check the errors below.` }); 
        setRequestStatus('Server validation failed'); 
      }
    });
  };

  const breadcrumbItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Locations', icon: List, href: '/system/locations' },
    { label: isEditMode ? 'Edit Location' : 'Add Location', icon: Plus, href: null },
  ];

  const initialData = isEditMode ? {
    company_id: location.company_id,
    location_name: location.location_name,
    address: location.address || '',
    city: location.city || '',
    state: location.state || '',
    country: location.country || '',
    postal_code: location.postal_code || '',
    phone: location.phone || '',
    email: location.email || '',
    status: location.status,
    sort_order: location.sort_order
  } : {
    company_id: '', 
    location_name: '', 
    address: '', 
    city: '', 
    state: '', 
    country: '', 
    postal_code: '', 
    phone: '', 
    email: '', 
    status: true, 
    sort_order: 0 
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isEditMode ? `Edit Location: ${location.location_name}` : 'Add Location'}
            </h1>
            <p className="text-gray-600">
              {isEditMode ? 'Update location details' : 'Create a new location for your company'}
            </p>
          </div>

          <GeneralizedForm
            title=""
            subtitle=""
            fields={fields}
            onSubmit={handleSubmit}
            submitText={isEditMode ? "Update Location" : "Create Location"}
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
        <LocationForm />
      </div>
    </div>
  </App>
);

export default Create;
