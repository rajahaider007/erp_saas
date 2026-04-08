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

const CreateItemCategoryCodingForm = () => {
  const { t } = useTranslations();
  const tc = useCallback((suffix, rep = {}) => t(`inventory.item_category_coding.create.${suffix}`, rep), [t]);
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

  const categoryFields = useMemo(
    () => [
      {
        name: 'item_class_id',
        label: tc('lbl_item_class'),
        type: 'select',
        placeholder: tc('ph_item_class'),
        icon: List,
        required: true,
        options: itemClassOptions,
      },
      {
        name: 'category_code',
        label: tc('lbl_category_code'),
        type: 'text',
        placeholder: tc('ph_category_code'),
        icon: Hash,
        required: true,
        maxLength: 30,
      },
      {
        name: 'category_name',
        label: tc('lbl_category_name'),
        type: 'text',
        placeholder: tc('ph_category_name'),
        icon: Tag,
        required: true,
        maxLength: 150,
      },
      {
        name: 'description',
        label: tc('lbl_description'),
        type: 'textarea',
        placeholder: tc('ph_description'),
        required: false,
        maxLength: 500,
      },
      {
        name: 'is_active',
        label: tc('lbl_active_status'),
        type: 'toggle',
        required: false,
        defaultValue: true,
      },
    ],
    [tc, itemClassOptions]
  );

  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setErrors(pageErrors);
      setAlert({ type: 'error', message: tc('msg_please_correct_the_errors_below') });
    }
  }, [pageErrors, tc]);

  useEffect(() => {
    if (flash?.success) {
      setAlert({ type: 'success', message: flash.success });
    } else if (flash?.error) {
      setAlert({ type: 'error', message: flash.error });
    }
  }, [flash]);

  const handleSubmit = (formData) => {
    setErrors({});
    setAlert(null);

    const newErrors = {};

    if (!formData.category_code?.trim()) {
      newErrors.category_code = tc('val_category_code');
    }

    if (!formData.category_name?.trim()) {
      newErrors.category_name = tc('val_category_name');
    }

    if (!formData.item_class_id) {
      newErrors.item_class_id = tc('val_item_class');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: tc('msg_please_correct_the_errors_above') });
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
          setAlert({ type: 'error', message: tc('msg_failed_to_update_category_please_check_t') });
        },
      });
    } else {
      router.post('/inventory/item-category-coding', formDataToSend, {
        forceFormData: true,
        onError: (serverErrors) => {
          setErrors(serverErrors);
          setAlert({ type: 'error', message: tc('msg_failed_to_create_category_please_check_t') });
        },
      });
    }
  };

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: tc('breadcrumb_module'), icon: List, href: '/inventory/item-category-coding' },
      { label: isEditMode ? tc('breadcrumb_edit') : tc('breadcrumb_create'), icon: isEditMode ? Edit3 : Plus },
    ],
    [t, tc, isEditMode]
  );

  return (
    <div className="form-page-wrapper">
      <Breadcrumbs items={breadcrumbItems} description={tc('create_item_categories_and_assign_an_ite')} />

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
        title={isEditMode ? tc('title_edit') : tc('title_create')}
        subtitle={isEditMode ? tc('subtitle_edit') : tc('subtitle_create')}
        fields={categoryFields}
        onSubmit={handleSubmit}
        submitText={isEditMode ? tc('submit_edit') : tc('submit_create')}
        resetText={t('common.form_actions.clear_form')}
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

const Create = () => (
  <App>
    <div className="rounded-xl shadow-lg form-container border-slate-200">
      <div className="p-6">
        <CreateItemCategoryCodingForm />
      </div>
    </div>
  </App>
);

export default Create;
