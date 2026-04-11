import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { Home, ClipboardList, Plus, Trash2, SquarePen, ChevronDown, ChevronUp } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import GeneralizedForm from '@/Components/GeneralizedForm';
import Breadcrumbs from '@/Components/Breadcrumbs';
import InlineSearchSelect from '@/Components/InlineSearchSelect';
import CustomDatePicker from '@/Components/DatePicker/DatePicker';
import { formatLocalYmd } from '@/utils/dateOnly';
import App from '../../App.jsx';
import { useTranslations } from '@/hooks/useTranslations';
import { consumeRahjAiDraftPayload } from '@/utils/rahjAiDraft';

const emptyLine = () => ({
  inventory_item_id: '',
  item_description: '',
  uom_id: '',
  quantity: '',
  estimated_unit_price: '',
  need_by_date: '',
  line_notes: '',
});

function mapLineFromApi(line) {
  return {
    inventory_item_id: line.inventory_item_id != null ? String(line.inventory_item_id) : '',
    item_description: line.item_description ?? '',
    uom_id: line.uom_id != null ? String(line.uom_id) : '',
    quantity: line.quantity != null ? String(line.quantity) : '',
    estimated_unit_price:
      line.estimated_unit_price != null && line.estimated_unit_price !== ''
        ? String(line.estimated_unit_price)
        : '',
    need_by_date: line.need_by_date ? String(line.need_by_date).split('T')[0] : '',
    line_notes: line.line_notes ?? '',
  };
}

function formatHeaderDate(v) {
  if (v == null || v === '') return '';
  return String(v).split('T')[0];
}

