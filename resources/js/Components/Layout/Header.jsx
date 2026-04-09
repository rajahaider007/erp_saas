import React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { useLayout } from '../../Contexts/LayoutContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useTranslations } from '../../hooks/useTranslations';
import { isSidebarChildActive } from '../../utils/sidebarMenuActive';
import {
  Menu,
  Search,
  Bell,
  Settings,
  User,
  ChevronDown,
  Home,
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  FileText,
  X,
  Globe,
  Layers,
  CreditCard,
  Calendar,
  Mail,
  Building,
  Grid3X3,
  Receipt
} from 'lucide-react';

const Header = () => {
  const { props, url } = usePage();
  const { t, locale, setLocale, supportedLocales } = useTranslations();
  const { auth, company, userRights, availableMenus } = props;
  const user = auth?.user;
  
  const { canView, hasAccessToModule } = usePermissions();
  const {
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    headerAsSidebar,
    openCustomizer
  } = useLayout();

  const [searchOpen, setSearchOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = React.useState(false);
  const [moduleSwitching, setModuleSwitching] = React.useState(false);
  const [moduleDropdownOpen, setModuleDropdownOpen] = React.useState(false);
  const moduleDropdownLeaveTimerRef = React.useRef(null);
  const moduleSwitchRootRef = React.useRef(null);
  const [hoveredNavItem, setHoveredNavItem] = React.useState(null);
  const [currentLanguage, setCurrentLanguage] = React.useState('default');
  const [googleTranslateLoaded, setGoogleTranslateLoaded] = React.useState(false);

  // Language options
  const languages = [
    { code: 'default', name: 'Default (No Translation)', flag: '🏳️' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' }
  ];

  // Enhanced navigation with sub-menus
  const [navigationItems, setNavigationItems] = React.useState([]);

  // Get modules from props at component level
  const { availableModules } = props;
  const modules = availableModules;

  const moduleSwitcherOptions = React.useMemo(() => {
    if (!modules || !Array.isArray(modules)) return [];
    return modules
      .filter((m) => m && m.folder_name && hasAccessToModule(m.folder_name))
      .slice()
      .sort((a, b) => String(a.module_name || '').localeCompare(String(b.module_name || '')));
  }, [modules, hasAccessToModule]);

  // State for current module data
  const [currentModuleData, setCurrentModuleData] = React.useState(null);
  const [loadingModuleData, setLoadingModuleData] = React.useState(false);

  // Build header navigation based on user permissions
  React.useEffect(() => {
    const buildHeaderNavigation = () => {
      const navItems = [
        {
          name: t('header.dashboard'),
          href: '/system/dashboard',
          icon: Home,
          current: url === '/system/dashboard'
        }
      ];

      // Add ERP Modules link if user has access
      if (canView('/system/AddModules')) {
        navItems.push({
          name: t('header.erp_modules'),
          href: '/erp-modules',
          icon: Grid3X3,
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
              current: url.startsWith(`/${module.folder_name}`)
            });
          }
        });
      }

      setNavigationItems(navItems);
    };

    buildHeaderNavigation();
  }, [url, canView, user?.role, modules, t]);

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

  const moduleSelectValue = React.useMemo(() => {
    const folder = getCurrentModuleName(url);
    if (!folder) return '';
    if (folder === 'system' || folder === 'erp-modules') return '';
    const match = moduleSwitcherOptions.some((m) => m.folder_name === folder);
    return match ? folder : '';
  }, [url, moduleSwitcherOptions]);

  const clearModuleDropdownLeaveTimer = React.useCallback(() => {
    if (moduleDropdownLeaveTimerRef.current) {
      clearTimeout(moduleDropdownLeaveTimerRef.current);
      moduleDropdownLeaveTimerRef.current = null;
    }
  }, []);

  const openModuleDropdown = React.useCallback(() => {
    clearModuleDropdownLeaveTimer();
    setModuleDropdownOpen(true);
  }, [clearModuleDropdownLeaveTimer]);

  const scheduleCloseModuleDropdown = React.useCallback(() => {
    clearModuleDropdownLeaveTimer();
    moduleDropdownLeaveTimerRef.current = setTimeout(() => {
      setModuleDropdownOpen(false);
      moduleDropdownLeaveTimerRef.current = null;
    }, 140);
  }, [clearModuleDropdownLeaveTimer]);

  React.useEffect(() => () => clearModuleDropdownLeaveTimer(), [clearModuleDropdownLeaveTimer]);

  React.useEffect(() => {
    if (!moduleDropdownOpen) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        clearModuleDropdownLeaveTimer();
        setModuleDropdownOpen(false);
      }
    };

    const onPointerDown = (e) => {
      const root = moduleSwitchRootRef.current;
      if (root && !root.contains(e.target)) {
        clearModuleDropdownLeaveTimer();
        setModuleDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [moduleDropdownOpen, clearModuleDropdownLeaveTimer]);

  const applyModuleFolder = React.useCallback(
    (folder) => {
      setModuleDropdownOpen(false);
      if (folder === moduleSelectValue) return;
      if (!folder) {
        router.visit('/system/dashboard', {
          preserveScroll: true,
          onStart: () => setModuleSwitching(true),
          onFinish: () => setModuleSwitching(false),
        });
        return;
      }
      const mod = moduleSwitcherOptions.find((m) => m.folder_name === folder);
      if (!mod) return;
      router.post(
        '/set-current-module',
        { module_id: mod.id },
        {
          preserveScroll: true,
          onStart: () => setModuleSwitching(true),
          onFinish: () => setModuleSwitching(false),
        }
      );
    },
    [moduleSelectValue, moduleSwitcherOptions]
  );

  const moduleTriggerLabel = React.useMemo(() => {
    if (!moduleSelectValue) return t('header.system_home');
    const mod = moduleSwitcherOptions.find((m) => m.folder_name === moduleSelectValue);
    return mod?.module_name || t('header.system_home');
  }, [moduleSelectValue, moduleSwitcherOptions, t]);

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
        
        if (data.success && data.data) {
          setCurrentModuleData(data.data);
        } else {
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

  // Update navigation when current module data changes
  React.useEffect(() => {
    if (!currentModuleData || !currentModuleData.module) return;

    // Build sections and menus from current module data
    const sectionsToAdd = (currentModuleData.sections || [])
      .filter(section => {
        if (!section || !section.section_name) return false;
        if (user?.role === 'super_admin') return true;
        const sectionMenus = section.menus || [];
        if (sectionMenus.some(m => m && m.menu_name && canView(m.id))) {
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
            if (!menu || !menu.menu_name) return false;
            if (user?.role === 'super_admin') return true;
            return canView(menu.id);
          })
          .map(menu => ({
            name: menu.menu_name,
            href: (menu.route && menu.route !== 'undefined' && menu.route !== 'null') ? menu.route : '#',
            icon: iconFromName(menu.icon)
          }))
      }))
      .filter(section => section.children.length > 0);

    setNavigationItems(prev => {
      // Remove any existing sections from this module and add new ones
      const existingItems = prev.filter(item => 
        !currentModuleData.sections.some(section => section.section_name === item.name)
      );
      return [...existingItems, ...sectionsToAdd];
    });
  }, [currentModuleData, canView, user?.role]);

  // Build navigation from availableMenus (filtered by module) - as fallback
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

    setNavigationItems(prev => {
      // Remove any existing sections from this module and add new ones
      const existingItems = prev.filter(item => 
        !sectionsToAdd.some(section => section.name === item.name)
      );
      return [...existingItems, ...sectionsToAdd];
    });
  }, [availableMenus, url, canView, user?.role]);

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

  // Map icon names from DB to lucide-react components
  const iconFromName = (name) => {
    switch ((name || '').toLowerCase()) {
      case 'home': return Home;
      case 'users': return Users;
      case 'package': return Package;
      case 'shoppingcart':
      case 'shopping-cart': return ShoppingCart;
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
      case 'receipt': return Receipt;
      default: return Settings;
    }
  };

  // Initialize Google Translate
  const googleTranslateElementInit = React.useCallback(() => {
    if (window.google && window.google.translate) {
      try {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: languages.filter(lang => lang.code !== 'default').map(lang => lang.code).join(','),
          autoDisplay: false
        }, 'google_translate_element');

        setGoogleTranslateLoaded(true);
      } catch (error) {
        // Silent error handling
      }
    }
  }, []);

  // Load Google Translate script
  const loadGoogleTranslate = React.useCallback(() => {
    if (googleTranslateLoaded || document.getElementById('google-translate-script')) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      window.googleTranslateElementInit = googleTranslateElementInit;

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onload = () => {
        resolve();
      };
      script.onerror = (error) => {
        reject(error);
      };
      document.body.appendChild(script);
    });
  }, [googleTranslateLoaded, googleTranslateElementInit]);

  // Load saved language preference
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');

    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
      if (savedLanguage !== 'default') {
        loadGoogleTranslate().then(() => {
          setTimeout(() => {
            changeLanguage(savedLanguage, false);
          }, 2000);
        }).catch((error) => {
          // Silent error handling
        });
      }
    }
  }, [loadGoogleTranslate]);

  // Function to change language
  const changeLanguage = (languageCode, saveToStorage = true) => {
    if (languageCode === 'default') {
      const translateElement = document.getElementById('google_translate_element');
      if (translateElement) {
        translateElement.innerHTML = '';
      }

      const translateBars = document.querySelectorAll('.goog-te-banner-frame, .goog-te-menu-frame, .skiptranslate');
      translateBars.forEach(bar => bar.remove());

      document.body.classList.remove('translated-ltr', 'translated-rtl');

      setTimeout(() => {
        window.location.reload();
      }, 100);

    } else {
      loadGoogleTranslate().then(() => {
        const waitForTranslateElement = (maxAttempts = 10, attempt = 1) => {
          const select = document.querySelector('#google_translate_element select');
          if (select) {
            select.value = languageCode;
            select.dispatchEvent(new Event('change'));
          } else if (attempt < maxAttempts) {
            setTimeout(() => waitForTranslateElement(maxAttempts, attempt + 1), 500);
          }
        };

        setTimeout(() => waitForTranslateElement(), 1000);

      }).catch((error) => {
        // Silent error handling
      });
    }

    setCurrentLanguage(languageCode);
    if (saveToStorage) {
      localStorage.setItem('selectedLanguage', languageCode);
    }
    setLanguageMenuOpen(false);
  };

  const getCurrentLanguageInfo = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  };

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  // Render navigation item with submenu support for header
  const renderHeaderNavItem = (item) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.current;

    if (hasChildren) {
      return (
        <div
          key={item.name}
          className="relative"
          onMouseEnter={() => setHoveredNavItem(item.name)}
          onMouseLeave={() => setHoveredNavItem(null)}
        >
          <Link
            href={item.href}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group ${isActive
                ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
              }`}
          >
            <Icon className="h-4 w-4" />
            <span className="notranslate">{item.name}</span>
            {hasChildren && (
              <ChevronDown className="h-3 w-3 ml-1 opacity-60" />
            )}
          </Link>

          {/* Submenu dropdown */}
          {hasChildren && hoveredNavItem === item.name && (
            <div className="absolute top-full left-0 mt-1 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 z-50">
              <div className="p-2">
                {item.children.map((child) => {
                  const ChildIcon = child.icon;
                  const isChildActive = isSidebarChildActive(url, child.href);

                  return (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${isChildActive
                          ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                        }`}
                    >
                      <ChildIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="notranslate">{child.name}</span>
                      {isChildActive && (
                        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        href={item.href}
        className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 notranslate ${isActive
            ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
          }`}
      >
        <Icon className="h-4 w-4" />
        <span className="notranslate">{item.name}</span>
      </Link>
    );
  };

  // Add CSS to hide Google Translate UI elements
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      /* Hide Google Translate toolbar and elements */
      .goog-te-banner-frame,
      .goog-te-menu-frame,
      .skiptranslate,
      #google_translate_element,
      .goog-te-gadget,
      .goog-te-combo {
        display: none !important;
      }
      
      /* Hide the translate bar at top */
      .goog-te-banner-frame.skiptranslate {
        display: none !important;
      }
      
      /* Remove body margin added by Google Translate */
      body {
        top: 0 !important;
        margin-top: 0 !important;
      }
      
      /* Hide iframe overlay */
      .goog-te-menu-frame {
        display: none !important;
      }
      
      /* Ensure page content is not pushed down */
      body.translated-ltr,
      body.translated-rtl {
        margin-top: 0 !important;
      }
      
      /* Hide any Google Translate related iframes */
      iframe.goog-te-menu-frame,
      iframe.goog-te-banner-frame {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        width: 0 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>

      {/* Main Header */}
      <header className={`sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60 transition-colors duration-200 ${headerAsSidebar ? 'shadow-lg border-gray-200 dark:border-gray-700' : 'border-gray-200 dark:border-gray-700'
        }`}>
        <div className="container mx-auto flex h-16 max-w-none items-center justify-between px-4 lg:px-6">

          {/* Left Section */}
          <div className="flex items-center space-x-5">
            {/* Menu Button */}
            {!headerAsSidebar && (
              <button
                onClick={toggleSidebar}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white lg:hidden xl:inline-flex transition-colors duration-200"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            {/* Logo */}
            <Link href="/system/dashboard" className="flex items-center space-x-2 notranslate">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
                ERP
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block">
                Enterprise
              </span>
            </Link>

            {/* Company Name - Left Side */}
            <div className="hidden lg:block ml-8">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {company?.company_name || 'ERP Enterprise'}
              </span>
              {props?.fiscalYear && (
                <span className="ml-4 inline-block px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full">
                  FY {props.fiscalYear}
                </span>
              )}
            </div>

            {/* Navigation Menu (when header as sidebar is enabled) */}
            {headerAsSidebar && (
              <nav className="hidden lg:flex items-center space-x-1 ml-8 notranslate">
                {navigationItems.map((item) => renderHeaderNavItem(item))}
              </nav>
            )}
          </div>


          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Module switcher: custom menu, height-matched to locale pill; open on hover */}
            {moduleSwitcherOptions.length > 0 && (
              <div
                ref={moduleSwitchRootRef}
                className={`hidden sm:inline-block align-middle relative max-w-[12.5rem] flex-shrink-0 notranslate transition-opacity duration-300 ease-out ${
                  moduleSwitching ? 'opacity-60 pointer-events-none' : 'opacity-100'
                }`}
                onMouseEnter={openModuleDropdown}
                onMouseLeave={scheduleCloseModuleDropdown}
              >
                <button
                  type="button"
                  id="header-module-switch-trigger"
                  aria-label={t('header.switch_module')}
                  aria-expanded={moduleDropdownOpen}
                  aria-haspopup="listbox"
                  disabled={moduleSwitching}
                  onFocus={openModuleDropdown}
                  onClick={() =>
                    setModuleDropdownOpen((open) => !open)
                  }
                  className="flex w-full max-w-[12.5rem] items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 p-0.5 text-left outline-none transition-[box-shadow,background-color, border-color] duration-200 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                >
                  <span className="inline-flex flex-1 min-w-0 items-center gap-1.5 rounded-md bg-white dark:bg-gray-700 px-2.5 py-1 text-xs font-medium text-gray-900 dark:text-white shadow-sm">
                    <Layers className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden />
                    <span className="truncate">{moduleTriggerLabel}</span>
                  </span>
                  <span className="flex h-full shrink-0 items-center pr-1 text-gray-500 dark:text-gray-400">
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${moduleDropdownOpen ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </span>
                </button>

                {/* Invisible gap filler so hover reaches the panel without mouseleave firing */}
                {moduleDropdownOpen && (
                  <div
                    className="absolute left-0 top-full z-[99] h-1.5 min-w-[12rem]"
                    aria-hidden
                  />
                )}
                <div
                  role="listbox"
                  aria-labelledby="header-module-switch-trigger"
                  className={`absolute left-0 top-[calc(100%+0.375rem)] z-[100] w-max min-w-[12rem] max-w-[17rem] origin-top overflow-hidden rounded-xl border border-gray-200/80 bg-white/95 py-1 shadow-xl shadow-gray-900/10 ring-1 ring-black/5 backdrop-blur-md transition-all duration-200 dark:border-gray-600/80 dark:bg-gray-900/95 dark:shadow-black/40 dark:ring-white/10 ${
                    moduleDropdownOpen
                      ? 'pointer-events-auto visible scale-100 opacity-100 translate-y-0'
                      : 'pointer-events-none invisible scale-95 opacity-0 -translate-y-0.5'
                  }`}
                  onMouseEnter={openModuleDropdown}
                  onMouseLeave={scheduleCloseModuleDropdown}
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={!moduleSelectValue}
                    onClick={() => applyModuleFolder('')}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-colors duration-150 ${
                      !moduleSelectValue
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Home className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                    <span className="truncate">{t('header.system_home')}</span>
                  </button>
                  <div className="mx-2 my-1 border-t border-gray-200/80 dark:border-gray-700/80" />
                  {moduleSwitcherOptions.map((m) => {
                    const active = moduleSelectValue === m.folder_name;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => applyModuleFolder(m.folder_name)}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-colors duration-150 ${
                          active
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Layers className="h-3.5 w-3.5 shrink-0 text-blue-600 opacity-80 dark:text-blue-400" aria-hidden />
                        <span className="truncate">{m.module_name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* App locale (EN / اردو) — in-app translations */}
            {supportedLocales && supportedLocales.length > 1 && (
              <div className="hidden sm:flex items-center rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 p-0.5">
                {supportedLocales.map((loc) => (
                  <button
                    key={loc.code}
                    type="button"
                    onClick={() => setLocale(loc.code)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${locale === loc.code ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                    title={loc.name}
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            )}

            {/* Language Selector (e.g. Google Translate) */}
            <div className="relative">
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="inline-flex items-center justify-center space-x-2 rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-colors duration-200 notranslate"
                aria-label={t('header.language')}
              >
                <Globe className="h-5 w-5" />
                <span className="hidden sm:block text-xs notranslate">
                  {getCurrentLanguageInfo().flag}
                </span>
              </button>

              {/* Language Dropdown */}
              {languageMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 z-50 notranslate">
                  <div className="py-1">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => changeLanguage(language.code)}
                        className={`w-full flex items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 notranslate ${currentLanguage === language.code
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        <span className="mr-3 text-base notranslate">{language.flag}</span>
                        <span className="flex-1 text-left notranslate">{language.name}</span>
                        {currentLanguage === language.code && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-colors duration-200"
                aria-label={t('header.notifications')}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 z-50 notranslate">
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white notranslate">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {/* Sample notifications */}
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border-t border-gray-200 p-4 dark:border-gray-700">
                        <p className="text-sm text-gray-900 dark:text-white">New order received #00{i}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 notranslate">2 minutes ago</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <button
              onClick={openCustomizer}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-colors duration-200"
              aria-label={t('header.settings')}
            >
              <Settings className="h-5 w-5" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 rounded-md p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-colors duration-200"
                aria-label={t('header.profile')}
              >
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  {user?.profile_photo_url ? (
                    <img
                      src={user.profile_photo_url}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {user?.fname ? `${user.fname} ${user.lname}`.trim() : t('common.labels.user')}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 z-50 notranslate">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.fname ? `${user.fname} ${user.lname}`.trim() : 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/logout"
                      method="post"
                      className="block px-4 py-2 text-sm text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 notranslate"
                    >
                      Sign out
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>


      {/* Click outside handlers */}
      {(profileOpen || notificationsOpen || languageMenuOpen || hoveredNavItem) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setProfileOpen(false);
            setNotificationsOpen(false);
            setLanguageMenuOpen(false);
            setHoveredNavItem(null);
          }}
        />
      )}
    </>
  );
};

export default Header;