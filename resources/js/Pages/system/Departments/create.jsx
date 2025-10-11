import React, { useState, useEffect } from 'react';
import { Users, Home, List, Plus, Edit, Building, MapPin, User, Mail, Phone } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import PermissionAwareForm, { PermissionButton } from '../../../Components/PermissionAwareForm';
import { usePermissions } from '../../../hooks/usePermissions';
import App from "../../App.jsx";
import { usePage, router } from '@inertiajs/react';

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
        {usePage().props.department ? 'Update department information' : 'Add a new department for your company'}
      </div>
    </div>
  );
};

// Department Form Component (Unified for Create and Edit)
const DepartmentForm = () => {
  const { errors: pageErrors, flash, department, companies, locations } = usePage().props;
  const isEdit = !!department;
  const [filteredLocations, setFilteredLocations] = useState(locations || []);
  
  // Handle company change to filter locations
  const handleCompanyChange = (companyId, formData, setFormData) => {
    setFormData({ ...formData, company_id: companyId, location_id: '' });
    
    if (companyId) {
      const filtered = locations?.filter(l => l.company_id == companyId) || [];
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations([]);
    }
  };

  // Set initial filtered locations on edit
  useEffect(() => {
    if (isEdit && department?.company_id) {
      const filtered = locations?.filter(l => l.company_id == department.company_id) || [];
      setFilteredLocations(filtered);
    }
  }, [isEdit, department, locations]);

  const fields = [
    { 
      name: 'company_id', 
      label: 'Company', 
      type: 'select', 
      required: true, 
      options: companies?.map(c => ({ value: c.id, label: c.company_name })) || [],
      icon: Building,
      onChange: handleCompanyChange
    },
    { 
      name: 'location_id', 
      label: 'Location', 
      type: 'select', 
      required: true, 
      options: filteredLocations?.map(l => ({ value: l.id, label: l.location_name })) || [],
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
      placeholder: 'Department description',
      rows: 3
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
  ];

  // State for debugging and tracking
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

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

  const handleSubmit = async (submittedFormData) => {
    setAlert(null);

    try {
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.keys(submittedFormData).forEach(key => {
        if (submittedFormData[key] !== null && submittedFormData[key] !== undefined) {
          formData.append(key, submittedFormData[key]);
        }
      });

      // Add _method for edit operations
      if (isEdit) {
        formData.append('_method', 'put');
      }

      const url = isEdit ? `/system/departments/${department.id}` : '/system/departments';

      router.post(url, formData, {
        forceFormData: true,
        onSuccess: (page) => {
          setAlert({
            type: 'success',
            message: isEdit ? 'Department updated successfully!' : 'Department created successfully!'
          });
        },
        onError: (errors) => {
          setErrors(errors);
          setAlert({
            type: 'error',
            message: 'Please correct the errors below and try again.'
          });
        }
      });
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.'
      });
    }
  };

  const handleReset = () => {
    setErrors({});
    setAlert(null);
  };

  // Breadcrumb items configuration
  const breadcrumbItems = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard'
    },
    {
      label: 'System',
      icon: List,
      href: '#'
    },
    {
      label: 'Departments',
      icon: Users,
      href: '/system/departments'
    },
    {
      label: isEdit ? 'Edit Department' : 'Add Department',
      icon: isEdit ? Edit : Plus,
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

      {/* Department Form */}
      <GeneralizedForm
        title={isEdit ? "Edit Department" : "Add Department"}
        subtitle={isEdit ? "Update department details" : "Create a new department for your company"}
        fields={fields}
        onSubmit={handleSubmit}
        submitText={isEdit ? "Update Department" : "Create Department"}
        resetText="Clear Form"
        initialData={{
          company_id: department?.company_id || '',
          location_id: department?.location_id || '',
          department_name: department?.department_name || '',
          description: department?.description || '',
          manager_name: department?.manager_name || '',
          manager_email: department?.manager_email || '',
          manager_phone: department?.manager_phone || '',
          status: department?.status ?? true,
          sort_order: department?.sort_order || 0
        }}
        showReset={true}
      />
    </div>
  );
};

// Main Create Component
const Create = () => {
  const { canAdd } = usePermissions();
  
  return (
    <App>
      {/* Main Content Card */}
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <PermissionAwareForm
            requiredPermission="can_add"
            route="/system/departments"
            fallbackMessage="You don't have permission to create departments. Please contact your administrator."
          >
            <DepartmentForm />
          </PermissionAwareForm>
        </div>
      </div>
    </App>
  );
};

export default Create;
