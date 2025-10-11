import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import Select from 'react-select';
import CustomDatePicker from '../../../Components/DatePicker/DatePicker';
import Swal from 'sweetalert2';
import { 
  Search as SearchIcon, 
  Filter, 
  FileText,
  Database,
  Calendar,
  RefreshCcw,
  ChevronRight,
  BookOpen,
  TrendingUp,
  DollarSign,
  Globe
} from 'lucide-react';
import App from '../../App.jsx';

const CurrencyLedgerSearch = () => {
  const { accounts = [], currencies = [], companies = [], locations = [], isParentCompany = false, flash } = usePage().props;
  
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [availableLocations, setAvailableLocations] = useState(locations);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [fromDate, setFromDate] = useState(getCurrentDate());
  const [toDate, setToDate] = useState(getCurrentDate());
  const [voucherType, setVoucherType] = useState('');
  const [status, setStatus] = useState('Posted');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(null);

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
    
    if (urlParams.has('account_id')) {
      const accountId = urlParams.get('account_id');
      const account = accounts.find(acc => acc.id.toString() === accountId);
      if (account) {
        setSelectedAccount({ value: account.id, label: `${account.account_code} - ${account.account_name}` });
      }
    }
    
    if (urlParams.has('from_date')) {
      setFromDate(urlParams.get('from_date'));
    }
    
    if (urlParams.has('to_date')) {
      setToDate(urlParams.get('to_date'));
    }
    
    if (urlParams.has('voucher_type')) {
      setVoucherType(urlParams.get('voucher_type'));
    }
    
    if (urlParams.has('status')) {
      setStatus(urlParams.get('status'));
    }
    
    if (urlParams.has('min_amount')) {
      setMinAmount(urlParams.get('min_amount'));
    }
    
    if (urlParams.has('max_amount')) {
      setMaxAmount(urlParams.get('max_amount'));
    }
    
    if (urlParams.has('currency_code')) {
      const currencyCode = urlParams.get('currency_code');
      const currency = currencies.find(curr => curr.code === currencyCode);
      if (currency) {
        setSelectedCurrency({ value: currency.code, label: `${currency.code} - ${currency.name}` });
      }
    }
  }, [accounts, currencies]);

  const handleGenerateReport = () => {
    const params = new URLSearchParams();
    if (selectedCompany) params.set('comp_id', selectedCompany.value);
    if (selectedLocation) params.set('location_id', selectedLocation.value);
    if (selectedAccount) params.set('account_id', selectedAccount.value);
    if (fromDate) params.set('from_date', fromDate);
    if (toDate) params.set('to_date', toDate);
    if (voucherType) params.set('voucher_type', voucherType);
    if (status) params.set('status', status);
    if (minAmount) params.set('min_amount', minAmount);
    if (maxAmount) params.set('max_amount', maxAmount);
    if (selectedCurrency) params.set('currency_code', selectedCurrency.value);
    
    router.get('/accounts/currency-ledger/report?' + params.toString());
  };

  const handleReset = () => {
    setSelectedCompany(null);
    setSelectedLocation(null);
    setAvailableLocations([]);
    setSelectedAccount(null);
    setFromDate('');
    setToDate('');
    setVoucherType('');
    setStatus('Posted');
    setMinAmount('');
    setMaxAmount('');
    setSelectedCurrency(null);
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

  const accountOptions = [
    { value: '', label: 'All Accounts (Consolidated Report)' },
    ...accounts.map(account => ({
      value: account.id,
      label: `${account.account_code} - ${account.account_name}`
    }))
  ];

  const currencyOptions = [
    { value: '', label: 'All Currencies' },
    ...currencies.map(currency => ({
      value: currency.currency_code,
      label: `${currency.currency_code} - ${currency.currency_name}`
    }))
  ];

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

  const setTodayFilter = () => {
    const today = new Date().toISOString().split('T')[0];
    setFromDate(today);
    setToDate(today);
  };

  const setThisWeekFilter = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    setFromDate(startOfWeek.toISOString().split('T')[0]);
    setToDate(endOfWeek.toISOString().split('T')[0]);
  };

  const setThisMonthFilter = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setFromDate(startOfMonth.toISOString().split('T')[0]);
    setToDate(endOfMonth.toISOString().split('T')[0]);
  };

  const setThisYearFilter = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    setFromDate(startOfYear.toISOString().split('T')[0]);
    setToDate(endOfYear.toISOString().split('T')[0]);
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Posted', label: 'Posted' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Draft', label: 'Draft' }
  ];

  return (
    <App>
      <div className="advanced-module-manager form-theme-system">
        {/* Header */}
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title">
                <Globe className="title-icon" />
                Currency Ledger - Report Filters
              </h1>
              <div className="stats-summary">
                <div className="stat-item">
                  <Database size={16} />
                  <span>{accounts?.length || 0} Accounts Available</span>
                </div>
                <div className="stat-item">
                  <DollarSign size={16} />
                  <span>{currencies?.length || 0} Currencies Available</span>
                </div>
                <div className="stat-item">
                  <TrendingUp size={16} />
                  <span>Multi-currency transaction report</span>
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
          <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300 animate-slideIn">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{flash.success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Selection Panel */}
        <div className="main-content">
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  <Filter className="inline-block mr-2" size={20} />
                  Select Currency Ledger Filters
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose the filters below to generate your Currency Ledger report. This report shows both original amounts and base currency amounts with exchange rates.
                </p>
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 gap-6">
                {/* Company Selection - Only for Parent Companies */}
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
                          <Database size={16} />
                          Location Selection
                        </label>
                        <Select
                          options={locationOptions}
                          value={selectedLocation}
                          onChange={setSelectedLocation}
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

                {/* Account Selection with Select2 */}
                <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">
                    <Database size={16} />
                    Account Selection
                  </label>
                  <Select
                    options={accountOptions}
                    value={selectedAccount}
                    onChange={setSelectedAccount}
                    styles={customSelectStyles}
                    placeholder="Search and select account..."
                    isClearable
                    isSearchable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Leave blank to generate consolidated report for all accounts
                  </p>
                </div>

                {/* Currency Filter with Select2 */}
                <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">
                    <DollarSign size={16} />
                    Currency Filter
                  </label>
                  <Select
                    options={currencyOptions}
                    value={selectedCurrency}
                    onChange={setSelectedCurrency}
                    styles={customSelectStyles}
                    placeholder="Search and select currency..."
                    isClearable
                    isSearchable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Filter transactions by specific currency (leave blank for all)
                  </p>
                </div>

                {/* Date Range */}
                <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">
                    <Calendar size={16} />
                    Date Range
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-400 mb-2 block">From Date</label>
                      <CustomDatePicker
                        selected={fromDate ? new Date(fromDate) : null}
                        onChange={(date) => {
                          const selectedFromDate = date ? date.toISOString().split('T')[0] : '';
                          const fromDateObj = date;
                          const toDateObj = toDate ? new Date(toDate) : null;
                          
                          if (selectedFromDate && toDateObj && fromDateObj > toDateObj) {
                            Swal.fire({
                              title: 'Invalid Date Range',
                              text: 'From Date cannot be later than To Date. Please select a valid date range.',
                              icon: 'warning',
                              confirmButtonText: 'OK',
                              confirmButtonColor: '#3b82f6',
                              background: '#1e293b',
                              color: '#f1f5f9',
                              customClass: {
                                popup: 'swal-dark-popup',
                                title: 'swal-dark-title',
                                content: 'swal-dark-content'
                              }
                            });
                            return;
                          }
                          
                          setFromDate(selectedFromDate);
                        }}
                        type="date"
                        placeholder="Select from date"
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-400 mb-2 block">To Date</label>
                      <CustomDatePicker
                        selected={toDate ? new Date(toDate) : null}
                        onChange={(date) => {
                          const selectedToDate = date ? date.toISOString().split('T')[0] : '';
                          const fromDateObj = fromDate ? new Date(fromDate) : null;
                          const toDateObj = date;
                          
                          if (selectedToDate && fromDateObj && toDateObj < fromDateObj) {
                            Swal.fire({
                              title: 'Invalid Date Range',
                              text: 'To Date cannot be earlier than From Date. Please select a valid date range.',
                              icon: 'warning',
                              confirmButtonText: 'OK',
                              confirmButtonColor: '#3b82f6',
                              background: '#1e293b',
                              color: '#f1f5f9',
                              customClass: {
                                popup: 'swal-dark-popup',
                                title: 'swal-dark-title',
                                content: 'swal-dark-content'
                              }
                            });
                            return;
                          }
                          
                          setToDate(selectedToDate);
                        }}
                        type="date"
                        placeholder="Select to date"
                        maxDate={new Date()}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Quick Date Filters */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={setTodayFilter}
                      className="px-3 py-1.5 bg-slate-600 hover:bg-blue-600 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-all"
                    >
                      Today
                    </button>
                    <button
                      onClick={setThisWeekFilter}
                      className="px-3 py-1.5 bg-slate-600 hover:bg-blue-600 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-all"
                    >
                      This Week
                    </button>
                    <button
                      onClick={setThisMonthFilter}
                      className="px-3 py-1.5 bg-slate-600 hover:bg-blue-600 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-all"
                    >
                      This Month
                    </button>
                    <button
                      onClick={setThisYearFilter}
                      className="px-3 py-1.5 bg-slate-600 hover:bg-blue-600 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-all"
                    >
                      This Year
                    </button>
                  </div>
                </div>

                {/* Voucher Type */}
                <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">
                    <FileText size={16} />
                    Voucher Type
                  </label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={voucherType}
                    onChange={(e) => setVoucherType(e.target.value)}
                  >
                    <option value="">All Voucher Types</option>
                    <option value="Journal">Journal Voucher</option>
                    <option value="Payment">Payment Voucher</option>
                    <option value="Receipt">Receipt Voucher</option>
                    <option value="Contra">Contra Voucher</option>
                  </select>
                </div>

                {/* Status */}
                <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">
                    <Filter size={16} />
                    Transaction Status
                  </label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Range */}
                <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">
                    <TrendingUp size={16} />
                    Amount Range (Optional)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-400 mb-2 block">Minimum Amount</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="0.00"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-400 mb-2 block">Maximum Amount</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="0.00"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

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
                    Generate Currency Report
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

export default CurrencyLedgerSearch;
