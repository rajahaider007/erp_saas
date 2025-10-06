import React, { useState, useMemo } from 'react';
import { Package, Home, List, Plus, CheckSquare, Square, X } from 'lucide-react';
import App from "../../App.jsx";
import { usePage, router } from '@inertiajs/react';

const Breadcrumbs = ({ items }) => (
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
    <div className="breadcrumbs-description">Edit package features and menu access</div>
  </div>
);

const EditPackageFeatureForm = () => {
  const { package: packageData, packages, menus, packageFeatures } = usePage().props;
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [requestStatus, setRequestStatus] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState(packageData.id);
  const [menuFeatures, setMenuFeatures] = useState(packageFeatures || {});

  // Group menus by section for better organization
  const groupedMenus = useMemo(() => {
    const groups = {};
    menus.forEach(menu => {
      const sectionName = menu.section?.module?.module_name || 'Other';
      if (!groups[sectionName]) {
        groups[sectionName] = [];
      }
      groups[sectionName].push(menu);
    });
    return groups;
  }, [menus]);

  const handlePackageChange = (packageId) => {
    setSelectedPackageId(packageId);
    // Reset menu features when package changes
    setMenuFeatures({});
  };

  const handleMenuToggle = (menuId, isEnabled) => {
    setMenuFeatures(prev => ({
      ...prev,
      [menuId]: isEnabled
    }));
  };

  const handleSelectAll = (isEnabled) => {
    const newFeatures = {};
    menus.forEach(menu => {
      newFeatures[menu.id] = isEnabled;
    });
    setMenuFeatures(newFeatures);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setAlert(null);
    setRequestStatus('Sending request...');

    const newErrors = {};
    if (!selectedPackageId) {
      newErrors.package_id = 'Please select a package';
    }
    
    if (Object.keys(menuFeatures).length === 0) {
      newErrors.menu_features = 'Please select at least one menu feature';
    }
    
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: 'Please correct the errors below and try again.' });
      setRequestStatus('Validation failed');
      return;
    }

    // Convert menuFeatures to array format
    const menuFeaturesArray = Object.entries(menuFeatures).map(([menuId, isEnabled]) => ({
      menu_id: parseInt(menuId),
      is_enabled: isEnabled
    }));

    const formData = {
      package_id: selectedPackageId,
      menu_features: menuFeaturesArray
    };

    router.put(`/system/package-features/${packageData.id}`, formData, {
      onSuccess: () => { 
        setRequestStatus('Success'); 
        setAlert({ type: 'success', message: 'Package features updated successfully!' }); 
      },
      onError: (errs) => { 
        setErrors(errs); 
        setAlert({ type: 'error', message: 'Failed to update package features. Please check the errors below.' }); 
        setRequestStatus('Server validation failed'); 
      }
    });
  };

  const breadcrumbItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Package Features', icon: List, href: '/system/package-features' },
    { label: 'Edit Package Features', icon: Plus, href: null },
  ];

  const selectedCount = Object.values(menuFeatures).filter(Boolean).length;
  const totalCount = menus.length;

  return (
    <div className="form-theme-system min-h-screen transition-all duration-500">
      <Breadcrumbs items={breadcrumbItems} />
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
          <h1 className="form-title">Edit Package Features: {packageData.package_name}</h1>
          <p className="form-subtitle">Configure which menu features are available for this package</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Package Selection */}
            <div className="input-group">
              <label className="input-label">Package</label>
              <div className="input-wrapper">
                <Package className="input-icon" size={20} />
                <select
                  className="form-select input-with-icon"
                  value={selectedPackageId}
                  onChange={(e) => handlePackageChange(e.target.value)}
                  required
                >
                  {packages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.package_name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.package_id && <p className="text-red-500 text-sm mt-1">{errors.package_id}</p>}
            </div>

            {/* Menu Features Selection */}
            <div className="input-group fieldset-group">
              <div className="flex items-center justify-between mb-4">
                <label className="input-label">Menu Features</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{color: 'var(--text-secondary)'}}>
                    {selectedCount} of {totalCount} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAll(true)}
                      className="btn btn-sm btn-primary"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAll(false)}
                      className="btn btn-sm btn-secondary"
                    >
                      Clear All
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
                      {sectionMenus.map(menu => (
                        <label
                          key={menu.id}
                          className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors"
                          style={{
                            borderColor: 'var(--border)',
                            backgroundColor: menuFeatures[menu.id] ? 'var(--primary-light)' : 'transparent'
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
                              <CheckSquare className="w-5 h-5" style={{color: 'var(--primary-color)'}} />
                            ) : (
                              <Square className="w-5 h-5" style={{color: 'var(--text-secondary)'}} />
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>
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

          {/* Submit Buttons */}
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
              Reset Changes
            </button>
            <button
              type="submit"
              disabled={Object.keys(menuFeatures).length === 0}
              className="btn btn-primary"
            >
              <CheckSquare className="btn-icon" size={20} />
              Update Package Features
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
