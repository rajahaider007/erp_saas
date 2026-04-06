import React, { useState, useEffect, useMemo } from 'react';
import { Building2, Globe, Mail, Phone, MapPin, Calendar, CreditCard, Shield, FileText, Plus, Home, List, Edit, Package, Users, HardDrive } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import PermissionAwareForm, { PermissionButton } from '../../../Components/PermissionAwareForm';
import { usePermissions } from '../../../hooks/usePermissions';
import App from "../../App.jsx";
import { router, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

// Professional Breadcrumbs Component
const Breadcrumbs = ({ items, description }) => {
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

      <div className="breadcrumbs-description">{description}</div>
    </div>
  );
};

// Company Form Component (Unified for Create and Edit)
const CreateCompanyForm = () => {
  const { t } = useTranslations();
  const { errors: pageErrors, flash, company, currencies, isParentCompany, restrictedFields, packages } = usePage().props;
  const isEdit = !!company;

  const sl = (field) => {
    const key = field === 'state_province' ? 'stateprovince' : field;
    return t(`system.companies.show.${key}`);
  };

  const tc = (suffix) => t(`system.companies.create.${suffix}`);

  const companyFields = useMemo(
    () => [
      {
        name: 'company_name',
        label: sl('company_name'),
        type: 'text',
        placeholder: tc('ph_company_name'),
        icon: Building2,
        required: true,
      },
      {
        name: 'company_code',
        label: sl('company_code'),
        type: 'text',
        placeholder: tc('ph_company_code'),
        icon: FileText,
        required: false,
      },
      {
        name: 'legal_name',
        label: sl('legal_name'),
        type: 'text',
        placeholder: tc('ph_legal_name'),
        icon: Shield,
        required: false,
      },
      {
        name: 'trading_name',
        label: sl('trading_name'),
        type: 'text',
        placeholder: tc('ph_trading_name'),
        icon: Building2,
        required: false,
      },
      {
        name: 'registration_number',
        label: sl('registration_number'),
        type: 'text',
        placeholder: tc('ph_registration_number'),
        icon: FileText,
        required: true,
      },
      {
        name: 'tax_id',
        label: sl('tax_id'),
        type: 'text',
        placeholder: tc('ph_tax_id'),
        icon: CreditCard,
        required: false,
      },
      {
        name: 'vat_number',
        label: sl('vat_number'),
        type: 'text',
        placeholder: tc('ph_vat_number'),
        icon: CreditCard,
        required: false,
      },
      {
        name: 'incorporation_date',
        label: sl('incorporation_date'),
        type: 'date',
        placeholder: tc('ph_incorporation_date'),
        icon: Calendar,
        required: false,
      },
      {
        name: 'company_type',
        label: sl('company_type'),
        type: 'select',
        placeholder: tc('ph_company_type'),
        icon: Building2,
        required: true,
        options: [
          { value: 'private_limited', label: tc('opt_private_limited') },
          { value: 'public_limited', label: tc('opt_public_limited') },
          { value: 'partnership', label: tc('opt_partnership') },
          { value: 'sole_proprietorship', label: tc('opt_sole_proprietorship') },
          { value: 'llc', label: tc('opt_llc') },
        ],
      },
      {
        name: 'email',
        label: sl('email'),
        type: 'email',
        placeholder: tc('ph_email'),
        icon: Mail,
        required: true,
      },
      {
        name: 'phone',
        label: sl('phone'),
        type: 'tel',
        placeholder: tc('ph_phone'),
        icon: Phone,
        required: false,
      },
      {
        name: 'fax',
        label: sl('fax'),
        type: 'tel',
        placeholder: tc('ph_fax'),
        icon: Phone,
        required: false,
      },
      {
        name: 'website',
        label: sl('website'),
        type: 'url',
        placeholder: tc('ph_website'),
        icon: Globe,
        required: false,
      },
      {
        name: 'address_line_1',
        label: sl('address_line_1'),
        type: 'text',
        placeholder: tc('ph_address_line_1'),
        icon: MapPin,
        required: true,
      },
      {
        name: 'address_line_2',
        label: sl('address_line_2'),
        type: 'text',
        placeholder: tc('ph_address_line_2'),
        icon: MapPin,
        required: false,
      },
      {
        name: 'city',
        label: sl('city'),
        type: 'text',
        placeholder: tc('ph_city'),
        icon: MapPin,
        required: true,
      },
      {
        name: 'state_province',
        label: sl('state_province'),
        type: 'text',
        placeholder: tc('ph_state_province'),
        icon: MapPin,
        required: false,
      },
      {
        name: 'postal_code',
        label: sl('postal_code'),
        type: 'text',
        placeholder: tc('ph_postal_code'),
        icon: MapPin,
        required: false,
      },
      {
        name: 'country',
        label: sl('country'),
        type: 'text',
        placeholder: tc('ph_country'),
        icon: Globe,
        required: true,
      },
      {
        name: 'industry',
        label: sl('industry'),
        type: 'text',
        placeholder: tc('ph_industry'),
        icon: Building2,
        required: false,
      },
      {
        name: 'business_description',
        label: sl('business_description'),
        type: 'textarea',
        placeholder: tc('ph_business_description'),
        icon: FileText,
        required: false,
        rows: 3,
      },
      {
        name: 'employee_count',
        label: sl('employee_count'),
        type: 'number',
        placeholder: tc('ph_employee_count'),
        icon: Building2,
        required: false,
        min: 0,
      },
      {
        name: 'annual_revenue',
        label: sl('annual_revenue'),
        type: 'number',
        placeholder: tc('ph_annual_revenue'),
        icon: CreditCard,
        required: false,
        min: 0,
      },
      {
        name: 'currency',
        label: sl('currency'),
        type: 'select',
        placeholder: tc('ph_currency'),
        icon: CreditCard,
        required: false,
        options: currencies || [],
      },
      {
        name: 'logo',
        label: tc('lbl_company_logo'),
        type: 'file-image',
        placeholder: tc('ph_logo'),
        required: false,
      },
      {
        name: 'status',
        label: sl('status'),
        type: 'toggle',
        required: false,
      },
      {
        name: 'auto_voucher_numbering',
        label: tc('lbl_auto_voucher_numbering'),
        type: 'toggle',
        required: false,
      },
      {
        name: 'package_id',
        label: tc('lbl_package'),
        type: 'select',
        placeholder: tc('ph_package'),
        icon: Package,
        required: true,
        options:
          packages?.map((pkg) => ({
            value: pkg.id,
            label: pkg.package_name,
          })) || [],
      },
      {
        name: 'license_number',
        label: tc('lbl_license_number'),
        type: 'text',
        placeholder: tc('ph_license_number'),
        icon: Shield,
        required: false,
      },
      {
        name: 'license_start_date',
        label: tc('lbl_license_start_date'),
        type: 'date',
        placeholder: tc('ph_license_start_date'),
        icon: Calendar,
        required: true,
      },
      {
        name: 'license_end_date',
        label: tc('lbl_license_end_date'),
        type: 'date',
        placeholder: tc('ph_license_end_date'),
        icon: Calendar,
        required: true,
      },
      {
        name: 'parent_comp',
        label: tc('lbl_parent_company'),
        type: 'select',
        placeholder: tc('ph_parent_comp'),
        icon: Building2,
        required: false,
        options: [
          { value: 'Yes', label: tc('opt_yes_parent') },
          { value: 'No', label: tc('opt_no_customer') },
        ],
      },
      {
        name: 'attachment_storage_limit_mb',
        label: tc('lbl_attachment_storage_limit_mb'),
        type: 'number',
        placeholder: tc('ph_attachment_storage_limit_mb'),
        icon: HardDrive,
        required: false,
        min: 1,
        max: 10000,
      },
    ],
    [t, currencies, packages]
  );

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
        message: t('common.form_errors.please_correct'),
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
            message: isEdit ? tc('success_updated') : tc('success_registered'),
          });
        },
        onError: (errors) => {
          setRequestStatus('error');
          setErrors(errors);
          setAlert({
            type: 'error',
            message: t('common.form_errors.please_correct'),
          });
        }
      });
    } catch (error) {
      setRequestStatus('error');
      setAlert({
        type: 'error',
        message: t('common.form_errors.unexpected'),
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
      label: t('common.breadcrumbs.dashboard'),
      icon: Home,
      href: '/dashboard',
    },
    {
      label: t('common.breadcrumbs.system'),
      icon: List,
      href: '#',
    },
    {
      label: tc('breadcrumb_companies'),
      icon: Building2,
      href: '/system/companies',
    },
    {
      label: isEdit ? tc('breadcrumb_edit') : tc('breadcrumb_register'),
      icon: isEdit ? Edit : Plus,
      href: null,
    },
  ];

  return (
    <div>
      {/* Professional Breadcrumbs */}
      <Breadcrumbs
        items={breadcrumbItems}
        description={isEdit ? tc('breadcrumb_desc_edit') : tc('breadcrumb_desc_create')}
      />

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
        title={isEdit ? tc('title_edit') : tc('title_register')}
        subtitle={isEdit ? tc('subtitle_edit') : tc('subtitle_register')}
        fields={filteredFields}
        onSubmit={handleCompanySubmit}
        submitText={isEdit ? tc('submit_update') : tc('submit_register')}
        resetText={t('common.form_actions.clear_form')}
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
  const { t } = useTranslations();

  return (
    <App>
      {/* Main Content Card */}
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <PermissionAwareForm
            requiredPermission="can_add"
            route="/system/companies"
            fallbackMessage={t('system.companies.create.permission_fallback')}
          >
            <CreateCompanyForm />
          </PermissionAwareForm>
        </div>
      </div>
    </App>
  );
};

export default Create;
