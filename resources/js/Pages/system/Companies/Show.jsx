import React from 'react';
import { usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';
import App from "../../App.jsx";

const CompanyShow = () => {
const { t } = useTranslations();
  const { company } = usePage().props;

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
                  <div className="form-input">{company.company_code || 'Not provided'}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.legal_name')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.legal_name || 'Not provided'}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.trading_name')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.trading_name || 'Not provided'}</div>
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
                  <div className="form-input">{company.tax_id || 'Not provided'}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.vat_number')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.vat_number || 'Not provided'}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.incorporation_date')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.incorporation_date ? new Date(company.incorporation_date).toLocaleDateString() : 'Not provided'}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.company_type')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.company_type || 'Not provided'}</div>
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
                  <div className="form-input">{company.phone || 'Not provided'}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.fax')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.fax || 'Not provided'}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.website')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.website || 'Not provided'}</div>
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
                  <div className="form-input">{company.address_line_2 || 'Not provided'}</div>
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
                  <div className="form-input">{company.state_province || 'Not provided'}</div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">{t('system.companies.show.postal_code')}</label>
                <div className="input-wrapper">
                  <div className="form-input">{company.postal_code || 'Not provided'}</div>
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
                    <div className="form-input">{company.industry || 'Not provided'}</div>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">{t('system.companies.show.employee_count')}</label>
                  <div className="input-wrapper">
                    <div className="form-input">{company.employee_count || 'Not provided'}</div>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">{t('system.companies.show.annual_revenue')}</label>
                  <div className="input-wrapper">
                    <div className="form-input">{company.annual_revenue || 'Not provided'}</div>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">{t('system.companies.show.currency')}</label>
                  <div className="input-wrapper">
                    <div className="form-input">{company.currency || 'USD'}</div>
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
                        {company.status ? 'Active' : 'Inactive'}
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
                        {company.status ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">{t('system.companies.show.created_at')}</label>
                  <div className="input-wrapper">
                    <div className="form-input">{new Date(company.created_at).toLocaleString()}</div>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">{t('system.companies.show.last_updated')}</label>
                  <div className="input-wrapper">
                    <div className="form-input">{new Date(company.updated_at).toLocaleString()}</div>
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
