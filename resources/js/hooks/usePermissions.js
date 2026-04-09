import { usePage } from '@inertiajs/react';
import { useMemo, useCallback } from 'react';

/**
 * Custom hook for checking user permissions
 * @returns {Object} Permission checking functions and user data
 */
export const usePermissions = () => {
  const { auth, userRights, availableMenus } = usePage().props;
  
  
  
  // Create a map of menu permissions for quick lookup (keys: numeric menu id)
  const menuPermissions = useMemo(() => {
    const permissions = {};

    if (userRights && typeof userRights === 'object') {
      Object.values(userRights).forEach((right) => {
        const id = Number(right.menu_id);
        if (!Number.isFinite(id)) return;
        permissions[id] = {
          can_view: Boolean(right.can_view),
          can_add: Boolean(right.can_add),
          can_edit: Boolean(right.can_edit),
          can_delete: Boolean(right.can_delete),
        };
      });
    }
    return permissions;
  }, [userRights]);

  // Create a map of route permissions for quick lookup
  const routePermissions = useMemo(() => {
    const permissions = {};

    if (availableMenus && Array.isArray(availableMenus)) {
      availableMenus.forEach((menu) => {
        const mid = Number(menu.id);
        const perms = Number.isFinite(mid) ? menuPermissions[mid] : null;
        if (menu.route && perms) {
          permissions[menu.route] = perms;
        }
      });
    }

    // GRN menu row may still use legacy URL `/create` while screens use list path — share rights
    const grnPerms =
      permissions['/inventory/goods-receipt-note'] ||
      permissions['/inventory/goods-receipt-note/create'];
    if (grnPerms) {
      permissions['/inventory/goods-receipt-note'] = grnPerms;
      permissions['/inventory/goods-receipt-note/create'] = grnPerms;
    }

    const grnSiPerms =
      permissions['/inventory/grn-supplier-invoice'] ||
      permissions['/inventory/grn-supplier-invoice/create'];
    if (grnSiPerms) {
      permissions['/inventory/grn-supplier-invoice'] = grnSiPerms;
      permissions['/inventory/grn-supplier-invoice/create'] = grnSiPerms;
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
    // Super admin has full access
    if (auth?.user?.role === 'super_admin') {
      return true;
    }

    // If it's a path, resolve menu row (handle GRN / supplier invoice list vs /create URL drift)
    if (typeof menuId === 'string' && menuId.startsWith('/')) {
      let menu = availableMenus?.find((m) => m.route === menuId);
      if (
        !menu &&
        (menuId === '/inventory/goods-receipt-note' || menuId.startsWith('/inventory/goods-receipt-note/'))
      ) {
        menu = availableMenus?.find(
          (m) =>
            m.route === '/inventory/goods-receipt-note' || m.route === '/inventory/goods-receipt-note/create'
        );
      }
      if (
        !menu &&
        (menuId === '/inventory/grn-supplier-invoice' || menuId.startsWith('/inventory/grn-supplier-invoice/'))
      ) {
        menu = availableMenus?.find(
          (m) =>
            m.route === '/inventory/grn-supplier-invoice' ||
            m.route === '/inventory/grn-supplier-invoice/create'
        );
      }
      if (menu) {
        menuId = Number(menu.id);
      } else {
        return false;
      }
    }

    const mid = Number(menuId);
    return (
      (Number.isFinite(mid) ? menuPermissions[mid]?.[permission] : null) ||
      menuPermissions[menuId]?.[permission] ||
      false
    );
  }, [auth?.user?.role, availableMenus, menuPermissions]);

  /**
   * Check if user has permission for a specific route
   * @param {string} route - Route path
   * @param {string} permission - Permission type
   * @returns {boolean}
   */
  const hasRoutePermission = useCallback(
    (route, permission = 'can_view') => {
      const direct = routePermissions[route]?.[permission];
      if (direct) return true;
      if (routePermissions[route] && routePermissions[route][permission] === false) return false;
      // Subpages (e.g. …/5/edit) inherit base menu rights
      if (route?.startsWith('/inventory/goods-receipt-note/')) {
        return (
          routePermissions['/inventory/goods-receipt-note']?.[permission] ||
          routePermissions['/inventory/goods-receipt-note/create']?.[permission] ||
          false
        );
      }
      if (route?.startsWith('/inventory/grn-supplier-invoice/')) {
        return (
          routePermissions['/inventory/grn-supplier-invoice']?.[permission] ||
          routePermissions['/inventory/grn-supplier-invoice/create']?.[permission] ||
          false
        );
      }
      return false;
    },
    [routePermissions]
  );

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
  const getMenuPermissions = useCallback(
    (menuId) => {
      if (typeof menuId === 'string' && menuId.startsWith('/')) {
        const fromMap = routePermissions[menuId];
        if (fromMap) return fromMap;
        if (menuId.startsWith('/inventory/goods-receipt-note/')) {
          return (
            routePermissions['/inventory/goods-receipt-note'] ||
            routePermissions['/inventory/goods-receipt-note/create'] || {
              can_view: false,
              can_add: false,
              can_edit: false,
              can_delete: false,
            }
          );
        }
        if (menuId.startsWith('/inventory/grn-supplier-invoice/')) {
          return (
            routePermissions['/inventory/grn-supplier-invoice'] ||
            routePermissions['/inventory/grn-supplier-invoice/create'] || {
              can_view: false,
              can_add: false,
              can_edit: false,
              can_delete: false,
            }
          );
        }
        return {
          can_view: false,
          can_add: false,
          can_edit: false,
          can_delete: false,
        };
      }

      const mid = Number(menuId);
      return (
        (Number.isFinite(mid) ? menuPermissions[mid] : null) ||
        menuPermissions[menuId] || {
          can_view: false,
          can_add: false,
          can_edit: false,
          can_delete: false,
        }
      );
    },
    [routePermissions, menuPermissions]
  );

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
   * Check if user has access to at least one form/menu in a module (by folder_name).
   * Used for sidebar module visibility and ERP Modules screen.
   * @param {string} folderName - Module folder name (e.g. 'accounts', 'system')
   * @returns {boolean}
   */
  const hasAccessToModule = useCallback((folderName) => {
    if (!folderName) return false;
    if (auth?.user?.role === 'super_admin') return true;
    if (!availableMenus || !Array.isArray(availableMenus)) return false;
    const normalized = String(folderName).toLowerCase();
    return availableMenus.some((m) => {
      const mid = Number(m.id);
      const perms = Number.isFinite(mid) ? menuPermissions[mid] : null;
      return String(m.folder_name || '').toLowerCase() === normalized && perms?.can_view === true;
    });
  }, [auth?.user?.role, availableMenus, menuPermissions]);

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
    hasAccessToModule,
    
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
