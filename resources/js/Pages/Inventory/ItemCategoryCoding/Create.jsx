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
      <div className="breadcrumbs-description">Create item categories and assign an item class</div>
    </div>
  );
};

const CreateItemCategoryCodingForm = () => {
  const {
    errors: pageErrors,
    flash,
    itemClassOptions = [],
    category = null,
    edit_mode = false,
    error,
  } = usePage().props;

  const isEditMode = !!edit_mode;
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setErrors(pageErrors);
      setAlert({ type: 'error', message: 'Please correct the errors below.' });
    }
  }, [pageErrors]);

  useEffect(() => {
    if (flash?.success) {
      setAlert({ type: 'success', message: flash.success });
    } else if (flash?.error) {
      setAlert({ type: 'error', message: flash.error });
    }
  }, [flash]);

  const categoryFields = [
    {
      name: 'item_class_id',
      label: 'Item Class',
      type: 'select',
      placeholder: 'Select item class',
      icon: List,
      required: true,
      options: itemClassOptions,
    },
    {
      name: 'category_code',
      label: 'Category Code',
      type: 'text',
      placeholder: 'Enter category code (e.g., RAW-MAT, FIN-GOODS)',
      icon: Hash,
      required: true,
      maxLength: 30,
    },
    {
      name: 'category_name',
      label: 'Category Name',
      type: 'text',
      placeholder: 'Enter category name',
      icon: Tag,
      required: true,
      maxLength: 150,
    },
    ,
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Optional description',
      required: false,
      maxLength: 500,
    },
    {
      name: 'is_active',
      label: 'Active Status',
      type: 'toggle',
      required: false,
      defaultValue: true,
    },
  ];

  const handleSubmit = (formData) => {
    setErrors({});
    setAlert(null);

    const newErrors = {};

    if (!formData.category_code?.trim()) {
      newErrors.category_code = 'Category code is required';
    }

    if (!formData.category_name?.trim()) {
      newErrors.category_name = 'Category name is required';
    }

    if (!formData.item_class_id) {
      newErrors.item_class_id = 'Item class is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: 'Please correct the errors above.' });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('category_code', formData.category_code.trim().toUpperCase());
    formDataToSend.append('category_name', formData.category_name.trim());
    formDataToSend.append('item_class_id', formData.item_class_id);
    formDataToSend.append('description', formData.description?.trim() || '');
    formDataToSend.append('is_active', formData.is_active ? '1' : '0');

    if (isEditMode && category?.id) {
      formDataToSend.append('_method', 'PUT');
      router.post(`/inventory/item-category-coding/${category.id}`, formDataToSend, {
        forceFormData: true,
        onError: (serverErrors) => {
          setErrors(serverErrors);
          setAlert({ type: 'error', message: 'Failed to update category. Please check the errors.' });
        },
      });
    } else {
      router.post('/inventory/item-category-coding', formDataToSend, {
        forceFormData: true,
        onError: (serverErrors) => {
          setErrors(serverErrors);
          setAlert({ type: 'error', message: 'Failed to create category. Please check the errors.' });
        },
      });
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Item Category Coding', icon: List, href: '/inventory/item-category-coding' },
    { label: isEditMode ? 'Edit Category' : 'Create Category', icon: isEditMode ? Edit3 : Plus },
  ];

  return (
    <div className="form-page-wrapper">
      <Breadcrumbs items={breadcrumbItems} />

      {error && (
        <div className="alert-error-themed mb-4">
          <p>{error}</p>
        </div>
      )}

      {alert && (
        <div className={`alert-${alert.type}-themed mb-4`}>
          <p>{alert.message}</p>
          {Object.keys(errors).length > 0 && (
            <ul className="mt-2">
              {Object.entries(errors).map(([key, value]) => (
                <li key={key}>{Array.isArray(value) ? value[0] : value}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <GeneralizedForm
        title={isEditMode ? "Edit Item Category" : "Create Item Category"}
        subtitle={isEditMode ? "Update category details and item class" : "Define a new inventory category and assign item class"}
        fields={categoryFields}
        onSubmit={handleSubmit}
        submitText={isEditMode ? "Update Category" : "Create Category"}
        resetText="Clear Form"
        showReset={!isEditMode}
        initialData={{
          category_code: category?.category_code || '',
          category_name: category?.category_name || '',
          item_class_id: category?.item_class_id ? String(category.item_class_id) : '',
          description: category?.description || '',
          is_active: category?.is_active ?? true,
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
          <CreateItemCategoryCodingForm />
        </div>
      </div>
    </App>
  );
};

export default Create;
