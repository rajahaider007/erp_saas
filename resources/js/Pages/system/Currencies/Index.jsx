import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
  DollarSign, Plus, Edit, Trash2, Search, Filter, 
  ChevronDown, Globe, Star, TrendingUp, Home, List, Clock 
} from 'lucide-react';
import App from "../../App.jsx";

// Professional Breadcrumbs Component
const Breadcrumbs = ({ items }) => {
  return (
    <div className="breadcrumbs-themed">
      <nav className="breadcrumbs">
        {items.map((item, index) => (
          <div key={index} className="breadcrumb-item">
            <div className="breadcrumb-item-content">
              {item.icon && (
                <item.icon className={`breadcrumb-icon ${item.href
                  ? 'breadcrumb-icon-link'
                  : 'breadcrumb-icon-current'
                  }`} />
              )}

              {item.href ? (
                <a
                  href={item.href}
                  className="breadcrumb-link-themed"
                >
                  {item.label}
                </a>
              ) : (
                <span className="breadcrumb-current-themed">
                  {item.label}
                </span>
              )}
            </div>

            {index < items.length - 1 && (
              <div className="breadcrumb-separator breadcrumb-separator-themed">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-full h-full"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="breadcrumbs-description">
        Manage system currencies and exchange rates
      </div>
    </div>
  );
};

const CurrenciesIndex = () => {
  const { currencies, flash } = usePage().props;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [alert, setAlert] = useState(null);

  // Handle flash messages
  React.useEffect(() => {
    if (flash?.success) {
      setAlert({ type: 'success', message: flash.success });
      setTimeout(() => setAlert(null), 5000);
    } else if (flash?.error) {
      setAlert({ type: 'error', message: flash.error });
      setTimeout(() => setAlert(null), 5000);
    }
  }, [flash]);

  const handleToggleStatus = (currencyId) => {
    router.post(`/system/currencies/${currencyId}/toggle-status`, {}, {
      preserveScroll: true,
    });
  };

  const handleSetAsBase = (currencyId) => {
    if (confirm('Are you sure you want to set this as the base currency? This will reset its exchange rate to 1.0000')) {
      router.post(`/system/currencies/${currencyId}/set-as-base`, {}, {
        preserveScroll: true,
      });
    }
  };

  const handleDelete = (currencyId) => {
    if (confirm('Are you sure you want to delete this currency?')) {
      router.delete(`/system/currencies/${currencyId}`, {
        preserveScroll: true,
      });
    }
  };

  const handleUpdateFromApi = () => {
    if (confirm('This will update exchange rates from external API. Continue?')) {
      setAlert({ type: 'info', message: 'Updating exchange rates... Please wait.' });
      router.post('/system/currencies/update-from-api', {
        provider: 'frankfurter'
      }, {
        preserveScroll: true,
      });
    }
  };

  const handleViewHistory = (currencyId) => {
    router.visit(`/system/currencies/${currencyId}/history`);
  };

  const filteredCurrencies = currencies.data.filter(currency => {
    const matchesSearch = 
      currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currency.country.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterActive === 'all' ? true :
      filterActive === 'active' ? currency.is_active :
      !currency.is_active;

    return matchesSearch && matchesFilter;
  });

  const breadcrumbItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: List, label: 'System', href: '/system' },
    { icon: DollarSign, label: 'Currencies' }
  ];

  return (
    <App>
      <div className="container-modern">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Alert Messages */}
        {alert && (
          <div className={`alert alert-${alert.type} mb-4`}>
            <div className="flex items-center">
              <div className={`w-5 h-5 mr-3 ${alert.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {alert.type === 'success' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{alert.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Currencies Management</h1>
            <p className="page-subtitle">Manage currencies and exchange rates</p>
          </div>
          <div className="page-actions">
            <button
              onClick={() => router.visit('/system/currencies/converter')}
              className="btn btn-secondary mr-2"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Currency Converter
            </button>
            <button
              onClick={() => handleUpdateFromApi()}
              className="btn btn-info mr-2"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Update Rates from API
            </button>
            <button
              onClick={() => router.visit('/system/currencies/create')}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Currency
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search currencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-buttons">
            <button
              onClick={() => setFilterActive('all')}
              className={`filter-button ${filterActive === 'all' ? 'active' : ''}`}
            >
              All ({currencies.data.length})
            </button>
            <button
              onClick={() => setFilterActive('active')}
              className={`filter-button ${filterActive === 'active' ? 'active' : ''}`}
            >
              Active ({currencies.data.filter(c => c.is_active).length})
            </button>
            <button
              onClick={() => setFilterActive('inactive')}
              className={`filter-button ${filterActive === 'inactive' ? 'active' : ''}`}
            >
              Inactive ({currencies.data.filter(c => !c.is_active).length})
            </button>
          </div>
        </div>

        {/* Currencies Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Currency</th>
                  <th>Symbol</th>
                  <th>Country</th>
                  <th>Exchange Rate</th>
                  <th>Status</th>
                  <th>Base</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCurrencies.length > 0 ? (
                  filteredCurrencies.map((currency) => (
                    <tr key={currency.id}>
                      <td className="font-semibold">{currency.code}</td>
                      <td>{currency.name}</td>
                      <td className="text-xl">{currency.symbol}</td>
                      <td>
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-2 text-gray-400" />
                          {currency.country}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                          {parseFloat(currency.exchange_rate).toFixed(4)}
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleStatus(currency.id)}
                          className={`badge ${currency.is_active ? 'badge-success' : 'badge-error'}`}
                          disabled={currency.is_base_currency}
                        >
                          {currency.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td>
                        {currency.is_base_currency ? (
                          <span className="badge badge-warning flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            Base Currency
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetAsBase(currency.id)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Set as Base
                          </button>
                        )}
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewHistory(currency.id)}
                            className="btn-icon btn-icon-info"
                            title="View History"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.visit(`/system/currencies/${currency.id}/edit`)}
                            className="btn-icon btn-icon-primary"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(currency.id)}
                            className="btn-icon btn-icon-danger"
                            title="Delete"
                            disabled={currency.is_base_currency}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-500">
                      No currencies found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {currencies.links && currencies.links.length > 3 && (
            <div className="pagination">
              {currencies.links.map((link, index) => (
                <button
                  key={index}
                  onClick={() => link.url && router.visit(link.url)}
                  disabled={!link.url}
                  className={`pagination-button ${link.active ? 'active' : ''}`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </App>
  );
};

export default CurrenciesIndex;

