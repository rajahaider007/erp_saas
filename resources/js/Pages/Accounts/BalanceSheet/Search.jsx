import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import Select from 'react-select';
import CustomDatePicker from '../../../Components/DatePicker/DatePicker';
import Swal from 'sweetalert2';
import { 
  Search as SearchIcon, 
  Filter, 
  Database,
  Calendar,
  RefreshCcw,
  ChevronRight,
  Scale,
  TrendingUp
} from 'lucide-react';
import App from '../../App.jsx';

const BalanceSheetSearch = () => {
  const { companies = [], locations = [], isParentCompany = false, flash } = usePage().props;
  
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [availableLocations, setAvailableLocations] = useState(locations);
  const [asAtDate, setAsAtDate] = useState(getCurrentDate());
  const [comparativeDate, setComparativeDate] = useState('');
  const [viewType, setViewType] = useState('current'); // current or comparative

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

  // Load initial values from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('comp_id') && companies.length > 0) {
      const compId = urlParams.get('comp_id');
      const company = companies.find(c => c.id.toString() === compId);
      if (company) {
        setSelectedCompany({ value: company.id, label: company.company_name });
      }
    }
    
    if (urlParams.has('location_id') && locations.length > 0) {
      const locId = urlParams.get('location_id');
      const location = locations.find(l => l.id.toString() === locId);
      if (location) {
        setSelectedLocation({ value: location.id, label: location.location_name });
      }
    }
    
    if (urlParams.has('as_at_date')) {
      setAsAtDate(urlParams.get('as_at_date'));
    }
    
    if (urlParams.has('comparative_date')) {
      setComparativeDate(urlParams.get('comparative_date'));
    }
  }, []);

  const handleGenerateReport = () => {
    const params = new URLSearchParams();
    if (selectedCompany) params.set('comp_id', selectedCompany.value);
    if (selectedLocation) params.set('location_id', selectedLocation.value);
    if (asAtDate) params.set('as_at_date', asAtDate);
    if (viewType === 'comparative' && comparativeDate) params.set('comparative_date', comparativeDate);
    
    router.get('/accounts/balance-sheet/report?' + params.toString());
  };

  const handleReset = () => {
    setSelectedCompany(null);
    setSelectedLocation(null);
    setAvailableLocations([]);
    setAsAtDate(getCurrentDate());
    setComparativeDate('');
    setViewType('current');
  };

  // Prepare options for Select
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
      maxHeight: '250px'
    }),
  };

  return (
    <App>
      <div className="advanced-module-manager form-theme-system">
        {/* Header */}
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title">
                <Scale className="title-icon" />
                Balance Sheet - Report Filters
              </h1>
              <div className="stats-summary">
                <div className="stat-item">
                  <TrendingUp size={16} />
                  <span>Select date and company to view balance sheet</span>
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

        {/* Flash Messages */}
        {flash?.success && (
          <div className="alert alert-success mb-4">
            {flash.success}
          </div>
        )}
        {flash?.error && (
          <div className="alert alert-error mb-4">
            {flash.error}
          </div>
        )}

        {/* Main Content */}
        <div className="manager-content">
          <div className="filter-card">
            <div className="filter-card-header">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-100">Report Filters</h2>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Configure filters to generate your balance sheet report
              </p>
            </div>

            <div className="filter-card-body">
              <div className="space-y-6">
                {/* Company & Location Selection - Only for Parent Companies */}
                {isParentCompany && (
                  <>
                    <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                      <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">
                        <Database size={16} />
                        Company Selection
                      </label>
                      <Select
                        options={companyOptions}
                        value={selectedCompany}
                        onChange={handleCompanyChange}
                        styles={customSelectStyles}
                        placeholder="Select company..."
                        isClearable
                        isSearchable
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Select the company for which you want to view the balance sheet
                      </p>
                    </div>

                    {selectedCompany && (
                      <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                        <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">
                          <Database size={16} />
                          Location Selection
                        </label>
                        <Select
                          options={locationOptions}
                          value={selectedLocation}
                          onChange={setSelectedLocation}
                          styles={customSelectStyles}
                          placeholder="Select location..."
                          isClearable
                          isSearchable
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                        <p className="text-xs text-gray-400 mt-2">
                          Select the location within the selected company
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* As At Date */}
                <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">
                    <Calendar size={16} />
                    Balance Sheet As At Date
                  </label>
                  <CustomDatePicker
                    selected={asAtDate ? new Date(asAtDate) : null}
                    onChange={(date) => setAsAtDate(date ? date.toISOString().split('T')[0] : '')}
                    type="date"
                    placeholder="Select as at date"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Select the date for which you want to view the balance sheet position
                  </p>
                </div>

                {/* View Type Selection */}
                <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">
                    <Filter size={16} />
                    View Type
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="viewType"
                        value="current"
                        checked={viewType === 'current'}
                        onChange={(e) => {
                          setViewType(e.target.value);
                          setComparativeDate('');
                        }}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm text-gray-300">Current Period Only</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="viewType"
                        value="comparative"
                        checked={viewType === 'comparative'}
                        onChange={(e) => setViewType(e.target.value)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm text-gray-300">Comparative View</span>
                    </label>
                  </div>
                </div>

                {/* Comparative Date (if applicable) */}
                {viewType === 'comparative' && (
                  <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                    <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">
                      <Calendar size={16} />
                      Comparative Date
                    </label>
                    <CustomDatePicker
                      selected={comparativeDate ? new Date(comparativeDate) : null}
                      onChange={(date) => setComparativeDate(date ? date.toISOString().split('T')[0] : '')}
                      type="date"
                      placeholder="Select comparative date"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Select the date to compare against
                    </p>
                  </div>
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
                    <SearchIcon size={18} />
                    Generate Report
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
};

export default BalanceSheetSearch;
