import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import App from '../App.jsx';
import Swal from 'sweetalert2';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Settings,
  Hash,
  Calendar,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const VoucherNumberConfiguration = () => {
  const { props } = usePage();
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [formData, setFormData] = useState({
    voucher_type: '',
    prefix: '',
    number_length: 4,
    reset_frequency: 'Yearly',
    is_active: true
  });

  // Voucher types
  const voucherTypes = [
    { value: 'Journal', label: 'Journal Voucher' },
    { value: 'Payment', label: 'Payment Voucher' },
    { value: 'Receipt', label: 'Receipt Voucher' },
    { value: 'Purchase', label: 'Purchase Voucher' },
    { value: 'Sales', label: 'Sales Voucher' }
  ];

  // Load configurations
  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/voucher-number-configurations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json();
        setConfigurations(data.data || []);
      } else {
        console.error('Failed to load configurations');
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = modalMode === 'add' 
        ? '/api/voucher-number-configurations'
        : `/api/voucher-number-configurations/${selectedConfig.id}`;
      
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: modalMode === 'add' 
            ? 'Configuration created successfully'
            : 'Configuration updated successfully',
          confirmButtonColor: '#3B82F6',
          confirmButtonText: 'OK'
        });
        
        loadConfigurations();
        closeModal();
      } else {
        throw new Error(result.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || 'Something went wrong. Please try again.',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  // Open modal
  const openModal = (mode, config = null) => {
    setModalMode(mode);
    setSelectedConfig(config);
    
    if (mode === 'edit' && config) {
      setFormData({
        voucher_type: config.voucher_type,
        prefix: config.prefix,
        number_length: config.number_length,
        reset_frequency: config.reset_frequency,
        is_active: config.is_active
      });
    } else {
      setFormData({
        voucher_type: '',
        prefix: '',
        number_length: 4,
        reset_frequency: 'Yearly',
        is_active: true
      });
    }
    
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedConfig(null);
    setFormData({
      voucher_type: '',
      prefix: '',
      number_length: 4,
      reset_frequency: 'Yearly',
      is_active: true
    });
  };

  // Delete configuration
  const handleDelete = async (config) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete configuration for ${config.voucher_type}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await fetch(`/api/voucher-number-configurations/${config.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
          },
          credentials: 'same-origin',
        });

        const result = await response.json();

        if (result.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Configuration deleted successfully.',
            confirmButtonColor: '#3B82F6',
            confirmButtonText: 'OK'
          });
          
          loadConfigurations();
        } else {
          throw new Error(result.message || 'Delete failed');
        }
      } catch (error) {
        console.error('Error:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.message || 'Something went wrong. Please try again.',
          confirmButtonColor: '#EF4444',
          confirmButtonText: 'OK'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadConfigurations();
  }, []);

  return (
    <App>
      <Head title="Voucher Number Configuration" />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Voucher Number Configuration
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Configure voucher numbering for different transaction types
                </p>
              </div>
              <button
                onClick={() => openModal('add')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Configuration
              </button>
            </div>
          </div>

          {/* Configurations List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading configurations...</span>
                </div>
              ) : configurations.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No configurations found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Get started by creating your first voucher number configuration.
                  </p>
                  <button
                    onClick={() => openModal('add')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Configuration
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Voucher Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Prefix
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Number Length
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Reset Frequency
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {configurations.map((config) => (
                        <tr key={config.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {config.voucher_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              {config.prefix}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {config.number_length} digits
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {config.reset_frequency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                              config.is_active 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {config.is_active ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openModal('edit', config)}
                                className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                                title="Edit Configuration"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(config)}
                                className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                                title="Delete Configuration"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {modalMode === 'add' ? 'Add Configuration' : 'Edit Configuration'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Voucher Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Voucher Type *
                </label>
                <select
                  value={formData.voucher_type}
                  onChange={(e) => setFormData({...formData, voucher_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                  disabled={modalMode === 'edit'}
                >
                  <option value="">Select Voucher Type</option>
                  {voucherTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prefix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prefix *
                </label>
                <input
                  type="text"
                  value={formData.prefix}
                  onChange={(e) => setFormData({...formData, prefix: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., JV, PV, RV"
                  required
                />
              </div>

              {/* Number Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number Length *
                </label>
                <input
                  type="number"
                  value={formData.number_length}
                  onChange={(e) => setFormData({...formData, number_length: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  min="1"
                  max="10"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Number of digits for the running number (e.g., 4 = 0001, 0002, etc.)
                </p>
              </div>

              {/* Reset Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reset Frequency *
                </label>
                <select
                  value={formData.reset_frequency}
                  onChange={(e) => setFormData({...formData, reset_frequency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Never">Never</option>
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  When to reset the running number
                </p>
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Active
                  </span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : (modalMode === 'add' ? 'Create' : 'Update')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </App>
  );
};

export default VoucherNumberConfiguration;
