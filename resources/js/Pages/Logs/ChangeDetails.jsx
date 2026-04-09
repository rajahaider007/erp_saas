import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';
import AppLayout from '../../Layouts/AppLayout';
import { ArrowLeft, Clock, User, FileText, Eye, MapPin, Shield, Database, Hash, Building } from 'lucide-react';

export default function ChangeDetails({ log }) {
    const { t } = useTranslations();
    const formatDate = (dateString) => new Date(dateString).toLocaleString();

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
            CREATE: 'bg-green-100 text-green-700 border-green-300',
            UPDATE: 'bg-blue-100 text-blue-700 border-blue-300',
            DELETE: 'bg-red-100 text-red-700 border-red-300',
            POST: 'bg-purple-100 text-purple-700 border-purple-300',
            UNPOST: 'bg-orange-100 text-orange-700 border-orange-300',
            APPROVE: 'bg-emerald-100 text-emerald-700 border-emerald-300',
            REJECT: 'bg-rose-100 text-rose-700 border-rose-300',
        };
        return classes[actionType] || 'bg-gray-100 text-gray-700 border-gray-300';
    };

    const changedFieldsObj = parseJsonData(log.changed_fields) || {};

    return (
        <AppLayout>
            <Head title={t('logs.change_details.change_details')} />

            <div className="form-theme-system change-details-container min-h-screen p-6">
                <div className="manager-header">
                    <div className="header-content">
                        <div className="header-info" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <Link
                                href={route('logs.activity')}
                                className="cd-back"
                                title={t('logs.change_details.back_to_activity_logs')}
                            >
                                <ArrowLeft size={20} />
                            </Link>
                            <div className="header-text">
                                <h1 className="header-title">
                                    <FileText className="header-icon" size={24} />
                                    {t('logs.change_details.change_details')}
                                </h1>
                                <p className="header-subtitle">{t('logs.change_details.detailed_subtitle')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="main-content">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="cd-panel">
                            <div className="cd-panel__head cd-panel__head--blue">
                                <Eye size={20} />
                                {t('logs.change_details.basic_information')}
                            </div>
                            <div className="cd-panel__body cd-panel__body--stack">
                                <div className="cd-row">
                                    <div className="cd-label">
                                        <Clock size={16} />
                                        <span>{t('logs.change_details.timestamp')}</span>
                                    </div>
                                    <div className="cd-value cd-value--strong">{formatDate(log.created_at)}</div>
                                </div>

                                <div className="cd-row">
                                    <div className="cd-label">
                                        <User size={16} />
                                        <span>{t('logs.change_details.user')}</span>
                                    </div>
                                    <div>
                                        <div className="cd-value cd-value--strong">{log.user_name || 'System'}</div>
                                        <div className="cd-value cd-value--small">{log.user_email || '—'}</div>
                                    </div>
                                </div>

                                <div className="cd-row">
                                    <div className="cd-label">
                                        <FileText size={16} />
                                        <span>{t('logs.change_details.action')}</span>
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold border inline-block ${getActionBadgeClass(log.action_type)}`}>
                                            {log.action_type}
                                        </span>
                                    </div>
                                </div>

                                <div className="cd-row">
                                    <div className="cd-label">
                                        <Building size={16} />
                                        <span>{t('logs.change_details.module')}</span>
                                    </div>
                                    <div>
                                        <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200 text-sm font-semibold border border-blue-200 dark:border-blue-800 inline-block">
                                            {log.module_name || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <div className="cd-row">
                                    <div className="cd-label">
                                        <MapPin size={16} />
                                        <span>{t('logs.change_details.ip_address')}</span>
                                    </div>
                                    <div>
                                        <code className="cd-code">{log.ip_address || 'N/A'}</code>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="cd-panel">
                            <div className="cd-panel__head cd-panel__head--green">
                                <FileText size={20} />
                                {t('logs.change_details.description_details')}
                            </div>
                            <div className="cd-panel__body">
                                <div className="cd-stack-sm">
                                    <p className="cd-lead">{log.description || t('logs.change_details.no_description')}</p>
                                    <div className="cd-inset">
                                        <div className="cd-inset-row">
                                            <Database size={16} />
                                            <span className="cd-value cd-value--strong">{t('logs.change_details.table')}</span>
                                            <span className="cd-value font-mono">{log.table_name || 'N/A'}</span>
                                        </div>
                                        <div className="cd-inset-row">
                                            <Hash size={16} />
                                            <span className="cd-value cd-value--strong">{t('logs.change_details.record_id')}</span>
                                            <span className="cd-value font-mono">{log.record_id ?? 'N/A'}</span>
                                        </div>
                                        {log.company_id ? (
                                            <div className="cd-inset-row">
                                                <Building size={16} />
                                                <span className="cd-value cd-value--strong">{t('logs.change_details.company_id')}</span>
                                                <span className="cd-value font-mono">{log.company_id}</span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {(log.old_values || log.new_values) && (
                            <div className="cd-panel lg:col-span-2">
                                <div className="cd-panel__head cd-panel__head--diff">
                                    <Shield size={20} />
                                    {t('logs.change_details.data_changes')}
                                </div>
                                <div className="cd-panel__body">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {log.old_values && (
                                            <div className="cd-diff">
                                                <h4 className="cd-diff__title cd-diff__title--old">{t('logs.change_details.previous_data')}</h4>
                                                <pre className="cd-diff__pre cd-diff__pre--old">{formatJsonData(log.old_values)}</pre>
                                            </div>
                                        )}
                                        {log.new_values && (
                                            <div className="cd-diff">
                                                <h4 className="cd-diff__title cd-diff__title--new">{t('logs.change_details.new_data')}</h4>
                                                <pre className="cd-diff__pre cd-diff__pre--new">{formatJsonData(log.new_values)}</pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {log.changed_fields && (
                            <div className="cd-panel lg:col-span-2">
                                <div className="cd-panel__head cd-panel__head--fields">
                                    <Shield size={20} />
                                    {t('logs.change_details.changed_fields_summary')}
                                </div>
                                <div className="cd-panel__body">
                                    <div className="cd-stack-sm">
                                        {Object.entries(changedFieldsObj).map(([field, changes]) => (
                                            <div key={field} className="cd-field-card">
                                                <div className="cd-field-card__name">
                                                    <Hash size={14} />
                                                    <span>{field}</span>
                                                </div>
                                                <div className="cd-field-grid">
                                                    <div>
                                                        <span className="cd-field-old-label">{t('logs.change_details.old')}</span>
                                                        <p className="cd-field-value cd-field-value--old">{changes?.old ?? 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="cd-field-new-label">{t('logs.change_details.new')}</span>
                                                        <p className="cd-field-value cd-field-value--new">{changes?.new ?? 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="cd-panel lg:col-span-2">
                            <div className="cd-panel__head cd-panel__head--technical">
                                <Database size={20} />
                                {t('logs.change_details.technical_information')}
                            </div>
                            <div className="cd-panel__body">
                                <div className="cd-tech-grid">
                                    <div>
                                        <span className="cd-tech-label">{t('logs.change_details.session_id')}</span>
                                        <code className="cd-code cd-code--block">{log.session_id || 'N/A'}</code>
                                    </div>
                                    <div>
                                        <span className="cd-tech-label">{t('logs.change_details.user_agent')}</span>
                                        <code className="cd-code cd-code--block">{log.user_agent || 'N/A'}</code>
                                    </div>
                                    <div>
                                        <span className="cd-tech-label">{t('logs.change_details.location_id')}</span>
                                        <code className="cd-code cd-code--block">{log.location_id ?? 'N/A'}</code>
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
