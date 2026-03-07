import React, { useState, useEffect } from 'react';
import { Home, Plus, Trash2, ArrowRight, AlertCircle } from 'lucide-react';
import App from '../../App.jsx';
import { router, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';
import InlineSearchSelect from '../../../Components/InlineSearchSelect';

const Breadcrumbs = ({ items }) => (
  <div className="breadcrumbs-themed">
    <nav className="breadcrumbs">
      {items.map((item, index) => (
        <div key={index} className="breadcrumb-item">
          <div className="breadcrumb-item-content">
            {item.icon && (
              <item.icon className={`breadcrumb-icon ${item.href ? 'breadcrumb-icon-link' : 'breadcrumb-icon-current'}`} />
            )}
            {item.href ? (
              <a href={item.href} className="breadcrumb-link-themed">{item.label}</a>
            ) : (
              <span className="breadcrumb-current-themed">{item.label}</span>
            )}
          </div>
          {index < items.length - 1 && (
            <div className="breadcrumb-separator breadcrumb-separator-themed">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </nav>
    <div className="breadcrumbs-description">{t('inventory.uom_conversion.create.configure_unit_of_measure_conversions_on')}</div>
  </div>
);

const CreateUomConversionForm = () => {
const { t } = useTranslations();
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
      setAlert({ type: 'error', message: t('inventory.uom_conversion.create.msg_please_correct_the_errors_below_and_try_') });
    }
  }, [pageErrors]);

  useEffect(() => {
    if (flash?.success) setAlert({ type: 'success', message: flash.success });
    else if (flash?.error) setAlert({ type: 'error', message: flash.error });
  }, [flash]);

  const addRow = () => {
    setRows((prev) => [...prev, { id: null, to_uom_id: '', conversion_factor: '', operation: 'Multiply' }]);
  };

  const removeRow = (index) => {
    if (rows.length <= 1) {
      setAlert({ type: 'error', message: t('inventory.uom_conversion.create.msg_at_least_one_conversion_row_is_required') });
      return;
    }
    setRows((prev) => prev.filter((_, i) => i !== index));
    setAlert(null);
  };

  const updateRow = (index, field, value) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`conversions.${index}.to_uom_id`];
      delete next[`conversions.${index}.conversion_factor`];
      return next;
    });
    setAlert(null);
  };

  const toUomOptions = fromUomId
    ? formattedUoms.filter((u) => String(u.value) !== String(fromUomId))
    : formattedUoms;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setAlert(null);

    const newErrors = {};
    if (!fromUomId) newErrors.from_uom_id = 'From UOM is required';

    const validRows = rows
      .map((r, i) => {
        const toId = r.to_uom_id ? String(r.to_uom_id).trim() : '';
        const factor = r.conversion_factor;
        if (!toId) newErrors[`conversions.${i}.to_uom_id`] = 'To UOM is required';
        const num = factor !== '' && factor !== null ? parseFloat(factor) : NaN;
        if (!Number.isFinite(num) || num < 0.0001 || num > 999999.9999) {
          newErrors[`conversions.${i}.conversion_factor`] = 'Enter a valid factor (0.0001 – 999999.9999)';
        }
        if (toId && Number.isFinite(num) && num >= 0.0001 && num <= 999999.9999) {
          return { id: r.id || undefined, to_uom_id: toId, conversion_factor: num, operation: r.operation === 'Divide' ? 'Divide' : 'Multiply' };
        }
        return null;
      })
      .filter(Boolean);

    if (validRows.length === 0 && !newErrors.conversions) {
      newErrors.conversions = 'Add at least one conversion row with To UOM and factor.';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: t('inventory.uom_conversion.create.msg_please_correct_the_errors_below_and_try_') });
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

  return (
    <App>
      <div className="form-container">
        <Breadcrumbs
          items={[
            { label: 'Home', icon: Home, href: '/' },
            { label: 'Inventory', href: '/inventory' },
            { label: 'UOM Conversion', href: '/inventory/uom-conversion' },
            { label: isEditMode ? 'Edit Conversions' : 'Create Conversions' },
          ]}
        />

        <div className="form-section">
          <div className="form-header">
            <div className="header-info">
              <h2 className="form-title">
                <ArrowRight size={24} className="title-icon" />
                {isEditMode ? 'Edit Unit Conversions' : 'Create New Unit Conversions'}
              </h2>
              <p className="form-description">
                {isEditMode
                  ? 'Update conversions for the selected From UOM'
                  : 'Select a From UOM and add one or more To UOM with conversion factor (1 From = factor × To)'}
              </p>
            </div>
          </div>

          {alert && (
            <div className={`alert alert-${alert.type}`}>
              <span>{alert.message}</span>
              <button type="button" onClick={() => setAlert(null)} className="alert-close">×</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Master: From UOM */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/50 p-4 sm:p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('inventory.uom_conversion.create.from_unit_master')}</h3>
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From UOM <span className="text-red-500">*</span>
                </label>
                <InlineSearchSelect
                  options={formattedUoms}
                  value={fromUomId}
                  onChange={(val) => {
                    setFromUomId(val);
                    setErrors((prev) => ({ ...prev, from_uom_id: undefined }));
                  }}
                  placeholder={t('inventory.uom_conversion.create.select_from_uom')}
                  name="from_uom_id"
                  id="from_uom_id"
                  error={errors.from_uom_id}
                />
                {errors.from_uom_id && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.from_uom_id}
                  </p>
                )}
              </div>
            </div>

            {/* Detail: Conversion rows */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800/50 p-4 sm:p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('inventory.uom_conversion.create.conversion_rows_detail')}</h3>
                <button
                  type="button"
                  onClick={addRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  <Plus size={16} /> Add row
                </button>
              </div>
              {errors.conversions && typeof errors.conversions === 'string' && (
                <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400">{errors.conversions}</p>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 py-2 pr-2">#</th>
                      <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 py-2 pr-2">{t('inventory.uom_conversion.create.to_uom_')}</th>
                      <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 py-2 pr-2">{t('inventory.uom_conversion.create.operation')}</th>
                      <th className="text-left text-xs font-semibold text-gray-600 dark:text-gray-400 py-2 pr-2">{t('inventory.uom_conversion.create.conversion_factor_')}</th>
                      <th className="w-10 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700/70">
                        <td className="py-2 pr-2 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                        <td className="py-2 pr-2">
                          <InlineSearchSelect
                            options={toUomOptions}
                            value={row.to_uom_id}
                            onChange={(val) => updateRow(index, 'to_uom_id', val)}
                            placeholder={t('inventory.uom_conversion.create.select_to_uom')}
                            name={`to_uom_id_${index}`}
                            id={`to_uom_id_${index}`}
                            error={errors[`conversions.${index}.to_uom_id`]}
                          />
                          {errors[`conversions.${index}.to_uom_id`] && (
                            <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors[`conversions.${index}.to_uom_id`]}</p>
                          )}
                        </td>
                        <td className="py-2 pr-2">
                          <select
                            value={row.operation || 'Multiply'}
                            onChange={(e) => updateRow(index, 'operation', e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="Multiply">{t('inventory.uom_conversion.create.multiply_')}</option>
                            <option value="Divide">{t('inventory.uom_conversion.create.divide_')}</option>
                          </select>
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            step="0.0001"
                            min="0.0001"
                            max="999999.9999"
                            value={row.conversion_factor}
                            onChange={(e) => updateRow(index, 'conversion_factor', e.target.value)}
                            placeholder={t('inventory.uom_conversion.create.eg_12')}
                            className="w-full max-w-[140px] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                          {errors[`conversions.${index}.conversion_factor`] && (
                            <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors[`conversions.${index}.conversion_factor`]}</p>
                          )}
                        </td>
                        <td className="py-2">
                          {rows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRow(index)}
                              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title={t('inventory.uom_conversion.create.remove_row')}
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

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                {isEditMode ? 'Update conversions' : 'Save conversions'}
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </App>
  );
};

export default CreateUomConversionForm;
