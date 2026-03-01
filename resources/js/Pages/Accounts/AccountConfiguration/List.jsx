import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Filter,
  RefreshCcw,
  Database,
  X,
  ChevronDown
} from 'lucide-react';
import App from "../../App.jsx";
import { router, usePage } from '@inertiajs/react';
import { useLayout } from '@/Contexts/LayoutContext';

// Inner component that uses theme
function AccountConfigurationListContent() {
  const { theme } = useLayout();
  const { configurations: paginatedConfigurations, filters, flash, configTypes } = usePage().props;
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
  const [configTypeFilter, setConfigTypeFilter] = useState(filters?.config_type || 'all');
  const [selectedConfigs, setSelectedConfigs] = useState([]);

  const configurations = paginatedConfigurations?.data || [];

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    const params = new URLSearchParams(window.location.search);
    if (term) params.set('search', term);
    else params.delete('search');
    params.set('page', '1');
    router.get(window.location.pathname + '?' + params.toString(), {}, {
      preserveState: true,
      preserveScroll: true
    });
  }, []);

  const handleStatusFilter = useCallback((status) => {
    setStatusFilter(status);
    const params = new URLSearchParams(window.location.search);
    if (status && status !== 'all') params.set('status', status);
    else params.delete('status');
    params.set('page', '1');
    router.get(window.location.pathname + '?' + params.toString(), {}, {
      preserveState: true,
      preserveScroll: true
    });
  }, []);

  const handleConfigTypeFilter = useCallback((type) => {
    setConfigTypeFilter(type);
    const params = new URLSearchParams(window.location.search);
    if (type && type !== 'all') params.set('config_type', type);
    else params.delete('config_type');
    params.set('page', '1');
    router.get(window.location.pathname + '?' + params.toString(), {}, {
      preserveState: true,
      preserveScroll: true
    });
  }, []);

  const handleEdit = (config) => {
    router.get(`/accounts/account-configuration/${config.id}/edit`);
  };

  const handleDelete = (config) => {
    if (confirm(`Delete configuration for "${config.account_name}"?`)) {
      setLoading(true);
      router.delete(`/api/account-configuration/${config.id}`, {
        onSuccess: () => setSelectedConfigs([]),
        onFinish: () => setLoading(false)
      });
    }
  };

  const handleSelectAll = (checked) => {
    setSelectedConfigs(checked ? configurations.map(c => c.id) : []);
  };

  const handleSelectConfig = (configId, checked) => {
    setSelectedConfigs(prev =>
      checked ? [...prev, configId] : prev.filter(id => id !== configId)
    );
  };

  const handleBulkDelete = () => {
    if (selectedConfigs.length === 0) return;
    if (confirm(`Delete ${selectedConfigs.length} configuration(s)?`)) {
      setLoading(true);
      router.post('/accounts/account-configuration/bulk-destroy', {
        ids: selectedConfigs
      }, {
        onSuccess: () => setSelectedConfigs([]),
        onFinish: () => setLoading(false)
      });
    }
  };

  useEffect(() => {
    if (flash?.success) {
      alert('✓ ' + flash.success);
    } else if (flash?.error) {
      alert('✗ ' + flash.error);
    }
  }, [flash]);

  // Inject theme-aware styles
  useEffect(() => {
    const styleId = 'account-config-list-styles';
    let styleEl = document.getElementById(styleId);
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `
    .modern-list-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1.5rem;
      background: ${theme === 'dark' ? '#1f2937' : '#f9fafb'};
      border-radius: 12px;
      min-height: calc(100vh - 200px);
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'};
    }

    .header-left {
      flex: 1;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.875rem;
      font-weight: 700;
      color: ${theme === 'dark' ? '#f3f4f6' : '#111827'};
      margin: 0;
    }

    .title-icon {
      color: #3b82f6;
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
      background: ${theme === 'dark' ? '#374151' : '#e5e7eb'};
      color: ${theme === 'dark' ? '#e5e7eb' : '#374151'};
    }

    .btn-secondary:hover {
      background: ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover {
      background: #dc2626;
    }

    .btn-icon {
      width: 40px;
      height: 40px;
      padding: 0;
      justify-content: center;
      background: ${theme === 'dark' ? '#374151' : 'white'};
      border: 1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
    }

    .btn-icon:hover {
      background: ${theme === 'dark' ? '#4b5563' : '#f3f4f6'};
    }

    .filters-bar {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      background: ${theme === 'dark' ? '#2d3748' : 'white'};
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'};
    }

    .search-wrapper {
      flex: 1;
      min-width: 250px;
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      color: ${theme === 'dark' ? '#9ca3af' : '#9ca3af'};
    }

    .search-input {
      width: 100%;
      padding: 0.5rem 0.75rem 0.5rem 2.5rem;
      border: 1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
      border-radius: 6px;
      font-size: 0.875rem;
      background: ${theme === 'dark' ? '#3a4556' : 'white'};
      color: ${theme === 'dark' ? '#f3f4f6' : '#111827'};
    }

    .filter-select {
      padding: 0.5rem 0.75rem;
      border: 1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
      border-radius: 6px;
      background: ${theme === 'dark' ? '#3a4556' : 'white'};
      color: ${theme === 'dark' ? '#f3f4f6' : '#111827'};
      font-size: 0.875rem;
      cursor: pointer;
    }

    .bulk-actions-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: ${theme === 'dark' ? '#78350f' : '#fffbeb'};
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid ${theme === 'dark' ? '#b45309' : '#fbbf24'};
    }

    .selected-count {
      font-weight: 600;
      color: ${theme === 'dark' ? '#fcd34d' : '#92400e'};
    }

    .table-wrapper {
      background: ${theme === 'dark' ? '#2d3748' : 'white'};
      border-radius: 8px;
      border: 1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'};
      overflow: hidden;
    }

    .modern-table {
      width: 100%;
      border-collapse: collapse;
    }

    .modern-table thead {
      background: ${theme === 'dark' ? '#3a4556' : '#f3f4f6'};
      border-bottom: 2px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'};
    }

    .modern-table th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.875rem;
      color: ${theme === 'dark' ? '#d1d5db' : '#374151'};
      white-space: nowrap;
    }

    .modern-table td {
      padding: 1rem;
      border-bottom: 1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'};
      font-size: 0.875rem;
      color: ${theme === 'dark' ? '#e5e7eb' : '#111827'};
    }

    .table-row:hover {
      background: ${theme === 'dark' ? '#374151' : '#f9fafb'};
    }

    .checkbox-col {
      width: 50px;
      text-align: center;
    }

    .actions-col {
      width: 120px;
      text-align: center;
    }

    .btn-icon-small {
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      border-radius: 6px;
      background: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
      color: ${theme === 'dark' ? '#d1d5db' : '#374151'};
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      margin: 0 2px;
    }

    .btn-icon-small.edit:hover {
      background: ${theme === 'dark' ? '#1e3a8a' : '#dbeafe'};
      color: #3b82f6;
    }

    .btn-icon-small.delete:hover {
      background: ${theme === 'dark' ? '#7f1d1d' : '#fee2e2'};
      color: #ef4444;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: ${theme === 'dark' ? '#1e3a8a' : '#dbeafe'};
      color: ${theme === 'dark' ? '#87ceeb' : '#1e40af'};
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-badge.active {
      background: ${theme === 'dark' ? '#064e3b' : '#d1fae5'};
      color: ${theme === 'dark' ? '#86efac' : '#065f46'};
    }

    .status-badge.inactive {
      background: ${theme === 'dark' ? '#7f1d1d' : '#fee2e2'};
      color: ${theme === 'dark' ? '#fca5a5' : '#991b1b'};
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: ${theme === 'dark' ? '#9ca3af' : '#9ca3af'};
    }

    .empty-state svg {
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state p {
      margin-bottom: 1.5rem;
      font-size: 1rem;
    }

    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: ${theme === 'dark' ? '#2d3748' : 'white'};
      border: 1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'};
      border-radius: 8px;
    }

    .pagination-info {
      font-size: 0.875rem;
      color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
    }

    .pagination-controls {
      display: flex;
      gap: 0.5rem;
    }
  `;

    return () => {
      // Cleanup: remove style element on unmount
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, [theme]); // Re-run when theme changes

  return (
    <div className="modern-list-container">
      {/* Header */}
        <div className="list-header">
          <div className="header-left">
            <h1 className="page-title">
              <Database className="title-icon" />
              Account Configuration
            </h1>
            <p className="text-gray-600 mt-1">Map chart of accounts to system functions (Bank, Cash, Payable, Receivable, etc.)</p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-icon"
              onClick={() => window.location.reload()}
              disabled={loading}
              title="Refresh"
            >
              <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <a href='/accounts/account-configuration/create' className="btn btn-primary">
              <Plus size={20} />
              Add Configuration
            </a>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by account code, name..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>

          <select
            className="filter-select"
            value={configTypeFilter}
            onChange={(e) => handleConfigTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {configTypes && Object.entries(configTypes).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedConfigs.length > 0 && (
          <div className="bulk-actions-bar">
            <span className="selected-count">
              {selectedConfigs.length} selected
            </span>
            <button
              className="btn btn-danger"
              onClick={handleBulkDelete}
              disabled={loading}
            >
              <Trash2 size={18} />
              Delete Selected
            </button>
          </div>
        )}

        {/* Table */}
        <div className="table-wrapper">
          {configurations.length === 0 ? (
            <div className="empty-state">
              <Database size={48} />
              <p>No configurations found</p>
              <a href='/accounts/account-configuration/create' className="btn btn-primary">
                <Plus size={16} />
                Create First Configuration
              </a>
            </div>
          ) : (
            <table className="modern-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectedConfigs.length === configurations.length && configurations.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th>Account Code</th>
                  <th>Account Name</th>
                  <th>Type</th>
                  <th>Level</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {configurations.map((config) => (
                  <tr key={config.id} className="table-row">
                    <td className="checkbox-col">
                      <input
                        type="checkbox"
                        checked={selectedConfigs.includes(config.id)}
                        onChange={(e) => handleSelectConfig(config.id, e.target.checked)}
                      />
                    </td>
                    <td className="font-mono font-semibold">{config.account_code}</td>
                    <td>{config.account_name}</td>
                    <td>
                      <span className="badge">
                        {configTypes?.[config.config_type] || config.config_type}
                      </span>
                    </td>
                    <td className="text-center">Level {config.account_level}</td>
                    <td className="text-gray-600 text-sm">{config.description || '-'}</td>
                    <td>
                      <span className={`status-badge ${config.is_active ? 'active' : 'inactive'}`}>
                        {config.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions-col">
                      <button
                        className="btn-icon-small edit"
                        onClick={() => handleEdit(config)}
                        title="Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="btn-icon-small delete"
                        onClick={() => handleDelete(config)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {paginatedConfigurations?.total > paginatedConfigurations?.per_page && (
          <div className="pagination-bar">
            <span className="pagination-info">
              Showing {paginatedConfigurations?.from || 0} to {paginatedConfigurations?.to || 0} of {paginatedConfigurations?.total || 0}
            </span>
            <div className="pagination-controls">
              {paginatedConfigurations?.prev_page_url && (
                <button
                  className="btn btn-secondary"
                  onClick={() => router.get(paginatedConfigurations.prev_page_url)}
                >
                  Previous
                </button>
              )}
              {paginatedConfigurations?.next_page_url && (
                <button
                  className="btn btn-secondary"
                  onClick={() => router.get(paginatedConfigurations.next_page_url)}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
  );
}

// Outer component that wraps with App
export default function List() {
  return (
    <App>
      <AccountConfigurationListContent />
    </App>
  );
}
