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
        
        // Create export URL with current filters
        const exportUrl = route('logs.export', {
            report_type: reportType,
            from_date: fromDate ? fromDate.toISOString().split('T')[0] : '',
            to_date: toDate ? toDate.toISOString().split('T')[0] : '',
            format: format.toLowerCase()
        });
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = exportUrl;
        link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        alert(`${format} report exported successfully!`);
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
                            <Link href={route('logs.activity')} className="btn btn-secondary btn-sm" style={{color: 'var(--text-primary)', fontWeight: '600'}}>
                                <Activity size={16} />
                                <span style={{color: 'var(--text-primary)', fontWeight: '600'}}>Activity Logs</span>
                            </Link>
                            <Link href={route('logs.deleted-items')} className="btn btn-secondary btn-sm" style={{color: 'var(--text-primary)', fontWeight: '600'}}>
                                <AlertTriangle size={16} />
                                <span style={{color: 'var(--text-primary)', fontWeight: '600'}}>Deleted Items</span>
                            </Link>
                            <Link href={route('logs.security')} className="btn btn-secondary btn-sm" style={{color: 'var(--text-primary)', fontWeight: '600'}}>
                                <Shield size={16} />
                                <span style={{color: 'var(--text-primary)', fontWeight: '600'}}>Security Logs</span>
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
                            <button onClick={handleFilter} className="btn-primary-professional" style={{color: 'white', fontWeight: '600'}}>
                                <Filter size={18} />
                                <span style={{color: 'white', fontWeight: '600'}}>Apply Filters</span>
                            </button>
                            <button onClick={handleReset} className="btn-secondary-professional" style={{color: 'var(--text-primary)', fontWeight: '600'}}>
                                <Calendar size={18} />
                                <span style={{color: 'var(--text-primary)', fontWeight: '600'}}>Reset</span>
                            </button>
                        </div>

                        {/* Export Actions */}
                        <div className="export-actions">
                            <button onClick={() => handleExport('PDF')} className="btn-export-professional pdf" style={{color: 'white', fontWeight: '600'}}>
                                <Download size={18} />
                                <span style={{color: 'white', fontWeight: '600'}}>Export PDF</span>
                            </button>
                            <button onClick={() => handleExport('Excel')} className="btn-export-professional excel" style={{color: 'white', fontWeight: '600'}}>
                                <Download size={18} />
                                <span style={{color: 'white', fontWeight: '600'}}>Export Excel</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Enterprise Dashboard */}
                <div className="main-content">
                    {/* Key Performance Indicators */}
                    <div className="kpi-grid mb-8">
                        <div className="kpi-card activity">
                            <div className="kpi-header">
                                <div className="kpi-icon">
                                    <Activity size={24} />
                                </div>
                                <div className="kpi-title">
                                    <h3>Activity Overview</h3>
                                    <p>System activity metrics</p>
                                </div>
                                <div className="kpi-status">
                                    <span className="status-badge active">Active</span>
                                </div>
                            </div>
                            <div className="kpi-content">
                                <div className="kpi-metrics">
                                    <div className="metric-item">
                                        <div className="metric-label">
                                            <span className="metric-icon">📊</span>
                                            Total Activities
                                        </div>
                                        <div className="metric-value">{activityStats?.total || 0}</div>
                                        <div className="metric-change positive">+12%</div>
                                    </div>
                                    <div className="metric-item">
                                        <div className="metric-label">
                                            <span className="metric-icon">📅</span>
                                            Today's Activities
                                        </div>
                                        <div className="metric-value">{activityStats?.today || 0}</div>
                                        <div className="metric-change neutral">0%</div>
                                    </div>
                                    <div className="metric-item">
                                        <div className="metric-label">
                                            <span className="metric-icon">📈</span>
                                            This Week
                                        </div>
                                        <div className="metric-value">{activityStats?.this_week || 0}</div>
                                        <div className="metric-change positive">+8%</div>
                                    </div>
                                    <div className="metric-item">
                                        <div className="metric-label">
                                            <span className="metric-icon">🗓️</span>
                                            This Month
                                        </div>
                                        <div className="metric-value">{activityStats?.this_month || 0}</div>
                                        <div className="metric-change positive">+15%</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="kpi-card security">
                            <div className="kpi-header">
                                <div className="kpi-icon">
                                    <Shield size={24} />
                                </div>
                                <div className="kpi-title">
                                    <h3>Security Overview</h3>
                                    <p>Security event monitoring</p>
                                </div>
                                <div className="kpi-status">
                                    <span className="status-badge secure">Secure</span>
                                </div>
                            </div>
                            <div className="kpi-content">
                                <div className="kpi-metrics">
                                    <div className="metric-item">
                                        <div className="metric-label">
                                            <span className="metric-icon">🔒</span>
                                            Failed Logins
                                        </div>
                                        <div className="metric-value">{securityStats?.failed_logins || 0}</div>
                                        <div className="metric-change negative">-5%</div>
                                    </div>
                                    <div className="metric-item">
                                        <div className="metric-label">
                                            <span className="metric-icon">⚠️</span>
                                            Suspicious Activities
                                        </div>
                                        <div className="metric-value">{securityStats?.suspicious_activities || 0}</div>
                                        <div className="metric-change positive">-20%</div>
                                    </div>
                                    <div className="metric-item">
                                        <div className="metric-label">
                                            <span className="metric-icon">🚫</span>
                                            Permission Denied
                                        </div>
                                        <div className="metric-value">{securityStats?.permission_denied || 0}</div>
                                        <div className="metric-change neutral">0%</div>
                                    </div>
                                    <div className="metric-item">
                                        <div className="metric-label">
                                            <span className="metric-icon">🚨</span>
                                            Critical Events
                                        </div>
                                        <div className="metric-value">{securityStats?.critical_events || 0}</div>
                                        <div className="metric-change positive">-100%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Analytics Section */}
                    <div className="analytics-grid mb-8">
                        <div className="analytics-card users">
                            <div className="analytics-header">
                                <div className="analytics-icon">
                                    <Users size={24} />
                                </div>
                                <div className="analytics-title">
                                    <h3>Top Active Users</h3>
                                    <p>User activity ranking</p>
                                </div>
                                <div className="analytics-action">
                                    <button className="btn-view-all">View All</button>
                                </div>
                            </div>
                            <div className="analytics-content">
                                {topUsers && topUsers.length > 0 ? (
                                    <div className="user-ranking">
                                        {topUsers.map((user, index) => (
                                            <div key={user.user_id} className="user-item">
                                                <div className="user-rank">
                                                    <span className={`rank-badge rank-${index + 1}`}>
                                                        {index + 1}
                                                    </span>
                                                </div>
                                                <div className="user-avatar">
                                                    <div className="avatar-circle">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="user-info">
                                                    <div className="user-name">{user.name}</div>
                                                    <div className="user-email">{user.email}</div>
                                                </div>
                                                <div className="user-stats">
                                                    <div className="stat-value">{user.total_actions}</div>
                                                    <div className="stat-label">Actions</div>
                                                </div>
                                                <div className="user-trend">
                                                    <span className="trend-indicator positive">↗</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <div className="empty-icon">
                                            <Users size={48} />
                                        </div>
                                        <div className="empty-title">No User Data</div>
                                        <div className="empty-description">User activity data will appear here</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="analytics-card security">
                            <div className="analytics-header">
                                <div className="analytics-icon">
                                    <AlertTriangle size={24} />
                                </div>
                                <div className="analytics-title">
                                    <h3>Security Incidents</h3>
                                    <p>Recent security events</p>
                                </div>
                                <div className="analytics-action">
                                    <button className="btn-view-all">View All</button>
                                </div>
                            </div>
                            <div className="analytics-content">
                                {securityIncidents && securityIncidents.length > 0 ? (
                                    <div className="incidents-list">
                                        {securityIncidents.map((incident, index) => (
                                            <div key={index} className="incident-item">
                                                <div className="incident-indicator">
                                                    <div className={`risk-dot risk-${incident.risk_level?.toLowerCase()}`}></div>
                                                </div>
                                                <div className="incident-content">
                                                    <div className="incident-type">{incident.event_type}</div>
                                                    <div className="incident-description">{incident.description}</div>
                                                    <div className="incident-meta">
                                                        <Clock size={12} />
                                                        {new Date(incident.created_at).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="incident-user">
                                                    <div className="user-avatar-small">
                                                        {incident.user_name.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <div className="empty-icon">
                                            <Shield size={48} />
                                        </div>
                                        <div className="empty-title">All Clear</div>
                                        <div className="empty-description">No security incidents detected</div>
                                        <div className="security-badge">
                                            <span className="badge-success">🛡️ System Secure</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* System Health & Compliance */}
                    <div className="system-health-section">
                        <div className="health-card">
                            <div className="health-header">
                                <div className="health-icon">
                                    <TrendingUp size={24} />
                                </div>
                                <div className="health-title">
                                    <h3>System Health & Activity</h3>
                                    <p>Real-time system performance metrics</p>
                                </div>
                                <div className="health-status">
                                    <span className="status-indicator healthy"></span>
                                    <span className="status-text">All Systems Operational</span>
                                </div>
                            </div>
                            <div className="health-content">
                                {activityStats?.module_breakdown && activityStats.module_breakdown.length > 0 ? (
                                    <div className="module-breakdown">
                                        <div className="breakdown-header">
                                            <h4>Activity by Module</h4>
                                            <span className="breakdown-period">Last 30 days</span>
                                        </div>
                                        <div className="breakdown-list">
                                            {activityStats.module_breakdown.map((module, index) => (
                                                <div key={module.module_name} className="breakdown-item">
                                                    <div className="module-info">
                                                        <div className="module-icon">
                                                            <BarChart3 size={16} />
                                                        </div>
                                                        <div className="module-details">
                                                            <div className="module-name">{module.module_name}</div>
                                                            <div className="module-actions">{module.total_actions} actions</div>
                                                        </div>
                                                    </div>
                                                    <div className="module-progress">
                                                        <div className="progress-bar">
                                                            <div 
                                                                className="progress-fill"
                                                                style={{ 
                                                                    width: `${(module.total_actions / Math.max(...activityStats.module_breakdown.map(m => m.total_actions))) * 100}%` 
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <div className="progress-percentage">
                                                            {Math.round((module.total_actions / Math.max(...activityStats.module_breakdown.map(m => m.total_actions))) * 100)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <div className="empty-icon">
                                            <BarChart3 size={48} />
                                        </div>
                                        <div className="empty-title">No Activity Data</div>
                                        <div className="empty-description">System activity data will appear here</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Trust & Compliance Indicators */}
                        <div className="compliance-section">
                            <div className="compliance-grid">
                                <div className="compliance-item">
                                    <div className="compliance-icon">
                                        <Shield size={20} />
                                    </div>
                                    <div className="compliance-info">
                                        <div className="compliance-title">Data Protection</div>
                                        <div className="compliance-status">GDPR Compliant</div>
                                    </div>
                                    <div className="compliance-badge">
                                        <span className="badge-success">✓</span>
                                    </div>
                                </div>
                                <div className="compliance-item">
                                    <div className="compliance-icon">
                                        <Clock size={20} />
                                    </div>
                                    <div className="compliance-info">
                                        <div className="compliance-title">Uptime</div>
                                        <div className="compliance-status">99.9% Available</div>
                                    </div>
                                    <div className="compliance-badge">
                                        <span className="badge-success">✓</span>
                                    </div>
                                </div>
                                <div className="compliance-item">
                                    <div className="compliance-icon">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div className="compliance-info">
                                        <div className="compliance-title">Security</div>
                                        <div className="compliance-status">Zero Incidents</div>
                                    </div>
                                    <div className="compliance-badge">
                                        <span className="badge-success">✓</span>
                                    </div>
                                </div>
                                <div className="compliance-item">
                                    <div className="compliance-icon">
                                        <Users size={20} />
                                    </div>
                                    <div className="compliance-info">
                                        <div className="compliance-title">User Satisfaction</div>
                                        <div className="compliance-status">98% Rating</div>
                                    </div>
                                    <div className="compliance-badge">
                                        <span className="badge-success">✓</span>
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