const PurchaseRequisitionCreate = () => {
  const { t } = useTranslations();
  const tc = useCallback((key, params) => t(`inventory.purchase_requisition.create.${key}`, params), [t]);
  const fld = useCallback((name, part) => t(`inventory.purchase_requisition.create.fields.${name}.${part}`), [t]);
  const lf = useCallback((name, part) => t(`inventory.purchase_requisition.create.line_fields.${name}.${part}`), [t]);

  const headerFormRef = useRef(null);
  const {
    errors: pageErrors = {},
    flash,
    error: pageError,
    itemOptions = [],
    uomOptions = [],
    locationOptions = [],
    departmentOptions = [],
    currencyOptions = [],
    itemMetaById = {},
    defaults = {},
    requisition = null,
    preview_pr_number = null,
  } = usePage().props;

  const isEdit = Boolean(requisition?.id);
  const [headerFormKey, setHeaderFormKey] = useState(0);
  const [lines, setLines] = useState([emptyLine()]);
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedSection, setExpandedSection] = useState('essential');
  const [collapsedAdvanced, setCollapsedAdvanced] = useState(true);
  const aiDraftPayload = useMemo(
    () => (requisition?.id ? null : consumeRahjAiDraftPayload('purchase_requisition')),
    [requisition?.id]
  );

  useEffect(() => {
    if (requisition?.id) {
      setLines(
        Array.isArray(requisition.lines) && requisition.lines.length
          ? requisition.lines.map(mapLineFromApi)
          : [emptyLine()]
      );
    } else {
      setLines([emptyLine()]);
    }
  }, [requisition?.id]);

  useEffect(() => {
    if (pageError) {
      setAlert({ type: 'error', message: pageError });
    }
  }, [pageError]);

  useEffect(() => {
    if (flash?.error) {
      setAlert({ type: 'error', message: flash.error });
    }
  }, [flash?.error]);

  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      const first = Object.values(pageErrors).flat().filter(Boolean)[0];
      setAlert({
        type: 'error',
        message: first || tc('msg_please_correct_errors'),
      });
    }
  }, [pageErrors, tc]);

  const priorityOptions = useMemo(
    () => [
      { value: 'normal', label: tc('priority_options.normal') },
      { value: 'high', label: tc('priority_options.high') },
      { value: 'urgent', label: tc('priority_options.urgent') },
    ],
    [tc]
  );

  const headerFields = useMemo(
    () => [
      {
        name: 'pr_number_display',
        label: fld('pr_number', 'label'),
        type: 'text',
        placeholder: fld('pr_number', 'placeholder'),
        required: false,
        disabled: true,
        section: tc('section_header'),
      },
      {
        name: 'pr_date',
        label: fld('pr_date', 'label'),
        type: 'datepicker',
        placeholder: fld('pr_date', 'placeholder'),
        required: true,
        section: tc('section_header'),
      },
      {
        name: 'priority',
        label: fld('priority', 'label'),
        type: 'select',
        placeholder: fld('priority', 'placeholder'),
        options: priorityOptions,
        required: true,
      },
      {
        name: 'deliver_to_location_id',
        label: fld('deliver_to_location_id', 'label'),
        type: 'select',
        placeholder: fld('deliver_to_location_id', 'placeholder'),
        options: locationOptions,
        required: false,
        searchable: true,
      },
    ],
    [fld, tc, locationOptions, priorityOptions]
  );

  const advancedFields = useMemo(
    () => [
      {
        name: 'required_by_date',
        label: fld('required_by_date', 'label'),
        type: 'datepicker',
        placeholder: fld('required_by_date', 'placeholder'),
        required: false,
      },
      {
        name: 'delivery_address',
        label: fld('delivery_address', 'label'),
        type: 'textarea',
        placeholder: fld('delivery_address', 'placeholder'),
        required: false,
        rows: 2,
      },
      {
        name: 'currency_id',
        label: fld('currency_id', 'label'),
        type: 'select',
        placeholder: fld('currency_id', 'placeholder'),
        options: currencyOptions,
        required: false,
        searchable: true,
      },
      {
        name: 'fx_rate',
        label: fld('fx_rate', 'label'),
        type: 'decimal',
        placeholder: fld('fx_rate', 'placeholder'),
        required: false,
        min: 0,
        step: '0.000001',
      },
      {
        name: 'initial_status',
        label: fld('initial_status', 'label'),
        type: 'select',
        placeholder: fld('initial_status', 'placeholder'),
        options: [
          { value: 'draft', label: tc('initial_status_options.draft') },
          { value: 'approved', label: tc('initial_status_options.approved') },
        ],
        required: true,
        section: tc('section_header'),
      },
      {
        name: 'department_id',
        label: fld('department_id', 'label'),
        type: 'select',
        placeholder: fld('department_id', 'placeholder'),
        options: departmentOptions,
        required: false,
        searchable: true,
      },
      {
        name: 'requested_by',
        label: fld('requested_by', 'label'),
        type: 'text',
        placeholder: fld('requested_by', 'placeholder'),
        required: false,
        maxLength: 120,
      },
      {
        name: 'justification',
        label: fld('justification', 'label'),
        type: 'textarea',
        placeholder: fld('justification', 'placeholder'),
        required: false,
        rows: 2,
      },
      {
        name: 'notes',
        label: fld('notes', 'label'),
        type: 'textarea',
        placeholder: fld('notes', 'placeholder'),
        required: false,
        rows: 2,
      },
    ],
    [fld, tc, locationOptions, currencyOptions, departmentOptions]
  );

  const initialHeader = useMemo(() => {
    if (requisition?.id) {
      return {
        pr_number_display: requisition.pr_number ?? '',
        pr_date: formatHeaderDate(requisition.pr_date),
        required_by_date: formatHeaderDate(requisition.required_by_date),
        deliver_to_location_id:
          requisition.deliver_to_location_id != null ? String(requisition.deliver_to_location_id) : '',
        delivery_address: requisition.delivery_address ?? '',
        currency_id: requisition.currency_id != null ? String(requisition.currency_id) : '',
        fx_rate:
          requisition.fx_rate != null && requisition.fx_rate !== '' ? String(requisition.fx_rate) : '',
        priority: requisition.priority || 'normal',
        initial_status: requisition.status === 'approved' ? 'approved' : 'draft',
        department_id: requisition.department_id != null ? String(requisition.department_id) : '',
        requested_by: requisition.requested_by ?? '',
        justification: requisition.justification ?? '',
        notes: requisition.notes ?? '',
      };
    }
    const base = {
      pr_number_display: preview_pr_number ?? '',
      pr_date: defaults.pr_date || '',
      required_by_date: '',
      deliver_to_location_id: defaults.deliver_to_location_id || '',
      delivery_address: '',
      currency_id: defaults.currency_id || '',
      fx_rate: defaults.fx_rate || '',
      priority: 'normal',
      initial_status: 'draft',
      department_id: '',
      requested_by: '',
      justification: '',
      notes: '',
    };
    return aiDraftPayload ? { ...base, ...aiDraftPayload } : base;
  }, [aiDraftPayload, defaults, requisition, preview_pr_number]);

  const estimatedSubtotal = useMemo(() => {
    let sum = 0;
    for (const row of lines) {
      const q = parseFloat(row.quantity);
      const p = parseFloat(row.estimated_unit_price);
      if (!Number.isNaN(q) && !Number.isNaN(p)) {
        sum += q * p;
      }
    }
    return sum;
  }, [lines]);

  const updateLine = (index, patch) => {
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const onItemPicked = (index, itemId) => {
    const meta = itemMetaById[itemId];
    const patch = {
      inventory_item_id: itemId,
      item_description: meta ? `${meta.item_code} — ${meta.item_name_short}` : '',
      uom_id: meta?.default_uom_id || '',
    };
    updateLine(index, patch);
  };

  const validateLines = () => {
    for (let i = 0; i < lines.length; i++) {
      const row = lines[i];
      if (!row.inventory_item_id || !row.uom_id) {
        return false;
      }
      const q = parseFloat(row.quantity);
      if (Number.isNaN(q) || q <= 0) {
        return false;
      }
    }
    return lines.length > 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setAlert(null);

    if (!headerFormRef.current?.validate?.()) {
      return;
    }

    if (!validateLines()) {
      setAlert({ type: 'error', message: tc('msg_fix_lines') });
      return;
    }

    const header = headerFormRef.current.getValues();
    
    // Get advanced field values from form inputs
    const formData = new FormData(e.target);
    const advancedValues = Object.fromEntries(formData);
    
    // Merge header and advanced values
    const mergedHeader = { ...header, ...advancedValues };

    const payload = {
      initial_status: mergedHeader.initial_status || 'draft',
      pr_date: mergedHeader.pr_date,
      required_by_date: mergedHeader.required_by_date || null,
      deliver_to_location_id: mergedHeader.deliver_to_location_id || null,
      delivery_address: mergedHeader.delivery_address || null,
      currency_id: mergedHeader.currency_id || null,
      fx_rate: mergedHeader.fx_rate === '' || mergedHeader.fx_rate == null ? null : mergedHeader.fx_rate,
      priority: mergedHeader.priority,
      department_id: mergedHeader.department_id || null,
      requested_by: mergedHeader.requested_by || null,
      justification: mergedHeader.justification || null,
      notes: mergedHeader.notes || null,
      lines: lines.map((row) => ({
        inventory_item_id: parseInt(row.inventory_item_id, 10),
        uom_id: parseInt(row.uom_id, 10),
        quantity: row.quantity,
        estimated_unit_price:
          row.estimated_unit_price === '' || row.estimated_unit_price == null
            ? null
            : row.estimated_unit_price,
        need_by_date: row.need_by_date || null,
        item_description: row.item_description || null,
        line_notes: row.line_notes || null,
      })),
    };

    setSubmitting(true);
    const opts = {
      preserveScroll: true,
      onFinish: () => setSubmitting(false),
      onError: () => setSubmitting(false),
    };
    if (requisition?.id) {
      router.put(`/inventory/purchase-requisition/${requisition.id}`, payload, opts);
    } else {
      router.post('/inventory/purchase-requisition', payload, opts);
    }
  };

  const handleResetAll = () => {
    setAlert(null);
    if (requisition?.id) {
      setLines(
        Array.isArray(requisition.lines) && requisition.lines.length
          ? requisition.lines.map(mapLineFromApi)
          : [emptyLine()]
      );
      setHeaderFormKey((k) => k + 1);
    } else {
      headerFormRef.current?.resetForm?.();
      setLines([emptyLine()]);
    }
  };

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: tc('breadcrumb_inventory'), icon: ClipboardList, href: '/erp-modules' },
      { label: tc('breadcrumb_pr'), icon: ClipboardList, href: '/inventory/purchase-requisition' },
      isEdit
        ? { label: tc('breadcrumb_edit'), icon: SquarePen, href: null }
        : { label: tc('breadcrumb_create'), icon: Plus, href: null },
    ],
    [t, tc, isEdit]
  );

  const subtotalLabel = estimatedSubtotal.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <App>
      <div className="rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 md:p-6 lg:p-8">
          <Breadcrumbs items={breadcrumbItems} description={tc('breadcrumb_desc')} />

          <div className="form-theme-system">
            <div className="form-container form-container--pr-redesigned">
              {/* Header Section */}
              <div className="mb-8">
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 m-0">
                      {isEdit ? tc('title_edit') : tc('title')}
                    </h1>
                    <p className="text-base text-slate-500 dark:text-slate-400 mt-2 mb-0">{isEdit ? tc('subtitle_edit') : tc('subtitle')}</p>
                  </div>
                  {isEdit && requisition?.pr_number && (
                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg">
                      <p className="text-sm text-slate-600 dark:text-slate-400 m-0">PR Number</p>
                      <p className="text-lg font-mono font-semibold text-slate-900 dark:text-slate-50 m-0">{requisition.pr_number}</p>
                    </div>
                  )}
                </div>
              </div>

              {alert && (
                <div
                  className={`mb-6 p-4 rounded-lg border ${
                    alert.type === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                      : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                  }`}
                  role={alert.type === 'error' ? 'alert' : 'status'}
                >
                  <p className="m-0 font-medium">{alert.message}</p>
                  {pageErrors && Object.keys(pageErrors).length > 0 && (
                    <ul className="mt-3 mb-0 list-disc pl-5 space-y-1">
                      {Object.entries(pageErrors).map(([key, val]) => (
                        <li key={key} className="text-sm">{Array.isArray(val) ? val[0] : val}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <form onSubmit={handleFormSubmit} noValidate>
                {/* Essential Information Section */}
                <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div
                    className="px-5 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-between"
                    onClick={() => setExpandedSection(expandedSection === 'essential' ? null : 'essential')}
                    role="button"
                    tabIndex="0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setExpandedSection(expandedSection === 'essential' ? null : 'essential');
                      }
                    }}
                  >
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 m-0">
                      📋 Essential Information
                    </h2>
                    {expandedSection === 'essential' ? (
                      <ChevronUp size={20} className="text-slate-600 dark:text-slate-400" />
                    ) : (
                      <ChevronDown size={20} className="text-slate-600 dark:text-slate-400" />
                    )}
                  </div>

                  {expandedSection === 'essential' && (
                    <div className="p-5">
                      <GeneralizedForm
                        key={`pr-h-${headerFormKey}-${requisition?.id ?? 'new'}`}
                        ref={headerFormRef}
                        embedded
                        showEmbeddedHeader={false}
                        title=""
                        subtitle=""
                        fields={headerFields}
                        initialData={initialHeader}
                        formGridClassName="grid grid-cols-1 md:grid-cols-2 gap-5"
                        onSubmit={() => {}}
                        showReset={false}
                        showSubmitActions={false}
                      />
                    </div>
                  )}
                </div>

                {/* Advanced Options Section */}
                <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div
                    className="px-5 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-between"
                    onClick={() => setCollapsedAdvanced(!collapsedAdvanced)}
                    role="button"
                    tabIndex="0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setCollapsedAdvanced(!collapsedAdvanced);
                      }
                    }}
                  >
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 m-0">
                      ⚙️ Advanced Options
                    </h2>
                    {!collapsedAdvanced ? (
                      <ChevronUp size={20} className="text-slate-600 dark:text-slate-400" />
                    ) : (
                      <ChevronDown size={20} className="text-slate-600 dark:text-slate-400" />
                    )}
                  </div>

                  {!collapsedAdvanced && (
                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {advancedFields.map((field) => (
                          <div key={field.name} className="form-group-wrapper">
                            {field.type === 'textarea' ? (
                              <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                  {field.label}
                                  {field.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                <textarea
                                  className="form-input w-full"
                                  name={field.name}
                                  placeholder={field.placeholder}
                                  rows={field.rows || 2}
                                  defaultValue={initialHeader[field.name] || ''}
                                  maxLength={field.maxLength}
                                />
                              </div>
                            ) : field.type === 'datepicker' ? (
                              <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                  {field.label}
                                  {field.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                <CustomDatePicker
                                  selected={initialHeader[field.name] ? new Date(initialHeader[field.name]) : null}
                                  onChange={(date) => {
                                    const input = document.querySelector(`input[name="${field.name}"]`);
                                    if (input) input.value = date ? formatLocalYmd(date) : '';
                                  }}
                                  type="date"
                                  placeholder={field.placeholder}
                                  className="form-input w-full"
                                  isClearable
                                />
                              </div>
                            ) : field.type === 'select' ? (
                              <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                  {field.label}
                                  {field.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                <select
                                  className="form-input w-full"
                                  name={field.name}
                                  defaultValue={initialHeader[field.name] || ''}
                                >
                                  <option value="">{field.placeholder}</option>
                                  {field.options?.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                  {field.label}
                                  {field.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                <input
                                  type={field.type || 'text'}
                                  className="form-input w-full"
                                  name={field.name}
                                  placeholder={field.placeholder}
                                  defaultValue={initialHeader[field.name] || ''}
                                  min={field.min}
                                  step={field.step}
                                  maxLength={field.maxLength}
                                  disabled={field.disabled}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Line Items Section */}
                <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 m-0">
                      📦 Line Items
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-0">{tc('lines_hint')}</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm" role="grid">
                      <thead>
                        <tr className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 text-left border-b border-slate-200 dark:border-slate-700">
                          <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 w-12">#</th>
                          <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 min-w-[14rem]">{lf('item', 'label')}</th>
                          <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 min-w-[10rem] hidden sm:table-cell">{lf('description', 'label')}</th>
                          <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 min-w-[7rem]">{lf('uom', 'label')}</th>
                          <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 min-w-[8rem]">{lf('quantity', 'label')}</th>
                          <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 min-w-[8rem] hidden md:table-cell">{lf('estimated_price', 'label')}</th>
                          <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 min-w-[8rem] hidden lg:table-cell">{lf('need_by_date', 'label')}</th>
                          <th className="px-4 py-3 w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {lines.map((row, index) => (
                          <tr
                            key={index}
                            className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors align-top"
                          >
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-medium tabular-nums">{index + 1}</td>
                            <td className="px-4 py-3">
                              <InlineSearchSelect
                                options={itemOptions}
                                value={row.inventory_item_id}
                                onChange={(v) => onItemPicked(index, v)}
                                placeholder={lf('item', 'placeholder')}
                                usePortal
                                className="pr-cell-control"
                              />
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <input
                                type="text"
                                className="form-input w-full text-sm"
                                value={row.item_description}
                                onChange={(e) => updateLine(index, { item_description: e.target.value })}
                                placeholder={lf('description', 'placeholder')}
                                disabled
                              />
                            </td>
                            <td className="px-4 py-3">
                              <InlineSearchSelect
                                options={uomOptions}
                                value={row.uom_id}
                                onChange={(v) => updateLine(index, { uom_id: v })}
                                placeholder={lf('uom', 'placeholder')}
                                usePortal
                                className="pr-cell-control"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                step="any"
                                min="0"
                                className="form-input w-full text-sm"
                                value={row.quantity}
                                onChange={(e) => updateLine(index, { quantity: e.target.value })}
                                placeholder={lf('quantity', 'placeholder')}
                              />
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <input
                                type="number"
                                step="any"
                                min="0"
                                className="form-input w-full text-sm"
                                value={row.estimated_unit_price}
                                onChange={(e) => updateLine(index, { estimated_unit_price: e.target.value })}
                                placeholder={lf('estimated_price', 'placeholder')}
                              />
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              <CustomDatePicker
                                selected={row.need_by_date || null}
                                onChange={(date) =>
                                  updateLine(index, {
                                    need_by_date: date ? formatLocalYmd(date) : '',
                                  })
                                }
                                type="date"
                                placeholder={lf('need_by_date', 'placeholder')}
                                className="form-input w-full text-sm"
                                isClearable
                              />
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                className="btn btn-sm btn-danger p-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                onClick={() => {
                                  setLines((prev) => prev.filter((_, i) => i !== index));
                                }}
                                disabled={lines.length <= 1}
                                title={tc('remove_line')}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <button
                      type="button"
                      className="btn btn-secondary inline-flex items-center justify-center"
                      onClick={() => setLines((prev) => [...prev, emptyLine()])}
                    >
                      <Plus size={18} className="mr-2" />
                      {tc('add_line')}
                    </button>
                    {lines.length > 0 && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 m-0">
                        <span className="font-semibold text-slate-900 dark:text-slate-50">{lines.length}</span> {tc('lines_summary', { count: lines.length, amount: subtotalLabel }).split('{count}')[1]?.split('{amount}')[0] || 'line'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 flex-wrap justify-end">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={submitting}
                    onClick={handleResetAll}
                  >
                    {tc('reset_form')}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary min-w-[150px]"
                    disabled={submitting}
                  >
                    {submitting ? t('common.form.processing') : isEdit ? tc('submit_update') : tc('submit_save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
};

export default PurchaseRequisitionCreate;
