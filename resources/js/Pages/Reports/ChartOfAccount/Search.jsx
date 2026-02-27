import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '../../../../Components/Layout/AppLayout';
import {
  Building, MapPin, Search, ChevronRight, FileText
} from 'lucide-react';

/**
 * Chart of Account Report Search Component
 * 
 * Allows users to select company and location before viewing the report
 */
const ChartOfAccountSearch = () => {
  const { auth, companies, locations, isParentCompany } = usePage().props;
  
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleCompanyChange = (e) => {
    setSelectedCompany(e.target.value);
    setSelectedLocation(''); // Reset location when company changes
    fetchLocations(e.target.value);
  };

  const fetchLocations = (companyId) => {
    // Locations will be populated from the parent component via props
    // This is handled by Laravel Inertia
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!selectedCompany) {
      setErrors({ company: 'Please select a company' });
      return;
    }
    
    if (!selectedLocation) {
      setErrors({ location: 'Please select a location' });
      return;
    }

    setLoading(true);
    router.get(route('accounts.reports.chart-of-account.report'), {
      comp_id: selectedCompany,
      location_id: selectedLocation,
    }, {
      onFinish: () => setLoading(false)
    });
  };

  return (
    <AppLayout>
      <Head title="Chart of Accounts Report" />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-blue-100 rounded-lg mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Chart of Accounts Report
          </h1>
          <p className="text-gray-600 text-lg">
            View and analyze your account structure following IFRS standards
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            
            {/* Company Selection */}
            {isParentCompany && (
              <div className="mb-6">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 mb-3">
                  <Building className="w-5 h-5 text-blue-600" />
                  Select Company
                </label>
                <select
                  value={selectedCompany}
                  onChange={handleCompanyChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg text-gray-900 text-base focus:outline-none transition ${
                    errors.company
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                >
                  <option value="">Choose a company...</option>
                  {companies && companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.company_name}
                    </option>
                  ))}
                </select>
                {errors.company && (
                  <p className="text-red-600 text-sm mt-2">{errors.company}</p>
                )}
              </div>
            )}

            {/* Location Selection */}
            {selectedCompany && locations && (
              <div className="mb-6">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 mb-3">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Select Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg text-gray-900 text-base focus:outline-none transition ${
                    errors.location
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                >
                  <option value="">Choose a location...</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.location_name}
                    </option>
                  ))}
                </select>
                {errors.location && (
                  <p className="text-red-600 text-sm mt-2">{errors.location}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !selectedCompany || !selectedLocation}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Search className="w-5 h-5" />
              {loading ? 'Loading Report...' : 'View Report'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Information Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Hierarchical Structure</h3>
            <p className="text-sm text-blue-800">
              View accounts organized by level from main categories to transactional accounts
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-2">IFRS Compliant</h3>
            <p className="text-sm text-green-800">
              Follows IAS 1, IFRS 8, and other international accounting standards
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
            <h3 className="font-semibold text-purple-900 mb-2">Account Analysis</h3>
            <p className="text-sm text-purple-800">
              Analyze balances, transactions, and account classifications
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ChartOfAccountSearch;
