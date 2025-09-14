import React, { useState, useEffect } from 'react';
import { Building2, Globe, Mail, Phone, MapPin, Calendar, CreditCard, Shield, FileText, Plus, Home, List } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
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
        Register a new company in the system
      </div>
    </div>
  );
};

// Company Registration Form Component
const CreateCompanyForm = () => {
  const { errors: pageErrors, flash } = usePage().props;
  
  const companyFields = [
    // Company Basic Information
    {
      name: 'company_name',
      label: 'Company Name',
      type: 'text',
      placeholder: 'Enter company name',
      icon: Building2,
      required: true
    },
    {
      name: 'company_code',
      label: 'Company Code',
      type: 'text',
      placeholder: 'Enter unique company code (optional)',
      icon: FileText,
      required: false
    },
    {
      name: 'legal_name',
      label: 'Legal Name',
      type: 'text',
      placeholder: 'Enter legal company name',
      icon: Shield,
      required: false
    },
    {
      name: 'trading_name',
      label: 'Trading Name',
      type: 'text',
      placeholder: 'Enter trading name (if different)',
      icon: Building2,
      required: false
    },
    
    // Registration Details
    {
      name: 'registration_number',
      label: 'Registration Number',
      type: 'text',
      placeholder: 'Enter company registration number',
      icon: FileText,
      required: true
    },
    {
      name: 'tax_id',
      label: 'Tax ID',
      type: 'text',
      placeholder: 'Enter tax identification number',
      icon: CreditCard,
      required: false
    },
    {
      name: 'vat_number',
      label: 'VAT Number',
      type: 'text',
      placeholder: 'Enter VAT number',
      icon: CreditCard,
      required: false
    },
    {
      name: 'incorporation_date',
      label: 'Incorporation Date',
      type: 'date',
      placeholder: 'Select incorporation date',
      icon: Calendar,
      required: false
    },
    {
      name: 'company_type',
      label: 'Company Type',
      type: 'select',
      placeholder: 'Select company type',
      icon: Building2,
      required: true,
      options: [
        { value: 'private_limited', label: 'Private Limited' },
        { value: 'public_limited', label: 'Public Limited' },
        { value: 'partnership', label: 'Partnership' },
        { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
        { value: 'llc', label: 'Limited Liability Company (LLC)' }
      ]
    },
    
    // Contact Information
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter company email address',
      icon: Mail,
      required: true
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: 'Enter company phone number',
      icon: Phone,
      required: false
    },
    {
      name: 'fax',
      label: 'Fax Number',
      type: 'tel',
      placeholder: 'Enter fax number (optional)',
      icon: Phone,
      required: false
    },
    {
      name: 'website',
      label: 'Website',
      type: 'url',
      placeholder: 'Enter company website URL',
      icon: Globe,
      required: false
    },
    
    // Address Information
    {
      name: 'address_line_1',
      label: 'Address Line 1',
      type: 'text',
      placeholder: 'Enter street address',
      icon: MapPin,
      required: true
    },
    {
      name: 'address_line_2',
      label: 'Address Line 2',
      type: 'text',
      placeholder: 'Enter additional address details',
      icon: MapPin,
      required: false
    },
    {
      name: 'city',
      label: 'City',
      type: 'text',
      placeholder: 'Enter city',
      icon: MapPin,
      required: true
    },
    {
      name: 'state_province',
      label: 'State/Province',
      type: 'text',
      placeholder: 'Enter state or province',
      icon: MapPin,
      required: false
    },
    {
      name: 'postal_code',
      label: 'Postal Code',
      type: 'text',
      placeholder: 'Enter postal code',
      icon: MapPin,
      required: false
    },
    {
      name: 'country',
      label: 'Country',
      type: 'text',
      placeholder: 'Enter country',
      icon: Globe,
      required: true
    },
    
    // Business Information
    {
      name: 'industry',
      label: 'Industry',
      type: 'text',
      placeholder: 'Enter industry sector',
      icon: Building2,
      required: false
    },
    {
      name: 'business_description',
      label: 'Business Description',
      type: 'textarea',
      placeholder: 'Describe the company business',
      icon: FileText,
      required: false,
      rows: 3
    },
    {
      name: 'employee_count',
      label: 'Employee Count',
      type: 'number',
      placeholder: 'Enter number of employees',
      icon: Building2,
      required: false,
      min: 0
    },
    {
      name: 'annual_revenue',
      label: 'Annual Revenue',
      type: 'number',
      placeholder: 'Enter annual revenue',
      icon: CreditCard,
      required: false,
      min: 0
    },
    {
      name: 'currency',
      label: 'Currency',
      type: 'select',
      placeholder: 'Select currency',
      icon: CreditCard,
      required: false,
      options: [
        { value: 'USD', label: 'US Dollar (USD)' },
        { value: 'EUR', label: 'Euro (EUR)' },
        { value: 'GBP', label: 'British Pound (GBP)' },
        { value: 'JPY', label: 'Japanese Yen (JPY)' },
        { value: 'CAD', label: 'Canadian Dollar (CAD)' },
        { value: 'AUD', label: 'Australian Dollar (AUD)' },
        { value: 'CHF', label: 'Swiss Franc (CHF)' },
        { value: 'CNY', label: 'Chinese Yuan (CNY)' },
        { value: 'INR', label: 'Indian Rupee (INR)' },
        { value: 'BRL', label: 'Brazilian Real (BRL)' }
      ]
    },
    
    // Company Branding
    {
      name: 'logo',
      label: 'Company Logo',
      type: 'file-image',
      placeholder: 'Upload company logo',
      required: false
    },
    
    // System Settings
    {
      name: 'status',
      label: 'Status',
      type: 'toggle',
      required: false
    },
    {
      name: 'subscription_status',
      label: 'Subscription Status',
      type: 'select',
      placeholder: 'Select subscription status',
      icon: CreditCard,
      required: true,
      options: [
        { value: 'trial', label: 'Trial' },
        { value: 'active', label: 'Active' },
        { value: 'expired', label: 'Expired' },
        { value: 'suspended', label: 'Suspended' }
      ]
    }
  ];

  // State for debugging and tracking
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [requestStatus, setRequestStatus] = useState('');

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

  const handleCompanySubmit = async (submittedFormData) => {
    console.log("Form submitted with data:", submittedFormData);
    setErrors({});
    setAlert(null);
    setRequestStatus('Sending request...');

    try {
      // Client-side validation using the actual submitted data
      const newErrors = {};

      if (!submittedFormData.company_name || !submittedFormData.company_name.trim()) {
        newErrors.company_name = 'Company name is required';
      } else if (submittedFormData.company_name.trim().length < 2) {
        newErrors.company_name = 'Company name must be at least 2 characters';
      }

      if (!submittedFormData.registration_number || !submittedFormData.registration_number.trim()) {
        newErrors.registration_number = 'Registration number is required';
      }

      if (!submittedFormData.email || !submittedFormData.email.trim()) {
        newErrors.email = 'Email address is required';
      } else if (!/\S+@\S+\.\S+/.test(submittedFormData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!submittedFormData.address_line_1 || !submittedFormData.address_line_1.trim()) {
        newErrors.address_line_1 = 'Address is required';
      }

      if (!submittedFormData.city || !submittedFormData.city.trim()) {
        newErrors.city = 'City is required';
      }

      if (!submittedFormData.country || !submittedFormData.country.trim()) {
        newErrors.country = 'Country is required';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setAlert({
          type: 'error',
          message: 'Please correct the errors below and try again.'
        });
        setRequestStatus('Validation failed');
        return;
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      Object.keys(submittedFormData).forEach(key => {
        if (submittedFormData[key] !== null && submittedFormData[key] !== undefined) {
          if (key === 'status') {
            formDataToSend.append(key, submittedFormData[key] ? '1' : '0');
          } else {
            formDataToSend.append(key, submittedFormData[key]);
          }
        }
      });

      // Debug log
      console.log('Sending FormData with:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      // Make the request using Inertia
      router.post('/system/companies', formDataToSend, {
        forceFormData: true,
        onStart: () => {
          setRequestStatus('Request started');
        },
        onProgress: () => {
          setRequestStatus('Uploading...');
        },
        onSuccess: (page) => {
          setRequestStatus('Success');
          setAlert({
            type: 'success',
            message: 'Company registered successfully!'
          });
        },
        onError: (errors) => {
          console.log('Server validation errors:', errors);
          setRequestStatus('Server validation failed');
          setErrors(errors);
          setAlert({
            type: 'error',
            message: 'Failed to register company. Please check the errors below.'
          });
        },
        onFinish: () => {
          setRequestStatus('Request finished');
        }
      });

    } catch (error) {
      console.error('Form submission error:', error);
      setRequestStatus('Exception: ' + error.message);
      setAlert({
        type: 'error',
        message: error.message || 'Failed to register company. Please try again.'
      });
    }
  };

  const handleReset = () => {
    setErrors({});
    setAlert(null);
    setRequestStatus('');
  };

  // Breadcrumb items configuration
  const breadcrumbItems = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/dashboard'
    },
    {
      label: 'Companies',
      icon: Building2,
      href: '/system/companies'
    },
    {
      label: 'Register Company',
      icon: Plus,
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

      {/* Company Registration Form */}
      <GeneralizedForm
        title="Register New Company"
        subtitle="Complete the company registration form with all required information"
        fields={companyFields}
        onSubmit={handleCompanySubmit}
        submitText="Register Company"
        resetText="Clear Form"
        initialData={{ 
          company_name: '',
          company_code: '',
          legal_name: '',
          trading_name: '',
          registration_number: '',
          tax_id: '',
          vat_number: '',
          incorporation_date: '',
          company_type: '',
          email: '',
          phone: '',
          fax: '',
          website: '',
          address_line_1: '',
          address_line_2: '',
          city: '',
          state_province: '',
          postal_code: '',
          country: '',
          industry: '',
          business_description: '',
          employee_count: '',
          annual_revenue: '',
          currency: 'USD',
          logo: null,
          status: true,
          subscription_status: 'trial'
        }}
        showReset={true}
      />
    </div>
  );
};

// Main Create Component
const Create = () => {
  return (
    <App>
      {/* Main Content Card */}
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <CreateCompanyForm />
        </div>
      </div>
    </App>
  );
};

export default Create;
