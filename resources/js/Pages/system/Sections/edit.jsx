import React, { useMemo, useState, useEffect } from 'react';
import { Home, List, Edit as EditIcon, FileText } from 'lucide-react';
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

const EditSectionForm = () => {
  const { t } = useTranslations();
  const ts = (k) => t(`system.sections.edit.${k}`);
  const { errors: pageErrors, flash, section, modules } = usePage().props;

  const fields = useMemo(
    () => [
      {
        name: 'module_id',
        label: ts('lbl_module'),
        type: 'select',
        required: true,
        options: modules?.map((m) => ({ value: m.id, label: m.module_name })) || [],
      },
      {
        name: 'section_name',
        label: ts('lbl_section_name'),
        type: 'text',
        placeholder: ts('ph_section_name'),
        required: true,
        icon: FileText,
      },
      {
        name: 'status',
        label: ts('lbl_status'),
        type: 'toggle',
        required: false,
      },
      {
        name: 'sort_order',
        label: ts('lbl_sort_order'),
        type: 'number',
        placeholder: ts('ph_sort_order'),
        required: false,
        min: 0,
      },
    ],
    [modules, t]
  );

  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setAlert({ type: 'error', message: ts('msg_please_correct_the_errors_below_and_try_') });
    }
  }, [pageErrors, t]);

  useEffect(() => {
    if (flash?.success) setAlert({ type: 'success', message: flash.success });
    else if (flash?.error) setAlert({ type: 'error', message: flash.error });
  }, [flash]);

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: ts('breadcrumb_system'), icon: List, href: '#' },
      { label: ts('breadcrumb_sections'), icon: FileText, href: '/system/sections' },
      { label: ts('breadcrumb_edit'), icon: EditIcon, href: null },
    ],
    [t]
  );

  const handleSubmit = (data) => {
    router.post(
      `/system/sections/${section.id}`,
      { ...data, _method: 'put' },
      {
        onSuccess: () => {
          setAlert({ type: 'success', message: ts('msg_section_updated_successfully') });
        },
        onError: () => {
          setAlert({ type: 'error', message: ts('msg_please_correct_the_errors_below_and_try_') });
        },
      }
    );
  };

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} description={ts('breadcrumb_desc')} />
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
        title={ts('title_edit', { name: section.section_name })}
        subtitle={ts('update_section_details')}
        fields={fields}
        onSubmit={handleSubmit}
        submitText={ts('submit_update')}
        resetText={t('common.form_actions.clear_form')}
        initialData={{
          module_id: section.module_id,
          section_name: section.section_name,
          status: !!section.status,
          sort_order: section.sort_order ?? 0,
        }}
        showReset={true}
      />
    </div>
  );
};

const Edit = () => {
  const { t } = useTranslations();

  return (
    <App>
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <PermissionAwareForm
            requiredPermission="can_edit"
            route="/system/sections"
            fallbackMessage={t('system.sections.edit.permission_fallback')}
          >
            <EditSectionForm />
          </PermissionAwareForm>
        </div>
      </div>
    </App>
  );
};

export default Edit;
