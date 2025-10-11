import React, { useState, useEffect } from 'react';
import { Building2, Globe, Mail, Phone, MapPin, Calendar, CreditCard, Shield, FileText, Plus, Home, List, Edit, Package, Users } from 'lucide-react';
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
        {usePage().props.company ? 'Update company information' : 'Register a new company in the system'}
      </div>
    </div>
  );
};

// Company Form Component (Unified for Create and Edit)
const CreateCompanyForm = () => {
  const { errors: pageErrors, flash, company, currencies, isParentCompany, restrictedFields } = usePage().props;
  const isEdit = !!company;
  
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
      options: currencies || []
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
      name: 'auto_voucher_numbering',
      label: 'Auto Voucher Numbering',
      type: 'toggle',
      required: false
    },
    {
      name: 'package_id',
      label: 'Package',
      type: 'select',
      placeholder: 'Select package',
      icon: Package,
      required: true,
      options: usePage().props.packages?.map(pkg => ({
        value: pkg.id,
        label: pkg.package_name
      })) || []
    },
    {
      name: 'license_number',
      label: 'License Number',
      type: 'text',
      placeholder: 'Enter license number',
      icon: Shield,
      required: false
    },
    {
      name: 'license_start_date',
      label: 'License Start Date',
      type: 'date',
      placeholder: 'Select license start date',
      icon: Calendar,
      required: true
    },
    {
      name: 'license_end_date',
      label: 'License End Date',
      type: 'date',
      placeholder: 'Select license end date',
      icon: Calendar,
      required: true
    },
    {
      name: 'parent_comp',
      label: 'Parent Company',
      type: 'select',
      placeholder: 'Is this a parent company?',
      icon: Building2,
      required: false,
      options: [
        { value: 'Yes', label: 'Yes - Parent Company' },
        { value: 'No', label: 'No - Customer Company' }
      ]
    },
  ];

  // Filter out restricted fields for customer companies
  const filteredFields = isParentCompany 
    ? companyFields 
    : companyFields.filter(field => !(restrictedFields || []).includes(field.name));

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
    setRequestStatus('processing');
    setAlert(null);

    try {
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.keys(submittedFormData).forEach(key => {
        if (submittedFormData[key] !== null && submittedFormData[key] !== undefined) {
          if (key === 'status') {
            formData.append(key, submittedFormData[key] ? '1' : '0');
          } else {
            formData.append(key, submittedFormData[key]);
          }
        }
      });

      // Add _method for edit operations
      if (isEdit) {
        formData.append('_method', 'put');
      }

      const url = isEdit ? `/system/companies/${company.id}` : '/system/companies';

      router.post(url, formData, {
        forceFormData: true,
        onSuccess: (page) => {
          setRequestStatus('success');
          setAlert({
            type: 'success',
            message: isEdit ? 'Company updated successfully!' : 'Company registered successfully!'
          });
        },
        onError: (errors) => {
          setRequestStatus('error');
          setErrors(errors);
          setAlert({
            type: 'error',
            message: 'Please correct the errors below and try again.'
          });
        }
      });
    } catch (error) {
      setRequestStatus('error');
      setAlert({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.'
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
      label: 'System',
      icon: List,
      href: '#'
    },
    {
      label: 'Companies',
      icon: Building2,
      href: '/system/companies'
    },
    {
      label: isEdit ? 'Edit Company' : 'Register Company',
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

      {/* Company Form */}
      <GeneralizedForm
        title={isEdit ? "Edit Company" : "Register New Company"}
        subtitle={isEdit ? "Update company information and settings" : "Complete the company registration form with all required information"}
        fields={filteredFields}
        onSubmit={handleCompanySubmit}
        submitText={isEdit ? "Update Company" : "Register Company"}
        resetText="Clear Form"
        initialData={{ 
          company_name: company?.company_name || '',
          company_code: company?.company_code || '',
          legal_name: company?.legal_name || '',
          trading_name: company?.trading_name || '',
          registration_number: company?.registration_number || '',
          tax_id: company?.tax_id || '',
          vat_number: company?.vat_number || '',
          incorporation_date: company?.incorporation_date || '',
          company_type: company?.company_type || '',
          email: company?.email || '',
          phone: company?.phone || '',
          fax: company?.fax || '',
          website: company?.website || '',
          address_line_1: company?.address_line_1 || '',
          address_line_2: company?.address_line_2 || '',
          city: company?.city || '',
          state_province: company?.state_province || '',
          postal_code: company?.postal_code || '',
          country: company?.country || '',
          industry: company?.industry || '',
          business_description: company?.business_description || '',
          employee_count: company?.employee_count || '',
          annual_revenue: company?.annual_revenue || '',
          currency: company?.currency || 'USD',
          logo: null,
          status: company?.status ?? true,
          package_id: company?.package_id || '',
          license_number: company?.license_number || '',
          license_start_date: formatDateForInput(company?.license_start_date),
          license_end_date: formatDateForInput(company?.license_end_date),
          parent_comp: company?.parent_comp || 'No',
        }}
        showReset={true}
      />
    </div>
  );
};

// Helper function to format date for HTML input
const formatDateForInput = (date) => {
  if (!date) return '';
  
  // If it's already in YYYY-MM-DD format, return as is
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  // If it's a date string with time, extract just the date part
  if (typeof date === 'string' && date.includes('T')) {
    return date.split('T')[0];
  }
  
  // If it's a date object or other format, convert to YYYY-MM-DD
  try {
    const dateObj = new Date(date);
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
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
            route="/system/companies"
            fallbackMessage="You don't have permission to create companies. Please contact your administrator."
          >
            <CreateCompanyForm />
          </PermissionAwareForm>
        </div>
      </div>
    </App>
  );
};

export default Create;
