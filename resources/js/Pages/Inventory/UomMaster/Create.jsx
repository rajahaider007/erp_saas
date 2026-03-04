import React, { useState, useEffect } from 'react';
import { Home, List, Plus, Hash, Tag, Edit3, Droplet } from 'lucide-react';
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
      <div className="breadcrumbs-description">Configure unit of measure master data</div>
    </div>
  );
};

const CreateUomMasterForm = () => {
  const {
    errors: pageErrors,
    flash,
    uom = null,
    uomTypes = [],
    error,
  } = usePage().props;

  const isEditMode = !!uom;
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  // Ensure uomTypes is an array and map it before using in fields
  const formattedUomTypes = (Array.isArray(uomTypes) ? uomTypes : []).map(type => ({ value: type, label: type }));

  const uomFields = [
    {
      name: 'uom_code',
      label: 'UOM Code',
      type: 'text',
      placeholder: 'Enter UOM code (e.g., KG, M, L, PCS, HR)',      icon: Hash,
      required: true,
    },
    {
      name: 'uom_name',
      label: 'UOM Name',
      type: 'text',
      placeholder: 'Enter full UOM name',
      icon: Tag,
      required: true,
    },
    {
      name: 'uom_type',
      label: 'UOM Type',
      type: 'select',
      options: formattedUomTypes,
      required: true,
    },
    {
      name: 'symbol',
      label: 'Symbol',
      type: 'text',
      placeholder: 'Enter symbol (e.g., kg, m, L, pcs)',
      required: true,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter description (max 200 chars)',
      required: false,
    },
    {
      name: 'decimal_precision',
      label: 'Decimal Precision',
      type: 'number',
      placeholder: '0-10',
      required: true,
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

    if (!submittedFormData.uom_code?.trim()) {
      newErrors.uom_code = 'UOM code is required';
    }

    if (!submittedFormData.uom_name?.trim()) {
      newErrors.uom_name = 'UOM name is required';
    }

    if (!submittedFormData.uom_type) {
      newErrors.uom_type = 'UOM type is required';
    }

    if (!submittedFormData.symbol?.trim()) {
      newErrors.symbol = 'Symbol is required';
    }

    if (submittedFormData.decimal_precision === '' || submittedFormData.decimal_precision === null) {
      newErrors.decimal_precision = 'Decimal precision is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: 'Please correct the errors below and try again.' });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('uom_code', submittedFormData.uom_code || '');
    formDataToSend.append('uom_name', submittedFormData.uom_name || '');
    formDataToSend.append('uom_type', submittedFormData.uom_type || '');
    formDataToSend.append('symbol', submittedFormData.symbol || '');
    formDataToSend.append('description', submittedFormData.description || '');
    formDataToSend.append('decimal_precision', submittedFormData.decimal_precision || 0);
    formDataToSend.append('is_active', submittedFormData.is_active ? '1' : '0');

    if (isEditMode) {
      formDataToSend.append('_method', 'PUT');
      router.post(`/inventory/uom-master/${uom.id}`, formDataToSend, {
        forceFormData: true,
        onError: (serverErrors) => {
          setErrors(serverErrors);
        },
      });
    } else {
      router.post('/inventory/uom-master', formDataToSend, {
        forceFormData: true,
        onError: (serverErrors) => {
          setErrors(serverErrors);
        },
      });
    }
  };

  return (
    <App>
      <div className="form-container">
        <Breadcrumbs
          items={[
            { label: 'Home', icon: Home, href: '/' },
            { label: 'Inventory', href: '/inventory' },
            { label: 'UOM Master', href: '/inventory/uom-master' },
            { label: isEditMode ? 'Edit UOM' : 'Create UOM' },
          ]}
        />

        <div className="form-section">
          <div className="form-header">
            <div className="header-info">
              <h2 className="form-title">
                <Droplet size={24} className="title-icon" />
                {isEditMode ? 'Edit Unit of Measure' : 'Create New Unit of Measure'}
              </h2>
              <p className="form-description">
                {isEditMode
                  ? 'Update the unit of measure details below'
                  : 'Add a new unit of measure to your inventory system'}
              </p>
            </div>
          </div>

          {alert && (
            <div className={`alert alert-${alert.type}`}>
              <span>{alert.message}</span>
              <button onClick={() => setAlert(null)} className="alert-close">×</button>
            </div>
          )}

          <GeneralizedForm
            fields={uomFields}
            onSubmit={handleSubmit}
            initialData={uom}
            errors={errors}
            submitButtonLabel={isEditMode ? 'Update UOM' : 'Create UOM'}
            cancelButtonLabel="Cancel"
            onCancel={() => window.history.back()}
          />
        </div>
      </div>
    </App>
  );
};

export default CreateUomMasterForm;
