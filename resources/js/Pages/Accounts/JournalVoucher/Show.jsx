import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Calendar,
  DollarSign,
  Printer,
  Download,
  Eye,
  User
} from 'lucide-react';
import App from '../../App.jsx';

const JournalVoucherShow = () => {
  const { voucher, entries = [], flash, currentPeriod = null } = usePage().props;
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

  if (!voucher) {
    return (
      <App>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Journal Voucher Not Found</h2>
            <p className="text-gray-600 mb-4">The journal voucher you're looking for doesn't exist.</p>
            <button
              onClick={() => router.visit('/accounts/journal-voucher')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Journal Vouchers
            </button>
          </div>
        </div>
      </App>
    );
  }

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

  const handleEdit = () => {
    if (voucher.status !== 'Draft') {
      setAlert({ type: 'error', message: 'Only draft vouchers can be edited' });
      return;
    }
    router.visit(`/accounts/journal-voucher/${voucher.id}/edit`);
  };

  const handleDelete = () => {
    if (voucher.status !== 'Draft') {
      setAlert({ type: 'error', message: 'Only draft vouchers can be deleted' });
      return;
    }
    
    if (confirm('Are you sure you want to delete this journal voucher?')) {
      router.delete(`/accounts/journal-voucher/${voucher.id}`);
    }
  };

  const handlePost = () => {
    if (voucher.status !== 'Draft') {
      setAlert({ type: 'error', message: 'Only draft vouchers can be posted' });
      return;
    }
    
    if (confirm('Are you sure you want to post this journal voucher? This action cannot be undone.')) {
      router.post(`/accounts/journal-voucher/${voucher.id}/post`);
    }
  };

  const totalDebit = entries.reduce((sum, entry) => sum + (parseFloat(entry.debit_amount) || 0), 0);
  const totalCredit = entries.reduce((sum, entry) => sum + (parseFloat(entry.credit_amount) || 0), 0);

  return (
    <App>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.visit('/accounts/journal-voucher')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Journal Voucher Details</h1>
                <p className="text-gray-600 mt-1">View journal voucher information</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </button>
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={() => window.open(`/accounts/journal-voucher/${voucher.id}/print-summary`, '_blank')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-t-lg flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Print Summary
                  </button>
                  <button
                    onClick={() => window.open(`/accounts/journal-voucher/${voucher.id}/print-detailed`, '_blank')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-b-lg flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Print Detailed
                  </button>
                </div>
              </div>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </button>
              {voucher.status === 'Draft' && (
                <>
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={handlePost}
                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Post
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </>
              )}
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

        {/* Period Status Alert */}
        {currentPeriod && (
          <div className={`p-4 rounded-lg border ${
            currentPeriod.status === 'Open' 
              ? 'bg-green-50 border-green-200 text-green-800'
              : currentPeriod.status === 'Locked'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {currentPeriod.status === 'Open' && <CheckCircle className="h-5 w-5" />}
                {currentPeriod.status === 'Locked' && <AlertCircle className="h-5 w-5" />}
                {currentPeriod.status === 'Closed' && <AlertCircle className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-1">
                  Accounting Period: {currentPeriod.period_name} (FY {currentPeriod.fiscal_year})
                </h3>
                <p className="text-sm mb-2">
                  <strong>Status:</strong> {currentPeriod.status}
                  {currentPeriod.is_adjustment_period && ' (Adjustment Period)'}
                </p>
                <p className="text-xs">
                  {currentPeriod.status === 'Open' && 'This period is active. You can create and post new transactions.'}
                  {currentPeriod.status === 'Locked' && 'This period is under review. You cannot post new transactions, but existing entries can be modified.'}
                  {currentPeriod.status === 'Closed' && 'This period is permanently closed. No transactions can be posted or modified without administrator intervention.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Voucher Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Voucher Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Number</label>
              <p className="text-sm text-gray-900 font-mono">{voucher.voucher_number}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Date</label>
              <p className="text-sm text-gray-900">{new Date(voucher.voucher_date).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(voucher.status)}`}>
                {getStatusIcon(voucher.status)}
                <span className="ml-1">{voucher.status}</span>
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <p className="text-sm text-gray-900">{voucher.currency_code}</p>
            </div>
          </div>
          
          {voucher.reference_number && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
              <p className="text-sm text-gray-900">{voucher.reference_number}</p>
            </div>
          )}
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <p className="text-sm text-gray-900">{voucher.description}</p>
          </div>
        </div>

        {/* Journal Entries */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Journal Entries</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Line
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Debit
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.line_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.account_code}
                      </div>
                      <div className="text-sm text-gray-500">
                        {entry.account_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {entry.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {parseFloat(entry.debit_amount) > 0 ? `${voucher.currency_code} ${parseFloat(entry.debit_amount).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {parseFloat(entry.credit_amount) > 0 ? `${voucher.currency_code} ${parseFloat(entry.credit_amount).toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-sm font-medium text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">
                    {voucher.currency_code} {totalDebit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900">
                    {voucher.currency_code} {totalCredit.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Audit Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
              <p className="text-sm text-gray-900">User ID: {voucher.created_by}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <p className="text-sm text-gray-900">{new Date(voucher.created_at).toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
              <p className="text-sm text-gray-900">{new Date(voucher.updated_at).toLocaleString()}</p>
            </div>
            {voucher.posted_by && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posted By</label>
                <p className="text-sm text-gray-900">User ID: {voucher.posted_by}</p>
              </div>
            )}
            {voucher.posted_at && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posted At</label>
                <p className="text-sm text-gray-900">{new Date(voucher.posted_at).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </App>
  );
};

export default JournalVoucherShow;
