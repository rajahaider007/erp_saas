import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';
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
  TrendingUp
} from 'lucide-react';
import App from '../../App.jsx';
import { formatLocalYmd, todayLocalYmd } from '@/utils/dateOnly';

const GeneralLedgerSearch = () => {
  const { accounts = [], companies = [], locations = [], isParentCompany = false, flash } = usePage().props;
  const { t } = useTranslations();
  
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => todayLocalYmd();

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
  }, [accounts]);

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
    
    router.get('/accounts/general-ledger/report?' + params.toString());
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
    { value: '', label: t('accounts.general_ledger.search.all_accounts_consolidated_report') },
    ...accounts.map(account => ({
      value: account.id,
      label: `${account.account_code} - ${account.account_name}`
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
    const today = todayLocalYmd();
    setFromDate(today);
    setToDate(today);
  };

  const setThisWeekFilter = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    setFromDate(formatLocalYmd(startOfWeek));
    setToDate(formatLocalYmd(endOfWeek));
  };

  const setThisMonthFilter = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setFromDate(formatLocalYmd(startOfMonth));
    setToDate(formatLocalYmd(endOfMonth));
  };

  const setThisYearFilter = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    setFromDate(formatLocalYmd(startOfYear));
    setToDate(formatLocalYmd(endOfYear));
  };

  const statusOptions = [
    { value: '', label: t('accounts.general_ledger.search.all_status') },
    { value: 'Posted', label: t('accounts.general_ledger.search.posted') },
    { value: 'Approved', label: t('accounts.general_ledger.search.approved') },
    { value: 'Draft', label: t('accounts.general_ledger.search.draft') }
  ];

  return (
    <App>
      <div className="advanced-module-manager form-theme-system">
        {/* Header */}
        <div className="manager-header">
          <div className="header-main">
            <div className="title-section">
              <h1 className="page-title">
                <BookOpen className="title-icon" />
                {t('accounts.general_ledger.search.page_title')}
              </h1>
              <div className="stats-summary">
                <div className="stat-item">
                  <Database size={16} />
                  <span>{t('accounts.general_ledger.search.accounts_available', { count: accounts?.length || 0 })}</span>
                </div>
                <div className="stat-item">
                  <TrendingUp size={16} />
                  <span>{t('accounts.general_ledger.search.select_filters_to_generate_report')}</span>
                </div>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="btn btn-icon"
                onClick={handleReset}
                title={t('accounts.general_ledger.search.reset_all_filters')}
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
                  {t('accounts.general_ledger.search.select_report_filters')}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('accounts.general_ledger.search.choose_filters_description')}
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
                        {t('accounts.general_ledger.search.company_selection')}
                      </label>
                      <Select
                        options={companyOptions}
                        value={selectedCompany}
                        onChange={handleCompanyChange}
                        styles={customSelectStyles}
                        placeholder={t('accounts.general_ledger.search.select_a_company')}
                        isClearable
                        isSearchable
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        {t('accounts.general_ledger.search.select_company_to_filter_data')}
                      </p>
                    </div>

                    {/* Location Selection - Only shown after company selection */}
                    {selectedCompany && (
                      <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                        <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">
                          <Database size={16} />
                          {t('accounts.general_ledger.search.location_selection')}
                        </label>
                        <Select
                          options={locationOptions}
                          value={selectedLocation}
                          onChange={setSelectedLocation}
                          styles={customSelectStyles}
                          placeholder={t('accounts.general_ledger.search.select_a_location')}
                          isClearable
                          isSearchable
                          className="react-select-container"
                          classNamePrefix="react-select"
                          isDisabled={!selectedCompany}
                        />
                        <p className="text-xs text-gray-400 mt-2">
                          {t('accounts.general_ledger.search.select_location_within_selected_company')}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Account Selection with Select2 */}
                <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">
                    <Database size={16} />
                    {t('accounts.general_ledger.search.account_selection')}
                  </label>
                  <Select
                    options={accountOptions}
                    value={selectedAccount}
                    onChange={setSelectedAccount}
                    styles={customSelectStyles}
                    placeholder={t('accounts.general_ledger.search.search_and_select_account')}
                    isClearable
                    isSearchable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    {t('accounts.general_ledger.search.leave_blank_for_all_accounts')}
                  </p>
                </div>

                {/* Date Range */}
                <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">
                    <Calendar size={16} />
                    {t('accounts.general_ledger.search.date_range')}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-400 mb-2 block">{t('accounts.general_ledger.search.from_date')}</label>
                      <CustomDatePicker
                        selected={fromDate || null}
                        onChange={(date) => {
                          const selectedFromDate = date ? formatLocalYmd(date) : '';
                          if (selectedFromDate && toDate && selectedFromDate > toDate) {
                            Swal.fire({
                              title: t('accounts.general_ledger.search.invalid_date_range_title'),
                              text: t('accounts.general_ledger.search.invalid_date_range_from_later'),
                              icon: 'warning',
                              confirmButtonText: t('accounts.general_ledger.search.ok'),
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
                        placeholder={t('accounts.general_ledger.search.select_from_date')}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-400 mb-2 block">{t('accounts.general_ledger.search.to_date')}</label>
                      <CustomDatePicker
                        selected={toDate || null}
                        onChange={(date) => {
                          const selectedToDate = date ? formatLocalYmd(date) : '';
                          if (selectedToDate && fromDate && selectedToDate < fromDate) {
                            Swal.fire({
                              title: t('accounts.general_ledger.search.invalid_date_range_title'),
                              text: t('accounts.general_ledger.search.invalid_date_range_to_earlier'),
                              icon: 'warning',
                              confirmButtonText: t('accounts.general_ledger.search.ok'),
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
                        placeholder={t('accounts.general_ledger.search.select_to_date')}
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
                      {t('accounts.general_ledger.search.today')}
                    </button>
                    <button
                      onClick={setThisWeekFilter}
                      className="px-3 py-1.5 bg-slate-600 hover:bg-blue-600 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-all"
                    >
                      {t('accounts.general_ledger.search.this_week')}
                    </button>
                    <button
                      onClick={setThisMonthFilter}
                      className="px-3 py-1.5 bg-slate-600 hover:bg-blue-600 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-all"
                    >
                      {t('accounts.general_ledger.search.this_month')}
                    </button>
                    <button
                      onClick={setThisYearFilter}
                      className="px-3 py-1.5 bg-slate-600 hover:bg-blue-600 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-all"
                    >
                      {t('accounts.general_ledger.search.this_year')}
                    </button>
                  </div>
                </div>

                {/* Voucher Type */}
                <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">
                    <FileText size={16} />
                    {t('accounts.general_ledger.search.voucher_type')}
                  </label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={voucherType}
                    onChange={(e) => setVoucherType(e.target.value)}
                  >
                    <option value="">{t('accounts.general_ledger.search.all_voucher_types')}</option>
                    <option value="Journal">{t('accounts.general_ledger.search.journal_voucher')}</option>
                    <option value="Payment">{t('accounts.general_ledger.search.payment_voucher')}</option>
                    <option value="Receipt">{t('accounts.general_ledger.search.receipt_voucher')}</option>
                    <option value="Contra">{t('accounts.general_ledger.search.contra_voucher')}</option>
                  </select>
                </div>

                {/* Status */}
                <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                  <label className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide">
                    <Filter size={16} />
                    {t('accounts.general_ledger.search.transaction_status')}
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
                    {t('accounts.general_ledger.search.amount_range_optional')}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-400 mb-2 block">{t('accounts.general_ledger.search.minimum_amount')}</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder={t('accounts.general_ledger.search.000')}
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-400 mb-2 block">{t('accounts.general_ledger.search.maximum_amount')}</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder={t('accounts.general_ledger.search.000')}
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
                    {t('accounts.general_ledger.search.reset_filters')}
                  </button>
                  <button
                    onClick={handleGenerateReport}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg hover:shadow-blue-500/50"
                  >
                    <SearchIcon size={18} />
                    {t('accounts.general_ledger.search.generate_report')}
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

export default GeneralLedgerSearch;

