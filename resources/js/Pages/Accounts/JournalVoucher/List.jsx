import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  XCircle,
  FileSpreadsheet,
  Printer,
  X,
  Check
} from 'lucide-react';
import App from '../../App.jsx';
import CustomDatePicker from '../../../Components/DatePicker/DatePicker';

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

const JournalVoucherList = () => {
  const { journalVouchers: paginatedVouchers = [], accounts = [], flash, filters } = usePage().props;
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
  const [fromDate, setFromDate] = useState(filters?.from_date || new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(filters?.to_date || new Date().toISOString().split('T')[0]);
  const [selectedVouchers, setSelectedVouchers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: filters?.sort_by || 'id',
    direction: filters?.sort_direction || 'desc'
  });
  const [currentPage, setCurrentPage] = useState(paginatedVouchers?.current_page || 1);
  const [pageSize, setPageSize] = useState(filters?.per_page || 25);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    voucherInfo: true,
    date: true,
    amount: true,
    status: true,
    actions: true
  });

  const handleColumnToggle = (column) => {
    if (column) {
      setVisibleColumns(prev => ({
        ...prev,
        [column]: !prev[column]
      }));
    }
  };

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

  const handleFromDateFilter = useCallback((date) => {
    setFromDate(date);
    const params = new URLSearchParams(window.location.search);
    if (date) {
      params.set('from_date', date);
    } else {
      params.delete('from_date');
    }
    params.set('page', '1');
    router.get(window.location.pathname + '?' + params.toString(), {}, {
      preserveState: true,
      preserveScroll: true
    });
  }, []);

  const handleToDateFilter = useCallback((date) => {
    setToDate(date);
    const params = new URLSearchParams(window.location.search);
    if (date) {
      params.set('to_date', date);
    } else {
      params.delete('to_date');
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

  const pageSizeOptions = [10, 25, 50, 100];

  // Quick filter helper functions
  const isTodayFilter = () => {
    if (!fromDate || !toDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return fromDate === today && toDate === today;
  };

  const isThisWeekFilter = () => {
    if (!fromDate || !toDate) return false;
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    const startStr = startOfWeek.toISOString().split('T')[0];
    const endStr = endOfWeek.toISOString().split('T')[0];
    return fromDate === startStr && toDate === endStr;
  };

  const isThisMonthFilter = () => {
    if (!fromDate || !toDate) return false;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startStr = startOfMonth.toISOString().split('T')[0];
    const endStr = endOfMonth.toISOString().split('T')[0];
    return fromDate === startStr && toDate === endStr;
  };

  const setTodayFilter = () => {
    const today = new Date().toISOString().split('T')[0];
    setFromDate(today);
    setToDate(today);
    const params = new URLSearchParams(window.location.search);
    params.set('from_date', today);
    params.set('to_date', today);
    params.set('page', '1');
    router.get(window.location.pathname + '?' + params.toString(), {}, {
      preserveState: true,
      preserveScroll: true
    });
  };

  const setThisWeekFilter = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    const startStr = startOfWeek.toISOString().split('T')[0];
    const endStr = endOfWeek.toISOString().split('T')[0];
    setFromDate(startStr);
    setToDate(endStr);
    const params = new URLSearchParams(window.location.search);
    params.set('from_date', startStr);
    params.set('to_date', endStr);
    params.set('page', '1');
    router.get(window.location.pathname + '?' + params.toString(), {}, {
      preserveState: true,
      preserveScroll: true
    });
  };

  const setThisMonthFilter = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startStr = startOfMonth.toISOString().split('T')[0];
    const endStr = endOfMonth.toISOString().split('T')[0];
    setFromDate(startStr);
    setToDate(endStr);
    const params = new URLSearchParams(window.location.search);
    params.set('from_date', startStr);
    params.set('to_date', endStr);
    params.set('page', '1');
    router.get(window.location.pathname + '?' + params.toString(), {}, {
      preserveState: true,
      preserveScroll: true
    });
  };

  // Helper functions for quick filter select
  const getCurrentQuickFilter = () => {
    if (isTodayFilter()) return 'today';
    if (isThisWeekFilter()) return 'thisWeek';
    if (isThisMonthFilter()) return 'thisMonth';
    return '';
  };

  const handleQuickFilterChange = (value) => {
    switch (value) {
      case 'today':
        setTodayFilter();
        break;
      case 'thisWeek':
        setThisWeekFilter();
        break;
      case 'thisMonth':
        setThisMonthFilter();
        break;
      default:
        setFromDate('');
        setToDate('');
        const params = new URLSearchParams(window.location.search);
        params.delete('from_date');
        params.delete('to_date');
        params.set('page', '1');
        router.get(window.location.pathname + '?' + params.toString(), {}, {
          preserveState: true,
          preserveScroll: true
        });
        break;
    }
  };

  // Bulk actions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedVouchers(paginatedVouchers.data.map(voucher => voucher.id));
    } else {
      setSelectedVouchers([]);
    }
  };

  const handleSelectVoucher = (voucherId, checked) => {
    if (checked) {
      setSelectedVouchers(prev => [...prev, voucherId]);
    } else {
      setSelectedVouchers(prev => prev.filter(id => id !== voucherId));
    }
  };

  // Handle voucher actions
  const handleView = (voucher) => {
    router.visit(`/accounts/journal-voucher/${voucher.id}`);
  };

  const handleEdit = (voucher) => {
    if (voucher.status !== 'Draft') {
      CustomAlert.fire({
        title: 'Cannot Edit',
        text: 'Only draft vouchers can be edited',
        icon: 'error'
      });
      return;
    }
    router.visit(`/accounts/journal-voucher/${voucher.id}/edit`);
  };

  const handleDelete = (voucher) => {
    if (voucher.status !== 'Draft') {
      CustomAlert.fire({
        title: 'Cannot Delete',
        text: 'Only draft vouchers can be deleted',
        icon: 'error'
      });
      return;
    }
    
    CustomAlert.fire({
      title: 'Are you sure?',
      text: `You are about to delete voucher "${voucher.voucher_number}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      onConfirm: () => {
        setLoading(true);
        router.delete(`/accounts/journal-voucher/${voucher.id}`, {
          onFinish: () => setLoading(false)
        });
      }
    });
  };

  const handlePost = (voucher) => {
    if (voucher.status !== 'Draft') {
      CustomAlert.fire({
        title: 'Cannot Post',
        text: 'Only draft vouchers can be posted',
        icon: 'error'
      });
      return;
    }
    
    CustomAlert.fire({
      title: 'Post Voucher?',
      text: `You are about to post voucher "${voucher.voucher_number}". This action cannot be undone.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, post it!',
      cancelButtonText: 'Cancel',
      onConfirm: () => {
        setLoading(true);
        router.post(`/accounts/journal-voucher/${voucher.id}/post`, {}, {
          onFinish: () => setLoading(false)
        });
      }
    });
  };

  const handleBulkAction = (action) => {
    if (selectedVouchers.length === 0) {
      CustomAlert.fire({
        title: 'No Selection',
        text: 'Please select vouchers to perform bulk action',
        icon: 'warning'
      });
      return;
    }

    if (action === 'delete') {
      CustomAlert.fire({
        title: 'Delete Selected Vouchers?',
        text: `You are about to delete ${selectedVouchers.length} journal voucher(s). This action cannot be undone!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete them!',
        cancelButtonText: 'Cancel',
        onConfirm: () => {
          setLoading(true);
          selectedVouchers.forEach(id => {
            router.delete(`/accounts/journal-voucher/${id}`);
          });
          setSelectedVouchers([]);
          setLoading(false);
        }
      });
    }

    if (action === 'post') {
      // Check if all selected vouchers are draft
      const selectedVoucherData = paginatedVouchers.data.filter(v => selectedVouchers.includes(v.id));
      const nonDraftVouchers = selectedVoucherData.filter(v => v.status !== 'Draft');
      
      if (nonDraftVouchers.length > 0) {
        CustomAlert.fire({
          title: 'Cannot Post Selected Vouchers',
          text: `${nonDraftVouchers.length} voucher(s) are not in Draft status and cannot be posted. Only Draft vouchers can be posted.`,
          icon: 'error'
        });
        return;
      }

      CustomAlert.fire({
        title: 'Post Selected Vouchers?',
        text: `You are about to post ${selectedVouchers.length} journal voucher(s). This action cannot be undone!`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, post them!',
        cancelButtonText: 'Cancel',
        onConfirm: () => {
          setLoading(true);
          router.post('/accounts/journal-voucher/bulk-post', {
            ids: selectedVouchers
          }, {
            onSuccess: (page) => {
              setSelectedVouchers([]);
              CustomAlert.fire({
                title: 'Success!',
                text: `Successfully posted ${selectedVouchers.length} voucher(s).`,
                icon: 'success'
              });
            },
            onError: (errors) => {
              CustomAlert.fire({
                title: 'Error!',
                text: 'Failed to post some vouchers. Please try again.',
                icon: 'error'
              });
            },
            onFinish: () => setLoading(false)
          });
        }
      });
    }
  };

  // Export functions
  const exportToCSV = () => {
    CustomAlert.fire({
      title: 'Export to CSV',
      text: 'Download all journal vouchers as CSV file?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, download!',
      cancelButtonText: 'Cancel',
      onConfirm: () => {
        // Build query parameters for current filters
        const params = new URLSearchParams(window.location.search);
        const exportUrl = `/accounts/journal-voucher/export-csv?${params.toString()}`;
        window.open(exportUrl, '_blank');
      }
    });
  };

  const exportToExcel = () => {
    CustomAlert.fire({
      title: 'Export to Excel',
      text: 'Download all journal vouchers as Excel file?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, download!',
      cancelButtonText: 'Cancel',
      onConfirm: () => {
        // Build query parameters for current filters
        const params = new URLSearchParams(window.location.search);
        const exportUrl = `/accounts/journal-voucher/export-excel?${params.toString()}`;
        window.open(exportUrl, '_blank');
      }
    });
  };

  const exportToPDF = () => {
    CustomAlert.fire({
      title: 'Export to PDF',
      text: 'Download all journal vouchers as PDF file?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, download!',
      cancelButtonText: 'Cancel',
      onConfirm: () => {
        // Build query parameters for current filters
        const params = new URLSearchParams(window.location.search);
        const exportUrl = `/accounts/journal-voucher/export-pdf?${params.toString()}`;
        window.open(exportUrl, '_blank');
      }
    });
  };

  const printVouchers = () => {
    // Print current filtered results
    window.print();
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
      <div className="advanced-module-manager form-theme-system">
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
                  <span>{paginatedVouchers?.total || 0} Total</span>
                </div>
                <div className="stat-item">
                  <Users size={16} />
                  <span>{paginatedVouchers?.data?.filter(v => v.status === 'Posted').length || 0} Posted</span>
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
                  <button onClick={exportToExcel}>
                    <FileSpreadsheet size={16} />
                    Export as Excel
                  </button>
                  <button onClick={exportToPDF}>
                    <FileText size={16} />
                    Export as PDF
                  </button>
                  <button onClick={printVouchers}>
                    <Printer size={16} />
                    Print
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

        {/* Modern Compact Filters */}
        <div className="modern-filters-container">
          <div className="filters-toolbar">
            <div className="search-section">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search vouchers..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
          
              <div className="filter-group">
                <label className="filter-label">Date Range</label>
                <div className="date-inputs">
                  <CustomDatePicker
                    selected={fromDate ? new Date(fromDate) : null}
                    onChange={(date) => handleFromDateFilter(date ? date.toISOString().split('T')[0] : '')}
                    type="date"
                    placeholder="From date"
                    className="date-input"
                  />
                  <CustomDatePicker
                    selected={toDate ? new Date(toDate) : null}
                    onChange={(date) => handleToDateFilter(date ? date.toISOString().split('T')[0] : '')}
                    type="date"
                    placeholder="To date"
                    className="date-input"
                  />
                </div>
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

              <div className="filter-group">
                <label className="filter-label">Quick</label>
                <select
                  className="filter-select"
                  value={getCurrentQuickFilter()}
                  onChange={(e) => handleQuickFilterChange(e.target.value)}
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Columns</label>
                <select
                  className="filter-select"
                  value=""
                  onChange={(e) => handleColumnToggle(e.target.value)}
                >
                  <option value="">Show/Hide</option>
                  {Object.entries(visibleColumns).map(([key, visible]) => (
                    <option key={key} value={key}>
                      {visible ? 'Hide' : 'Show'} {key}
                    </option>
                  ))}
                </select>
              </div>
            
              <button
                className="reset-btn"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setFromDate('');
                  setToDate('');
                  const params = new URLSearchParams();
                  params.set('page', '1');
                  router.get(window.location.pathname + '?' + params.toString(), {}, {
                    preserveState: true,
                    preserveScroll: true
                  });
                }}
                title="Reset all filters"
              >
                <RefreshCcw size={16} />
              </button>
            </div>
          </div>
        </div>


        {/* Bulk Actions Bar */}
        {selectedVouchers.length > 0 && (
          <div className="bulk-actions-bar">
            <div className="selection-info">
              <CheckCircle2 size={20} />
              <span>{selectedVouchers.length} voucher{selectedVouchers.length !== 1 ? 's' : ''} selected</span>
            </div>

            <div className="bulk-actions">
              <button className="btn btn-sm btn-secondary" onClick={() => setSelectedVouchers([])}>
                <X size={16} />
                Clear Selection
              </button>

              <div className="dropdown">
                <button className="btn btn-sm btn-secondary dropdown-toggle">
                  <Settings size={16} />
                  Bulk Actions
                  <ChevronDown size={12} />
                </button>
                <div className="dropdown-menu">
                  <button onClick={() => handleBulkAction('post')}>
                    <CheckCircle size={16} />
                    Post Selected
                  </button>
                  <div className="dropdown-divider"></div>
                  <button 
                    onClick={() => handleBulkAction('delete')}
                    className="text-danger"
                  >
                    <Trash2 size={16} />
                    Delete Selected
                  </button>
                </div>
              </div>
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
            ) : !paginatedVouchers?.data?.length ? (
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
                            checked={selectedVouchers.length === paginatedVouchers.data.length && paginatedVouchers.data.length > 0}
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
                      {paginatedVouchers.data.map((voucher) => (
                        <tr key={voucher.id} className="table-row">
                          <td>
                            <input
                              type="checkbox"
                              className="checkbox"
                              checked={selectedVouchers.includes(voucher.id)}
                              onChange={(e) => handleSelectVoucher(voucher.id, e.target.checked)}
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
                                {/* Print Summary Button */}
                                <button
                                  className="action-btn print-summary"
                                  title="Print Summary"
                                  onClick={() => window.open(`/accounts/journal-voucher/${voucher.id}/print-summary`, '_blank')}
                                >
                                  <Printer size={16} />
                                </button>

                                {/* Print Detailed Button */}
                                <button
                                  className="action-btn print-detailed"
                                  title="Print Detailed"
                                  onClick={() => window.open(`/accounts/journal-voucher/${voucher.id}/print-detailed`, '_blank')}
                                >
                                  <Printer size={16} />
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

                {/* Enhanced Pagination */}
                <div className="pagination-container">
                  <div className="pagination-info">
                    <div className="results-info">
                      Showing {paginatedVouchers.from || 0} to {paginatedVouchers.to || 0} of {paginatedVouchers.total || 0} entries
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
                      {Array.from({ length: Math.min(7, paginatedVouchers.last_page || 1) }, (_, index) => {
                        let pageNumber;
                        const totalPages = paginatedVouchers.last_page || 1;

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
                      disabled={currentPage === (paginatedVouchers.last_page || 1)}
                      onClick={() => handlePageChange(currentPage + 1)}
                      title="Next Page"
                    >
                      <ChevronRight size={14} />
                    </button>

                    <button
                      className="pagination-btn"
                      disabled={currentPage === (paginatedVouchers.last_page || 1)}
                      onClick={() => handlePageChange(paginatedVouchers.last_page || 1)}
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
                      max={paginatedVouchers.last_page || 1}
                      value={currentPage}
                      onChange={(e) => {
                        const page = Math.max(1, Math.min(paginatedVouchers.last_page || 1, Number(e.target.value)));
                        handlePageChange(page);
                      }}
                      className="jump-input"
                    />
                    <span>of {paginatedVouchers.last_page || 1}</span>
                  </div>
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
