import React, { useEffect, useMemo, useState } from 'react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import PermissionAwareForm, { PermissionButton } from '../../../Components/PermissionAwareForm';
import { usePermissions } from '../../../hooks/usePermissions';
import App from "../../App.jsx";
import { usePage, router } from '@inertiajs/react';

const EditMenuForm = () => {
  const { menu, modules } = usePage().props;
  const [sections, setSections] = useState([]);
  const [moduleId, setModuleId] = useState(menu.module_id);

  useEffect(() => {
    if (!moduleId) return;
    fetch(`/system/sections/by-module/${moduleId}`)
      .then(r => r.json())
      .then(res => setSections(res?.data?.sections || []))
      .catch(() => setSections([]));
  }, [moduleId]);

  const fields = useMemo(() => [
    { name: 'module_id', label: 'Module', type: 'select', required: true, options: modules.map(m => ({ value: m.id, label: m.module_name })) },
    { name: 'section_id', label: 'Section', type: 'select', required: true, options: sections.map(s => ({ value: s.id, label: s.section_name })) },
    { name: 'menu_name', label: 'Menu Name', type: 'text', required: true },
    { name: 'route', label: 'Route', type: 'text', required: false },
    { name: 'icon', label: 'Icon', type: 'text', required: false },
    { name: 'status', label: 'Status', type: 'toggle', required: false },
    { name: 'sort_order', label: 'Order', type: 'number', required: false, min: 0 },
  ], [modules, sections]);

  const handleSubmit = (data) => {
    router.post(`/system/menus/${menu.id}`, { ...data, _method: 'put' });
  };

  return (
    <GeneralizedForm
      title={`Edit Menu: ${menu.menu_name}`}
      subtitle="Update menu details"
      fields={fields}
      onSubmit={handleSubmit}
      submitText="Update Menu"
      initialData={{
        module_id: menu.module_id,
        section_id: menu.section_id,
        menu_name: menu.menu_name,
        route: menu.route || '',
        icon: menu.icon || '',
        status: !!menu.status,
        sort_order: menu.sort_order ?? 0
      }}
      showReset={true}
    />
  );
};

const Edit = () => {
  const { canEdit } = usePermissions();
  
  return (
    <App>
      {/* Main Content Card */}
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <PermissionAwareForm
            requiredPermission="can_edit"
            route="/system/menus"
            fallbackMessage="You don't have permission to edit menus. Please contact your administrator."
          >
            <EditMenuForm />
          </PermissionAwareForm>
        </div>
      </div>
    </App>
  );
};

export default Edit;


