import React from 'react';
import { usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';
import App from "../../App.jsx";

const CompanyShow = () => {
  const { t, locale } = useTranslations();
  const { company } = usePage().props;
  const na = () => t('common.labels.not_provided');
  const statusLabel = (on) => (on ? t('common.status.active') : t('common.status.inactive'));
  const loc = locale === 'ur' ? 'ur-PK' : undefined;

  const formatDate = (d) => {
    if (!d) return na();
    return new Date(d).toLocaleDateString(loc);
  };
  const formatDateTime = (d) => {
    if (!d) return na();
    return new Date(d).toLocaleString(loc);
  };

  const companyTypeLabel = (type) => {
    if (!type) return na();
    const key = `system.companies.create.opt_${type}`;
    const translated = t(key);
    if (translated === key) return type;
    return translated;
  };

  return (
    <App>
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <h1 className="form-title">{t('system.companies.show.company_details')}</h1>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.company_name')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.company_name}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.company_code')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.company_code || na()}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.legal_name')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.legal_name || na()}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.trading_name')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.trading_name || na()}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.registration_number')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.registration_number}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.tax_id')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.tax_id || na()}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.vat_number')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.vat_number || na()}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.incorporation_date')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{formatDate(company.incorporation_date)}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.company_type')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{companyTypeLabel(company.company_type)}</div>
                </div>
              </div>
            </div>
            <div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.email')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.email}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.phone')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.phone || na()}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.fax')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.fax || na()}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.website')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.website || na()}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.address_line_1')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.address_line_1}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.address_line_2')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.address_line_2 || na()}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.city')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.city}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.stateprovince')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.state_province || na()}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.postal_code')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.postal_code || na()}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.country')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.country}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Business Information Section */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('system.companies.show.business_information')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="input-group">
                  <label className="input-label">{t('system.companies.show.industry')}</label>
                  <div className="input-wrapper">
                    <div className="form-input">{company.industry || na()}</div>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">{t('system.companies.show.employee_count')}</label>
                  <div className="input-wrapper">
                    <div className="form-input">{company.employee_count || na()}</div>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">{t('system.companies.show.annual_revenue')}</label>
                  <div className="input-wrapper">
                    <div className="form-input">{company.annual_revenue || na()}</div>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">{t('system.companies.show.currency')}</label>
                  <div className="input-wrapper">
                    <div className="form-input">{company.currency || t('common.labels.default_currency')}</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="input-group">
                  <label className="input-label">{t('system.companies.show.status')}</label>
                  <div className="input-wrapper">
                    <div className="form-input">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        company.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {statusLabel(company.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">{t('system.companies.show.subscription_status')}</label>
                  <div className="input-wrapper">
                    <div className="form-input">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        company.status ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {statusLabel(company.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">{t('system.companies.show.created_at')}</label>
                  <div className="input-wrapper">
                    <div className="form-input">{formatDateTime(company.created_at)}</div>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">{t('system.companies.show.last_updated')}</label>
                  <div className="input-wrapper">
                    <div className="form-input">{formatDateTime(company.updated_at)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Description */}
          {company.business_description && (
            <div className="mt-6">
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.business_description')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.business_description}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </App>
  );
};

export default CompanyShow;
