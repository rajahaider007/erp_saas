import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Filter,
  Download,
  Upload,
  RefreshCcw,
  Settings,
  MoreVertical,
  ChevronDown,
  ArrowUpDown,
  FileText,
  FileSpreadsheet,
  Calendar,
  Columns,
  SlidersHorizontal,
  Copy,
  Archive,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Bookmark,
  Star,
  BarChart3,
  Database,
  Zap,
  Activity,
  Users,
  DollarSign,
  PieChart,
  Target,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Globe,
  Shield
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
  const { modules: paginatedModules, filters, flash } = usePage().props;

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
  const [sortConfig, setSortConfig] = useState({
    key: filters?.sort_by || 'id',
    direction: filters?.sort_direction || 'desc'
  });
  const [currentPage, setCurrentPage] = useState(paginatedModules?.current_page || 1);
  const [pageSize, setPageSize] = useState(filters?.per_page || 25);
  const [selectedModules, setSelectedModules] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    moduleInfo: true,
    status: true,
    lastActivity: true,
    createdAt: false,
    updatedAt: true,
    actions: true
  });

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
    }
  }, [flash]);

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
  // Module actions - FIXED VERSIONS
  const handleEdit = (module) => {
    router.get(`/system/AddModules/${module.id}/edit`);
  };
  
const handleDelete = (module) => {
  CustomAlert.fire({
    title: 'Are you sure?',
    text: `You are about to delete "${module.module_name}". This action cannot be undone!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    onConfirm: () => {
      setLoading(true);
      router.delete(`/modules/${module.id}`, {
        onSuccess: () => {
          CustomAlert.fire({
            title: 'Deleted!',
            text: `Module "${module.module_name}" has been deleted.`,
            icon: 'success'
          });
        },
        onError: () => {
          CustomAlert.fire({
            title: 'Error!',
            text: 'Failed to delete the module. Please try again.',
            icon: 'error'
          });
        },
        onFinish: () => setLoading(false)
      });
    }
  });
};

const handleView = (module) => {
  router.get(`/system/AddModules/${module.id}`);
};

const handleDuplicate = (module) => {
  CustomAlert.fire({
    title: 'Duplicate Module',
    text: `Create a copy of "${module.module_name}"?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, duplicate it!',
    cancelButtonText: 'Cancel',
    onConfirm: () => {
      router.get('/system/AddModules/add', {
        duplicate: module.id
      });
    }
  });
};
  // Bulk actions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedModules(paginatedModules.data.map(module => module.id));
    } else {
      setSelectedModules([]);
    }
  };

  const handleSelectModule = (moduleId, checked) => {
    if (checked) {
      setSelectedModules(prev => [...prev, moduleId]);
    } else {
      setSelectedModules(prev => prev.filter(id => id !== moduleId));
    }
  };

