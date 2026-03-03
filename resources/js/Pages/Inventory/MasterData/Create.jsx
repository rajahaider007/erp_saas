import React, { useMemo, useState } from 'react';
import App from '../../App.jsx';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import { router, usePage } from '@inertiajs/react';

export default function Create() {
  const { config, options = {}, record, edit_mode = false, error, errors: pageErrors, flash } = usePage().props;
  const [localErrors, setLocalErrors] = useState({});

  const fields = useMemo(() => {
    const configFields = config?.fields || [];
    return configFields.map((field) => {
      if (field.type !== 'select') return field;
      if (!field.optionsKey) return field;
      return {
        ...field,
        options: options[field.optionsKey] || [],
      };
    });
  }, [config, options]);

  const initialData = useMemo(() => {
    const base = {};
    fields.forEach((field) => {
      const value = record?.[field.name];
      if (field.type === 'toggle') {
        base[field.name] = value ?? (field.name === 'is_active' ? true : false);
        return;
      }
      if (value === null || value === undefined) {
        base[field.name] = '';
      } else {
        base[field.name] = String(value);
      }
    });
    return base;
  }, [fields, record]);

  const onSubmit = (data) => {
    setLocalErrors({});

    const payload = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        payload.append(key, value ? '1' : '0');
      } else {
        payload.append(key, value ?? '');
      }
    });

    if (edit_mode && record?.id) {
      payload.append('_method', 'PUT');
      router.post(`/inventory/master-data/${config.key}/${record.id}`, payload, {
        forceFormData: true,
        onError: (errs) => setLocalErrors(errs),
      });
      return;
    }

    router.post(`/inventory/master-data/${config.key}`, payload, {
      forceFormData: true,
      onError: (errs) => setLocalErrors(errs),
    });
  };

  return (
    <App>
      <div className="rounded-xl bg-white shadow p-6">
        <div className="mb-4">
          <a className="text-blue-600 text-sm" href={`/inventory/master-data/${config?.key}`}>← Back to List</a>
        </div>

        {error && <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700">{error}</div>}
        {flash?.error && <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700">{flash.error}</div>}
        {flash?.success && <div className="mb-4 rounded-md bg-green-100 p-3 text-green-700">{flash.success}</div>}

        {Object.keys(pageErrors || {}).length > 0 && (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700">
            {Object.values(pageErrors).map((err, idx) => (
              <div key={idx}>{Array.isArray(err) ? err[0] : err}</div>
            ))}
          </div>
        )}

        {Object.keys(localErrors || {}).length > 0 && (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700">
            {Object.values(localErrors).map((err, idx) => (
              <div key={idx}>{Array.isArray(err) ? err[0] : err}</div>
            ))}
          </div>
        )}

        <GeneralizedForm
          title={edit_mode ? `Edit ${config?.title || 'Master Data'}` : `Create ${config?.title || 'Master Data'}`}
          subtitle={edit_mode ? 'Update master data record' : 'Add new master data record'}
          fields={fields}
          onSubmit={onSubmit}
          submitText={edit_mode ? 'Update' : 'Create'}
          showReset={!edit_mode}
          initialData={initialData}
        />
      </div>
    </App>
  );
}
