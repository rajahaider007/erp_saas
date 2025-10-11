import React, { useState, useMemo } from 'react';
import { Type, Home, List, Plus, Edit as EditIcon, Settings, Layers, CheckSquare, Square, Package } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import PermissionAwareForm, { PermissionButton } from '../../../Components/PermissionAwareForm';
import { usePermissions } from '../../../hooks/usePermissions';
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
    <div className="breadcrumbs-description">Edit package tier and features</div>
  </div>
);

const EditPackageForm = () => {
  const { package: packageData, menus, packageFeatures } = usePage().props;
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [requestStatus, setRequestStatus] = useState('');
  const [selectedMenus, setSelectedMenus] = useState(packageFeatures || {});

  // Group menus by module for better organization
  const groupedMenus = useMemo(() => {
    const groups = {};
    menus.forEach(menu => {
      const moduleName = menu.module?.module_name || 'Other';
      if (!groups[moduleName]) {
        groups[moduleName] = [];
      }
      groups[moduleName].push(menu);
    });
    return groups;
  }, [menus]);

  const handleMenuToggle = (menuId, isEnabled) => {
    setSelectedMenus(prev => ({
      ...prev,
      [menuId]: isEnabled
    }));
  };

  const handleSelectAllMenus = (isEnabled) => {
    const newMenus = {};
    menus.forEach(menu => {
      newMenus[menu.id] = isEnabled;
    });
    setSelectedMenus(newMenus);
  };

  const fields = [
    { 
      name: 'package_name', 
      label: 'Package Name', 
      type: 'text', 
      required: true, 
      placeholder: 'Enter package name (e.g., Basic, Medium, Enterprise)', 
      icon: Type 
    },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'toggle', 
      required: false 
    },
    { 
      name: 'sort_order', 
      label: 'Sort Order', 
      type: 'number', 
      required: false, 
      min: 0,
      placeholder: 'Display order (0 = first)'
    },
  ];

  const handleSubmit = async (submittedFormData) => {
    setErrors({});
    setAlert(null);
    setRequestStatus('Sending request...');

    const newErrors = {};
    if (!submittedFormData.package_name || !submittedFormData.package_name.trim()) {
      newErrors.package_name = 'Package name is required';
    }
    
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: 'Please correct the errors below and try again.' });
      setRequestStatus('Validation failed');
      return;
    }

    // Convert selected menus to array
    const menuFeatures = Object.entries(selectedMenus).map(([menuId, isEnabled]) => ({
      menu_id: parseInt(menuId),
      is_enabled: isEnabled
    }));

    const formData = {
      ...submittedFormData,
      menu_features: menuFeatures,
      _method: 'put'
    };

    router.post(`/system/packages/${packageData.id}`, formData, {
      onSuccess: () => { 
        setRequestStatus('Success'); 
        setAlert({ type: 'success', message: 'Package updated successfully!' }); 
      },
      onError: (errs) => { 
        setErrors(errs); 
        setAlert({ type: 'error', message: 'Failed to update package. Please check the errors below.' }); 
        setRequestStatus('Server validation failed'); 
      }
    });
  };

  const breadcrumbItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Packages', icon: List, href: '/system/packages' },
    { label: 'Edit Package', icon: Plus, href: null },
  ];

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Package: {packageData.package_name}</h1>
            <p className="text-gray-600">Update package details and features</p>
          </div>

          <GeneralizedForm
            title=""
            subtitle=""
            fields={fields}
            onSubmit={handleSubmit}
            submitText="Update Package"
            resetText="Reset Changes"
            initialData={{ 
              package_name: packageData.package_name, 
              status: packageData.status, 
              sort_order: packageData.sort_order 
            }}
            showReset={true}
          />

          {/* Menus Selection */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <label className="input-label">Available Features (Menus)</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {Object.values(selectedMenus).filter(Boolean).length} of {menus.length} selected
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAllMenus(true)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectAllMenus(false)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Clear All
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
                    {moduleMenus.map(menu => (
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
                            <span className="text-sm font-medium text-gray-900">
                              {menu.menu_name}
                            </span>
                            {menu.section && (
                              <span className="text-xs text-gray-500">
                                {menu.section.section_name}
                              </span>
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

const Edit = () => {
  const { canEdit } = usePermissions();
  
  return (
    <App>
      {/* Main Content Card */}
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <PermissionAwareForm
            requiredPermission="can_edit"
            route="/system/packages"
            fallbackMessage="You don't have permission to edit packages. Please contact your administrator."
          >
            <EditPackageForm />
          </PermissionAwareForm>
        </div>
      </div>
    </App>
  );
};

export default Edit;
