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
  const { configurations: paginatedConfigurations, filters, flash, warning, configTypes = {} } = usePage().props;
  const { t } = useTranslations();

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
      title: 'Are you sure?',
      text: `You are about to delete "${config.account_name}" configuration. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      onConfirm: () => {
        setLoading(true);
        router.delete(`/api/account-configuration/${config.id}`, {
          onSuccess: () => {
            CustomAlert.fire({
              title: 'Deleted!',
              text: `Configuration "${config.account_name}" has been deleted.`,
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

    CustomAlert.fire({
      title: 'Delete Selected Configurations?',
      text: `You are about to delete ${selectedConfigurations.length} configuration(s). This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: 'Cancel',
      onConfirm: () => {
        setLoading(true);
        router.post('/accounts/account-configuration/bulk-destroy', {
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
        router.post('/accounts/account-configuration/bulk-status', {
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

  // Status options for filtering
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: '1', label: 'Active' },
    { value: '0', label: 'Inactive' }
  ];

  const configTypeOptions = [
    { value: 'all', label: 'All Types' },
    ...Object.entries(configTypes).map(([key, label]) => ({ value: key, label }))
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
      <style>{`
        .advanced-module-manager {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 12px;
          min-height: calc(100vh - 200px);
        }

        .manager-header {
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 1.5rem;
        }

        .header-main {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .title-section {
          flex: 1;
        }

        .page-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 0.75rem 0;
        }

        .title-icon {
          color: #3b82f6;
        }

        .stats-summary {
          display: flex;
          gap: 1.5rem;
          margin-top: 0.75rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
          text-decoration: none;
          font-size: 0.875rem;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-secondary {
          background: #e5e7eb;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #d1d5db;
        }

        .btn-icon {
          width: 40px;
          height: 40px;
          padding: 0;
          justify-content: center;
          background: white;
          border: 1px solid #d1d5db;
        }

        .btn-icon:hover {
          background: #f3f4f6;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .dropdown {
          position: relative;
        }

        .dropdown-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .dropdown-menu {
          display: none;
          position: absolute;
          top: 100%;
          right: 0;
          mt: 0.5rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          z-index: 10;
          min-width: 200px;
        }

        .dropdown:hover .dropdown-menu {
          display: block;
        }

        .dropdown-menu button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          color: #374151;
          font-size: 0.875rem;
          transition: background 0.2s;
        }

        .dropdown-menu button:hover {
          background: #f3f4f6;
        }

        .modern-filters-container {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
        }

        .filters-toolbar {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .search-section {
          display: flex;
          gap: 0.75rem;
          flex: 1;
          min-width: 300px;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-input-wrapper {
          flex: 1;
          min-width: 250px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          color: #9ca3af;
        }

        .search-input {
          width: 100%;
          padding: 0.5rem 0.75rem 0.5rem 2.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          background: white;
          color: #111827;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-label {
          font-size: 0.875rem;
          color: #6b7280;
          white-space: nowrap;
        }

        .filter-select {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #111827;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .reset-btn {
          padding: 0.5rem;
          background: #f3f4f6;
          color: #6b7280;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-btn:hover {
          background: #e5e7eb;
        }

        .bulk-actions-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #fffbeb;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #fbbf24;
        }

        .selection-info {
          font-weight: 600;
          color: #92400e;
        }

        .bulk-actions {
          display: flex;
          gap: 0.5rem;
          margin-left: auto;
        }

        .btn-sm {
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }

        .main-content {
          display: flex;
          flex-direction: column;
        }

        .data-table-container {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: #9ca3af;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: #9ca3af;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          margin: 1rem 0 0.5rem 0;
          font-size: 1.125rem;
          color: #6b7280;
        }

        .empty-state p {
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table thead {
          background: #f3f4f6;
          border-bottom: 2px solid #e5e7eb;
        }

        .data-table th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.875rem;
          color: #374151;
          white-space: nowrap;
        }

        .th-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sortable {
          cursor: pointer;
          user-select: none;
        }

        .sortable:hover {
          background: #e5e7eb;
        }

        .sort-icon {
          opacity: 0.5;
          transition: opacity 0.2s;
        }

        .sort-icon.active {
          opacity: 1;
          color: #3b82f6;
        }

        .data-table td {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          font-size: 0.875rem;
          color: #111827;
        }

        .data-table tbody tr:hover {
          background: #f9fafb;
        }

        .checkbox-cell {
          width: 50px;
        }

        .checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .module-id {
          color: #9ca3af;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .module-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .module-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #f3f4f6;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .module-details {
          flex: 1;
          min-width: 200px;
        }

        .module-name {
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .module-folder {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .module-description {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .status-container {
          display: flex;
          align-items: center;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .date-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .actions-cell {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          padding: 0;
          border: none;
          border-radius: 6px;
          background: #f3f4f6;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: #e5e7eb;
        }

        .action-btn.view:hover {
          background: #dbeafe;
          color: #3b82f6;
        }

        .action-btn.edit:hover {
          background: #dbeafe;
          color: #3b82f6;
        }

        .action-btn.delete:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: white;
          border-top: 1px solid #e5e7eb;
        }

        .pagination-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .results-info {
          font-weight: 500;
        }

        .page-size-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .page-size-select {
          padding: 0.375rem 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          color: #111827;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .pagination-controls {
          display: flex;
          gap: 0.5rem;
        }

        .pagination-btn {
          width: 32px;
          height: 32px;
          padding: 0;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          font-weight: 500;
        }

        .pagination-btn:not(:disabled):hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .page-numbers {
          display: flex;
          gap: 0.25rem;
        }
      `}</style>

      <div className="advanced-module-manager">
        {/* Enhanced Header */}
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title">
                <Briefcase className="title-icon" />
                {usePage().props?.pageTitle || 'Account Configuration'}
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
                title={t('accounts.account_configuration.list.refresh')}
                disabled={loading}
              >
                <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
              </button>

              <a href='/accounts/account-configuration/create' className="btn btn-primary">
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
                <p>{t('accounts.account_configuration.list.loading_configurations')}</p>
              </div>
            ) : !configurations?.length ? (
              <div className="empty-state">
                <Database className="empty-icon" />
                <h3>{t('accounts.account_configuration.list.no_configurations_found')}</h3>
                <p>{t('accounts.account_configuration.list.try_adjusting_your_filters_or_search_cri')}</p>
                <a href="/accounts/account-configuration/create" className="btn btn-primary">
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
                          <th className="sortable" onClick={() => handleSort('account_code')}>
                            <div className="th-content">
                              Configuration Info
                              <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'account_code' ? 'active' : ''}`} />
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
                                <div className="module-avatar">
                                  <Briefcase className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="module-details">
                                  <div className="module-name">{config.account_code} - {config.account_name}</div>
                                  <div className="module-folder">Type: {configTypes?.[config.config_type] || config.config_type}</div>
                                  <div className="module-description">Level {config.account_level}</div>
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
                        Showing {((paginatedConfigurations.current_page - 1) * paginatedConfigurations.per_page) + 1} to {Math.min(paginatedConfigurations.current_page * paginatedConfigurations.per_page, paginatedConfigurations.total)} of {paginatedConfigurations.total} results
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
