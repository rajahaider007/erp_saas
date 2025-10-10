import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { ArrowLeft, Clock, User, FileText, Eye, Calendar, MapPin, Shield, Database, Hash, Building } from 'lucide-react';

export default function ChangeDetails({ log }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const formatJsonData = (data) => {
        if (!data) return 'No data';
        try {
            if (typeof data === 'string') {
                const parsed = JSON.parse(data);
                return JSON.stringify(parsed, null, 2);
            }
            return JSON.stringify(data, null, 2);
        } catch {
            return String(data);
        }
    };

    const parseJsonData = (data) => {
        if (!data) return null;
        try {
            if (typeof data === 'string') {
                return JSON.parse(data);
            }
            return data;
        } catch {
            return null;
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

                {/* Professional Details Layout */}
                <div className="main-content">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Information Card */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                                <h3 className="flex items-center gap-3 text-lg font-semibold text-white">
                                    <Eye size={20} />
                                    Basic Information
                                </h3>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                                    <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                                        <Clock size={16} className="text-blue-600" />
                                        <span className="text-sm font-semibold text-gray-800">Timestamp</span>
                                    </div>
                                    <div className="text-sm text-gray-700 font-medium">
                                        {formatDate(log.created_at)}
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                                    <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                                        <User size={16} className="text-blue-600" />
                                        <span className="text-sm font-semibold text-gray-800">User</span>
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        <div className="font-semibold text-gray-800">{log.user_name || 'System Administrator'}</div>
                                        <div className="text-xs text-gray-600">{log.user_email || 'admin@erpsystem.com'}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                                    <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                                        <FileText size={16} className="text-blue-600" />
                                        <span className="text-sm font-semibold text-gray-800">Action</span>
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getActionBadgeClass(log.action_type)}`}>
                                            {log.action_type}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                                    <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                                        <Building size={16} className="text-blue-600" />
                                        <span className="text-sm font-semibold text-gray-800">Module</span>
                                    </div>
                                    <div>
                                        <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-200">
                                            {log.module_name || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                                        <MapPin size={16} className="text-blue-600" />
                                        <span className="text-sm font-semibold text-gray-800">IP Address</span>
                                    </div>
                                    <div>
                                        <code className="bg-gray-100 px-3 py-1 rounded text-sm text-gray-800 font-mono border">
                                            {log.ip_address || 'N/A'}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description Card */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
                                <h3 className="flex items-center gap-3 text-lg font-semibold text-white">
                                    <FileText size={20} />
                                    Description & Details
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <p className="text-gray-800 leading-relaxed font-medium">
                                        {log.description || 'No description available'}
                                    </p>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Database size={16} className="text-gray-600" />
                                            <span className="text-sm font-semibold text-gray-800">Table:</span>
                                            <span className="text-sm text-gray-700 font-mono">{log.table_name || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Hash size={16} className="text-gray-600" />
                                            <span className="text-sm font-semibold text-gray-800">Record ID:</span>
                                            <span className="text-sm text-gray-700 font-mono">{log.record_id || 'N/A'}</span>
                                        </div>
                                        {log.company_id && (
                                            <div className="flex items-center gap-2">
                                                <Building size={16} className="text-gray-600" />
                                                <span className="text-sm font-semibold text-gray-800">Company ID:</span>
                                                <span className="text-sm text-gray-700 font-mono">{log.company_id}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Changes Data Card */}
                        {(log.old_values || log.new_values) && (
                            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
                                    <h3 className="flex items-center gap-3 text-lg font-semibold text-white">
                                        <Shield size={20} />
                                        Data Changes
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {log.old_values && (
                                            <div className="rounded-lg overflow-hidden border border-red-200">
                                                <h4 className="bg-red-50 text-red-800 px-4 py-3 font-semibold text-sm border-b border-red-200">
                                                    📋 Previous Data
                                                </h4>
                                                <pre className="bg-red-50 p-4 text-xs leading-relaxed overflow-x-auto max-h-80 overflow-y-auto text-red-800 font-mono">
                                                    {formatJsonData(log.old_values)}
                                                </pre>
                                            </div>
                                        )}

                                        {log.new_values && (
                                            <div className="rounded-lg overflow-hidden border border-green-200">
                                                <h4 className="bg-green-50 text-green-800 px-4 py-3 font-semibold text-sm border-b border-green-200">
                                                    ✅ New Data
                                                </h4>
                                                <pre className="bg-green-50 p-4 text-xs leading-relaxed overflow-x-auto max-h-80 overflow-y-auto text-green-800 font-mono">
                                                    {formatJsonData(log.new_values)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Changed Fields Card */}
                        {log.changed_fields && (
                            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                                    <h3 className="flex items-center gap-3 text-lg font-semibold text-white">
                                        <Shield size={20} />
                                        Changed Fields Summary
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {Object.entries(parseJsonData(log.changed_fields) || {}).map(([field, changes]) => (
                                            <div key={field} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Hash size={14} className="text-purple-600" />
                                                    <span className="font-semibold text-gray-800">{field}</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="text-xs font-semibold text-red-600">OLD:</span>
                                                        <p className="text-sm text-gray-700 font-mono bg-red-50 p-2 rounded mt-1">
                                                            {changes.old || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-semibold text-green-600">NEW:</span>
                                                        <p className="text-sm text-gray-700 font-mono bg-green-50 p-2 rounded mt-1">
                                                            {changes.new || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Technical Information Card */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-600 to-gray-800 px-6 py-4">
                                <h3 className="flex items-center gap-3 text-lg font-semibold text-white">
                                    <Database size={20} />
                                    Technical Information
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <span className="text-sm font-semibold text-gray-800">Session ID</span>
                                        <code className="block bg-gray-100 p-2 rounded text-xs text-gray-700 font-mono break-all">
                                            {log.session_id || 'N/A'}
                                        </code>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-sm font-semibold text-gray-800">User Agent</span>
                                        <code className="block bg-gray-100 p-2 rounded text-xs text-gray-700 font-mono break-all">
                                            {log.user_agent || 'N/A'}
                                        </code>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-sm font-semibold text-gray-800">Location ID</span>
                                        <code className="block bg-gray-100 p-2 rounded text-xs text-gray-700 font-mono">
                                            {log.location_id || 'N/A'}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </AppLayout>
    );
}
