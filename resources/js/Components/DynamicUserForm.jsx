import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
  User, Mail, Phone, MapPin, Lock, Shield, Building, Users, 
  Calendar, Globe, Palette, Clock, Languages, DollarSign, 
  CheckCircle, XCircle, AlertCircle, Loader2, Settings
} from 'lucide-react';
import UserRightsConfig from './UserRightsConfig';

const CustomAlert = { 
  fire: ({ title, text, icon, showCancelButton = false, confirmButtonText = 'OK', cancelButtonText = 'Cancel', onConfirm, onCancel }) => {
    // Simple alert implementation - you can replace this with SweetAlert or another library
    if (icon === 'success') {
      alert(`✅ ${title}\n${text}`);
    } else if (icon === 'error') {
      alert(`❌ ${title}\n${text}`);
    } else {
      alert(`${title}\n${text}`);
    }
  } 
};

const DynamicUserForm = ({ 
  isEdit = false, 
  user = null, 
  companies = [], 
  initialLocations = [], 
  initialDepartments = [],
  availableMenus = [],
  userRights = {},
  onSubmit,
  submitText = "Create User",
  resetText = "Reset Form"
}) => {
  const [formData, setFormData] = useState({
    fname: user?.fname || '',
    mname: user?.mname || '',
    lname: user?.lname || '',
    email: user?.email || '',
    phone: user?.phone || '',
    loginid: user?.loginid || '',
    pincode: user?.pincode || '',
    comp_id: user?.comp_id ? String(user.comp_id) : '',
    location_id: user?.location_id ? String(user.location_id) : '',
    dept_id: user?.dept_id ? String(user.dept_id) : '',
    password: '',
    password_confirmation: '',
    status: user?.status || 'active',
    timezone: user?.timezone || 'UTC',
    language: user?.language || 'en',
    currency: user?.currency || 'USD',
    theme: user?.theme || 'system'
  });

  const [locations, setLocations] = useState(initialLocations);
  const [departments, setDepartments] = useState(initialDepartments);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [errors, setErrors] = useState({});
  const [showRightsConfig, setShowRightsConfig] = useState(usePage().props.showRights || false);
  const [currentRights, setCurrentRights] = useState({});
  const { flash } = usePage().props;

  // Handle flash messages
  useEffect(() => {
    if (flash?.success) {
      CustomAlert.fire({ title: 'Success!', text: flash.success, icon: 'success' });
    } else if (flash?.error) {
      CustomAlert.fire({ title: 'Error!', text: flash.error, icon: 'error' });
    }
  }, [flash]);

  // Track previous company to detect actual changes
  const [previousCompId, setPreviousCompId] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Handle initial data loading
  useEffect(() => {
    if (isInitialLoad && user?.comp_id) {
      // Set initial locations and departments from props if available
      if (initialLocations && initialLocations.length > 0) {
        setLocations(initialLocations);
      }
      if (initialDepartments && initialDepartments.length > 0) {
        setDepartments(initialDepartments);
      }
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, user, initialLocations, initialDepartments]);

  // Load locations when company changes
  useEffect(() => {
    // Skip on initial load if we have user data
    if (isInitialLoad && user?.comp_id) {
      return;
    }
    
    if (formData.comp_id) {
      setLoadingLocations(true);
      fetch(`/system/locations/by-company/${formData.comp_id}`)
        .then(response => response.json())
        .then(data => {
          setLocations(data.data || []);
          setLoadingLocations(false);
          
          // Only reset location and department if company actually changed (not initial load)
          if (previousCompId !== null && previousCompId !== formData.comp_id) {
            setFormData(prev => ({
              ...prev,
              location_id: '',
              dept_id: ''
            }));
            setDepartments([]);
          }
          
          setPreviousCompId(formData.comp_id);
        })
        .catch(error => {
          console.error('Error loading locations:', error);
          setLoadingLocations(false);
        });
    } else {
      setLocations([]);
      setDepartments([]);
      // Only reset if we're not in initial load
      if (previousCompId !== null) {
        setFormData(prev => ({
          ...prev,
          location_id: '',
          dept_id: ''
        }));
      }
    }
  }, [formData.comp_id, previousCompId, isInitialLoad, user]);

  // Track previous location to detect actual changes
  const [previousLocationId, setPreviousLocationId] = useState(null);

  // Load departments when location changes
  useEffect(() => {
    // Skip on initial load if we have user data
    if (isInitialLoad && user?.location_id) {
      return;
    }
    
    if (formData.location_id) {
      setLoadingDepartments(true);
      fetch(`/system/departments/by-location/${formData.location_id}`)
        .then(response => response.json())
        .then(data => {
          setDepartments(data.data || []);
          setLoadingDepartments(false);
          
          // Only reset department if location actually changed (not initial load)
          if (previousLocationId !== null && previousLocationId !== formData.location_id) {
            setFormData(prev => ({
              ...prev,
              dept_id: ''
            }));
          }
          
          setPreviousLocationId(formData.location_id);
        })
        .catch(error => {
          console.error('Error loading departments:', error);
          setLoadingDepartments(false);
        });
    } else {
      setDepartments([]);
      // Only reset if we're not in initial load
      if (previousLocationId !== null) {
        setFormData(prev => ({
          ...prev,
          dept_id: ''
        }));
      }
    }
  }, [formData.location_id, previousLocationId, isInitialLoad, user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleReset = () => {
    setFormData({
      fname: user?.fname || '',
      mname: user?.mname || '',
      lname: user?.lname || '',
      email: user?.email || '',
      phone: user?.phone || '',
      loginid: user?.loginid || '',
      pincode: user?.pincode || '',
      comp_id: user?.comp_id ? String(user.comp_id) : '',
      location_id: user?.location_id ? String(user.location_id) : '',
      dept_id: user?.dept_id ? String(user.dept_id) : '',
      password: '',
      password_confirmation: '',
      status: user?.status || 'active',
      timezone: user?.timezone || 'UTC',
      language: user?.language || 'en',
      currency: user?.currency || 'USD',
      theme: user?.theme || 'system'
    });
    setErrors({});
  };

  const InputField = ({ name, label, type = 'text', placeholder, icon: Icon, required = false, options = [], disabled = false, loading = false }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {loading ? (
              <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
            ) : (
              <Icon className="h-5 w-5 text-gray-400" />
            )}
          </div>
        )}
        {type === 'select' ? (
          <select
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            disabled={disabled || loading}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              Icon ? 'pl-10' : ''
            } ${errors[name] ? 'border-red-500' : 'border-gray-300'} ${
              disabled || loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
            }`}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              Icon ? 'pl-10' : ''
            } ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
          />
        )}
      </div>
      {errors[name] && (
        <p className="text-sm text-red-600">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            Personal Information
          </h3>
          
          <InputField
            name="fname"
            label="First Name"
            type="text"
            placeholder="Enter first name"
            icon={User}
            required
          />
          
          <InputField
            name="mname"
            label="Middle Name"
            type="text"
            placeholder="Enter middle name"
            icon={User}
          />
          
          <InputField
            name="lname"
            label="Last Name"
            type="text"
            placeholder="Enter last name"
            icon={User}
            required
          />
          
          <InputField
            name="email"
            label="Email Address"
            type="email"
            placeholder="Enter email address"
            icon={Mail}
            required
          />
          
          <InputField
            name="phone"
            label="Phone Number"
            type="tel"
            placeholder="Enter phone number"
            icon={Phone}
          />
        </div>

        {/* Organization Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            Organization
          </h3>
          
          <InputField
            name="comp_id"
            label="Company"
            type="select"
            placeholder="Select company"
            icon={Building}
            options={companies.map(company => ({
              value: String(company.id),
              label: company.company_name
            }))}
          />
          
          <InputField
            name="location_id"
            label="Location"
            type="select"
            placeholder="Select location"
            icon={MapPin}
            options={locations.map(location => ({
              value: String(location.id),
              label: location.location_name
            }))}
            disabled={!formData.comp_id}
            loading={loadingLocations}
          />
          
          <InputField
            name="dept_id"
            label="Department"
            type="select"
            placeholder="Select department"
            icon={Users}
            options={departments.map(department => ({
              value: String(department.id),
              label: department.department_name
            }))}
            disabled={!formData.location_id}
            loading={loadingDepartments}
          />
        </div>

        {/* Security & Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            Security & Settings
          </h3>
          
          <InputField
            name="loginid"
            label="Login ID"
            type="text"
            placeholder="Enter login ID"
            icon={User}
            required
          />
          
          <InputField
            name="password"
            label="Password"
            type="password"
            placeholder={isEdit ? "Enter new password (leave blank to keep current)" : "Enter password"}
            icon={Lock}
            required={!isEdit}
          />
          
          <InputField
            name="password_confirmation"
            label="Confirm Password"
            type="password"
            placeholder={isEdit ? "Confirm new password" : "Confirm password"}
            icon={Lock}
            required={!isEdit}
          />
          
          
          <InputField
            name="status"
            label="Status"
            type="select"
            placeholder="Select status"
            icon={CheckCircle}
            required
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'suspended', label: 'Suspended' },
              { value: 'pending', label: 'Pending' }
            ]}
          />
        </div>
      </div>

      {/* User Rights Configuration */}
      {isEdit && formData.comp_id && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            User Rights Configuration
          </h3>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure what this user can view, add, edit, and delete based on your company package
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowRightsConfig(!showRightsConfig)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showRightsConfig ? 'Hide Rights' : 'Configure Rights'}
            </button>
          </div>

          {showRightsConfig && (
            <UserRightsConfig
              userId={user?.id}
              companyId={formData.comp_id}
              availableMenus={availableMenus}
              userRights={userRights}
              onSave={(rights) => {
                setCurrentRights(rights);
                // Include rights in form submission
                setFormData(prev => ({ ...prev, user_rights: rights }));
              }}
              onCancel={() => setShowRightsConfig(false)}
            />
          )}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {resetText}
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {submitText}
        </button>
      </div>
    </form>
  );
};

export default DynamicUserForm;
