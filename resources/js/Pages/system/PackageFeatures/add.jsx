import React, { useState, useMemo } from 'react';
import { Package, Home, List, Plus, CheckSquare, Square } from 'lucide-react';
import App from "../../App.jsx";
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

const AddPackageFeatureForm = () => {
  const { packages, menus } = usePage().props;
  const { t } = useTranslations();
  const ta = (k) => t(`system.package_features.add.${k}`);

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [menuFeatures, setMenuFeatures] = useState({});

  const groupedMenus = useMemo(() => {
    const groups = {};
    const other = ta('module_group_other');
    menus.forEach((menu) => {
      const sectionName = menu.section?.module?.module_name || other;
      if (!groups[sectionName]) groups[sectionName] = [];
      groups[sectionName].push(menu);
    });
    return groups;
  }, [menus, t]);

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: ta('package_features'), icon: List, href: '/system/package-features' },
      { label: ta('breadcrumb_add'), icon: Plus, href: null },
    ],
    [t]
  );

  const handlePackageChange = (packageId) => {
    setSelectedPackageId(packageId);
    setMenuFeatures({});
  };

  const handleMenuToggle = (menuId, isEnabled) => {
    setMenuFeatures((prev) => ({ ...prev, [menuId]: isEnabled }));
  };

  const handleSelectAll = (isEnabled) => {
    const next = {};
    menus.forEach((menu) => {
      next[menu.id] = isEnabled;
    });
    setMenuFeatures(next);
  };

  const selectedCount = Object.values(menuFeatures).filter(Boolean).length;
  const totalCount = menus.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setAlert(null);

    const newErrors = {};
    if (!selectedPackageId) newErrors.package_id = ta('val_package_required');
    if (Object.keys(menuFeatures).length === 0) {
      newErrors.menu_features = ta('val_menu_features_required');
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: ta('msg_please_correct_the_errors_below_and_try_') });
      return;
    }

    const menuFeaturesArray = Object.entries(menuFeatures).map(([menuId, isEnabled]) => ({
      menu_id: parseInt(menuId, 10),
      is_enabled: isEnabled,
    }));

    router.post(
      '/system/package-features',
      { package_id: selectedPackageId, menu_features: menuFeaturesArray },
      {
        onSuccess: () => {
          setAlert({ type: 'success', message: ta('msg_package_features_created_successfully') });
        },
        onError: () => {
          setAlert({ type: 'error', message: ta('msg_failed_to_create_package_features_please') });
        },
      }
    );
  };

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} description={ta('configure_package_features_and_menu_acce')} />
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{ta('package_features')}</h1>
            <p className="text-gray-600">{ta('configure_which_menu_features_are_availa')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="input-group">
              <label className="input-label">{ta('select_package')}</label>
              <div className="input-wrapper">
                <Package className="input-icon" size={20} />
                <select
                  className="form-select input-with-icon"
                  value={selectedPackageId}
                  onChange={(e) => handlePackageChange(e.target.value)}
                  required
                >
                  <option value="">{ta('choose_a_package')}</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>{pkg.package_name}</option>
                  ))}
                </select>
              </div>
              {errors.package_id && <p className="text-red-500 text-sm mt-1">{errors.package_id}</p>}
            </div>

            {selectedPackageId && (
              <div className="input-group">
                <div className="flex items-center justify-between mb-4">
                  <label className="input-label">{ta('menu_features')}</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {ta('selected_of_total', { selected: selectedCount, total: totalCount })}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectAll(true)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        {ta('select_all')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectAll(false)}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        {ta('clear_all')}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries(groupedMenus).map(([sectionName, sectionMenus]) => (
                    <div key={sectionName} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {sectionName}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sectionMenus.map((menu) => (
                          <label
                            key={menu.id}
                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="flex-shrink-0">
                              {menuFeatures[menu.id] ? (
                                <CheckSquare className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">{menu.menu_name}</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={menuFeatures[menu.id] || false}
                              onChange={(e) => handleMenuToggle(menu.id, e.target.checked)}
                              className="sr-only"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.menu_features && <p className="text-red-500 text-sm mt-1">{errors.menu_features}</p>}
              </div>
            )}

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setSelectedPackageId('');
                  setMenuFeatures({});
                  setErrors({});
                  setAlert(null);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {ta('btn_clear_form')}
              </button>
              <button
                type="submit"
                disabled={!selectedPackageId || Object.keys(menuFeatures).length === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {ta('btn_create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Add = () => (
  <App>
    <AddPackageFeatureForm />
  </App>
);

export default Add;
