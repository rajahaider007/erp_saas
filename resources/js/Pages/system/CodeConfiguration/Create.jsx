import React, { useState, useEffect } from 'react';
import { Code, Home, List, Plus, Edit, Building2, MapPin } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import PermissionAwareForm, { PermissionButton } from '../../../Components/PermissionAwareForm';
import { usePermissions } from '../../../hooks/usePermissions';
import App from "../../App.jsx";
import { usePage, router } from '@inertiajs/react';

const Breadcrumbs = ({ items }) => (
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
    <div className="breadcrumbs-description">
      {usePage().props?.configuration ? 'Update code configuration' : 'Create a new code configuration'}
    </div>
  </div>
);

const CodeConfigurationForm = () => {
  const { configuration, companies, locations, codeTypes } = usePage().props;
  
  // Debug logging
  // console.log('CodeConfigurationForm Debug:', { companies: companies.length, locations: locations.length, codeTypes: codeTypes.length });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [requestStatus, setRequestStatus] = useState('');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [currentCompanyId, setCurrentCompanyId] = useState('');

  // Debug logging for accounts state changes
  useEffect(() => {

  }, [accounts, loadingAccounts]);

  const isEditMode = !!configuration;

  // Handle initial data loading
  useEffect(() => {
    if (isEditMode && configuration?.company_id) {
      // Set initial company ID
      setCurrentCompanyId(configuration.company_id);

      // Set initial locations from props if available
      if (locations && locations.length > 0) {
        const filtered = locations.filter(loc => loc.company_id == configuration.company_id);
        
        // If current location is not in filtered list, add it to ensure it's available
        if (configuration.location_id) {
          const currentLocation = locations.find(loc => loc.id == configuration.location_id);
          if (currentLocation && !filtered.find(loc => loc.id == currentLocation.id)) {
            filtered.push(currentLocation);
          }
        }
        
        setFilteredLocations(filtered);
      }
    } else if (!isEditMode && locations && locations.length > 0) {
      // In create mode, show all locations initially
      setFilteredLocations(locations);
    }
  }, [isEditMode, configuration, locations]);

  const handleCompanyChange = (companyId) => {


    // Store current company ID
    setCurrentCompanyId(companyId);

    // Reset location field when company changes
    const locationSelect = document.querySelector('select[name="location_id"]');
    if (locationSelect) {
      locationSelect.value = '';
    }

    // Reset account field
    const accountSelect = document.querySelector('select[name="account_id"]');
    if (accountSelect) accountSelect.value = '';
    setAccounts([]);

    if (companyId) {
      // Filter locations by company ID from the original locations array
      const filtered = locations.filter(loc => loc.company_id == companyId);
      setFilteredLocations(filtered);
    } else {
      // If no company selected, show all locations
      setFilteredLocations(locations || []);
    }
  };

  const handleLocationChange = (locationId) => {

    // Use the stored company ID
    const actualCompanyId = currentCompanyId;


    // Reset account field
    const accountSelect = document.querySelector('select[name="account_id"]');
    if (accountSelect) accountSelect.value = '';
    setAccounts([]);

    if (actualCompanyId && locationId) {

      const url = `/system/chart-of-accounts/accounts-by-company-location?company_id=${actualCompanyId}&location_id=${locationId}`;


      // Load all accounts (Level 2 and Level 3)
      setLoadingAccounts(true);
      fetch(url)
        .then(response => {

          return response.json();
        })
        .then(data => {

          setAccounts(data.data || []);
          setLoadingAccounts(false);
        })
        .catch(error => {
          setAccounts([]);
          setLoadingAccounts(false);
        });
    } else {
    }
  };

  // Map options for form fields
  const companyOptions = companies.map(c => ({ value: c.id, label: c.name }));
  const locationOptions = loadingLocations 
    ? [{ value: '', label: 'Loading locations...' }]
    : filteredLocations.map(l => {
        return { value: l.id, label: l.name };
      });
  const accountOptions = loadingAccounts 
    ? [{ value: '', label: 'Loading accounts...' }]
    : accounts.map(acc => ({ 
        value: acc.id, 
        label: `${acc.account_code} - ${acc.account_name} (Level ${acc.account_level})` 
      }));
  const codeTypeOptions = codeTypes.map(t => ({ value: t.value, label: t.label }));
  

  // Define initial data before fields array
  const initialData = isEditMode ? {
    company_id: configuration.company_id || '',
    location_id: configuration.location_id || '',
    account_id: configuration.level2_account_id || configuration.level3_account_id || configuration.level4_account_id || '',
    code_type: configuration.code_type,
    is_active: configuration.is_active
  } : {
    company_id: '',
    location_id: '',
    account_id: '',
    code_type: '',
    is_active: true
  };


  const fields = [
    { 
      name: 'company_id', 
      label: 'Company', 
      type: 'select', 
      required: true, 
      options: companyOptions,
      icon: Building2,
      onChange: handleCompanyChange,
      searchable: true
    },
    { 
      name: 'location_id', 
      label: 'Location', 
      type: 'select', 
      required: true, 
      options: locationOptions,
      icon: MapPin,
      disabled: loadingLocations,
      onChange: handleLocationChange,
      searchable: true
    },
    { 
      name: 'account_id', 
      label: 'Account Code (Level 2, 3, or 4)', 
      type: 'select', 
      required: false, 
      options: accountOptions,
      icon: Code,
      disabled: loadingAccounts,
      searchable: true
    },
    { 
      name: 'code_type', 
      label: 'Code Type', 
      type: 'select', 
      required: true, 
      options: codeTypeOptions,
      icon: Code,
      searchable: true
    },
    { 
      name: 'is_active', 
      label: 'Status', 
      type: 'toggle', 
      required: false 
    },
  ];

  useEffect(() => {
    if (isEditMode && configuration.company_id) {
      const filtered = locations.filter(loc => loc.company_id == configuration.company_id);
      setFilteredLocations(filtered);
    }
  }, [isEditMode]);

  const handleSubmit = async (submittedFormData) => {
    setErrors({});
    setAlert(null);
    setRequestStatus('Sending request...');

    const newErrors = {};
    if (!submittedFormData.company_id || !submittedFormData.company_id.trim()) {
      newErrors.company_id = 'Company is required';
    }
    if (!submittedFormData.location_id || !submittedFormData.location_id.trim()) {
      newErrors.location_id = 'Location is required';
    }
    if (!submittedFormData.code_type || !submittedFormData.code_type.trim()) {
      newErrors.code_type = 'Code type is required';
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: 'Please correct the errors below and try again.' });
      setRequestStatus('Validation failed');
      return;
    }

    const submitData = {
      ...submittedFormData,
      _method: isEditMode ? 'put' : 'post'
    };

    const url = isEditMode ? `/system/code-configurations/${configuration.id}` : '/system/code-configurations';
    const method = isEditMode ? 'post' : 'post';

    router[method](url, submitData, {
      onSuccess: () => {
        setRequestStatus('Success');
        setAlert({ type: 'success', message: `Code configuration ${isEditMode ? 'updated' : 'created'} successfully!` });
      },
      onError: (errs) => {
        setErrors(errs);
        setAlert({ type: 'error', message: `Failed to ${isEditMode ? 'update' : 'create'} code configuration. Please check the errors below.` });
        setRequestStatus('Server validation failed');
      }
    });
  };

  const breadcrumbItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Code Configurations', icon: List, href: '/system/code-configurations' },
    { label: isEditMode ? 'Edit Configuration' : 'Add Configuration', icon: isEditMode ? Edit : Plus, href: null },
  ];

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />
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
        title={isEditMode ? "Edit Code Configuration" : "Add Code Configuration"}
        subtitle={isEditMode ? "Update code configuration details" : "Create a new code configuration"}
        fields={fields}
        onSubmit={handleSubmit}
        submitText={isEditMode ? "Update Configuration" : "Create Configuration"}
        resetText="Clear Form"
        initialData={initialData}
        showReset={true}
      />
    </div>
  );
};

const Create = () => {
  const { canAdd } = usePermissions();

  return (
    <App>
      {/* Main Content Card */}
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <PermissionAwareForm
            requiredPermission="can_add"
            route="/system/code-configurations"
            fallbackMessage="You don't have permission to create code configurations. Please contact your administrator."
          >
            <CodeConfigurationForm />
          </PermissionAwareForm>
        </div>
      </div>
    </App>
  );
};

export default Create;

