import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Filter,
  Download,
  RefreshCcw,
  Settings,
  ChevronDown,
  ArrowUpDown,
  FileText,
  Calendar,
  Columns,
  Copy,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Database,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase
} from 'lucide-react';

import App from "../../App.jsx";
import { router, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

// SweetAlert-like component
const CustomAlert = {
  fire: ({ title, text, icon, showCancelButton = false, confirmButtonText = 'OK', cancelButtonText = 'Cancel', onConfirm, onCancel }) => {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;

    const iconHtml = {
      success: '<div style="color: #10B981; font-size: 48px;">✓</div>',
      error: '<div style="color: #EF4444; font-size: 48px;">✗</div>',
      warning: '<div style="color: #F59E0B; font-size: 48px;">⚠</div>',
      question: '<div style="color: #3B82F6; font-size: 48px;">?</div>',
    }[icon] || '';

    alertDiv.innerHTML = `
      <div style="
        background: white;
        border-radius: 12px;
        padding: 32px;
        text-align: center;
        min-width: 400px;
        max-width: 500px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        animation: slideIn 0.3s ease-out;
      ">
        ${iconHtml}
        <h3 style="margin: 20px 0 12px; font-size: 20px; font-weight: 600; color: #1F2937;">${title}</h3>
        <p style="margin: 0 0 24px; color: #6B7280; line-height: 1.5;">${text}</p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          ${showCancelButton ? `
            <button id="cancelBtn" style="
              background: #F3F4F6;
              color: #374151;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            ">${cancelButtonText}</button>
          ` : ''}
          <button id="confirmBtn" style="
            background: ${icon === 'error' || icon === 'warning' ? '#EF4444' : '#3B82F6'};
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          ">${confirmButtonText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(alertDiv);

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { opacity: 0; transform: scale(0.9) translateY(-20px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
    `;
    document.head.appendChild(style);

    const confirmBtn = alertDiv.querySelector('#confirmBtn');
    const cancelBtn = alertDiv.querySelector('#cancelBtn');

    confirmBtn.addEventListener('click', () => {
      document.body.removeChild(alertDiv);
      document.head.removeChild(style);
      if (onConfirm) onConfirm();
    });

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        document.body.removeChild(alertDiv);
        document.head.removeChild(style);
        if (onCancel) onCancel();
      });
    }
  }
};