// Bulk actions - FIXED VERSIONS
const handleBulkDelete = () => {
  if (selectedModules.length === 0) return;

  CustomAlert.fire({
    title: 'Delete Selected Modules?',
    text: `You are about to delete ${selectedModules.length} module(s). This action cannot be undone!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete them!',
    cancelButtonText: 'Cancel',
    onConfirm: () => {
      setLoading(true);
      router.post('/modules/bulk-destroy', {
        ids: selectedModules
      }, {
        onSuccess: (page) => {
          setSelectedModules([]);
          CustomAlert.fire({
            title: 'Deleted!',
            text: `${selectedModules.length} module(s) have been deleted.`,
            icon: 'success'
          });
        },
        onError: (errors) => {
          CustomAlert.fire({
            title: 'Error!',
            text: 'Failed to delete modules. Please try again.',
            icon: 'error'
          });
        },
        onFinish: () => setLoading(false)
      });
    }
  });
};


const handleBulkStatusChange = (newStatus) => {
  if (selectedModules.length === 0) return;

  const action = newStatus ? 'activate' : 'deactivate';
  CustomAlert.fire({
    title: `${action.charAt(0).toUpperCase() + action.slice(1)} Selected Modules?`,
    text: `You are about to ${action} ${selectedModules.length} module(s).`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: `Yes, ${action} them!`,
    cancelButtonText: 'Cancel',
    onConfirm: () => {
      setLoading(true);
      router.post('/modules/bulk-status', {
        ids: selectedModules,
        status: newStatus
      }, {
        onSuccess: (page) => {
          setSelectedModules([]);
          CustomAlert.fire({
            title: 'Updated!',
            text: `${selectedModules.length} module(s) have been ${action}d.`,
            icon: 'success'
          });
        },
        onError: (errors) => {
          CustomAlert.fire({
            title: 'Error!',
            text: 'Failed to update modules. Please try again.',
            icon: 'error'
          });
        },
        onFinish: () => setLoading(false)
      });
    }
  });
};

// Export functions - FIXED VERSION
const exportToCSV = () => {
  CustomAlert.fire({
    title: 'Export to CSV',
    text: 'Download all modules as CSV file?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, download!',
    cancelButtonText: 'Cancel',
    onConfirm: () => {
      // Open the export URL in a new window
      window.open('/modules/export-csv', '_blank');
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

  return (
    <App>
      <div className="advanced-module-manager">
        {/* Enhanced Header */}
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title">
                <Database className="title-icon" />
                {usePage().props?.pageTitle || 'Modules'}
              </h1>
              <div className="stats-summary">
                <div className="stat-item">
                  <TrendingUp size={16} />
                  <span>{paginatedModules?.total || 0} Total</span>
                </div>
                <div className="stat-item">
                  <Users size={16} />
                  <span>{paginatedModules?.data?.filter(m => m.status).length || 0} Active</span>
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

              <a href='/system/AddModules/add' className="btn btn-primary">
                <Plus size={20} />
                Add Module
              </a>
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
                    placeholder="Search modules..."
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

          {/* Column Selector */}
          {showColumnSelector && (
            <div className="column-selector">
              <div className="column-selector-content">
                <h3>Show/Hide Columns</h3>
                <div className="column-grid">
                  {Object.entries(visibleColumns).map(([key, visible]) => (
                    key !== 'actions' && (
                      <label key={key} className="column-item">
                        <input
                          type="checkbox"
                          checked={visible}
                          onChange={(e) => setVisibleColumns({
                            ...visibleColumns,
                            [key]: e.target.checked
                          })}
                        />
                        <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                      </label>
                    )
                  ))}
                </div>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setShowColumnSelector(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Bulk Actions Bar */}
          {selectedModules.length > 0 && (
            <div className="bulk-actions-bar">
              <div className="selection-info">
                <CheckCircle2 size={20} />
                <span>{selectedModules.length} module{selectedModules.length !== 1 ? 's' : ''} selected</span>
              </div>

              <div className="bulk-actions">
                <button className="btn btn-sm btn-secondary" onClick={() => setSelectedModules([])}>
                  <X size={16} />
                  Clear
                </button>

                <div className="dropdown">
                  <button className="btn btn-sm btn-secondary dropdown-toggle">
                    <Settings size={16} />
                    Change Status
                    <ChevronDown size={12} />
                  </button>
                  <div className="dropdown-menu">
                    <button onClick={() => handleBulkStatusChange(true)}>Set Active</button>
                    <button onClick={() => handleBulkStatusChange(false)}>Set Inactive</button>
                  </div>
                </div>

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

          {/* Data Table */}
          <div className="data-table-container">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading forms...</p>
              </div>
            ) : !paginatedModules?.data?.length ? (
              <div className="empty-state">
                <Database className="empty-icon" />
                <h3>No modules found</h3>
                <p>Try adjusting your filters or search criteria</p>
                <a href="/system/AddModules/add" className="btn btn-primary">
                  <Plus size={20} />
                  Add Your First Module
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
                            checked={selectedModules.length === paginatedModules.data.length && paginatedModules.data.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
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

                        {visibleColumns.moduleInfo && (
                          <th className="sortable" onClick={() => handleSort('module_name')}>
                            <div className="th-content">
                              Module Info
                              <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'module_name' ? 'active' : ''}`} />
                            </div>
                          </th>
                        )}

                        {visibleColumns.status && (
                          <th className="sortable" onClick={() => handleSort('status')}>
                            <div className="th-content">
                              Status
                              <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'status' ? 'active' : ''}`} />
                            </div>
                          </th>
                        )}

                        {visibleColumns.createdAt && (
                          <th className="sortable" onClick={() => handleSort('created_at')}>
                            <div className="th-content">
                              Created
                              <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'created_at' ? 'active' : ''}`} />
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
                      {paginatedModules.data.map((module) => (
                        <tr key={module.id} className="table-row">
                          <td>
                            <input
                              type="checkbox"
                              className="checkbox"
                              checked={selectedModules.includes(module.id)}
                              onChange={(e) => handleSelectModule(module.id, e.target.checked)}
                            />
                          </td>

                          {visibleColumns.id && (
                            <td>
                              <span className="module-id">#{module.id}</span>
                            </td>
                          )}

                          {visibleColumns.moduleInfo && (
                            <td>
                              <div className="module-info">
                                <div className="module-avatar">
                                  <img src={module.image_url} alt={module.module_name} />
                                </div>
                                <div className="module-details">
                                  <div className="module-name">{module.module_name}</div>
                                  <div className="module-folder">{module.folder_name}</div>
                                  {module.description && (
                                    <div className="module-description">{module.description}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                          )}

                          {visibleColumns.status && (
                            <td>
                              <div className="status-container">
                                <span
                                  className={`status-badge status-${module.status ? 'active' : 'inactive'}`}
                                  style={{
                                    backgroundColor: `${getStatusColor(module.status)}15`,
                                    color: getStatusColor(module.status)
                                  }}
                                >
                                  <div
                                    className="status-dot"
                                    style={{ backgroundColor: getStatusColor(module.status) }}
                                  ></div>
                                  {getStatusLabel(module.status)}
                                </span>
                              </div>
                            </td>
                          )}

                          {visibleColumns.createdAt && (
                            <td>
                              <div className="date-cell">
                                <Clock size={14} />
                                <span>{formatDate(module.created_at)}</span>
                              </div>
                            </td>
                          )}

                          {visibleColumns.updatedAt && (
                            <td>
                              <div className="date-cell">
                                <Clock size={14} />
                                <span>{formatDate(module.updated_at)}</span>
                              </div>
                            </td>
                          )}

                          {visibleColumns.actions && (
                            <td>
                              <div className="actions-cell">
                                <button
                                  className="action-btn view"
                                  title="View Details"
                                  onClick={() => handleView(module)}
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  className="action-btn edit"
                                  title="Edit Module"
                                  onClick={() => handleEdit(module)}
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  className="action-btn copy"
                                  title="Duplicate"
                                  onClick={() => handleDuplicate(module)}
                                >
                                  <Copy size={16} />
                                </button>
                                <button
                                  className="action-btn delete"
                                  title="Delete Module"
                                  onClick={() => handleDelete(module)}
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

                {/* Enhanced Pagination */}
                <div className="pagination-container">
                  <div className="pagination-info">
                    <div className="results-info">
                      Showing {paginatedModules.from || 0} to {paginatedModules.to || 0} of {paginatedModules.total || 0} entries
                    </div>

                    <div className="page-size-selector">
                      <span>Show:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className="page-size-select"
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
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(1)}
                      title="First Page"
                    >
                      <ChevronLeft size={14} />
                      <ChevronLeft size={14} />
                    </button>

                    <button
                      className="pagination-btn"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      title="Previous Page"
                    >
                      <ChevronLeft size={14} />
                    </button>

                    {/* Page Numbers */}
                    <div className="page-numbers">
                      {Array.from({ length: Math.min(7, paginatedModules.last_page || 1) }, (_, index) => {
                        let pageNumber;
                        const totalPages = paginatedModules.last_page || 1;

                        if (totalPages <= 7) {
                          pageNumber = index + 1;
                        } else if (currentPage <= 4) {
                          pageNumber = index + 1;
                        } else if (currentPage > totalPages - 4) {
                          pageNumber = totalPages - 6 + index;
                        } else {
                          pageNumber = currentPage - 3 + index;
                        }

                        return (
                          <button
                            key={pageNumber}
                            className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      className="pagination-btn"
                      disabled={currentPage === (paginatedModules.last_page || 1)}
                      onClick={() => handlePageChange(currentPage + 1)}
                      title="Next Page"
                    >
                      <ChevronRight size={14} />
                    </button>

                    <button
                      className="pagination-btn"
                      disabled={currentPage === (paginatedModules.last_page || 1)}
                      onClick={() => handlePageChange(paginatedModules.last_page || 1)}
                      title="Last Page"
                    >
                      <ChevronRight size={14} />
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="quick-jump">
                    <span>Go to:</span>
                    <input
                      type="number"
                      min="1"
                      max={paginatedModules.last_page || 1}
                      value={currentPage}
                      onChange={(e) => {
                        const page = Math.max(1, Math.min(paginatedModules.last_page || 1, Number(e.target.value)));
                        handlePageChange(page);
                      }}
                      className="jump-input"
                    />
                    <span>of {paginatedModules.last_page || 1}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </App>
  );
}