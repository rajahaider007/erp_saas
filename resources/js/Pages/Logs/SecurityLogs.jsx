import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { Shield, Search, Calendar, Filter, Eye, AlertTriangle, User, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import CustomDatePicker from '../../Components/DatePicker/DatePicker';

export default function SecurityLogs({ logs = { data: [] }, users = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [eventType, setEventType] = useState(filters.event_type || '');
    const [riskLevel, setRiskLevel] = useState(filters.risk_level || '');
    const [userId, setUserId] = useState(filters.user_id || '');
    const [fromDate, setFromDate] = useState(filters.from_date ? new Date(filters.from_date) : null);
    const [toDate, setToDate] = useState(filters.to_date ? new Date(filters.to_date) : null);
    const [perPage, setPerPage] = useState(filters.per_page || 25);

    const handleFilter = () => {
        console.log('Applying security filters:', {
            search,
            event_type: eventType,
            risk_level: riskLevel,
            user_id: userId,
            from_date: fromDate ? fromDate.toISOString().split('T')[0] : '',
            to_date: toDate ? toDate.toISOString().split('T')[0] : '',
            per_page: perPage
        });
        
        router.get(route('logs.security'), {
            search,
            event_type: eventType,
            risk_level: riskLevel,
            user_id: userId,
            from_date: fromDate ? fromDate.toISOString().split('T')[0] : '',
            to_date: toDate ? toDate.toISOString().split('T')[0] : '',
            per_page: perPage
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleReset = () => {
        console.log('Resetting security filters');
        setSearch('');
        setEventType('');
        setRiskLevel('');
        setUserId('');
        setFromDate(null);
        setToDate(null);
        setPerPage(25);
        
        router.get(route('logs.security'), {}, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const getRiskBadgeClass = (riskLevel) => {
        const classes = {
            'LOW': 'bg-green-100 text-green-700 border-green-300',
            'MEDIUM': 'bg-yellow-100 text-yellow-700 border-yellow-300',
            'HIGH': 'bg-orange-100 text-orange-700 border-orange-300',
            'CRITICAL': 'bg-red-100 text-red-700 border-red-300'
        };
        return classes[riskLevel] || 'bg-gray-100 text-gray-700 border-gray-300';
    };

    const getEventBadgeClass = (eventType) => {
        const classes = {
            'LOGIN': 'bg-blue-100 text-blue-700 border-blue-300',
            'LOGOUT': 'bg-gray-100 text-gray-700 border-gray-300',
            'FAILED_LOGIN': 'bg-red-100 text-red-700 border-red-300',
            'PASSWORD_CHANGE': 'bg-purple-100 text-purple-700 border-purple-300',
            'PERMISSION_DENIED': 'bg-orange-100 text-orange-700 border-orange-300',
            'SUSPICIOUS_ACTIVITY': 'bg-red-100 text-red-700 border-red-300'
        };
        return classes[eventType] || 'bg-gray-100 text-gray-700 border-gray-300';
    };

    return (
        <AppLayout>
            <Head title="Security Logs" />

            <div className="form-theme-system min-h-screen p-6">
                {/* Header */}
                <div className="manager-header">
                    <div className="header-content">
                        <div className="header-info">
                            <div className="header-text">
                                <h1 className="header-title">
                                    <Shield className="header-icon" size={24} />
                                    Security Logs
                                </h1>
                                <p className="header-subtitle">
                                    Monitor security events and access attempts
                                </p>
                            </div>
                        </div>
                        <div className="header-actions">
                            <Link href={route('logs.activity')} className="btn btn-secondary btn-sm">
                                <Clock size={16} />
                                Activity Logs
                            </Link>
                            <Link href={route('logs.deleted-items')} className="btn btn-secondary btn-sm">
                                <AlertTriangle size={16} />
                                Deleted Items
                            </Link>
                            <Link href={route('logs.reports')} className="btn btn-primary btn-sm">
                                <Calendar size={16} />
                                Reports
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Professional Filters */}
                <div className="professional-filters-container">
                    <div className="filters-row">
                        {/* Search */}
                        <div className="search-container">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search security events..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                            />
                        </div>

                        {/* Event Type Filter */}
                        <div className="filter-group">
                            <label className="filter-label">Event Type</label>
                            <select
                                className="professional-select"
                                value={eventType}
                                onChange={(e) => setEventType(e.target.value)}
                            >
                                <option value="">🔍 All Events</option>
                                <option value="LOGIN">🔐 Login</option>
                                <option value="LOGOUT">🚪 Logout</option>
                                <option value="FAILED_LOGIN">❌ Failed Login</option>
                                <option value="PASSWORD_CHANGE">🔑 Password Change</option>
                                <option value="PERMISSION_DENIED">🚫 Permission Denied</option>
                                <option value="SUSPICIOUS_ACTIVITY">⚠️ Suspicious Activity</option>
                            </select>
                        </div>

                        {/* Risk Level Filter */}
                        <div className="filter-group">
                            <label className="filter-label">Risk Level</label>
                            <select
                                className="professional-select"
                                value={riskLevel}
                                onChange={(e) => setRiskLevel(e.target.value)}
                            >
                                <option value="">🎯 All Risk Levels</option>
                                <option value="LOW">🟢 Low Risk</option>
                                <option value="MEDIUM">🟡 Medium Risk</option>
                                <option value="HIGH">🟠 High Risk</option>
                                <option value="CRITICAL">🔴 Critical</option>
                            </select>
                        </div>

                        {/* User Filter */}
                        <div className="filter-group">
                            <label className="filter-label">User</label>
                            <select
                                className="professional-select"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                            >
                                <option value="">👥 All Users</option>
                                {users && users.length > 0 && users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
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
                    </div>
                </div>

                {/* Logs Table */}
                <div className="main-content">
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th className="w-40">Time</th>
                                    <th className="w-48">User</th>
                                    <th className="w-32">Event Type</th>
                                    <th className="w-24">Risk Level</th>
                                    <th className="min-w-64">Description</th>
                                    <th className="w-32">IP Address</th>
                                    <th className="w-20 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs && logs.data && logs.data.length > 0 ? logs.data.map((log) => (
                                    <tr key={log.id} className="table-row">
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-gray-400" />
                                                <div>
                                                    <div className="text-sm font-semibold">
                                                        {new Date(log.created_at).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(log.created_at).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-blue-500" />
                                                <div>
                                                    <div className="font-semibold text-sm">
                                                        {log.user_name || 'System'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {log.user_email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getEventBadgeClass(log.event_type)}`}>
                                                {log.event_type}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getRiskBadgeClass(log.risk_level)}`}>
                                                {log.risk_level}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="max-w-xs">
                                                <p className="text-sm text-gray-700 truncate" title={log.description || 'No description'}>
                                                    {log.description || 'No description'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {log.event_status === 'SUCCESS' ? '✅ Success' : '❌ Failed'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="text-sm text-gray-600">
                                            {log.ip_address}
                                        </td>
                                        <td className="text-center">
                                            <div className="flex justify-center">
                                                <Link
                                                    href={route('logs.details', log.id)}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )) : null}

                                {(!logs || !logs.data || logs.data.length === 0) && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-12">
                                            <div className="empty-state">
                                                <Shield size={48} className="empty-icon" />
                                                <p className="text-gray-500 mt-4">No security events found</p>
                                                <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs && logs.last_page && logs.last_page > 1 && (
                        <div className="pagination-container">
                            <div className="pagination-info">
                                <p className="text-sm text-gray-600">
                                    Showing {logs.from} to {logs.to} of {logs.total} results
                                </p>
                            </div>
                            <div className="pagination-controls">
                                <Link
                                    href={logs.prev_page_url}
                                    className={`pagination-btn ${!logs.prev_page_url ? 'disabled' : ''}`}
                                >
                                    <ChevronLeft size={16} />
                                    Previous
                                </Link>
                                <span className="pagination-info">
                                    Page {logs.current_page} of {logs.last_page}
                                </span>
                                <Link
                                    href={logs.next_page_url}
                                    className={`pagination-btn ${!logs.next_page_url ? 'disabled' : ''}`}
                                >
                                    Next
                                    <ChevronRight size={16} />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
