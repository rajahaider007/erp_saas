import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Home, List, Plus, Building, MapPin, User, Mail, Phone } from 'lucide-react';
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
      {usePage().props?.department ? 'Edit department details' : 'Add new department for your company'}
    </div>
  </div>
);

const DepartmentForm = () => {
  const { department, companies, locations } = usePage().props;
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [requestStatus, setRequestStatus] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState(department?.company_id || '');
  const [availableLocations, setAvailableLocations] = useState([]);

  const isEditMode = !!department;

  // Filter locations based on selected company
  useEffect(() => {
    if (selectedCompanyId) {
      setAvailableLocations(locations.filter(l => l.company_id == selectedCompanyId));
    } else {
      setAvailableLocations([]);
    }
  }, [selectedCompanyId, locations]);

  // Handle company selection change
  const handleCompanyChange = useCallback((companyId) => {
    setSelectedCompanyId(companyId);
  }, []);

  const fields = useMemo(() => [
    { 
      name: 'company_id', 
      label: 'Company', 
      type: 'select', 
      required: true, 
      options: companies.map(c => ({ value: c.id, label: c.company_name })),
      icon: Building,
      onChange: handleCompanyChange
    },
    { 
      name: 'location_id', 
      label: 'Location', 
      type: 'select', 
      required: true, 
      options: availableLocations.map(l => ({ value: l.id, label: l.location_name })),
      icon: MapPin
    },
    { 
      name: 'department_name', 
      label: 'Department Name', 
      type: 'text', 
      required: true, 
      placeholder: 'Enter department name (e.g., Human Resources, IT)', 
      icon: Users 
    },
    { 
      name: 'description', 
      label: 'Description', 
      type: 'textarea', 
      required: false, 
      placeholder: 'Department description'
    },
    { 
      name: 'manager_name', 
      label: 'Manager Name', 
      type: 'text', 
      required: false, 
      placeholder: 'Department manager name',
      icon: User
    },
    { 
      name: 'manager_email', 
      label: 'Manager Email', 
      type: 'email', 
      required: false, 
      placeholder: 'Manager email address',
      icon: Mail
    },
    { 
      name: 'manager_phone', 
      label: 'Manager Phone', 
      type: 'text', 
      required: false, 
      placeholder: 'Manager phone number',
      icon: Phone
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
  ], [companies, availableLocations, handleCompanyChange]);

  const handleSubmit = async (submittedFormData) => {
    setErrors({});
    setAlert(null);
    setRequestStatus('Sending request...');

    const newErrors = {};
    if (!submittedFormData.company_id) {
      newErrors.company_id = 'Please select a company';
    }
    if (!submittedFormData.location_id) {
      newErrors.location_id = 'Please select a location';
    }
    if (!submittedFormData.department_name || !submittedFormData.department_name.trim()) {
      newErrors.department_name = 'Department name is required';
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

    const url = isEditMode ? `/system/departments/${department.id}` : '/system/departments';
    const method = isEditMode ? 'post' : 'post'; // Using POST with _method for edit

    router[method](url, submitData, {
      onSuccess: () => { 
        setRequestStatus('Success'); 
        setAlert({ type: 'success', message: `Department ${isEditMode ? 'updated' : 'created'} successfully!` }); 
      },
      onError: (errs) => { 
        setErrors(errs); 
        setAlert({ type: 'error', message: `Failed to ${isEditMode ? 'update' : 'create'} department. Please check the errors below.` }); 
        setRequestStatus('Server validation failed'); 
      }
    });
  };

  const breadcrumbItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Departments', icon: List, href: '/system/departments' },
    { label: isEditMode ? 'Edit Department' : 'Add Department', icon: Plus, href: null },
  ];

  const initialData = isEditMode ? {
    company_id: department.company_id,
    location_id: department.location_id,
    department_name: department.department_name,
    description: department.description || '',
    manager_name: department.manager_name || '',
    manager_email: department.manager_email || '',
    manager_phone: department.manager_phone || '',
    status: department.status,
    sort_order: department.sort_order
  } : {
    company_id: '', 
    location_id: '', 
    department_name: '', 
    description: '', 
    manager_name: '', 
    manager_email: '', 
    manager_phone: '', 
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
              {isEditMode ? `Edit Department: ${department.department_name}` : 'Add Department'}
            </h1>
            <p className="text-gray-600">
              {isEditMode ? 'Update department details' : 'Create a new department for your company'}
            </p>
          </div>

          <GeneralizedForm
            title=""
            subtitle=""
            fields={fields}
            onSubmit={handleSubmit}
            submitText={isEditMode ? "Update Department" : "Create Department"}
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
        <DepartmentForm />
      </div>
    </div>
  </App>
);

export default Create;
