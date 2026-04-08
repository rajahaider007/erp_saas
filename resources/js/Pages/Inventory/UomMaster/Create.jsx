import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Home, List, Plus, Hash, Tag, Edit3, Droplet } from 'lucide-react';
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
    {description && <div className="breadcrumbs-description">{description}</div>}
  </div>
);

const CreateUomMasterForm = () => {
  const { t } = useTranslations();
  const tc = useCallback((k, r = {}) => t(`inventory.uom_master.create.${k}`, r), [t]);
  const { errors: pageErrors, flash, uom = null, uomTypes = [], error } = usePage().props;

  const isEditMode = !!uom;
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const formattedUomTypes = useMemo(() => {
    const arr = Array.isArray(uomTypes) ? uomTypes : [];
    return arr.map((type) => ({
      value: type,
      label: t(`inventory.uom_master.uom_types.${type}`) || type,
    }));
  }, [uomTypes, t]);

  const uomFields = useMemo(
    () => [
      {
        name: 'uom_code',
        label: tc('lbl_uom_code'),
        type: 'text',
        placeholder: tc('ph_uom_code'),
        icon: Hash,
        required: true,
      },
      {
        name: 'uom_name',
        label: tc('lbl_uom_name'),
        type: 'text',
        placeholder: tc('ph_uom_name'),
        icon: Tag,
        required: true,
      },
      {
        name: 'uom_type',
        label: tc('lbl_uom_type'),
        type: 'select',
        options: formattedUomTypes,
        required: true,
      },
      {
        name: 'symbol',
        label: tc('lbl_symbol'),
        type: 'text',
        placeholder: tc('ph_symbol'),
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
        name: 'decimal_precision',
        label: tc('lbl_decimal_precision'),
        type: 'number',
        placeholder: tc('ph_decimal_precision'),
        required: true,
      },
      {
        name: 'is_active',
        label: tc('lbl_status'),
        type: 'toggle',
        required: false,
      },
    ],
    [tc, formattedUomTypes]
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

    if (!submittedFormData.uom_code?.trim()) {
      newErrors.uom_code = tc('val_uom_code');
    }

    if (!submittedFormData.uom_name?.trim()) {
      newErrors.uom_name = tc('val_uom_name');
    }

    if (!submittedFormData.uom_type) {
      newErrors.uom_type = tc('val_uom_type');
    }

    if (!submittedFormData.symbol?.trim()) {
      newErrors.symbol = tc('val_symbol');
    }

    if (submittedFormData.decimal_precision === '' || submittedFormData.decimal_precision === null) {
      newErrors.decimal_precision = tc('val_decimal_precision');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: tc('msg_please_correct_the_errors_below_and_try_') });
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

  const breadcrumbItems = useMemo(
    () => [
      { label: t('inventory.shared.breadcrumb_home'), icon: Home, href: '/' },
      { label: t('inventory.shared.breadcrumb_inventory'), href: '/inventory' },
      { label: tc('breadcrumb_uom_master'), icon: List, href: '/inventory/uom-master' },
      { label: isEditMode ? tc('breadcrumb_edit') : tc('breadcrumb_create'), icon: isEditMode ? Edit3 : Plus },
    ],
    [t, tc, isEditMode]
  );

  return (
    <App>
      <div className="form-container">
        <Breadcrumbs items={breadcrumbItems} description={tc('configure_unit_of_measure_master_data')} />

        <div className="form-section">
          <div className="form-header">
            <div className="header-info">
              <h2 className="form-title">
                <Droplet size={24} className="title-icon" />
                {isEditMode ? tc('title_edit') : tc('title_create')}
              </h2>
              <p className="form-description">{isEditMode ? tc('desc_edit') : tc('desc_create')}</p>
            </div>
          </div>

          {alert && (
            <div className={`alert alert-${alert.type}`}>
              <span>{alert.message}</span>
              <button type="button" onClick={() => setAlert(null)} className="alert-close">
                ×
              </button>
            </div>
          )}

          <GeneralizedForm
            fields={uomFields}
            onSubmit={handleSubmit}
            initialData={uom}
            errors={errors}
            submitButtonLabel={isEditMode ? tc('submit_update') : tc('submit_create')}
            cancelButtonLabel={t('common.actions.cancel')}
            onCancel={() => window.history.back()}
          />
        </div>
      </div>
    </App>
  );
};

export default CreateUomMasterForm;
