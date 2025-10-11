import React, { useState, useEffect } from 'react';
import { DollarSign, Globe, TrendingUp, Hash, Star, Home, List, Plus, Edit } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import PermissionAwareForm, { PermissionButton } from '../../../Components/PermissionAwareForm';
import { usePermissions } from '../../../hooks/usePermissions';
import App from "../../App.jsx";
import { router, usePage } from '@inertiajs/react';

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
        {usePage().props.currency ? 'Update currency information' : 'Add a new currency to the system'}
      </div>
    </div>
  );
};

// Currency Form Component (Unified for Create and Edit)
const CreateCurrencyForm = () => {
  const { errors: pageErrors, flash, currency } = usePage().props;
  const isEdit = !!currency;
  
  const currencyFields = [
    {
      name: 'code',
      label: 'Currency Code',
      type: 'text',
      placeholder: 'e.g., USD, EUR, GBP',
      icon: Hash,
      required: true,
      maxLength: 3
    },
    {
      name: 'name',
      label: 'Currency Name',
      type: 'text',
      placeholder: 'e.g., United States Dollar',
      icon: DollarSign,
      required: true
    },
    {
      name: 'symbol',
      label: 'Currency Symbol',
      type: 'text',
      placeholder: 'e.g., $, €, £',
      icon: DollarSign,
      required: true
    },
    {
      name: 'country',
      label: 'Country',
      type: 'text',
      placeholder: 'e.g., United States',
      icon: Globe,
      required: true
    },
    {
      name: 'exchange_rate',
      label: 'Exchange Rate',
      type: 'number',
      placeholder: 'Exchange rate to base currency',
      icon: TrendingUp,
      required: true,
      min: 0,
      step: 0.0001
    },
    {
      name: 'is_active',
      label: 'Active Status',
      type: 'toggle',
      required: false
    },
    {
      name: 'is_base_currency',
      label: 'Set as Base Currency',
      type: 'toggle',
      required: false
    },
    {
      name: 'sort_order',
      label: 'Sort Order',
      type: 'number',
      placeholder: 'Display order (lower number = higher priority)',
      icon: Hash,
      required: false,
      min: 0
    }
  ];

  // State for debugging and tracking
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  // Handle page errors from Laravel
  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setErrors(pageErrors);
      setAlert({
        type: 'error',
        message: 'Please correct the errors below and try again.'
      });
    }
  }, [pageErrors]);

  // Handle flash messages
  useEffect(() => {
    if (flash?.success) {
      setAlert({
        type: 'success',
        message: flash.success
      });
    } else if (flash?.error) {
      setAlert({
        type: 'error',
        message: flash.error
      });
    }
  }, [flash]);

  const handleCurrencySubmit = async (submittedFormData) => {
    setAlert(null);

    try {
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.keys(submittedFormData).forEach(key => {
        if (submittedFormData[key] !== null && submittedFormData[key] !== undefined) {
          formData.append(key, submittedFormData[key]);
        }
      });

      // Add _method for edit operations
      if (isEdit) {
        formData.append('_method', 'put');
      }

      const url = isEdit ? `/system/currencies/${currency.id}` : '/system/currencies';

      router.post(url, formData, {
        forceFormData: true,
        onSuccess: (page) => {
          setAlert({
            type: 'success',
            message: isEdit ? 'Currency updated successfully!' : 'Currency created successfully!'
          });
        },
        onError: (errors) => {
          setErrors(errors);
          setAlert({
            type: 'error',
            message: 'Please correct the errors below and try again.'
          });
        }
      });
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.'
      });
    }
  };

  const handleReset = () => {
    setErrors({});
    setAlert(null);
  };

  // Breadcrumb items configuration
  const breadcrumbItems = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard'
    },
    {
      label: 'System',
      icon: List,
      href: '#'
    },
    {
      label: 'Currencies',
      icon: DollarSign,
      href: '/system/currencies'
    },
    {
      label: isEdit ? 'Edit Currency' : 'Add Currency',
      icon: isEdit ? Edit : Plus,
      href: null
    }
  ];

  return (
    <div>
      {/* Professional Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Alert Messages */}
      {alert && (
        <div className={`mb-4 p-4 rounded-lg animate-slideIn ${alert.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
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
            <div className="ml-3">
              <p className="text-sm font-medium">{alert.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Currency Form */}
      <GeneralizedForm
        title={isEdit ? "Edit Currency" : "Add New Currency"}
        subtitle={isEdit ? "Update currency information and exchange rate" : "Add a new currency to the system"}
        fields={currencyFields}
        onSubmit={handleCurrencySubmit}
        submitText={isEdit ? "Update Currency" : "Add Currency"}
        resetText="Clear Form"
        initialData={{ 
          code: currency?.code || '',
          name: currency?.name || '',
          symbol: currency?.symbol || '',
          country: currency?.country || '',
          exchange_rate: currency?.exchange_rate || '',
          is_active: currency?.is_active ?? true,
          is_base_currency: currency?.is_base_currency ?? false,
          sort_order: currency?.sort_order || 0
        }}
        showReset={true}
      />
    </div>
  );
};

// Main Create Component
const Create = () => {
  const { canAdd } = usePermissions();
  
  return (
    <App>
      {/* Main Content Card */}
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <PermissionAwareForm
            requiredPermission="can_add"
            route="/system/currencies"
            fallbackMessage="You don't have permission to create currencies. Please contact your administrator."
          >
            <CreateCurrencyForm />
          </PermissionAwareForm>
        </div>
      </div>
    </App>
  );
};

export default Create;

