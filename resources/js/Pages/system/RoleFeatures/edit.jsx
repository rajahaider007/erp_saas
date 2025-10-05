import React, { useState, useMemo } from 'react';
import { Shield, Home, List, Plus, CheckSquare, Square } from 'lucide-react';
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
    <div className="breadcrumbs-description">Edit role features and menu access</div>
  </div>
);

const EditRoleFeatureForm = () => {
  const { role: roleData, roles, menus, roleFeatures } = usePage().props;
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [requestStatus, setRequestStatus] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState(roleData.id);
  const [menuFeatures, setMenuFeatures] = useState(roleFeatures || {});

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

  const handleRoleChange = (roleId) => {
    setSelectedRoleId(roleId);
    // Reset menu features when role changes
    setMenuFeatures({});
  };

  const handleMenuToggle = (menuId, isEnabled) => {
    setMenuFeatures(prev => ({
      ...prev,
      [menuId]: isEnabled
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRequestStatus('processing');
    setAlert(null);

    try {
      const formData = new FormData();
      formData.append('role_id', selectedRoleId);
      
      // Convert menu features to array format
      const menuFeaturesArray = Object.entries(menuFeatures).map(([menuId, isEnabled]) => ({
        menu_id: parseInt(menuId),
        is_enabled: isEnabled
      }));
      
      formData.append('menu_features', JSON.stringify(menuFeaturesArray));

      router.post('/system/role-features', formData, {
        onSuccess: () => {
          setAlert({ type: 'success', message: 'Role features updated successfully!' });
          setRequestStatus('success');
        },
        onError: (errors) => {
          setErrors(errors);
          setAlert({ type: 'error', message: 'Please correct the errors below.' });
          setRequestStatus('error');
        }
      });
    } catch (error) {
      setAlert({ type: 'error', message: 'An error occurred. Please try again.' });
      setRequestStatus('error');
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'System', href: '/system', icon: List },
    { label: 'Role Features', href: '/system/role-features', icon: Shield },
    { label: 'Edit', icon: Plus }
  ];

  return (
    <div className="space-y-6">
      {/* Professional Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Alert Messages */}
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

      {/* Role Features Configuration Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Role Features Configuration
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Configure menu access permissions for roles
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Role
            </label>
            <select
              value={selectedRoleId}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.role_name}
                </option>
              ))}
            </select>
            {errors.role_id && (
              <p className="text-sm text-red-600 mt-1">{errors.role_id}</p>
            )}
          </div>

          {/* Menu Features */}
          {selectedRoleId && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Menu Access Permissions
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Select which menu items this role can access
                </p>
              </div>

              {Object.entries(groupedMenus).map(([sectionName, sectionMenus]) => (
                <div key={sectionName} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{sectionName}</h4>
                  </div>
                  <div className="p-4 space-y-3">
                    {sectionMenus.map((menu) => (
                      <div key={menu.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {menu.menu_name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleMenuToggle(menu.id, !menuFeatures[menu.id])}
                          className={`flex items-center justify-center w-8 h-8 rounded-md border transition-colors ${
                            menuFeatures[menu.id]
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                        >
                          {menuFeatures[menu.id] ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <button
              type="button"
              onClick={() => router.visit('/system/role-features')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedRoleId || requestStatus === 'processing'}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {requestStatus === 'processing' ? 'Saving...' : 'Save Role Features'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Edit Component
const Edit = () => {
  return (
    <App>
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <EditRoleFeatureForm />
        </div>
      </div>
    </App>
  );
};

export default Edit;
