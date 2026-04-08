import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Home, List, Plus, Edit, Building } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import PermissionAwareForm, { PermissionButton } from '../../../Components/PermissionAwareForm';
import { usePermissions } from '../../../hooks/usePermissions';
import App from "../../App.jsx";
import { usePage, router } from '@inertiajs/react';
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

// Location Form Component (Unified for Create and Edit)
const LocationForm = () => {
  const { t } = useTranslations();
  const { errors: pageErrors, flash, location, companies } = usePage().props;
  const isEdit = !!location;
  const tl = (k) => t(`system.locations.create.${k}`);

  const fields = useMemo(
    () => [
      {
        name: 'company_id',
        label: tl('lbl_company'),
        type: 'select',
        required: true,
        options: companies?.map((c) => ({ value: c.id, label: c.company_name })) || [],
        icon: Building,
      },
      {
        name: 'location_name',
        label: tl('lbl_location_name'),
        type: 'text',
        required: true,
        placeholder: tl('ph_location_name'),
        icon: MapPin,
      },
      {
        name: 'address',
        label: tl('lbl_address'),
        type: 'text',
        required: false,
        placeholder: tl('ph_address'),
      },
      {
        name: 'city',
        label: tl('lbl_city'),
        type: 'text',
        required: false,
        placeholder: tl('ph_city'),
      },
      {
        name: 'state',
        label: tl('lbl_state'),
        type: 'text',
        required: false,
        placeholder: tl('ph_state'),
      },
      {
        name: 'country',
        label: tl('lbl_country'),
        type: 'text',
        required: false,
        placeholder: tl('ph_country'),
      },
      {
        name: 'postal_code',
        label: tl('lbl_postal_code'),
        type: 'text',
        required: false,
        placeholder: tl('ph_postal_code'),
      },
      {
        name: 'phone',
        label: tl('lbl_phone'),
        type: 'text',
        required: false,
        placeholder: tl('ph_phone'),
      },
      {
        name: 'email',
        label: tl('lbl_email'),
        type: 'email',
        required: false,
        placeholder: tl('ph_email'),
      },
      {
        name: 'status',
        label: tl('lbl_status'),
        type: 'toggle',
        required: false,
      },
      {
        name: 'sort_order',
        label: tl('lbl_sort_order'),
        type: 'number',
        required: false,
        min: 0,
        placeholder: tl('ph_sort_order'),
      },
    ],
    [t, companies]
  );

  // State for debugging and tracking
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  // Handle page errors from Laravel
  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setErrors(pageErrors);
      setAlert({
        type: 'error',
        message: t('common.form_errors.please_correct'),
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

  const handleSubmit = async (submittedFormData) => {
    setAlert(null);

    try {
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.keys(submittedFormData).forEach(key => {
        if (submittedFormData[key] !== null && submittedFormData[key] !== undefined) {
          formData.append(key, submittedFormData[key]);
        }
      });

      // Add _method for edit operations
      if (isEdit) {
        formData.append('_method', 'put');
      }

      const url = isEdit ? `/system/locations/${location.id}` : '/system/locations';

      router.post(url, formData, {
        forceFormData: true,
        onSuccess: (page) => {
          setAlert({
            type: 'success',
            message: isEdit ? tl('success_updated') : tl('success_created'),
          });
        },
        onError: (errors) => {
          setErrors(errors);
          setAlert({
            type: 'error',
            message: t('common.form_errors.please_correct'),
          });
        }
      });
    } catch (error) {
      setAlert({
        type: 'error',
        message: t('common.form_errors.unexpected'),
      });
    }
  };

  const handleReset = () => {
    setErrors({});
    setAlert(null);
  };

  // Breadcrumb items configuration
  const breadcrumbItems = [
    {
      label: t('common.breadcrumbs.dashboard'),
      icon: Home,
      href: '/dashboard',
    },
    {
      label: t('common.breadcrumbs.system'),
      icon: List,
      href: '#',
    },
    {
      label: tl('breadcrumb_locations'),
      icon: MapPin,
      href: '/system/locations',
    },
    {
      label: isEdit ? tl('breadcrumb_edit') : tl('breadcrumb_add'),
      icon: isEdit ? Edit : Plus,
      href: null,
    },
  ];

  return (
    <div>
      {/* Professional Breadcrumbs */}
      <Breadcrumbs
        items={breadcrumbItems}
        description={isEdit ? tl('breadcrumb_desc_edit') : tl('breadcrumb_desc_create')}
      />

      {/* Alert Messages */}
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

      {/* Location Form */}
      <GeneralizedForm
        title={isEdit ? tl('title_edit') : tl('title_add')}
        subtitle={isEdit ? tl('subtitle_edit') : tl('subtitle_create')}
        fields={fields}
        onSubmit={handleSubmit}
        submitText={isEdit ? tl('submit_update') : tl('submit_create')}
        resetText={t('common.form_actions.clear_form')}
        initialData={{
          company_id: location?.company_id || '',
          location_name: location?.location_name || '',
          address: location?.address || '',
          city: location?.city || '',
          state: location?.state || '',
          country: location?.country || '',
          postal_code: location?.postal_code || '',
          phone: location?.phone || '',
          email: location?.email || '',
          status: location?.status ?? true,
          sort_order: location?.sort_order || 0
        }}
        showReset={true}
      />
    </div>
  );
};

// Main Create Component
const Create = () => {
  const { canAdd } = usePermissions();
  const { t } = useTranslations();

  return (
    <App>
      {/* Main Content Card */}
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <PermissionAwareForm
            requiredPermission="can_add"
            route="/system/locations"
            fallbackMessage={t('system.locations.create.permission_fallback')}
          >
            <LocationForm />
          </PermissionAwareForm>
        </div>
      </div>
    </App>
  );
};

export default Create;
