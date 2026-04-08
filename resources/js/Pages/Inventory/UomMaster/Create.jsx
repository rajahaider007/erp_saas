import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Home, List, Plus, Hash, Tag, Edit3, Type } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import Breadcrumbs from '../../../Components/Breadcrumbs';
import App from '../../App.jsx';
import { router, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

const CreateUomMasterForm = () => {
  const { t } = useTranslations();
  const tc = useCallback((k, r = {}) => t(`inventory.uom_master.create.${k}`, r), [t]);
  const { errors: pageErrors, flash, uom = null, uomTypes = [], error } = usePage().props;

  const isEditMode = !!uom?.id;
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
        placeholder: tc('lbl_uom_type'),
        icon: Type,
        options: formattedUomTypes,
        required: true,
      },
      {
        name: 'symbol',
        label: tc('lbl_symbol'),
        type: 'text',
        placeholder: tc('ph_symbol'),
        icon: Hash,
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
        icon: Hash,
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

  const initialData = useMemo(
    () =>
      isEditMode && uom
        ? {
            uom_code: uom.uom_code || '',
            uom_name: uom.uom_name || '',
            uom_type: uom.uom_type || '',
            symbol: uom.symbol || '',
            description: uom.description || '',
            decimal_precision: uom.decimal_precision ?? 0,
            is_active: uom.is_active ?? true,
          }
        : {
            uom_code: '',
            uom_name: '',
            uom_type: '',
            symbol: '',
            description: '',
            decimal_precision: 0,
            is_active: true,
          },
    [isEditMode, uom]
  );

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

    if (submittedFormData.decimal_precision === '' || submittedFormData.decimal_precision === null || submittedFormData.decimal_precision === undefined) {
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
    formDataToSend.append('decimal_precision', submittedFormData.decimal_precision ?? 0);
    formDataToSend.append('is_active', submittedFormData.is_active ? '1' : '0');

    const url = isEditMode ? `/inventory/uom-master/${uom.id}` : '/inventory/uom-master';
    if (isEditMode) {
      formDataToSend.append('_method', 'PUT');
    }

    const msg = tc('msg_please_correct_the_errors_below_and_try_');
    return await new Promise((resolve, reject) => {
      router.post(url, formDataToSend, {
        forceFormData: true,
        onSuccess: () => resolve(true),
        onError: (serverErrors) => {
          setErrors(serverErrors || {});
          reject(new Error(msg));
        },
      });
    });
  };

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: tc('breadcrumb_uom_master'), icon: List, href: '/inventory/uom-master' },
      { label: isEditMode ? tc('breadcrumb_edit') : tc('breadcrumb_create'), icon: isEditMode ? Edit3 : Plus, href: null },
    ],
    [t, tc, isEditMode]
  );

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} description={tc('configure_unit_of_measure_master_data')} />

      {alert && (
        <div className={`alert-${alert.type}-themed mb-4`}>
          <p className="m-0">{alert.message}</p>
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div className="alert-error-themed mb-4">
          <ul className="m-0 list-disc pl-5 space-y-1">
            {Object.entries(errors).map(([key, value]) => (
              <li key={key}>{Array.isArray(value) ? value[0] : value}</li>
            ))}
          </ul>
        </div>
      )}

      <GeneralizedForm
        title={isEditMode ? tc('title_edit') : tc('title_create')}
        subtitle={isEditMode ? tc('desc_edit') : tc('desc_create')}
        fields={uomFields}
        onSubmit={handleSubmit}
        submitText={isEditMode ? tc('submit_update') : tc('submit_create')}
        resetText={t('common.form_actions.clear_form')}
        showReset={!isEditMode}
        initialData={initialData}
      />
    </div>
  );
};

const Create = () => (
  <App>
    <div className="rounded-xl shadow-lg form-container border-slate-200">
      <div className="p-6">
        <CreateUomMasterForm />
      </div>
    </div>
  </App>
);

export default Create;
