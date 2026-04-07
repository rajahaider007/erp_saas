import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';
import { 
  User, Mail, Phone, MapPin, Building, Users, 
  Shield, Calendar, Clock, Globe, DollarSign, 
  Palette, Edit, ArrowLeft, UserCheck, UserX
} from 'lucide-react';
import App from "../../App.jsx";

const UserShow = () => {
  const { user } = usePage().props;
  const { t } = useTranslations();

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    const sk = status ? `common.status.${status}` : '';
    const translated = sk ? t(sk) : '';
    const label = translated && translated !== sk ? translated : status || '';

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {label}
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
    const rk = role ? `system.users.show.roles.${role}` : '';
    const translated = rk ? t(rk) : '';
    const label = translated && translated !== rk ? translated : role?.replace(/_/g, ' ') || '';

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleClasses[role] || 'bg-gray-100 text-gray-800'}`}>
        {label}
      </span>
    );
  };

  return (
    <App>
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <h1 className="form-title">{t('system.users.show.user_details')}</h1>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="input-group">
                <label className="input-label">{t('system.users.show.name')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{user.fname} {user.mname} {user.lname}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.users.show.login_id')}</label>
                <div className="input-wrapper">
                  <div className="form-input">@{user.loginid}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.users.show.email')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{user.email}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.users.show.phone')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{user.phone || t('common.labels.not_provided')}</div>
                </div>
              </div>
            </div>
            <div>
              <div className="input-group">
                <label className="input-label">{t('system.users.show.role')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{getRoleBadge(user.role)}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.users.show.status')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{getStatusBadge(user.status)}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.users.show.company')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{user.company?.company_name || t('common.labels.not_assigned')}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.users.show.location')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{user.location?.location_name || t('common.labels.not_assigned')}</div>
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
