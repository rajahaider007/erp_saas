import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { Home, ClipboardList, Plus, Trash2, SquarePen } from 'lucide-react';
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
        name: 'required_by_date',
        label: fld('required_by_date', 'label'),
        type: 'datepicker',
        placeholder: fld('required_by_date', 'placeholder'),
        required: false,
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
        name: 'priority',
        label: fld('priority', 'label'),
        type: 'select',
        placeholder: fld('priority', 'placeholder'),
        options: priorityOptions,
        required: true,
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
    [fld, tc, locationOptions, currencyOptions, departmentOptions, priorityOptions]
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
    const payload = {
      initial_status: header.initial_status || 'draft',
      pr_date: header.pr_date,
      required_by_date: header.required_by_date || null,
      deliver_to_location_id: header.deliver_to_location_id || null,
      delivery_address: header.delivery_address || null,
      currency_id: header.currency_id || null,
      fx_rate: header.fx_rate === '' || header.fx_rate == null ? null : header.fx_rate,
      priority: header.priority,
      department_id: header.department_id || null,
      requested_by: header.requested_by || null,
      justification: header.justification || null,
      notes: header.notes || null,
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
      <div className="rounded-xl shadow-lg border-slate-200">
        <div className="p-4 md:p-5">
          <Breadcrumbs items={breadcrumbItems} description={tc('breadcrumb_desc')} />

          <div className="form-theme-system">
            <div className="form-container form-container--pr-compact">
              <div className="form-header form-header--compact mb-4">
                <h1 className="form-title form-title--compact">
                  {isEdit ? tc('title_edit') : tc('title')}
                  {isEdit && requisition?.pr_number ? (
                    <span className="ml-2 text-base font-mono font-normal opacity-90">{requisition.pr_number}</span>
                  ) : null}
                </h1>
                <p className="form-subtitle mb-0">{isEdit ? tc('subtitle_edit') : tc('subtitle')}</p>
              </div>

              {alert && (
                <div
                  className={`mb-4 ${alert.type === 'error' ? 'alert-error-themed' : 'alert-success-themed'}`}
                  role={alert.type === 'error' ? 'alert' : 'status'}
                >
                  <p className="m-0">{alert.message}</p>
                  {pageErrors && Object.keys(pageErrors).length > 0 && (
                    <ul className="mt-2 mb-0 list-disc pl-5 space-y-1">
                      {Object.entries(pageErrors).map(([key, val]) => (
                        <li key={key}>{Array.isArray(val) ? val[0] : val}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <form onSubmit={handleFormSubmit} noValidate>
                <GeneralizedForm
                  key={`pr-h-${headerFormKey}-${requisition?.id ?? 'new'}`}
                  ref={headerFormRef}
                  embedded
                  showEmbeddedHeader={false}
                  title=""
                  subtitle=""
                  fields={headerFields}
                  initialData={initialHeader}
                  formGridClassName="form-grid--pr-compact"
                  onSubmit={() => {}}
                  showReset={false}
                  showSubmitActions={false}
                />

                <section className="mt-5" aria-labelledby="pr-lines-heading">
                  <div className="textarea-group mb-1.5">
                    <h2 id="pr-lines-heading" className="m-0 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      {tc('section_lines')}
                    </h2>
                    <p className="mt-1 mb-0 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {tc('lines_hint')}
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-700">
                    <table className="min-w-full border-collapse text-sm pr-line-table" role="grid" aria-label={tc('section_lines')}>
                      <thead>
                        <tr className="bg-slate-50/90 dark:bg-slate-800/50 text-left">
                          <th scope="col" className="px-2 py-2 font-semibold w-10">
                            {tc('line_number')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[14rem]">
                            {lf('item', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[12rem]">
                            {lf('description', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[8rem]">
                            {lf('uom', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[6rem]">
                            {lf('quantity', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[7rem]">
                            {lf('estimated_price', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[8rem]">
                            {lf('need_by_date', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[8rem]">
                            {lf('line_notes', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 w-12" aria-label={tc('remove_line')} />
                        </tr>
                      </thead>
                      <tbody>
                        {lines.map((row, index) => (
                          <tr key={index} className="border-t border-slate-200/80 dark:border-slate-700 align-top">
                            <td className="px-2 py-2 text-muted-foreground tabular-nums">{index + 1}</td>
                            <td className="px-2 py-2">
                              <InlineSearchSelect
                                options={itemOptions}
                                value={row.inventory_item_id}
                                onChange={(v) => onItemPicked(index, v)}
                                placeholder={lf('item', 'placeholder')}
                                usePortal
                                className="pr-cell-control"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                className="form-input w-full min-w-[10rem]"
                                value={row.item_description}
                onChange={(e) => updateLine(index, { item_description: e.target.value })}
                                placeholder={lf('description', 'placeholder')}
                                aria-label={lf('description', 'label')}
                                maxLength={500}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <InlineSearchSelect
                                options={uomOptions}
                                value={row.uom_id}
                                onChange={(v) => updateLine(index, { uom_id: v })}
                                placeholder={lf('uom', 'placeholder')}
                                usePortal
                                className="pr-cell-control"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                step="any"
                                min="0"
                                className="form-input w-full min-w-[5rem]"
                                value={row.quantity}
                                onChange={(e) => updateLine(index, { quantity: e.target.value })}
                                placeholder={lf('quantity', 'placeholder')}
                                aria-label={lf('quantity', 'label')}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                step="any"
                                min="0"
                                className="form-input w-full min-w-[5rem]"
                                value={row.estimated_unit_price}
                                onChange={(e) => updateLine(index, { estimated_unit_price: e.target.value })}
                                placeholder={lf('estimated_price', 'placeholder')}
                                aria-label={lf('estimated_price', 'label')}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <CustomDatePicker
                                selected={row.need_by_date || null}
                                onChange={(date) =>
                                  updateLine(index, {
                                    need_by_date: date ? formatLocalYmd(date) : '',
                                  })
                                }
                                type="date"
                                placeholder={lf('need_by_date', 'placeholder')}
                                className="form-input w-full min-w-[8rem]"
                                isClearable
                              />
                            </td>
              <td className="px-2 py-2">
                <input
                  type="text"
                  className="form-input w-full min-w-[8rem]"
                  value={row.line_notes}
                  onChange={(e) => updateLine(index, { line_notes: e.target.value })}
                  placeholder={lf('line_notes', 'placeholder')}
                  aria-label={lf('line_notes', 'label')}
                  maxLength={500}
                />
              </td>
                            <td className="px-2 py-2">
                              <button
                                type="button"
                                className="btn btn-secondary p-2"
                                onClick={() => {
                                  setLines((prev) => prev.filter((_, i) => i !== index));
                                }}
                                disabled={lines.length <= 1}
                                title={tc('remove_line')}
                                aria-label={tc('remove_line')}
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setLines((prev) => [...prev, emptyLine()])}
                    >
                      <Plus className="btn-icon" size={18} />
                      {tc('add_line')}
                    </button>
                    <p className="m-0 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {tc('lines_summary', { count: lines.length, amount: subtotalLabel })}
                    </p>
                  </div>
                </section>

                <div className="button-group button-group--pr mt-4">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? t('common.form.processing') : isEdit ? tc('submit_update') : tc('submit_save')}
                  </button>
                  <button type="button" className="btn btn-secondary" disabled={submitting} onClick={handleResetAll}>
                    {tc('reset_form')}
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
