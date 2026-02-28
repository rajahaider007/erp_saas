import React, { useState, useEffect } from 'react';
import { Type, Hash, Home, List, Plus, Settings, Calendar, ArrowLeft } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import App from "../../App.jsx";
import { router, usePage } from '@inertiajs/react';

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
        Navigate through your application modules
      </div>
    </div>
  );
};

// Create/Edit Voucher Number Configuration Form Component
const CreateVoucherNumberConfigurationForm = () => {
  const { errors: pageErrors, flash, id, edit_mode, configuration } = usePage().props;
  
  const voucherFields = [
    {
      name: 'voucher_type',
      label: 'Voucher Type',
      type: 'select',
      placeholder: 'Select voucher type',
      icon: Type,
      required: true,
      options: [
        { value: 'Journal', label: 'Journal Voucher' },
        { value: 'Opening', label: 'Opening Voucher' },
        { value: 'Payment', label: 'Payment Voucher' },
        { value: 'Receipt', label: 'Receipt Voucher' },
        { value: 'Purchase', label: 'Purchase Voucher' },
        { value: 'Sales', label: 'Sales Voucher' }
      ]
    },
    {
      name: 'prefix',
      label: 'Prefix',
      type: 'text',
      placeholder: 'Enter prefix (e.g., JV, PV, RV)',
      icon: Hash,
      required: true
    },
    {
      name: 'number_length',
      label: 'Number Length',
      type: 'number',
      placeholder: 'Enter number length',
      icon: Hash,
      required: true,
      min: 1,
      max: 10
    },
    {
      name: 'reset_frequency',
      label: 'Reset Frequency',
      type: 'select',
      placeholder: 'Select reset frequency',
      icon: Calendar,
      required: true,
      options: [
        { value: 'Monthly', label: 'Monthly' },
        { value: 'Yearly', label: 'Yearly' },
        { value: 'Never', label: 'Never' }
      ]
    },
    {
      name: 'is_active',
      label: 'Status',
      type: 'toggle',
      required: false
    }
  ];

  // State for debugging and tracking
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [requestStatus, setRequestStatus] = useState('');

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

  const handleVoucherSubmit = async (submittedFormData) => {
    setErrors({});
    setAlert(null);
    setRequestStatus('Sending request...');

    try {
      // Client-side validation
      const newErrors = {};

      if (!submittedFormData.voucher_type || !submittedFormData.voucher_type.trim()) {
        newErrors.voucher_type = 'Voucher type is required';
      }

      if (!submittedFormData.prefix || !submittedFormData.prefix.trim()) {
        newErrors.prefix = 'Prefix is required';
      }

      if (!submittedFormData.number_length || submittedFormData.number_length < 1) {
        newErrors.number_length = 'Number length must be at least 1';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setAlert({
          type: 'error',
          message: 'Please correct the errors below and try again.'
        });
        setRequestStatus('Validation failed');
        return;
      }

      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append('voucher_type', submittedFormData.voucher_type || '');
      formDataToSend.append('prefix', submittedFormData.prefix || '');
      formDataToSend.append('number_length', submittedFormData.number_length || '4');
      formDataToSend.append('reset_frequency', submittedFormData.reset_frequency || 'Yearly');
      formDataToSend.append('is_active', submittedFormData.is_active ? '1' : '0');

      // Determine URL and method based on edit mode
      const isEdit = edit_mode && id;
      const url = isEdit ? `/accounts/voucher-number-configuration/${id}/edit` : '/accounts/voucher-number-configuration/create';
      
      if (isEdit) {
        formDataToSend.append('_method', 'PUT');
      }

      // Make the request using Inertia
      router.post(url, formDataToSend, {
        forceFormData: true,
        onStart: () => {
          setRequestStatus('Request started');
        },
        onProgress: () => {
          setRequestStatus('Uploading...');
        },
        onSuccess: (page) => {
          setRequestStatus('Success');
        },
        onError: (errors) => {
          console.log('Server validation errors:', errors);
          setRequestStatus('Server validation failed');
          setErrors(errors);
        },
        onFinish: () => {
          setRequestStatus('Request finished');
        }
      });

    } catch (error) {
      console.error('Form submission error:', error);
      setRequestStatus('Exception: ' + error.message);
    }
  };

  // Determine if we're in edit mode
  const isEdit = edit_mode && id;

  // Breadcrumb items configuration
  const breadcrumbItems = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard'
    },
    {
      label: 'Voucher Configuration',
      icon: List,
      href: '/accounts/voucher-number-configuration'
    },
    {
      label: isEdit ? 'Edit Configuration' : 'Add Configuration',
      icon: Plus,
      href: null
    }
  ];

  return (
    <div>
      {/* Professional Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />


      {/* FIXED: Simplified GeneralizedForm usage */}
      <GeneralizedForm
        title={isEdit ? "Edit Voucher Configuration" : "Add Voucher Configuration"}
        subtitle={isEdit ? "Update voucher number configuration settings" : "Create a new voucher number configuration for your application"}
        fields={voucherFields}
        onSubmit={handleVoucherSubmit}
        submitText={isEdit ? "Update Configuration" : "Create Configuration"}
        resetText="Clear Form"
        initialData={isEdit && configuration ? {
          voucher_type: configuration.voucher_type || '',
          prefix: configuration.prefix || '',
          number_length: configuration.number_length || 4,
          reset_frequency: configuration.reset_frequency || 'Yearly',
          is_active: configuration.is_active || true
        } : {
          voucher_type: '',
          prefix: '',
          number_length: 4,
          reset_frequency: 'Yearly',
          is_active: true
        }}
        showReset={true}
      />
    </div>
  );
};

// Main Add Component
const Create = () => {
  return (
    <App>
      {/* Main Content Card */}
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <CreateVoucherNumberConfigurationForm />
        </div>
      </div>
    </App>
  );
};

export default Create;
