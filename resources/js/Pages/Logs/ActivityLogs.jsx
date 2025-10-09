import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { FileText, Search, Calendar, Filter, Eye, RotateCcw, Download, Activity, User, Clock, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import CustomDatePicker from '../../Components/DatePicker/DatePicker';

export default function ActivityLogs({ logs, users, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [module, setModule] = useState(filters.module || '');
    const [action, setAction] = useState(filters.action || '');
    const [userId, setUserId] = useState(filters.user_id || '');
    const [fromDate, setFromDate] = useState(filters.from_date ? new Date(filters.from_date) : null);
    const [toDate, setToDate] = useState(filters.to_date ? new Date(filters.to_date) : null);
    const [perPage, setPerPage] = useState(filters.per_page || 25);

    const handleFilter = () => {
        console.log('Applying filters:', {
            search,
            module,
            action,
            user_id: userId,
            from_date: fromDate ? fromDate.toISOString().split('T')[0] : '',
            to_date: toDate ? toDate.toISOString().split('T')[0] : '',
            per_page: perPage
        });
        
        router.get(route('logs.activity'), {
            search,
            module,
            action,
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
        console.log('Resetting filters');
        setSearch('');
        setModule('');
        setAction('');
        setUserId('');
        setFromDate(null);
        setToDate(null);
        setPerPage(25);
        
        router.get(route('logs.activity'), {}, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const getActionBadgeClass = (actionType) => {
        const classes = {
            'CREATE': 'bg-green-100 text-green-700 border-green-300',
            'UPDATE': 'bg-blue-100 text-blue-700 border-blue-300',
            'DELETE': 'bg-red-100 text-red-700 border-red-300',
            'POST': 'bg-purple-100 text-purple-700 border-purple-300',
            'UNPOST': 'bg-yellow-100 text-yellow-700 border-yellow-300',
            'APPROVE': 'bg-emerald-100 text-emerald-700 border-emerald-300',
            'REJECT': 'bg-rose-100 text-rose-700 border-rose-300'
        };
        return classes[actionType] || 'bg-gray-100 text-gray-700 border-gray-300';
    };

    return (
        <AppLayout>
            <Head title="Activity Logs" />

            <div className="form-theme-system min-h-screen p-6">
                {/* Header */}
                <div className="manager-header">
                    <div className="header-main">
                        <div className="title-section">
                            <h1 className="page-title">
                                <Activity className="title-icon" size={32} />
                                Activity Logs
                            </h1>
                            <p className="text-secondary mt-2">View all system activities and changes</p>
                            <div className="stats-summary">
                                <div className="stat-item">
                                    <FileText size={16} />
                                    <span>Total: {logs.total} records</span>
                                </div>
                            </div>
                        </div>
                        <div className="header-actions">
                            <Link href={route('logs.deleted-items')} className="btn btn-secondary btn-sm">
                                <RotateCcw size={16} />
                                Deleted Items
                            </Link>
                            <Link href={route('logs.security')} className="btn btn-secondary btn-sm">
                                <Shield size={16} />
                                Security Logs
                            </Link>
                            <Link href={route('logs.reports')} className="btn btn-primary btn-sm">
                                <Download size={16} />
                                Reports
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="filter-group">
                        {/* Search */}
                        <div className="search-container">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search logs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                            />
                        </div>

                        {/* Module Filter */}
                        <select
                            className="filter-select"
                            value={module}
                            onChange={(e) => setModule(e.target.value)}
                        >
                            <option value="">All Modules</option>
                            <option value="Accounts">Accounts</option>
                            <option value="System">System</option>
                            <option value="Recovery">Recovery</option>
                        </select>

                        {/* Action Filter */}
                        <select
                            className="filter-select"
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                        >
                            <option value="">All Actions</option>
                            <option value="CREATE">CREATE</option>
                            <option value="UPDATE">UPDATE</option>
                            <option value="DELETE">DELETE</option>
                            <option value="POST">POST</option>
                            <option value="UNPOST">UNPOST</option>
                            <option value="APPROVE">APPROVE</option>
                            <option value="REJECT">REJECT</option>
                        </select>

                        {/* User Filter */}
                        <select
                            className="filter-select"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                        >
                            <option value="">All Users</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="view-controls">
                        <button onClick={handleFilter} className="btn btn-primary btn-sm">
                            <Filter size={16} />
                            Apply
                        </button>
                        <button onClick={handleReset} className="btn btn-secondary btn-sm">
                            <RotateCcw size={16} />
                            Reset
                        </button>
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
                                    <th className="w-24">Module</th>
                                    <th className="w-20">Action</th>
                                    <th className="min-w-64">Description</th>
                                    <th className="w-32">IP Address</th>
                                    <th className="w-20 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.data.map((log) => (
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
                                            <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-200">
                                                {log.module_name}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getActionBadgeClass(log.action_type)}`}>
                                                {log.action_type}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="max-w-xs">
                                                <p className="text-sm text-gray-700 truncate" title={log.description || 'No description'}>
                                                    {log.description || 'No description'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Table: {log.table_name} | Record: #{log.record_id}
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
                                ))}

                                {logs.data.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-12">
                                            <div className="empty-state">
                                                <Activity size={48} className="empty-icon" />
                                                <p className="text-gray-500 mt-4">No activity logs found</p>
                                                <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs.last_page > 1 && (
                        <div className="pagination-container">
                            <div className="pagination-info">
                                <p className="results-info">
                                    Showing {logs.from} to {logs.to} of {logs.total} results
                                </p>
                            </div>

                            <div className="pagination-controls">
                                <button
                                    className="pagination-btn"
                                    disabled={logs.current_page === 1}
                                    onClick={() => router.get(logs.prev_page_url)}
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                <div className="page-numbers">
                                    {[...Array(logs.last_page)].map((_, i) => {
                                        const page = i + 1;
                                        if (
                                            page === 1 ||
                                            page === logs.last_page ||
                                            (page >= logs.current_page - 1 && page <= logs.current_page + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={page}
                                                    className={`pagination-btn ${page === logs.current_page ? 'active' : ''}`}
                                                    onClick={() => router.get(route('logs.activity', { ...filters, page }))}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        } else if (
                                            page === logs.current_page - 2 ||
                                            page === logs.current_page + 2
                                        ) {
                                            return <span key={page} className="pagination-ellipsis">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <button
                                    className="pagination-btn"
                                    disabled={logs.current_page === logs.last_page}
                                    onClick={() => router.get(logs.next_page_url)}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

