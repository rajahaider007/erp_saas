import React, { useEffect, useMemo, useState } from 'react';
import { Type, Settings, Layers, Home, List, Plus } from 'lucide-react';
import App from "../../App.jsx";
import GeneralizedForm from '../../../Components/GeneralizedForm';
import { usePage, router } from '@inertiajs/react';

// Debug Panel removed per requirement

const Breadcrumbs = ({ items }) => (
  <div className="breadcrumbs-themed">
    <nav className="breadcrumbs">
      {items.map((item, idx) => (
        <div key={idx} className="breadcrumb-item">
          <div className="breadcrumb-item-content">
            {item.icon && (<item.icon className={`breadcrumb-icon ${item.href ? 'breadcrumb-icon-link' : 'breadcrumb-icon-current'}`} />)}
            {item.href ? (<a href={item.href} className="breadcrumb-link-themed">{item.label}</a>) : (<span className="breadcrumb-current-themed">{item.label}</span>)}
          </div>
          {idx < items.length - 1 && (
            <div className="breadcrumb-separator breadcrumb-separator-themed">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            </div>
          )}
        </div>
      ))}
    </nav>
    <div className="breadcrumbs-description">Navigate through your application modules</div>
  </div>
);

const AddMenuForm = () => {
  const { modules } = usePage().props;
  const [sections, setSections] = useState([]);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [requestStatus, setRequestStatus] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');

  // Load sections when module changes
  const loadSections = async (moduleId) => {
    if (!moduleId) {
      setSections([]);
      return;
    }
    
    try {
      console.log('Loading sections for module:', moduleId);
      const response = await fetch(`/system/sections/by-module/${moduleId}`);
      const data = await response.json();
      console.log('Sections API response:', data);
      setSections(data?.data?.sections || []);
    } catch (error) {
      console.error('Failed to load sections:', error);
      setSections([]);
    }
  };

  // Handle module selection
  const handleModuleChange = (moduleId) => {
    setSelectedModuleId(moduleId);
    loadSections(moduleId);
  };

  // Search sections function for searchable select
  const searchSections = async (searchTerm) => {
    if (!selectedModuleId) return sections;
    
    try {
      const response = await fetch(`/system/sections/by-module/${selectedModuleId}?search=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      return data?.data?.sections || [];
    } catch (error) {
      console.error('Failed to search sections:', error);
      return sections;
    }
  };

  const fields = useMemo(() => {
    console.log('Rendering fields with sections:', sections);
    return [
      { 
        name: 'module_id', 
        label: 'Module', 
        type: 'select', 
        required: true, 
        options: modules.map(m => ({ value: m.id, label: m.module_name })), 
        icon: Settings,
        onChange: handleModuleChange
      },
      { 
        name: 'section_id', 
        label: 'Section', 
        type: 'select', 
        required: true, 
        options: sections.map(s => ({ value: s.id, label: s.section_name })), 
        icon: Layers,
        searchable: true,
        onSearch: searchSections,
        disabled: !selectedModuleId,
        placeholder: selectedModuleId ? 'Select section...' : 'Select a module first'
      },
      { name: 'menu_name', label: 'Menu Name', type: 'text', required: true, placeholder: 'Enter menu name', icon: Type },
      { name: 'route', label: 'Route', type: 'text', required: false, placeholder: '/path or named route' },
      { name: 'icon', label: 'Icon', type: 'text', required: false, placeholder: 'settings, layers, list, ...' },
      { name: 'status', label: 'Status', type: 'toggle', required: false },
      { name: 'sort_order', label: 'Order', type: 'number', required: false, min: 0 },
    ];
  }, [modules, sections, selectedModuleId]);

  const handleSubmit = async (submittedFormData) => {
    // no debug panel
    setErrors({});
    setAlert(null);
    setRequestStatus('Sending request...');

    const newErrors = {};
    if (!submittedFormData.module_id) newErrors.module_id = 'Module is required';
    if (!submittedFormData.section_id) newErrors.section_id = 'Section is required';
    if (!submittedFormData.menu_name || !submittedFormData.menu_name.trim()) newErrors.menu_name = 'Menu name is required';
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: 'Please correct the errors below and try again.' });
      setRequestStatus('Validation failed');
      return;
    }

    router.post('/system/menus', submittedFormData, {
      onSuccess: () => { setRequestStatus('Success'); setAlert({ type: 'success', message: 'Menu created successfully!' }); },
      onError: (errs) => { setErrors(errs); setAlert({ type: 'error', message: 'Failed to create menu. Please check the errors below.' }); setRequestStatus('Server validation failed'); }
    });
  };


  const breadcrumbItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Menus', icon: List, href: '/system/menus' },
    { label: 'Add Menu', icon: Plus, href: null },
  ];

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />
      {alert && (
        <div className={`mb-4 p-4 rounded-lg animate-slideIn ${alert.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {alert.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              )}
            </div>
            <div className="ml-3"><p className="text-sm font-medium">{alert.message}</p></div>
          </div>
        </div>
      )}
      <GeneralizedForm
        title="Menu Name"
        subtitle="Create a new menu under a section"
        fields={fields}
        onSubmit={handleSubmit}
        submitText="Create Menu"
        resetText="Clear Form"
        initialData={{ module_id: '', section_id: '', menu_name: '', route: '', icon: '', status: true, sort_order: 0 }}
        showReset={true}
      />
      {/* Debug panel removed */}
    </div>
  );
};

const Add = () => (
  <App>
    <div className="rounded-xl shadow-lg form-container border-slate-200">
      <div className="p-6">
        <AddMenuForm />
      </div>
    </div>
  </App>
);

export default Add;
