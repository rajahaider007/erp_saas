import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Home, Plus, Edit3, Package, Layers, DollarSign, Calendar, Zap, Hash } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import App from '../../App.jsx';
import { router, usePage } from '@inertiajs/react';
import { useTranslations } from '@/hooks/useTranslations';

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
    <div className="breadcrumbs-description">{description}</div>
  </div>
);

const CreateItemMasterForm = () => {
  const { t } = useTranslations();
  const fld = useCallback((name, part) => t(`inventory.item_master.create.fields.${name}.${part}`), [t]);
  const opt = useCallback((g, v) => t(`inventory.item_master.create.options.${g}.${v}`), [t]);
  const sec = useCallback((k, p) => t(`inventory.item_master.create.sections.${k}.${p}`), [t]);
  const val = useCallback((k) => t(`inventory.item_master.create.validation.${k}`), [t]);
  const tc = useCallback((k, r = {}) => t(`inventory.item_master.create.${k}`, r), [t]);
  const tf = useCallback((k, r = {}) => t(`inventory.item_master.create.form.${k}`, r), [t]);
  const {
    errors: pageErrors,
    flash,
    itemClassOptions = [],
    itemCategoryOptions = [],
    itemGroupOptions = [],
    itemTypeOptions = [],
    itemStatusOptions = [],
    trackingModeOptions = [],
    uomOptions = [],
    taxCategoryOptions = [],
    temperatureClassOptions = [],
    countryOptions = [],
    glAccountOptions = [],
    item = null,
    edit_mode = false,
    error,
  } = usePage().props;

  const isEditMode = !!edit_mode;
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [expiryTrackingEnabled, setExpiryTrackingEnabled] = useState(false);

  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setErrors(pageErrors);
      setAlert({ type: 'error', message: tc('msg_please_correct_the_errors_below') });
    }
  }, [pageErrors, tc]);

  useEffect(() => {
    if (flash?.success) {
      setAlert({ type: 'success', message: flash.success });
    } else if (flash?.error) {
      setAlert({ type: 'error', message: flash.error });
    }
  }, [flash]);

  // ============================================
  // SECTION A: Header Fields
  // ============================================
  const headerFields = [
    {
      name: 'item_code',
      label: fld('item_code', 'label'),
      type: 'text',
      placeholder: fld('item_code', 'placeholder'),
      icon: Hash,
      required: true,
      maxLength: 50,
      help: fld('item_code', 'help')
    },
    {
      name: 'item_name_short',
      label: fld('item_name_short', 'label'),
      type: 'text',
      placeholder: fld('item_name_short', 'placeholder'),
      icon: Package,
      required: true,
      maxLength: 50,
      help: fld('item_name_short', 'help')
    },
    {
      name: 'item_name_long',
      label: fld('item_name_long', 'label'),
      type: 'textarea',
      placeholder: fld('item_name_long', 'placeholder'),
      required: false,
      maxLength: 250,
      help: fld('item_name_long', 'help')
    },
    {
      name: 'item_status',
      label: fld('item_status', 'label'),
      type: 'select',
      placeholder: fld('item_status', 'placeholder'),
      required: true,
      options: itemStatusOptions || [
        { value: 'active', label: opt('item_status', 'active') },
        { value: 'inactive', label: opt('item_status', 'inactive') },
        { value: 'discontinued', label: opt('item_status', 'discontinued') },
        { value: 'blocked', label: opt('item_status', 'blocked') },
      ],
      help: fld('item_status', 'help')
    },
    {
      name: 'item_type',
      label: fld('item_type', 'label'),
      type: 'select',
      placeholder: fld('item_type', 'placeholder'),
      required: true,
      options: itemTypeOptions || [
        { value: 'raw_material', label: opt('item_type', 'raw_material') },
        { value: 'finished_good', label: opt('item_type', 'finished_good') },
        { value: 'trading', label: opt('item_type', 'trading') },
        { value: 'consumable', label: opt('item_type', 'consumable') },
        { value: 'service', label: opt('item_type', 'service') },
      ],
      help: fld('item_type', 'help')
    },
    {
      name: 'item_class_id',
      label: fld('item_class_id', 'label'),
      type: 'select',
      placeholder: fld('item_class_id', 'placeholder'),
      required: true,
      options: itemClassOptions,
      help: fld('item_class_id', 'help')
    },
    {
      name: 'item_category_id',
      label: fld('item_category_id', 'label'),
      type: 'select',
      placeholder: fld('item_category_id', 'placeholder'),
      required: true,
      options: itemCategoryOptions,
      help: fld('item_category_id', 'help')
    },
    {
      name: 'item_group_id',
      label: fld('item_group_id', 'label'),
      type: 'select',
      placeholder: fld('item_group_id', 'placeholder'),
      required: false,
      options: itemGroupOptions,
      help: fld('item_group_id', 'help')
    },
    {
      name: 'brand',
      label: fld('brand', 'label'),
      type: 'text',
      placeholder: fld('brand', 'placeholder'),
      required: false,
      maxLength: 100,
      help: fld('brand', 'help')
    },
    {
      name: 'item_image',
      label: fld('item_image', 'label'),
      type: 'file',
      placeholder: fld('item_image', 'placeholder'),
      required: false,
      accept: 'image/jpeg,image/png',
      help: fld('item_image', 'help')
    },
  ];

  // ============================================
  // SECTION B: Tracking & UOM Configuration
  // ============================================
  const trackingFields = [
    {
      name: 'tracking_mode',
      label: fld('tracking_mode', 'label'),
      type: 'select',
      placeholder: fld('tracking_mode', 'placeholder'),
      required: true,
      options: trackingModeOptions || [
        { value: 'none', label: opt('tracking_mode', 'none') },
        { value: 'lot', label: opt('tracking_mode', 'lot') },
        { value: 'serial', label: opt('tracking_mode', 'serial') },
      ],
      help: fld('tracking_mode', 'help')
    },
    {
      name: 'stock_uom_id',
      label: fld('stock_uom_id', 'label'),
      type: 'select',
      placeholder: fld('stock_uom_id', 'placeholder'),
      required: true,
      options: uomOptions,
      help: fld('stock_uom_id', 'help')
    },
    {
      name: 'purchase_uom_id',
      label: fld('purchase_uom_id', 'label'),
      type: 'select',
      placeholder: fld('purchase_uom_id', 'placeholder'),
      required: true,
      options: uomOptions,
      help: fld('purchase_uom_id', 'help')
    },
    {
      name: 'sales_uom_id',
      label: fld('sales_uom_id', 'label'),
      type: 'select',
      placeholder: fld('sales_uom_id', 'placeholder'),
      required: true,
      options: uomOptions,
      help: fld('sales_uom_id', 'help')
    },
    {
      name: 'uom_conversion_table',
      label: fld('uom_conversion_table', 'label'),
      type: 'textarea',
      placeholder: fld('uom_conversion_table', 'placeholder'),
      required: false,
      maxLength: 500,
      help: fld('uom_conversion_table', 'help')
    },
    {
      name: 'packaging_hierarchy',
      label: fld('packaging_hierarchy', 'label'),
      type: 'textarea',
      placeholder: fld('packaging_hierarchy', 'placeholder'),
      required: false,
      maxLength: 500,
      help: fld('packaging_hierarchy', 'help')
    },
  ];

  // ============================================
  // SECTION C: Costing & Procurement
  // ============================================
  const costingFields = [
    {
      name: 'costing_method',
      label: fld('costing_method', 'label'),
      type: 'select',
      placeholder: fld('costing_method', 'placeholder'),
      required: true,
      options: [
        { value: 'fifo', label: opt('costing_method', 'fifo') },
        { value: 'weighted_avg', label: opt('costing_method', 'weighted_avg') },
        { value: 'standard_cost', label: opt('costing_method', 'standard_cost') },
      ],
      help: fld('costing_method', 'help')
    },
    {
      name: 'standard_cost',
      label: fld('standard_cost', 'label'),
      type: 'decimal',
      placeholder: fld('standard_cost', 'placeholder'),
      required: false,
      min: 0,
      help: fld('standard_cost', 'help')
    },
    {
      name: 'last_purchase_price',
      label: fld('last_purchase_price', 'label'),
      type: 'decimal',
      placeholder: fld('last_purchase_price', 'placeholder'),
      required: false,
      readOnly: true,
      help: fld('last_purchase_price', 'help')
    },
    {
      name: 'minimum_order_qty',
      label: fld('minimum_order_qty', 'label'),
      type: 'decimal',
      placeholder: fld('minimum_order_qty', 'placeholder'),
      required: false,
      min: 0,
      help: fld('minimum_order_qty', 'help')
    },
    {
      name: 'reorder_point',
      label: fld('reorder_point', 'label'),
      type: 'decimal',
      placeholder: fld('reorder_point', 'placeholder'),
      required: false,
      min: 0,
      help: fld('reorder_point', 'help')
    },
    {
      name: 'safety_stock',
      label: fld('safety_stock', 'label'),
      type: 'decimal',
      placeholder: fld('safety_stock', 'placeholder'),
      required: false,
      min: 0,
      help: fld('safety_stock', 'help')
    },
    {
      name: 'maximum_stock_level',
      label: fld('maximum_stock_level', 'label'),
      type: 'decimal',
      placeholder: fld('maximum_stock_level', 'placeholder'),
      required: false,
      min: 0,
      help: fld('maximum_stock_level', 'help')
    },
    {
      name: 'lead_time_days',
      label: fld('lead_time_days', 'label'),
      type: 'integer',
      placeholder: fld('lead_time_days', 'placeholder'),
      required: false,
      min: 0,
      help: fld('lead_time_days', 'help')
    },
    {
      name: 'default_vendor_id',
      label: fld('default_vendor_id', 'label'),
      type: 'select',
      placeholder: fld('default_vendor_id', 'placeholder'),
      required: false,
      options: [],
      help: fld('default_vendor_id', 'help')
    },
    {
      name: 'substitute_items',
      label: fld('substitute_items', 'label'),
      type: 'text',
      placeholder: fld('substitute_items', 'placeholder'),
      required: false,
      maxLength: 500,
      help: fld('substitute_items', 'help')
    },
  ];

  // ============================================
  // SECTION D: Expiry & Storage
  // ============================================
  const expiryFields = [
    {
      name: 'expiry_tracking',
      label: fld('expiry_tracking', 'label'),
      type: 'toggle',
      required: true,
      defaultValue: false,
      help: fld('expiry_tracking', 'help')
    },
    {
      name: 'shelf_life_days',
      label: fld('shelf_life_days', 'label'),
      type: 'integer',
      placeholder: fld('shelf_life_days', 'placeholder'),
      required: expiryTrackingEnabled ? true : false,
      min: 0,
      help: fld('shelf_life_days', 'help')
    },
    {
      name: 'expiry_basis',
      label: fld('expiry_basis', 'label'),
      type: 'select',
      placeholder: fld('expiry_basis', 'placeholder'),
      required: expiryTrackingEnabled ? true : false,
      options: [
        { value: 'manufacturing_date', label: opt('expiry_basis', 'manufacturing_date') },
        { value: 'receipt_date', label: opt('expiry_basis', 'receipt_date') },
      ],
      help: fld('expiry_basis', 'help')
    },
    {
      name: 'near_expiry_alert_days',
      label: fld('near_expiry_alert_days', 'label'),
      type: 'integer',
      placeholder: fld('near_expiry_alert_days', 'placeholder'),
      required: expiryTrackingEnabled ? true : false,
      min: 0,
      help: fld('near_expiry_alert_days', 'help')
    },
    {
      name: 'storage_temperature_class',
      label: fld('storage_temperature_class', 'label'),
      type: 'select',
      placeholder: fld('storage_temperature_class', 'placeholder'),
      required: false,
      options: temperatureClassOptions || [
        { value: 'ambient', label: opt('storage_temperature_class', 'ambient') },
        { value: 'chilled', label: opt('storage_temperature_class', 'chilled') },
        { value: 'frozen', label: opt('storage_temperature_class', 'frozen') },
        { value: 'controlled', label: opt('storage_temperature_class', 'controlled') },
      ],
      help: fld('storage_temperature_class', 'help')
    },
    {
      name: 'hazardous_material',
      label: fld('hazardous_material', 'label'),
      type: 'toggle',
      required: false,
      defaultValue: false,
      help: fld('hazardous_material', 'help')
    },
  ];

  // ============================================
  // SECTION E: Physical Attributes
  // ============================================
  const physicalFields = [
    {
      name: 'gross_weight_kg',
      label: fld('gross_weight_kg', 'label'),
      type: 'decimal',
      placeholder: fld('gross_weight_kg', 'placeholder'),
      required: false,
      min: 0,
      step: 0.001,
      help: fld('gross_weight_kg', 'help')
    },
    {
      name: 'net_weight_kg',
      label: fld('net_weight_kg', 'label'),
      type: 'decimal',
      placeholder: fld('net_weight_kg', 'placeholder'),
      required: false,
      min: 0,
      step: 0.001,
      help: fld('net_weight_kg', 'help')
    },
    {
      name: 'volume_cbm',
      label: fld('volume_cbm', 'label'),
      type: 'decimal',
      placeholder: fld('volume_cbm', 'placeholder'),
      required: false,
      min: 0,
      step: 0.001,
      help: fld('volume_cbm', 'help')
    },
    {
      name: 'dimensions',
      label: fld('dimensions', 'label'),
      type: 'text',
      placeholder: fld('dimensions', 'placeholder'),
      required: false,
      maxLength: 50,
      help: fld('dimensions', 'help')
    },
  ];

  // ============================================
  // SECTION F: Tax & Trade Compliance
  // ============================================
  const taxFields = [
    {
      name: 'tax_category_id',
      label: fld('tax_category_id', 'label'),
      type: 'select',
      placeholder: fld('tax_category_id', 'placeholder'),
      required: true,
      options: taxCategoryOptions,
      help: fld('tax_category_id', 'help')
    },
    {
      name: 'hsn_code',
      label: fld('hsn_code', 'label'),
      type: 'text',
      placeholder: fld('hsn_code', 'placeholder'),
      required: false,
      maxLength: 20,
      help: fld('hsn_code', 'help')
    },
    {
      name: 'hs_tariff_code',
      label: fld('hs_tariff_code', 'label'),
      type: 'text',
      placeholder: fld('hs_tariff_code', 'placeholder'),
      required: false,
      maxLength: 10,
      help: fld('hs_tariff_code', 'help')
    },
    {
      name: 'country_of_origin_id',
      label: fld('country_of_origin_id', 'label'),
      type: 'select',
      placeholder: fld('country_of_origin_id', 'placeholder'),
      required: false,
      options: countryOptions,
      help: fld('country_of_origin_id', 'help')
    },
    {
      name: 'barcode_gtin',
      label: fld('barcode_gtin', 'label'),
      type: 'text',
      placeholder: fld('barcode_gtin', 'placeholder'),
      required: false,
      maxLength: 20,
      help: fld('barcode_gtin', 'help')
    },
    {
      name: 'alternate_barcodes',
      label: fld('alternate_barcodes', 'label'),
      type: 'textarea',
      placeholder: fld('alternate_barcodes', 'placeholder'),
      required: false,
      maxLength: 500,
      help: fld('alternate_barcodes', 'help')
    },
  ];

  // ============================================
  // SECTION G: Identifiers & Alternate Codes
  // ============================================
  const identifiersFields = [
    {
      name: 'alternate_item_codes',
      label: fld('alternate_item_codes', 'label'),
      type: 'textarea',
      placeholder: fld('alternate_item_codes', 'placeholder'),
      required: false,
      maxLength: 500,
      help: fld('alternate_item_codes', 'help')
    },
    {
      name: 'inspection_required',
      label: fld('inspection_required', 'label'),
      type: 'toggle',
      required: false,
      defaultValue: false,
      help: fld('inspection_required', 'help')
    },
    {
      name: 'consignment_item_flag',
      label: fld('consignment_item_flag', 'label'),
      type: 'toggle',
      required: false,
      defaultValue: false,
      help: fld('consignment_item_flag', 'help')
    },
  ];

  // ============================================
  // SECTION H: GL Account Mapping
  // ============================================
  const glFields = [
    {
      name: 'inventory_gl_account_id',
      label: fld('inventory_gl_account_id', 'label'),
      type: 'select',
      placeholder: fld('inventory_gl_account_id', 'placeholder'),
      required: true,
      options: glAccountOptions,
      help: fld('inventory_gl_account_id', 'help')
    },
    {
      name: 'cogs_gl_account_id',
      label: fld('cogs_gl_account_id', 'label'),
      type: 'select',
      placeholder: fld('cogs_gl_account_id', 'placeholder'),
      required: true,
      options: glAccountOptions,
      help: fld('cogs_gl_account_id', 'help')
    },
    {
      name: 'writeoff_gl_account_id',
      label: fld('writeoff_gl_account_id', 'label'),
      type: 'select',
      placeholder: fld('writeoff_gl_account_id', 'placeholder'),
      required: true,
      options: glAccountOptions,
      help: fld('writeoff_gl_account_id', 'help')
    },
    {
      name: 'price_variance_gl_account_id',
      label: fld('price_variance_gl_account_id', 'label'),
      type: 'select',
      placeholder: fld('price_variance_gl_account_id', 'placeholder'),
      required: false,
      options: glAccountOptions,
      help: fld('price_variance_gl_account_id', 'help')
    },
  ];

  // ============================================
  // SECTION I: Additional Classification & Analytics
  // ============================================
  const analyticsFields = [
    {
      name: 'abc_classification',
      label: fld('abc_classification', 'label'),
      type: 'select',
      placeholder: fld('abc_classification', 'placeholder'),
      required: false,
      options: [
        { value: 'a', label: opt('abc_classification', 'a') },
        { value: 'b', label: opt('abc_classification', 'b') },
        { value: 'c', label: opt('abc_classification', 'c') },
      ],
      help: fld('abc_classification', 'help')
    },
    {
      name: 'slow_moving_threshold_days',
      label: fld('slow_moving_threshold_days', 'label'),
      type: 'integer',
      placeholder: fld('slow_moving_threshold_days', 'placeholder'),
      required: false,
      min: 0,
      help: fld('slow_moving_threshold_days', 'help')
    },
  ];

  // ============================================
  // Advanced Fields Collections
  // ============================================
  const allFields = [
    // Section A
    ...headerFields,
    // Section B
    ...(isEditMode ? [] : trackingFields),  // Tracking UOM fields
    // Section C
    ...costingFields,
    // Section D - Expiry fields (conditional)
    ...expiryFields,
    // Section E
    ...physicalFields,
    // Section F
    ...taxFields,
    // Section G
    ...identifiersFields,
    // Section H
    ...glFields,
    // Section I
    ...analyticsFields,
  ];

  // Section groupings for display with icons and descriptions
  const sectionGroups = [
    { title: sec('header', 'title'), icon: Package, description: sec('header', 'description'), fields: headerFields },
    !isEditMode && { title: sec('tracking', 'title'), icon: Layers, description: sec('tracking', 'description'), fields: trackingFields },
    { title: sec('costing', 'title'), icon: DollarSign, description: sec('costing', 'description'), fields: costingFields },
    { title: sec('expiry', 'title'), icon: Calendar, description: sec('expiry', 'description'), fields: expiryFields },
    { title: sec('physical', 'title'), icon: Package, description: sec('physical', 'description'), fields: physicalFields },
    { title: sec('tax', 'title'), icon: Hash, description: sec('tax', 'description'), fields: taxFields },
    { title: sec('identifiers', 'title'), icon: Hash, description: sec('identifiers', 'description'), fields: identifiersFields },
    { title: sec('gl', 'title'), icon: DollarSign, description: sec('gl', 'description'), fields: glFields },
    { title: sec('analytics', 'title'), icon: Zap, description: sec('analytics', 'description'), fields: analyticsFields },
  ].filter(Boolean);

  const handleSubmit = (formData) => {
    setErrors({});
    setAlert(null);

    const newErrors = {};

    // Validate mandatory fields
    if (!formData.item_code?.trim()) {
      newErrors.item_code = val('item_code');
    }

    if (!formData.item_name_short?.trim()) {
      newErrors.item_name_short = val('item_name_short');
    }

    if (!formData.item_type) {
      newErrors.item_type = val('item_type');
    }

    if (!formData.item_class_id) {
      newErrors.item_class_id = val('item_class_id');
    }

    if (!formData.item_category_id) {
      newErrors.item_category_id = val('item_category_id');
    }

    if (!formData.stock_uom_id) {
      newErrors.stock_uom_id = val('stock_uom_id');
    }

    if (!formData.purchase_uom_id) {
      newErrors.purchase_uom_id = val('purchase_uom_id');
    }

    if (!formData.sales_uom_id) {
      newErrors.sales_uom_id = val('sales_uom_id');
    }

    if (!formData.tracking_mode) {
      newErrors.tracking_mode = val('tracking_mode');
    }

    if (!formData.costing_method) {
      newErrors.costing_method = val('costing_method');
    }

    if (formData.costing_method === 'standard_cost' && !formData.standard_cost) {
      newErrors.standard_cost = val('standard_cost');
    }

    if (!formData.tax_category_id) {
      newErrors.tax_category_id = val('tax_category_id');
    }

    if (!formData.inventory_gl_account_id) {
      newErrors.inventory_gl_account_id = val('inventory_gl_account_id');
    }

    if (!formData.cogs_gl_account_id) {
      newErrors.cogs_gl_account_id = val('cogs_gl_account_id');
    }

    if (!formData.writeoff_gl_account_id) {
      newErrors.writeoff_gl_account_id = val('writeoff_gl_account_id');
    }

    if (formData.expiry_tracking) {
      if (!formData.shelf_life_days) {
        newErrors.shelf_life_days = val('shelf_life_days');
      }
      if (!formData.expiry_basis) {
        newErrors.expiry_basis = val('expiry_basis');
      }
      if (!formData.near_expiry_alert_days) {
        newErrors.near_expiry_alert_days = val('near_expiry_alert_days');
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: tc('msg_please_correct_the_errors_above') });
      return;
    }

    const formDataToSend = new FormData();

    // Append all form data
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
        if (typeof formData[key] === 'boolean') {
          formDataToSend.append(key, formData[key] ? '1' : '0');
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
    });

    if (isEditMode && item?.id) {
      formDataToSend.append('_method', 'PUT');
      router.post(`/inventory/item-master/${item.id}`, formDataToSend, {
        forceFormData: true,
        onError: (serverErrors) => {
          setErrors(serverErrors);
          setAlert({ type: 'error', message: tc('msg_failed_to_update_item_please_check_the_e') });
        },
      });
    } else {
      router.post('/inventory/item-master', formDataToSend, {
        forceFormData: true,
        onError: (serverErrors) => {
          setErrors(serverErrors);
          setAlert({ type: 'error', message: tc('msg_failed_to_create_item_please_check_the_e') });
        },
      });
    }
  };

  const breadcrumbItems = useMemo(
    () => [
      { label: t('common.breadcrumbs.dashboard'), icon: Home, href: '/dashboard' },
      { label: tc('breadcrumbs.item_master'), icon: Package, href: '/inventory/item-master' },
      { label: isEditMode ? tc('breadcrumbs.edit_item') : tc('breadcrumbs.create_item'), icon: isEditMode ? Edit3 : Plus },
    ],
    [t, tc, isEditMode]
  );

  const initialData = {
    item_code: item?.item_code || '',
    item_name_short: item?.item_name_short || '',
    item_name_long: item?.item_name_long || '',
    item_status: item?.item_status || 'active',
    item_type: item?.item_type || '',
    item_class_id: item?.item_class_id ? String(item.item_class_id) : '',
    item_category_id: item?.item_category_id ? String(item.item_category_id) : '',
    item_group_id: item?.item_group_id ? String(item.item_group_id) : '',
    brand: item?.brand || '',
    tracking_mode: item?.tracking_mode || 'none',
    stock_uom_id: item?.stock_uom_id ? String(item.stock_uom_id) : '',
    purchase_uom_id: item?.purchase_uom_id ? String(item.purchase_uom_id) : '',
    sales_uom_id: item?.sales_uom_id ? String(item.sales_uom_id) : '',
    costing_method: item?.costing_method || 'fifo',
    standard_cost: item?.standard_cost || '',
    minimum_order_qty: item?.minimum_order_qty || '',
    reorder_point: item?.reorder_point || '',
    safety_stock: item?.safety_stock || '',
    maximum_stock_level: item?.maximum_stock_level || '',
    lead_time_days: item?.lead_time_days || '',
    expiry_tracking: item?.expiry_tracking || false,
    shelf_life_days: item?.shelf_life_days || '',
    expiry_basis: item?.expiry_basis || 'manufacturing_date',
    near_expiry_alert_days: item?.near_expiry_alert_days || '',
    storage_temperature_class: item?.storage_temperature_class || 'ambient',
    hazardous_material: item?.hazardous_material || false,
    gross_weight_kg: item?.gross_weight_kg || '',
    net_weight_kg: item?.net_weight_kg || '',
    volume_cbm: item?.volume_cbm || '',
    dimensions: item?.dimensions || '',
    tax_category_id: item?.tax_category_id ? String(item.tax_category_id) : '',
    hsn_code: item?.hsn_code || '',
    hs_tariff_code: item?.hs_tariff_code || '',
    country_of_origin_id: item?.country_of_origin_id ? String(item.country_of_origin_id) : '',
    barcode_gtin: item?.barcode_gtin || '',
    inventory_gl_account_id: item?.inventory_gl_account_id ? String(item.inventory_gl_account_id) : '',
    cogs_gl_account_id: item?.cogs_gl_account_id ? String(item.cogs_gl_account_id) : '',
    writeoff_gl_account_id: item?.writeoff_gl_account_id ? String(item.writeoff_gl_account_id) : '',
    price_variance_gl_account_id: item?.price_variance_gl_account_id ? String(item.price_variance_gl_account_id) : '',
    abc_classification: item?.abc_classification || 'b',
    slow_moving_threshold_days: item?.slow_moving_threshold_days || '180',
  };

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} description={tc('breadcrumb_desc')} />

      {error && (
        <div className="alert-error-themed mb-4">
          <p>{error}</p>
        </div>
      )}

      {alert && (
        <div className={`alert-${alert.type}-themed mb-4`}>
          <p>{alert.message}</p>
          {Object.keys(errors).length > 0 && (
            <ul className="mt-2">
              {Object.entries(errors).map(([key, value]) => (
                <li key={key}>{Array.isArray(value) ? value[0] : value}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <GeneralizedForm
        title={isEditMode ? tf('title_edit') : tf('title_create')}
        subtitle={isEditMode ? tf('subtitle_edit') : tf('subtitle_create')}
        fields={allFields}
        onSubmit={handleSubmit}
        submitText={isEditMode ? tf('submit_edit') : tf('submit_create')}
        resetText={t('common.form_actions.clear_form')}
        showReset={!isEditMode}
        initialData={initialData}
        fieldGroups={sectionGroups}
      />
    </div>
  );
};

const Create = () => {
  return (
    <App>
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <CreateItemMasterForm />
        </div>
      </div>
    </App>
  );
};

export default Create;
