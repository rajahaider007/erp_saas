import { usePage } from '@inertiajs/react';
import { useMemo, useCallback } from 'react';

/**
 * Custom hook for checking user permissions
 * @returns {Object} Permission checking functions and user data
 */
export const usePermissions = () => {
  const { auth, userRights, availableMenus } = usePage().props;
  
  
  
  // Create a map of menu permissions for quick lookup
  const menuPermissions = useMemo(() => {
    const permissions = {};
    
    if (userRights && typeof userRights === 'object') {
      // userRights is an object, not an array
      Object.values(userRights).forEach(right => {
        permissions[right.menu_id] = {
          can_view: right.can_view || false,
          can_add: right.can_add || false,
          can_edit: right.can_edit || false,
          can_delete: right.can_delete || false,
        };
      });
    }
    return permissions;
  }, [userRights]);

  // Create a map of route permissions for quick lookup
  const routePermissions = useMemo(() => {
    const permissions = {};
    
    if (availableMenus && Array.isArray(availableMenus)) {
      availableMenus.forEach(menu => {
        if (menu.route && menuPermissions[menu.id]) {
          permissions[menu.route] = menuPermissions[menu.id];
        }
      });
    }
    
    
    return permissions;
  }, [availableMenus, menuPermissions]);

  /**
   * Check if user has permission for a specific menu
   * @param {number|string} menuId - Menu ID or route name
   * @param {string} permission - Permission type (can_view, can_add, can_edit, can_delete)
   * @returns {boolean}
   */
  const hasPermission = useCallback((menuId, permission = 'can_view') => {
    // If it's a route name, find the menu ID
    if (typeof menuId === 'string' && menuId.startsWith('/')) {
      const menu = availableMenus?.find(m => m.route === menuId);
      if (menu) {
        menuId = menu.id;
      } else {
        return false;
      }
    }
    
    return menuPermissions[menuId]?.[permission] || false;
  }, [availableMenus, menuPermissions]);

  /**
   * Check if user has permission for a specific route
   * @param {string} route - Route path
   * @param {string} permission - Permission type
   * @returns {boolean}
   */
  const hasRoutePermission = useCallback((route, permission = 'can_view') => {
    return routePermissions[route]?.[permission] || false;
  }, [routePermissions]);

  /**
   * Check if user can view a specific menu/route
   * @param {number|string} menuId - Menu ID or route name
   * @returns {boolean}
   */
  const canView = useCallback((menuId) => hasPermission(menuId, 'can_view'), [hasPermission]);

  /**
   * Check if user can add to a specific menu/route
   * @param {number|string} menuId - Menu ID or route name
   * @returns {boolean}
   */
  const canAdd = useCallback((menuId) => hasPermission(menuId, 'can_add'), [hasPermission]);

  /**
   * Check if user can edit a specific menu/route
   * @param {number|string} menuId - Menu ID or route name
   * @returns {boolean}
   */
  const canEdit = useCallback((menuId) => hasPermission(menuId, 'can_edit'), [hasPermission]);

  /**
   * Check if user can delete from a specific menu/route
   * @param {number|string} menuId - Menu ID or route name
   * @returns {boolean}
   */
  const canDelete = useCallback((menuId) => hasPermission(menuId, 'can_delete'), [hasPermission]);

  /**
   * Get all permissions for a specific menu
   * @param {number|string} menuId - Menu ID or route name
   * @returns {Object} Permission object
   */
  const getMenuPermissions = useCallback((menuId) => {
    if (typeof menuId === 'string' && menuId.startsWith('/')) {
      return routePermissions[menuId] || {
        can_view: false,
        can_add: false,
        can_edit: false,
        can_delete: false,
      };
    }
    
    return menuPermissions[menuId] || {
      can_view: false,
      can_add: false,
      can_edit: false,
      can_delete: false,
    };
  }, [routePermissions, menuPermissions]);

  /**
   * Check if user has any of the specified roles
   * @param {Array} roles - Array of roles to check
   * @returns {boolean}
   */
  const hasAnyRole = useCallback((roles) => {
    if (!auth?.user?.role) return false;
    return roles.includes(auth.user.role);
  }, [auth?.user?.role]);

  /**
   * Check if user has a specific role
   * @param {string} role - Role to check
   * @returns {boolean}
   */
  const hasRole = useCallback((role) => {
    return auth?.user?.role === role;
  }, [auth?.user?.role]);

  /**
   * Check if user is super admin
   * @returns {boolean}
   */
  const isSuperAdmin = useCallback(() => {
    return hasRole('super_admin');
  }, [hasRole]);

  /**
   * Check if user is admin
   * @returns {boolean}
   */
  const isAdmin = useCallback(() => {
    return hasRole('admin') || isSuperAdmin();
  }, [hasRole, isSuperAdmin]);

  /**
   * Get accessible menus for the current user
   * @returns {Array} Array of accessible menus
   */
  const getAccessibleMenus = useCallback(() => {
    if (!availableMenus) return [];
    
    return availableMenus.filter(menu => 
      hasPermission(menu.id, 'can_view')
    );
  }, [availableMenus, hasPermission]);

  /**
   * Show permission denied alert
   * @param {string} action - Action that was denied
   * @param {string} resource - Resource name
   */
  const showPermissionDeniedAlert = useCallback((action, resource = 'this resource') => {
    alert(`❌ Access Denied\nYou don't have permission to ${action} ${resource}. Please contact your administrator.`);
  }, []);

  return {
    // Permission checking functions
    hasPermission,
    hasRoutePermission,
    canView,
    canAdd,
    canEdit,
    canDelete,
    getMenuPermissions,
    
    // Role checking functions
    hasAnyRole,
    hasRole,
    isSuperAdmin,
    isAdmin,
    
    // Utility functions
    getAccessibleMenus,
    showPermissionDeniedAlert,
    
    // Data
    userRights,
    availableMenus,
    menuPermissions,
    routePermissions,
  };
};

export default usePermissions;
