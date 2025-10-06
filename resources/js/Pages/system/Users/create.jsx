import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Building, Users, 
  Home, List, Plus, Edit, Lock, Shield, Globe, 
  Clock, DollarSign, Palette, Eye, EyeOff
} from 'lucide-react';
import DynamicUserForm from '../../../Components/DynamicUserForm';
import App from "../../App.jsx";
import { router, usePage } from '@inertiajs/react';

// Professional Breadcrumbs Component
const Breadcrumbs = ({ items, isEdit }) => {
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
        {isEdit ? 'Update user information and settings' : 'Register a new user in the system'}
      </div>
    </div>
  );
};

// User Registration Form Component (Unified for Create and Edit)
const UserRegistrationForm = () => {
  const { errors: pageErrors, flash, companies, locations, departments, user } = usePage().props;
  const isEdit = !!user;
  
  const userFields = [
    // Personal Information Section
    {
      name: 'fname',
      label: 'First Name',
      type: 'text',
      placeholder: 'Enter first name',
      icon: User,
      required: true
    },
    {
      name: 'mname',
      label: 'Middle Name',
      type: 'text',
      placeholder: 'Enter middle name (optional)',
      icon: User,
      required: false
    },
    {
      name: 'lname',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Enter last name',
      icon: User,
      required: true
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter email address',
      icon: Mail,
      required: true
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      placeholder: 'Enter phone number',
      icon: Phone,
      required: false
    },
    {
      name: 'loginid',
      label: 'Login ID',
      type: 'text',
      placeholder: 'Enter unique login ID',
      icon: User,
      required: true
    },
    {
      name: 'pincode',
      label: 'Pin Code',
      type: 'text',
      placeholder: 'Enter pin code',
      icon: MapPin,
      required: false
    },
    
    // Organization Information Section
    {
      name: 'comp_id',
      label: 'Company',
      type: 'select',
      placeholder: 'Select company',
      icon: Building,
      required: false,
      options: companies?.map(company => ({
        value: company.id,
        label: company.company_name
      })) || []
    },
    {
      name: 'location_id',
      label: 'Location',
      type: 'select',
      placeholder: 'Select location',
      icon: MapPin,
      required: false,
      options: locations?.map(location => ({
        value: location.id,
        label: location.location_name
      })) || []
    },
    {
      name: 'dept_id',
      label: 'Department',
      type: 'select',
      placeholder: 'Select department',
      icon: Users,
      required: false,
      options: departments?.map(department => ({
        value: department.id,
        label: department.department_name
      })) || []
    },
    
    // Security Section
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      placeholder: isEdit ? 'Enter new password (leave blank to keep current)' : 'Enter password',
      icon: Lock,
      required: !isEdit
    },
    {
      name: 'password_confirmation',
      label: 'Confirm Password',
      type: 'password',
      placeholder: isEdit ? 'Confirm new password' : 'Confirm password',
      icon: Lock,
      required: !isEdit
    },
    
    // Role and Status Section
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      placeholder: 'Select user role',
      icon: Shield,
      required: true,
      options: [
        { value: 'user', label: 'User' },
        { value: 'manager', label: 'Manager' },
        { value: 'admin', label: 'Admin' },
        { value: 'super_admin', label: 'Super Admin' }
      ]
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      placeholder: 'Select user status',
      icon: Shield,
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'suspended', label: 'Suspended' },
        { value: 'pending', label: 'Pending' }
      ]
    },
    
    // Preferences Section
    {
      name: 'timezone',
      label: 'Timezone',
      type: 'select',
      placeholder: 'Select timezone',
      icon: Clock,
      required: false,
      options: [
        { value: 'UTC', label: 'UTC' },
        { value: 'America/New_York', label: 'Eastern Time (ET)' },
        { value: 'America/Chicago', label: 'Central Time (CT)' },
        { value: 'America/Denver', label: 'Mountain Time (MT)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
        { value: 'Europe/London', label: 'London (GMT)' },
        { value: 'Europe/Paris', label: 'Paris (CET)' },
        { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
        { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
        { value: 'Asia/Kolkata', label: 'Mumbai (IST)' }
      ]
    },
    {
      name: 'language',
      label: 'Language',
      type: 'select',
      placeholder: 'Select language',
      icon: Globe,
      required: false,
      options: [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'de', label: 'German' },
        { value: 'it', label: 'Italian' },
        { value: 'pt', label: 'Portuguese' },
        { value: 'ru', label: 'Russian' },
        { value: 'ja', label: 'Japanese' },
        { value: 'ko', label: 'Korean' },
        { value: 'zh', label: 'Chinese' }
      ]
    },
    {
      name: 'currency',
      label: 'Currency',
      type: 'select',
      placeholder: 'Select currency',
      icon: DollarSign,
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
    {
      name: 'theme',
      label: 'Theme',
      type: 'select',
      placeholder: 'Select theme',
      icon: Palette,
      required: false,
      options: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'system', label: 'System Default' }
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

  const handleUserSubmit = async (submittedFormData) => {
    setRequestStatus('processing');
    setAlert(null);

    try {
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.keys(submittedFormData).forEach(key => {
        if (submittedFormData[key] !== null && submittedFormData[key] !== undefined) {
          // Skip empty passwords in edit mode
          if (isEdit && (key === 'password' || key === 'password_confirmation') && !submittedFormData[key]) {
            return;
          }
          formData.append(key, submittedFormData[key]);
        }
      });

      // Add _method for edit operations
      if (isEdit) {
        formData.append('_method', 'put');
      }

      const url = isEdit ? `/system/users/${user.id}` : '/system/users';

      router.post(url, formData, {
        forceFormData: true,
        onSuccess: (page) => {
          setRequestStatus('success');
          setAlert({
            type: 'success',
            message: isEdit ? 'User updated successfully!' : 'User registered successfully!'
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
      label: 'Users',
      icon: Users,
      href: '/system/users'
    },
    {
      label: isEdit ? 'Edit User' : 'Register User',
      icon: isEdit ? Edit : Plus,
      href: null
    }
  ];

  return (
    <div>
      {/* Professional Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} isEdit={isEdit} />

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

      {/* User Registration Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isEdit ? "Edit User" : "Register New User"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isEdit ? "Update user information and settings" : "Complete the user registration form with all required information"}
          </p>
        </div>
        
        <DynamicUserForm
          isEdit={isEdit}
          user={user}
          companies={companies}
          initialLocations={locations}
          initialDepartments={departments}
          availableMenus={usePage().props.availableMenus || []}
          userRights={usePage().props.userRights || {}}
          onSubmit={handleUserSubmit}
          submitText={isEdit ? "Update User" : "Register User"}
          resetText="Clear Form"
        />
      </div>
    </div>
  );
};

// Main Create Component
const Create = () => {
  return (
    <App>
      {/* Main Content Card */}
      <div className="rounded-xl shadow-lg form-container border-slate-200 form-theme-2">
        <div className="p-6">
          <UserRegistrationForm />
        </div>
      </div>
    </App>
  );
};

export default Create;
