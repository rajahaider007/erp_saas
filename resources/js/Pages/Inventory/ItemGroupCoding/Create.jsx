import React, { useState, useEffect } from 'react';
import { Home, List, Plus, Hash, Tag, Edit3 } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import App from '../../App.jsx';
import { router, usePage } from '@inertiajs/react';

const Breadcrumbs = ({ items }) => {
  return (
    <div className="breadcrumbs-themed">
      <nav className="breadcrumbs">
        {items.map((item, index) => (
          <div key={index} className="breadcrumb-item">
            <div className="breadcrumb-item-content">
              {item.icon && (
                <item.icon className={`breadcrumb-icon ${item.href ? 'breadcrumb-icon-link' : 'breadcrumb-icon-current'}`} />
              )}

              {item.href ? (
                <a href={item.href} className="breadcrumb-link-themed">
                  {item.label}
                </a>
              ) : (
                <span className="breadcrumb-current-themed">{item.label}</span>
              )}
            </div>

            {index < items.length - 1 && (
              <div className="breadcrumb-separator breadcrumb-separator-themed">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
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
      <div className="breadcrumbs-description">Configure inventory item groups</div>
    </div>
  );
};

const CreateItemGroupCodingForm = () => {
  const {
    errors: pageErrors,
    flash,
    itemGroup = null,
    error,
  } = usePage().props;

  const isEditMode = !!itemGroup;
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const groupFields = [
    {
      name: 'group_code',
      label: 'Group Code',
      type: 'text',
      placeholder: 'Enter group code (e.g., RAW, FG, SPARE)',
      icon: Hash,
      required: true,
    },
    {
      name: 'group_name',
      label: 'Group Name',
      type: 'text',
      placeholder: 'Enter group name',
      icon: Tag,
      required: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Optional notes',
      required: false,
    },
    {
      name: 'is_active',
      label: 'Status',
      type: 'toggle',
      required: false,
    },
  ];

  useEffect(() => {
    if (error) {
      setAlert({ type: 'error', message: error });
    }
  }, [error]);

  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setErrors(pageErrors);
      setAlert({
        type: 'error',
        message: 'Please correct the errors below and try again.',
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

    const newErrors = {};

    if (!submittedFormData.group_code?.trim()) {
      newErrors.group_code = 'Group code is required';
    }

    if (!submittedFormData.group_name?.trim()) {
      newErrors.group_name = 'Group name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: 'Please correct the errors below and try again.' });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('group_code', submittedFormData.group_code || '');
    formDataToSend.append('group_name', submittedFormData.group_name || '');
    formDataToSend.append('description', submittedFormData.description || '');
    formDataToSend.append('is_active', submittedFormData.is_active ? '1' : '0');

    if (isEditMode) {
      formDataToSend.append('_method', 'PUT');
      router.post(`/inventory/item-group-coding/${itemGroup.id}`, formDataToSend, {
        forceFormData: true,
        onError: (serverErrors) => {
          setErrors(serverErrors);
        },
      });
    } else {
      router.post('/inventory/item-group-coding', formDataToSend, {
        forceFormData: true,
        onError: (serverErrors) => {
          setErrors(serverErrors);
        },
      });
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Item Group Coding', icon: List, href: '/inventory/item-group-coding' },
    { label: isEditMode ? `Edit: ${itemGroup.group_code}` : 'Add Item Group', icon: isEditMode ? Edit3 : Plus, href: null },
  ];

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />

      {alert && (
        <div className={`mb-4 p-3 rounded-lg ${alert.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {alert.message}
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <ul className="list-disc ml-5 space-y-1">
            {Object.entries(errors).map(([key, value]) => (
              <li key={key}>{Array.isArray(value) ? value[0] : value}</li>
            ))}
          </ul>
        </div>
      )}

      <GeneralizedForm
        title={isEditMode ? "Edit Item Group" : "Add Item Group"}
        subtitle={isEditMode ? "Update item group information" : "Create item group (link to categories later)"}
        fields={groupFields}
        onSubmit={handleSubmit}
        submitText={isEditMode ? "Update Group" : "Create Group"}
        resetText="Clear Form"
        showReset={!isEditMode}
        initialData={isEditMode ? {
          group_code: itemGroup.group_code || '',
          group_name: itemGroup.group_name || '',
          description: itemGroup.description || '',
          is_active: itemGroup.is_active ?? true,
        } : {
          group_code: '',
          group_name: '',
          description: '',
          is_active: true,
        }}
      />
    </div>
  );
};

const Create = () => {
  return (
    <App>
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <CreateItemGroupCodingForm />
        </div>
      </div>
    </App>
  );
};

export default Create;
