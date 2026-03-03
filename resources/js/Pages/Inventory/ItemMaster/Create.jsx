import React, { useState, useEffect } from 'react';
import { Home, Plus, Edit3, Package, Layers, DollarSign, Calendar, Zap, Hash } from 'lucide-react';
import GeneralizedForm from '../../../Components/GeneralizedForm';
import App from '../../App.jsx';
import { router, usePage } from '@inertiajs/react';

const Breadcrumbs = ({ items }) => {
  return (
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
      <div className="breadcrumbs-description">Create and maintain product masters with complete costing, tracking, and compliance data</div>
    </div>
  );
};

const CreateItemMasterForm = () => {
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
  const [standardCostMethod, setStandardCostMethod] = useState(false);

  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setErrors(pageErrors);
      setAlert({ type: 'error', message: 'Please correct the errors below.' });
    }
  }, [pageErrors]);

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
      label: 'Item Code',
      type: 'text',
      placeholder: 'Auto-generated or enter manually',
      icon: Hash,
      required: true,
      maxLength: 50,
      help: 'Unique identifier - no spaces, alphanumeric + dashes allowed'
    },
    {
      name: 'item_name_short',
      label: 'Item Name (Short)',
      type: 'text',
      placeholder: 'Max 50 characters',
      icon: Package,
      required: true,
      maxLength: 50,
      help: 'Display name in pick lists'
    },
    {
      name: 'item_name_long',
      label: 'Item Name (Long/Description)',
      type: 'textarea',
      placeholder: 'Full product description',
      required: false,
      maxLength: 250,
      help: 'Complete product description'
    },
    {
      name: 'item_status',
      label: 'Item Status',
      type: 'select',
      placeholder: 'Select status',
      required: true,
      options: itemStatusOptions || [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'discontinued', label: 'Discontinued' },
        { value: 'blocked', label: 'Blocked' }
      ],
      help: 'Inactive items cannot be used in new transactions'
    },
    {
      name: 'item_type',
      label: 'Item Type',
      type: 'select',
      placeholder: 'Select item type',
      required: true,
      options: itemTypeOptions || [
        { value: 'raw_material', label: 'Raw Material' },
        { value: 'finished_good', label: 'Finished Good' },
        { value: 'trading', label: 'Trading' },
        { value: 'consumable', label: 'Consumable' },
        { value: 'service', label: 'Service (Non-Stock)' }
      ],
      help: 'Determines GL account category'
    },
    {
      name: 'item_class_id',
      label: 'Item Class',
      type: 'select',
      placeholder: 'Select item class',
      required: true,
      options: itemClassOptions,
      help: 'E.g., Electronics, Chemicals, Textiles'
    },
    {
      name: 'item_category_id',
      label: 'Item Category',
      type: 'select',
      placeholder: 'Select item category',
      required: true,
      options: itemCategoryOptions,
      help: 'Child of Item Class'
    },
    {
      name: 'item_group_id',
      label: 'Item Group',
      type: 'select',
      placeholder: 'Select item group',
      required: false,
      options: itemGroupOptions,
      help: 'Further sub-classification'
    },
    {
      name: 'brand',
      label: 'Brand',
      type: 'text',
      placeholder: 'Brand name or select from master',
      required: false,
      maxLength: 100,
      help: 'For reporting and sales analytics'
    },
    {
      name: 'item_image',
      label: 'Item Image',
      type: 'file',
      placeholder: 'Upload JPG/PNG (max 5 MB)',
      required: false,
      accept: 'image/jpeg,image/png',
      help: 'For mobile app display'
    },
  ];

  // ============================================
  // SECTION B: Tracking & UOM Configuration
  // ============================================
  const trackingFields = [
    {
      name: 'tracking_mode',
      label: 'Tracking Mode',
      type: 'select',
      placeholder: 'Select tracking mode',
      required: true,
      options: trackingModeOptions || [
        { value: 'none', label: 'None' },
        { value: 'lot', label: 'Lot / Batch' },
        { value: 'serial', label: 'Serial Number' }
      ],
      help: 'Determines GRN line-item requirements'
    },
    {
      name: 'stock_uom_id',
      label: 'Stock UOM',
      type: 'select',
      placeholder: 'Select stock UOM',
      required: true,
      options: uomOptions,
      help: 'Base unit for quantity ledger (e.g., Unit, Box, kg, Liter)'
    },
    {
      name: 'purchase_uom_id',
      label: 'Purchase UOM',
      type: 'select',
      placeholder: 'Select purchase UOM',
      required: true,
      options: uomOptions,
      help: 'Vendor billing unit - may differ from Stock UOM'
    },
    {
      name: 'sales_uom_id',
      label: 'Sales UOM',
      type: 'select',
      placeholder: 'Select sales UOM',
      required: true,
      options: uomOptions,
      help: 'Customer invoicing unit - may differ from Stock UOM'
    },
  ];

  // ============================================
  // SECTION C: Costing & Procurement
  // ============================================
  const costingFields = [
    {
      name: 'costing_method',
      label: 'Costing Method',
      type: 'select',
      placeholder: 'Select costing method',
      required: true,
      options: [
        { value: 'fifo', label: 'FIFO (First In First Out)' },
        { value: 'weighted_avg', label: 'Moving Weighted Average' },
        { value: 'standard_cost', label: 'Standard Cost' }
      ],
      help: 'Per IAS 2 policy. LIFO feature-flagged by country'
    },
    {
      name: 'standard_cost',
      label: 'Standard Cost',
      type: 'decimal',
      placeholder: 'Enter standard cost',
      required: false,
      min: 0,
      help: 'Required if Standard Cost method selected. Fixed reference cost for variance tracking'
    },
    {
      name: 'last_purchase_price',
      label: 'Last Purchase Price',
      type: 'decimal',
      placeholder: 'Auto-updated from GRN',
      required: false,
      readOnly: true,
      help: 'Auto-updated, read-only for reference'
    },
    {
      name: 'minimum_order_qty',
      label: 'Minimum Order Qty (MOQ)',
      type: 'decimal',
      placeholder: 'Enter MOQ',
      required: false,
      min: 0,
      help: 'Vendor minimum requirement'
    },
    {
      name: 'reorder_point',
      label: 'Reorder Point',
      type: 'decimal',
      placeholder: 'Enter reorder point',
      required: false,
      min: 0,
      help: 'When stock falls below this, alert is triggered'
    },
    {
      name: 'safety_stock',
      label: 'Safety Stock',
      type: 'decimal',
      placeholder: 'Enter safety stock',
      required: false,
      min: 0,
      help: 'Buffer stock level'
    },
    {
      name: 'maximum_stock_level',
      label: 'Maximum Stock Level',
      type: 'decimal',
      placeholder: 'Enter maximum level',
      required: false,
      min: 0,
      help: 'Upper limit before overstock alert'
    },
    {
      name: 'lead_time_days',
      label: 'Lead Time (days)',
      type: 'integer',
      placeholder: 'Days from PO to GRN',
      required: false,
      min: 0,
      help: 'For reorder planning'
    },
    {
      name: 'default_vendor_id',
      label: 'Default Vendor',
      type: 'select',
      placeholder: 'Auto-populate in PO if selected',
      required: false,
      options: [],
      help: 'Select from vendor master'
    },
  ];

  // ============================================
  // SECTION D: Expiry & Storage
  // ============================================
  const expiryFields = [
    {
      name: 'expiry_tracking',
      label: 'Expiry Tracking',
      type: 'toggle',
      required: true,
      defaultValue: false,
      help: 'If enabled, fields below become mandatory'
    },
    {
      name: 'shelf_life_days',
      label: 'Shelf Life (days)',
      type: 'integer',
      placeholder: 'Days from manufacturing to expiry',
      required: expiryTrackingEnabled ? true : false,
      min: 0,
      help: 'Required only if Expiry Tracking is enabled'
    },
    {
      name: 'expiry_basis',
      label: 'Expiry Basis',
      type: 'select',
      placeholder: 'Select expiry calculation basis',
      required: expiryTrackingEnabled ? true : false,
      options: [
        { value: 'manufacturing_date', label: 'Manufacturing Date' },
        { value: 'receipt_date', label: 'Receipt Date' }
      ],
      help: 'Start point for shelf life calculation'
    },
    {
      name: 'near_expiry_alert_days',
      label: 'Near-Expiry Alert (days)',
      type: 'integer',
      placeholder: 'E.g., 30 for alert 30 days before expiry',
      required: expiryTrackingEnabled ? true : false,
      min: 0,
      help: 'Triggers stock report warning'
    },
    {
      name: 'storage_temperature_class',
      label: 'Storage Temperature Class',
      type: 'select',
      placeholder: 'Select storage class',
      required: false,
      options: temperatureClassOptions || [
        { value: 'ambient', label: 'Ambient (15-25°C)' },
        { value: 'chilled', label: 'Chilled (0-8°C)' },
        { value: 'frozen', label: 'Frozen (<-15°C)' },
        { value: 'controlled', label: 'Controlled (Other)' }
      ],
      help: 'Affects warehouse bin assignment'
    },
    {
      name: 'hazardous_material',
      label: 'Hazardous Material Flag',
      type: 'toggle',
      required: false,
      defaultValue: false,
      help: 'Triggers compliance checks and special storage'
    },
  ];

  // ============================================
  // SECTION E: Physical Attributes
  // ============================================
  const physicalFields = [
    {
      name: 'gross_weight_kg',
      label: 'Gross Weight (kg)',
      type: 'decimal',
      placeholder: 'Weight in kilograms',
      required: false,
      min: 0,
      step: 0.001,
      help: 'For freight cost calculations'
    },
    {
      name: 'net_weight_kg',
      label: 'Net Weight (kg)',
      type: 'decimal',
      placeholder: 'Actual product weight',
      required: false,
      min: 0,
      step: 0.001,
      help: 'Must be <= Gross Weight'
    },
    {
      name: 'volume_cbm',
      label: 'Volume (CBM)',
      type: 'decimal',
      placeholder: 'Cubic meters',
      required: false,
      min: 0,
      step: 0.001,
      help: 'For container & logistics planning'
    },
    {
      name: 'dimensions',
      label: 'Dimensions (L×W×H cm)',
      type: 'text',
      placeholder: 'Format: 10x20x5',
      required: false,
      maxLength: 50,
      help: 'For picking/packing efficiency'
    },
  ];

  // ============================================
  // SECTION F: Tax & Trade Compliance
  // ============================================
  const taxFields = [
    {
      name: 'tax_category_id',
      label: 'Tax Category',
      type: 'select',
      placeholder: 'Select tax category',
      required: true,
      options: taxCategoryOptions,
      help: 'Determines output tax on sales'
    },
    {
      name: 'hsn_code',
      label: 'HSN Code / SAC Code',
      type: 'text',
      placeholder: 'GST/VAT format',
      required: false,
      maxLength: 20,
      help: 'India GST classification'
    },
    {
      name: 'hs_tariff_code',
      label: 'HS Tariff Code',
      type: 'text',
      placeholder: '6-8 digit international code',
      required: false,
      maxLength: 10,
      help: 'Customs classification for imports'
    },
    {
      name: 'country_of_origin_id',
      label: 'Country of Origin',
      type: 'select',
      placeholder: 'Select country',
      required: false,
      options: countryOptions,
      help: 'For import/export documentation'
    },
    {
      name: 'barcode_gtin',
      label: 'Barcode / GTIN',
      type: 'text',
      placeholder: 'GS1 format (13-digit EAN or 12-digit UPC)',
      required: false,
      maxLength: 20,
      help: 'Unique for supply chain'
    },
  ];

  // ============================================
  // SECTION G: GL Account Mapping
  // ============================================
  const glFields = [
    {
      name: 'inventory_gl_account_id',
      label: 'Inventory GL Account',
      type: 'select',
      placeholder: 'Select GL account',
      required: true,
      options: glAccountOptions,
      help: 'Balance sheet asset account'
    },
    {
      name: 'cogs_gl_account_id',
      label: 'COGS GL Account',
      type: 'select',
      placeholder: 'Select GL account',
      required: true,
      options: glAccountOptions,
      help: 'P&L expense account'
    },
    {
      name: 'writeoff_gl_account_id',
      label: 'Write-Off GL Account',
      type: 'select',
      placeholder: 'Select GL account',
      required: true,
      options: glAccountOptions,
      help: 'For adjustments/write-downs'
    },
    {
      name: 'price_variance_gl_account_id',
      label: 'Price Variance GL Account',
      type: 'select',
      placeholder: 'Select GL account',
      required: false,
      options: glAccountOptions,
      help: 'Standard cost variance tracking - required if using Standard Cost method'
    },
  ];

  // ============================================
  // SECTION H: Additional Classification & Analytics
  // ============================================
  const analyticsFields = [
    {
      name: 'abc_classification',
      label: 'ABC Classification',
      type: 'select',
      placeholder: 'Select classification',
      required: false,
      options: [
        { value: 'a', label: 'A (High Value)' },
        { value: 'b', label: 'B (Medium Value)' },
        { value: 'c', label: 'C (Low Value)' }
      ],
      help: 'For inventory management focus'
    },
    {
      name: 'slow_moving_threshold_days',
      label: 'Slow-Moving Threshold (days)',
      type: 'integer',
      placeholder: 'Default 180 days',
      required: false,
      min: 0,
      help: 'Days without movement = flag item'
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
    ...glFields,
    // Section H
    ...analyticsFields,
  ];

  // Section groupings for display with icons and descriptions
  const sectionGroups = [
    { title: 'Section A: Header Information', icon: Package, description: 'Basic product identification and classification', fields: headerFields },
    !isEditMode && { title: 'Section B: Tracking & UOM Configuration', icon: Layers, description: 'Define tracking mode and unit of measure conversions', fields: trackingFields },
    { title: 'Section C: Costing & Procurement', icon: DollarSign, description: 'Valuation method, reorder points, and vendor information', fields: costingFields },
    { title: 'Section D: Expiry & Storage', icon: Calendar, description: 'Shelf life management and storage requirements', fields: expiryFields },
    { title: 'Section E: Physical Attributes', icon: Package, description: 'Weight, volume, and dimension specifications', fields: physicalFields },
    { title: 'Section F: Tax & Trade Compliance', icon: Hash, description: 'Tax codes and international trade information', fields: taxFields },
    { title: 'Section G: GL Account Mapping', icon: DollarSign, description: 'Accounting mappings for inventory and expenses', fields: glFields },
    { title: 'Section H: Classification & Analytics', icon: Zap, description: 'ABC classification and slow-moving tracking', fields: analyticsFields }
  ].filter(Boolean);

  const handleSubmit = (formData) => {
    setErrors({});
    setAlert(null);

    const newErrors = {};

    // Validate mandatory fields
    if (!formData.item_code?.trim()) {
      newErrors.item_code = 'Item code is required';
    }

    if (!formData.item_name_short?.trim()) {
      newErrors.item_name_short = 'Item name (short) is required';
    }

    if (!formData.item_type) {
      newErrors.item_type = 'Item type is required';
    }

    if (!formData.item_class_id) {
      newErrors.item_class_id = 'Item class is required';
    }

    if (!formData.item_category_id) {
      newErrors.item_category_id = 'Item category is required';
    }

    if (!formData.stock_uom_id) {
      newErrors.stock_uom_id = 'Stock UOM is required';
    }

    if (!formData.purchase_uom_id) {
      newErrors.purchase_uom_id = 'Purchase UOM is required';
    }

    if (!formData.sales_uom_id) {
      newErrors.sales_uom_id = 'Sales UOM is required';
    }

    if (!formData.tracking_mode) {
      newErrors.tracking_mode = 'Tracking mode is required';
    }

    if (!formData.costing_method) {
      newErrors.costing_method = 'Costing method is required';
    }

    if (formData.costing_method === 'standard_cost' && !formData.standard_cost) {
      newErrors.standard_cost = 'Standard cost is required for Standard Cost method';
    }

    if (!formData.tax_category_id) {
      newErrors.tax_category_id = 'Tax category is required';
    }

    if (!formData.inventory_gl_account_id) {
      newErrors.inventory_gl_account_id = 'Inventory GL account is required';
    }

    if (!formData.cogs_gl_account_id) {
      newErrors.cogs_gl_account_id = 'COGS GL account is required';
    }

    if (!formData.writeoff_gl_account_id) {
      newErrors.writeoff_gl_account_id = 'Write-off GL account is required';
    }

    // Conditional validation for expiry
    if (formData.expiry_tracking) {
      if (!formData.shelf_life_days) {
        newErrors.shelf_life_days = 'Shelf life days is required when expiry tracking is enabled';
      }
      if (!formData.expiry_basis) {
        newErrors.expiry_basis = 'Expiry basis is required when expiry tracking is enabled';
      }
      if (!formData.near_expiry_alert_days) {
        newErrors.near_expiry_alert_days = 'Near-expiry alert days is required when expiry tracking is enabled';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: 'Please correct the errors above.' });
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
          setAlert({ type: 'error', message: 'Failed to update item. Please check the errors.' });
        },
      });
    } else {
      router.post('/inventory/item-master', formDataToSend, {
        forceFormData: true,
        onError: (serverErrors) => {
          setErrors(serverErrors);
          setAlert({ type: 'error', message: 'Failed to create item. Please check the errors.' });
        },
      });
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Item Master', icon: Package, href: '/inventory/item-master' },
    { label: isEditMode ? 'Edit Item' : 'Create Item', icon: isEditMode ? Edit3 : Plus },
  ];

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
      <Breadcrumbs items={breadcrumbItems} />

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
        title={isEditMode ? "Complete Item Master Record" : "Create New Item"}
        subtitle={isEditMode ? "Update all item details and parameters" : "Define complete product master with all required specifications"}
        fields={allFields}
        onSubmit={handleSubmit}
        submitText={isEditMode ? "Update Item" : "Create Item"}
        resetText="Clear Form"
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
