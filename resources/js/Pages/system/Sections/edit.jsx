import React from 'react';
import App from "../../App.jsx";
import GeneralizedForm from '../../../Components/GeneralizedForm';
import { usePage, router } from '@inertiajs/react';

const EditSectionForm = () => {
  const { section, modules } = usePage().props;
  const fields = [
    { name: 'module_id', label: 'Module', type: 'select', required: true, options: modules.map(m => ({ value: m.id, label: m.module_name })) },
    { name: 'section_name', label: 'Section Name', type: 'text', placeholder: 'Enter section name', required: true },
    { name: 'status', label: 'Status', type: 'toggle', required: false },
    { name: 'sort_order', label: 'Order', type: 'number', placeholder: 'Enter display order', required: false, min: 0 },
  ];

  const handleSubmit = (data) => {
    router.post(`/system/sections/${section.id}`, { ...data, _method: 'put' }, {});
  };

  return (
    <GeneralizedForm
      title={`Edit Section: ${section.section_name}`}
      subtitle="Update section details"
      fields={fields}
      onSubmit={handleSubmit}
      submitText="Update Section"
      initialData={{ module_id: section.module_id, section_name: section.section_name, status: !!section.status, sort_order: section.sort_order ?? 0 }}
      showReset={true}
    />
  );
};

const Edit = () => (
  <App>
    <div className="rounded-xl shadow-lg form-container border-slate-200">
      <div className="p-6">
        <EditSectionForm />
      </div>
    </div>
  </App>
);

export default Edit;


