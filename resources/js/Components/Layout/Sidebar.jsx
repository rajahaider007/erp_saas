import React from 'react';
import { createPortal } from 'react-dom';
import { Link, usePage } from '@inertiajs/react';
import { useLayout } from '../../Contexts/LayoutContext';
import { usePermissions } from '../../hooks/usePermissions';
import {
  X,
  Home,
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  FileText,
  Settings,
  ChevronRight,
  Layers,
  CreditCard,
  Calendar,
  Mail,
  Phone,
  Building,
  Bell
} from 'lucide-react';

const TooltipPortal = ({ item, anchorEl, onRequestClose, keepOpenClear }) => {
  const portalRef = React.useRef(null);
  const [pos, setPos] = React.useState({ left: 0, top: 0 });

  const computePosition = React.useCallback(() => {
    if (!anchorEl || !portalRef.current) return;
    const rect = anchorEl.getBoundingClientRect();
    const tooltip = portalRef.current;
    const tooltipW = tooltip.offsetWidth;
    const tooltipH = tooltip.offsetHeight;
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // prefer right side
    let left = rect.right + 8 + scrollX;
    let top = rect.top + scrollY + (rect.height - tooltipH) / 2;

    // if overflows on right, flip to left
    if (left + tooltipW > window.innerWidth + scrollX - 8) {
      left = rect.left - tooltipW - 8 + scrollX;
    }

    // clamp vertically
    const maxTop = window.innerHeight + scrollY - tooltipH - 8;
    if (top > maxTop) top = Math.max(scrollY + 8, maxTop);
    if (top < scrollY + 8) top = scrollY + 8;

    setPos({ left, top });
  }, [anchorEl]);

  // compute position after mount and when anchorEl/item changes
  React.useLayoutEffect(() => {
    computePosition();
  }, [computePosition, item, anchorEl]);

  // update on scroll / resize
  React.useEffect(() => {
    if (!anchorEl) return;
    const handler = () => computePosition();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [anchorEl, computePosition]);

  if (!item || !anchorEl) return null;

  return createPortal(
    <div
      ref={portalRef}
      style={{
        position: 'absolute',
        left: pos.left,
        top: pos.top,
        zIndex: 99999, // very high to be on top of everything
        minWidth: 240
      }}
      className="rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
      onMouseEnter={() => {
        keepOpenClear(); // prevent parent close timeout
      }}
      onMouseLeave={() => {
        onRequestClose();
      }}
    >
      <div className="p-2">
        <div className="px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 mb-2">
          {item.name}
        </div>
        <div className="space-y-1">
          {item.children.map(child => {
            const ChildIcon = child.icon;
            const isChildActive = window.location.pathname === child.href || window.location.pathname.startsWith(child.href + '/');

            return (
              <Link
                key={child.name}
                href={child.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isChildActive
                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                  }`}
              >
                <ChildIcon className="h-4 w-4 flex-shrink-0" />
                <span className="ml-3 truncate">{child.name}</span>
                {isChildActive && <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />}
              </Link>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
};

const Sidebar = () => {
  const { url } = usePage();
  const {
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    headerAsSidebar
  } = useLayout();
  
  const { canView, getAccessibleMenus } = usePermissions();

  const [expandedItems, setExpandedItems] = React.useState([]);
  // hovered item object when collapsed
  const [hoveredItem, setHoveredItem] = React.useState(null);
  const [hoveredAnchor, setHoveredAnchor] = React.useState(null);
  const hoverCloseTimeoutRef = React.useRef(null);

  const [navigation, setNavigation] = React.useState([]);

  // State for current module data
  const [currentModuleData, setCurrentModuleData] = React.useState(null);
  const [loadingModuleData, setLoadingModuleData] = React.useState(false);

  // Get props at component level
  const { availableMenus, auth, modules } = usePage().props;
  const user = auth?.user;

  // Function to detect if we're in a module-specific URL
  const isModuleUrl = (url) => {
    if (!url) return false;
    const path = url.replace(/^\/+/, '').split('/');
    return path.length > 0 && 
           path[0] !== 'system' && 
           path[0] !== 'dashboard' && 
           path[0] !== 'erp-modules' &&
           path[0] !== '';
  };

  // Function to get current module name from URL
  const getCurrentModuleName = (url) => {
    if (!url) return null;
    const path = url.replace(/^\/+/, '').split('/');
    return path[0];
  };

  // Function to get module icon based on folder name
  const getModuleIcon = (folderName) => {
    const iconMap = {
      'accounts': FileText,
      'inventory': Package,
      'sales': ShoppingCart,
      'purchases': CreditCard,
      'hr': Users,
      'finance': BarChart3,
      'system': Settings,
      'reports': BarChart3,
      'dashboard': Home
    };
    return iconMap[folderName] || Package;
  };

  // Build navigation based on user permissions
  React.useEffect(() => {
    const buildNavigation = () => {
      // Determine dashboard href based on current module
      const getDashboardHref = () => {
        if (isModuleUrl(url)) {
          const moduleName = getCurrentModuleName(url);
          return `/${moduleName}`;
        }
        return '/dashboard';
      };

      const navItems = [
        {
          name: 'ERP Modules',
          href: '/erp-modules',
          icon: Package,
          current: url === '/erp-modules'
        },
        {
          name: 'Dashboard',
          href: getDashboardHref(),
          icon: Home,
          current: url === '/dashboard' || (isModuleUrl(url) && url === `/${getCurrentModuleName(url)}`)
        }
      ];

      // Add ERP Modules link if user has access
      if (canView('/erp-modules')) {
        navItems.push({
          name: 'ERP Modules',
          href: '/erp-modules',
          icon: Package,
          current: url === '/erp-modules'
        });
      }

      // Add accessible modules
      if (modules && Array.isArray(modules)) {
        modules.forEach(module => {
          if (canView(`/${module.folder_name}`)) {
            navItems.push({
              name: module.module_name,
              href: `/${module.folder_name}`,
              icon: getModuleIcon(module.folder_name),
              current: url.startsWith(`/${module.folder_name}`),
              children: [] // Will be populated with sections/menus
            });
          }
        });
      }

      setNavigation(navItems);
    };

    buildNavigation();
  }, [url, modules, canView]);

  // Load current module data from session
  React.useEffect(() => {
    const loadCurrentModuleData = async () => {
      if (!isModuleUrl(url)) {
        setCurrentModuleData(null);
        return;
      }

      setLoadingModuleData(true);
      try {
        const response = await fetch('/get-current-module');
        const data = await response.json();
        
        console.log('Module data response:', data);
        
        if (data.success && data.data) {
          setCurrentModuleData(data.data);
        } else {
          console.warn('Module data loading failed:', data);
          setCurrentModuleData(null);
        }
      } catch (error) {
        console.error('Failed to load module data:', error);
        setCurrentModuleData(null);
      } finally {
        setLoadingModuleData(false);
      }
    };

    loadCurrentModuleData();
  }, [url]);

  // Remove System section completely
  React.useEffect(() => {
    // Always remove System section from navigation
    setNavigation(prev => {
      return prev.filter(i => i.name !== 'System');
    });
  }, [url, canView, availableMenus, user?.role]);

  // Update navigation when current module data changes
  React.useEffect(() => {
    if (!currentModuleData || !currentModuleData.module) return;
    
    console.log('Current module data:', currentModuleData);

    // Instead of creating a module group, add sections directly to navigation
    const sectionsToAdd = (currentModuleData.sections || [])
      .filter(section => {
        // Check if section has required properties
        if (!section || !section.section_name) return false;
        
        // Check if user has permission to view this section
        if (user?.role === 'super_admin') {
          return true;
        }
        return canView(`/${currentModuleData.module.folder_name}/${section.slug || ''}`);
      })
      .map(section => ({
        name: section.section_name,
        href: section.slug ? `/${currentModuleData.module.folder_name}/${section.slug}` : `/${currentModuleData.module.folder_name}`,
        icon: Layers,
        children: (section.menus || [])
          .filter(menu => {
            // Check if menu has required properties
            if (!menu || !menu.menu_name) return false;
            
            // Check if user has permission to view this menu
            if (user?.role === 'super_admin') {
              return true;
            }
            return canView(menu.id);
          })
          .map(menu => ({
            name: menu.menu_name,
            href: (menu.route && menu.route !== 'undefined' && menu.route !== 'null') ? menu.route : '#',
            icon: iconFromName(menu.icon)
          }))
      }))
      .filter(section => section.children.length > 0); // Only show sections that have accessible menus

    setNavigation(prev => {
      // Remove any existing sections from this module and add new ones
      const existingItems = prev.filter(item => 
        !currentModuleData.sections.some(section => section.section_name === item.name)
      );
      return [...existingItems, ...sectionsToAdd];
    });
  }, [currentModuleData, canView, user?.role]);

  // Build navigation from availableMenus (filtered by module)
  React.useEffect(() => {
    if (!availableMenus || availableMenus.length === 0) return;

    // Get current module from URL
    const currentModule = getCurrentModuleName(url);
    if (!currentModule) return;

    // Filter menus by current module
    const moduleMenus = availableMenus.filter(menu => 
      menu.folder_name === currentModule
    );

    // Group menus by section
    const sectionsMap = {};
    moduleMenus.forEach(menu => {
      const sectionName = menu.section_name || 'General';
      if (!sectionsMap[sectionName]) {
        sectionsMap[sectionName] = {
          name: sectionName,
          icon: Layers,
          children: []
        };
      }
      sectionsMap[sectionName].children.push({
        name: menu.menu_name,
        href: menu.route || '#',
        icon: iconFromName(menu.icon)
      });
    });

    // Convert to array and filter out empty sections
    const sectionsToAdd = Object.values(sectionsMap)
      .filter(section => section.children.length > 0);

    setNavigation(prev => {
      // Remove any existing sections from this module and add new ones
      const existingItems = prev.filter(item => 
        !sectionsToAdd.some(section => section.name === item.name)
      );
      return [...existingItems, ...sectionsToAdd];
    });
  }, [availableMenus, url, canView, user?.role]);

  // Map icon name string from DB to lucide-react icon component
  const iconFromName = (name) => {
    switch ((name || '').toLowerCase()) {
      case 'home': return Home;
      case 'users': return Users;
      case 'package': return Package;
      case 'shoppingcart':
      case 'shopping-cart': return ShoppingCart;
      case 'list': return FileText;
      case 'filetext':
      case 'file-text': return FileText;
      case 'settings': return Settings;
      case 'layers': return Layers;
      case 'creditcard':
      case 'credit-card': return CreditCard;
      case 'calendar': return Calendar;
      case 'mail': return Mail;
      case 'building': return Building;
      case 'bell': return Bell;
      default: return Settings;
    }
  };

  // Auto-expand section that contains the current active menu
  React.useEffect(() => {
    const groupsWithActiveChild = navigation
      .filter(item => item.children && item.children.some(ch => url === ch.href || (url || '').startsWith((ch.href || '') + '/')))
      .map(item => item.name);

    if (groupsWithActiveChild.length) {
      setExpandedItems(prev => Array.from(new Set([...prev, ...groupsWithActiveChild])));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, navigation]);

  const toggleExpanded = (name) => {
    setExpandedItems(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  // Called when mouse enters collapsed icon item
  const handleCollapsedHoverEnter = (item, e) => {
    if (!sidebarCollapsed || !item.children) return;
    if (hoverCloseTimeoutRef.current) {
      clearTimeout(hoverCloseTimeoutRef.current);
      hoverCloseTimeoutRef.current = null;
    }
    setHoveredItem(item);
    // anchor element is the DOM node that triggered the hover
    setHoveredAnchor(e.currentTarget);
  };

  const handleCollapsedHoverLeave = () => {
    // small delay so user can move into the portal
    hoverCloseTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
      setHoveredAnchor(null);
      hoverCloseTimeoutRef.current = null;
    }, 120);
  };

  // Called by portal to request close (on its mouseleave)
  const requestCloseFromPortal = () => {
    // small delay — consistent with leaving the anchor
    if (hoverCloseTimeoutRef.current) clearTimeout(hoverCloseTimeoutRef.current);
    hoverCloseTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
      setHoveredAnchor(null);
      hoverCloseTimeoutRef.current = null;
    }, 100);
  };

  const clearPortalCloseTimeout = () => {
    if (hoverCloseTimeoutRef.current) {
      clearTimeout(hoverCloseTimeoutRef.current);
      hoverCloseTimeoutRef.current = null;
    }
  };

  const renderNavigationItem = (item, level = 0) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const isActive = item.current;

    // For collapsed mode we want hover on the outer wrapper element
    const wrapperProps = sidebarCollapsed && hasChildren
      ? {
        onMouseEnter: (e) => handleCollapsedHoverEnter(item, e),
        onMouseLeave: handleCollapsedHoverLeave,
        onFocus: (e) => handleCollapsedHoverEnter(item, e),
        onBlur: handleCollapsedHoverLeave
      }
      : {
        onMouseEnter: () => { }, // keep structure stable
        onMouseLeave: () => { }
      };

    return (
      <div
        key={item.name}
        className="relative"
        {...wrapperProps}
      >
        <div className="relative">
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.name)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${level > 0 ? 'ml-6' : ''
                } ${isActive
                  ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                }`}
            >
              <div className="flex items-center min-w-0">
                <Icon className={`${sidebarCollapsed ? 'h-5 w-5' : 'h-4 w-4'} flex-shrink-0 group-hover:scale-110 transition-transform`} />
                {!sidebarCollapsed && (
                  <span className="ml-3 truncate">{item.name}</span>
                )}
              </div>
              {!sidebarCollapsed && hasChildren && (
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''
                    }`}
                />
              )}
            </button>
          ) : (
            <Link
              href={item.href}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${level > 0 ? 'ml-6' : ''
                } ${isActive
                  ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                }`}
            >
              <Icon className={`${sidebarCollapsed ? 'h-5 w-5' : 'h-4 w-4'} flex-shrink-0 group-hover:scale-110 transition-transform`} />
              {!sidebarCollapsed && (
                <span className="ml-3 truncate">{item.name}</span>
              )}
            </Link>
          )}

          {/* Active indicator */}
          {isActive && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-l-full" />
          )}

          {/* Tooltip for collapsed sidebar (simple text tooltip for no children) */}
          {sidebarCollapsed && !hasChildren && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {item.name}
              <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-r-4 border-r-gray-900 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
            </div>
          )}
        </div>

        {/* Expanded Children (for non-collapsed sidebar) */}
        {hasChildren && isExpanded && !sidebarCollapsed && (
          <div className="mt-1 space-y-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 ml-2">
            {item.children.map(child => {
              const ChildIcon = child.icon;
              const isChildActive = url === child.href || url.startsWith(child.href + '/');

              return (
                <Link
                  key={child.name}
                  href={child.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group ${isChildActive
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                    }`}
                >
                  <ChildIcon className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="ml-3 truncate">{child.name}</span>
                  {isChildActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Don't render sidebar if header is acting as sidebar
  if (headerAsSidebar) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700 w-64 flex-shrink-0 overflow-hidden">
            <div className="flex h-full flex-col">
              {/* Mobile close button */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Navigation
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-md p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto px-4 pb-4 pt-4">
                <div className="space-y-2">
                  {navigation.map(item => renderNavigationItem(item))}
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-gray-200 dark:border-gray-700" />

                {/* Settings */}
                <div className="space-y-1">
                  <Link
                    href="/erp/settings"
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${url.startsWith('/erp/settings')
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                      }`}
                  >
                    <Settings className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="ml-3 truncate">Settings</span>
                  </Link>
                </div>
              </nav>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">ERP</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      ERP System v1.0
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Professional Edition
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`
        bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700
        transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
        flex-shrink-0
        hidden lg:flex
        relative
        z-[50]
      `}>
        <div className="flex h-full flex-col overflow-hidden">
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 pb-4 pt-4" style={{ paddingLeft: 9 }}>
            <div className="space-y-2">
              {navigation.map(item => renderNavigationItem(item))}
            </div>
            <div className="my-6 border-t border-gray-200 dark:border-gray-700" />

            
          </nav>

          {/* Footer */}
          {!sidebarCollapsed && (
            <div className="border-t border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">ERP</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    ERP System v1.0
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Professional Edition
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Portaled tooltip submenu when collapsed */}
      {sidebarCollapsed && hoveredItem && (
        <TooltipPortal
          item={hoveredItem}
          anchorEl={hoveredAnchor}
          onRequestClose={requestCloseFromPortal}
          keepOpenClear={clearPortalCloseTimeout}
        />
      )}
    </>
  );
};

export default Sidebar;