export default function List() {
  const {
    configurations: paginatedConfigurations,
    filters,
    flash,
    warning,
    configTypes = {},
    pageTitle,
  } = usePage().props;
  const { t, locale } = useTranslations();
  const tl = (key, rep = {}) => t(`accounts.account_configuration.list.${key}`, rep);
  const td = (key, rep = {}) => t(`common.data_table.${key}`, rep);
  const tf = (key, rep = {}) => t(`common.flash.${key}`, rep);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
  const [configTypeFilter, setConfigTypeFilter] = useState(filters?.config_type || 'all');
  const [sortConfig, setSortConfig] = useState({
    key: filters?.sort_by || 'id',
    direction: filters?.sort_direction || 'desc'
  });
  const [currentPage, setCurrentPage] = useState(paginatedConfigurations?.current_page || 1);
  const [pageSize, setPageSize] = useState(filters?.per_page || 25);
  const [selectedConfigurations, setSelectedConfigurations] = useState([]);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    configurationInfo: true,
    status: true,
    updatedAt: true,
    actions: true
  });

  const configurations = paginatedConfigurations?.data || [];

  // Handle search and filters
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    const params = new URLSearchParams(window.location.search);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.get(window.location.pathname + '?' + params.toString(), {}, {
      preserveState: true,
      preserveScroll: true
    });
  }, []);

  const handleStatusFilter = useCallback((status) => {
    setStatusFilter(status);
    const params = new URLSearchParams(window.location.search);
    if (status && status !== 'all') {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    router.get(window.location.pathname + '?' + params.toString(), {}, {
      preserveState: true,
      preserveScroll: true
    });
  }, []);

  const handleConfigTypeFilter = useCallback((type) => {
    setConfigTypeFilter(type);
    const params = new URLSearchParams(window.location.search);
    if (type && type !== 'all') {
      params.set('config_type', type);
    } else {
      params.delete('config_type');
    }
    params.set('page', '1');
    router.get(window.location.pathname + '?' + params.toString(), {}, {
      preserveState: true,
      preserveScroll: true
    });
  }, []);

  const handleSort = useCallback((key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });

    const params = new URLSearchParams(window.location.search);
    params.set('sort_by', key);
    params.set('sort_direction', direction);
    params.set('page', '1');

    router.get(window.location.pathname + '?' + params.toString(), {}, {
      preserveState: true,
      preserveScroll: true
    });
  }, [sortConfig]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    const params = new URLSearchParams(window.location.search);
    params.set('page', page);
    router.get(window.location.pathname + '?' + params.toString(), {}, {
      preserveState: true,
      preserveScroll: true
    });
  }, []);

  const handlePageSizeChange = useCallback((size) => {
    setPageSize(size);
    const params = new URLSearchParams(window.location.search);
    params.set('per_page', size);
    params.set('page', '1');
    router.get(window.location.pathname + '?' + params.toString(), {}, {
      preserveState: true,
      preserveScroll: true
    });
  }, []);

  // Configuration actions
  const handleEdit = (config) => {
    router.get(`/accounts/account-configuration/${config.id}/edit`);
  };
  
  const handleDelete = (config) => {
    CustomAlert.fire({
      title: td('confirm_delete_title'),
      text: td('confirm_delete_text', { name: config.account_name }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: td('confirm_delete_ok'),
      cancelButtonText: t('common.actions.cancel'),
      onConfirm: () => {
        setLoading(true);
        router.delete(`/api/account-configuration/${config.id}`, {
          onSuccess: () => {
            CustomAlert.fire({
              title: tf('deleted_title'),
              text: tl('msg_deleted', { name: config.account_name }),
              icon: 'success',
              confirmButtonText: tf('ok'),
            });
          },
          onError: () => {
            CustomAlert.fire({
              title: tf('error_title'),
              text: tl('msg_delete_failed'),
              icon: 'error',
              confirmButtonText: tf('ok'),
            });
          },
          onFinish: () => setLoading(false)
        });
      }
    });
  };

  const handleView = (config) => {
    router.get(`/accounts/account-configuration/${config.id}/show`);
  };

  // Bulk actions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedConfigurations(configurations.map(config => config.id));
    } else {
      setSelectedConfigurations([]);
    }
  };

  const handleSelectConfiguration = (configId, checked) => {
    if (checked) {
      setSelectedConfigurations(prev => [...prev, configId]);
    } else {
      setSelectedConfigurations(prev => prev.filter(id => id !== configId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedConfigurations.length === 0) return;
    const bulkCount = selectedConfigurations.length;
    const ids = [...selectedConfigurations];

    CustomAlert.fire({
      title: td('bulk_delete_title'),
      text: td('bulk_delete_text', { count: bulkCount }),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: td('bulk_delete_ok'),
      cancelButtonText: t('common.actions.cancel'),
      onConfirm: () => {
        setLoading(true);
        router.post('/accounts/account-configuration/bulk-destroy', {
          ids
        }, {
          onSuccess: () => {
            setSelectedConfigurations([]);
            CustomAlert.fire({
              title: tf('deleted_title'),
              text: tl('msg_bulk_deleted', { count: bulkCount }),
              icon: 'success',
              confirmButtonText: tf('ok'),
            });
          },
          onError: () => {
            CustomAlert.fire({
              title: tf('error_title'),
              text: tl('msg_bulk_delete_failed'),
              icon: 'error',
              confirmButtonText: tf('ok'),
            });
          },
          onFinish: () => setLoading(false)
        });
      }
    });
  };

  const handleBulkStatusChange = (newStatus) => {
    if (selectedConfigurations.length === 0) return;
    const bulkCount = selectedConfigurations.length;
    const ids = [...selectedConfigurations];

    const dialog = newStatus
      ? {
          title: td('bulk_status_activate_title'),
          text: td('bulk_status_activate_text', { count: bulkCount }),
          confirmButtonText: td('bulk_status_activate_ok'),
        }
      : {
          title: td('bulk_status_deactivate_title'),
          text: td('bulk_status_deactivate_text', { count: bulkCount }),
          confirmButtonText: td('bulk_status_deactivate_ok'),
        };

    CustomAlert.fire({
      title: dialog.title,
      text: dialog.text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: dialog.confirmButtonText,
      cancelButtonText: t('common.actions.cancel'),
      onConfirm: () => {
        setLoading(true);
        router.post('/accounts/account-configuration/bulk-status', {
          ids,
          status: newStatus
        }, {
          onSuccess: () => {
            setSelectedConfigurations([]);
            CustomAlert.fire({
              title: tf('updated_title'),
              text: newStatus
                ? tl('msg_bulk_activated', { count: bulkCount })
                : tl('msg_bulk_deactivated', { count: bulkCount }),
              icon: 'success',
              confirmButtonText: tf('ok'),
            });
          },
          onError: () => {
            CustomAlert.fire({
              title: tf('error_title'),
              text: tl('msg_bulk_update_failed'),
              icon: 'error',
              confirmButtonText: tf('ok'),
            });
          },
          onFinish: () => setLoading(false)
        });
      }
    });
  };

  const formatDate = (dateString) => {
    const loc = locale === 'ur' ? 'ur-PK' : undefined;
    return new Date(dateString).toLocaleDateString(loc, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: tl('all_status') },
      { value: '1', label: t('common.status.active') },
      { value: '0', label: t('common.status.inactive') }
    ],
    [t]
  );

  const configTypeOptions = useMemo(
    () => [
      { value: 'all', label: tl('all_types') },
      ...Object.entries(configTypes).map(([key, label]) => ({ value: key, label }))
    ],
    [t, configTypes]
  );

  const pageSizeOptions = [10, 25, 50, 100];

  useEffect(() => {
    if (flash?.success) {
      CustomAlert.fire({
        title: tf('success_title'),
        text: flash.success,
        icon: 'success',
        confirmButtonText: tf('great'),
      });
    } else if (flash?.error) {
      CustomAlert.fire({
        title: tf('error_title'),
        text: flash.error,
        icon: 'error',
        confirmButtonText: tf('ok'),
      });
    } else if (warning) {
      CustomAlert.fire({
        title: tf('warning_title'),
        text: warning,
        icon: 'warning',
        confirmButtonText: tf('ok'),
      });
    }
  }, [flash, warning, t]);

  return (
    <App>
      <div className="advanced-module-manager form-theme-system">
        {/* Enhanced Header */}
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title">
                <Briefcase className="title-icon" />
                {pageTitle || tl('page_title')}
              </h1>
              <div className="stats-summary">
                <div className="stat-item">
                  <TrendingUp size={16} />
                  <span>{td('stat_total', { count: paginatedConfigurations?.total || configurations?.length || 0 })}</span>
                </div>
                <div className="stat-item">
                  <Users size={16} />
                  <span>{td('stat_active', { count: configurations?.filter(c => c.is_active).length || 0 })}</span>
                </div>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="btn btn-icon"
                onClick={() => window.location.reload()}
                title={t('accounts.account_configuration.list.refresh')}
                disabled={loading}
              >
                <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
              </button>

              <a href='/accounts/account-configuration/create' className="btn btn-primary">
                <Plus size={20} />
                {tl('add_configuration')}
              </a>
            </div>
          </div>
        </div>

        {/* Modern Compact Filters */}
        <div className="modern-filters-container">
          <div className="filters-toolbar">
            <div className="search-section">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('accounts.account_configuration.list.search_by_account_code_name')}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">{t('accounts.account_configuration.list.status')}</label>
                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">{t('accounts.account_configuration.list.type')}</label>
                <select
                  className="filter-select"
                  value={configTypeFilter}
                  onChange={(e) => handleConfigTypeFilter(e.target.value)}
                >
                  {configTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="reset-btn"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setConfigTypeFilter('all');
                  const params = new URLSearchParams();
                  params.set('page', '1');
                  router.get(window.location.pathname + '?' + params.toString(), {}, { preserveState: true, preserveScroll: true });
                }}
                title={t('accounts.account_configuration.list.reset_all_filters')}
              >
                <RefreshCcw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedConfigurations.length > 0 && (
          <div className="bulk-actions-bar">
            <div className="selection-info">
              <span>{tl('bulk_selected', { count: selectedConfigurations.length })}</span>
            </div>
            <div className="bulk-actions">
              <button
                type="button"
                className="btn btn-sm bulk-status-activate"
                onClick={() => handleBulkStatusChange(true)}
              >
                <CheckCircle2 size={16} />
                {tl('activate')}
              </button>
              <button
                type="button"
                className="btn btn-sm bulk-status-deactivate"
                onClick={() => handleBulkStatusChange(false)}
              >
                <XCircle size={16} />
                {tl('deactivate')}
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={handleBulkDelete}
              >
                <Trash2 size={16} />
                {tl('delete')}
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="main-content">
          {/* Data Table */}
          <div className="data-table-container">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>{t('accounts.account_configuration.list.loading_configurations')}</p>
              </div>
            ) : !configurations?.length ? (
              <div className="empty-state">
                <Database className="empty-icon" />
                <h3>{t('accounts.account_configuration.list.no_configurations_found')}</h3>
                <p>{t('accounts.account_configuration.list.try_adjusting_your_filters_or_search_cri')}</p>
                <a href="/accounts/account-configuration/create" className="btn btn-primary">
                  <Plus size={20} />
                  {tl('add_first_configuration')}
                </a>
              </div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="checkbox-cell">
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={selectedConfigurations.length === configurations.length && configurations.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedConfigurations(configurations.map(config => config.id));
                              } else {
                                setSelectedConfigurations([]);
                              }
                            }}
                          />
                        </th>

                        {visibleColumns.id && (
                          <th className="sortable" onClick={() => handleSort('id')}>
                            <div className="th-content">
                              {tl('col_id')}
                              <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'id' ? 'active' : ''}`} />
                            </div>
                          </th>
                        )}

                        {visibleColumns.configurationInfo && (
                          <th className="sortable" onClick={() => handleSort('account_code')}>
                            <div className="th-content">
                              {tl('col_configuration_info')}
                              <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'account_code' ? 'active' : ''}`} />
                            </div>
                          </th>
                        )}

                        {visibleColumns.status && (
                          <th className="sortable" onClick={() => handleSort('is_active')}>
                            <div className="th-content">
                              {tl('col_status')}
                              <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'is_active' ? 'active' : ''}`} />
                            </div>
                          </th>
                        )}

                        {visibleColumns.updatedAt && (
                          <th className="sortable" onClick={() => handleSort('updated_at')}>
                            <div className="th-content">
                              {tl('col_updated')}
                              <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'updated_at' ? 'active' : ''}`} />
                            </div>
                          </th>
                        )}

                        {visibleColumns.actions && (
                          <th className="actions-header">{t('accounts.account_configuration.list.actions')}</th>
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {configurations.map((config) => (
                        <tr key={config.id} className="table-row">
                          <td>
                            <input
                              type="checkbox"
                              className="checkbox"
                              checked={selectedConfigurations.includes(config.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedConfigurations(prev => [...prev, config.id]);
                                } else {
                                  setSelectedConfigurations(prev => prev.filter(id => id !== config.id));
                                }
                              }}
                            />
                          </td>

                          {visibleColumns.id && (
                            <td>
                              <span className="module-id">#{config.id}</span>
                            </td>
                          )}

                          {visibleColumns.configurationInfo && (
                            <td>
                              <div className="module-info">
                                <div className="module-avatar module-avatar-icon-wrap">
                                  <Briefcase size={24} strokeWidth={2} aria-hidden />
                                </div>
                                <div className="module-details">
                                  <div className="module-name">{config.account_code} - {config.account_name}</div>
                                  <div className="module-folder">
                                    {tl('row_type', { type: configTypes?.[config.config_type] || config.config_type })}
                                  </div>
                                  <div className="module-description">{tl('row_level', { level: config.account_level })}</div>
                                </div>
                              </div>
                            </td>
                          )}

                          {visibleColumns.status && (
                            <td>
                              <div className="status-container">
                                <span className={`status-badge status-${config.is_active ? 'active' : 'inactive'}`}>
                                  <span
                                    className={`status-dot ${config.is_active ? 'active' : 'inactive'}`}
                                    aria-hidden
                                  />
                                  {config.is_active ? t('common.status.active') : t('common.status.inactive')}
                                </span>
                              </div>
                            </td>
                          )}

                          {visibleColumns.updatedAt && (
                            <td>
                              <div className="date-cell">
                                <Clock size={14} />
                                <span>{formatDate(config.updated_at)}</span>
                              </div>
                            </td>
                          )}

                          {visibleColumns.actions && (
                            <td>
                              <div className="actions-cell">
                                <button
                                  className="action-btn view"
                                  title={t('accounts.account_configuration.list.view_details')}
                                  onClick={() => handleView(config)}
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  className="action-btn edit"
                                  title={t('accounts.account_configuration.list.edit_configuration')}
                                  onClick={() => handleEdit(config)}
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  className="action-btn delete"
                                  title={t('accounts.account_configuration.list.delete_configuration')}
                                  onClick={() => handleDelete(config)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {paginatedConfigurations && (
                  <div className="pagination-container">
                    <div className="pagination-info">
                      <div className="results-info">
                        {td('showing_entries', {
                          from: ((paginatedConfigurations.current_page - 1) * paginatedConfigurations.per_page) + 1,
                          to: Math.min(paginatedConfigurations.current_page * paginatedConfigurations.per_page, paginatedConfigurations.total),
                          total: paginatedConfigurations.total,
                        })}
                      </div>
                      <div className="page-size-selector">
                        <span>{t('accounts.account_configuration.list.show')}</span>
                        <select
                          className="page-size-select"
                          value={pageSize}
                          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        >
                          {pageSizeOptions.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <span>{t('accounts.account_configuration.list.per_page')}</span>
                      </div>
                    </div>

                    <div className="pagination-controls">
                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <div className="page-numbers">
                        {Array.from({ length: Math.min(5, paginatedConfigurations.last_page) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= paginatedConfigurations.last_page}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </App>
  );
}
