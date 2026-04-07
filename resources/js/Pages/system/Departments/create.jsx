import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Home, List, Plus, Edit, Building, MapPin, User, Mail, Phone } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import PermissionAwareForm from '../../../Components/PermissionAwareForm';
import App from "../../App.jsx";
import { usePage, router } from '@inertiajs/react';
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

const DepartmentForm = () => {
  const { errors: pageErrors, flash, department, companies, locations } = usePage().props;
  const { t } = useTranslations();
  const td = (k) => t(`system.departments.create.${k}`);
  const isEdit = !!department;
  const [filteredLocations, setFilteredLocations] = useState(locations || []);

  const handleCompanyChange = useCallback(
    (companyId, formData, setFormData) => {
      setFormData({ ...formData, company_id: companyId, location_id: '' });
      if (companyId) {
        setFilteredLocations(locations?.filter((l) => l.company_id == companyId) || []);
      } else {
        setFilteredLocations([]);
      }
    },
    [locations]
  );

  useEffect(() => {
    if (isEdit && department?.company_id) {
      setFilteredLocations(locations?.filter((l) => l.company_id == department.company_id) || []);
    }
  }, [isEdit, department, locations]);

  const fields = useMemo(
    () => [
      {
        name: 'company_id',
        label: td('lbl_company'),
        type: 'select',
        required: true,
        options: companies?.map((c) => ({ value: c.id, label: c.company_name })) || [],
        icon: Building,
        onChange: handleCompanyChange,
      },
      {
        name: 'location_id',
        label: td('lbl_location'),
        type: 'select',
        required: true,
        options: filteredLocations?.map((l) => ({ value: l.id, label: l.location_name })) || [],
        icon: MapPin,
      },
      {
        name: 'department_name',
        label: td('lbl_department_name'),
        type: 'text',
        required: true,
        placeholder: td('ph_department_name'),
        icon: Users,
      },
      {
        name: 'description',
        label: td('lbl_description'),
        type: 'textarea',
        required: false,
        placeholder: td('ph_description'),
        rows: 3,
      },
      {
        name: 'manager_name',
        label: td('lbl_manager_name'),
        type: 'text',
        required: false,
        placeholder: td('ph_manager_name'),
        icon: User,
      },
      {
        name: 'manager_email',
        label: td('lbl_manager_email'),
        type: 'email',
        required: false,
        placeholder: td('ph_manager_email'),
        icon: Mail,
      },
      {
        name: 'manager_phone',
        label: td('lbl_manager_phone'),
        type: 'text',
        required: false,
        placeholder: td('ph_manager_phone'),
        icon: Phone,
      },
      {
        name: 'status',
        label: td('lbl_status'),
        type: 'toggle',
        required: false,
      },
      {
        name: 'sort_order',
        label: td('lbl_sort_order'),
        type: 'number',
        required: false,
        min: 0,
        placeholder: td('ph_sort_order'),
      },
    ],
    [companies, filteredLocations, handleCompanyChange, t]
  );

  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setAlert({ type: 'error', message: td('msg_please_correct_the_errors_below_and_try_') });
    }
  }, [pageErrors, t]);

  useEffect(() => {
    if (flash?.success) setAlert({ type: 'success', message: flash.success });
    else if (flash?.error) setAlert({ type: 'error', message: flash.error });
  }, [flash]);

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: td('breadcrumb_system'), icon: List, href: '#' },
      { label: td('breadcrumb_departments'), icon: Users, href: '/system/departments' },
      {
        label: isEdit ? td('breadcrumb_edit') : td('breadcrumb_add'),
        icon: isEdit ? Edit : Plus,
        href: null,
      },
    ],
    [isEdit, t]
  );

  const breadcrumbDescription = isEdit ? td('breadcrumb_desc_edit') : td('breadcrumb_desc_create');

  const handleSubmit = async (submittedFormData) => {
    setAlert(null);
    try {
      const formData = new FormData();
      Object.keys(submittedFormData).forEach((key) => {
        if (submittedFormData[key] !== null && submittedFormData[key] !== undefined) {
          formData.append(key, submittedFormData[key]);
        }
      });
      if (isEdit) formData.append('_method', 'put');
      const url = isEdit ? `/system/departments/${department.id}` : '/system/departments';
      router.post(url, formData, {
        forceFormData: true,
        onSuccess: () => {
          setAlert({
            type: 'success',
            message: isEdit ? td('success_updated') : td('success_created'),
          });
        },
        onError: () => {
          setAlert({ type: 'error', message: td('msg_please_correct_the_errors_below_and_try_') });
        },
      });
    } catch {
      setAlert({ type: 'error', message: td('msg_an_unexpected_error_occurred_please_try_') });
    }
  };

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} description={breadcrumbDescription} />
      {alert && (
        <div
          className={`mb-4 p-4 rounded-lg animate-slideIn ${
            alert.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {alert.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
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
        title={isEdit ? td('title_edit') : td('title_add')}
        subtitle={isEdit ? td('subtitle_edit') : td('subtitle_create')}
        fields={fields}
        onSubmit={handleSubmit}
        submitText={isEdit ? td('submit_update') : td('submit_create')}
        resetText={t('common.form_actions.clear_form')}
        initialData={{
          company_id: department?.company_id || '',
          location_id: department?.location_id || '',
          department_name: department?.department_name || '',
          description: department?.description || '',
          manager_name: department?.manager_name || '',
          manager_email: department?.manager_email || '',
          manager_phone: department?.manager_phone || '',
          status: department?.status ?? true,
          sort_order: department?.sort_order || 0,
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
            route="/system/departments"
            fallbackMessage={t('system.departments.create.permission_fallback')}
          >
            <DepartmentForm />
          </PermissionAwareForm>
        </div>
      </div>
    </App>
  );
};

export default Create;
