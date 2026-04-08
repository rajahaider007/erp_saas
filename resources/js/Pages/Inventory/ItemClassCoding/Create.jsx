import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Home, List, Plus, Hash, Tag, Edit3 } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import App from '../../App.jsx';
import { router, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

const Breadcrumbs = ({ items, description }) => (
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
    <div className="breadcrumbs-description">{description}</div>
  </div>
);

const CreateItemClassCodingForm = () => {
  const { t } = useTranslations();
  const tc = useCallback((suffix, rep = {}) => t(`inventory.item_class_coding.create.${suffix}`, rep), [t]);
  const { errors: pageErrors, flash, itemClass = null, error } = usePage().props;

  const isEditMode = !!itemClass;
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const classFields = useMemo(
    () => [
      {
        name: 'class_code',
        label: tc('lbl_class_code'),
        type: 'text',
        placeholder: tc('ph_class_code'),
        icon: Hash,
        required: true,
      },
      {
        name: 'class_name',
        label: tc('lbl_class_name'),
        type: 'text',
        placeholder: tc('ph_class_name'),
        icon: Tag,
        required: true,
      },
      {
        name: 'description',
        label: tc('lbl_description'),
        type: 'textarea',
        placeholder: tc('ph_description'),
        required: false,
      },
      {
        name: 'is_active',
        label: tc('lbl_status'),
        type: 'toggle',
        required: false,
      },
    ],
    [tc]
  );

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
        message: tc('msg_please_correct_the_errors_below_and_try_'),
      });
    }
  }, [pageErrors, tc]);

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
      newErrors.class_code = tc('val_class_code');
    }

    if (!submittedFormData.class_name?.trim()) {
      newErrors.class_name = tc('val_class_name');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: tc('msg_please_correct_the_errors_below_and_try_') });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('class_code', submittedFormData.class_code || '');
    formDataToSend.append('class_name', submittedFormData.class_name || '');
    formDataToSend.append('description', submittedFormData.description || '');
    formDataToSend.append('is_active', submittedFormData.is_active ? '1' : '0');

    if (isEditMode) {
      formDataToSend.append('_method', 'PUT');
      router.post(`/inventory/item-class-coding/${itemClass.id}`, formDataToSend, {
        forceFormData: true,
        onError: (serverErrors) => {
          setErrors(serverErrors);
        },
      });
    } else {
      router.post('/inventory/item-class-coding', formDataToSend, {
        forceFormData: true,
        onError: (serverErrors) => {
          setErrors(serverErrors);
        },
      });
    }
  };

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: tc('breadcrumb_module'), icon: List, href: '/inventory/item-class-coding' },
      {
        label: isEditMode ? `${tc('breadcrumb_edit_prefix')}: ${itemClass.class_code}` : tc('breadcrumb_add'),
        icon: isEditMode ? Edit3 : Plus,
        href: null,
      },
    ],
    [t, tc, isEditMode, itemClass]
  );

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} description={tc('configure_inventory_item_classes')} />

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
        title={isEditMode ? tc('title_edit') : tc('title_create')}
        subtitle={isEditMode ? tc('subtitle_edit') : tc('subtitle_create')}
        fields={classFields}
        onSubmit={handleSubmit}
        submitText={isEditMode ? tc('submit_edit') : tc('submit_create')}
        resetText={t('common.form_actions.clear_form')}
        showReset={!isEditMode}
        initialData={
          isEditMode
            ? {
                class_code: itemClass.class_code || '',
                class_name: itemClass.class_name || '',
                description: itemClass.description || '',
                is_active: itemClass.is_active ?? true,
              }
            : {
                class_code: '',
                class_name: '',
                description: '',
                is_active: true,
              }
        }
      />
    </div>
  );
};

const Create = () => (
  <App>
    <div className="rounded-xl shadow-lg form-container border-slate-200">
      <div className="p-6">
        <CreateItemClassCodingForm />
      </div>
    </div>
  </App>
);

export default Create;
