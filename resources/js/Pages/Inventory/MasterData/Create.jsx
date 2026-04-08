import React, { useCallback, useMemo, useState } from 'react';
import App from '../../App.jsx';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import { router, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

function optionTranslationKey(optionsKey, value) {
  const safe = String(value).replace(/\./g, '_');
  return `inventory.master_data.option_sets.${optionsKey}.${safe}`;
}

export default function Create() {
  const { t } = useTranslations();
  const { config, options = {}, record, edit_mode = false, error, errors: pageErrors, flash } = usePage().props;
  const mc = useCallback((k, rep = {}) => t(`inventory.master_data.create.${k}`, rep), [t]);
  const [localErrors, setLocalErrors] = useState({});

  const masterKey = config?.key || '';

  const masterTitle = useMemo(() => {
    const k = `inventory.master_data.masters.${masterKey}.title`;
    const v = t(k);
    return v === k ? config?.title || mc('fallback_title') : v;
  }, [t, masterKey, config?.title, mc]);

  const rawFields = useMemo(() => {
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

  const fields = useMemo(() => {
    return rawFields.map((field) => {
      const labelKey = `inventory.master_data.masters.${masterKey}.fields.${field.name}`;
      const labelTr = t(labelKey);
      const label = labelTr === labelKey ? field.label : labelTr;

      const phKey = `inventory.master_data.masters.${masterKey}.placeholders.${field.name}`;
      const phTr = t(phKey);
      const placeholder = field.placeholder && phTr !== phKey ? phTr : field.placeholder;

      let next = { ...field, label };
      if (placeholder) next = { ...next, placeholder };

      if (field.type === 'select' && field.optionsKey && Array.isArray(field.options)) {
        next = {
          ...next,
          options: field.options.map((opt) => {
            const ok = optionTranslationKey(field.optionsKey, opt.value);
            const ol = t(ok);
            return { ...opt, label: ol === ok ? opt.label : ol };
          }),
        };
      }

      return next;
    });
  }, [rawFields, t, masterKey]);

  const initialData = useMemo(() => {
    const base = {};
    rawFields.forEach((field) => {
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
  }, [rawFields, record]);

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
      <div className="rounded-xl bg-white shadow p-6 max-w-5xl mx-auto">
          <div className="mb-4">
            <a className="text-blue-600 text-sm hover:underline" href={`/inventory/master-data/${config?.key}`}>
              {mc('back_to_list')}
            </a>
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
            title={edit_mode ? mc('title_edit', { name: masterTitle }) : mc('title_create', { name: masterTitle })}
            subtitle={edit_mode ? mc('subtitle_edit') : mc('subtitle_create')}
            fields={fields}
            onSubmit={onSubmit}
            submitText={edit_mode ? t('common.actions.update') : t('common.actions.create')}
            showReset={!edit_mode}
            initialData={initialData}
          />
      </div>
    </App>
  );
}
