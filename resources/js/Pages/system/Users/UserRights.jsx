import React, { useState, useEffect, useMemo } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
  User,
  Building,
  MapPin,
  Package,
  Shield,
  Eye,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Save,
  Check,
  X,
} from 'lucide-react';
import App from '../../App.jsx';

const DEFAULT_RIGHT = { can_view: false, can_add: false, can_edit: false, can_delete: false };

function buildInitialRights(userRightsFromServer) {
  const out = {};
  if (!userRightsFromServer || typeof userRightsFromServer !== 'object') return out;
  const entries = Array.isArray(userRightsFromServer)
    ? userRightsFromServer
    : Object.entries(userRightsFromServer).map(([k, v]) => [k, v]);
  entries.forEach(([menuId, r]) => {
    const id = typeof menuId === 'string' ? parseInt(menuId, 10) : menuId;
    if (isNaN(id)) return;
    const row = r && typeof r === 'object' ? r : {};
    out[id] = {
      can_view: !!row.can_view,
      can_add: !!row.can_add,
      can_edit: !!row.can_edit,
      can_delete: !!row.can_delete,
    };
  });
  return out;
}

function groupMenusByModuleSection(menus) {
  const groups = {};
  (menus || []).forEach((menu) => {
    const moduleName = menu.module_name || 'Other';
    const sectionName = menu.section_name || 'General';
    if (!groups[moduleName]) groups[moduleName] = {};
    if (!groups[moduleName][sectionName]) groups[moduleName][sectionName] = [];
    groups[moduleName][sectionName].push(menu);
  });
  return groups;
}

