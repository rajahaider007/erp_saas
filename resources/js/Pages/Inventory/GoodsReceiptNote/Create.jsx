import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { Home, ClipboardList, FileInput, Truck, FileText, ScrollText } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import GeneralizedForm from '@/Components/GeneralizedForm';
import Breadcrumbs from '@/Components/Breadcrumbs';
import InlineSearchSelect from '@/Components/InlineSearchSelect';
import CustomDatePicker from '@/Components/DatePicker/DatePicker';
import { formatLocalYmd } from '@/utils/dateOnly';
import App from '../../App.jsx';
import { useTranslations } from '@/hooks/useTranslations';
import { consumeRahjAiDraftPayload } from '@/utils/rahjAiDraft';

const emptyLine = () => ({
  purchase_order_line_id: '',
  inventory_item_id: '',
  item_label: '',
  item_description: '',
  uom_label: '',
  po_ordered_qty: '',
  previously_received_qty: '',
  receipt_qty: '',
  unit_cost: '',
  accepted_qty: '',
  rejection_reason: '',
  qc_line_status: 'passed',
  lot_batch_no: '',
  manufacturing_date: '',
  expiry_date: '',
  temperature_at_receipt: '',
  put_away_location_id: '',
  line_notes: '',
});

function lineTotal(row) {
  const q = parseFloat(row.receipt_qty);
  const c = parseFloat(row.unit_cost);
  if (Number.isNaN(q) || Number.isNaN(c)) return 0;
  return q * c;
}

function effectiveAcceptedQty(row) {
  const r = parseFloat(row.receipt_qty);
  let a = parseFloat(row.accepted_qty);
  if (row.accepted_qty === '' || row.accepted_qty == null || Number.isNaN(a)) {
    a = r;
  }
  if (Number.isNaN(r) || Number.isNaN(a)) return Number.NaN;
  return Math.min(a, r);
}

function lineAcceptedValue(row) {
  const c = parseFloat(row.unit_cost);
  const a = effectiveAcceptedQty(row);
  if (Number.isNaN(c) || Number.isNaN(a)) return 0;
  return a * c;
}

function lineRejectedValue(row) {
  return Math.max(0, lineTotal(row) - lineAcceptedValue(row));
}

const qtyInputCls =
  'form-input w-full min-w-[8.5rem] sm:min-w-[9rem] tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

