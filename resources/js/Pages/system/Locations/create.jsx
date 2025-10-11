import React, { useState, useEffect } from 'react';
import { MapPin, Home, List, Plus, Edit, Building } from 'lucide-react';
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
        {usePage().props.location ? 'Update location information' : 'Add a new location for your company'}
      </div>
    </div>
  );
};

// Location Form Component (Unified for Create and Edit)
const LocationForm = () => {
  const { errors: pageErrors, flash, location, companies } = usePage().props;
  const isEdit = !!location;
  
  const fields = [
    { 
      name: 'company_id', 
      label: 'Company', 
      type: 'select', 
      required: true, 
      options: companies?.map(c => ({ value: c.id, label: c.company_name })) || [],
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

      const url = isEdit ? `/system/locations/${location.id}` : '/system/locations';

      router.post(url, formData, {
        forceFormData: true,
        onSuccess: (page) => {
          setAlert({
            type: 'success',
            message: isEdit ? 'Location updated successfully!' : 'Location created successfully!'
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
      label: 'Locations',
      icon: MapPin,
      href: '/system/locations'
    },
    {
      label: isEdit ? 'Edit Location' : 'Add Location',
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

      {/* Location Form */}
      <GeneralizedForm
        title={isEdit ? "Edit Location" : "Add Location"}
        subtitle={isEdit ? "Update location details" : "Create a new location for your company"}
        fields={fields}
        onSubmit={handleSubmit}
        submitText={isEdit ? "Update Location" : "Create Location"}
        resetText="Clear Form"
        initialData={{
          company_id: location?.company_id || '',
          location_name: location?.location_name || '',
          address: location?.address || '',
          city: location?.city || '',
          state: location?.state || '',
          country: location?.country || '',
          postal_code: location?.postal_code || '',
          phone: location?.phone || '',
          email: location?.email || '',
          status: location?.status ?? true,
          sort_order: location?.sort_order || 0
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
            route="/system/locations"
            fallbackMessage="You don't have permission to create locations. Please contact your administrator."
          >
            <LocationForm />
          </PermissionAwareForm>
        </div>
      </div>
    </App>
  );
};

export default Create;
