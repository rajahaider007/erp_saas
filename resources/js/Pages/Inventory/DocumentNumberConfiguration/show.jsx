import React from 'react';
import App from '../../App.jsx';
import { usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

const ShowInventoryDocumentNumberConfiguration = () => {
  const { t } = useTranslations();
  const { configuration } = usePage().props;
  const ts = (k, rep = {}) => t(`inventory.document_number_configuration.show.${k}`, rep);

  if (!configuration) {
    return (
      <App>
        <div className="p-6">{ts('not_found')}</div>
      </App>
    );
  }

  return (
    <App>
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <h1 className="form-title">{ts('title')}</h1>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="input-group">
                <label className="input-label">{ts('document_type')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{configuration.document_type}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{ts('prefix')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{configuration.prefix}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{ts('number_length')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{ts('suffix_digits', { count: configuration.number_length })}</div>
                </div>
              </div>
            </div>
            <div>
              <div className="input-group">
                <label className="input-label">{ts('reset_frequency')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{configuration.reset_frequency}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{ts('next_running_number')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{configuration.running_number}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{ts('status')}</label>
                <div className="input-wrapper">
                  <div className="form-input">
                    {configuration.is_active ? t('common.status.active') : t('common.status.inactive')}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <a href="/inventory/document-number-configuration" className="btn btn-secondary">
              {ts('back_to_list')}
            </a>
          </div>
        </div>
      </div>
    </App>
  );
};

export default ShowInventoryDocumentNumberConfiguration;
