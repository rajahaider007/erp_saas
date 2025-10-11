import React, { useState, useEffect } from 'react';
import { Home, List, Plus, Edit as EditIcon, FileText } from 'lucide-react';
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
        Update section details
      </div>
    </div>
  );
};

const EditSectionForm = () => {
  const { errors: pageErrors, flash, section, modules } = usePage().props;
  
  const fields = [
    { name: 'module_id', label: 'Module', type: 'select', required: true, options: modules?.map(m => ({ value: m.id, label: m.module_name })) || [] },
    { name: 'section_name', label: 'Section Name', type: 'text', placeholder: 'Enter section name', required: true, icon: FileText },
    { name: 'status', label: 'Status', type: 'toggle', required: false },
    { name: 'sort_order', label: 'Order', type: 'number', placeholder: 'Enter display order', required: false, min: 0 },
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

  const handleSubmit = (data) => {
    router.post(`/system/sections/${section.id}`, { ...data, _method: 'put' }, {
      onSuccess: () => {
        setAlert({
          type: 'success',
          message: 'Section updated successfully!'
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
      label: 'Sections',
      icon: FileText,
      href: '/system/sections'
    },
    {
      label: 'Edit Section',
      icon: EditIcon,
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

      <GeneralizedForm
        title={`Edit Section: ${section.section_name}`}
        subtitle="Update section details"
        fields={fields}
        onSubmit={handleSubmit}
        submitText="Update Section"
        resetText="Clear Form"
        initialData={{ 
          module_id: section.module_id, 
          section_name: section.section_name, 
          status: !!section.status, 
          sort_order: section.sort_order ?? 0 
        }}
        showReset={true}
      />
    </div>
  );
};

const Edit = () => {
  const { canEdit } = usePermissions();
  
  return (
    <App>
      {/* Main Content Card */}
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <PermissionAwareForm
            requiredPermission="can_edit"
            route="/system/sections"
            fallbackMessage="You don't have permission to edit sections. Please contact your administrator."
          >
            <EditSectionForm />
          </PermissionAwareForm>
        </div>
      </div>
    </App>
  );
};

export default Edit;


