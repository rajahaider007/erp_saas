import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { Home, ClipboardList, Plus, Trash2, SquarePen, FileInput } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import GeneralizedForm from '@/Components/GeneralizedForm';
import Breadcrumbs from '@/Components/Breadcrumbs';
import InlineSearchSelect from '@/Components/InlineSearchSelect';
import CustomDatePicker from '@/Components/DatePicker/DatePicker';
import App from '../../App.jsx';
import { useTranslations } from '@/hooks/useTranslations';
import { consumeRahjAiDraftPayload } from '@/utils/rahjAiDraft';

const emptyLine = () => ({
  purchase_requisition_line_id: '',
  inventory_item_id: '',
  item_description: '',
  uom_id: '',
  ordered_qty: '',
  unit_price: '',
  line_discount_percent: '',
  tax_category_id: '',
  expected_line_delivery_date: '',
  receive_location_id: '',
  line_notes: '',
});

function mapLineFromApi(line) {
  return {
    purchase_requisition_line_id:
      line.purchase_requisition_line_id != null ? String(line.purchase_requisition_line_id) : '',
    inventory_item_id: line.inventory_item_id != null ? String(line.inventory_item_id) : '',
    item_description: line.item_description ?? '',
    uom_id: line.uom_id != null ? String(line.uom_id) : '',
    ordered_qty: line.ordered_qty != null ? String(line.ordered_qty) : '',
    unit_price: line.unit_price != null ? String(line.unit_price) : '',
    line_discount_percent:
      line.line_discount_percent != null && line.line_discount_percent !== ''
        ? String(line.line_discount_percent)
        : '',
    tax_category_id: line.tax_category_id != null ? String(line.tax_category_id) : '',
    expected_line_delivery_date: line.expected_line_delivery_date
      ? String(line.expected_line_delivery_date).split('T')[0]
      : '',
    receive_location_id: line.receive_location_id != null ? String(line.receive_location_id) : '',
    line_notes: line.line_notes ?? '',
  };
}

function formatHeaderDate(v) {
  if (v == null || v === '') return '';
  return String(v).split('T')[0];
}

