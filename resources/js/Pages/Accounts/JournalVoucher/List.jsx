import React, { useState, useEffect, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Calendar,
  DollarSign,
  ChevronDown,
  MoreHorizontal,
  RefreshCcw,
  Settings,
  Database,
  Users,
  TrendingUp,
  ArrowUpDown,
  Columns,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import App from '../../App.jsx';

const JournalVoucherList = () => {
  const { journalVouchers = [], accounts = [], flash } = usePage().props;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedVouchers, setSelectedVouchers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'id',
    direction: 'desc'
  });

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    voucherInfo: true,
    date: true,
    amount: true,
    status: true,
    actions: true
  });

  // Handle flash messages
  useEffect(() => {
    if (flash?.success) {
      // Flash message will be handled by the CustomAlert component
    } else if (flash?.error) {
      // Flash message will be handled by the CustomAlert component
    }
  }, [flash]);

  // Handle search
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Handle status filter
  const handleStatusFilter = useCallback((status) => {
    setStatusFilter(status);
  }, []);

  // Handle sort
  const handleSort = useCallback((key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  }, [sortConfig]);

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
    { value: 'draft', label: 'Draft' },
    { value: 'posted', label: 'Posted' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  // Filter vouchers based on search and filters
  const filteredVouchers = journalVouchers.filter(voucher => {
    const matchesSearch = voucher.voucher_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voucher.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || voucher.status.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'today' && new Date(voucher.voucher_date).toDateString() === new Date().toDateString()) ||
                       (dateFilter === 'this_week' && isThisWeek(new Date(voucher.voucher_date))) ||
                       (dateFilter === 'this_month' && isThisMonth(new Date(voucher.voucher_date)));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Helper functions for date filtering
  const isThisWeek = (date) => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    return date >= startOfWeek && date <= endOfWeek;
  };

  const isThisMonth = (date) => {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  // Handle voucher actions
  const handleView = (voucher) => {
    router.visit(`/accounts/journal-voucher/${voucher.id}`);
  };

  const handleEdit = (voucher) => {
    if (voucher.status !== 'Draft') {
      setAlert({ type: 'error', message: 'Only draft vouchers can be edited' });
      return;
    }
    router.visit(`/accounts/journal-voucher/${voucher.id}/edit`);
  };

  const handleDelete = (voucher) => {
    if (voucher.status !== 'Draft') {
      setAlert({ type: 'error', message: 'Only draft vouchers can be deleted' });
      return;
    }
    
    if (confirm('Are you sure you want to delete this journal voucher?')) {
      router.delete(`/accounts/journal-voucher/${voucher.id}`);
    }
  };

  const handlePost = (voucher) => {
    if (voucher.status !== 'Draft') {
      setAlert({ type: 'error', message: 'Only draft vouchers can be posted' });
      return;
    }
    
    if (confirm('Are you sure you want to post this journal voucher? This action cannot be undone.')) {
      router.post(`/accounts/journal-voucher/${voucher.id}/post`);
    }
  };

  const handleBulkAction = (action) => {
    if (selectedVouchers.length === 0) {
      setAlert({ type: 'error', message: 'Please select vouchers to perform bulk action' });
      return;
    }

    if (action === 'delete') {
      if (confirm(`Are you sure you want to delete ${selectedVouchers.length} journal vouchers?`)) {
        selectedVouchers.forEach(id => {
          router.delete(`/accounts/journal-voucher/${id}`);
        });
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'posted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'posted':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <App>
      <div className="advanced-module-manager">
        {/* Enhanced Header */}
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title">
                <Database className="title-icon" />
                {usePage().props?.pageTitle || 'Journal Vouchers'}
              </h1>
              <div className="stats-summary">
                <div className="stat-item">
                  <TrendingUp size={16} />
                  <span>{journalVouchers?.length || 0} Total</span>
                </div>
                <div className="stat-item">
                  <Users size={16} />
                  <span>{journalVouchers?.filter(v => v.status === 'Posted').length || 0} Posted</span>
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
                  <button onClick={() => console.log('Export CSV')}>
                    <FileText size={16} />
                    Export as CSV
                  </button>
                </div>
              </div>

              <a href='/accounts/journal-voucher/create' className="btn btn-primary">
                <Plus size={20} />
                Add Journal Voucher
              </a>
            </div>
          </div>
        </div>

        {/* Flash Messages */}
        {flash?.success && (
          <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300 animate-slideIn">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{flash.success}</p>
              </div>
            </div>
          </div>
        )}

        {flash?.error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 animate-slideIn">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{flash.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Filters */}
        <div className="filters-bar">
          <div className="filter-group">
            <div className="search-container">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                className="search-input"
                placeholder="Search journal vouchers..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

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

          <div className="view-controls">
            <button
              className="btn btn-icon"
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              title="Show/Hide Columns"
            >
              <Columns size={20} />
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedVouchers.length > 0 && (
          <div className="bulk-actions-bar">
            <div className="selection-info">
              <span>{selectedVouchers.length} voucher(s) selected</span>
            </div>
            <div className="bulk-actions">
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 size={16} />
                Delete Selected
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
                <p>Loading journal vouchers...</p>
              </div>
            ) : !filteredVouchers?.length ? (
              <div className="empty-state">
                <Database className="empty-icon" />
                <h3>No journal vouchers found</h3>
                <p>Try adjusting your filters or search criteria</p>
                <a href="/accounts/journal-voucher/create" className="btn btn-primary">
                  <Plus size={20} />
                  Add Your First Journal Voucher
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
                            checked={selectedVouchers.length === filteredVouchers.length && filteredVouchers.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedVouchers(filteredVouchers.map(v => v.id));
                              } else {
                                setSelectedVouchers([]);
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

                        {visibleColumns.voucherInfo && (
                          <th className="sortable" onClick={() => handleSort('voucher_number')}>
                            <div className="th-content">
                              Voucher Details
                              <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'voucher_number' ? 'active' : ''}`} />
                            </div>
                          </th>
                        )}

                        {visibleColumns.date && (
                          <th className="sortable" onClick={() => handleSort('voucher_date')}>
                            <div className="th-content">
                              Date
                              <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'voucher_date' ? 'active' : ''}`} />
                            </div>
                          </th>
                        )}

                        {visibleColumns.amount && (
                          <th className="sortable" onClick={() => handleSort('total_debit')}>
                            <div className="th-content">
                              Amount
                              <ArrowUpDown size={14} className={`sort-icon ${sortConfig.key === 'total_debit' ? 'active' : ''}`} />
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

                        {visibleColumns.actions && (
                          <th className="actions-header">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVouchers.map((voucher) => (
                        <tr key={voucher.id} className="table-row">
                          <td>
                            <input
                              type="checkbox"
                              className="checkbox"
                              checked={selectedVouchers.includes(voucher.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedVouchers([...selectedVouchers, voucher.id]);
                                } else {
                                  setSelectedVouchers(selectedVouchers.filter(id => id !== voucher.id));
                                }
                              }}
                            />
                          </td>

                          {visibleColumns.id && (
                            <td>
                              <span className="module-id">#{voucher.id}</span>
                            </td>
                          )}

                          {visibleColumns.voucherInfo && (
                            <td>
                              <div className="module-info">
                                <div className="module-avatar">
                                  <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="module-details">
                                  <div className="module-name">{voucher.voucher_number}</div>
                                  <div className="module-folder">{voucher.description}</div>
                                  {voucher.reference_number && (
                                    <div className="module-description">Ref: {voucher.reference_number}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                          )}

                          {visibleColumns.date && (
                            <td>
                              <div className="date-cell">
                                <Calendar size={14} />
                                <span>{formatDate(voucher.voucher_date)}</span>
                              </div>
                            </td>
                          )}

                          {visibleColumns.amount && (
                            <td>
                              <div className="revenue-cell">
                                <DollarSign size={14} />
                                <span className="revenue-amount">
                                  {voucher.currency_code} {parseFloat(voucher.total_debit).toLocaleString()}
                                </span>
                              </div>
                            </td>
                          )}

                          {visibleColumns.status && (
                            <td>
                              <div className="status-container">
                                <span
                                  className={`status-badge status-${voucher.status.toLowerCase()}`}
                                  style={{
                                    backgroundColor: `${getStatusColor(voucher.status).includes('green') ? '#10B981' : voucher.status.toLowerCase() === 'draft' ? '#F59E0B' : '#EF4444'}15`,
                                    color: getStatusColor(voucher.status).includes('green') ? '#10B981' : voucher.status.toLowerCase() === 'draft' ? '#F59E0B' : '#EF4444'
                                  }}
                                >
                                  <div
                                    className="status-dot"
                                    style={{ 
                                      backgroundColor: getStatusColor(voucher.status).includes('green') ? '#10B981' : voucher.status.toLowerCase() === 'draft' ? '#F59E0B' : '#EF4444'
                                    }}
                                  ></div>
                                  {voucher.status}
                                </span>
                              </div>
                            </td>
                          )}

                          {visibleColumns.actions && (
                            <td>
                              <div className="actions-cell">
                                <button
                                  className="action-btn view"
                                  title="View Details"
                                  onClick={() => handleView(voucher)}
                                >
                                  <Eye size={16} />
                                </button>
                                {voucher.status === 'Draft' && (
                                  <>
                                    <button
                                      className="action-btn edit"
                                      title="Edit Voucher"
                                      onClick={() => handleEdit(voucher)}
                                    >
                                      <Edit3 size={16} />
                                    </button>
                                    <button
                                      className="action-btn copy"
                                      title="Post Voucher"
                                      onClick={() => handlePost(voucher)}
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                    <button
                                      className="action-btn delete"
                                      title="Delete Voucher"
                                      onClick={() => handleDelete(voucher)}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </App>
  );
};

export default JournalVoucherList;
