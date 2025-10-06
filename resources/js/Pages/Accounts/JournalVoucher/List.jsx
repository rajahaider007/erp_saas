import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Calendar,
  DollarSign,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import App from '../../App.jsx';

const JournalVoucherList = () => {
  const { journalVouchers = [], accounts = [], flash } = usePage().props;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedVouchers, setSelectedVouchers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [alert, setAlert] = useState(null);

  // Handle flash messages
  useEffect(() => {
    if (flash?.success) {
      setAlert({ type: 'success', message: flash.success });
      setTimeout(() => setAlert(null), 5000);
    } else if (flash?.error) {
      setAlert({ type: 'error', message: flash.error });
      setTimeout(() => setAlert(null), 5000);
    }
  }, [flash]);

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
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Journal Vouchers</h1>
              <p className="text-gray-600 mt-1">Manage your journal voucher entries</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.visit('/accounts/journal-voucher/create')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Journal Voucher
              </button>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {alert && (
          <div className={`p-4 rounded-lg animate-slideIn ${
            alert.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {alert.type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{alert.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vouchers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="posted">Posted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="this_week">This Week</option>
                    <option value="this_month">This Month</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedVouchers.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                {selectedVouchers.length} voucher(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedVouchers([])}
                  className="inline-flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vouchers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedVouchers.length === filteredVouchers.length && filteredVouchers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVouchers(filteredVouchers.map(v => v.id));
                        } else {
                          setSelectedVouchers([]);
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Voucher Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <FileText className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Journal Vouchers Found</h3>
                        <p className="text-gray-500 mb-4">Get started by creating your first journal voucher.</p>
                        <button
                          onClick={() => router.visit('/accounts/journal-voucher/create')}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Journal Voucher
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((voucher) => (
                    <tr key={voucher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedVouchers.includes(voucher.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedVouchers([...selectedVouchers, voucher.id]);
                            } else {
                              setSelectedVouchers(selectedVouchers.filter(id => id !== voucher.id));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {voucher.voucher_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {voucher.description}
                          </div>
                          {voucher.reference_number && (
                            <div className="text-xs text-gray-400">
                              Ref: {voucher.reference_number}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {new Date(voucher.voucher_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {voucher.currency_code} {parseFloat(voucher.total_debit).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {voucher.currency_code} {parseFloat(voucher.total_credit).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(voucher.status)}`}>
                          {getStatusIcon(voucher.status)}
                          <span className="ml-1">{voucher.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleView(voucher)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {voucher.status === 'Draft' && (
                            <>
                              <button
                                onClick={() => handleEdit(voucher)}
                                className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handlePost(voucher)}
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                title="Post"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(voucher)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredVouchers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {filteredVouchers.length} of {journalVouchers.length} journal vouchers
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </App>
  );
};

export default JournalVoucherList;
