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
  Hash
} from 'lucide-react';

import App from "../../App.jsx";
import { router, usePage } from '@inertiajs/react';

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
  const { configurations: paginatedConfigurations, filters, flash, warning } = usePage().props;

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
  const [sortConfig, setSortConfig] = useState({
    key: filters?.sort_by || 'id',
    direction: filters?.sort_direction || 'desc'
  });
  const [currentPage, setCurrentPage] = useState(paginatedConfigurations?.current_page || 1);
  const [pageSize, setPageSize] = useState(filters?.per_page || 25);
  const [selectedConfigurations, setSelectedConfigurations] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    configurationInfo: true,
    status: true,
    lastActivity: true,
    createdAt: false,
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
    router.get(`/accounts/voucher-number-configuration/${config.id}/edit`);
  };
  
  const handleDelete = (config) => {
    CustomAlert.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${config.voucher_type} Voucher" configuration. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      onConfirm: () => {
        setLoading(true);
        router.delete(`/api/voucher-number-configuration/${config.id}`, {
          onSuccess: () => {
            CustomAlert.fire({
              title: 'Deleted!',
              text: `Configuration "${config.voucher_type} Voucher" has been deleted.`,
              icon: 'success'
            });
          },
          onError: () => {
            CustomAlert.fire({
              title: 'Error!',
              text: 'Failed to delete the configuration. Please try again.',
              icon: 'error'
            });
          },
          onFinish: () => setLoading(false)
        });
      }
    });
  };

  const handleView = (config) => {
    router.get(`/accounts/voucher-number-configuration/${config.id}/show`);
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

    CustomAlert.fire({
      title: 'Delete Selected Configurations?',
      text: `You are about to delete ${selectedConfigurations.length} configuration(s). This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: 'Cancel',
      onConfirm: () => {
        setLoading(true);
        router.post('/accounts/voucher-number-configuration/bulk-destroy', {
          ids: selectedConfigurations
        }, {
          onSuccess: (page) => {
            setSelectedConfigurations([]);
            CustomAlert.fire({
              title: 'Deleted!',
              text: `${selectedConfigurations.length} configuration(s) have been deleted.`,
              icon: 'success'
            });
          },
          onError: (errors) => {
            CustomAlert.fire({
              title: 'Error!',
              text: 'Failed to delete configurations. Please try again.',
              icon: 'error'
            });
          },
          onFinish: () => setLoading(false)
        });
      }
    });
  };

  const handleBulkStatusChange = (newStatus) => {
    if (selectedConfigurations.length === 0) return;

    const action = newStatus ? 'activate' : 'deactivate';
    CustomAlert.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Selected Configurations?`,
      text: `You are about to ${action} ${selectedConfigurations.length} configuration(s).`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action} them!`,
      cancelButtonText: 'Cancel',
      onConfirm: () => {
        setLoading(true);
        router.post('/accounts/voucher-number-configuration/bulk-status', {
          ids: selectedConfigurations,
          status: newStatus
        }, {
          onSuccess: (page) => {
            setSelectedConfigurations([]);
            CustomAlert.fire({
              title: 'Updated!',
              text: `${selectedConfigurations.length} configuration(s) have been ${action}d.`,
              icon: 'success'
            });
          },
          onError: (errors) => {
            CustomAlert.fire({
              title: 'Error!',
              text: 'Failed to update configurations. Please try again.',
              icon: 'error'
            });
          },
          onFinish: () => setLoading(false)
        });
      }
    });
  };

  // Export functions
  const exportToCSV = () => {
    CustomAlert.fire({
      title: 'Export to CSV',
      text: 'Download all configurations as CSV file?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, download!',
      cancelButtonText: 'Cancel',
      onConfirm: () => {
        // Open the export URL in a new window
        window.open('/api/voucher-number-configuration/export-csv', '_blank');
      }
    });
  };

  // Format functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    return status ? '#10B981' : '#EF4444';
  };

  const getStatusLabel = (status) => {
    return status ? 'Active' : 'Inactive';
  };

  // Status options for filtering
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: '1', label: 'Active' },
    { value: '0', label: 'Inactive' }
  ];

  const pageSizeOptions = [10, 25, 50, 100];

  // Show flash messages
  useEffect(() => {
    if (flash?.success) {
      CustomAlert.fire({
        title: 'Success!',
        text: flash.success,
        icon: 'success',
        confirmButtonText: 'Great!'
      });
    } else if (flash?.error) {
      CustomAlert.fire({
        title: 'Error!',
        text: flash.error,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } else if (warning) {
      CustomAlert.fire({
        title: 'Warning!',
        text: warning,
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  }, [flash, warning]);

  return (
    <App>
      <div className="advanced-module-manager">
        {/* Enhanced Header */}
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title">
                <Database className="title-icon" />
                {usePage().props?.pageTitle || 'Voucher Number Configuration'}
              </h1>
              <div className="stats-summary">
                <div className="stat-item">
                  <TrendingUp size={16} />
                  <span>{paginatedConfigurations?.total || configurations?.length || 0} Total</span>
                </div>
                <div className="stat-item">
                  <Users size={16} />
                  <span>{configurations?.filter(c => c.is_active).length || 0} Active</span>
                </div>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="btn btn-icon"
                onClick={() => window.location.reload()}
                title="Refresh"
                disabled={loading}
              >
                <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
              </button>

              {/* Export Dropdown */}
              <div className="dropdown">
                <button className="btn btn-secondary dropdown-toggle">
                  <Download size={20} />
                  Export
                  <ChevronDown size={16} />
                </button>
                <div className="dropdown-menu">
                  <button onClick={exportToCSV}>
                    <FileText size={16} />
                    Export as CSV
                  </button>
                </div>
              </div>

              <a href='/accounts/voucher-number-configuration/create' className="btn btn-primary">
                <Plus size={20} />
                Add Configuration
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
                  placeholder="Search configurations..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">Status</label>
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

              <button
                className="reset-btn"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  const params = new URLSearchParams();
                  params.set('page', '1');
                  router.get(window.location.pathname + '?' + params.toString(), {}, { preserveState: true, preserveScroll: true });
                }}
                title="Reset all filters"
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
              <span>{selectedConfigurations.length} configuration(s) selected</span>
            </div>
            <div className="bulk-actions">
              <button
                className="btn btn-sm"
                onClick={() => handleBulkStatusChange(true)}
                style={{ background: '#10B981', color: 'white' }}
              >
                <CheckCircle2 size={16} />
                Activate
              </button>
              <button
                className="btn btn-sm"
                onClick={() => handleBulkStatusChange(false)}
                style={{ background: '#F59E0B', color: 'white' }}
              >
                <XCircle size={16} />
                Deactivate
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={handleBulkDelete}
              >
                <Trash2 size={16} />
                Delete
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
                <p>Loading configurations...</p>
              </div>
            ) : !configurations?.length ? (
              <div className="empty-state">
                <Database className="empty-icon" />
                <h3>No configurations found</h3>
                <p>Try adjusting your filters or search criteria</p>
                <a href="/accounts/voucher-number-configuration/create" className="btn btn-primary">
                  <Plus size={20} />
                  Add Your First Configuration
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
                              ID
                              <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'id' ? 'active' : ''}`} />
                            </div>
                          </th>
                        )}

                        {visibleColumns.configurationInfo && (
                          <th className="sortable" onClick={() => handleSort('voucher_type')}>
                            <div className="th-content">
                              Configuration Info
                              <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'voucher_type' ? 'active' : ''}`} />
                            </div>
                          </th>
                        )}

                        {visibleColumns.status && (
                          <th className="sortable" onClick={() => handleSort('is_active')}>
                            <div className="th-content">
                              Status
                              <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'is_active' ? 'active' : ''}`} />
                            </div>
                          </th>
                        )}

                        {visibleColumns.updatedAt && (
                          <th className="sortable" onClick={() => handleSort('updated_at')}>
                            <div className="th-content">
                              Updated
                              <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'updated_at' ? 'active' : ''}`} />
                            </div>
                          </th>
                        )}

                        {visibleColumns.actions && (
                          <th className="actions-header">Actions</th>
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
                                <div className="module-avatar">
                                  <Hash className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="module-details">
                                  <div className="module-name">{config.voucher_type} Voucher</div>
                                  <div className="module-folder">Prefix: {config.prefix} | Length: {config.number_length}</div>
                                  <div className="module-description">Reset: {config.reset_frequency}</div>
                                </div>
                              </div>
                            </td>
                          )}

                          {visibleColumns.status && (
                            <td>
                              <div className="status-container">
                                <span
                                  className={`status-badge status-${config.is_active ? 'active' : 'inactive'}`}
                                  style={{
                                    backgroundColor: `${config.is_active ? '#10B981' : '#EF4444'}15`,
                                    color: config.is_active ? '#10B981' : '#EF4444'
                                  }}
                                >
                                  <div
                                    className="status-dot"
                                    style={{ backgroundColor: config.is_active ? '#10B981' : '#EF4444' }}
                                  ></div>
                                  {config.is_active ? 'Active' : 'Inactive'}
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
                                  title="View Details"
                                  onClick={() => handleView(config)}
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  className="action-btn edit"
                                  title="Edit Configuration"
                                  onClick={() => handleEdit(config)}
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  className="action-btn delete"
                                  title="Delete Configuration"
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
                        Showing {((paginatedConfigurations.current_page - 1) * paginatedConfigurations.per_page) + 1} to {Math.min(paginatedConfigurations.current_page * paginatedConfigurations.per_page, paginatedConfigurations.total)} of {paginatedConfigurations.total} results
                      </div>
                      <div className="page-size-selector">
                        <span>Show</span>
                        <select
                          className="page-size-select"
                          value={pageSize}
                          onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        >
                          {pageSizeOptions.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <span>per page</span>
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
