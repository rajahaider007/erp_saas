import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

/**
 * Permission-aware form component that wraps forms with permission checks
 */
const PermissionAwareForm = ({ 
  children, 
  requiredPermission = 'can_add',
  menuId,
  route,
  onPermissionDenied,
  fallbackMessage = "You don't have permission to perform this action.",
  showFallback = true,
  ...props 
}) => {
  const { 
    hasPermission, 
    hasRoutePermission, 
    showPermissionDeniedAlert,
    canAdd,
    canEdit,
    canDelete,
    canView
  } = usePermissions();

  // Determine if user has the required permission
  const hasRequiredPermission = React.useMemo(() => {
    if (menuId) {
      return hasPermission(menuId, requiredPermission);
    }
    if (route) {
      return hasRoutePermission(route, requiredPermission);
    }
    return false;
  }, [menuId, route, requiredPermission, hasPermission, hasRoutePermission]);

  // Handle permission denied
  const handlePermissionDenied = () => {
    if (onPermissionDenied) {
      onPermissionDenied();
    } else {
      showPermissionDeniedAlert(
        requiredPermission.replace('can_', ''), 
        'this resource'
      );
    }
  };

  // If user doesn't have permission, show fallback or nothing
  if (!hasRequiredPermission) {
    if (showFallback) {
      return (
        <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {fallbackMessage}
            </p>
            <button
              onClick={handlePermissionDenied}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Contact Administrator
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  // Clone children and add permission props
  return React.cloneElement(children, {
    ...props,
    hasPermission: hasRequiredPermission,
    onPermissionDenied: handlePermissionDenied,
  });
};

/**
 * Permission-aware button component
 */
export const PermissionButton = ({ 
  children, 
  requiredPermission = 'can_add',
  menuId,
  route,
  onClick,
  onPermissionDenied,
  disabled = false,
  className = "",
  ...props 
}) => {
  const { 
    hasPermission, 
    hasRoutePermission, 
    showPermissionDeniedAlert 
  } = usePermissions();

  const hasRequiredPermission = React.useMemo(() => {
    if (menuId) {
      return hasPermission(menuId, requiredPermission);
    }
    if (route) {
      return hasRoutePermission(route, requiredPermission);
    }
    return false;
  }, [menuId, route, requiredPermission, hasPermission, hasRoutePermission]);

  const handleClick = (e) => {
    if (!hasRequiredPermission) {
      e.preventDefault();
      e.stopPropagation();
      if (onPermissionDenied) {
        onPermissionDenied();
      } else {
        showPermissionDeniedAlert(
          requiredPermission.replace('can_', ''), 
          'this resource'
        );
      }
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={disabled || !hasRequiredPermission}
      className={`${className} ${!hasRequiredPermission ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

/**
 * Permission-aware link component
 */
export const PermissionLink = ({ 
  children, 
  requiredPermission = 'can_view',
  menuId,
  route,
  href,
  onPermissionDenied,
  className = "",
  ...props 
}) => {
  const { 
    hasPermission, 
    hasRoutePermission, 
    showPermissionDeniedAlert 
  } = usePermissions();

  const hasRequiredPermission = React.useMemo(() => {
    if (menuId) {
      return hasPermission(menuId, requiredPermission);
    }
    if (route) {
      return hasRoutePermission(route, requiredPermission);
    }
    return false;
  }, [menuId, route, requiredPermission, hasPermission, hasRoutePermission]);

  const handleClick = (e) => {
    if (!hasRequiredPermission) {
      e.preventDefault();
      e.stopPropagation();
      if (onPermissionDenied) {
        onPermissionDenied();
      } else {
        showPermissionDeniedAlert(
          requiredPermission.replace('can_', ''), 
          'this resource'
        );
      }
    }
  };

  if (!hasRequiredPermission) {
    return (
      <span
        {...props}
        onClick={handleClick}
        className={`${className} cursor-not-allowed opacity-50`}
      >
        {children}
      </span>
    );
  }

  return (
    <a
      {...props}
      href={href}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
};

export default PermissionAwareForm;
