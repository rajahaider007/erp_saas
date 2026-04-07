import React, { useState, useEffect, useMemo } from 'react';
import { Type, Folder, Home, List, Plus } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import App from "../../App.jsx";
import { router, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

const Breadcrumbs = ({ items, description }) => (
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
              <a href={item.href} className="breadcrumb-link-themed">{item.label}</a>
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

const AddModulesForm = () => {
  const { t } = useTranslations();
  const ta = (k) => t(`system.add_modules.add.${k}`);
  const { errors: pageErrors, flash } = usePage().props;

  const moduleFields = useMemo(
    () => [
      {
        name: 'module_name',
        label: ta('lbl_module_name'),
        type: 'text',
        placeholder: ta('ph_module_name'),
        icon: Type,
        required: true,
      },
      {
        name: 'folder_name',
        label: ta('lbl_folder_name'),
        type: 'text',
        placeholder: ta('ph_folder_name'),
        icon: Folder,
        required: true,
      },
      {
        name: 'image',
        label: ta('lbl_image'),
        type: 'file-image',
        placeholder: ta('ph_image'),
        required: false,
      },
      {
        name: 'status',
        label: ta('lbl_status'),
        type: 'toggle',
        required: false,
      },
      {
        name: 'sort_order',
        label: ta('lbl_sort_order'),
        type: 'number',
        placeholder: ta('ph_sort_order'),
        required: false,
        min: 0,
      },
    ],
    [t]
  );

  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setAlert({ type: 'error', message: ta('msg_please_correct_the_errors_below_and_try_') });
    }
  }, [pageErrors, t]);

  useEffect(() => {
    if (flash?.success) setAlert({ type: 'success', message: flash.success });
    else if (flash?.error) setAlert({ type: 'error', message: flash.error });
  }, [flash]);

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: ta('breadcrumb_modules'), icon: List, href: '/system/AddModules' },
      { label: ta('breadcrumb_add'), icon: Plus, href: null },
    ],
    [t]
  );

  const handleModuleSubmit = async (submittedFormData) => {
    setAlert(null);

    const newErrors = {};
    if (!submittedFormData.module_name || !submittedFormData.module_name.trim()) {
      newErrors.module_name = ta('val_module_name_required');
    } else if (submittedFormData.module_name.trim().length < 2) {
      newErrors.module_name = ta('val_module_name_min');
    }
    if (!submittedFormData.folder_name || !submittedFormData.folder_name.trim()) {
      newErrors.folder_name = ta('val_folder_name_required');
    } else if (submittedFormData.folder_name.trim().length < 2) {
      newErrors.folder_name = ta('val_folder_name_min');
    }

    if (Object.keys(newErrors).length > 0) {
      setAlert({ type: 'error', message: ta('msg_please_correct_the_errors_below_and_try_') });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('module_name', submittedFormData.module_name || '');
    formDataToSend.append('folder_name', submittedFormData.folder_name || '');
    formDataToSend.append('status', submittedFormData.status ? '1' : '0');
    if (submittedFormData.image) {
      formDataToSend.append('image', submittedFormData.image);
    }
    formDataToSend.append('description', submittedFormData.description || '');
    formDataToSend.append('sort_order', submittedFormData.sort_order || '0');

    router.post('/modules', formDataToSend, {
      forceFormData: true,
      onSuccess: () => {
        setAlert({ type: 'success', message: ta('msg_module_created_successfully') });
      },
      onError: () => {
        setAlert({ type: 'error', message: ta('msg_failed_to_create_module_please_check_the') });
      },
    });
  };

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} description={ta('navigate_through_your_application_module')} />
      {alert && (
        <div
          className={`mb-4 p-4 rounded-lg animate-slideIn ${alert.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
            }`}
        >
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
        title={ta('add_module')}
        subtitle={ta('create_a_new_module_for_your_application')}
        fields={moduleFields}
        onSubmit={handleModuleSubmit}
        submitText={ta('submit_create')}
        resetText={t('common.form_actions.clear_form')}
        initialData={{
          module_name: '',
          folder_name: '',
          image: null,
          status: true,
          description: '',
          sort_order: 0,
        }}
        showReset={true}
      />
    </div>
  );
};

const Add = () => (
  <App>
    <div className="rounded-xl shadow-lg form-container border-slate-200">
      <div className="p-6">
        <AddModulesForm />
      </div>
    </div>
  </App>
);

export default Add;
