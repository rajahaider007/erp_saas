import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
  User, Mail, Phone, MapPin, Building, Users, 
  Shield, Calendar, Clock, Globe, DollarSign, 
  Palette, Edit, ArrowLeft, UserCheck, UserX
} from 'lucide-react';
import App from "../../App.jsx";

const UserShow = () => {
  const { user } = usePage().props;

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleClasses[role] || 'bg-gray-100 text-gray-800'}`}>
        {role?.replace('_', ' ').charAt(0).toUpperCase() + role?.replace('_', ' ').slice(1)}
      </span>
    );
  };

  return (
    <App>
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <h1 className="form-title">User Details</h1>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="input-group">
                <label className="input-label">Name</label>
                <div className="input-wrapper">
                  <div className="form-input">{user.fname} {user.mname} {user.lname}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Login ID</label>
                <div className="input-wrapper">
                  <div className="form-input">@{user.loginid}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <div className="input-wrapper">
                  <div className="form-input">{user.email}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Phone</label>
                <div className="input-wrapper">
                  <div className="form-input">{user.phone || 'Not provided'}</div>
                </div>
              </div>
            </div>
            <div>
              <div className="input-group">
                <label className="input-label">Role</label>
                <div className="input-wrapper">
                  <div className="form-input">{getRoleBadge(user.role)}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Status</label>
                <div className="input-wrapper">
                  <div className="form-input">{getStatusBadge(user.status)}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Company</label>
                <div className="input-wrapper">
                  <div className="form-input">{user.company?.company_name || 'Not assigned'}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Location</label>
                <div className="input-wrapper">
                  <div className="form-input">{user.location?.location_name || 'Not assigned'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
};

export default UserShow;
