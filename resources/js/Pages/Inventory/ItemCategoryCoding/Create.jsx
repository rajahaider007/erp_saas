import React, { useState, useEffect } from 'react';
import { Home, List, Plus, Hash, Tag, Package, Calculator, X, Edit3, Save, Trash2, Package2 } from 'lucide-react';
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
      <div className="breadcrumbs-description">Create item classes first, then link them to a category</div>
    </div>
  );
};

const CreateItemCategoryCodingForm = () => {
  const {
    errors: pageErrors,
    flash,
    inventoryTypeOptions = [],
    valuationMethodOptions = [],
    trackingTypeOptions = [],
    abcClassificationOptions = [],
    error,
  } = usePage().props;

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [editingClassId, setEditingClassId] = useState(null);

  // Classes - FIRST (top)
  const [classes, setClasses] = useState([]);
  const [classForm, setClassForm] = useState({
    class_code: '',
    class_name: '',
    tracking_type: 'none',
    abc_classification: 'B',
    description: '',
    is_active: true,
  });

  // Category - SECOND (bottom)
  const [categoryData, setCategoryData] = useState({
    category_code: '',
    category_name: '',
    inventory_type: 'trading_goods',
    valuation_method: 'weighted_average',
    description: '',
    is_active: true,
  });

  const [selectedClassIds, setSelectedClassIds] = useState([]);

  useEffect(() => {
    if (error) {
      setAlert({ type: 'error', message: error });
    }
  }, [error]);

  useEffect(() => {
    if (pageErrors && Object.keys(pageErrors).length > 0) {
      setErrors(pageErrors);
      setAlert({
        type: 'error',
        message: 'Please correct the errors below and try again.',
      });
    }
  }, [pageErrors]);

  useEffect(() => {
    if (flash?.success) {
      setAlert({ type: 'success', message: flash.success });
    } else if (flash?.error) {
      setAlert({ type: 'error', message: flash.error });
    }
  }, [flash]);

  // ===== CLASS HANDLERS =====
  const handleAddClass = () => {
    if (!classForm.class_code.trim()) {
      alert('Class code is required');
      return;
    }
    if (!classForm.class_name.trim()) {
      alert('Class name is required');
      return;
    }

    if (editingClassId !== null) {
      setClasses(classes.map(c => c.id === editingClassId ? { ...classForm, id: editingClassId } : c));
      setEditingClassId(null);
    } else {
      setClasses([...classes, { ...classForm, id: Date.now() }]);
    }

    setClassForm({
      class_code: '',
      class_name: '',
      tracking_type: 'none',
      abc_classification: 'B',
      description: '',
      is_active: true,
    });
  };

  const handleEditClass = (itemClass) => {
    setEditingClassId(itemClass.id);
    setClassForm(itemClass);
  };

  const handleDeleteClass = (id) => {
    if (confirm('Remove this class?')) {
      setClasses(classes.filter(c => c.id !== id));
      setSelectedClassIds(selectedClassIds.filter(cid => cid !== id));
      if (editingClassId === id) {
        setEditingClassId(null);
        setClassForm({
          class_code: '',
          class_name: '',
          tracking_type: 'none',
          abc_classification: 'B',
          description: '',
          is_active: true,
        });
      }
    }
  };

  const handleCancelEditClass = () => {
    setEditingClassId(null);
    setClassForm({
      class_code: '',
      class_name: '',
      tracking_type: 'none',
      abc_classification: 'B',
      description: '',
      is_active: true,
    });
  };

  const handleSelectClass = (classId) => {
    if (selectedClassIds.includes(classId)) {
      setSelectedClassIds(selectedClassIds.filter(id => id !== classId));
    } else {
      setSelectedClassIds([...selectedClassIds, classId]);
    }
  };

  // ===== SUBMIT HANDLER =====
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setAlert(null);
    setLoading(true);

    const newErrors = {};

    if (!categoryData.category_code?.trim()) {
      newErrors.category_code = 'Category code is required';
    }

    if (!categoryData.category_name?.trim()) {
      newErrors.category_name = 'Category name is required';
    }

    if (!categoryData.inventory_type) {
      newErrors.inventory_type = 'Inventory type is required';
    }

    if (!categoryData.valuation_method) {
      newErrors.valuation_method = 'Valuation method is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setAlert({ type: 'error', message: 'Please correct the errors below and try again.' });
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('category_code', categoryData.category_code || '');
    formDataToSend.append('category_name', categoryData.category_name || '');
    formDataToSend.append('inventory_type', categoryData.inventory_type || '');
    formDataToSend.append('valuation_method', categoryData.valuation_method || '');
    formDataToSend.append('description', categoryData.description || '');
    formDataToSend.append('is_active', categoryData.is_active ? '1' : '0');

    // Send only classes that are selected
    const selectedClasses = classes
      .filter(c => selectedClassIds.includes(c.id))
      .map(c => ({
        class_code: c.class_code,
        class_name: c.class_name,
        tracking_type: c.tracking_type,
        abc_classification: c.abc_classification,
        description: c.description,
        is_active: c.is_active,
      }));

    formDataToSend.append('classes', JSON.stringify(selectedClasses));

    router.post('/inventory/item-category-coding', formDataToSend, {
      forceFormData: true,
      onError: (serverErrors) => {
        setErrors(serverErrors);
        setAlert({ type: 'error', message: 'Failed to create category. Please check the errors.' });
        setLoading(false);
      },
      onSuccess: () => {
        setLoading(false);
      }
    });
  };

  const breadcrumbItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'Item Category Coding', icon: List, href: '/inventory/item-category-coding/list' },
    { label: 'Create Category', icon: Plus, href: null },
  ];

  return (
    <div>
      <Breadcrumbs items={breadcrumbItems} />

      {alert && (
        <div className={`mb-4 p-3 rounded-lg ${alert.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {alert.message}
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <ul className="list-disc ml-5 space-y-1">
            {Object.entries(errors).map(([key, value]) => (
              <li key={key}>{Array.isArray(value) ? value[0] : value}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ========== STEP 1: CLASSES (TOP) ========== */}
        <div className="rounded-xl shadow-lg border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-bold mb-4 text-slate-800 flex items-center gap-2">
            <Tag className="text-amber-600" size={28} />
            Step 1: Create Item Classes ({classes.length})
          </h2>
          <p className="text-slate-600 mb-4 text-sm">Add item classes first. You can select which classes to link to the category below.</p>

          {/* Class Form */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Class Code</label>
                <input
                  type="text"
                  placeholder="e.g., CL001"
                  value={classForm.class_code}
                  onChange={(e) => setClassForm({ ...classForm, class_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono font-semibold"
                  maxLength="30"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Class Name</label>
                <input
                  type="text"
                  placeholder="e.g., Standard Class"
                  value={classForm.class_name}
                  onChange={(e) => setClassForm({ ...classForm, class_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  maxLength="150"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tracking Type</label>
                <select
                  value={classForm.tracking_type}
                  onChange={(e) => setClassForm({ ...classForm, tracking_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {trackingTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">ABC Classification</label>
                <select
                  value={classForm.abc_classification}
                  onChange={(e) => setClassForm({ ...classForm, abc_classification: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {abcClassificationOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description (Optional)</label>
                <textarea
                  placeholder="Additional details about this class..."
                  value={classForm.description}
                  onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  maxLength="500"
                  rows="2"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={classForm.is_active}
                    onChange={(e) => setClassForm({ ...classForm, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              {editingClassId !== null && (
                <button
                  type="button"
                  onClick={handleCancelEditClass}
                  className="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-400 transition flex items-center gap-2"
                >
                  <X size={18} /> Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleAddClass}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition flex items-center gap-2"
              >
                {editingClassId !== null ? (
                  <>
                    <Save size={18} /> Update Class
                  </>
                ) : (
                  <>
                    <Plus size={18} /> Add Class
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Classes List */}
          {classes.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 border-b-2 border-slate-300">
                  <tr>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700" style={{ width: '50px' }}>
                      <input
                        type="checkbox"
                        checked={selectedClassIds.length === classes.length && classes.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClassIds(classes.map(c => c.id));
                          } else {
                            setSelectedClassIds([]);
                          }
                        }}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Code</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Tracking</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">ABC</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700">Status</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {classes.map((itemClass) => (
                    <tr key={itemClass.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedClassIds.includes(itemClass.id)}
                          onChange={() => handleSelectClass(itemClass.id)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-800">{itemClass.class_code}</td>
                      <td className="px-4 py-3 text-slate-700">{itemClass.class_name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                          {trackingTypeOptions.find(o => o.value === itemClass.tracking_type)?.label || itemClass.tracking_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          itemClass.abc_classification === 'A' ? 'bg-red-100 text-red-700' :
                          itemClass.abc_classification === 'B' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {itemClass.abc_classification}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          itemClass.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {itemClass.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditClass(itemClass)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClass(itemClass.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          title="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {classes.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">No classes added yet. Add a class above to get started.</p>
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Check the checkboxes for classes you want to link to the category below.
            </p>
          </div>
        </div>

        {/* ========== STEP 2: CATEGORY (BOTTOM) ========== */}
        <div className="rounded-xl shadow-lg form-container border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
            <Package className="text-purple-600" size={28} />
            Step 2: Item Category Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category Code <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., RM, FG, TRD"
                value={categoryData.category_code}
                onChange={(e) => setCategoryData({ ...categoryData, category_code: e.target.value.toUpperCase() })}
                maxLength="30"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono font-semibold ${errors.category_code ? 'border-red-500' : 'border-slate-300'}`}
              />
              {errors.category_code && <p className="text-red-600 text-xs mt-1">{errors.category_code}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Category Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Raw Materials"
                value={categoryData.category_name}
                onChange={(e) => setCategoryData({ ...categoryData, category_name: e.target.value })}
                maxLength="150"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.category_name ? 'border-red-500' : 'border-slate-300'}`}
              />
              {errors.category_name && <p className="text-red-600 text-xs mt-1">{errors.category_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Inventory Type <span className="text-red-600">*</span>
              </label>
              <select
                value={categoryData.inventory_type}
                onChange={(e) => setCategoryData({ ...categoryData, inventory_type: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.inventory_type ? 'border-red-500' : 'border-slate-300'}`}
              >
                <option value="">Select inventory type</option>
                {inventoryTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.inventory_type && <p className="text-red-600 text-xs mt-1">{errors.inventory_type}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Valuation Method <span className="text-red-600">*</span>
              </label>
              <select
                value={categoryData.valuation_method}
                onChange={(e) => setCategoryData({ ...categoryData, valuation_method: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.valuation_method ? 'border-red-500' : 'border-slate-300'}`}
              >
                <option value="">Select valuation method</option>
                {valuationMethodOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.valuation_method && <p className="text-red-600 text-xs mt-1">{errors.valuation_method}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description (Optional)</label>
              <textarea
                placeholder="Additional details about this category..."
                value={categoryData.description}
                onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
                maxLength="500"
                rows="2"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={categoryData.is_active}
                  onChange={(e) => setCategoryData({ ...categoryData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                Active
              </label>
            </div>
          </div>

          {/* Selected Classes Summary */}
          {selectedClassIds.length > 0 && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">
                Selected Classes to Link: {selectedClassIds.length}
              </h3>
              <div className="flex flex-wrap gap-2">
                {classes
                  .filter(c => selectedClassIds.includes(c.id))
                  .map(c => (
                    <span
                      key={c.id}
                      className="px-3 py-1 bg-purple-200 text-purple-900 rounded-full text-sm font-semibold"
                    >
                      {c.category_code ? `${c.category_code}: ` : ''}{c.class_name}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {selectedClassIds.length === 0 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> No classes selected. You can create a category without classes and add them later.
              </p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-between gap-3">
          <button
            type="button"
            onClick={() => router.get('/inventory/item-category-coding/list')}
            className="px-6 py-3 bg-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-400 transition"
          >
            ← Back to List
          </button>
          <div className="flex gap-3">
            <button
              type="reset"
              onClick={() => {
                setClasses([]);
                setSelectedClassIds([]);
                setCategoryData({
                  category_code: '',
                  category_name: '',
                  inventory_type: 'trading_goods',
                  valuation_method: 'weighted_average',
                  description: '',
                  is_active: true,
                });
              }}
              className="px-6 py-3 bg-slate-400 text-white rounded-lg font-semibold hover:bg-slate-500 transition"
            >
              Clear All
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? 'Creating...' : `Create Category${selectedClassIds.length > 0 ? ' & Link Classes' : ''}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

const Create = () => {
  return (
    <App>
      <div className="rounded-xl shadow-lg form-container border-slate-200">
        <div className="p-6">
          <CreateItemCategoryCodingForm />
        </div>
      </div>
    </App>
  );
};

export default Create;
