import React, { useEffect, useState } from 'react';
import { Type, Folder, List, Image as ImageIcon } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import PermissionAwareForm, { PermissionButton } from '../../../Components/PermissionAwareForm';
import { usePermissions } from '../../../hooks/usePermissions';
import { router, usePage } from '@inertiajs/react';
import App from "../../App.jsx";

const EditModuleForm = () => {
  const { module: moduleProp, errors: pageErrors, flash } = usePage().props;
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (flash?.success) setAlert({ type: 'success', message: flash.success });
    if (flash?.error) setAlert({ type: 'error', message: flash.error });
  }, [flash]);

  const fields = [
    { name: 'module_name', label: 'Module Name', type: 'text', placeholder: 'Enter module name', icon: Type, required: true },
    { name: 'folder_name', label: 'Folder Name', type: 'text', placeholder: 'Enter folder name', icon: Folder, required: true },
    { name: 'image', label: 'Module Image', type: 'file-image', placeholder: 'Upload new image (optional)', required: false, icon: ImageIcon },
    { name: 'status', label: 'Status', type: 'toggle', required: false },
    { name: 'sort_order', label: 'Order', type: 'number', placeholder: 'Enter display order', required: false, min: 0 },
  ];

  const handleSubmit = async (data) => {
    const formData = new FormData();
    formData.append('_method', 'put');
    formData.append('module_name', data.module_name || '');
    formData.append('folder_name', data.folder_name || '');
    formData.append('status', data.status ? '1' : '0');
    formData.append('sort_order', data.sort_order ?? '0');
    if (data.image) formData.append('image', data.image);

    router.post(`/modules/${moduleProp.id}`, formData, {
      forceFormData: true,
      onSuccess: () => setAlert({ type: 'success', message: 'Module updated successfully!' }),
      onError: () => setAlert({ type: 'error', message: 'Failed to update module.' })
    });
  };

  return (
    <div>
      <GeneralizedForm
        title={`Edit Module: ${moduleProp.module_name}`}
        subtitle="Update module details"
        fields={fields}
        onSubmit={handleSubmit}
        submitText="Update Module"
        resetText="Reset"
        initialData={{
          module_name: moduleProp.module_name || '',
          folder_name: moduleProp.folder_name || '',
          image: null,
          status: !!moduleProp.status,
          sort_order: moduleProp.sort_order ?? 0,
        }}
        showReset={true}
      />
    </div>
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
            route="/modules"
            fallbackMessage="You don't have permission to edit modules. Please contact your administrator."
          >
            <EditModuleForm />
          </PermissionAwareForm>
        </div>
      </div>
    </App>
  );
};

export default Edit;