export default function UserRights() {
  const { user, rightsFormMenus = [], userRights: serverRights = {}, flash } = usePage().props;
  const [rights, setRights] = useState(() => buildInitialRights(serverRights));
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const menusArray = Array.isArray(rightsFormMenus) ? rightsFormMenus : [];

  useEffect(() => {
    setRights((prev) => ({ ...buildInitialRights(serverRights), ...prev }));
  }, [serverRights]);

  useEffect(() => {
    if (flash?.success) {
      setMessage({ type: 'success', text: flash.success });
      const t = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(t);
    }
    if (flash?.error) {
      setMessage({ type: 'error', text: flash.error });
    }
  }, [flash]);

  const grouped = useMemo(() => groupMenusByModuleSection(menusArray), [menusArray]);

  useEffect(() => {
    const mods = {};
    const secs = {};
    Object.keys(grouped).forEach((moduleName) => {
      mods[moduleName] = true;
      Object.keys(grouped[moduleName]).forEach((sectionName) => {
        secs[`${moduleName}::${sectionName}`] = true;
      });
    });
    setExpandedModules((prev) => ({ ...mods, ...prev }));
    setExpandedSections((prev) => ({ ...secs, ...prev }));
  }, [grouped]);

  const toggleRight = (menuId, key) => {
    setRights((prev) => ({
      ...prev,
      [menuId]: {
        ...(prev[menuId] || DEFAULT_RIGHT),
        [key]: !(prev[menuId] || DEFAULT_RIGHT)[key],
      },
    }));
  };

  const setAllForMenu = (menuId, value) => {
    setRights((prev) => ({
      ...prev,
      [menuId]: {
        can_view: value,
        can_add: value,
        can_edit: value,
        can_delete: value,
      },
    }));
  };

  const setAllForSection = (menus, value) => {
    setRights((prev) => {
      const next = { ...prev };
      menus.forEach((m) => {
        next[m.id] = {
          can_view: value,
          can_add: value,
          can_edit: value,
          can_delete: value,
        };
      });
      return next;
    });
  };

  const setAllForModule = (sections, value) => {
    setRights((prev) => {
      const next = { ...prev };
      Object.values(sections).forEach((menus) => {
        menus.forEach((m) => {
          next[m.id] = {
            can_view: value,
            can_add: value,
            can_edit: value,
            can_delete: value,
          };
        });
      });
      return next;
    });
  };

  const toggleModule = (name) => {
    setExpandedModules((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleSection = (moduleName, sectionName) => {
    const key = `${moduleName}::${sectionName}`;
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setMessage(null);
    setSaving(true);
    const payload = Object.entries(rights).map(([menuId, data]) => ({
      menu_id: parseInt(menuId, 10),
      can_view: !!data.can_view,
      can_add: !!data.can_add,
      can_edit: !!data.can_edit,
      can_delete: !!data.can_delete,
    }));

    router.put(`/system/users/${user.id}/rights`, { user_rights: payload }, {
      onSuccess: () => {
        setSaving(false);
        setMessage({ type: 'success', text: 'User rights updated successfully.' });
        setTimeout(() => setMessage(null), 4000);
      },
      onError: (errors) => {
        setSaving(false);
        const msg = typeof errors === 'string' ? errors : errors?.message || 'Failed to update rights.';
        setMessage({ type: 'error', text: msg });
      },
      onFinish: () => setSaving(false),
    });
  };

  const RightToggle = ({ menuId, type, icon: Icon, label }) => {
    const on = (rights[menuId] || DEFAULT_RIGHT)[type];
    return (
      <button
        type="button"
        onClick={() => toggleRight(menuId, type)}
        title={`${label}: ${on ? 'Allowed' : 'Denied'}`}
        aria-pressed={on}
        aria-label={`${label} permission ${on ? 'on' : 'off'}`}
        className={`min-w-[2.25rem] h-9 flex items-center justify-center rounded-md border-2 transition-all ${
          on
            ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm hover:bg-emerald-600 dark:bg-emerald-600 dark:border-emerald-500'
            : 'bg-transparent border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-gray-400 hover:text-gray-500 dark:hover:text-gray-400'
        }`}
      >
        <Icon className="h-4 w-4" strokeWidth={on ? 2.5 : 2} />
      </button>
    );
  };

  const fullName = [user?.fname, user?.mname, user?.lname].filter(Boolean).join(' ') || user?.loginid || '—';

  return (
    <App>
      <div className="advanced-module-manager">
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title">
                <Shield className="title-icon" />
                User Rights
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {fullName} · {user?.loginid}
              </p>
            </div>
            <div className="header-actions">
              <Link href="/system/users" className="btn btn-secondary flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Users
              </Link>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <span className="animate-pulse">Saving…</span>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Rights
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 flex items-center gap-3 px-4 py-3 rounded-xl border ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="h-5 w-5 flex-shrink-0" />
            ) : (
              <X className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <div className="rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">User & context</h2>
            <div className="mt-3 flex flex-wrap gap-4 sm:gap-6 text-sm">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <User className="h-4 w-4 text-gray-400" />
                {user?.company?.company_name ?? '—'}
              </span>
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Building className="h-4 w-4 text-gray-400" />
                {user?.location?.location_name ?? '—'}
              </span>
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 text-gray-400" />
                {user?.department?.department_name ?? '—'}
              </span>
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Package className="h-4 w-4 text-gray-400" />
                {user?.company?.package?.package_name ?? '—'}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              Permission configuration
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Configure what this user can access. Use Allow all / Deny all per section or per menu.
            </p>

            {/* Legend: permission icons meaning + checked state */}
            <div className="mb-6 p-4 rounded-lg bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Permission buttons</p>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-9 h-9 rounded-md border-2 bg-emerald-500 border-emerald-600 text-white">
                    <Eye className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">View (on)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-9 h-9 rounded-md border-2 border-gray-300 dark:border-gray-600 text-gray-400 bg-transparent">
                    <Eye className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">View (off)</span>
                </div>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span><strong className="text-gray-700 dark:text-gray-300">View</strong> — open/list</span>
                  <span><strong className="text-gray-700 dark:text-gray-300">Add</strong> — create</span>
                  <span><strong className="text-gray-700 dark:text-gray-300">Edit</strong> — update</span>
                  <span><strong className="text-gray-700 dark:text-gray-300">Delete</strong> — remove</span>
                </div>
              </div>
            </div>

            {menusArray.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No menus available for this user’s package. Assign a company and package first.</p>
                <Link href="/system/users" className="text-primary-600 dark:text-primary-400 hover:underline mt-2 inline-block">
                  Back to Users
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {Object.entries(grouped).map(([moduleName, sections]) => (
                  <div
                    key={moduleName}
                    className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm"
                  >
                    {/* MODULE row — strongest visual */}
                    <button
                      type="button"
                      onClick={() => toggleModule(moduleName)}
                      className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-100 dark:bg-gray-700/80 hover:bg-gray-200 dark:hover:bg-gray-700 text-left border-b-2 border-gray-200 dark:border-gray-600"
                    >
                      <span className="flex items-center gap-3">
                        {expandedModules[moduleName] ? (
                          <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-300 shrink-0" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300 shrink-0" />
                        )}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200">
                          Module
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white text-base">
                          {moduleName}
                        </span>
                      </span>
                      <span className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setAllForModule(sections, true); }}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-900/70"
                        >
                          Allow all
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setAllForModule(sections, false); }}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/70"
                        >
                          Deny all
                        </button>
                      </span>
                    </button>

                    {expandedModules[moduleName] && (
                      <div className="bg-gray-50/50 dark:bg-gray-800/30">
                        {Object.entries(sections).map(([sectionName, menus]) => {
                          const sectionKey = `${moduleName}::${sectionName}`;
                          return (
                            <div key={sectionKey} className="border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                              {/* SECTION row — indented, different bg */}
                              <button
                                type="button"
                                onClick={() => toggleSection(moduleName, sectionName)}
                                className="w-full flex items-center justify-between pl-12 pr-5 py-2.5 bg-white dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-left border-l-4 border-blue-400 dark:border-blue-500"
                              >
                                <span className="flex items-center gap-2">
                                  {expandedSections[sectionKey] ? (
                                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                  )}
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                                    Section
                                  </span>
                                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                    {sectionName}
                                  </span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setAllForSection(menus, true); }}
                                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60"
                                  >
                                    Allow
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setAllForSection(menus, false); }}
                                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60"
                                  >
                                    Deny
                                  </button>
                                </span>
                              </button>

                              {/* MENU rows — most indented, clear form rows */}
                              {expandedSections[sectionKey] && (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700/80 bg-gray-50/30 dark:bg-gray-900/20">
                                  {menus.map((menu) => {
                                    const r = rights[menu.id] || DEFAULT_RIGHT;
                                    const allOn = r.can_view && r.can_add && r.can_edit && r.can_delete;
                                    return (
                                      <div
                                        key={menu.id}
                                        className="flex flex-wrap items-center justify-between gap-3 pl-16 pr-5 py-3 border-l-2 border-gray-200 dark:border-gray-600 ml-2 hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
                                      >
                                        <div className="flex items-center gap-3 min-w-0">
                                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {menu.menu_name}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => setAllForMenu(menu.id, !allOn)}
                                            className={`text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap ${
                                              allOn
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200'
                                                : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                            }`}
                                          >
                                            {allOn ? 'Allowed' : 'Denied'}
                                          </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="sr-only">View</span>
                                          <RightToggle menuId={menu.id} type="can_view" icon={Eye} label="View" />
                                          <span className="sr-only">Add</span>
                                          <RightToggle menuId={menu.id} type="can_add" icon={Plus} label="Add" />
                                          <span className="sr-only">Edit</span>
                                          <RightToggle menuId={menu.id} type="can_edit" icon={Edit} label="Edit" />
                                          <span className="sr-only">Delete</span>
                                          <RightToggle menuId={menu.id} type="can_delete" icon={Trash2} label="Delete" />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {menusArray.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <Link href="/system/users" className="btn btn-secondary">
                  Cancel
                </Link>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {saving ? 'Saving…' : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Rights
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </App>
  );
}
