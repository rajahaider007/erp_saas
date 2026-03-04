import React, { useState, useEffect } from 'react';
import { Home, List, Plus, Hash, Tag, Edit3, ArrowRight } from 'lucide-react';
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
      <div className="breadcrumbs-description">Configure unit of measure conversions</div>
    </div>
  );
};

const CreateUomConversionForm = () => {
  const {
    errors: pageErrors,
    flash,
    conversion = null,
    uoms = [],
    items = [],
    directionOptions = [],
    roundingRuleOptions = [],
    conversionTypeOptions = [],
    error,
  } = usePage().props;

  const isEditMode = !!conversion;
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  // Ensure arrays
  const formattedUoms = Array.isArray(uoms) ? uoms : [];
  const formattedItems = Array.isArray(items) ? items : [];
  const directionOpts = (Array.isArray(directionOptions) ? directionOptions : []).map(d => ({ value: d, label: d }));
  const roundingOpts = (Array.isArray(roundingRuleOptions) ? roundingRuleOptions : []).map(r => ({ value: r, label: r }));
  const typeOpts = (Array.isArray(conversionTypeOptions) ? conversionTypeOptions : []).map(t => ({ value: t, label: t }));

  const conversionFields = [
    {
      name: 'from_uom_id',
      label: 'From UOM',
      type: 'select',
      options: formattedUoms,
      required: true,
    },
    {
      name: 'to_uom_id',
      label: 'To UOM',
      type: 'select',
      options: formattedUoms,
      required: true,
    },
    {
      name: 'item_id',
      label: 'Item Code (Optional)',
      type: 'select',
      options: formattedItems,
      required: false,
    },
    {
      name: 'conversion_factor',
      label: 'Conversion Factor',
      type: 'number',
      placeholder: 'e.g., 1.5 (1 From UOM = 1.5 To UOM)',
      step: '0.0001',
      required: true,
    },
    {
      name: 'conversion_direction',
      label: 'Conversion Direction',
      type: 'select',
      options: directionOpts,
      required: true,
    },
    {
      name: 'rounding_rule',
      label: 'Rounding Rule',
      type: 'select',
      options: roundingOpts,
      required: true,
    },
    {
      name: 'effective_from',
      label: 'Effective From Date',
      type: 'date',
      required: true,
    },
    {
      name: 'effective_to',
      label: 'Effective To Date',
      type: 'date',
      required: false,
    },
    {
      name: 'conversion_type',
      label: 'Conversion Type',
      type: 'select',
      options: typeOpts,
      required: true,
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      placeholder: 'Enter notes (optional)',
      required: false,
    },
    {
      name: 'is_item_specific',
      label: 'Item-Specific Conversion',
      type: 'toggle',
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

    if (!submittedFormData.from_uom_id) {
      newErrors.from_uom_id = 'From UOM is required';
    }

    if (!submittedFormData.to_uom_id) {
      newErrors.to_uom_id = 'To UOM is required';
    }

    if (submittedFormData.from_uom_id === submittedFormData.to_uom_id) {
      newErrors.to_uom_id = 'From UOM and To UOM cannot be the same';
    }

    if (!submittedFormData.conversion_factor) {
      newErrors.conversion_factor = 'Conversion factor is required';
    }

    if (!submittedFormData.conversion_direction) {
      newErrors.conversion_direction = 'Conversion direction is required';
    }

    if (!submittedFormData.rounding_rule) {
      newErrors.rounding_rule = 'Rounding rule is required';
    }

    if (!submittedFormData.effective_from) {
      newErrors.effective_from = 'Effective from date is required';
    }

    if (!submittedFormData.conversion_type) {
      newErrors.conversion_type = 'Conversion type is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: 'Please correct the errors below and try again.' });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('from_uom_id', submittedFormData.from_uom_id || '');
    formDataToSend.append('to_uom_id', submittedFormData.to_uom_id || '');
    formDataToSend.append('item_id', submittedFormData.item_id || '');
    formDataToSend.append('conversion_factor', submittedFormData.conversion_factor || 0);
    formDataToSend.append('conversion_direction', submittedFormData.conversion_direction || '');
    formDataToSend.append('rounding_rule', submittedFormData.rounding_rule || 'None');
    formDataToSend.append('effective_from', submittedFormData.effective_from || '');
    formDataToSend.append('effective_to', submittedFormData.effective_to || '');
    formDataToSend.append('conversion_type', submittedFormData.conversion_type || 'Standard');
    formDataToSend.append('notes', submittedFormData.notes || '');
    formDataToSend.append('is_item_specific', submittedFormData.is_item_specific ? '1' : '0');
    formDataToSend.append('is_active', submittedFormData.is_active ? '1' : '0');

    if (isEditMode) {
      formDataToSend.append('_method', 'PUT');
      router.post(`/inventory/uom-conversion/${conversion.id}`, formDataToSend, {
        forceFormData: true,
        onError: (serverErrors) => {
          setErrors(serverErrors);
        },
      });
    } else {
      router.post('/inventory/uom-conversion', formDataToSend, {
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
            { label: 'UOM Conversion', href: '/inventory/uom-conversion' },
            { label: isEditMode ? 'Edit Conversion' : 'Create Conversion' },
          ]}
        />

        <div className="form-section">
          <div className="form-header">
            <div className="header-info">
              <h2 className="form-title">
                <ArrowRight size={24} className="title-icon" />
                {isEditMode ? 'Edit Unit Conversion' : 'Create New Unit Conversion'}
              </h2>
              <p className="form-description">
                {isEditMode
                  ? 'Update the unit conversion details below'
                  : 'Add a new conversion rule between units of measure'}
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
            fields={conversionFields}
            onSubmit={handleSubmit}
            initialData={conversion}
            errors={errors}
            submitButtonLabel={isEditMode ? 'Update Conversion' : 'Create Conversion'}
            cancelButtonLabel="Cancel"
            onCancel={() => window.history.back()}
          />
        </div>
      </div>
    </App>
  );
};

export default CreateUomConversionForm;
