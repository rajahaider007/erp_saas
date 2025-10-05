import React, { useState, useEffect } from 'react';
import { Shield, Eye, Plus, Edit, Trash2, Save, X } from 'lucide-react';

const UserRightsConfig = ({ 
  userId, 
  companyId, 
  availableMenus = [], 
  userRights = {}, 
  onSave, 
  onCancel 
}) => {
  const [rights, setRights] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize rights from props
  useEffect(() => {
    if (Object.keys(userRights).length > 0) {
      const formattedRights = {};
      Object.entries(userRights).forEach(([menuId, right]) => {
        formattedRights[menuId] = {
          can_view: right.can_view || false,
          can_add: right.can_add || false,
          can_edit: right.can_edit || false,
          can_delete: right.can_delete || false,
        };
      });
      setRights(formattedRights);
    }
  }, [userRights]);

  // Group menus by module and section
  const groupedMenus = availableMenus.reduce((groups, menu) => {
    const moduleName = menu.section?.module?.module_name || 'Other';
    const sectionName = menu.section?.section_name || 'General';
    
    if (!groups[moduleName]) {
      groups[moduleName] = {};
    }
    if (!groups[moduleName][sectionName]) {
      groups[moduleName][sectionName] = [];
    }
    
    groups[moduleName][sectionName].push(menu);
    return groups;
  }, {});

  const handleRightChange = (menuId, permission, value) => {
    setRights(prev => ({
      ...prev,
      [menuId]: {
        ...prev[menuId],
        [permission]: value,
        // If view is disabled, disable all other permissions
        ...(permission === 'can_view' && !value ? {
          can_add: false,
          can_edit: false,
          can_delete: false,
        } : {})
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(rights);
    } catch (error) {
      console.error('Error saving rights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPermissionIcon = (permission) => {
    switch (permission) {
      case 'can_view': return Eye;
      case 'can_add': return Plus;
      case 'can_edit': return Edit;
      case 'can_delete': return Trash2;
      default: return Eye;
    }
  };

  const getPermissionColor = (permission, value) => {
    if (!value) return 'text-gray-400';
    
    switch (permission) {
      case 'can_view': return 'text-blue-600';
      case 'can_add': return 'text-green-600';
      case 'can_edit': return 'text-yellow-600';
      case 'can_delete': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          User Rights Configuration
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Configure what this user can view, add, edit, and delete based on your company package
        </p>
      </div>

      <div className="p-6">
        {Object.keys(groupedMenus).length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No menus available
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              This company doesn't have any package features configured yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMenus).map(([moduleName, sections]) => (
              <div key={moduleName} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-600">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">{moduleName}</h4>
                </div>
                
                <div className="divide-y divide-gray-200 dark:divide-gray-600">
                  {Object.entries(sections).map(([sectionName, menus]) => (
                    <div key={sectionName}>
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                        <h5 className="font-medium text-gray-700 dark:text-gray-300">{sectionName}</h5>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        {menus.map((menu) => (
                          <div key={menu.id} className="flex items-center justify-between">
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {menu.menu_name}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              {['can_view', 'can_add', 'can_edit', 'can_delete'].map((permission) => {
                                const Icon = getPermissionIcon(permission);
                                const value = rights[menu.id]?.[permission] || false;
                                const isDisabled = permission !== 'can_view' && !rights[menu.id]?.can_view;
                                
                                return (
                                  <div key={permission} className="flex items-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRightChange(menu.id, permission, !value)}
                                      disabled={isDisabled}
                                      className={`flex items-center justify-center w-8 h-8 rounded-md border transition-colors ${
                                        value
                                          ? `bg-blue-600 border-blue-600 text-white`
                                          : `bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 ${
                                              isDisabled 
                                                ? 'text-gray-300 cursor-not-allowed' 
                                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                            }`
                                      }`}
                                      title={permission.replace('can_', '').replace('_', ' ')}
                                    >
                                      <Icon className={`w-4 h-4 ${getPermissionColor(permission, value)}`} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <X className="w-4 h-4 mr-2 inline" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || Object.keys(groupedMenus).length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2 inline" />
            {loading ? 'Saving...' : 'Save Rights'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserRightsConfig;
