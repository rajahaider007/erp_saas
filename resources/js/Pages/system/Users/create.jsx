import React, { useState, useEffect, useMemo } from 'react';
import {
  User, Mail, Phone, MapPin, Building, Users,
  Home, List, Plus, Edit, Lock, Shield, Globe,
  Clock, DollarSign, Palette
} from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
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

      <div className="breadcrumbs-description">
        {description}
      </div>
    </div>
  );
};

const UserRegistrationForm = () => {
  const { t } = useTranslations();
  const { errors: pageErrors, flash, companies, locations, departments, user, currencies } = usePage().props;
  const isEdit = !!user;

  const userFields = useMemo(() => {
    const tu = (k) => t(`system.users.create.${k}`);
    const roleValues = ['user', 'manager', 'admin', 'super_admin'];
    const statusValues = ['active', 'inactive', 'suspended', 'pending'];

    return [
      {
        name: 'fname',
        label: tu('lbl_first_name'),
        type: 'text',
        placeholder: tu('ph_first_name'),
        icon: User,
        required: true
      },
      {
        name: 'mname',
        label: tu('lbl_middle_name'),
        type: 'text',
        placeholder: tu('ph_middle_name'),
        icon: User,
        required: false
      },
      {
        name: 'lname',
        label: tu('lbl_last_name'),
        type: 'text',
        placeholder: tu('ph_last_name'),
        icon: User,
        required: true
      },
      {
        name: 'email',
        label: tu('lbl_email'),
        type: 'email',
        placeholder: tu('ph_email'),
        icon: Mail,
        required: true
      },
      {
        name: 'phone',
        label: tu('lbl_phone'),
        type: 'tel',
        placeholder: tu('ph_phone'),
        icon: Phone,
        required: false
      },
      {
        name: 'loginid',
        label: tu('lbl_login_id'),
        type: 'text',
        placeholder: tu('ph_login_id'),
        icon: User,
        required: true
      },
      {
        name: 'pincode',
        label: tu('lbl_pin_code'),
        type: 'text',
        placeholder: tu('ph_pin_code'),
        icon: MapPin,
        required: false
      },
      {
        name: 'comp_id',
        label: tu('lbl_company'),
        type: 'select',
        placeholder: tu('ph_company'),
        icon: Building,
        required: false,
        options: companies?.map(company => ({
          value: company.id,
          label: company.company_name
        })) || []
      },
      {
        name: 'location_id',
        label: tu('lbl_location'),
        type: 'select',
        placeholder: tu('ph_location'),
        icon: MapPin,
        required: false,
        options: locations?.map(location => ({
          value: location.id,
          label: location.location_name
        })) || []
      },
      {
        name: 'dept_id',
        label: tu('lbl_department'),
        type: 'select',
        placeholder: tu('ph_department'),
        icon: Users,
        required: false,
        options: departments?.map(department => ({
          value: department.id,
          label: department.department_name
        })) || []
      },
      {
        name: 'password',
        label: tu('lbl_password'),
        type: 'password',
        placeholder: isEdit ? tu('ph_password_edit') : tu('ph_password_create'),
        icon: Lock,
        required: !isEdit
      },
      {
        name: 'password_confirmation',
        label: tu('lbl_password_confirmation'),
        type: 'password',
        placeholder: isEdit ? tu('ph_password_confirmation_edit') : tu('ph_password_confirmation_create'),
        icon: Lock,
        required: !isEdit
      },
      {
        name: 'role',
        label: tu('lbl_role'),
        type: 'select',
        placeholder: tu('ph_role'),
        icon: Shield,
        required: true,
        options: roleValues.map((value) => ({
          value,
          label: t(`system.users.show.roles.${value}`),
        }))
      },
      {
        name: 'status',
        label: tu('lbl_status'),
        type: 'select',
        placeholder: tu('ph_status'),
        icon: Shield,
        required: true,
        options: statusValues.map((value) => ({
          value,
          label: t(`common.status.${value}`),
        }))
      },
      {
        name: 'timezone',
        label: tu('lbl_timezone'),
        type: 'select',
        placeholder: tu('ph_timezone'),
        icon: Clock,
        required: false,
        options: [
          { value: 'UTC', label: tu('tz_utc') },
          { value: 'America/New_York', label: tu('tz_america_new_york') },
          { value: 'America/Chicago', label: tu('tz_america_chicago') },
          { value: 'America/Denver', label: tu('tz_america_denver') },
          { value: 'America/Los_Angeles', label: tu('tz_america_los_angeles') },
          { value: 'Europe/London', label: tu('tz_europe_london') },
          { value: 'Europe/Paris', label: tu('tz_europe_paris') },
          { value: 'Asia/Tokyo', label: tu('tz_asia_tokyo') },
          { value: 'Asia/Shanghai', label: tu('tz_asia_shanghai') },
          { value: 'Asia/Kolkata', label: tu('tz_asia_kolkata') }
        ]
      },
      {
        name: 'language',
        label: tu('lbl_language'),
        type: 'select',
        placeholder: tu('ph_language'),
        icon: Globe,
        required: false,
        options: [
          { value: 'en', label: tu('lang_en') },
          { value: 'ur', label: tu('lang_ur') },
          { value: 'es', label: tu('lang_es') },
          { value: 'fr', label: tu('lang_fr') },
          { value: 'de', label: tu('lang_de') },
          { value: 'it', label: tu('lang_it') },
          { value: 'pt', label: tu('lang_pt') },
          { value: 'ru', label: tu('lang_ru') },
          { value: 'ja', label: tu('lang_ja') },
          { value: 'ko', label: tu('lang_ko') },
          { value: 'zh', label: tu('lang_zh') }
        ]
      },
      {
        name: 'currency',
        label: tu('lbl_currency'),
        type: 'select',
        placeholder: tu('ph_currency'),
        icon: DollarSign,
        required: false,
        options: currencies || []
      },
      {
        name: 'theme',
        label: tu('lbl_theme'),
        type: 'select',
        placeholder: tu('ph_theme'),
        icon: Palette,
        required: false,
        options: [
          { value: 'light', label: tu('theme_light') },
          { value: 'dark', label: tu('theme_dark') },
          { value: 'system', label: tu('theme_system') }
        ]
      }
    ];
  }, [t, isEdit, companies, locations, departments, currencies]);

  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setAlert({
        type: 'error',
        message: t('common.form_errors.please_correct')
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

  const handleUserSubmit = async (submittedFormData) => {
    setAlert(null);

    try {
      const formData = new FormData();

      Object.keys(submittedFormData).forEach(key => {
        if (submittedFormData[key] !== null && submittedFormData[key] !== undefined) {
          if (isEdit && (key === 'password' || key === 'password_confirmation') && !submittedFormData[key]) {
            return;
          }
          formData.append(key, submittedFormData[key]);
        }
      });

      if (isEdit) {
        formData.append('_method', 'put');
      }

      const url = isEdit ? `/system/users/${user.id}` : '/system/users';

      router.post(url, formData, {
        forceFormData: true,
        onSuccess: () => {
          setAlert({
            type: 'success',
            message: isEdit ? t('system.users.create.success_updated') : t('system.users.create.success_created')
          });
        },
        onError: (_errs) => {
          setAlert({
            type: 'error',
            message: t('common.form_errors.please_correct')
          });
        }
      });
    } catch (error) {
      setAlert({
        type: 'error',
        message: t('common.form_errors.unexpected')
      });
    }
  };

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: t('common.breadcrumbs.system'), icon: List, href: '#' },
      { label: t('system.users.create.breadcrumb_users'), icon: Users, href: '/system/users' },
      {
        label: isEdit ? t('system.users.create.breadcrumb_edit') : t('system.users.create.breadcrumb_register'),
        icon: isEdit ? Edit : Plus,
        href: null
      }
    ],
    [t, isEdit]
  );

  const breadcrumbDescription = isEdit
    ? t('system.users.create.breadcrumb_desc_edit')
    : t('system.users.create.breadcrumb_desc_create');

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} description={breadcrumbDescription} />

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
        title={isEdit ? t('system.users.create.title_edit') : t('system.users.create.title_create')}
        subtitle={isEdit ? t('system.users.create.subtitle_edit') : t('system.users.create.subtitle_create')}
        fields={userFields}
        onSubmit={handleUserSubmit}
        submitText={isEdit ? t('system.users.create.submit_edit') : t('system.users.create.submit_create')}
        resetText={t('common.form_actions.clear_form')}
        initialData={{
          fname: user?.fname || '',
          mname: user?.mname || '',
          lname: user?.lname || '',
          email: user?.email || '',
          phone: user?.phone || '',
          loginid: user?.loginid || '',
          pincode: user?.pincode || '',
          comp_id: user?.comp_id || '',
          location_id: user?.location_id || '',
          dept_id: user?.dept_id || '',
          password: '',
          password_confirmation: '',
          role: user?.role || 'user',
          status: user?.status || 'active',
          timezone: user?.timezone || 'UTC',
          language: user?.language || 'en',
          currency: user?.currency || 'USD',
          theme: user?.theme || 'dark'
        }}
        showReset={true}
      />
    </div>
  );
};

const Create = () => {
  const { t } = useTranslations();
  const { hasRoutePermission } = usePermissions();
  const { user } = usePage().props;
  const isEdit = !!user;

  const hasPermission = hasRoutePermission('/system/users', isEdit ? 'can_edit' : 'can_add');

  if (!hasPermission) {
    return (
      <App>
        <div className="rounded-xl shadow-lg form-container border-slate-200">
          <div className="p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('system.users.create.access_denied')}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {isEdit ? t('system.users.create.permission_body_edit') : t('system.users.create.permission_body_create')}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => window.history.back()}
                >
                  {t('common.actions.back')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </App>
    );
  }

  return (
    <App>
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <UserRegistrationForm />
        </div>
      </div>
    </App>
  );
};

export default Create;
