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
          <div className="data-table">
            <table className="table">
              <thead>
                <tr>
                  <th className="checkbox-column">
                    <input type="checkbox" className="table-checkbox" />
                  </th>
                  <th className="sortable">
                    ID
                  </th>
                  <th className="sortable">
                    USER INFO
                    <svg className="sort-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 12l5-5 5 5H5z" />
                    </svg>
                  </th>
                  <th className="sortable">
                    STATUS
                    <svg className="sort-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 12l5-5 5 5H5z" />
                    </svg>
                  </th>
                  <th className="sortable">
                    UPDATED
                    <svg className="sort-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 12l5-5 5 5H5z" />
                    </svg>
                  </th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="checkbox-column">
                      <input type="checkbox" className="table-checkbox" />
                    </td>
                    <td>
                      <Link href={`/system/users/${user.id}`} className="table-link">
                        #{user.id}
                      </Link>
                    </td>
                    <td>
                      <div className="table-cell-content">
                        <div className="table-icon">
                          <UserIcon size={16} />
                        </div>
                        <div className="table-text">
                          <div className="table-text-primary">
                            {user.fname} {user.mname} {user.lname}
                          </div>
                          <div className="table-text-secondary">
                            @{user.loginid}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="status-badge status-active">
                        <div className="status-dot"></div>
                        {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
                      </div>
                    </td>
                    <td>
                      <div className="table-date">
                        <Calendar size={16} />
                        {new Date(user.updated_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          href={`/system/users/${user.id}`}
                          className="action-btn action-view"
                          title="View User"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/system/users/${user.id}/edit`}
                          className="action-btn action-edit"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          className="action-btn action-copy"
                          title="Duplicate User"
                        >
                          <MoreVertical size={16} />
                        </button>
                        <button
                          className="action-btn action-delete"
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
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating a new user.'}
              </p>
              {(!searchTerm && statusFilter === 'all' && roleFilter === 'all') && (
                <div className="mt-6">
                  <Link
                    href="/system/users/create"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New User
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="table-pagination">
          <div className="pagination-info">
            <span>Showing {users?.from || 1} to {users?.to || users?.data?.length || 0} of {users?.total || users?.data?.length || 0} entries</span>
            <div className="pagination-per-page">
              <span>Show:</span>
              <input type="number" value="25" className="pagination-input" />
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
            <button className="pagination-btn pagination-btn-active">1</button>
            <button className="pagination-btn" disabled>
              <span>&raquo;</span>
            </button>
            <button className="pagination-btn" disabled>
              <span>&raquo;&raquo;</span>
            </button>
            <div className="pagination-goto">
              <span>Go to:</span>
              <input type="number" value="1" className="pagination-input" />
              <span>of 1</span>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
};

export default UsersIndex;
