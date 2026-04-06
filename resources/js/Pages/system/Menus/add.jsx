import React, { useMemo, useState } from 'react';
import { Type, Settings, Layers, Home, List, Plus } from 'lucide-react';
import App from "../../App.jsx";
import GeneralizedForm from '../../../Components/GeneralizedForm';
import { usePage, router } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

const Breadcrumbs = ({ items, description }) => (
  <div className="breadcrumbs-themed">
    <nav className="breadcrumbs">
      {items.map((item, idx) => (
        <div key={idx} className="breadcrumb-item">
          <div className="breadcrumb-item-content">
            {item.icon && (<item.icon className={`breadcrumb-icon ${item.href ? 'breadcrumb-icon-link' : 'breadcrumb-icon-current'}`} />)}
            {item.href ? (<a href={item.href} className="breadcrumb-link-themed">{item.label}</a>) : (<span className="breadcrumb-current-themed">{item.label}</span>)}
          </div>
          {idx < items.length - 1 && (
            <div className="breadcrumb-separator breadcrumb-separator-themed">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            </div>
          )}
        </div>
      ))}
    </nav>
    <div className="breadcrumbs-description">{description}</div>
  </div>
);

const AddMenuForm = () => {
  const { modules } = usePage().props;
  const { t } = useTranslations();
  const ta = (k) => t(`system.menus.add.${k}`);
  const [sections, setSections] = useState([]);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState('');

  const loadSections = async (moduleId) => {
    if (!moduleId) {
      setSections([]);
      return;
    }
    try {
      const response = await fetch(`/system/sections/by-module/${moduleId}`);
      const data = await response.json();
      setSections(data?.data?.sections || []);
    } catch {
      setSections([]);
    }
  };

  const handleModuleChange = (moduleId) => {
    setSelectedModuleId(moduleId);
    loadSections(moduleId);
  };

  const searchSections = async (searchTerm) => {
    if (!selectedModuleId) return sections;
    try {
      const response = await fetch(`/system/sections/by-module/${selectedModuleId}?search=${encodeURIComponent(searchTerm)}`);
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
        label: ta('lbl_module'),
        type: 'select',
        required: true,
        options: modules.map((m) => ({ value: m.id, label: m.module_name })),
        icon: Settings,
        onChange: handleModuleChange,
      },
      {
        name: 'section_id',
        label: ta('lbl_section'),
        type: 'select',
        required: true,
        options: sections.map((s) => ({ value: s.id, label: s.section_name })),
        icon: Layers,
        searchable: true,
        onSearch: searchSections,
        disabled: !selectedModuleId,
        placeholder: selectedModuleId ? ta('ph_section') : ta('ph_section_wait'),
      },
      {
        name: 'menu_name',
        label: ta('lbl_menu_name'),
        type: 'text',
        required: true,
        placeholder: ta('ph_menu_name'),
        icon: Type,
      },
      {
        name: 'route',
        label: ta('lbl_route'),
        type: 'text',
        required: false,
        placeholder: ta('ph_route'),
      },
      {
        name: 'icon',
        label: ta('lbl_icon'),
        type: 'text',
        required: false,
        placeholder: ta('ph_icon'),
      },
      {
        name: 'status',
        label: ta('lbl_status'),
        type: 'toggle',
        required: false,
      },
      {
        name: 'sort_order',
        label: ta('lbl_sort_order'),
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
      { label: ta('breadcrumb_menus'), icon: List, href: '/system/menus' },
      { label: ta('breadcrumb_add'), icon: Plus, href: null },
    ],
    [t]
  );

  const handleSubmit = async (submittedFormData) => {
    setErrors({});
    setAlert(null);

    const newErrors = {};
    if (!submittedFormData.module_id) newErrors.module_id = ta('val_module_required');
    if (!submittedFormData.section_id) newErrors.section_id = ta('val_section_required');
    if (!submittedFormData.menu_name || !submittedFormData.menu_name.trim()) {
      newErrors.menu_name = ta('val_menu_name_required');
    }
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: ta('msg_please_correct_the_errors_below_and_try_') });
      return;
    }

    router.post('/system/menus', submittedFormData, {
      onSuccess: () => {
        setAlert({ type: 'success', message: ta('msg_menu_created_successfully') });
      },
      onError: (errs) => {
        setErrors(errs);
        setAlert({ type: 'error', message: ta('msg_failed_to_create_menu_please_check_the_e') });
      },
    });
  };

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} description={ta('navigate_through_your_application_module')} />
      {alert && (
        <div className={`mb-4 p-4 rounded-lg animate-slideIn ${alert.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {alert.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              )}
            </div>
            <div className="ml-3"><p className="text-sm font-medium">{alert.message}</p></div>
          </div>
        </div>
      )}
      <GeneralizedForm
        title={ta('form_title')}
        subtitle={ta('create_a_new_menu_under_a_section')}
        fields={fields}
        onSubmit={handleSubmit}
        submitText={ta('submit_create')}
        resetText={t('common.form_actions.clear_form')}
        initialData={{ module_id: '', section_id: '', menu_name: '', route: '', icon: '', status: true, sort_order: 0 }}
        showReset={true}
      />
    </div>
  );
};

const Add = () => (
  <App>
    <div className="rounded-xl shadow-lg form-container border-slate-200">
      <div className="p-6">
        <AddMenuForm />
      </div>
    </div>
  </App>
);

export default Add;
