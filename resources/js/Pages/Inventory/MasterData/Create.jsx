import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Home, List, Plus, Edit3 } from 'lucide-react';
import App from '../../App.jsx';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import { router, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

function optionTranslationKey(optionsKey, value) {
  const safe = String(value).replace(/\./g, '_');
  return `inventory.master_data.option_sets.${optionsKey}.${safe}`;
}

const PARTY_MASTERS_WITH_COA = ['vendor-master', 'customer-master', 'transporter-master'];

const Breadcrumbs = ({ items, description }) => (
  <div className="breadcrumbs-themed">
    <nav className="breadcrumbs">
      {items.map((item, index) => (
        <div key={index} className="breadcrumb-item">
          <div className="breadcrumb-item-content">
            {item.icon && (
              <item.icon className={`breadcrumb-icon ${item.href ? 'breadcrumb-icon-link' : 'breadcrumb-icon-current'}`} />
            )}
            {item.href ? (
              <a href={item.href} className="breadcrumb-link-themed">
                {item.label}
              </a>
            ) : (
              <span className="breadcrumb-current-themed">{item.label}</span>
            )}
          </div>
          {index < items.length - 1 && (
            <div className="breadcrumb-separator breadcrumb-separator-themed">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
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
    {description && <div className="breadcrumbs-description">{description}</div>}
  </div>
);

export default function Create() {
  const { t } = useTranslations();
  const { config, options = {}, record, edit_mode = false, error, errors: pageErrors, flash } =
    usePage().props;
  const mc = useCallback((k, rep = {}) => t(`inventory.master_data.create.${k}`, rep), [t]);
  const [localErrors, setLocalErrors] = useState({});
  const [nextLevel4Preview, setNextLevel4Preview] = useState(null);
  const [level4PreviewLoading, setLevel4PreviewLoading] = useState(false);

  const masterKey = config?.key || '';

  const masterTitle = useMemo(() => {
    const k = `inventory.master_data.masters.${masterKey}.title`;
    const v = t(k);
    return v === k ? config?.title || mc('fallback_title') : v;
  }, [t, masterKey, config?.title, mc]);

  const hasLinkedPartyCoa =
    edit_mode && PARTY_MASTERS_WITH_COA.includes(masterKey) && Boolean(record?.party_type);

  const partyCodeFieldName = useMemo(() => {
    if (masterKey === 'vendor-master') return 'vendor_code';
    if (masterKey === 'customer-master') return 'customer_code';
    if (masterKey === 'transporter-master') return 'transporter_code';
    return null;
  }, [masterKey]);

  const suggestedPartyCode = useMemo(() => {
    if (edit_mode || !partyCodeFieldName || !nextLevel4Preview) {
      return null;
    }
    return { field: partyCodeFieldName, value: nextLevel4Preview };
  }, [edit_mode, partyCodeFieldName, nextLevel4Preview]);

  const fetchLevel4Preview = useCallback(async (parentId) => {
    const id = String(parentId || '').trim();
    if (!id) {
      setNextLevel4Preview(null);
      return;
    }
    setLevel4PreviewLoading(true);
    try {
      const url = `/inventory/master-data/next-level4-preview?parent_id=${encodeURIComponent(id)}`;
      const r = await fetch(url, {
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin',
      });
      const j = await r.json();
      if (!r.ok) {
        setNextLevel4Preview(null);
        return;
      }
      setNextLevel4Preview(j.next_code ?? null);
    } catch {
      setNextLevel4Preview(null);
    } finally {
      setLevel4PreviewLoading(false);
    }
  }, []);

  const rawFields = useMemo(() => {
    const configFields = config?.fields || [];
    return configFields.map((field) => {
      let next = { ...field };
      if (
        PARTY_MASTERS_WITH_COA.includes(masterKey) &&
        (field.name === 'vendor_code' ||
          field.name === 'customer_code' ||
          field.name === 'transporter_code')
      ) {
        next = { ...next, disabled: true };
      }
      if (hasLinkedPartyCoa && field.name === 'coa_level3_parent_id') {
        next = { ...next, disabled: true };
      }
      if (next.type !== 'select') return next;
      if (!next.optionsKey) return next;
      return {
        ...next,
        options: options[next.optionsKey] || [],
      };
    });
  }, [config, options, hasLinkedPartyCoa, masterKey]);

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

      if (
        PARTY_MASTERS_WITH_COA.includes(masterKey) &&
        field.name === 'coa_level3_parent_id' &&
        !hasLinkedPartyCoa
      ) {
        next = {
          ...next,
          onChange: (v) => fetchLevel4Preview(v),
        };
      }

      if (
        PARTY_MASTERS_WITH_COA.includes(masterKey) &&
        field.name === 'country_label' &&
        options?.currencyDefaultByCountry &&
        typeof options.currencyDefaultByCountry === 'object'
      ) {
        const map = options.currencyDefaultByCountry;
        next = {
          ...next,
          onFormDataPatch: (value) => {
            if (!value) {
              return {};
            }
            const def = map[value];
            return def != null && String(def) !== '' ? { currency_id: String(def) } : {};
          },
        };
      }

      return next;
    });
  }, [rawFields, t, masterKey, hasLinkedPartyCoa, fetchLevel4Preview, options?.currencyDefaultByCountry]);

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

  useEffect(() => {
    if (!PARTY_MASTERS_WITH_COA.includes(masterKey)) return;
    if (hasLinkedPartyCoa) return;
    const pid = initialData.coa_level3_parent_id;
    if (!pid) {
      setNextLevel4Preview(null);
      return;
    }
    fetchLevel4Preview(pid);
  }, [masterKey, hasLinkedPartyCoa, initialData.coa_level3_parent_id, fetchLevel4Preview]);

  const breadcrumbItems = useMemo(() => {
    const items = [{ label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' }];
    if (config?.key) {
      items.push({
        label: masterTitle,
        icon: List,
        href: `/inventory/master-data/${config.key}`,
      });
    }
    items.push({
      label: edit_mode ? mc('breadcrumb_edit') : mc('breadcrumb_create'),
      icon: edit_mode ? Edit3 : Plus,
      href: null,
    });
    return items;
  }, [t, config?.key, masterTitle, edit_mode, mc]);

  const onSubmit = async (data) => {
    setLocalErrors({});

    const payload = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        payload.append(key, value ? '1' : '0');
      } else {
        payload.append(key, value ?? '');
      }
    });

    if (!config?.key) {
      throw new Error('Invalid master');
    }

    if (edit_mode && record?.id) {
      payload.append('_method', 'PUT');
      return new Promise((resolve, reject) => {
        router.post(`/inventory/master-data/${config.key}/${record.id}`, payload, {
          forceFormData: true,
          onSuccess: () => resolve(true),
          onError: (errs) => {
            setLocalErrors(errs || {});
            reject(new Error('Validation failed'));
          },
        });
      });
    }

    return new Promise((resolve, reject) => {
      router.post(`/inventory/master-data/${config.key}`, payload, {
        forceFormData: true,
        onSuccess: () => resolve(true),
        onError: (errs) => {
          setLocalErrors(errs || {});
          reject(new Error('Validation failed'));
        },
      });
    });
  };

  const allErrors = { ...pageErrors, ...localErrors };

  return (
    <App>
      <div className="w-full max-w-full rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 bg-[var(--surface)]">
        <div className="p-4 sm:p-6 w-full max-w-full box-border">
          <Breadcrumbs items={breadcrumbItems} description={mc('breadcrumbs_description')} />

          {error && (
            <div className="alert-error-themed mb-4">
              <p>{error}</p>
            </div>
          )}
          {flash?.error && (
            <div className="alert-error-themed mb-4">
              <p>{flash.error}</p>
            </div>
          )}
          {flash?.success && (
            <div className="alert-success-themed mb-4">
              <p>{flash.success}</p>
            </div>
          )}

          {Object.keys(allErrors).length > 0 && (
            <div className="alert-error-themed mb-4">
              <ul className="list-disc pl-5 space-y-1">
                {Object.entries(allErrors).map(([key, value]) => (
                  <li key={key}>{Array.isArray(value) ? value[0] : value}</li>
                ))}
              </ul>
            </div>
          )}

          {PARTY_MASTERS_WITH_COA.includes(masterKey) && (
            <div
              className="mb-4 rounded-2xl border px-4 py-3 text-sm shadow-sm backdrop-blur-sm
                border-slate-200/90 bg-white/90 text-slate-800
                dark:border-slate-600/80 dark:bg-slate-800/85 dark:text-slate-100"
              role="status"
            >
              {hasLinkedPartyCoa && record?.coa_gl_account_code ? (
                <p className="m-0">
                  <span className="font-semibold text-slate-900 dark:text-slate-50">{mc('level4_linked_code')}</span>{' '}
                  <code
                    className="rounded-md border px-1.5 py-0.5 font-mono text-[0.8125rem]
                      border-slate-300/70 bg-slate-100 text-slate-900
                      dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                  >
                    {record.coa_gl_account_code}
                  </code>
                </p>
              ) : (
                <>
                  {level4PreviewLoading && (
                    <p className="m-0 text-slate-500 dark:text-slate-400">{mc('level4_preview_loading')}</p>
                  )}
                  {!level4PreviewLoading && nextLevel4Preview && (
                    <p className="m-0">
                      <span className="font-semibold text-slate-900 dark:text-slate-50">{mc('level4_preview_auto')}</span>{' '}
                      <code
                        className="rounded-md border px-1.5 py-0.5 font-mono text-[0.8125rem]
                          border-slate-300/70 bg-slate-100 text-slate-900
                          dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                      >
                        {nextLevel4Preview}
                      </code>
                    </p>
                  )}
                  {!level4PreviewLoading && !nextLevel4Preview && (
                    <p className="m-0 text-slate-500 dark:text-slate-400">{mc('level4_preview_hint')}</p>
                  )}
                  <p className="mt-2 mb-0 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {mc('level4_preview_note_party_code')}
                  </p>
                </>
              )}
            </div>
          )}

          <GeneralizedForm
            key={`${masterKey}-${edit_mode ? String(record?.id ?? '') : 'new'}`}
            title={edit_mode ? mc('title_edit', { name: masterTitle }) : mc('title_create', { name: masterTitle })}
            subtitle={edit_mode ? mc('subtitle_edit') : mc('subtitle_create')}
            fields={fields}
            onSubmit={onSubmit}
            submitText={edit_mode ? t('common.actions.update') : t('common.actions.create')}
            resetText={t('common.form_actions.clear_form')}
            showReset={!edit_mode}
            initialData={initialData}
            formContainerClassName={
              PARTY_MASTERS_WITH_COA.includes(masterKey) ? 'form-container--master-data-fluid' : ''
            }
            formGridClassName={PARTY_MASTERS_WITH_COA.includes(masterKey) ? 'form-grid--master-data' : ''}
            suggestedPartyCode={suggestedPartyCode}
          />
        </div>
      </div>
    </App>
  );
}
