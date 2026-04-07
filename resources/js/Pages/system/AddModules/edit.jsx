import React, { useEffect, useMemo, useState } from 'react';
import { Type, Folder, Image as ImageIcon } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import PermissionAwareForm from '../../../Components/PermissionAwareForm';
import { router, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';
import App from "../../App.jsx";

const EditModuleForm = () => {
  const { t } = useTranslations();
  const te = (k) => t(`system.add_modules.edit.${k}`);
  const { module: moduleProp, flash } = usePage().props;
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (flash?.success) setAlert({ type: 'success', message: flash.success });
    if (flash?.error) setAlert({ type: 'error', message: flash.error });
  }, [flash]);

  const fields = useMemo(
    () => [
      {
        name: 'module_name',
        label: te('lbl_module_name'),
        type: 'text',
        placeholder: te('ph_module_name'),
        icon: Type,
        required: true,
      },
      {
        name: 'folder_name',
        label: te('lbl_folder_name'),
        type: 'text',
        placeholder: te('ph_folder_name'),
        icon: Folder,
        required: true,
      },
      {
        name: 'image',
        label: te('lbl_image'),
        type: 'file-image',
        placeholder: te('ph_image'),
        required: false,
        icon: ImageIcon,
      },
      {
        name: 'status',
        label: te('lbl_status'),
        type: 'toggle',
        required: false,
      },
      {
        name: 'sort_order',
        label: te('lbl_sort_order'),
        type: 'number',
        placeholder: te('ph_sort_order'),
        required: false,
        min: 0,
      },
    ],
    [t]
  );

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
      onSuccess: () => setAlert({ type: 'success', message: te('msg_module_updated_successfully') }),
      onError: () => setAlert({ type: 'error', message: te('msg_failed_to_update_module') }),
    });
  };

  return (
    <div>
      {alert && (
        <div
          className={`mb-4 p-4 rounded-lg animate-slideIn ${alert.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
            }`}
        >
          <p className="text-sm font-medium">{alert.message}</p>
        </div>
      )}
      <GeneralizedForm
        title={te('title_edit', { name: moduleProp.module_name })}
        subtitle={te('update_module_details')}
        fields={fields}
        onSubmit={handleSubmit}
        submitText={te('submit_update')}
        resetText={te('reset')}
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
  const { t } = useTranslations();

  return (
    <App>
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <PermissionAwareForm
            requiredPermission="can_edit"
            route="/system/AddModules"
            fallbackMessage={t('system.add_modules.edit.permission_fallback')}
          >
            <EditModuleForm />
          </PermissionAwareForm>
        </div>
      </div>
    </App>
  );
};

export default Edit;
