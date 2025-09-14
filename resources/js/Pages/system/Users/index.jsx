import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
  Users, Plus, Edit, Eye, Trash2, Search, 
  Filter, MoreVertical, Building, MapPin, Shield,
  Mail, Phone, Calendar, User as UserIcon, RefreshCcw
} from 'lucide-react';
import App from "../../App.jsx";

const UsersIndex = () => {
  const { users } = usePage().props;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Filter users based on search and filters
  const filteredUsers = users?.data?.filter(user => {
    const matchesSearch = 
      user.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.loginid?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  }) || [];

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleClasses = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      manager: 'bg-indigo-100 text-indigo-800',
      user: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleClasses[role] || 'bg-gray-100 text-gray-800'}`}>
        {role?.replace('_', ' ').charAt(0).toUpperCase() + role?.replace('_', ' ').slice(1)}
      </span>
    );
  };

  return (
    <App>
      <div className="advanced-module-manager">
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title">
                <Users className="title-icon" />
                {usePage().props?.pageTitle || 'Users'}
              </h1>
              <div className="stats-summary">
                <div className="stat-item">
                  <span>{users?.total || 0} Total</span>
                </div>
                <div className="stat-item">
                  <span>{users?.data?.filter(u => u.status === 'active').length || 0} Active</span>
                </div>
                <div className="stat-item">
                  <span>{users?.data?.filter(u => u.status === 'inactive').length || 0} Inactive</span>
                </div>
                <div className="stat-item">
                  <span>{users?.data?.filter(u => u.role === 'admin').length || 0} Admins</span>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button
                className="btn btn-icon"
                onClick={() => window.location.reload()}
                title="Refresh"
              >
                <RefreshCcw size={20} />
              </button>
              <Link
                href="/system/users/create"
                className="btn btn-primary"
              >
                <Plus size={20} />
                Add User
              </Link>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="filters-bar">
            <div className="filter-group">
              <div className="search-container">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
              <select
                className="filter-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
            </div>
            <div className="view-controls">
              <button className="btn btn-icon" title="Show/Hide Columns">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="data-table-container">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="checkbox-cell">
                    <input type="checkbox" className="checkbox" />
                  </th>
                  <th className="sortable">
                    <div className="th-content">
                      ID
                      <svg className="sort-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 12l5-5 5 5H5z" />
                      </svg>
                    </div>
                  </th>
                  <th className="sortable">
                    <div className="th-content">
                      USER INFO
                      <svg className="sort-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 12l5-5 5 5H5z" />
                      </svg>
                    </div>
                  </th>
                  <th className="sortable">
                    <div className="th-content">
                      STATUS
                      <svg className="sort-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 12l5-5 5 5H5z" />
                      </svg>
                    </div>
                  </th>
                  <th className="sortable">
                    <div className="th-content">
                      UPDATED
                      <svg className="sort-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 12l5-5 5 5H5z" />
                      </svg>
                    </div>
                  </th>
                  <th className="actions-header">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="table-row">
                    <td>
                      <input type="checkbox" className="checkbox" />
                    </td>
                    <td>
                      <span className="user-id">#{user.id}</span>
                    </td>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          <UserIcon size={16} />
                        </div>
                        <div className="user-details">
                          <div className="user-name">
                            {user.fname} {user.mname} {user.lname}
                          </div>
                          <div className="user-login">@{user.loginid}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="status-container">
                        <span className={`status-badge status-${user.status}`}>
                          <div className="status-dot"></div>
                          {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <Calendar size={14} />
                        <span>{new Date(user.updated_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <Link
                          href={`/system/users/${user.id}`}
                          className="action-btn view"
                          title="View User"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/system/users/${user.id}/edit`}
                          className="action-btn edit"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          className="action-btn copy"
                          title="More Options"
                        >
                          <MoreVertical size={16} />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Delete User"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this user?')) {
                              // Handle delete
                            }
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <Users className="empty-icon" />
              <h3>No users found</h3>
              <p>Try adjusting your filters or search criteria</p>
              <Link href="/system/users/create" className="btn btn-primary">
                <Plus size={20} />
                Add Your First User
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="pagination-container">
          <div className="pagination-info">
            <div className="results-info">
              Showing {users?.from || 1} to {users?.to || users?.data?.length || 0} of {users?.total || users?.data?.length || 0} entries
            </div>
            <div className="page-size-selector">
              <span>Show:</span>
              <select className="page-size-select">
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span>per page</span>
            </div>
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn" disabled>
              <span>&laquo;&laquo;</span>
            </button>
            <button className="pagination-btn" disabled>
              <span>&laquo;</span>
            </button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn" disabled>
              <span>&raquo;</span>
            </button>
            <button className="pagination-btn" disabled>
              <span>&raquo;&raquo;</span>
            </button>
          </div>
          <div className="quick-jump">
            <span>Go to:</span>
            <input type="number" value="1" className="jump-input" />
            <span>of 1</span>
          </div>
        </div>
      </div>
    </App>
  );
};

export default UsersIndex;
