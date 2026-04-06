import React, { useEffect, useMemo, useState } from 'react';
import { Type, Settings, Layers, Home, List, Edit as EditIcon, FileText } from 'lucide-react';
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

const EditMenuForm = () => {
  const { menu, modules, errors: pageErrors, flash } = usePage().props;
  const { t } = useTranslations();
  const te = (k) => t(`system.menus.edit.${k}`);

  const [sections, setSections] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState(menu.module_id);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (!selectedModuleId) return;
    fetch(`/system/sections/by-module/${selectedModuleId}`)
      .then((r) => r.json())
      .then((res) => setSections(res?.data?.sections || []))
      .catch(() => setSections([]));
  }, [selectedModuleId]);

  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setAlert({ type: 'error', message: te('msg_please_correct_the_errors_below_and_try_') });
    }
  }, [pageErrors, t]);

  useEffect(() => {
    if (flash?.success) setAlert({ type: 'success', message: flash.success });
    else if (flash?.error) setAlert({ type: 'error', message: flash.error });
  }, [flash]);

  const handleModuleChange = (moduleId) => {
    setSelectedModuleId(moduleId);
  };

  const searchSections = async (searchTerm) => {
    if (!selectedModuleId) return sections;
    try {
      const response = await fetch(
        `/system/sections/by-module/${selectedModuleId}?search=${encodeURIComponent(searchTerm)}`
      );
      const data = await response.json();
      return data?.data?.sections || [];
    } catch {
      return sections;
    }
  };

  const fields = useMemo(
    () => [
      {
        name: 'module_id',
        label: te('lbl_module'),
        type: 'select',
        required: true,
        options: modules.map((m) => ({ value: m.id, label: m.module_name })),
        icon: Settings,
        onChange: handleModuleChange,
      },
      {
        name: 'section_id',
        label: te('lbl_section'),
        type: 'select',
        required: true,
        options: sections.map((s) => ({ value: s.id, label: s.section_name })),
        icon: Layers,
        searchable: true,
        onSearch: searchSections,
        disabled: !selectedModuleId,
        placeholder: selectedModuleId ? te('ph_section') : te('ph_section_wait'),
      },
      {
        name: 'menu_name',
        label: te('lbl_menu_name'),
        type: 'text',
        required: true,
        icon: Type,
      },
      {
        name: 'route',
        label: te('lbl_route'),
        type: 'text',
        required: false,
      },
      {
        name: 'icon',
        label: te('lbl_icon'),
        type: 'text',
        required: false,
      },
      {
        name: 'status',
        label: te('lbl_status'),
        type: 'toggle',
        required: false,
      },
      {
        name: 'sort_order',
        label: te('lbl_sort_order'),
        type: 'number',
        required: false,
        min: 0,
      },
    ],
    [modules, sections, selectedModuleId, t]
  );

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: t('common.breadcrumbs.system'), icon: List, href: '#' },
      { label: te('breadcrumb_menus'), icon: FileText, href: '/system/menus' },
      { label: te('breadcrumb_edit'), icon: EditIcon, href: null },
    ],
    [t]
  );

  const handleSubmit = (data) => {
    router.post(
      `/system/menus/${menu.id}`,
      { ...data, _method: 'put' },
      {
        onSuccess: () => {
          setAlert({ type: 'success', message: te('msg_menu_updated_successfully') });
        },
        onError: () => {
          setAlert({ type: 'error', message: te('msg_failed_to_update_menu') });
        },
      }
    );
  };

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} description={te('navigate_through_your_application_module')} />
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
        title={te('title_edit', { name: menu.menu_name })}
        subtitle={te('update_menu_details')}
        fields={fields}
        onSubmit={handleSubmit}
        submitText={te('submit_update')}
        resetText={t('common.form_actions.clear_form')}
        initialData={{
          module_id: menu.module_id,
          section_id: menu.section_id,
          menu_name: menu.menu_name,
          route: menu.route || '',
          icon: menu.icon || '',
          status: !!menu.status,
          sort_order: menu.sort_order ?? 0,
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
            route="/system/menus"
            fallbackMessage={t('system.menus.edit.permission_fallback')}
          >
            <EditMenuForm />
          </PermissionAwareForm>
        </div>
      </div>
    </App>
  );
};

export default Edit;