export default function GoodsReceiptNoteCreate() {
  const { t } = useTranslations();
  const tc = useCallback((key, params) => t(`inventory.goods_receipt_note.create.${key}`, params), [t]);
  const fld = useCallback((name, part) => t(`inventory.goods_receipt_note.create.fields.${name}.${part}`), [t]);
  const lf = useCallback((name, part) => t(`inventory.goods_receipt_note.create.line_fields.${name}.${part}`), [t]);

  const headerFormRef = useRef(null);
  const {
    errors: pageErrors = {},
    flash,
    error: pageError,
    locationOptions = [],
    currencyOptions = [],
    approvedPoOptions = [],
    defaults = {},
    preview_grn_number = null,
    grn = null,
  } = usePage().props;

  const isEdit = Boolean(grn?.id);

  const [headerFormKey, setHeaderFormKey] = useState(0);
  const [lines, setLines] = useState(() =>
    isEdit && grn?.lines?.length ? grn.lines : [emptyLine()]
  );
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [poId, setPoId] = useState(isEdit ? String(grn.purchase_order_id) : '');
  const [vendorId, setVendorId] = useState(isEdit ? String(grn.vendor_id) : '');
  const [loadingPo, setLoadingPo] = useState(false);
  const [headerPrefillBoost, setHeaderPrefillBoost] = useState({});
  const aiDraftPayload = useMemo(
    () => (isEdit ? null : consumeRahjAiDraftPayload('goods_receipt_note')),
    [isEdit]
  );

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
    if (flash?.success) {
      setAlert({ type: 'success', message: flash.success });
    }
  }, [flash?.success]);

  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      const first = Object.values(pageErrors).flat().filter(Boolean)[0];
      setAlert({
        type: 'error',
        message: first || tc('msg_please_correct_errors'),
      });
    }
  }, [pageErrors, tc]);

  const grnTypeOptions = useMemo(
    () => [
      { value: 'standard', label: tc('grn_type_options.standard') },
      { value: 'import', label: tc('grn_type_options.import') },
      { value: 'return_from_vendor', label: tc('grn_type_options.return_from_vendor') },
      { value: 'sample', label: tc('grn_type_options.sample') },
      { value: 'consolidated', label: tc('grn_type_options.consolidated') },
    ],
    [tc]
  );

  const overallQcOptions = useMemo(
    () => [
      { value: 'pending', label: tc('overall_qc_options.pending') },
      { value: 'passed', label: tc('overall_qc_options.passed') },
      { value: 'failed', label: tc('overall_qc_options.failed') },
      { value: 'partial', label: tc('overall_qc_options.partial') },
    ],
    [tc]
  );

  const lineQcOptions = useMemo(
    () => [
      { value: 'passed', label: tc('line_qc_options.passed') },
      { value: 'failed', label: tc('line_qc_options.failed') },
      { value: 'partial', label: tc('line_qc_options.partial') },
      { value: 'waived', label: tc('line_qc_options.waived') },
    ],
    [tc]
  );

  const rejectionReasonOptions = useMemo(
    () => [
      { value: '', label: tc('rejection_reason_placeholder') },
      { value: 'quality', label: tc('rejection_reasons.quality') },
      { value: 'damage', label: tc('rejection_reasons.damage') },
      { value: 'expiry', label: tc('rejection_reasons.expiry') },
      { value: 'quantity', label: tc('rejection_reasons.quantity') },
      { value: 'other', label: tc('rejection_reasons.other') },
    ],
    [tc]
  );

  const headerFields = useMemo(
    () => [
      {
        name: 'grn_number_display',
        label: fld('grn_number', 'label'),
        type: 'text',
        placeholder: fld('grn_number', 'placeholder'),
        required: false,
        disabled: true,
        section: tc('section_header'),
      },
      {
        name: 'vendor_display',
        label: fld('vendor_display', 'label'),
        type: 'text',
        placeholder: fld('vendor_display', 'placeholder'),
        required: false,
        disabled: true,
        section: tc('section_header'),
      },
      {
        name: 'grn_type',
        label: fld('grn_type', 'label'),
        type: 'select',
        placeholder: fld('grn_type', 'placeholder'),
        options: grnTypeOptions,
        required: true,
      },
      {
        name: 'receipt_date',
        label: fld('receipt_date', 'label'),
        type: 'datepicker',
        placeholder: fld('receipt_date', 'placeholder'),
        required: true,
      },
      {
        name: 'posting_date',
        label: fld('posting_date', 'label'),
        type: 'datepicker',
        placeholder: fld('posting_date', 'placeholder'),
        required: false,
      },
      {
        name: 'receive_location_id',
        label: fld('receive_location_id', 'label'),
        type: 'select',
        placeholder: fld('receive_location_id', 'placeholder'),
        options: locationOptions,
        required: false,
        searchable: true,
      },
      {
        name: 'vehicle_number',
        label: fld('vehicle_number', 'label'),
        type: 'text',
        placeholder: fld('vehicle_number', 'placeholder'),
        required: false,
        maxLength: 80,
      },
      {
        name: 'transporter_name',
        label: fld('transporter_name', 'label'),
        type: 'text',
        placeholder: fld('transporter_name', 'placeholder'),
        required: false,
        maxLength: 160,
      },
      {
        name: 'driver_contact',
        label: fld('driver_contact', 'label'),
        type: 'text',
        placeholder: fld('driver_contact', 'placeholder'),
        required: false,
        maxLength: 160,
      },
      {
        name: 'seal_number',
        label: fld('seal_number', 'label'),
        type: 'text',
        placeholder: fld('seal_number', 'placeholder'),
        required: false,
        maxLength: 80,
      },
      {
        name: 'container_number',
        label: fld('container_number', 'label'),
        type: 'text',
        placeholder: fld('container_number', 'placeholder'),
        required: false,
        maxLength: 80,
      },
      {
        name: 'bol_awb',
        label: fld('bol_awb', 'label'),
        type: 'text',
        placeholder: fld('bol_awb', 'placeholder'),
        required: false,
        maxLength: 120,
      },
      {
        name: 'packing_list_ref',
        label: fld('packing_list_ref', 'label'),
        type: 'text',
        placeholder: fld('packing_list_ref', 'placeholder'),
        required: false,
        maxLength: 120,
      },
      {
        name: 'vendor_delivery_note_no',
        label: fld('vendor_delivery_note_no', 'label'),
        type: 'text',
        placeholder: fld('vendor_delivery_note_no', 'placeholder'),
        required: false,
        maxLength: 120,
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
        name: 'overall_qc_status',
        label: fld('overall_qc_status', 'label'),
        type: 'select',
        placeholder: fld('overall_qc_status', 'placeholder'),
        options: overallQcOptions,
        required: true,
      },
      {
        name: 'landed_cost_applies',
        label: fld('landed_cost_applies', 'label'),
        type: 'toggle',
        required: false,
      },
      {
        name: 'landed_cost_reference',
        label: fld('landed_cost_reference', 'label'),
        type: 'text',
        placeholder: fld('landed_cost_reference', 'placeholder'),
        required: false,
        maxLength: 120,
      },
      {
        name: 'three_way_match_display',
        label: fld('three_way_match_display', 'label'),
        type: 'text',
        placeholder: '',
        required: false,
        disabled: true,
        section: tc('section_header'),
      },
      {
        name: 'initial_status',
        label: fld('initial_status', 'label'),
        type: 'select',
        placeholder: fld('initial_status', 'placeholder'),
        options: [
          { value: 'draft', label: tc('initial_status_options.draft') },
          { value: 'qc_pending', label: tc('initial_status_options.qc_pending') },
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
    [fld, tc, locationOptions, currencyOptions, grnTypeOptions, overallQcOptions]
  );

  const initialHeader = useMemo(
    () => {
      const base = {
      grn_number_display: preview_grn_number ?? '',
      vendor_display: '',
      grn_type: 'standard',
      receipt_date: defaults.receipt_date || '',
      posting_date: defaults.posting_date || '',
      receive_location_id: defaults.receive_location_id || '',
      vehicle_number: '',
      transporter_name: '',
      driver_contact: '',
      seal_number: '',
      container_number: '',
      bol_awb: '',
      packing_list_ref: '',
      vendor_delivery_note_no: '',
      currency_id: defaults.currency_id || '',
      fx_rate: defaults.fx_rate || '',
      overall_qc_status: 'pending',
      landed_cost_applies: false,
      landed_cost_reference: '',
      three_way_match_display: tc('match_status_pending'),
      initial_status: 'draft',
      notes: '',
      };

      return aiDraftPayload ? { ...base, ...aiDraftPayload } : base;
    },
    [aiDraftPayload, defaults, preview_grn_number, tc]
  );

  const threeWayMatchLabels = useMemo(
    () => ({
      pending: tc('three_way_match_labels.pending'),
      matched: tc('three_way_match_labels.matched'),
      variance: tc('three_way_match_labels.variance'),
      failed: tc('three_way_match_labels.failed'),
    }),
    [tc]
  );

  const editHeaderInitial = useMemo(() => {
    if (!grn?.id) return null;
    const tw = grn.three_way_match_status || 'pending';
    return {
      grn_number_display: grn.grn_number,
      vendor_display: grn.vendor_display,
      grn_type: grn.grn_type,
      receipt_date: grn.receipt_date,
      posting_date: grn.posting_date || '',
      receive_location_id: grn.receive_location_id || '',
      vehicle_number: grn.vehicle_number || '',
      transporter_name: grn.transporter_name || '',
      driver_contact: grn.driver_contact || '',
      seal_number: grn.seal_number || '',
      container_number: grn.container_number || '',
      bol_awb: grn.bol_awb || '',
      packing_list_ref: grn.packing_list_ref || '',
      vendor_delivery_note_no: grn.vendor_delivery_note_no || '',
      currency_id: grn.currency_id || '',
      fx_rate: grn.fx_rate || '',
      overall_qc_status: grn.overall_qc_status,
      landed_cost_applies: grn.landed_cost_applies,
      landed_cost_reference: grn.landed_cost_reference || '',
      three_way_match_display: threeWayMatchLabels[tw] || tw,
      initial_status: grn.initial_status || 'draft',
      notes: grn.notes || '',
    };
  }, [grn, threeWayMatchLabels]);

  const mergedInitialHeader = useMemo(() => {
    if (grn?.id && editHeaderInitial) {
      return { ...editHeaderInitial };
    }
    const h = { ...initialHeader };
    if (headerPrefillBoost.vendor_display !== undefined) {
      h.vendor_display = headerPrefillBoost.vendor_display;
    }
    if (headerPrefillBoost.receive_location_id !== undefined) {
      h.receive_location_id = headerPrefillBoost.receive_location_id;
    }
    if (headerPrefillBoost.currency_id !== undefined) {
      h.currency_id = headerPrefillBoost.currency_id;
    }
    if (headerPrefillBoost.fx_rate !== undefined) {
      h.fx_rate = headerPrefillBoost.fx_rate;
    }
    return h;
  }, [grn?.id, editHeaderInitial, initialHeader, headerPrefillBoost]);

  const linesReceiptTotal = useMemo(() => lines.reduce((s, row) => s + lineTotal(row), 0), [lines]);

  const summaryStats = useMemo(() => {
    let receiptQty = 0;
    let receiptVal = 0;
    let acceptedVal = 0;
    for (const row of lines) {
      const r = parseFloat(row.receipt_qty);
      if (!Number.isNaN(r) && r > 0) {
        receiptQty += r;
      }
      receiptVal += lineTotal(row);
      acceptedVal += lineAcceptedValue(row);
    }
    const rejectedVal = Math.max(0, receiptVal - acceptedVal);
    return { receiptQty, receiptVal, acceptedVal, rejectedVal };
  }, [lines]);

  const updateLine = (index, patch) => {
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const handleLoadFromPo = async () => {
    setAlert(null);
    if (!poId) {
      setAlert({ type: 'error', message: tc('msg_pick_po_first') });
      return;
    }
    setLoadingPo(true);
    try {
      const { data } = await axios.get(`/inventory/goods-receipt-note/prefill-po/${poId}`);
      if (!Array.isArray(data.lines) || data.lines.length === 0) {
        setAlert({
          type: 'error',
          message: tc('msg_po_fully_received'),
        });
        setLoadingPo(false);
        return;
      }
      setVendorId(data.vendor_id != null ? String(data.vendor_id) : '');
      setHeaderPrefillBoost({
        vendor_display: data.vendor_display ?? '',
        receive_location_id: data.ship_to_location_id != null ? String(data.ship_to_location_id) : undefined,
        currency_id: data.currency_id != null ? String(data.currency_id) : undefined,
        fx_rate: data.fx_rate != null && data.fx_rate !== '' ? String(data.fx_rate) : undefined,
      });
      setHeaderFormKey((k) => k + 1);
      const mapped = data.lines.map((l) => ({
        purchase_order_line_id: String(l.purchase_order_line_id),
        inventory_item_id: String(l.inventory_item_id),
        item_label: l.item_label ?? '',
        item_description: l.item_description ?? '',
        uom_label: l.uom_label ?? '',
        po_ordered_qty: String(l.po_ordered_qty ?? ''),
        previously_received_qty: String(l.previously_received_qty ?? ''),
        receipt_qty: String(l.pending_qty ?? ''),
        unit_cost: String(l.unit_cost ?? ''),
        accepted_qty: '',
        rejection_reason: '',
        qc_line_status: 'passed',
        lot_batch_no: '',
        manufacturing_date: '',
        expiry_date: '',
        temperature_at_receipt: '',
        put_away_location_id: l.put_away_location_id != null ? String(l.put_away_location_id) : '',
        line_notes: '',
      }));
      setLines(mapped);
      setAlert({ type: 'success', message: tc('msg_loaded_from_po') });
    } catch (err) {
      const msg = err.response?.data?.message || tc('msg_po_load_failed');
      setAlert({ type: 'error', message: msg });
    } finally {
      setLoadingPo(false);
    }
  };

  const validateLines = () => {
    let anyReceipt = false;
    for (let i = 0; i < lines.length; i++) {
      const row = lines[i];
      const r = parseFloat(row.receipt_qty);
      if (Number.isNaN(r) || r < 0) {
        return false;
      }
      if (r > 0) {
        anyReceipt = true;
        if (!row.purchase_order_line_id) {
          return false;
        }
        const c = parseFloat(row.unit_cost);
        if (Number.isNaN(c) || c < 0) {
          return false;
        }
        const pending = parseFloat(row.po_ordered_qty) - parseFloat(row.previously_received_qty);
        if (!Number.isNaN(pending) && r - pending > 0.000001) {
          return false;
        }
        let accepted = parseFloat(row.accepted_qty);
        if (row.accepted_qty === '' || Number.isNaN(accepted)) {
          accepted = r;
        }
        if (accepted - r > 0.000001) {
          return false;
        }
        const rejected = r - Math.min(accepted, r);
        if (rejected > 0.000001 && !(row.rejection_reason || '').trim()) {
          return false;
        }
      }
    }
    return anyReceipt;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setAlert(null);

    if (!poId) {
      setAlert({ type: 'error', message: tc('msg_po_required') });
      return;
    }
    if (!vendorId) {
      setAlert({ type: 'error', message: tc('msg_load_po_first') });
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
    const payloadLines = lines
      .filter((row) => row.purchase_order_line_id && parseFloat(row.receipt_qty) > 0)
      .map((row) => ({
        purchase_order_line_id: parseInt(row.purchase_order_line_id, 10),
        item_description: row.item_description || null,
        receipt_qty: row.receipt_qty,
        unit_cost: row.unit_cost,
        accepted_qty:
          row.accepted_qty === '' || row.accepted_qty == null ? null : row.accepted_qty,
        rejection_reason: row.rejection_reason || null,
        qc_line_status: row.qc_line_status,
        lot_batch_no: row.lot_batch_no || null,
        manufacturing_date: row.manufacturing_date || null,
        expiry_date: row.expiry_date || null,
        temperature_at_receipt:
          row.temperature_at_receipt === '' || row.temperature_at_receipt == null
            ? null
            : row.temperature_at_receipt,
        put_away_location_id: row.put_away_location_id ? parseInt(row.put_away_location_id, 10) : null,
        line_notes: row.line_notes || null,
      }));

    const payload = {
      purchase_order_id: parseInt(poId, 10),
      vendor_id: parseInt(vendorId, 10),
      initial_status: header.initial_status || 'draft',
      grn_type: header.grn_type,
      receipt_date: header.receipt_date,
      posting_date: header.posting_date || null,
      receive_location_id: header.receive_location_id || null,
      vehicle_number: header.vehicle_number || null,
      transporter_name: header.transporter_name || null,
      driver_contact: header.driver_contact || null,
      seal_number: header.seal_number || null,
      container_number: header.container_number || null,
      bol_awb: header.bol_awb || null,
      packing_list_ref: header.packing_list_ref || null,
      vendor_delivery_note_no: header.vendor_delivery_note_no || null,
      currency_id: header.currency_id || null,
      fx_rate: header.fx_rate === '' || header.fx_rate == null ? null : header.fx_rate,
      overall_qc_status: header.overall_qc_status,
      landed_cost_applies: !!header.landed_cost_applies,
      landed_cost_reference: header.landed_cost_reference || null,
      notes: header.notes || null,
      lines: payloadLines,
    };

    setSubmitting(true);
    if (isEdit) {
      router.put(`/inventory/goods-receipt-note/${grn.id}`, payload, {
        preserveScroll: true,
        onFinish: () => setSubmitting(false),
        onError: () => setSubmitting(false),
      });
    } else {
      router.post('/inventory/goods-receipt-note', payload, {
        preserveScroll: true,
        onFinish: () => setSubmitting(false),
        onError: () => setSubmitting(false),
      });
    }
  };

  const handleResetAll = () => {
    if (isEdit) {
      router.visit(`/inventory/goods-receipt-note/${grn.id}/edit`, { preserveScroll: true });
      return;
    }
    setAlert(null);
    setPoId('');
    setVendorId('');
    setHeaderPrefillBoost({});
    setLines([emptyLine()]);
    setHeaderFormKey((k) => k + 1);
  };

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: tc('breadcrumb_inventory'), icon: ClipboardList, href: '/erp-modules' },
      { label: tc('breadcrumb_grn_list'), icon: Truck, href: '/inventory/goods-receipt-note' },
      { label: isEdit ? tc('breadcrumb_edit') : tc('breadcrumb_new'), icon: Truck, href: null },
    ],
    [t, tc, isEdit]
  );

  const subtotalLabel = linesReceiptTotal.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const fmtMoney = (n) =>
    Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <App>
      <div className="rounded-xl shadow-lg border-slate-200">
        <div className="p-4 md:p-5">
          <Breadcrumbs items={breadcrumbItems} description={tc('breadcrumb_desc')} />

          <div className="form-theme-system">
            <div className="form-container form-container--pr-compact">
              <div className="form-header form-header--compact mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="form-title form-title--compact">{tc('title')}</h1>
                  <p className="form-subtitle mb-0">{tc('subtitle')}</p>
                </div>
                {isEdit ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      className="btn btn-icon btn-secondary"
                      title={tc('invoice_summary')}
                      onClick={() => window.open(`/inventory/goods-receipt-note/${grn.id}/invoice/summary`, '_blank', 'noopener,noreferrer')}
                    >
                      <FileText size={18} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-icon btn-secondary"
                      title={tc('invoice_detailed')}
                      onClick={() => window.open(`/inventory/goods-receipt-note/${grn.id}/invoice/detailed`, '_blank', 'noopener,noreferrer')}
                    >
                      <ScrollText size={18} />
                    </button>
                  </div>
                ) : null}
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
                  <h2
                    className="m-0 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {tc('section_po_link')}
                  </h2>
                  {isEdit ? (
                    <>
                      <p className="mt-1 mb-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {tc('po_locked_readonly')}
                      </p>
                      <div className="rounded-md border border-slate-200 dark:border-slate-600 bg-white/60 dark:bg-slate-800/40 px-3 py-2 text-sm font-mono">
                        {grn.po_number}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mt-1 mb-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {tc('po_link_hint')}
                      </p>
                      <div className="flex flex-wrap gap-3 items-end">
                        <div className="min-w-[16rem] flex-1">
                          <label className="input-label block mb-1">{tc('approved_po_label')}</label>
                          <InlineSearchSelect
                            options={approvedPoOptions}
                            value={poId}
                            onChange={(v) => {
                              setPoId(v);
                              setVendorId('');
                              setHeaderPrefillBoost({});
                              setLines([emptyLine()]);
                            }}
                            placeholder={tc('approved_po_placeholder')}
                            usePortal
                            className="pr-cell-control"
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => void handleLoadFromPo()}
                          disabled={loadingPo || !poId}
                        >
                          <FileInput className="btn-icon" size={18} />
                          {loadingPo ? tc('loading_po') : tc('btn_load_from_po')}
                        </button>
                      </div>
                    </>
                  )}
                </section>

                <GeneralizedForm
                  key={`grn-h-${headerFormKey}-${grn?.id ?? 'new'}`}
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

                <section className="mt-5" aria-labelledby="grn-lines-heading">
                  <div className="textarea-group mb-1.5">
                    <h2
                      id="grn-lines-heading"
                      className="m-0 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {tc('section_lines')}
                    </h2>
                    <p className="mt-1 mb-0 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {tc('lines_hint')}
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-700">
                    <table
                      className="min-w-[1400px] w-full border-collapse text-sm pr-line-table"
                      role="grid"
                      aria-label={tc('section_lines')}
                    >
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
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[8.5rem] whitespace-nowrap">
                            {lf('po_ordered_qty', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[8.5rem] whitespace-nowrap">
                            {lf('prev_received', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[8.5rem] whitespace-nowrap">
                            {lf('receipt_qty', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[8.5rem] whitespace-nowrap">
                            {lf('unit_cost', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[9rem] whitespace-nowrap text-right">
                            {lf('line_total', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[8.5rem] whitespace-nowrap">
                            {lf('accepted_qty', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[9rem] whitespace-nowrap text-right">
                            {lf('accepted_amount', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[9rem] whitespace-nowrap text-right">
                            {lf('rejected_amount', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[8rem]">
                            {lf('rejection_reason', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[7rem]">
                            {lf('qc_line_status', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[7rem]">
                            {lf('lot_batch', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[7rem]">
                            {lf('mfg_date', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[7rem]">
                            {lf('expiry_date', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[6rem]">
                            {lf('temp_receipt', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[9rem]">
                            {lf('put_away', 'label')}
                          </th>
                          <th scope="col" className="px-2 py-2 font-semibold min-w-[7rem]">
                            {lf('line_notes', 'label')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {lines.map((row, index) => (
                          <tr
                            key={`${row.purchase_order_line_id || 'n'}-${index}`}
                            className="border-t border-slate-200/80 dark:border-slate-700 align-top"
                          >
                            <td className="px-2 py-2 text-muted-foreground tabular-nums">{index + 1}</td>
                            <td className="px-2 py-2">
                              <span className="text-sm block min-w-[8rem]">
                                {row.item_label || lf('item', 'placeholder')}
                              </span>
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
                              <span className="text-sm whitespace-nowrap">{row.uom_label || '—'}</span>
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                className={`${qtyInputCls} bg-slate-100/50 dark:bg-slate-800/40`}
                                readOnly
                                value={row.po_ordered_qty}
                                aria-label={lf('po_ordered_qty', 'label')}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                className={`${qtyInputCls} bg-slate-100/50 dark:bg-slate-800/40`}
                                readOnly
                                value={row.previously_received_qty}
                                aria-label={lf('prev_received', 'label')}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                step="any"
                                min="0"
                                className={qtyInputCls}
                                value={row.receipt_qty}
                                onChange={(e) => updateLine(index, { receipt_qty: e.target.value })}
                                placeholder={lf('receipt_qty', 'placeholder')}
                                aria-label={lf('receipt_qty', 'label')}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                step="any"
                                min="0"
                                className={qtyInputCls}
                                value={row.unit_cost}
                                onChange={(e) => updateLine(index, { unit_cost: e.target.value })}
                                placeholder={lf('unit_cost', 'placeholder')}
                                aria-label={lf('unit_cost', 'label')}
                              />
                            </td>
                            <td className="px-2 py-2 text-right tabular-nums text-sm min-w-[9rem]">
                              {fmtMoney(lineTotal(row))}
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                step="any"
                                min="0"
                                className={qtyInputCls}
                                value={row.accepted_qty}
                                onChange={(e) => updateLine(index, { accepted_qty: e.target.value })}
                                placeholder={lf('accepted_qty', 'placeholder')}
                                aria-label={lf('accepted_qty', 'label')}
                              />
                            </td>
                            <td className="px-2 py-2 text-right tabular-nums text-sm min-w-[9rem]">
                              {fmtMoney(lineAcceptedValue(row))}
                            </td>
                            <td className="px-2 py-2 text-right tabular-nums text-sm min-w-[9rem]">
                              {fmtMoney(lineRejectedValue(row))}
                            </td>
                            <td className="px-2 py-2">
                              <select
                                className="form-input w-full min-w-[7rem]"
                                value={row.rejection_reason}
                                onChange={(e) => updateLine(index, { rejection_reason: e.target.value })}
                                aria-label={lf('rejection_reason', 'label')}
                              >
                                {rejectionReasonOptions.map((o) => (
                                  <option key={o.value || 'x'} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-2">
                              <select
                                className="form-input w-full min-w-[6rem]"
                                value={row.qc_line_status}
                                onChange={(e) => updateLine(index, { qc_line_status: e.target.value })}
                                aria-label={lf('qc_line_status', 'label')}
                              >
                                {lineQcOptions.map((o) => (
                                  <option key={o.value} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                className="form-input w-full min-w-[8rem]"
                                value={row.lot_batch_no}
                                onChange={(e) => updateLine(index, { lot_batch_no: e.target.value })}
                                placeholder={lf('lot_batch', 'placeholder')}
                                maxLength={120}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <CustomDatePicker
                                selected={row.manufacturing_date || null}
                                onChange={(date) =>
                                  updateLine(index, {
                                    manufacturing_date: date ? formatLocalYmd(date) : '',
                                  })
                                }
                                type="date"
                                placeholder={lf('mfg_date', 'placeholder')}
                                className="form-input w-full min-w-[7rem]"
                                isClearable
                              />
                            </td>
                            <td className="px-2 py-2">
                              <CustomDatePicker
                                selected={row.expiry_date || null}
                                onChange={(date) =>
                                  updateLine(index, {
                                    expiry_date: date ? formatLocalYmd(date) : '',
                                  })
                                }
                                type="date"
                                placeholder={lf('expiry_date', 'placeholder')}
                                className="form-input w-full min-w-[7rem]"
                                isClearable
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                step="any"
                                className={qtyInputCls}
                                value={row.temperature_at_receipt}
                                onChange={(e) =>
                                  updateLine(index, { temperature_at_receipt: e.target.value })
                                }
                                placeholder={lf('temp_receipt', 'placeholder')}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <InlineSearchSelect
                                options={locationOptions}
                                value={row.put_away_location_id}
                                onChange={(v) => updateLine(index, { put_away_location_id: v })}
                                placeholder={lf('put_away', 'placeholder')}
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
                                maxLength={500}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <p className="m-0 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {tc('lines_summary', { count: lines.length, amount: subtotalLabel })}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-col lg:flex-row lg:items-start lg:justify-end gap-4">
                    <div
                      className="rounded-lg border border-slate-200/80 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 p-4 w-full max-w-md lg:max-w-sm shrink-0"
                      aria-labelledby="grn-summary-heading"
                    >
                      <h3
                        id="grn-summary-heading"
                        className="m-0 mb-3 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {tc('section_summary')}
                      </h3>
                      <dl className="m-0 space-y-2 text-sm">
                        <div className="flex justify-between gap-6">
                          <dt style={{ color: 'var(--text-secondary)' }}>{tc('summary_receipt_qty')}</dt>
                          <dd className="m-0 tabular-nums font-medium">
                            {summaryStats.receiptQty.toLocaleString(undefined, {
                              maximumFractionDigits: 6,
                            })}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-6">
                          <dt style={{ color: 'var(--text-secondary)' }}>{tc('summary_receipt_value')}</dt>
                          <dd className="m-0 tabular-nums font-medium">{fmtMoney(summaryStats.receiptVal)}</dd>
                        </div>
                        <div className="flex justify-between gap-6">
                          <dt style={{ color: 'var(--text-secondary)' }}>{tc('summary_accepted_value')}</dt>
                          <dd className="m-0 tabular-nums font-medium text-emerald-700 dark:text-emerald-400">
                            {fmtMoney(summaryStats.acceptedVal)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-6">
                          <dt style={{ color: 'var(--text-secondary)' }}>{tc('summary_rejected_value')}</dt>
                          <dd className="m-0 tabular-nums font-medium text-amber-700 dark:text-amber-400">
                            {fmtMoney(summaryStats.rejectedVal)}
                          </dd>
                        </div>
                        <div
                          className="flex justify-between gap-6 pt-2 mt-2 border-t border-slate-200/80 dark:border-slate-600"
                        >
                          <dt className="font-semibold">{tc('summary_grand_total')}</dt>
                          <dd className="m-0 tabular-nums font-semibold">{fmtMoney(summaryStats.receiptVal)}</dd>
                        </div>
                      </dl>
                      <p className="mt-3 mb-0 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {tc('summary_footnote')}
                      </p>
                    </div>
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
