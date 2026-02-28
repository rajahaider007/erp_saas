import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import Select from 'react-select';
import {
  Building, MapPin, Search, ChevronRight, FileText,
  Database, RefreshCcw, TrendingUp, Filter, BarChart3
} from 'lucide-react';
import App from '../../App.jsx';

/**
 * Chart of Account Report Search Component
 * 
 * Allows users to select company and location before viewing the report
 */
const ChartOfAccountSearch = () => {
  const { auth, companies, locations, isParentCompany } = usePage().props;
  
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [availableLocations, setAvailableLocations] = useState(locations || []);

  // Handle company selection and fetch locations
  const handleCompanyChange = async (selectedOption) => {
    setSelectedCompany(selectedOption);
    setSelectedLocation(null);
    setAvailableLocations([]);
    
    if (selectedOption) {
      try {
        const response = await fetch(`/system/locations/by-company/${selectedOption.value}`);
        const data = await response.json();
        setAvailableLocations(data.data || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    }
  };

  // Handle location selection
  const handleLocationChange = (selectedOption) => {
    setSelectedLocation(selectedOption);
  };

  const handleGenerateReport = () => {
    const params = new URLSearchParams();
    if (selectedCompany) params.set('comp_id', selectedCompany.value);
    if (selectedLocation) params.set('location_id', selectedLocation.value);
    
    router.get('/accounts/reports/chart-of-account/report?' + params.toString());
  };

  const handleReset = () => {
    setSelectedCompany(null);
    setSelectedLocation(null);
    setAvailableLocations([]);
  };

  // Prepare options for Select2
  const companyOptions = companies.map(company => ({
    value: company.id,
    label: company.company_name
  }));

  const locationOptions = availableLocations.map(location => ({
    value: location.id,
    label: location.location_name
  }));

  // Custom styles for react-select to match dark theme
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: '#1e293b',
      borderColor: state.isFocused ? '#3b82f6' : '#475569',
      borderWidth: '1px',
      borderRadius: '0.5rem',
      padding: '0.375rem 0.5rem',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#3b82f6'
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#1e293b',
      borderRadius: '0.5rem',
      border: '1px solid #475569',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#334155' : '#1e293b',
      color: state.isFocused ? '#f1f5f9' : '#cbd5e1',
      padding: '0.75rem 1rem',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#475569'
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#f1f5f9'
    }),
    input: (provided) => ({
      ...provided,
      color: '#f1f5f9'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#94a3b8'
    }),
    menuList: (provided) => ({
      ...provided,
      padding: 0,
      maxHeight: '300px'
    })
  };

  return (
    <App>
      <div className="advanced-module-manager form-theme-system">
        {/* Header */}
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title">
                <FileText className="title-icon" />
                Chart of Accounts - Report Filters
              </h1>
              <div className="stats-summary">
                <div className="stat-item">
                  <Database size={16} />
                  <span>Select filters to generate report</span>
                </div>
                <div className="stat-item">
                  <TrendingUp size={16} />
                  <span>IFRS Compliant Structure</span>
                </div>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="btn btn-icon"
                onClick={handleReset}
                title="Reset All Filters"
              >
                <RefreshCcw size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Selection Panel */}
        <div className="main-content">
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  <Filter className="inline-block mr-2" size={20} />
                  Select Report Filters
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose the filters below to generate your Chart of Accounts report.
                </p>
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 gap-6">
                {/* Company Selection - Only for Parent Companies */}
                {isParentCompany && (
                  <>
                    <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                      <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">
                        <Building size={16} />
                        Company Selection
                      </label>
                      <Select
                        options={companyOptions}
                        value={selectedCompany}
                        onChange={handleCompanyChange}
                        styles={customSelectStyles}
                        placeholder="Select a company..."
                        isClearable
                        isSearchable
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Select a company to filter data
                      </p>
                    </div>

                    {/* Location Selection - Only shown after company selection */}
                    {selectedCompany && (
                      <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                        <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">
                          <MapPin size={16} />
                          Location Selection
                        </label>
                        <Select
                          options={locationOptions}
                          value={selectedLocation}
                          onChange={handleLocationChange}
                          styles={customSelectStyles}
                          placeholder="Select a location..."
                          isClearable
                          isSearchable
                          className="react-select-container"
                          classNamePrefix="react-select"
                          isDisabled={!selectedCompany}
                        />
                        <p className="text-xs text-gray-400 mt-2">
                          Select a location within the selected company
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-600">
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-gray-200 rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <RefreshCcw size={18} />
                    Reset Filters
                  </button>
                  <button
                    onClick={handleGenerateReport}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg hover:shadow-blue-500/50"
                  >
                    <Search size={18} />
                    Generate Report
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Information Cards */}
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border border-blue-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 size={24} className="text-blue-400" />
                    <h3 className="font-semibold text-blue-200">Hierarchical Structure</h3>
                  </div>
                  <p className="text-sm text-blue-300">
                    View accounts organized by level from main categories to transactional accounts
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 border border-green-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText size={24} className="text-green-400" />
                    <h3 className="font-semibold text-green-200">IFRS Compliant</h3>
                  </div>
                  <p className="text-sm text-green-300">
                    Follows IAS 1, IFRS 8, and other international accounting standards
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border border-purple-700 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp size={24} className="text-purple-400" />
                    <h3 className="font-semibold text-purple-200">Account Analysis</h3>
                  </div>
                  <p className="text-sm text-purple-300">
                    Analyze balances, transactions, and account classifications
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
};

export default ChartOfAccountSearch;
