import React, { useState, useEffect, useMemo } from 'react';
import { Type, Hash, Home, List, Plus, Settings, Calendar, ArrowLeft } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import App from "../../App.jsx";
import { router, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

// Professional Breadcrumbs Component
const Breadcrumbs = ({ items, description }) => {
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

      <div className="breadcrumbs-description">{description}</div>
    </div>
  );
};

// Create/Edit Voucher Number Configuration Form Component
const CreateVoucherNumberConfigurationForm = () => {
  const { t } = useTranslations();
  const { errors: pageErrors, flash, id, edit_mode, editMode, configuration } = usePage().props;
  const configurationId = configuration?.id || id;
  const isEdit = (edit_mode || editMode) && !!configurationId;

  const tc = (k, rep = {}) => t(`accounts.voucher_number_configuration.create.${k}`, rep);

  const voucherFields = useMemo(() => [
    {
      name: 'voucher_type',
      label: tc('lbl_voucher_type'),
      type: 'select',
      placeholder: tc('ph_voucher_type'),
      icon: Type,
      required: true,
      options: [
        { value: 'Journal', label: tc('opt_journal') },
        { value: 'Opening', label: tc('opt_opening') },
        { value: 'Payment', label: tc('opt_payment') },
        { value: 'Receipt', label: tc('opt_receipt') },
        { value: 'Bank Payment', label: tc('opt_bank_payment') },
        { value: 'Bank Receipt', label: tc('opt_bank_receipt') },
        { value: 'Purchase', label: tc('opt_purchase') },
        { value: 'Sales', label: tc('opt_sales') }
      ]
    },
    {
      name: 'prefix',
      label: tc('lbl_prefix'),
      type: 'text',
      placeholder: tc('ph_prefix'),
      icon: Hash,
      required: true
    },
    {
      name: 'number_length',
      label: tc('lbl_number_length'),
      type: 'number',
      placeholder: tc('ph_number_length'),
      icon: Hash,
      required: true,
      min: 1,
      max: 10
    },
    {
      name: 'running_number',
      label: tc('lbl_running_number'),
      type: 'number',
      placeholder: tc('ph_running_number'),
      icon: Hash,
      required: true,
      min: 1
    },
    {
      name: 'reset_frequency',
      label: tc('lbl_reset_frequency'),
      type: 'select',
      placeholder: tc('ph_reset_frequency'),
      icon: Calendar,
      required: true,
      options: [
        { value: 'Monthly', label: tc('opt_monthly') },
        { value: 'Yearly', label: tc('opt_yearly') },
        { value: 'Never', label: tc('opt_never') }
      ]
    },
    {
      name: 'is_active',
      label: tc('lbl_status'),
      type: 'toggle',
      required: false
    }
  ], [t]);

  // State for debugging and tracking
  const [alert, setAlert] = useState(null);

  // Handle page errors from Laravel
  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setAlert({
        type: 'error',
        message: tc('msg_please_correct_the_errors_below_and_try_')
      });
    }
  }, [pageErrors, t]);

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
    setAlert(null);

    try {
      // Client-side validation
      const newErrors = {};

      if (!submittedFormData.voucher_type || !submittedFormData.voucher_type.trim()) {
        newErrors.voucher_type = tc('val_voucher_type_required');
      }

      if (!submittedFormData.prefix || !submittedFormData.prefix.trim()) {
        newErrors.prefix = tc('val_prefix_required');
      }

      if (!submittedFormData.number_length || submittedFormData.number_length < 1) {
        newErrors.number_length = tc('val_number_length_required');
      }

      if (!submittedFormData.running_number || submittedFormData.running_number < 1) {
        newErrors.running_number = tc('val_running_number_required');
      }

      if (Object.keys(newErrors).length > 0) {
        setAlert({
          type: 'error',
          message: tc('msg_please_correct_the_errors_below_and_try_')
        });
        return;
      }

      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append('voucher_type', submittedFormData.voucher_type || '');
      formDataToSend.append('prefix', submittedFormData.prefix || '');
      formDataToSend.append('number_length', submittedFormData.number_length || '4');
      formDataToSend.append('running_number', submittedFormData.running_number || '1');
      formDataToSend.append('reset_frequency', submittedFormData.reset_frequency || 'Yearly');
      formDataToSend.append('is_active', submittedFormData.is_active ? '1' : '0');

      // Determine URL and method based on edit mode
      const url = isEdit
        ? `/accounts/voucher-number-configuration/${configurationId}`
        : '/accounts/voucher-number-configuration/create';
      
      if (isEdit) {
        formDataToSend.append('_method', 'PUT');
      }

      // Make the request using Inertia and resolve/reject explicitly
      return await new Promise((resolve, reject) => {
        router.post(url, formDataToSend, {
          forceFormData: true,
          onSuccess: () => {
            resolve(true);
          },
          onError: (_errs) => {
            reject(new Error('Validation failed'));
          },
          onFinish: () => {}
        });
      });

    } catch (error) {
      throw error;
    }
  };

  // Breadcrumb items configuration
  const breadcrumbItems = [
    {
      label: t('common.breadcrumbs.dashboard'),
      icon: Home,
      href: '/dashboard'
    },
    {
      label: tc('breadcrumb_voucher_configuration'),
      icon: List,
      href: '/accounts/voucher-number-configuration'
    },
    {
      label: isEdit ? tc('breadcrumb_edit') : tc('breadcrumb_add'),
      icon: Plus,
      href: null
    }
  ];

  return (
    <div>
      {/* Professional Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} description={tc('navigate_through_your_application_modules')} />


      {/* FIXED: Simplified GeneralizedForm usage */}
      <GeneralizedForm
        title={isEdit ? tc('title_edit') : tc('title_add')}
        subtitle={isEdit ? tc('subtitle_edit') : tc('subtitle_add')}
        fields={voucherFields}
        onSubmit={handleVoucherSubmit}
        submitText={isEdit ? tc('submit_edit') : tc('submit_add')}
        resetText={t('common.form_actions.clear_form')}
        initialData={isEdit && configuration ? {
          voucher_type: configuration.voucher_type || '',
          prefix: configuration.prefix || '',
          number_length: configuration.number_length || 4,
          running_number: configuration.running_number || 1,
          reset_frequency: configuration.reset_frequency || 'Yearly',
          is_active: configuration.is_active || true
        } : {
          voucher_type: '',
          prefix: '',
          number_length: 4,
          running_number: 1,
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
