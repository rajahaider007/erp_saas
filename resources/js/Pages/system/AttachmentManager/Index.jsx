import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  Download, 
  Eye, 
  Calendar, 
  FileText, 
  Filter,
  Search,
  HardDrive,
  AlertTriangle,
  CheckSquare,
  Square,
  Home,
  List,
  Settings,
  File,
  CheckCircle,
  X
} from 'lucide-react';
import App from "../../App.jsx";
import StorageWarning from "../../../Components/StorageWarning";
import { router, usePage } from '@inertiajs/react';

// Helper function to format file sizes
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Professional Breadcrumbs Component
const Breadcrumbs = ({ items }) => {
  return (
    <div className="breadcrumbs-themed">
      <nav className="breadcrumbs">
        {items.map((item, index) => (
          <div key={index} className="breadcrumb-item">
            <div className="breadcrumb-item-content">
              {item.icon && (
                <item.icon className={`breadcrumb-icon ${item.href ? 'breadcrumb-icon-link' : 'breadcrumb-icon-current'}`} />
              )}
              {item.href ? (
                <a href={item.href} className="breadcrumb-link-themed">{item.label}</a>
              ) : (
                <span className="breadcrumb-current-themed">{item.label}</span>
              )}
            </div>
            {index < items.length - 1 && (
              <div className="breadcrumb-separator breadcrumb-separator-themed">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="breadcrumbs-description">Manage and organize your attachment files</div>
    </div>
  );
};

const AttachmentManagerIndex = () => {
  const { storageInfo = {}, storageBreakdown = {}, error, company } = usePage().props;
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [alert, setAlert] = useState(null);
  const [filters, setFilters] = useState({
    from_date: '',
    to_date: '',
    voucher_type: '',
    file_type: '',
    search: ''
  });

  // Handle flash messages
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
      setAlert({ type: 'success', message: urlParams.get('success') });
      setTimeout(() => setAlert(null), 5000);
    } else if (urlParams.get('error')) {
      setAlert({ type: 'error', message: urlParams.get('error') });
      setTimeout(() => setAlert(null), 5000);
    }
  }, []);

  // Load attachments when filters change
  useEffect(() => {
    loadAttachments();
  }, [filters]);

  const loadAttachments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/attachment-manager/attachments?' + new URLSearchParams(filters), {
        headers: {
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAttachments(data.data || []);
      } else {
        setAlert({ type: 'error', message: 'Failed to load attachments' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Error loading attachments: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectAll = () => {
    if (selectedAttachments.length === attachments.length) {
      setSelectedAttachments([]);
    } else {
      setSelectedAttachments(attachments.map(att => att.filename));
    }
  };

  const handleSelectAttachment = (filename) => {
    setSelectedAttachments(prev => 
      prev.includes(filename)
        ? prev.filter(f => f !== filename)
        : [...prev, filename]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedAttachments.length === 0) {
      setAlert({ type: 'error', message: 'Please select attachments to delete' });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedAttachments.length} attachment(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch('/api/attachment-manager/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({
          attachment_ids: selectedAttachments
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAlert({ type: 'success', message: data.message });
        setSelectedAttachments([]);
        loadAttachments(); // Reload attachments
      } else {
        const data = await response.json();
        setAlert({ type: 'error', message: data.message || 'Failed to delete attachments' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Error deleting attachments: ' + error.message });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    const type = fileType.toLowerCase();
    if (['pdf'].includes(type)) return '📄';
    if (['doc', 'docx'].includes(type)) return '📝';
    if (['xls', 'xlsx'].includes(type)) return '📊';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(type)) return '🖼️';
    return '📎';
  };

  const breadcrumbItems = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard'
    },
    {
      label: 'System',
      icon: Settings,
      href: null
    },
    {
      label: 'Attachment Manager',
      icon: HardDrive,
      href: null
    }
  ];

  if (error) {
    return (
      <App>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h3>
                  <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </App>
    );
  }

  return (
    <App>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} />

          {/* Storage Warning */}
          {company && (
            <StorageWarning 
              companyId={company.id} 
              showDetails={true}
            />
          )}

          {/* Alert Messages */}
          {alert && (
            <div className={`mb-6 p-4 rounded-lg animate-slideIn ${
              alert.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' 
                : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {alert.type === 'success' ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{alert.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Container */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                  <HardDrive className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  Attachment Manager
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Manage and organize your attachment files with advanced filtering options
                </p>
              </div>

              {/* Filters Section */}
              <div className="mb-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={filters.from_date}
                      onChange={(e) => handleFilterChange('from_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={filters.to_date}
                      onChange={(e) => handleFilterChange('to_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Voucher Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Voucher Type
                    </label>
                    <select
                      value={filters.voucher_type}
                      onChange={(e) => handleFilterChange('voucher_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">All Types</option>
                      <option value="Journal">Journal</option>
                      <option value="Payment">Payment</option>
                      <option value="Receipt">Receipt</option>
                      <option value="Invoice">Invoice</option>
                    </select>
                  </div>

                  {/* File Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      File Type
                    </label>
                    <select
                      value={filters.file_type}
                      onChange={(e) => handleFilterChange('file_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">All Files</option>
                      <option value="pdf">PDF</option>
                      <option value="doc">DOC</option>
                      <option value="docx">DOCX</option>
                      <option value="xls">XLS</option>
                      <option value="xlsx">XLSX</option>
                      <option value="jpg">JPG</option>
                      <option value="jpeg">JPEG</option>
                      <option value="png">PNG</option>
                      <option value="gif">GIF</option>
                    </select>
                  </div>

                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Search
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        placeholder="Search files..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                  >
                    {selectedAttachments.length === attachments.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    Select All
                  </button>
                  
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedAttachments.length} of {attachments.length} selected
                  </span>
                </div>

                {selectedAttachments.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected ({selectedAttachments.length})
                  </button>
                )}
              </div>

              {/* Attachments List */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Loading attachments...</p>
                  </div>
                ) : attachments.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No attachments found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Select
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            File
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Voucher
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {attachments.map((attachment, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleSelectAttachment(attachment.filename)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                {selectedAttachments.includes(attachment.filename) ? (
                                  <CheckSquare className="w-4 h-4" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{getFileIcon(attachment.file_type)}</span>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs">
                                    {attachment.filename}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {attachment.file_type.toUpperCase()}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {attachment.voucher_number}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {attachment.voucher_type}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                  {new Date(attachment.voucher_date).toLocaleDateString()}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-900 dark:text-gray-100">
                                {formatFileSize(attachment.size)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                                  title="View file"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                                <a
                                  href={attachment.url}
                                  download
                                  className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                                  title="Download file"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Summary */}
              {attachments.length > 0 && (
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Showing {attachments.length} attachment(s)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </App>
  );
};

export default AttachmentManagerIndex;