export default function PurchaseOrderCreate() {
  const { t } = useTranslations();
  const tc = useCallback((key, params) => t(`inventory.purchase_order.create.${key}`, params), [t]);
  const fld = useCallback((name, part) => t(`inventory.purchase_order.create.fields.${name}.${part}`), [t]);
  const lf = useCallback((name, part) => t(`inventory.purchase_order.create.line_fields.${name}.${part}`), [t]);

  const headerFormRef = useRef(null);
  const {
    errors: pageErrors = {},
    flash,
    error: pageError,
    itemOptions = [],
    uomOptions = [],
    locationOptions = [],
    vendorOptions = [],
    currencyOptions = [],
    taxCategoryOptions = [],
    approvedPrOptions = [],
    itemMetaById = {},
    defaults = {},
    order = null,
    preview_po_number = null,
  } = usePage().props;

  const isEdit = Boolean(order?.id);
  const [headerFormKey, setHeaderFormKey] = useState(0);
  const [lines, setLines] = useState([emptyLine()]);
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [linkPr, setLinkPr] = useState(order?.purchase_requisition_id ? 'yes' : 'no');
  const [prId, setPrId] = useState(
    order?.purchase_requisition_id != null ? String(order.purchase_requisition_id) : ''
  );
  const [loadingPr, setLoadingPr] = useState(false);
  const [headerPrefillBoost, setHeaderPrefillBoost] = useState({});
  const aiDraftPayload = useMemo(
    () => (order?.id ? null : consumeRahjAiDraftPayload('purchase_order')),
    [order?.id]
  );

  useEffect(() => {
    if (order?.id) {
      setHeaderPrefillBoost({});
      setLinkPr(order.purchase_requisition_id ? 'yes' : 'no');
      setPrId(order.purchase_requisition_id != null ? String(order.purchase_requisition_id) : '');
      setLines(
        Array.isArray(order.lines) && order.lines.length ? order.lines.map(mapLineFromApi) : [emptyLine()]
      );
    } else {
      setHeaderPrefillBoost({});
      setLinkPr('no');
      setPrId('');
      setLines([emptyLine()]);
    }
  }, [order?.id]);

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

  const poTypeOptions = useMemo(
    () => [
      { value: 'standard', label: tc('po_type_options.standard') },
      { value: 'blanket', label: tc('po_type_options.blanket') },
      { value: 'import', label: tc('po_type_options.import') },
    ],
    [tc]
  );

  const incotermOptions = useMemo(
    () =>
      [
        'EXW',
        'FCA',
        'CPT',
        'CIP',
        'DAP',
        'DPU',
        'DDP',
        'FAS',
        'FOB',
        'CFR',
        'CIF',
      ].map((code) => ({ value: code, label: code })),
    []
  );

  const paymentTermsOptions = useMemo(
    () => [
      { value: 'Net 15', label: 'Net 15' },
      { value: 'Net 30', label: 'Net 30' },
      { value: 'Net 45', label: 'Net 45' },
      { value: 'Net 60', label: 'Net 60' },
      { value: 'COD', label: 'COD' },
      { value: 'Advance', label: tc('payment_terms_advance') },
    ],
    [tc]
  );

  const linkPrOptions = useMemo(
    () => [
      { value: 'no', label: tc('link_pr_options.without') },
      { value: 'yes', label: tc('link_pr_options.with') },
    ],
    [tc]
  );

  const headerFields = useMemo(
    () => [
      {
        name: 'po_number_display',
        label: fld('po_number', 'label'),
        type: 'text',
        placeholder: fld('po_number', 'placeholder'),
        required: false,
        disabled: true,
        section: tc('section_header'),
      },
      {
        name: 'vendor_id',
        label: fld('vendor_id', 'label'),
        type: 'select',
        placeholder: fld('vendor_id', 'placeholder'),
        options: vendorOptions,
        required: true,
        searchable: true,
        section: tc('section_header'),
      },
      {
        name: 'po_type',
        label: fld('po_type', 'label'),
        type: 'select',
        placeholder: fld('po_type', 'placeholder'),
        options: poTypeOptions,
        required: true,
      },
      {
        name: 'is_blanket',
        label: fld('is_blanket', 'label'),
        type: 'toggle',
        required: false,
      },
      {
        name: 'vendor_reference',
        label: fld('vendor_reference', 'label'),
        type: 'text',
        placeholder: fld('vendor_reference', 'placeholder'),
        required: false,
        maxLength: 120,
      },
      {
        name: 'po_date',
        label: fld('po_date', 'label'),
        type: 'datepicker',
        placeholder: fld('po_date', 'placeholder'),
        required: true,
      },
      {
        name: 'expected_delivery_date',
        label: fld('expected_delivery_date', 'label'),
        type: 'datepicker',
        placeholder: fld('expected_delivery_date', 'placeholder'),
        required: false,
      },
      {
        name: 'ship_to_location_id',
        label: fld('ship_to_location_id', 'label'),
        type: 'select',
        placeholder: fld('ship_to_location_id', 'placeholder'),
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
        name: 'incoterms',
        label: fld('incoterms', 'label'),
        type: 'select',
        placeholder: fld('incoterms', 'placeholder'),
        options: incotermOptions,
        required: false,
        searchable: true,
      },
      {
        name: 'incoterms_location',
        label: fld('incoterms_location', 'label'),
        type: 'text',
        placeholder: fld('incoterms_location', 'placeholder'),
        required: false,
        maxLength: 120,
      },
      {
        name: 'payment_terms',
        label: fld('payment_terms', 'label'),
        type: 'select',
        placeholder: fld('payment_terms', 'placeholder'),
        options: paymentTermsOptions,
        required: false,
        searchable: true,
      },
      {
        name: 'advance_payment_percent',
        label: fld('advance_payment_percent', 'label'),
        type: 'decimal',
        placeholder: fld('advance_payment_percent', 'placeholder'),
        required: false,
        min: 0,
        max: 100,
        step: '0.01',
      },
      {
        name: 'tax_inclusive',
        label: fld('tax_inclusive', 'label'),
        type: 'toggle',
        required: false,
      },
      {
        name: 'header_discount_percent',
        label: fld('header_discount_percent', 'label'),
        type: 'decimal',
        placeholder: fld('header_discount_percent', 'placeholder'),
        required: false,
        min: 0,
        max: 100,
        step: '0.01',
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
        name: 'notes',
        label: fld('notes', 'label'),
        type: 'textarea',
        placeholder: fld('notes', 'placeholder'),
        required: false,
        rows: 2,
      },
    ],
    [fld, tc, vendorOptions, locationOptions, currencyOptions, poTypeOptions, incotermOptions, paymentTermsOptions]
  );

  const initialHeader = useMemo(() => {
    if (order?.id) {
      return {
        po_number_display: order.po_number ?? '',
        vendor_id: order.vendor_id != null ? String(order.vendor_id) : '',
        po_type: order.po_type || 'standard',
        is_blanket: Boolean(order.is_blanket),
        vendor_reference: order.vendor_reference ?? '',
        po_date: formatHeaderDate(order.po_date),
        expected_delivery_date: formatHeaderDate(order.expected_delivery_date),
        ship_to_location_id: order.ship_to_location_id != null ? String(order.ship_to_location_id) : '',
        delivery_address: order.delivery_address ?? '',
        currency_id: order.currency_id != null ? String(order.currency_id) : '',
        fx_rate: order.fx_rate != null && order.fx_rate !== '' ? String(order.fx_rate) : '',
        incoterms: order.incoterms ?? '',
        incoterms_location: order.incoterms_location ?? '',
        payment_terms: order.payment_terms ?? '',
        advance_payment_percent:
          order.advance_payment_percent != null && order.advance_payment_percent !== ''
            ? String(order.advance_payment_percent)
            : '',
        tax_inclusive: Boolean(order.tax_inclusive),
        header_discount_percent:
          order.header_discount_percent != null && order.header_discount_percent !== ''
            ? String(order.header_discount_percent)
            : '',
        initial_status: order.status === 'approved' ? 'approved' : 'draft',
        notes: order.notes ?? '',
      };
    }
    const base = {
      po_number_display: preview_po_number ?? '',
      vendor_id: '',
      po_type: 'standard',
      is_blanket: false,
      vendor_reference: '',
      po_date: defaults.po_date || '',
      expected_delivery_date: '',
      ship_to_location_id: defaults.ship_to_location_id || '',
      delivery_address: '',
      currency_id: defaults.currency_id || '',
      fx_rate: defaults.fx_rate || '',
      incoterms: '',
      incoterms_location: '',
      payment_terms: '',
      advance_payment_percent: '',
      tax_inclusive: false,
      header_discount_percent: '',
      initial_status: 'draft',
      notes: '',
    };
    return aiDraftPayload ? { ...base, ...aiDraftPayload } : base;
  }, [aiDraftPayload, defaults, order, preview_po_number]);

  const lineSubtotal = useMemo(() => {
    let sum = 0;
    for (const row of lines) {
      const q = parseFloat(row.ordered_qty);
      let price = parseFloat(row.unit_price);
      const disc = parseFloat(row.line_discount_percent);
      if (!Number.isNaN(disc) && disc > 0 && !Number.isNaN(price)) {
        price = price * (1 - disc / 100);
      }
      if (!Number.isNaN(q) && !Number.isNaN(price)) {
        sum += q * price;
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
      tax_category_id: meta?.default_tax_category_id || '',
    };
    updateLine(index, patch);
  };

  const validateLines = () => {
    for (let i = 0; i < lines.length; i++) {
      const row = lines[i];
      if (!row.inventory_item_id || !row.uom_id) {
        return false;
      }
      const q = parseFloat(row.ordered_qty);
      const p = parseFloat(row.unit_price);
      if (Number.isNaN(q) || q <= 0 || Number.isNaN(p) || p <= 0) {
        return false;
      }
    }
    return lines.length > 0;
  };

  const handleLoadFromPr = async () => {
    setAlert(null);
    if (linkPr !== 'yes' || !prId) {
      setAlert({ type: 'error', message: tc('msg_pick_pr_first') });
      return;
    }
    setLoadingPr(true);
    try {
      const excludePo = order?.id != null ? String(order.id) : '';
      const { data } = await axios.get(`/inventory/purchase-order/prefill-pr/${prId}`, {
        params: excludePo ? { exclude_po: excludePo } : {},
      });
      if (!Array.isArray(data.lines) || data.lines.length === 0) {
        setAlert({
          type: 'error',
          message: tc('msg_pr_fully_consumed'),
        });
        setLoadingPr(false);
        return;
      }
      const mapped =
        Array.isArray(data.lines) && data.lines.length
          ? data.lines.map((l) => ({
              purchase_requisition_line_id: l.purchase_requisition_line_id
                ? String(l.purchase_requisition_line_id)
                : '',
              inventory_item_id: String(l.inventory_item_id),
              item_description: l.item_description ?? '',
              uom_id: String(l.uom_id),
              ordered_qty: String(l.ordered_qty ?? ''),
              unit_price:
                l.unit_price != null && l.unit_price !== '' ? String(l.unit_price) : '',
              line_discount_percent: '',
              tax_category_id: itemMetaById[String(l.inventory_item_id)]?.default_tax_category_id || '',
              expected_line_delivery_date: l.need_by_date ? String(l.need_by_date).split('T')[0] : '',
              receive_location_id: '',
              line_notes: '',
            }))
          : [emptyLine()];
      setLines(mapped);
      setHeaderPrefillBoost({
        ship_to_location_id: data.ship_to_location_id != null ? String(data.ship_to_location_id) : undefined,
        delivery_address: data.delivery_address ?? undefined,
        currency_id: data.currency_id != null ? String(data.currency_id) : undefined,
        fx_rate: data.fx_rate != null && data.fx_rate !== '' ? String(data.fx_rate) : undefined,
      });
      setHeaderFormKey((k) => k + 1);
      setAlert({ type: 'success', message: tc('msg_loaded_from_pr') });
    } catch (err) {
      const msg = err.response?.data?.message || tc('msg_pr_load_failed');
      setAlert({ type: 'error', message: msg });
    } finally {
      setLoadingPr(false);
    }
  };

  const mergedInitialHeader = useMemo(() => {
    const h = { ...initialHeader };
    if (headerPrefillBoost.ship_to_location_id !== undefined) {
      h.ship_to_location_id = headerPrefillBoost.ship_to_location_id;
    }
    if (headerPrefillBoost.delivery_address !== undefined) {
      h.delivery_address = headerPrefillBoost.delivery_address;
    }
    if (headerPrefillBoost.currency_id !== undefined) {
      h.currency_id = headerPrefillBoost.currency_id;
    }
    if (headerPrefillBoost.fx_rate !== undefined) {
      h.fx_rate = headerPrefillBoost.fx_rate;
    }
    return h;
  }, [initialHeader, headerPrefillBoost]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setAlert(null);

    if (linkPr === 'yes' && !prId) {
      setAlert({ type: 'error', message: tc('msg_pr_required') });
      return;
    }

    if (!headerFormRef.current?.validate?.()) {
      return;
    }

    if (!validateLines()) {
      setAlert({ type: 'error', message: tc('msg_fix_lines') });
      return;
    }

    const header = headerFormRef.current.getValues();
    const payload = {
      link_pr: linkPr,
      purchase_requisition_id: linkPr === 'yes' && prId ? parseInt(prId, 10) : null,
      initial_status: header.initial_status || 'draft',
      vendor_id: parseInt(header.vendor_id, 10),
      po_type: header.po_type,
      is_blanket: !!header.is_blanket,
      vendor_reference: header.vendor_reference || null,
      po_date: header.po_date,
      expected_delivery_date: header.expected_delivery_date || null,
      ship_to_location_id: header.ship_to_location_id || null,
      delivery_address: header.delivery_address || null,
      currency_id: header.currency_id || null,
      fx_rate: header.fx_rate === '' || header.fx_rate == null ? null : header.fx_rate,
      incoterms: header.incoterms || null,
      incoterms_location: header.incoterms_location || null,
      payment_terms: header.payment_terms || null,
      advance_payment_percent:
        header.advance_payment_percent === '' || header.advance_payment_percent == null
          ? null
          : header.advance_payment_percent,
      tax_inclusive: !!header.tax_inclusive,
      header_discount_percent:
        header.header_discount_percent === '' || header.header_discount_percent == null
          ? null
          : header.header_discount_percent,
      notes: header.notes || null,
      lines: lines.map((row) => ({
        purchase_requisition_line_id:
          linkPr === 'yes' && row.purchase_requisition_line_id
            ? parseInt(row.purchase_requisition_line_id, 10)
            : null,
        inventory_item_id: parseInt(row.inventory_item_id, 10),
        uom_id: parseInt(row.uom_id, 10),
        ordered_qty: row.ordered_qty,
        unit_price: row.unit_price,
        line_discount_percent:
          row.line_discount_percent === '' || row.line_discount_percent == null
            ? null
            : row.line_discount_percent,
        tax_category_id: row.tax_category_id ? parseInt(row.tax_category_id, 10) : null,
        expected_line_delivery_date: row.expected_line_delivery_date || null,
        receive_location_id: row.receive_location_id ? parseInt(row.receive_location_id, 10) : null,
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
    if (order?.id) {
      router.put(`/inventory/purchase-order/${order.id}`, payload, opts);
    } else {
      router.post('/inventory/purchase-order', payload, opts);
    }
  };

  const handleResetAll = () => {
    setAlert(null);
    setHeaderPrefillBoost({});
    if (order?.id) {
      setLinkPr(order.purchase_requisition_id ? 'yes' : 'no');
      setPrId(order.purchase_requisition_id != null ? String(order.purchase_requisition_id) : '');
      setLines(
        Array.isArray(order.lines) && order.lines.length ? order.lines.map(mapLineFromApi) : [emptyLine()]
      );
      setHeaderFormKey((k) => k + 1);
    } else {
      headerFormRef.current?.resetForm?.();
      setLinkPr('no');
      setPrId('');
      setLines([emptyLine()]);
    }
  };

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: tc('breadcrumb_inventory'), icon: ClipboardList, href: '/erp-modules' },
      { label: tc('breadcrumb_po'), icon: ClipboardList, href: '/inventory/purchase-order' },
      isEdit
        ? { label: tc('breadcrumb_edit'), icon: SquarePen, href: null }
        : { label: tc('breadcrumb_create'), icon: Plus, href: null },
    ],
    [t, tc, isEdit]
  );

  const subtotalLabel = lineSubtotal.toLocaleString(undefined, {
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
                  {isEdit && order?.po_number ? (
                    <span className="ml-2 text-base font-mono font-normal opacity-90">{order.po_number}</span>
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
                <section className="mb-4 p-3 rounded-lg border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                  <h2 className="m-0 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    {tc('section_pr_link')}
                  </h2>
                  <p className="mt-1 mb-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {tc('pr_link_hint')}
                  </p>
                  <div className="flex flex-wrap gap-3 items-end">
                    <div className="input-group min-w-[12rem]">
                      <label className="input-label">{tc('link_pr_label')}</label>
                      <select
                        className="form-input w-full"
                        value={linkPr}
                        onChange={(e) => {
                          const v = e.target.value;
                          setLinkPr(v);
                          if (v === 'no') {
                            setPrId('');
                            setLines((prev) =>
                              prev.map((row) => ({ ...row, purchase_requisition_line_id: '' }))
                            );
                          }
                        }}
                        aria-label={tc('link_pr_label')}
                      >
                        {linkPrOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {linkPr === 'yes' && (
                      <>
                        <div className="min-w-[16rem] flex-1">
                          <label className="input-label block mb-1">{tc('approved_pr_label')}</label>
                          <InlineSearchSelect
                            options={approvedPrOptions}
                            value={prId}
                            onChange={(v) => setPrId(v)}
                            placeholder={tc('approved_pr_placeholder')}
                            usePortal
                            className="pr-cell-control"
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => void handleLoadFromPr()}
                          disabled={loadingPr || !prId}
                        >
                          <FileInput className="btn-icon" size={18} />
                          {loadingPr ? tc('loading_pr') : tc('btn_load_from_pr')}
                        </button>
                      </>
                    )}
                  </div>
                </section>

                <GeneralizedForm
                  key={`po-h-${headerFormKey}-${order?.id ?? 'new'}`}
                  ref={headerFormRef}
                  embedded
                  showEmbeddedHeader={false}
                  title=""
                  subtitle=""
                  fields={headerFields}
                  initialData={mergedInitialHeader}
                  formGridClassName="form-grid--pr-compact"
                  onSubmit={() => {}}
                  showReset={false}
                  showSubmitActions={false}
                />

                <section className="mt-5" aria-labelledby="po-lines-heading">
                  <div className="textarea-group mb-1.5">
                    <h2 id="po-lines-heading" className="m-0 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      {tc('section_lines')}
                    </h2>
                    <p className="mt-1 mb-0 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {tc('lines_hint')}
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-700">
                    <table className="min-w-[1180px] w-full border-collapse text-sm pr-line-table" role="grid" aria-label={tc('section_lines')}>
                      <thead>
                        <tr className="bg-slate-50/90 dark:bg-slate-800/50 text-left">
                          <th scope="col" className="px-2 py-2 font-semibold w-10">
                            {tc('line_number')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[15rem]">
                            {lf('item', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[14rem]">
                            {lf('description', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[9rem]">
                            {lf('uom', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[8.5rem] whitespace-nowrap">
                            {lf('ordered_qty', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[8.5rem] whitespace-nowrap">
                            {lf('unit_price', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[7.5rem] whitespace-nowrap">
                            {lf('line_discount', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[9rem]">
                            {lf('tax_category', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[8rem]">
                            {lf('line_delivery', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[9rem]">
                            {lf('receive_loc', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[11rem]">
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
                                className="form-input w-full min-w-[12rem]"
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
                                className="form-input w-full min-w-[8.5rem] sm:min-w-[9rem] tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={row.ordered_qty}
                                onChange={(e) => updateLine(index, { ordered_qty: e.target.value })}
                                placeholder={lf('ordered_qty', 'placeholder')}
                                aria-label={lf('ordered_qty', 'label')}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                step="any"
                                min="0"
                                className="form-input w-full min-w-[8.5rem] sm:min-w-[9rem] tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={row.unit_price}
                                onChange={(e) => updateLine(index, { unit_price: e.target.value })}
                                placeholder={lf('unit_price', 'placeholder')}
                                aria-label={lf('unit_price', 'label')}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                step="any"
                                min="0"
                                className="form-input w-full min-w-[7.5rem] sm:min-w-[8rem] tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                value={row.line_discount_percent}
                                onChange={(e) => updateLine(index, { line_discount_percent: e.target.value })}
                                placeholder={lf('line_discount', 'placeholder')}
                                aria-label={lf('line_discount', 'label')}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <InlineSearchSelect
                                options={taxCategoryOptions}
                                value={row.tax_category_id}
                                onChange={(v) => updateLine(index, { tax_category_id: v })}
                                placeholder={lf('tax_category', 'placeholder')}
                                usePortal
                                className="pr-cell-control"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <CustomDatePicker
                                selected={row.expected_line_delivery_date ? new Date(row.expected_line_delivery_date) : null}
                                onChange={(date) =>
                                  updateLine(index, {
                                    expected_line_delivery_date: date ? date.toISOString().split('T')[0] : '',
                                  })
                                }
                                type="date"
                                placeholder={lf('line_delivery', 'placeholder')}
                                className="form-input w-full min-w-[8rem]"
                                isClearable
                              />
                            </td>
                            <td className="px-2 py-2">
                              <InlineSearchSelect
                                options={locationOptions}
                                value={row.receive_location_id}
                                onChange={(v) => updateLine(index, { receive_location_id: v })}
                                placeholder={lf('receive_loc', 'placeholder')}
                                usePortal
                                className="pr-cell-control"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                className="form-input w-full min-w-[10rem]"
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
}
