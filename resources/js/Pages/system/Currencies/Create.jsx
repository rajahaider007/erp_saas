import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, Globe, TrendingUp, Hash, Star, Home, List, Plus, Edit } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import PermissionAwareForm, { PermissionButton } from '../../../Components/PermissionAwareForm';
import { usePermissions } from '../../../hooks/usePermissions';
import App from "../../App.jsx";
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

const CreateCurrencyForm = () => {
  const { t } = useTranslations();
  const { errors: pageErrors, flash, currency } = usePage().props;
  const isEdit = !!currency;
  const tc = (suffix, rep = {}) => t(`system.currencies.create.${suffix}`, rep);

  const currencyFields = useMemo(
    () => [
      {
        name: 'code',
        label: tc('lbl_code'),
        type: 'text',
        placeholder: tc('ph_code'),
        icon: Hash,
        required: true,
        maxLength: 3
      },
      {
        name: 'name',
        label: tc('lbl_name'),
        type: 'text',
        placeholder: tc('ph_name'),
        icon: DollarSign,
        required: true
      },
      {
        name: 'symbol',
        label: tc('lbl_symbol'),
        type: 'text',
        placeholder: tc('ph_symbol'),
        icon: DollarSign,
        required: true
      },
      {
        name: 'country',
        label: tc('lbl_country'),
        type: 'text',
        placeholder: tc('ph_country'),
        icon: Globe,
        required: true
      },
      {
        name: 'exchange_rate',
        label: tc('lbl_exchange_rate'),
        type: 'number',
        placeholder: tc('ph_exchange_rate'),
        icon: TrendingUp,
        required: true,
        min: 0,
        step: 0.0001
      },
      {
        name: 'is_active',
        label: tc('lbl_active_status'),
        type: 'toggle',
        required: false
      },
      {
        name: 'is_base_currency',
        label: tc('lbl_base_currency'),
        type: 'toggle',
        required: false
      },
      {
        name: 'sort_order',
        label: tc('lbl_sort_order'),
        type: 'number',
        placeholder: tc('ph_sort_order'),
        icon: Hash,
        required: false,
        min: 0
      }
    ],
    [t]
  );

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setErrors(pageErrors);
      setAlert({
        type: 'error',
        message: tc('msg_please_correct_the_errors_below_and_try_')
      });
    }
  }, [pageErrors, t]);

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

  const handleCurrencySubmit = async (submittedFormData) => {
    setAlert(null);

    try {
      const formData = new FormData();

      Object.keys(submittedFormData).forEach(key => {
        if (submittedFormData[key] !== null && submittedFormData[key] !== undefined) {
          formData.append(key, submittedFormData[key]);
        }
      });

      if (isEdit) {
        formData.append('_method', 'put');
      }

      const url = isEdit ? `/system/currencies/${currency.id}` : '/system/currencies';

      router.post(url, formData, {
        forceFormData: true,
        onSuccess: () => {
          setAlert({
            type: 'success',
            message: isEdit ? tc('success_updated') : tc('success_created')
          });
        },
        onError: () => {
          setAlert({
            type: 'error',
            message: tc('msg_please_correct_the_errors_below_and_try_')
          });
        }
      });
    } catch {
      setAlert({
        type: 'error',
        message: tc('msg_an_unexpected_error_occurred_please_try_')
      });
    }
  };

  const breadcrumbItems = [
    {
      label: t('common.breadcrumbs.dashboard'),
      icon: Home,
      href: '/dashboard'
    },
    {
      label: t('common.breadcrumbs.system'),
      icon: List,
      href: '#'
    },
    {
      label: tc('breadcrumb_currencies'),
      icon: DollarSign,
      href: '/system/currencies'
    },
    {
      label: isEdit ? tc('breadcrumb_edit') : tc('breadcrumb_add'),
      icon: isEdit ? Edit : Plus,
      href: null
    }
  ];

  return (
    <div>
      <Breadcrumbs
        items={breadcrumbItems}
        description={isEdit ? tc('breadcrumb_desc_edit') : tc('breadcrumb_desc_create')}
      />

      {alert && (
        <div className={`mb-4 p-4 rounded-lg animate-slideIn ${alert.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
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
        title={isEdit ? tc('title_edit') : tc('title_add')}
        subtitle={isEdit ? tc('subtitle_edit') : tc('subtitle_create')}
        fields={currencyFields}
        onSubmit={handleCurrencySubmit}
        submitText={isEdit ? tc('submit_edit') : tc('submit_add')}
        resetText={t('common.form_actions.clear_form')}
        initialData={{
          code: currency?.code || '',
          name: currency?.name || '',
          symbol: currency?.symbol || '',
          country: currency?.country || '',
          exchange_rate: currency?.exchange_rate || '',
          is_active: currency?.is_active ?? true,
          is_base_currency: currency?.is_base_currency ?? false,
          sort_order: currency?.sort_order || 0
        }}
        showReset={true}
      />
    </div>
  );
};

const Create = () => {
  const { t } = useTranslations();

  return (
    <App>
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <PermissionAwareForm
            requiredPermission="can_add"
            route="/system/currencies"
            fallbackMessage={t('system.currencies.create.permission_fallback')}
          >
            <CreateCurrencyForm />
          </PermissionAwareForm>
        </div>
      </div>
    </App>
  );
};

export default Create;
