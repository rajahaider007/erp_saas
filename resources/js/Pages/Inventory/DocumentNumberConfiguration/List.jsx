import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  RefreshCcw,
  Database,
  Hash,
} from 'lucide-react';
import App from '../../App.jsx';
import { router, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { useTranslations } from '@/hooks/useTranslations';

/** Match Purchase Requisition list / form-themes SweetAlert2 dark styling */
const swalThemed = {
  background: 'rgba(30, 41, 59, 0.95)',
  color: '#F1F5F9',
  backdrop: 'rgba(0, 0, 0, 0.8)',
  customClass: {
    popup: 'swal-dark-theme',
    title: 'swal-dark-title',
    content: 'swal-dark-content',
    htmlContainer: 'swal-dark-content',
    confirmButton: 'swal-dark-confirm',
    cancelButton: 'swal-dark-cancel',
    denyButton: 'swal-dark-cancel',
  },
};

export default function List() {
  const { configurations: paginatedConfigurations, flash, warning } = usePage().props;
  const { t } = useTranslations();
  const tl = (key, rep = {}) => t(`inventory.document_number_configuration.list.${key}`, rep);

  const [loading, setLoading] = useState(false);
  const configurations = paginatedConfigurations?.data || [];

  useEffect(() => {
    if (flash?.success) {
      void Swal.fire({
        ...swalThemed,
        icon: 'success',
        title: t('common.flash.success_title'),
        text: flash.success,
        confirmButtonText: t('common.flash.great'),
      });
    } else if (flash?.error) {
      void Swal.fire({
        ...swalThemed,
        icon: 'error',
        title: t('common.flash.error_title'),
        text: flash.error,
        confirmButtonText: t('common.flash.ok'),
      });
    }
  }, [flash?.success, flash?.error, t]);

  useEffect(() => {
    if (warning) {
      void Swal.fire({
        ...swalThemed,
        icon: 'warning',
        title: t('common.flash.warning_title'),
        text: warning,
        confirmButtonText: t('common.flash.ok'),
      });
    }
  }, [warning, t]);

  const handleDelete = async (row) => {
    const res = await Swal.fire({
      ...swalThemed,
      icon: 'warning',
      title: tl('confirm_delete_title'),
      text: tl('confirm_delete_text', { name: row.document_type }),
      showCancelButton: true,
      confirmButtonText: tl('confirm_delete_ok'),
      cancelButtonText: t('common.actions.cancel'),
    });
    if (!res.isConfirmed) return;
    setLoading(true);
    router.delete(`/inventory/document-number-configuration/${row.id}`, {
      onFinish: () => setLoading(false),
    });
  };

  const activeCount = useMemo(() => configurations.filter((c) => c.is_active).length, [configurations]);

  return (
    <App>
      <div className="advanced-module-manager">
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title">
                <Database className="title-icon" />
                {tl('page_title')}
              </h1>
              <div className="stats-summary">
                <div className="stat-item">
                  <Hash size={16} />
                  <span>{tl('stat_total', { count: configurations.length })}</span>
                </div>
                <div className="stat-item">
                  <span>{tl('stat_active', { count: activeCount })}</span>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="btn btn-icon"
                onClick={() => window.location.reload()}
                disabled={loading}
                title={tl('refresh')}
              >
                <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
              <a href="/inventory/document-number-configuration/create" className="btn btn-primary">
                <Plus size={20} />
                {tl('add_configuration')}
              </a>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="data-table-container">
            {!configurations.length ? (
              <div className="empty-state">
                <Database className="empty-icon" />
                <h3>{tl('empty_title')}</h3>
                <p>{tl('empty_hint')}</p>
                <a href="/inventory/document-number-configuration/create" className="btn btn-primary">
                  <Plus size={20} />
                  {tl('add_first')}
                </a>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{tl('col_id')}</th>
                      <th>{tl('col_document')}</th>
                      <th>{tl('col_prefix')}</th>
                      <th>{tl('col_length')}</th>
                      <th>{tl('col_next')}</th>
                      <th>{tl('col_reset')}</th>
                      <th>{tl('col_status')}</th>
                      <th>{tl('col_actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {configurations.map((row) => (
                      <tr key={row.id}>
                        <td>{row.id}</td>
                        <td>{row.document_type}</td>
                        <td>{row.prefix}</td>
                        <td>{row.number_length}</td>
                        <td>{row.running_number}</td>
                        <td>{row.reset_frequency}</td>
                        <td>{row.is_active ? t('common.status.active') : t('common.status.inactive')}</td>
                        <td>
                          <div className="flex gap-2 flex-wrap">
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={() => router.visit(`/inventory/document-number-configuration/${row.id}`)}
                            >
                              <Eye size={14} />
                              {tl('view')}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={() => router.visit(`/inventory/document-number-configuration/${row.id}/edit`)}
                            >
                              <Edit3 size={14} />
                              {tl('edit')}
                            </button>
                            <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(row)}>
                              <Trash2 size={14} />
                              {tl('delete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </App>
  );
}
