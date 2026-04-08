import React, { useState, useEffect } from 'react';
import { Home, List, Plus, Database } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import App from "../../App.jsx";
import { router, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

// Breadcrumbs Component
const Breadcrumbs = ({ items }) => {
  const { t } = useTranslations();
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
                <a href={item.href} className="breadcrumb-link-themed">
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
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="breadcrumbs-description">
        {t('accounts.account_configuration.create.configure_chart_of_accounts_for_system_functions')}
      </div>
    </div>
  );
};

// Create/Edit Account Configuration Form
const CreateAccountConfigurationForm = () => {
const { t } = useTranslations();
  const { errors: pageErrors, flash, id, edit_mode, configuration, accounts = [], configTypes = {} } = usePage().props;
  
  const accountOptions = (accounts || []).map(acc => ({
    value: String(acc.value),
    label: acc.label
  }));

  const configTypeOptions = Object.entries(configTypes || {}).map(([key, label]) => ({
    value: key,
    label: label
  }));

  const configFields = [
    {
      name: 'account_id',
      label: t('accounts.account_configuration.create.select_account'),
      type: 'select',
      searchable: true,
      placeholder: t('accounts.account_configuration.create.search_and_select_account'),
      icon: Database,
      required: true,
      options: accountOptions
    },
    {
      name: 'config_type',
      label: t('accounts.account_configuration.create.configuration_type'),
      type: 'select',
      placeholder: t('accounts.account_configuration.create.what_is_this_account_used_for'),
      icon: Home,
      required: true,
      options: configTypeOptions
    },
    {
      name: 'description',
      label: t('accounts.account_configuration.create.description'),
      type: 'textarea',
      placeholder: t('accounts.account_configuration.create.optional_notes_about_this_configuration'),
      icon: null,
      required: false
    },
    {
      name: 'is_active',
      label: t('accounts.account_configuration.create.status'),
      type: 'toggle',
      required: false
    }
  ];

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [requestStatus, setRequestStatus] = useState('');

  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setErrors(pageErrors);
      setAlert({
        type: 'error',
        message: t('accounts.account_configuration.create.msg_please_correct_the_errors_below_and_try_')
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
    setRequestStatus(t('accounts.account_configuration.create.request_sending'));

    try {
      const newErrors = {};

      if (!submittedFormData.account_id) {
        newErrors.account_id = t('accounts.account_configuration.create.msg_account_is_required');
      }

      if (!submittedFormData.config_type) {
        newErrors.config_type = t('accounts.account_configuration.create.msg_configuration_type_is_required');
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setAlert({
          type: 'error',
          message: t('accounts.account_configuration.create.msg_please_correct_the_errors_below_and_try_')
        });
        setRequestStatus(t('accounts.account_configuration.create.request_validation_failed'));
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('account_id', submittedFormData.account_id || '');
      formDataToSend.append('config_type', submittedFormData.config_type || '');
      formDataToSend.append('description', submittedFormData.description || '');
      formDataToSend.append('is_active', submittedFormData.is_active ? '1' : '0');

      const isEdit = edit_mode && id;
      const url = isEdit ? `/accounts/account-configuration/${id}` : '/accounts/account-configuration';
      
      if (isEdit) {
        formDataToSend.append('_method', 'PUT');
      }

      router.post(url, formDataToSend, {
        forceFormData: true,
        onStart: () => setRequestStatus(t('accounts.account_configuration.create.request_started')),
        onProgress: () => setRequestStatus(t('accounts.account_configuration.create.request_uploading')),
        onSuccess: (page) => setRequestStatus(t('accounts.account_configuration.create.request_success')),
        onError: (errors) => {
          console.log('Server validation errors:', errors);
          setRequestStatus(t('accounts.account_configuration.create.request_server_validation_failed'));
          setErrors(errors);
        },
        onFinish: () => setRequestStatus(t('accounts.account_configuration.create.request_finished'))
      });

    } catch (error) {
      console.error('Form submission error:', error);
      setRequestStatus(`${t('accounts.account_configuration.create.request_exception_prefix')}${error.message}`);
    }
  };

  const isEdit = edit_mode && id;

  const breadcrumbItems = [
    { label: t('accounts.account_configuration.create.dashboard'), icon: Home, href: '/dashboard' },
    { label: t('accounts.account_configuration.create.account_configuration'), icon: List, href: '/accounts/account-configuration' },
    { label: isEdit ? t('accounts.account_configuration.create.edit_configuration') : t('accounts.account_configuration.create.add_configuration'), icon: Plus, href: null }
  ];

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />

      <GeneralizedForm
        key={isEdit && id ? `account-config-edit-${id}` : 'account-config-create'}
        title={isEdit ? t('accounts.account_configuration.create.edit_account_configuration') : t('accounts.account_configuration.create.add_account_configuration')}
        subtitle={isEdit ? t('accounts.account_configuration.create.subtitle_edit') : t('accounts.account_configuration.create.subtitle_create')}
        fields={configFields}
        onSubmit={handleSubmit}
        submitText={isEdit ? t('accounts.account_configuration.create.update_configuration') : t('accounts.account_configuration.create.create_configuration')}
        resetText={t('accounts.account_configuration.create.clear_form')}
        initialData={isEdit && configuration ? {
          account_id: configuration.account_id != null && configuration.account_id !== '' ? String(configuration.account_id) : '',
          config_type: configuration.config_type || '',
          description: configuration.description || '',
          is_active: configuration.is_active !== undefined ? Boolean(configuration.is_active) : true
        } : {
          account_id: '',
          config_type: '',
          description: '',
          is_active: true
        }}
        showReset={true}
      />
    </div>
  );
};

// Main Create Component
const Create = () => {
  return (
    <App>
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <CreateAccountConfigurationForm />
        </div>
      </div>
    </App>
  );
};

export default Create;
