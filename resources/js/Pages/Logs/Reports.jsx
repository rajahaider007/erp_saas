import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { BarChart3, Download, Calendar, Filter, TrendingUp, Users, Shield, Clock, Activity, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import CustomDatePicker from '../../Components/DatePicker/DatePicker';

export default function Reports({ 
    activityStats, 
    securityStats, 
    topUsers, 
    securityIncidents, 
    filters 
}) {
    const [fromDate, setFromDate] = useState(filters.from_date ? new Date(filters.from_date) : null);
    const [toDate, setToDate] = useState(filters.to_date ? new Date(filters.to_date) : null);
    const [reportType, setReportType] = useState(filters.report_type || 'overview');

    const handleFilter = () => {
        console.log('Applying report filters:', {
            from_date: fromDate ? fromDate.toISOString().split('T')[0] : '',
            to_date: toDate ? toDate.toISOString().split('T')[0] : '',
            report_type: reportType
        });
        
        router.get(route('logs.reports'), {
            from_date: fromDate ? fromDate.toISOString().split('T')[0] : '',
            to_date: toDate ? toDate.toISOString().split('T')[0] : '',
            report_type: reportType
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleReset = () => {
        console.log('Resetting report filters');
        setFromDate(null);
        setToDate(null);
        setReportType('overview');
        
        router.get(route('logs.reports'), {}, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleExport = (format) => {
        console.log(`Exporting ${reportType} report as ${format}`);
        // Implementation for export functionality
        alert(`Exporting ${reportType} report as ${format}...`);
    };

    return (
        <AppLayout>
            <Head title="Log Reports" />

            <div className="form-theme-system min-h-screen p-6">
                {/* Header */}
                <div className="manager-header">
                    <div className="header-content">
                        <div className="header-info">
                            <div className="header-text">
                                <h1 className="header-title">
                                    <BarChart3 className="header-icon" size={24} />
                                    Log Reports & Analytics
                                </h1>
                                <p className="header-subtitle">
                                    Comprehensive analysis of system activities and security events
                                </p>
                            </div>
                        </div>
                        <div className="header-actions">
                            <Link href={route('logs.activity')} className="btn btn-secondary btn-sm">
                                <Activity size={16} />
                                Activity Logs
                            </Link>
                            <Link href={route('logs.deleted-items')} className="btn btn-secondary btn-sm">
                                <AlertTriangle size={16} />
                                Deleted Items
                            </Link>
                            <Link href={route('logs.security')} className="btn btn-secondary btn-sm">
                                <Shield size={16} />
                                Security Logs
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Professional Filters */}
                <div className="professional-filters-container">
                    <div className="filters-row">
                        {/* Report Type Filter */}
                        <div className="filter-group">
                            <label className="filter-label">Report Type</label>
                            <select
                                className="professional-select"
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <option value="overview">📊 Overview Report</option>
                                <option value="activity">📈 Activity Report</option>
                                <option value="security">🔒 Security Report</option>
                                <option value="user">👥 User Activity Report</option>
                            </select>
                        </div>

                        {/* Date Range Filter */}
                        <div className="filter-group">
                            <label className="filter-label">Date Range</label>
                            <div className="date-range-wrapper">
                                <CustomDatePicker
                                    selected={fromDate}
                                    onChange={setFromDate}
                                    placeholderText="From Date"
                                    className="professional-date-input"
                                />
                                <span className="date-separator">to</span>
                                <CustomDatePicker
                                    selected={toDate}
                                    onChange={setToDate}
                                    placeholderText="To Date"
                                    className="professional-date-input"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="filter-actions">
                            <button onClick={handleFilter} className="btn-primary-professional">
                                <Filter size={18} />
                                <span>Apply Filters</span>
                            </button>
                            <button onClick={handleReset} className="btn-secondary-professional">
                                <Calendar size={18} />
                                <span>Reset</span>
                            </button>
                        </div>

                        {/* Export Actions */}
                        <div className="export-actions">
                            <button onClick={() => handleExport('PDF')} className="btn-export-professional pdf">
                                <Download size={18} />
                                <span>Export PDF</span>
                            </button>
                            <button onClick={() => handleExport('Excel')} className="btn-export-professional excel">
                                <Download size={18} />
                                <span>Export Excel</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="main-content">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Activity Statistics */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                                    <Activity size={20} />
                                    Activity Overview
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <div className="text-sm text-gray-600 font-medium">Total Activities</div>
                                    <div className="text-xl font-bold text-gray-800">{activityStats?.total || 0}</div>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <div className="text-sm text-gray-600 font-medium">Today's Activities</div>
                                    <div className="text-xl font-bold text-blue-600">{activityStats?.today || 0}</div>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <div className="text-sm text-gray-600 font-medium">This Week</div>
                                    <div className="text-xl font-bold text-green-600">{activityStats?.this_week || 0}</div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-600 font-medium">This Month</div>
                                    <div className="text-xl font-bold text-purple-600">{activityStats?.this_month || 0}</div>
                                </div>
                            </div>
                        </div>

                        {/* Security Statistics */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                                    <Shield size={20} />
                                    Security Overview
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <div className="text-sm text-gray-600 font-medium">Failed Logins</div>
                                    <div className="text-xl font-bold text-red-600">{securityStats?.failed_logins || 0}</div>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <div className="text-sm text-gray-600 font-medium">Suspicious Activities</div>
                                    <div className="text-xl font-bold text-orange-600">{securityStats?.suspicious_activities || 0}</div>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <div className="text-sm text-gray-600 font-medium">Permission Denied</div>
                                    <div className="text-xl font-bold text-yellow-600">{securityStats?.permission_denied || 0}</div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-600 font-medium">Critical Events</div>
                                    <div className="text-xl font-bold text-red-700">{securityStats?.critical_events || 0}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Active Users */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                                    <Users size={20} />
                                    Top Active Users
                                </h3>
                            </div>
                            <div className="p-6">
                                {topUsers && topUsers.length > 0 ? (
                                    <div className="space-y-4">
                                        {topUsers.map((user, index) => (
                                            <div key={user.user_id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-2 py-1 rounded text-xs font-semibold">
                                                        #{index + 1}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-800">{user.name}</div>
                                                    <div className="text-sm text-gray-600">{user.email}</div>
                                                </div>
                                                <div className="text-sm text-green-600 font-semibold">
                                                    {user.total_actions} actions
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Users size={48} className="mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-500">No user data available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Security Incidents */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                                    <AlertTriangle size={20} />
                                    Recent Security Incidents
                                </h3>
                            </div>
                            <div className="p-6">
                                {securityIncidents && securityIncidents.length > 0 ? (
                                    <div className="space-y-4">
                                        {securityIncidents.map((incident, index) => (
                                            <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <span className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
                                                        incident.risk_level?.toLowerCase() === 'critical' ? 'bg-red-100 text-red-700' :
                                                        incident.risk_level?.toLowerCase() === 'high' ? 'bg-orange-100 text-orange-700' :
                                                        incident.risk_level?.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                        {incident.event_type}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-800 mb-1">
                                                        {incident.description}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <Clock size={12} />
                                                        {new Date(incident.created_at).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-600 font-medium">
                                                    {incident.user_name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Shield size={48} className="mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-500">No security incidents</p>
                                        <p className="text-sm text-gray-400 mt-2">All clear! 🎉</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Summary Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                                <TrendingUp size={20} />
                                Activity Summary by Module
                            </h3>
                        </div>
                        <div className="p-6">
                            {activityStats?.module_breakdown && activityStats.module_breakdown.length > 0 ? (
                                <div className="space-y-4">
                                    {activityStats.module_breakdown.map((module, index) => (
                                        <div key={module.module_name} className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="font-semibold text-gray-800">{module.module_name}</div>
                                                <div className="text-sm text-gray-600">{module.total_actions} actions</div>
                                            </div>
                                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300" 
                                                    style={{ 
                                                        width: `${(module.total_actions / Math.max(...activityStats.module_breakdown.map(m => m.total_actions))) * 100}%` 
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-500">No activity data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </AppLayout>
    );
}
