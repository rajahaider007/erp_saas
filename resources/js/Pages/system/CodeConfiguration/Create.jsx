import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Code, Home, List, Plus, Edit, Building2, MapPin } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import PermissionAwareForm from '../../../Components/PermissionAwareForm';
import App from "../../App.jsx";
import { usePage, router } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

const Breadcrumbs = ({ items, description }) => (
  <div className="breadcrumbs-themed">
    <nav className="breadcrumbs">
      {items.map((item, idx) => (
        <div key={idx} className="breadcrumb-item">
          <div className="breadcrumb-item-content">
            {item.icon && (<item.icon className={`breadcrumb-icon ${item.href ? 'breadcrumb-icon-link' : 'breadcrumb-icon-current'}`} />)}
            {item.href ? (<a href={item.href} className="breadcrumb-link-themed">{item.label}</a>) : (<span className="breadcrumb-current-themed">{item.label}</span>)}
          </div>
          {idx < items.length - 1 && (
            <div className="breadcrumb-separator breadcrumb-separator-themed">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            </div>
          )}
        </div>
      ))}
    </nav>
    <div className="breadcrumbs-description">{description}</div>
  </div>
);

const CodeConfigurationForm = () => {
  const { configuration, companies, locations, codeTypes } = usePage().props;
  const { t } = useTranslations();
  const tc = (k, rep) => (rep ? t(`system.code_configuration.create.${k}`, rep) : t(`system.code_configuration.create.${k}`));

  const [alert, setAlert] = useState(null);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loadingLocations] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [currentCompanyId, setCurrentCompanyId] = useState('');

  const isEditMode = !!configuration;

  useEffect(() => {
    if (isEditMode && configuration?.company_id) {
      setCurrentCompanyId(configuration.company_id);
      if (locations && locations.length > 0) {
        const filtered = locations.filter((loc) => loc.company_id == configuration.company_id);
        if (configuration.location_id) {
          const currentLocation = locations.find((loc) => loc.id == configuration.location_id);
          if (currentLocation && !filtered.find((loc) => loc.id == currentLocation.id)) {
            filtered.push(currentLocation);
          }
        }
        setFilteredLocations(filtered);
      }
      if (configuration.company_id && configuration.location_id) {
        const url = `/system/chart-of-accounts/accounts-by-company-location?company_id=${configuration.company_id}&location_id=${configuration.location_id}`;
        setLoadingAccounts(true);
        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            setAccounts(data.data || []);
            setLoadingAccounts(false);
          })
          .catch(() => {
            setAccounts([]);
            setLoadingAccounts(false);
          });
      }
    } else if (!isEditMode && locations && locations.length > 0) {
      setFilteredLocations(locations);
    }
  }, [isEditMode, configuration, locations]);

  const handleCompanyChange = useCallback((companyId) => {
    setCurrentCompanyId(companyId);
    const locationSelect = document.querySelector('select[name="location_id"]');
    if (locationSelect) locationSelect.value = '';
    const accountSelect = document.querySelector('select[name="account_id"]');
    if (accountSelect) accountSelect.value = '';
    setAccounts([]);
    if (companyId) {
      setFilteredLocations(locations.filter((loc) => loc.company_id == companyId));
    } else {
      setFilteredLocations(locations || []);
    }
  }, [locations]);

  const handleLocationChange = useCallback((locationId) => {
    const actualCompanyId = currentCompanyId;
    const accountSelect = document.querySelector('select[name="account_id"]');
    if (accountSelect) accountSelect.value = '';
    setAccounts([]);
    if (actualCompanyId && locationId) {
      const url = `/system/chart-of-accounts/accounts-by-company-location?company_id=${actualCompanyId}&location_id=${locationId}`;
      setLoadingAccounts(true);
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          setAccounts(data.data || []);
          setLoadingAccounts(false);
        })
        .catch(() => {
          setAccounts([]);
          setLoadingAccounts(false);
        });
    }
  }, [currentCompanyId]);

  const companyOptions = useMemo(
    () => (companies || []).map((c) => ({ value: c.id, label: c.name })),
    [companies]
  );

  const locationOptions = useMemo(() => {
    if (loadingLocations) {
      return [{ value: '', label: tc('ph_loading_locations') }];
    }
    return filteredLocations.map((l) => ({ value: l.id, label: l.name }));
  }, [filteredLocations, loadingLocations, t]);

  const accountOptions = useMemo(() => {
    if (loadingAccounts) {
      return [{ value: '', label: tc('ph_loading_accounts') }];
    }
    return accounts.map((acc) => ({
      value: acc.id,
      label: tc('account_option_label', {
        code: acc.account_code,
        name: acc.account_name,
        level: acc.account_level,
      }),
    }));
  }, [accounts, loadingAccounts, t]);

  const codeTypeOptions = useMemo(
    () => (codeTypes || []).map((ct) => ({ value: ct.value, label: ct.label })),
    [codeTypes]
  );

  const initialData = useMemo(() => (
    isEditMode
      ? {
          company_id: configuration.company_id || '',
          location_id: configuration.location_id || '',
          account_id: configuration.level2_account_id || configuration.level3_account_id || configuration.level4_account_id || '',
          code_type: configuration.code_type,
          is_active: configuration.is_active,
        }
      : {
          company_id: '',
          location_id: '',
          account_id: '',
          code_type: '',
          is_active: true,
        }
  ), [isEditMode, configuration]);

  const fields = useMemo(
    () => [
      {
        name: 'company_id',
        label: tc('lbl_company'),
        type: 'select',
        required: true,
        options: companyOptions,
        icon: Building2,
        onChange: handleCompanyChange,
        searchable: true,
      },
      {
        name: 'location_id',
        label: tc('lbl_location'),
        type: 'select',
        required: true,
        options: locationOptions,
        icon: MapPin,
        disabled: loadingLocations,
        onChange: handleLocationChange,
        searchable: true,
      },
      {
        name: 'account_id',
        label: tc('lbl_account'),
        type: 'select',
        required: false,
        options: accountOptions,
        icon: Code,
        disabled: loadingAccounts,
        searchable: true,
      },
      {
        name: 'code_type',
        label: tc('lbl_code_type'),
        type: 'select',
        required: true,
        options: codeTypeOptions,
        icon: Code,
        searchable: true,
      },
      {
        name: 'is_active',
        label: tc('lbl_status'),
        type: 'toggle',
        required: false,
      },
    ],
    [
      companyOptions,
      locationOptions,
      accountOptions,
      codeTypeOptions,
      loadingLocations,
      loadingAccounts,
      handleCompanyChange,
      handleLocationChange,
      t,
    ]
  );

  const handleSubmit = async (submittedFormData) => {
    setAlert(null);

    const newErrors = {};
    if (!submittedFormData.company_id || (typeof submittedFormData.company_id === 'string' && !submittedFormData.company_id.trim())) {
      newErrors.company_id = tc('val_company_required');
    }
    if (!submittedFormData.location_id || (typeof submittedFormData.location_id === 'string' && !submittedFormData.location_id.trim())) {
      newErrors.location_id = tc('val_location_required');
    }
    if (!submittedFormData.code_type || (typeof submittedFormData.code_type === 'string' && !submittedFormData.code_type.trim())) {
      newErrors.code_type = tc('val_code_type_required');
    }

    if (Object.keys(newErrors).length) {
      setAlert({ type: 'error', message: tc('msg_please_correct_the_errors_below_and_try_') });
      return;
    }

    const submitData = {
      ...submittedFormData,
      _method: isEditMode ? 'put' : 'post',
    };

    const url = isEditMode ? `/system/code-configurations/${configuration.id}` : '/system/code-configurations';

    router.post(url, submitData, {
      onSuccess: () => {
        setAlert({
          type: 'success',
          message: isEditMode ? tc('msg_success_updated') : tc('msg_success_created'),
        });
      },
      onError: () => {
        setAlert({
          type: 'error',
          message: isEditMode ? tc('msg_failed_update') : tc('msg_failed_create'),
        });
      },
    });
  };

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: tc('breadcrumb_list'), icon: List, href: '/system/code-configurations' },
      {
        label: isEditMode ? tc('breadcrumb_edit') : tc('breadcrumb_add'),
        icon: isEditMode ? Edit : Plus,
        href: null,
      },
    ],
    [isEditMode, t]
  );

  const breadcrumbDescription = isEditMode ? tc('breadcrumb_desc_edit') : tc('breadcrumb_desc_create');

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} description={breadcrumbDescription} />
      {alert && (
        <div className={`mb-4 p-4 rounded-lg animate-slideIn ${alert.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {alert.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              )}
            </div>
            <div className="ml-3"><p className="text-sm font-medium">{alert.message}</p></div>
          </div>
        </div>
      )}
      <GeneralizedForm
        title={isEditMode ? tc('title_edit') : tc('title_add')}
        subtitle={isEditMode ? tc('subtitle_edit') : tc('subtitle_add')}
        fields={fields}
        onSubmit={handleSubmit}
        submitText={isEditMode ? tc('submit_update') : tc('submit_create')}
        resetText={t('common.form_actions.clear_form')}
        initialData={initialData}
        showReset={true}
      />
    </div>
  );
};

const Create = () => {
  const { t } = useTranslations();

  return (
    <App>
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <PermissionAwareForm
            requiredPermission="can_add"
            route="/system/code-configurations"
            fallbackMessage={t('system.code_configuration.create.permission_fallback')}
          >
            <CodeConfigurationForm />
          </PermissionAwareForm>
        </div>
      </div>
    </App>
  );
};

export default Create;
