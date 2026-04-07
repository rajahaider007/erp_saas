import React, { useState, useMemo } from 'react';
import { Package, Home, List, CheckSquare, Square, X, Edit as EditIcon } from 'lucide-react';
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

const EditPackageFeatureForm = () => {
  const { package: packageData, packages, menus, packageFeatures } = usePage().props;
  const { t } = useTranslations();
  const te = (k, rep) => (rep ? t(`system.package_features.edit.${k}`, rep) : t(`system.package_features.edit.${k}`));
  const ta = (k) => t(`system.package_features.add.${k}`);

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState(packageData.id);
  const [menuFeatures, setMenuFeatures] = useState(packageFeatures || {});

  const groupedMenus = useMemo(() => {
    const groups = {};
    const other = te('module_group_other');
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
      { label: te('breadcrumb_edit'), icon: EditIcon, href: null },
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
    if (!selectedPackageId) newErrors.package_id = te('val_package_required');
    if (Object.keys(menuFeatures).length === 0) {
      newErrors.menu_features = te('val_menu_features_required');
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: te('msg_please_correct_the_errors_below_and_try_') });
      return;
    }

    const menuFeaturesArray = Object.entries(menuFeatures).map(([menuId, isEnabled]) => ({
      menu_id: parseInt(menuId, 10),
      is_enabled: isEnabled,
    }));

    router.put(
      `/system/package-features/${packageData.id}`,
      { package_id: selectedPackageId, menu_features: menuFeaturesArray },
      {
        onSuccess: () => {
          setAlert({ type: 'success', message: te('msg_package_features_updated_successfully') });
        },
        onError: () => {
          setAlert({ type: 'error', message: te('msg_failed_to_update_package_features_please') });
        },
      }
    );
  };

  return (
    <div className="form-theme-system min-h-screen transition-all duration-500">
      <Breadcrumbs items={breadcrumbItems} description={te('edit_package_features_and_menu_access')} />
      {alert && (
        <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
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

      <div className="form-container">
        <div className="form-header mb-8">
          <h1 className="form-title">{te('title_edit', { name: packageData.package_name })}</h1>
          <p className="form-subtitle">{te('configure_which_menu_features_are_availa')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label">{te('package')}</label>
              <div className="input-wrapper">
                <Package className="input-icon" size={20} />
                <select
                  className="form-select input-with-icon"
                  value={selectedPackageId}
                  onChange={(e) => handlePackageChange(e.target.value)}
                  required
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>{pkg.package_name}</option>
                  ))}
                </select>
              </div>
              {errors.package_id && <p className="text-red-500 text-sm mt-1">{errors.package_id}</p>}
            </div>

            <div className="input-group fieldset-group">
              <div className="flex items-center justify-between mb-4">
                <label className="input-label">{te('menu_features')}</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {te('selected_of_total', { selected: selectedCount, total: totalCount })}
                  </span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleSelectAll(true)} className="btn btn-sm btn-primary">
                      {te('select_all')}
                    </button>
                    <button type="button" onClick={() => handleSelectAll(false)} className="btn btn-sm btn-secondary">
                      {te('clear_all')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(groupedMenus).map(([sectionName, sectionMenus]) => (
                  <div key={sectionName} className="form-fieldset">
                    <h3 className="form-legend flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      {sectionName}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sectionMenus.map((menu) => (
                        <label
                          key={menu.id}
                          className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors"
                          style={{
                            borderColor: 'var(--border)',
                            backgroundColor: menuFeatures[menu.id] ? 'var(--primary-light)' : 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            if (!menuFeatures[menu.id]) {
                              e.target.style.backgroundColor = 'var(--glass-bg)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!menuFeatures[menu.id]) {
                              e.target.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <div className="flex-shrink-0">
                            {menuFeatures[menu.id] ? (
                              <CheckSquare className="w-5 h-5" style={{ color: 'var(--primary-color)' }} />
                            ) : (
                              <Square className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {menu.menu_name}
                            </span>
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
          </div>

          <div className="button-group">
            <button
              type="button"
              onClick={() => {
                setMenuFeatures(packageFeatures || {});
                setErrors({});
                setAlert(null);
              }}
              className="btn btn-secondary"
            >
              <X className="btn-icon" size={20} />
              {te('btn_reset')}
            </button>
            <button
              type="submit"
              disabled={Object.keys(menuFeatures).length === 0}
              className="btn btn-primary"
            >
              <CheckSquare className="btn-icon" size={20} />
              {te('btn_update')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Edit = () => (
  <App>
    <EditPackageFeatureForm />
  </App>
);

export default Edit;
