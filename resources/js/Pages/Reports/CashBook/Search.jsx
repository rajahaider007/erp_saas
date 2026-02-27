import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '../../../../Components/Layout/AppLayout';
import {
  Building, MapPin, Search, ChevronRight, FileText, CreditCard
} from 'lucide-react';

/**
 * Cash Book Report Search Component
 * 
 * Allows users to select company and location before viewing the cash book report
 */
const CashBookSearch = () => {
  const { auth, companies, locations, isParentCompany } = usePage().props;
  
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleCompanyChange = (e) => {
    setSelectedCompany(e.target.value);
    setSelectedLocation(''); // Reset location when company changes
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
    router.get(route('accounts.reports.cash-book.report'), {
      comp_id: selectedCompany,
      location_id: selectedLocation,
    }, {
      onFinish: () => setLoading(false)
    });
  };

  return (
    <AppLayout>
      <Head title="Cash Book Report" />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-green-100 rounded-lg mb-4">
            <CreditCard className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Cash Book Report
          </h1>
          <p className="text-gray-600 text-lg">
            Track cash and bank account transactions for bank reconciliation and liquidity analysis
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
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Search className="w-5 h-5" />
              {loading ? 'Loading Report...' : 'View Cash Book'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Information Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-2">Bank Reconciliation</h3>
            <p className="text-sm text-green-800">
              Track opening balance, receipts, payments, and closing balance for bank reconciliation
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Cash Flow Analysis</h3>
            <p className="text-sm text-blue-800">
              Analyze cash movements and liquidity following IAS 7 standards
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
            <h3 className="font-semibold text-purple-900 mb-2">Transaction Details</h3>
            <p className="text-sm text-purple-800">
              View detailed transaction listings with running balance calculations
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="mt-12 bg-gray-50 rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-600 text-white">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Multi-Account Support</h3>
                <p className="text-gray-600">View all bank and cash accounts or focus on a specific account</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-600 text-white">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Running Balance</h3>
                <p className="text-gray-600">Track running balance for each transaction for easy verification</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-600 text-white">
                  <Building className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Multi-Currency</h3>
                <p className="text-gray-600">Support for multiple currencies in different bank accounts</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-orange-600 text-white">
                  <Search className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Advanced Filtering</h3>
                <p className="text-gray-600">Filter by date range, search by description, and view type options</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CashBookSearch;
