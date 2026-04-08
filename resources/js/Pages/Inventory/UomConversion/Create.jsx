import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Home, List, Plus, Trash2, Edit3, AlertCircle, CheckCircle } from 'lucide-react';
import App from '../../App.jsx';
import { router, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';
import InlineSearchSelect from '../../../Components/InlineSearchSelect';
import Breadcrumbs from '../../../Components/Breadcrumbs';

const CreateUomConversionForm = () => {
  const { t } = useTranslations();
  const tc = useCallback((k, r = {}) => t(`inventory.uom_conversion.create.${k}`, r), [t]);
  const { errors: pageErrors, flash, conversionSet = null, uoms = [], error } = usePage().props;

  const isEditMode = !!conversionSet;
  const formattedUoms = Array.isArray(uoms) ? uoms : [];

  const [fromUomId, setFromUomId] = useState(conversionSet?.from_uom_id ?? '');
  const [rows, setRows] = useState(() => {
    if (conversionSet?.rows?.length) {
      return conversionSet.rows.map((r) => ({
        id: r.id || null,
        to_uom_id: r.to_uom_id ?? '',
        conversion_factor: r.conversion_factor ?? '',
        operation: r.operation === 'Divide' ? 'Divide' : 'Multiply',
      }));
    }
    return [{ id: null, to_uom_id: '', conversion_factor: '', operation: 'Multiply' }];
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (error) setAlert({ type: 'error', message: error });
  }, [error]);

  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setErrors(pageErrors);
      setAlert({ type: 'error', message: tc('msg_please_correct_the_errors_below_and_try_') });
    }
  }, [pageErrors, tc]);

  useEffect(() => {
    if (flash?.success) setAlert({ type: 'success', message: flash.success });
    else if (flash?.error) setAlert({ type: 'error', message: flash.error });
  }, [flash]);

  const addRow = () => {
    setRows((prev) => [...prev, { id: null, to_uom_id: '', conversion_factor: '', operation: 'Multiply' }]);
  };

  const removeRow = (index) => {
    if (rows.length <= 1) {
      setAlert({ type: 'error', message: tc('msg_at_least_one_conversion_row_is_required') });
      return;
    }
    setRows((prev) => prev.filter((_, i) => i !== index));
    setAlert(null);
  };

  const updateRow = (index, field, value) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`conversions.${index}.to_uom_id`];
      delete next[`conversions.${index}.conversion_factor`];
      return next;
    });
    setAlert(null);
  };

  const toUomOptions = fromUomId ? formattedUoms.filter((u) => String(u.value) !== String(fromUomId)) : formattedUoms;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setAlert(null);

    const newErrors = {};
    if (!fromUomId) newErrors.from_uom_id = tc('val_from_uom');

    const validRows = rows
      .map((r, i) => {
        const toId = r.to_uom_id ? String(r.to_uom_id).trim() : '';
        const factor = r.conversion_factor;
        if (!toId) newErrors[`conversions.${i}.to_uom_id`] = tc('val_to_uom');
        const num = factor !== '' && factor !== null ? parseFloat(factor) : NaN;
        if (!Number.isFinite(num) || num < 0.0001 || num > 999999.9999) {
          newErrors[`conversions.${i}.conversion_factor`] = tc('val_factor');
        }
        if (toId && Number.isFinite(num) && num >= 0.0001 && num <= 999999.9999) {
          return { id: r.id || undefined, to_uom_id: toId, conversion_factor: num, operation: r.operation === 'Divide' ? 'Divide' : 'Multiply' };
        }
        return null;
      })
      .filter(Boolean);

    if (validRows.length === 0 && !newErrors.conversions) {
      newErrors.conversions = tc('msg_at_least_one_conversion_row_is_required');
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: tc('msg_please_correct_the_errors_below_and_try_') });
      return;
    }

    const formData = new FormData();
    formData.append('from_uom_id', fromUomId);
    validRows.forEach((row, i) => {
      formData.append(`conversions[${i}][to_uom_id]`, row.to_uom_id);
      formData.append(`conversions[${i}][conversion_factor]`, row.conversion_factor);
      formData.append(`conversions[${i}][operation]`, row.operation || 'Multiply');
      if (row.id) formData.append(`conversions[${i}][id]`, row.id);
    });

    if (isEditMode && conversionSet?.rows?.[0]?.id) {
      formData.append('_method', 'PUT');
      router.post(`/inventory/uom-conversion/${conversionSet.rows[0].id}`, formData, {
        forceFormData: true,
        onError: (serverErrors) => setErrors(serverErrors || {}),
      });
    } else {
      router.post('/inventory/uom-conversion', formData, {
        forceFormData: true,
        onError: (serverErrors) => setErrors(serverErrors || {}),
      });
    }
  };

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: tc('breadcrumb_uom_conversion'), icon: List, href: '/inventory/uom-conversion' },
      {
        label: isEditMode ? tc('breadcrumb_edit') : tc('breadcrumb_create'),
        icon: isEditMode ? Edit3 : Plus,
        href: null,
      },
    ],
    [t, tc, isEditMode]
  );

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} description={tc('configure_unit_of_measure_conversions_on')} />

      {alert && (
        <div className={`alert-${alert.type}-themed mb-4`}>
          <p className="m-0">{alert.message}</p>
        </div>
      )}

      <div className="form-theme-system min-h-0 transition-all duration-500 overflow-visible">
        <div className="form-container">
          <div className="form-header mb-8">
            <h1 className="form-title">{isEditMode ? tc('title_edit') : tc('title_create')}</h1>
            <p className="form-subtitle mt-2">{isEditMode ? tc('desc_edit') : tc('desc_create')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-0">
            <div className="relative z-30 mb-10 overflow-visible">
              <h3 className="subpanel-title">{tc('from_unit_master')}</h3>
              <div className="input-group max-w-xl gap-3">
                <label className="input-label mb-0">
                  {tc('lbl_from_uom_required')} <span className="text-red-500">*</span>
                </label>
                <div className="input-wrapper min-h-[3.125rem]" style={{ overflow: 'visible', position: 'relative' }}>
                  <InlineSearchSelect
                    usePortal
                    options={formattedUoms}
                    value={fromUomId}
                    onChange={(val) => {
                      setFromUomId(val);
                      setErrors((prev) => ({ ...prev, from_uom_id: undefined }));
                    }}
                    placeholder={tc('select_from_uom')}
                    name="from_uom_id"
                    id="from_uom_id"
                    error={errors.from_uom_id}
                  />
                </div>
                {errors.from_uom_id && (
                  <p className="text-sm flex items-center gap-1 m-0" style={{ color: 'var(--error)' }}>
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.from_uom_id}
                  </p>
                )}
              </div>
            </div>

            <div className="relative z-10 mb-8 overflow-visible">
              <div
                className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b"
                style={{ borderColor: 'var(--glass-border)' }}
              >
                <h3 className="subpanel-title mb-0">{tc('conversion_rows_detail')}</h3>
                <button type="button" onClick={addRow} className="btn btn-primary btn-sm inline-flex items-center gap-1.5 shrink-0">
                  <Plus size={16} /> {tc('add_row')}
                </button>
              </div>
              {errors.conversions && typeof errors.conversions === 'string' && (
                <div className="alert-error-themed mb-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="text-sm m-0">{errors.conversions}</p>
                </div>
              )}

              <div className="table-wrapper overflow-x-auto overflow-y-visible">
                <table className="data-table uom-conversion-table w-full min-w-[640px]">
                  <thead>
                    <tr>
                      <th className="col-num">#</th>
                      <th className="col-to-uom">{tc('to_uom_')}</th>
                      <th className="col-op">{tc('operation')}</th>
                      <th className="col-factor">{tc('conversion_factor_')}</th>
                      <th className="col-actions" aria-label={tc('remove_row')} />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={index} className="table-row">
                        <td className="col-num pt-4">{index + 1}</td>
                        <td className="col-to-uom">
                          <div className="input-wrapper min-h-[3.125rem]" style={{ overflow: 'visible', position: 'relative' }}>
                            <InlineSearchSelect
                              usePortal
                              options={toUomOptions}
                              value={row.to_uom_id}
                              onChange={(val) => updateRow(index, 'to_uom_id', val)}
                              placeholder={tc('select_to_uom')}
                              name={`to_uom_id_${index}`}
                              id={`to_uom_id_${index}`}
                              error={errors[`conversions.${index}.to_uom_id`]}
                            />
                          </div>
                          {errors[`conversions.${index}.to_uom_id`] && (
                            <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                              {errors[`conversions.${index}.to_uom_id`]}
                            </p>
                          )}
                        </td>
                        <td className="col-op">
                          <select
                            value={row.operation || 'Multiply'}
                            onChange={(e) => updateRow(index, 'operation', e.target.value)}
                            className="form-select w-full max-w-[200px]"
                          >
                            <option value="Multiply">{tc('multiply_')}</option>
                            <option value="Divide">{tc('divide_')}</option>
                          </select>
                        </td>
                        <td className="col-factor">
                          <input
                            type="number"
                            step="0.0001"
                            min="0.0001"
                            max="999999.9999"
                            value={row.conversion_factor}
                            onChange={(e) => updateRow(index, 'conversion_factor', e.target.value)}
                            placeholder={tc('eg_12')}
                            className="form-input w-full max-w-[200px]"
                          />
                          {errors[`conversions.${index}.conversion_factor`] && (
                            <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                              {errors[`conversions.${index}.conversion_factor`]}
                            </p>
                          )}
                        </td>
                        <td className="col-actions pt-3">
                          {rows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRow(index)}
                              className="action-btn delete"
                              title={tc('remove_row')}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn-primary">
                <CheckCircle className="btn-icon" size={20} />
                {isEditMode ? tc('submit_update') : tc('submit_save')}
              </button>
              <button type="button" onClick={() => window.history.back()} className="btn btn-secondary">
                {t('common.actions.cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Create = () => (
  <App>
    <div className="rounded-xl shadow-lg form-container border-slate-200 overflow-visible">
      <div className="p-6 overflow-visible">
        <CreateUomConversionForm />
      </div>
    </div>
  </App>
);

export default Create;
