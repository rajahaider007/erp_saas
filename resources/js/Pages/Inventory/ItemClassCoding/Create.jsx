import React, { useState, useEffect } from 'react';
import { Home, List, Plus, Hash, Tag, Package, ScanBarcode, Layers } from 'lucide-react';
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
      <div className="breadcrumbs-description">Configure inventory item classes with traceability controls</div>
    </div>
  );
};

const CreateItemClassCodingForm = () => {
  const {
    errors: pageErrors,
    flash,
    trackingTypeOptions = [],
    abcClassificationOptions = [],
    error,
  } = usePage().props;

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const classFields = [
    {
      name: 'class_code',
      label: 'Class Code',
      type: 'text',
      placeholder: 'Enter class code (e.g., ELEC, FOOD, CHEM)',
      icon: Hash,
      required: true,
    },
    {
      name: 'class_name',
      label: 'Class Name',
      type: 'text',
      placeholder: 'Enter class name',
      icon: Tag,
      required: true,
    },
    {
      name: 'tracking_type',
      label: 'Tracking Type',
      type: 'select',
      placeholder: 'Select tracking type',
      icon: ScanBarcode,
      required: true,
      options: trackingTypeOptions,
    },
    {
      name: 'abc_classification',
      label: 'ABC Classification',
      type: 'select',
      placeholder: 'Select ABC classification',
      icon: Layers,
      required: true,
      options: abcClassificationOptions,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Optional notes for control/audit requirements',
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

    if (!submittedFormData.class_code?.trim()) {
      newErrors.class_code = 'Class code is required';
    }

    if (!submittedFormData.class_name?.trim()) {
      newErrors.class_name = 'Class name is required';
    }

    if (!submittedFormData.tracking_type) {
      newErrors.tracking_type = 'Tracking type is required';
    }

    if (!submittedFormData.abc_classification) {
      newErrors.abc_classification = 'ABC classification is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: 'Please correct the errors below and try again.' });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('class_code', submittedFormData.class_code || '');
    formDataToSend.append('class_name', submittedFormData.class_name || '');
    formDataToSend.append('tracking_type', submittedFormData.tracking_type || '');
    formDataToSend.append('abc_classification', submittedFormData.abc_classification || '');
    formDataToSend.append('description', submittedFormData.description || '');
    formDataToSend.append('is_active', submittedFormData.is_active ? '1' : '0');

    router.post('/inventory/item-class-coding', formDataToSend, {
      forceFormData: true,
      onError: (serverErrors) => {
        setErrors(serverErrors);
      },
    });
  };

  const breadcrumbItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Item Class Coding', icon: List, href: '/inventory/item-class-coding' },
    { label: 'Add Item Class', icon: Plus, href: null },
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
        title="Add Item Class"
        subtitle="Create item classes with traceability standards (link to categories later)"
        fields={classFields}
        onSubmit={handleSubmit}
        submitText="Create Class"
        resetText="Clear Form"
        showReset={true}
        initialData={{
          class_code: '',
          class_name: '',
          tracking_type: 'none',
          abc_classification: 'C',
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
          <CreateItemClassCodingForm />
        </div>
      </div>
    </App>
  );
};

export default Create;
