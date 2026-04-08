import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';
import { usePermissions } from '../../../hooks/usePermissions';
import {
  Mail,
  Phone,
  Building,
  Users,
  Shield,
  Clock,
  Globe,
  DollarSign,
  Palette,
  Edit,
  ArrowLeft,
  MapPin,
} from 'lucide-react';
import App from "../../App.jsx";

const USERS_ROUTE = '/system/users';

const UserShow = () => {
  const { user } = usePage().props;
  const { t, locale } = useTranslations();
  const { canEdit } = usePermissions();

  const ts = (key) => t(`system.users.show.${key}`);

  const formatDateTime = (iso) => {
    if (!iso) return '';
    const loc = locale === 'ur' ? 'ur-PK' : undefined;
    return new Date(iso).toLocaleString(loc);
  };

  const statusLabel = (status) => {
    if (!status) return '';
    const sk = `common.status.${status}`;
    const tr = t(sk);
    return tr !== sk ? tr : status;
  };

  const roleLabel = (role) => {
    if (!role) return '';
    const rk = `system.users.show.roles.${role}`;
    const tr = t(rk);
    return tr !== rk ? tr : String(role).replace(/_/g, ' ');
  };

  const languageLabel = (code) => {
    if (!code) return t('common.labels.not_provided');
    const k = `system.users.create.lang_${code}`;
    const tr = t(k);
    return tr !== k ? tr : code;
  };

  const themeLabel = (themeKey) => {
    if (!themeKey) return t('common.labels.not_provided');
    const k = `system.users.create.theme_${themeKey}`;
    const tr = t(k);
    return tr !== k ? tr : themeKey;
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    const label = statusLabel(status);

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          statusClasses[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {label}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleClasses = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      manager: 'bg-indigo-100 text-indigo-800',
      user: 'bg-gray-100 text-gray-800',
    };
    const label = roleLabel(role);

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          roleClasses[role] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {label}
      </span>
    );
  };

  return (
    <App>
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Link
              href="/system/users"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft size={18} />
              {t('system.users.user_rights.back_to_users')}
            </Link>
            {canEdit(USERS_ROUTE) && (
              <Link
                href={`/system/users/${user.id}/edit`}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                <Edit size={18} />
                {t('system.users.list.edit_user')}
              </Link>
            )}
          </div>

          <h1 className="form-title">{ts('user_details')}</h1>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="input-group">
                <label className="input-label">{ts('name')}</label>
                <div className="input-wrapper">
                  <div className="form-input">
                    {user.fname} {user.mname} {user.lname}
                  </div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{ts('login_id')}</label>
                <div className="input-wrapper">
                  <div className="form-input">@{user.loginid}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{ts('email')}</label>
                <div className="input-wrapper">
                  <div className="form-input flex items-center gap-2">
                    <Mail size={16} className="text-gray-400 shrink-0" />
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{ts('phone')}</label>
                <div className="input-wrapper">
                  <div className="form-input flex items-center gap-2">
                    <Phone size={16} className="text-gray-400 shrink-0" />
                    {user.phone || t('common.labels.not_provided')}
                  </div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{ts('pin_code')}</label>
                <div className="input-wrapper">
                  <div className="form-input flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400 shrink-0" />
                    {user.pincode || t('common.labels.not_provided')}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="input-group">
                <label className="input-label">{ts('role')}</label>
                <div className="input-wrapper">
                  <div className="form-input flex items-center gap-2">
                    <Shield size={16} className="text-gray-400 shrink-0" />
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{ts('status')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{getStatusBadge(user.status)}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{ts('company')}</label>
                <div className="input-wrapper">
                  <div className="form-input flex items-center gap-2">
                    <Building size={16} className="text-gray-400 shrink-0" />
                    {user.company?.company_name || t('common.labels.not_assigned')}
                  </div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{ts('location')}</label>
                <div className="input-wrapper">
                  <div className="form-input">
                    {user.location?.location_name || t('common.labels.not_assigned')}
                  </div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{ts('department')}</label>
                <div className="input-wrapper">
                  <div className="form-input flex items-center gap-2">
                    <Users size={16} className="text-gray-400 shrink-0" />
                    {user.department?.department_name || t('common.labels.not_assigned')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label">{ts('timezone')}</label>
              <div className="input-wrapper">
                <div className="form-input flex items-center gap-2">
                  <Clock size={16} className="text-gray-400 shrink-0" />
                  {user.timezone || t('common.labels.not_provided')}
                </div>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">{ts('language')}</label>
              <div className="input-wrapper">
                <div className="form-input flex items-center gap-2">
                  <Globe size={16} className="text-gray-400 shrink-0" />
                  {languageLabel(user.language)}
                </div>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">{ts('currency')}</label>
              <div className="input-wrapper">
                <div className="form-input flex items-center gap-2">
                  <DollarSign size={16} className="text-gray-400 shrink-0" />
                  {user.currency || t('common.labels.not_provided')}
                </div>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">{ts('theme')}</label>
              <div className="input-wrapper">
                <div className="form-input flex items-center gap-2">
                  <Palette size={16} className="text-gray-400 shrink-0" />
                  {themeLabel(user.theme)}
                </div>
              </div>
            </div>
            {user.created_at && (
              <div className="input-group">
                <label className="input-label">{ts('member_since')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{formatDateTime(user.created_at)}</div>
                </div>
              </div>
            )}
            {user.updated_at && (
              <div className="input-group">
                <label className="input-label">{ts('last_updated')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{formatDateTime(user.updated_at)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </App>
  );
};

export default UserShow;
