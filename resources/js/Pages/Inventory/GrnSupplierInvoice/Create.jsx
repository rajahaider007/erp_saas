import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import App from '../../App.jsx';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, FileText, Home, Plus, Receipt, ScrollText, Trash2 } from 'lucide-react';
import Breadcrumbs from '@/Components/Breadcrumbs';
import CustomDatePicker from '@/Components/DatePicker/DatePicker';
import InlineSearchSelect from '@/Components/InlineSearchSelect';
import { useTranslations } from '@/hooks/useTranslations';
import { usePermissions } from '@/hooks/usePermissions';

function formatMoney(n) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseAmount(s) {
  if (s === '' || s === null || s === undefined) return 0;
  const x = parseFloat(String(s).replace(/,/g, ''));
  return Number.isFinite(x) ? x : 0;
}

export default function GrnSupplierInvoiceCreate() {
  const {
    vendorOptions = [],
    preview_invoice_number,
    invoice = null,
    initial_lines = [],
    gl_accounts = [],
    missing_inventory_gl = false,
    missing_tax_gl = false,
    errors: pageErrors = {},
    flash,
    error: pageError,
  } = usePage().props;

  const { t } = useTranslations();
  const tp = useCallback((k, r = {}) => t(`inventory.goods_receipt_note.purchase_invoice.${k}`, r), [t]);
  const tc = useCallback((k, r = {}) => t(`inventory.grn_supplier_invoice.create.${k}`, r), [t]);
  const { auth, hasRoutePermission, showPermissionDeniedAlert } = usePermissions();

  const siPermission = useCallback(
    (perm) => {
      if (auth?.user?.role === 'super_admin') return true;
      return hasRoutePermission('/inventory/grn-supplier-invoice', perm);
    },
    [auth?.user?.role, hasRoutePermission]
  );

  const [vendorId, setVendorId] = useState(invoice?.vendor_id ? String(invoice.vendor_id) : '');
  const [eligibleGrns, setEligibleGrns] = useState([]);
  const [selectedIds, setSelectedIds] = useState(() =>
    Array.isArray(invoice?.grn_ids) ? [...invoice.grn_ids].sort((a, b) => a - b) : []
  );
  const [lines, setLines] = useState([]);
  const [lineTaxById, setLineTaxById] = useState({});
  const [missingInventoryGl, setMissingInventoryGl] = useState(missing_inventory_gl);
  const [missingTaxGl, setMissingTaxGl] = useState(missing_tax_gl);
  const [voucherDate, setVoucherDate] = useState(invoice?.voucher_date || '');
  const [supplierInvoiceDate, setSupplierInvoiceDate] = useState(invoice?.supplier_invoice_date || '');
  const [dueDate, setDueDate] = useState(invoice?.due_date || '');
  const [referenceNumber, setReferenceNumber] = useState(invoice?.reference_number || '');
  const [description, setDescription] = useState(invoice?.description || '');
  const [notes, setNotes] = useState(invoice?.notes || '');
  const [extraRows, setExtraRows] = useState([
    { account_id: '', debit_amount: '', credit_amount: '', description: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const isEdit = Boolean(invoice?.id);

  useEffect(() => {
    if (pageError) setAlert({ type: 'error', message: pageError });
  }, [pageError]);

  useEffect(() => {
    if (flash?.error) setAlert({ type: 'error', message: flash.error });
    if (flash?.success) setAlert({ type: 'success', message: flash.success });
  }, [flash?.error, flash?.success]);

  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      const first = Object.values(pageErrors)
        .flat()
        .filter(Boolean)[0];
      setAlert({
        type: 'error',
        message: first || t('common.flash.error_title'),
      });
    }
  }, [pageErrors, t]);

  useEffect(() => {
    if (!isEdit || !initial_lines?.length) return;
    setLines(initial_lines);
    const o = {};
    initial_lines.forEach((row) => {
      o[row.id] = String(row.saved_tax_amount ?? row.default_tax_amount ?? 0);
    });
    setLineTaxById(o);
  }, [isEdit, initial_lines]);

  const loadEligible = useCallback(
    async (vid) => {
      if (!vid) {
        setEligibleGrns([]);
        return;
      }
      try {
        const { data } = await axios.get('/inventory/grn-supplier-invoice/eligible-grns', {
          params: {
            vendor_id: vid,
            except_invoice_id: invoice?.id,
          },
        });
        setEligibleGrns(data.grns || []);
      } catch {
        setEligibleGrns([]);
      }
    },
    [invoice?.id]
  );

  useEffect(() => {
    void loadEligible(vendorId ? parseInt(vendorId, 10) : 0);
  }, [vendorId, loadEligible]);

  const selectionKey = useMemo(() => [...selectedIds].sort((a, b) => a - b).join(','), [selectedIds]);

  const skipPreviewOnceRef = useRef(Boolean(invoice?.id));

  useEffect(() => {
    if (skipPreviewOnceRef.current) {
      skipPreviewOnceRef.current = false;
      return;
    }
    if (!vendorId || selectedIds.length === 0) {
      if (!isEdit) {
        setLines([]);
        setLineTaxById({});
      }
      return;
    }
    const h = setTimeout(() => {
      void (async () => {
        try {
          const { data } = await axios.get('/inventory/grn-supplier-invoice/preview-lines', {
            params: {
              vendor_id: parseInt(vendorId, 10),
              grn_ids: selectedIds,
              except_invoice_id: invoice?.id,
            },
          });
          setLines(data.lines || []);
          setMissingInventoryGl(Boolean(data.missing_inventory_gl));
          setMissingTaxGl(Boolean(data.missing_tax_gl));
          const o = {};
          (data.lines || []).forEach((row) => {
            o[row.id] = String(row.default_tax_amount ?? 0);
          });
          setLineTaxById(o);
        } catch {
          setLines([]);
          setLineTaxById({});
        }
      })();
    }, 400);
    return () => clearTimeout(h);
  }, [vendorId, selectionKey, invoice?.id, isEdit]);

  const accountOptions = useMemo(
    () =>
      (gl_accounts || []).map((a) => ({
        value: String(a.id),
        label: `${a.account_code} — ${a.account_name}`,
        subtext: a.account_type,
      })),
    [gl_accounts]
  );

  const vendorLabel = useMemo(() => {
    const v = vendorOptions.find((o) => o.value === vendorId);
    return v?.label ?? '—';
  }, [vendorOptions, vendorId]);

  const totals = useMemo(() => {
    let net = 0;
    let tax = 0;
    lines.forEach((row) => {
      const lv = Number(row.line_value) || 0;
      net += lv;
      tax += parseAmount(lineTaxById[row.id]);
    });
    net = Math.round(net * 100) / 100;
    tax = Math.round(tax * 100) / 100;
    return { net, tax, gross: Math.round((net + tax) * 100) / 100 };
  }, [lines, lineTaxById]);

  const extraNormalized = useMemo(() => {
    const out = [];
    extraRows.forEach((r) => {
      const dr = parseAmount(r.debit_amount);
      const cr = parseAmount(r.credit_amount);
      if (dr <= 0 && cr <= 0) return;
      out.push({ ...r, dr, cr, account_id: r.account_id ? parseInt(r.account_id, 10) : 0 });
    });
    return out;
  }, [extraRows]);

  const inventoryDebitPreview = useMemo(() => {
    const m = {};
    lines.forEach((row) => {
      const v = Number(row.line_value) || 0;
      if (v <= 0) return;
      const key = row.inventory_gl_label || `ID ${row.inventory_gl_account_id ?? '—'}`;
      m[key] = (m[key] || 0) + v;
    });
    return Object.entries(m).map(([label, amount]) => ({ label, amount: Math.round(amount * 100) / 100 }));
  }, [lines]);

  const taxDebitPreview = useMemo(() => {
    const m = {};
    lines.forEach((row) => {
      const ta = parseAmount(lineTaxById[row.id]);
      if (ta <= 0.000001) return;
      const key = row.input_tax_gl_label || tp('preview_tax_unassigned');
      m[key] = (m[key] || 0) + ta;
    });
    return Object.entries(m).map(([label, amount]) => ({ label, amount: Math.round(amount * 100) / 100 }));
  }, [lines, lineTaxById, tp]);

  const extraDebitSum = useMemo(() => extraNormalized.reduce((s, r) => s + r.dr, 0), [extraNormalized]);
  const extraCreditSum = useMemo(() => extraNormalized.reduce((s, r) => s + r.cr, 0), [extraNormalized]);

  const vendorCreditPreview = useMemo(() => {
    const v =
      totals.net + totals.tax + Math.round(extraDebitSum * 100) / 100 - Math.round(extraCreditSum * 100) / 100;
    return Math.round(v * 100) / 100;
  }, [totals.net, totals.tax, extraDebitSum, extraCreditSum]);

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: tc('breadcrumb_inventory'), icon: ClipboardList, href: '/erp-modules' },
      { label: tc('breadcrumb_list'), icon: Receipt, href: '/inventory/grn-supplier-invoice' },
      { label: tc('breadcrumb_current'), icon: Receipt, href: null },
    ],
    [t, tc]
  );

  const openSiPrint = useCallback(
    (path) => {
      if (!siPermission('can_view')) {
        showPermissionDeniedAlert('view', 'supplier invoices (GRN)');
        return;
      }
      window.open(path, '_blank', 'noopener,noreferrer');
    },
    [siPermission, showPermissionDeniedAlert]
  );

  const setLineTax = (lineId, value) => {
    setLineTaxById((prev) => ({ ...prev, [lineId]: value }));
  };

  const addExtraRow = () => {
    setExtraRows((rows) => [...rows, { account_id: '', debit_amount: '', credit_amount: '', description: '' }]);
  };

  const removeExtraRow = (idx) => {
    setExtraRows((rows) => rows.filter((_, i) => i !== idx));
  };

  const updateExtra = (idx, patch) => {
    setExtraRows((rows) => rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const toggleGrn = (id) => {
    setSelectedIds((prev) => {
      const n = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      return n.sort((a, b) => a - b);
    });
  };

  const buildPayload = (postNow) => ({
    vendor_id: parseInt(vendorId, 10),
    grn_ids: selectedIds,
    voucher_date: voucherDate || null,
    reference_number: referenceNumber || null,
    description: description || null,
    supplier_invoice_date: supplierInvoiceDate || null,
    due_date: dueDate || null,
    notes: notes || null,
    lines: lines.map((row) => ({
      goods_receipt_note_line_id: row.id,
      tax_amount: parseAmount(lineTaxById[row.id]),
    })),
    additional_entries: extraNormalized.map((r) => ({
      account_id: r.account_id,
      debit_amount: r.dr > 0 ? r.dr : null,
      credit_amount: r.cr > 0 ? r.cr : null,
      description: r.description || null,
    })),
    post_now: postNow,
  });

  const onSubmit = (postNow) => (e) => {
    e.preventDefault();
    if (!vendorId || selectedIds.length === 0) {
      setAlert({ type: 'error', message: tc('err_select_vendor_grns') });
      return;
    }
    if (!lines.length) {
      setAlert({ type: 'error', message: tc('err_load_lines') });
      return;
    }
    if (postNow && !voucherDate) {
      setAlert({ type: 'error', message: tp('field_voucher_date') + ' — required' });
      return;
    }
    if (vendorCreditPreview <= 0) {
      setAlert({ type: 'error', message: tp('err_vendor_total') });
      return;
    }
    const perm = isEdit ? 'can_edit' : 'can_add';
    if (!siPermission(perm)) {
      showPermissionDeniedAlert(isEdit ? 'edit' : 'create', 'supplier invoices (GRN)');
      return;
    }

    setSubmitting(true);
    const payload = buildPayload(postNow);
    const opts = { preserveScroll: true, onFinish: () => setSubmitting(false) };
    if (isEdit) {
      router.put(`/inventory/grn-supplier-invoice/${invoice.id}`, payload, opts);
    } else {
      router.post('/inventory/grn-supplier-invoice', payload, opts);
    }
  };

  const canSave = vendorId && selectedIds.length > 0 && lines.length > 0 && vendorCreditPreview > 0;

  return (
    <App>
      <div className="rounded-xl shadow-lg border border-slate-200 dark:border-slate-700/60">
        <div className="p-4 md:p-5">
          <Breadcrumbs items={breadcrumbItems} description={tc('description')} />

          <div className="form-theme-system">
            <div className="form-container form-container--pr-compact">
              <div className="form-header form-header--compact mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="form-title form-title--compact m-0 flex items-center gap-2">
                    <Receipt className="text-emerald-600 shrink-0" size={22} />
                    {isEdit ? tc('title_edit') : tc('title_new')}
                  </h1>
                  <p className="form-subtitle mb-0">{tc('description')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {isEdit && invoice?.id ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-icon btn-secondary"
                        title={t('inventory.grn_supplier_invoice.list.print_summary')}
                        onClick={() =>
                          openSiPrint(`/inventory/grn-supplier-invoice/${invoice.id}/invoice/summary`)
                        }
                      >
                        <FileText size={18} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-icon btn-secondary"
                        title={t('inventory.grn_supplier_invoice.list.print_detailed')}
                        onClick={() =>
                          openSiPrint(`/inventory/grn-supplier-invoice/${invoice.id}/invoice/detailed`)
                        }
                      >
                        <ScrollText size={18} />
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => router.visit('/inventory/grn-supplier-invoice')}
                  >
                    <ArrowLeft size={18} />
                    {tc('btn_back')}
                  </button>
                </div>
              </div>

              {!isEdit && preview_invoice_number && (
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  {tc('preview_number')}:{' '}
                  <span className="font-mono font-medium">{preview_invoice_number}</span>
                </p>
              )}
              {isEdit && invoice?.invoice_number && (
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-mono font-medium">{invoice.invoice_number}</span>
                </p>
              )}

              {missingInventoryGl && (
                <div className="mb-4 p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100 text-sm">
                  {tp('missing_gl_warn')}
                </div>
              )}
              {missingTaxGl && (
                <div className="mb-4 p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100 text-sm">
                  {tp('missing_tax_gl_warn')}
                </div>
              )}

              {alert && (
                <div
                  className={`mb-4 ${alert.type === 'error' ? 'alert-error-themed' : 'alert-success-themed'}`}
                  role={alert.type === 'error' ? 'alert' : 'status'}
                >
                  <p className="m-0">{alert.message}</p>
                </div>
              )}

              <form className="mb-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
                <section className="mb-4 p-3 rounded-lg border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                  <h2
                    className="m-0 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {tc('vendor_label')}
                  </h2>
                  <div className="max-w-xl mt-3">
                    <InlineSearchSelect
                      id="gsi-vendor"
                      options={vendorOptions}
                      value={vendorId}
                      onChange={(v) => {
                        setVendorId(v);
                        setSelectedIds([]);
                      }}
                      placeholder={tc('vendor_placeholder')}
                      disabled={isEdit}
                      searchable
                      allowClear={!isEdit}
                      className="w-full"
                    />
                  </div>
                </section>

                <section className="mb-4 p-3 rounded-lg border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
            <h2 className="m-0 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {tc('eligible_heading')}
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {tc('load_lines_hint')}
            </p>
            {!vendorId ? (
              <p className="mt-3 text-sm text-slate-500">{tc('vendor_placeholder')}</p>
            ) : eligibleGrns.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">{tc('no_eligible')}</p>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-700">
                <table className="min-w-[640px] w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50/90 dark:bg-slate-800/50 text-left">
                      <th className="px-2 py-2 w-10">{tc('grn_col_select')}</th>
                      <th className="px-2 py-2">{tc('grn_col_number')}</th>
                      <th className="px-2 py-2">{tc('grn_col_date')}</th>
                      <th className="px-2 py-2">{tc('grn_col_po')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligibleGrns.map((g) => (
                      <tr key={g.id} className="border-t border-slate-200/80 dark:border-slate-700">
                        <td className="px-2 py-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(g.id)}
                            onChange={() => toggleGrn(g.id)}
                            aria-label={g.grn_number}
                          />
                        </td>
                        <td className="px-2 py-2 font-mono">{g.grn_number}</td>
                        <td className="px-2 py-2">{g.receipt_date || '—'}</td>
                        <td className="px-2 py-2 font-mono">{g.po_number || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="p-4 rounded-lg border border-slate-200/80 dark:border-slate-700">
            <h2 className="m-0 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {tc('section_document')}
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {tp('section_document_hint')}
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <div className="text-xs opacity-70 mb-1">{tp('label_vendor')}</div>
                <div className="font-medium">{vendorLabel}</div>
              </div>
              <div>
                <label className="input-label block mb-1" htmlFor="si-voucher-date">
                  {tp('field_voucher_date')}
                </label>
                <CustomDatePicker
                  id="si-voucher-date"
                  selected={voucherDate ? new Date(`${voucherDate}T12:00:00`) : null}
                  onChange={(date) => {
                    setVoucherDate(date ? date.toISOString().split('T')[0] : '');
                  }}
                  type="date"
                  className="form-input w-full max-w-xs"
                />
              </div>
              <div>
                <label className="input-label block mb-1" htmlFor="si-reference">
                  {tp('field_reference')}
                </label>
                <input
                  id="si-reference"
                  type="text"
                  className="form-input w-full"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder={tp('field_reference_ph')}
                  maxLength={100}
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="input-label block mb-1" htmlFor="si-supplier-inv-date">
                  {tp('field_supplier_invoice_date')}
                </label>
                <CustomDatePicker
                  id="si-supplier-inv-date"
                  selected={supplierInvoiceDate ? new Date(`${supplierInvoiceDate}T12:00:00`) : null}
                  onChange={(date) => {
                    setSupplierInvoiceDate(date ? date.toISOString().split('T')[0] : '');
                  }}
                  type="date"
                  className="form-input w-full max-w-xs"
                />
              </div>
              <div>
                <label className="input-label block mb-1" htmlFor="si-due-date">
                  {tp('field_due_date')}
                </label>
                <CustomDatePicker
                  id="si-due-date"
                  selected={dueDate ? new Date(`${dueDate}T12:00:00`) : null}
                  onChange={(date) => {
                    setDueDate(date ? date.toISOString().split('T')[0] : '');
                  }}
                  type="date"
                  className="form-input w-full max-w-xs"
                />
              </div>
              <div className="md:col-span-2">
                <label className="input-label block mb-1" htmlFor="si-description">
                  {tp('field_description')}
                </label>
                <input
                  id="si-description"
                  type="text"
                  className="form-input w-full"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={tp('field_description_ph')}
                  maxLength={250}
                  autoComplete="off"
                />
              </div>
              <div className="md:col-span-2">
                <label className="input-label block mb-1" htmlFor="si-notes">
                  {tc('notes_label')}
                </label>
                <textarea
                  id="si-notes"
                  className="form-input w-full min-h-[4rem]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={2000}
                />
              </div>
            </div>
          </section>

          {lines.length > 0 && (
            <>
              <section className="p-4 rounded-lg border border-slate-200/80 dark:border-slate-700">
                <h2 className="m-0 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {tp('section_lines')}
                </h2>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {tp('section_lines_hint')}
                </p>
                <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-700">
                  <table className="min-w-[1024px] w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50/90 dark:bg-slate-800/50 text-left">
                        <th className="px-2 py-2 font-semibold whitespace-nowrap">{tc('col_grn')}</th>
                        <th className="px-2 py-2 font-semibold whitespace-nowrap">{tp('col_line')}</th>
                        <th className="px-2 py-2 font-semibold">{tp('col_item')}</th>
                        <th className="px-2 py-2 font-semibold whitespace-nowrap">{tp('col_accepted_qty')}</th>
                        <th className="px-2 py-2 font-semibold whitespace-nowrap">{tp('col_unit_cost')}</th>
                        <th className="px-2 py-2 font-semibold text-right whitespace-nowrap">{tp('col_net')}</th>
                        <th className="px-2 py-2 font-semibold min-w-[8rem]">{tp('col_tax')}</th>
                        <th className="px-2 py-2 font-semibold text-right whitespace-nowrap">{tp('col_tax_amount')}</th>
                        <th className="px-2 py-2 font-semibold text-right whitespace-nowrap">{tp('col_line_gross')}</th>
                        <th className="px-2 py-2 font-semibold min-w-[10rem]">{tp('col_stock_gl')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((row) => {
                        const net = Number(row.line_value) || 0;
                        const ta = parseAmount(lineTaxById[row.id]);
                        const gross = Math.round((net + ta) * 100) / 100;
                        const taxHint = [row.tax_code, row.tax_name].filter(Boolean).join(' — ');
                        return (
                          <tr key={row.id} className="border-t border-slate-200/80 dark:border-slate-700">
                            <td className="px-2 py-2 font-mono text-xs whitespace-nowrap">{row.grn_number}</td>
                            <td className="px-2 py-2 tabular-nums">{row.line_no}</td>
                            <td className="px-2 py-2">
                              <div className="font-medium">{row.item_label}</div>
                              {row.item_description ? (
                                <div className="text-xs opacity-80">{row.item_description}</div>
                              ) : null}
                            </td>
                            <td className="px-2 py-2 tabular-nums">{formatMoney(row.accepted_qty)}</td>
                            <td className="px-2 py-2 tabular-nums">{formatMoney(row.unit_cost)}</td>
                            <td className="px-2 py-2 text-right tabular-nums">{formatMoney(net)}</td>
                            <td className="px-2 py-2 text-xs">
                              {taxHint ? <div className="font-medium">{taxHint}</div> : <span className="opacity-60">—</span>}
                              {row.tax_rate > 0 ? (
                                <div className="opacity-80">
                                  {row.tax_type} · {formatMoney(row.tax_rate)}%
                                </div>
                              ) : null}
                              {row.input_tax_gl_label ? (
                                <div className="text-[11px] opacity-70 mt-0.5">{row.input_tax_gl_label}</div>
                              ) : row.tax_rate > 0 ? (
                                <div className="text-amber-600 dark:text-amber-400 text-[11px] mt-0.5">
                                  {tp('tax_gl_missing_short')}
                                </div>
                              ) : null}
                            </td>
                            <td className="px-2 py-2 text-right">
                              <input
                                type="text"
                                inputMode="decimal"
                                className="form-input w-28 text-right tabular-nums ml-auto"
                                value={lineTaxById[row.id] ?? '0'}
                                onChange={(e) => setLineTax(row.id, e.target.value)}
                                disabled={net <= 0}
                              />
                            </td>
                            <td className="px-2 py-2 text-right tabular-nums font-medium">{formatMoney(gross)}</td>
                            <td className="px-2 py-2 text-sm">
                              {row.inventory_gl_label || (
                                <span className="text-amber-600 dark:text-amber-400 font-medium">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="p-4 rounded-lg border border-slate-200/80 dark:border-slate-700 bg-white/40 dark:bg-slate-900/20">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="m-0 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {tp('section_additional')}
                  </h2>
                  <button type="button" className="btn btn-secondary btn-sm flex items-center gap-1" onClick={addExtraRow}>
                    <Plus size={16} />
                    {tp('btn_add_line')}
                  </button>
                </div>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {tp('section_additional_hint')}
                </p>
                <div className="mt-3 space-y-3">
                  {extraRows.map((r, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 rounded-lg border border-slate-200/70 dark:border-slate-700/80"
                    >
                      <div className="lg:col-span-4">
                        <label className="input-label block mb-1 text-xs">{tp('col_account')}</label>
                        <InlineSearchSelect
                          options={accountOptions}
                          value={r.account_id || ''}
                          onChange={(v) => updateExtra(idx, { account_id: v })}
                          placeholder={tp('ph_select_account')}
                          id={`si-extra-acct-${idx}`}
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <label className="input-label block mb-1 text-xs">{tp('col_debit')}</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          className="form-input w-full text-right tabular-nums"
                          value={r.debit_amount}
                          onChange={(e) => updateExtra(idx, { debit_amount: e.target.value, credit_amount: '' })}
                        />
                      </div>
                      <div className="lg:col-span-2">
                        <label className="input-label block mb-1 text-xs">{tp('col_credit')}</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          className="form-input w-full text-right tabular-nums"
                          value={r.credit_amount}
                          onChange={(e) => updateExtra(idx, { credit_amount: e.target.value, debit_amount: '' })}
                        />
                      </div>
                      <div className="lg:col-span-3">
                        <label className="input-label block mb-1 text-xs">{tp('col_memo')}</label>
                        <input
                          type="text"
                          className="form-input w-full"
                          value={r.description}
                          onChange={(e) => updateExtra(idx, { description: e.target.value })}
                          placeholder={tp('ph_memo')}
                          maxLength={500}
                        />
                      </div>
                      <div className="lg:col-span-1 flex items-end justify-end">
                        <button
                          type="button"
                          className="p-2 rounded-md text-red-600 hover:bg-red-500/10"
                          title={tp('btn_remove_line')}
                          onClick={() => removeExtraRow(idx)}
                          disabled={extraRows.length <= 1}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="p-4 rounded-lg border border-slate-200/80 dark:border-slate-700">
                <h2 className="m-0 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {tp('section_preview')}
                </h2>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {tp('label_debit_pattern')}
                </p>
                <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-slate-200/80 dark:border-slate-700 overflow-hidden">
                    <div className="px-3 py-2 bg-slate-100/80 dark:bg-slate-800/50 text-xs font-semibold">
                      {tp('preview_debits')}
                    </div>
                    <ul className="m-0 p-0 list-none text-sm">
                      {inventoryDebitPreview.map((p) => (
                        <li
                          key={p.label}
                          className="flex justify-between gap-2 px-3 py-2 border-t border-slate-200/60 dark:border-slate-700"
                        >
                          <span className="opacity-90">{p.label}</span>
                          <span className="tabular-nums font-medium">{formatMoney(p.amount)}</span>
                        </li>
                      ))}
                      {taxDebitPreview.map((p) => (
                        <li
                          key={`t-${p.label}`}
                          className="flex justify-between gap-2 px-3 py-2 border-t border-slate-200/60 dark:border-slate-700"
                        >
                          <span className="opacity-90">
                            {p.label} <span className="text-xs opacity-70">({tp('preview_tag_tax')})</span>
                          </span>
                          <span className="tabular-nums font-medium">{formatMoney(p.amount)}</span>
                        </li>
                      ))}
                      {extraNormalized
                        .filter((p) => p.dr > 0)
                        .map((p, i) => (
                          <li
                            key={`ed-${i}-${p.account_id}`}
                            className="flex justify-between gap-2 px-3 py-2 border-t border-slate-200/60 dark:border-slate-700"
                          >
                            <span className="opacity-90">
                              {tp('preview_extra_dr')} {p.description ? `· ${p.description}` : ''}
                            </span>
                            <span className="tabular-nums font-medium">{formatMoney(p.dr)}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-slate-200/80 dark:border-slate-700 overflow-hidden">
                    <div className="px-3 py-2 bg-slate-100/80 dark:bg-slate-800/50 text-xs font-semibold">
                      {tp('preview_credits')}
                    </div>
                    <ul className="m-0 p-0 list-none text-sm">
                      {extraNormalized
                        .filter((p) => p.cr > 0)
                        .map((p, i) => (
                          <li
                            key={`ec-${i}-${p.account_id}`}
                            className="flex justify-between gap-2 px-3 py-2 border-t border-slate-200/60 dark:border-slate-700"
                          >
                            <span className="opacity-90">
                              {tp('preview_extra_cr')} {p.description ? `· ${p.description}` : ''}
                            </span>
                            <span className="tabular-nums font-medium">{formatMoney(p.cr)}</span>
                          </li>
                        ))}
                      <li className="flex justify-between gap-2 px-3 py-2 border-t border-slate-200/60 dark:border-slate-700">
                        <span className="opacity-90">
                          {vendorLabel || tp('preview_vendor_ap')} <span className="text-xs opacity-70">(AP)</span>
                        </span>
                        <span className="tabular-nums font-medium text-emerald-700 dark:text-emerald-300">
                          {formatMoney(vendorCreditPreview)}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
                {vendorCreditPreview <= 0 && (
                  <p className="mt-3 text-sm text-amber-700 dark:text-amber-200">{tp('err_vendor_total')}</p>
                )}
              </section>
            </>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={submitting || !canSave || !siPermission(isEdit ? 'can_edit' : 'can_add')}
              onClick={onSubmit(false)}
            >
              {tc('btn_save_draft')}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={
                submitting || !canSave || !voucherDate || !siPermission(isEdit ? 'can_edit' : 'can_add')
              }
              onClick={onSubmit(true)}
            >
              {submitting ? tp('posting') : tc('btn_save_post')}
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
