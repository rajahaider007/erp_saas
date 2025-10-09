import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { ArrowLeft, Clock, User, FileText, Eye, Calendar, MapPin, Shield } from 'lucide-react';

export default function ChangeDetails({ log }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const formatJsonData = (data) => {
        if (!data) return 'No data';
        try {
            return JSON.stringify(data, null, 2);
        } catch {
            return String(data);
        }
    };

    const getActionBadgeClass = (actionType) => {
        const classes = {
            'CREATE': 'bg-green-100 text-green-700 border-green-300',
            'UPDATE': 'bg-blue-100 text-blue-700 border-blue-300',
            'DELETE': 'bg-red-100 text-red-700 border-red-300',
            'POST': 'bg-purple-100 text-purple-700 border-purple-300',
            'UNPOST': 'bg-orange-100 text-orange-700 border-orange-300',
            'APPROVE': 'bg-emerald-100 text-emerald-700 border-emerald-300',
            'REJECT': 'bg-rose-100 text-rose-700 border-rose-300'
        };
        return classes[actionType] || 'bg-gray-100 text-gray-700 border-gray-300';
    };

    return (
        <AppLayout>
            <Head title="Change Details" />

            <div className="form-theme-system min-h-screen p-6">
                {/* Header */}
                <div className="manager-header">
                    <div className="header-content">
                        <div className="header-info">
                            <Link 
                                href={route('logs.activity')} 
                                className="back-btn"
                                title="Back to Activity Logs"
                            >
                                <ArrowLeft size={20} />
                            </Link>
                            <div className="header-text">
                                <h1 className="header-title">
                                    <FileText className="header-icon" size={24} />
                                    Change Details
                                </h1>
                                <p className="header-subtitle">
                                    Detailed view of activity log entry
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Card */}
                <div className="main-content">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                                    <Eye size={20} />
                                    Basic Information
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                                    <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                                        <Clock size={16} className="text-gray-500" />
                                        <span className="text-sm font-semibold text-gray-700">Timestamp</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {formatDate(log.created_at)}
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                                    <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                                        <User size={16} className="text-gray-500" />
                                        <span className="text-sm font-semibold text-gray-700">User</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <div className="font-semibold">{log.user_name || 'System'}</div>
                                        <div className="text-xs text-gray-500">{log.user_email}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                                    <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                                        <FileText size={16} className="text-gray-500" />
                                        <span className="text-sm font-semibold text-gray-700">Action</span>
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getActionBadgeClass(log.action_type)}`}>
                                            {log.action_type}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                                    <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                                        <Calendar size={16} className="text-gray-500" />
                                        <span className="text-sm font-semibold text-gray-700">Module</span>
                                    </div>
                                    <div>
                                        <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-200">
                                            {log.module_name}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                                        <MapPin size={16} className="text-gray-500" />
                                        <span className="text-sm font-semibold text-gray-700">IP Address</span>
                                    </div>
                                    <div>
                                        <code className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700">
                                            {log.ip_address}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                                    <FileText size={20} />
                                    Description
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <p className="text-gray-700 leading-relaxed">
                                        {log.description || 'No description available'}
                                    </p>
                                    <div className="text-sm text-gray-500 space-y-1">
                                        <div><strong>Table:</strong> {log.table_name}</div>
                                        <div><strong>Record ID:</strong> {log.record_id}</div>
                                        {log.company_id && (
                                            <div><strong>Company ID:</strong> {log.company_id}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Changes Data */}
                        {(log.old_data || log.new_data) && (
                            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                                        <Shield size={20} />
                                        Data Changes
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {log.old_data && (
                                            <div className="rounded-lg overflow-hidden border border-red-200">
                                                <h4 className="bg-red-50 text-red-700 px-4 py-3 font-semibold text-sm border-b border-red-200">
                                                    Previous Data
                                                </h4>
                                                <pre className="bg-red-50 p-4 text-xs leading-relaxed overflow-x-auto max-h-80 overflow-y-auto text-red-800">
                                                    {formatJsonData(log.old_data)}
                                                </pre>
                                            </div>
                                        )}

                                        {log.new_data && (
                                            <div className="rounded-lg overflow-hidden border border-green-200">
                                                <h4 className="bg-green-50 text-green-700 px-4 py-3 font-semibold text-sm border-b border-green-200">
                                                    New Data
                                                </h4>
                                                <pre className="bg-green-50 p-4 text-xs leading-relaxed overflow-x-auto max-h-80 overflow-y-auto text-green-800">
                                                    {formatJsonData(log.new_data)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Additional Metadata */}
                        {log.metadata && (
                            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                                        <Shield size={20} />
                                        Additional Information
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <pre className="bg-gray-50 p-4 rounded-lg text-xs leading-relaxed overflow-x-auto max-h-60 overflow-y-auto text-gray-700">
                                        {formatJsonData(log.metadata)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </AppLayout>
    );
}
