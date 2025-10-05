import React, { useState, useEffect, useMemo } from 'react';
import { usePage, router } from '@inertiajs/react';
import { 
  User, Building, MapPin, Users, Package, Shield, 
  Eye, Plus, Edit, Trash2, CheckSquare, Square,
  Home, Settings, ChevronDown, ChevronRight
} from 'lucide-react';
import App from '../../App.jsx';

const CustomAlert = { 
  fire: ({ title, text, icon, showCancelButton = false, confirmButtonText = 'OK', cancelButtonText = 'Cancel', onConfirm, onCancel }) => {
    if (icon === 'success') {
      alert(`✅ ${title}\n${text}`);
    } else if (icon === 'error') {
      alert(`❌ ${title}\n${text}`);
    } else {
      alert(`${title}\n${text}`);
    }
  } 
};

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
    <div className="breadcrumbs-description">Configure user permissions and access rights</div>
  </div>
);

const UserRights = () => {
  const { user, availableMenus, userRights: existingRights, flash } = usePage().props;
  const [rights, setRights] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedSections, setExpandedSections] = useState({});

  // Initialize rights from existing user rights
  useEffect(() => {
    if (existingRights && Object.keys(existingRights).length > 0) {
      const initialRights = {};
      Object.values(existingRights).forEach(right => {
        initialRights[right.menu_id] = {
          can_view: right.can_view,
          can_add: right.can_add,
          can_edit: right.can_edit,
          can_delete: right.can_delete
        };
      });
      setRights(initialRights);
    }
  }, [existingRights]);

  // Handle flash messages
  useEffect(() => {
    if (flash?.success) {
      CustomAlert.fire({ title: 'Success!', text: flash.success, icon: 'success' });
    } else if (flash?.error) {
      CustomAlert.fire({ title: 'Error!', text: flash.error, icon: 'error' });
    }
  }, [flash]);

  // Group menus by module and section
  const groupedMenus = useMemo(() => {
    const groups = {};
    availableMenus.forEach(menu => {
      const moduleName = menu.section?.module?.module_name || 'Other';
      const sectionName = menu.section?.section_name || 'General';
      
      if (!groups[moduleName]) {
        groups[moduleName] = {};
      }
      if (!groups[moduleName][sectionName]) {
        groups[moduleName][sectionName] = [];
      }
      groups[moduleName][sectionName].push(menu);
    });
    return groups;
  }, [availableMenus]);

  // Initialize expanded states to expand all modules and sections by default
  useEffect(() => {
    if (Object.keys(groupedMenus).length > 0) {
      const initialExpandedModules = {};
      const initialExpandedSections = {};
      
      Object.keys(groupedMenus).forEach(moduleName => {
        initialExpandedModules[moduleName] = true;
        
        Object.keys(groupedMenus[moduleName]).forEach(sectionName => {
          initialExpandedSections[`${moduleName}-${sectionName}`] = true;
        });
      });
      
      setExpandedModules(initialExpandedModules);
      setExpandedSections(initialExpandedSections);
    }
  }, [groupedMenus]);

  // Toggle individual right
  const toggleRight = (menuId, rightType) => {
    setRights(prev => ({
      ...prev,
      [menuId]: {
        ...prev[menuId],
        [rightType]: !prev[menuId]?.[rightType]
      }
    }));
  };

  // Toggle all rights for a menu
  const toggleAllRightsForMenu = (menuId, enabled) => {
    setRights(prev => ({
      ...prev,
      [menuId]: {
        can_view: enabled,
        can_add: enabled,
        can_edit: enabled,
        can_delete: enabled
      }
    }));
  };

  // Toggle all rights for a section
  const toggleAllRightsForSection = (sectionMenus, enabled) => {
    setRights(prev => {
      const newRights = { ...prev };
      sectionMenus.forEach(menu => {
        newRights[menu.id] = {
          can_view: enabled,
          can_add: enabled,
          can_edit: enabled,
          can_delete: enabled
        };
      });
      return newRights;
    });
  };

  // Toggle all rights for a module
  const toggleAllRightsForModule = (moduleSections, enabled) => {
    setRights(prev => {
      const newRights = { ...prev };
      Object.values(moduleSections).forEach(sectionMenus => {
        sectionMenus.forEach(menu => {
          newRights[menu.id] = {
            can_view: enabled,
            can_add: enabled,
            can_edit: enabled,
            can_delete: enabled
          };
        });
      });
      return newRights;
    });
  };

  // Toggle module expansion
  const toggleModule = (moduleName) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName]
    }));
  };

  // Toggle section expansion
  const toggleSection = (moduleName, sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [`${moduleName}-${sectionName}`]: !prev[`${moduleName}-${sectionName}`]
    }));
  };

  // Save rights
  const handleSave = () => {
    const userRights = Object.entries(rights).map(([menuId, rightsData]) => ({
      menu_id: parseInt(menuId),
      ...rightsData
    }));

    console.log('Sending user rights data:', userRights);
    console.log('Current rights state:', rights);

    router.put(`/system/users/${user.id}/rights`, {
      user_rights: userRights,
      _method: 'PUT'
    }, {
      onSuccess: (page) => {
        console.log('Success response:', page);
        CustomAlert.fire({ 
          title: 'Success!', 
          text: 'User rights updated successfully!', 
          icon: 'success' 
        });
      },
      onError: (errors) => {
        console.log('Error response:', errors);
        console.log('Error details:', JSON.stringify(errors, null, 2));
        CustomAlert.fire({ 
          title: 'Error!', 
          text: `Failed to update user rights: ${JSON.stringify(errors)}`, 
          icon: 'error' 
        });
      }
    });
  };

  const breadcrumbItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Users', icon: Users, href: '/system/users' },
    { label: 'User Rights', icon: Shield, href: null },
  ];

  return (
    <App>
      {/* Main Content Card */}
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} />
          
          {/* User Information Header */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                  <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.fname} {user.mname} {user.lname}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">User Rights Configuration</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">User ID</div>
                <div className="font-medium text-gray-900 dark:text-white">{user.loginid}</div>
              </div>
            </div>
            
            {/* Company Information */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">User Name</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.fname} {user.mname} {user.lname}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Company</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.company?.company_name || 'Not assigned'}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.location?.location_name || 'Not assigned'}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Department</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.department?.department_name || 'Not assigned'}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Package</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.company?.package?.package_name || 'Not assigned'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Permission Configuration */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Permission Configuration
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configure what this user can access based on your company package
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {Object.entries(groupedMenus).map(([moduleName, sections]) => (
                  <div key={moduleName} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    {/* Module Header */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleModule(moduleName)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {expandedModules[moduleName] ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </button>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {moduleName}
                          </h3>
                          <button
                            onClick={() => toggleAllRightsForModule(sections, true)}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 dark:bg-green-900/50 dark:text-green-400"
                          >
                            Allow All
                          </button>
                          <button
                            onClick={() => toggleAllRightsForModule(sections, false)}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400"
                          >
                            Deny All
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Sections */}
                    {expandedModules[moduleName] && (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {Object.entries(sections).map(([sectionName, menus]) => (
                          <div key={sectionName}>
                            {/* Section Header */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() => toggleSection(moduleName, sectionName)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                  >
                                    {expandedSections[`${moduleName}-${sectionName}`] ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </button>
                                  <h4 className="text-md font-medium text-gray-800 dark:text-white">
                                    {sectionName}
                                  </h4>
                                  <button
                                    onClick={() => toggleAllRightsForSection(menus, true)}
                                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 dark:bg-green-900/50 dark:text-green-400"
                                  >
                                    Allow All
                                  </button>
                                  <button
                                    onClick={() => toggleAllRightsForSection(menus, false)}
                                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400"
                                  >
                                    Deny All
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Menus */}
                            {expandedSections[`${moduleName}-${sectionName}`] && (
                              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {menus.map(menu => (
                                  <div key={menu.id} className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                          <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                        </div>
                                        <div>
                                          <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                            {menu.menu_name}
                                          </h5>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {menu.menu_description || 'No description'}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-4">
                                        {/* Quick Toggle */}
                                        <button
                                          onClick={() => toggleAllRightsForMenu(menu.id, !rights[menu.id]?.can_view)}
                                          className="flex items-center space-x-1 px-2 py-1 text-xs rounded"
                                        >
                                          {rights[menu.id]?.can_view ? (
                                            <span className="text-green-600 dark:text-green-400">✓ Allowed</span>
                                          ) : (
                                            <span className="text-gray-500 dark:text-gray-400">✗ Denied</span>
                                          )}
                                        </button>

                                        {/* Individual Rights */}
                                        <div className="flex items-center space-x-2">
                                          {/* View Right */}
                                          <button
                                            onClick={() => toggleRight(menu.id, 'can_view')}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                              rights[menu.id]?.can_view
                                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                                : 'bg-gray-200 text-gray-500 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                                            }`}
                                            title="View Right"
                                          >
                                            <Eye className="h-4 w-4" />
                                          </button>

                                          {/* Add Right */}
                                          <button
                                            onClick={() => toggleRight(menu.id, 'can_add')}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                              rights[menu.id]?.can_add
                                                ? 'bg-green-500 text-white hover:bg-green-600'
                                                : 'bg-gray-200 text-gray-500 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                                            }`}
                                            title="Add Right"
                                          >
                                            <Plus className="h-4 w-4" />
                                          </button>

                                          {/* Edit Right */}
                                          <button
                                            onClick={() => toggleRight(menu.id, 'can_edit')}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                              rights[menu.id]?.can_edit
                                                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                : 'bg-gray-200 text-gray-500 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                                            }`}
                                            title="Edit Right"
                                          >
                                            <Edit className="h-4 w-4" />
                                          </button>

                                          {/* Delete Right */}
                                          <button
                                            onClick={() => toggleRight(menu.id, 'can_delete')}
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                              rights[menu.id]?.can_delete
                                                ? 'bg-red-500 text-white hover:bg-red-600'
                                                : 'bg-gray-200 text-gray-500 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                                            }`}
                                            title="Delete Right"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => router.visit('/system/users')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Rights
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
};

export default UserRights;
