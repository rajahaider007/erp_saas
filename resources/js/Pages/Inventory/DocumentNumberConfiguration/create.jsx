import React, { useState, useEffect, useMemo } from 'react';
import { Type, Hash, Home, List, Plus, Calendar } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import App from '../../App.jsx';
import { router, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

const Breadcrumbs = ({ items, description }) => {
  return (
    <div className="breadcrumbs-themed">
      <nav className="breadcrumbs">
        {items.map((item, index) => (
          <div key={index} className="breadcrumb-item">
            <div className="breadcrumb-item-content">
              {item.icon && (
                <item.icon
                  className={`breadcrumb-icon ${item.href ? 'breadcrumb-icon-link' : 'breadcrumb-icon-current'}`}
                />
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

      <div className="breadcrumbs-description">{description}</div>
    </div>
  );
};

const CreateDocumentNumberConfigurationForm = () => {
  const { t } = useTranslations();
  const { errors: pageErrors, flash, id, edit_mode, editMode, configuration } = usePage().props;
  const configurationId = configuration?.id || id;
  const isEdit = (edit_mode || editMode) && !!configurationId;

  const tc = (k, rep = {}) => t(`inventory.document_number_configuration.create.${k}`, rep);

  const documentFields = useMemo(
    () => {
      const base = [
        {
          name: 'document_type',
          label: tc('lbl_document_type'),
          type: 'select',
          placeholder: tc('ph_document_type'),
          icon: Type,
          required: true,
          disabled: isEdit,
          options: [
            { value: 'Purchase Requisition', label: tc('opt_purchase_requisition') },
            { value: 'Purchase Order', label: tc('opt_purchase_order') },
          ],
        },
        {
          name: 'prefix',
          label: tc('lbl_prefix'),
          type: 'text',
          placeholder: tc('ph_prefix'),
          icon: Hash,
          required: true,
        },
        {
          name: 'number_length',
          label: tc('lbl_number_length'),
          type: 'number',
          placeholder: tc('ph_number_length'),
          icon: Hash,
          required: true,
          min: 1,
          max: 10,
        },
        {
          name: 'running_number',
          label: tc('lbl_running_number'),
          type: 'number',
          placeholder: tc('ph_running_number'),
          icon: Hash,
          required: true,
          min: 1,
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
            { value: 'Never', label: tc('opt_never') },
          ],
        },
      ];
      if (isEdit) {
        base.push({
          name: 'is_active',
          label: tc('lbl_status'),
          type: 'toggle',
          required: false,
        });
      }
      return base;
    },
    [t, tc, isEdit]
  );

  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setAlert({
        type: 'error',
        message: tc('msg_please_correct_errors'),
      });
    }
  }, [pageErrors, tc]);

  useEffect(() => {
    if (flash?.success) {
      setAlert({
        type: 'success',
        message: flash.success,
      });
    } else if (flash?.error) {
      setAlert({
        type: 'error',
        message: flash.error,
      });
    }
  }, [flash]);

  const handleSubmit = async (submittedFormData) => {
    setAlert(null);

    const newErrors = {};
    if (!submittedFormData.document_type || !String(submittedFormData.document_type).trim()) {
      newErrors.document_type = tc('val_document_type_required');
    }
    if (!submittedFormData.prefix || !String(submittedFormData.prefix).trim()) {
      newErrors.prefix = tc('val_prefix_required');
    }
    if (!submittedFormData.number_length || submittedFormData.number_length < 1) {
      newErrors.number_length = tc('val_number_length_required');
    }
    if (!submittedFormData.running_number || submittedFormData.running_number < 1) {
      newErrors.running_number = tc('val_running_number_required');
    }
    if (Object.keys(newErrors).length > 0) {
      setAlert({ type: 'error', message: tc('msg_please_correct_errors') });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('document_type', submittedFormData.document_type || '');
    formDataToSend.append('prefix', submittedFormData.prefix || '');
    formDataToSend.append('number_length', String(submittedFormData.number_length || '4'));
    formDataToSend.append('running_number', String(submittedFormData.running_number || '1'));
    formDataToSend.append('reset_frequency', submittedFormData.reset_frequency || 'Yearly');
    if (isEdit) {
      formDataToSend.append('is_active', submittedFormData.is_active ? '1' : '0');
    }

    const url = isEdit
      ? `/inventory/document-number-configuration/${configurationId}`
      : '/inventory/document-number-configuration/create';

    if (isEdit) {
      formDataToSend.append('_method', 'PUT');
    }

    return await new Promise((resolve, reject) => {
      router.post(url, formDataToSend, {
        forceFormData: true,
        onSuccess: () => resolve(true),
        onError: () => reject(new Error('Validation failed')),
        onFinish: () => {},
      });
    });
  };

  const breadcrumbItems = [
    { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
    {
      label: tc('breadcrumb_inventory_configuration'),
      icon: List,
      href: '/inventory/document-number-configuration',
    },
    { label: isEdit ? tc('breadcrumb_edit') : tc('breadcrumb_add'), icon: Plus, href: null },
  ];

  const initial = isEdit && configuration
    ? {
        document_type: configuration.document_type || 'Purchase Requisition',
        prefix: configuration.prefix || '',
        number_length: configuration.number_length || 4,
        running_number: configuration.running_number || 1,
        reset_frequency: configuration.reset_frequency || 'Yearly',
        is_active: configuration.is_active !== false,
      }
    : {
        document_type: 'Purchase Requisition',
        prefix: 'PR-',
        number_length: 6,
        running_number: 1,
        reset_frequency: 'Never',
      };

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} description={tc('breadcrumb_description')} />
      {alert && (
        <div
          className={`mb-4 ${alert.type === 'error' ? 'alert-error-themed' : 'alert-success-themed'}`}
          role="status"
        >
          <p className="m-0">{alert.message}</p>
        </div>
      )}
      <GeneralizedForm
        title={isEdit ? tc('title_edit') : tc('title_add')}
        subtitle={isEdit ? tc('subtitle_edit') : tc('subtitle_add')}
        fields={documentFields}
        onSubmit={handleSubmit}
        submitText={isEdit ? tc('submit_edit') : tc('submit_add')}
        resetText={t('common.form_actions.clear_form')}
        initialData={initial}
        showReset={!isEdit}
      />
    </div>
  );
};

const Create = () => {
  return (
    <App>
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <CreateDocumentNumberConfigurationForm />
        </div>
      </div>
    </App>
  );
};

export default Create;
