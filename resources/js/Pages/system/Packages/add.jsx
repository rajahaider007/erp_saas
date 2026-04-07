import React, { useState, useMemo } from 'react';
import { Type, Home, List, Plus, Settings, CheckSquare, Square } from 'lucide-react';
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

const AddPackageForm = () => {
  const { menus } = usePage().props;
  const { t } = useTranslations();
  const tp = (k) => t(`system.packages.add.${k}`);
  const [alert, setAlert] = useState(null);
  const [selectedMenus, setSelectedMenus] = useState({});

  const groupedMenus = useMemo(() => {
    const groups = {};
    const other = tp('module_group_other');
    menus.forEach((menu) => {
      const moduleName = menu.module?.module_name || other;
      if (!groups[moduleName]) groups[moduleName] = [];
      groups[moduleName].push(menu);
    });
    return groups;
  }, [menus, t]);

  const handleMenuToggle = (menuId, isEnabled) => {
    setSelectedMenus((prev) => ({ ...prev, [menuId]: isEnabled }));
  };

  const handleSelectAllMenus = (isEnabled) => {
    const next = {};
    menus.forEach((menu) => {
      next[menu.id] = isEnabled;
    });
    setSelectedMenus(next);
  };

  const fields = useMemo(
    () => [
      {
        name: 'package_name',
        label: tp('lbl_package_name'),
        type: 'text',
        required: true,
        placeholder: tp('ph_package_name'),
        icon: Type,
      },
      {
        name: 'status',
        label: tp('lbl_status'),
        type: 'toggle',
        required: false,
      },
      {
        name: 'sort_order',
        label: tp('lbl_sort_order'),
        type: 'number',
        required: false,
        min: 0,
        placeholder: tp('ph_sort_order'),
      },
    ],
    [t]
  );

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: tp('breadcrumb_packages'), icon: List, href: '/system/packages' },
      { label: tp('breadcrumb_add'), icon: Plus, href: null },
    ],
    [t]
  );

  const selectedCount = Object.values(selectedMenus).filter(Boolean).length;

  const handleSubmit = async (submittedFormData) => {
    setAlert(null);

    if (!submittedFormData.package_name || !submittedFormData.package_name.trim()) {
      setAlert({ type: 'error', message: tp('msg_please_correct_the_errors_below_and_try_') });
      return;
    }

    const menuFeatures = Object.entries(selectedMenus).map(([menuId, isEnabled]) => ({
      menu_id: parseInt(menuId, 10),
      is_enabled: isEnabled,
    }));

    router.post(
      '/system/packages',
      { ...submittedFormData, menu_features: menuFeatures },
      {
        onSuccess: () => {
          setAlert({ type: 'success', message: tp('msg_package_created_successfully') });
        },
        onError: () => {
          setAlert({ type: 'error', message: tp('msg_failed_to_create_package_please_check_th') });
        },
      }
    );
  };

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} description={tp('create_and_manage_package_tiers')} />
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
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{tp('form_heading')}</h1>
            <p className="text-gray-600">{tp('create_a_new_package_tier_with_specific_')}</p>
          </div>

          <GeneralizedForm
            title=""
            subtitle=""
            fields={fields}
            onSubmit={handleSubmit}
            submitText={tp('submit_create')}
            resetText={t('common.form_actions.clear_form')}
            initialData={{ package_name: '', status: true, sort_order: 0 }}
            showReset={true}
          />

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <label className="input-label">{tp('available_features_menus')}</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {tp('selected_of_total', { selected: selectedCount, total: menus.length })}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAllMenus(true)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    {tp('select_all')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectAllMenus(false)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    {tp('clear_all')}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(groupedMenus).map(([moduleName, moduleMenus]) => (
                <div key={moduleName} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    {moduleName}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {moduleMenus.map((menu) => (
                      <label
                        key={menu.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex-shrink-0">
                          {selectedMenus[menu.id] ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <List className="w-4 h-4 text-gray-500" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{menu.menu_name}</span>
                            {menu.section && (
                              <span className="text-xs text-gray-500">{menu.section.section_name}</span>
                            )}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedMenus[menu.id] || false}
                          onChange={(e) => handleMenuToggle(menu.id, e.target.checked)}
                          className="sr-only"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Add = () => (
  <App>
    <div className="rounded-xl shadow-lg form-container border-slate-200">
      <div className="p-6">
        <AddPackageForm />
      </div>
    </div>
  </App>
);

export default Add;
