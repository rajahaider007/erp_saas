import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, Plus, Trash2, Package, Package2, Edit3 } from 'lucide-react';
import App from '../../App.jsx';
import GeneralizedForm from '../../../Components/GeneralizedForm.jsx';
import Breadcrumbs from '../../../Components/Breadcrumbs';

export default function Edit() {
  const { category, relatedClasses = [], inventoryTypeOptions = [], valuationMethodOptions = [], flash } = usePage().props;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (flash?.success) {
      alert('✓ ' + flash.success);
    } else if (flash?.error) {
      alert('✗ ' + flash.error);
    }
  }, [flash]);

  const handleSubmit = (formData) => {
    setLoading(true);
    setErrors({});

    router.put(`/inventory/item-category-coding/${category.id}`, formData, {
      onError: (errors) => {
        setErrors(errors);
        setLoading(false);
      },
      onSuccess: () => {
        setLoading(false);
      }
    });
  };

  const breadcrumbItems = [
    { icon: Package, label: 'Inventory', href: '#' },
    { icon: Package2, label: 'Item Categories', href: '/inventory/item-category-coding/list' },
    { label: `Edit: ${category.category_code}` }
  ];

  const formFields = [
    {
      name: 'category_code',
      label: 'Category Code',
      type: 'text',
      required: true,
      maxLength: 30,
      defaultValue: category.category_code,
      help: 'Unique identifier (max 30 characters, uppercase)',
      disabled: false
    },
    {
      name: 'category_name',
      label: 'Category Name',
      type: 'text',
      required: true,
      maxLength: 150,
      defaultValue: category.category_name,
      help: 'Display name for this category'
    },
    {
      name: 'inventory_type',
      label: 'Inventory Type',
      type: 'select',
      required: true,
      options: inventoryTypeOptions || [],
      defaultValue: category.inventory_type,
      help: 'Type of inventory for this category (IFRS/IAS 2 compliant)'
    },
    {
      name: 'valuation_method',
      label: 'Valuation Method',
      type: 'select',
      required: true,
      options: valuationMethodOptions || [],
      defaultValue: category.valuation_method,
      help: 'Method for inventory valuation (FIFO, Weighted Average, Standard Cost)'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      maxLength: 500,
      defaultValue: category.description || '',
      placeholder: 'Optional description...',
      help: 'Additional details about this category'
    },
    {
      name: 'is_active',
      label: 'Active',
      type: 'toggle',
      defaultValue: category.is_active,
      help: 'Enable or disable this category'
    }
  ];

  return (
    <App>
      <div className="page-container">
        <div className="page-breadcrumbs">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="page-content">
          {/* Back Button */}
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={() => router.get('/inventory/item-category-coding/list')}
              className="btn-back"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              <ArrowLeft size={16} />
              Back to List
            </button>
          </div>

          {/* Edit Form Section */}
          <div className="form-card" style={{
            background: 'white',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 0.5rem 0'
              }}>
                Edit Category
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: 0
              }}>
                Update the category details below
              </p>
            </div>

            <GeneralizedForm 
              fields={formFields}
              onSubmit={handleSubmit}
              loading={loading}
              errors={errors}
              submitButtonText="Update Category"
              submitButtonIcon={<Save size={18} />}
            />
          </div>

          {/* Related Classes Section */}
          {relatedClasses.length > 0 && (
            <div className="form-card" style={{
              background: 'white',
              borderRadius: '8px',
              padding: '1.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    color: '#111827',
                    margin: 0
                  }}>
                    Related Item Classes ({relatedClasses.length})
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: '0.25rem 0 0 0'
                  }}>
                    Classes assigned to this category
                  </p>
                </div>
                <a 
                  href={`/inventory/item-class-coding?category_id=${category.id}`}
                  className="btn-link"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textDecoration: 'none'
                  }}
                >
                  <Plus size={16} />
                  Add Class
                </a>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.875rem'
                }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Code</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Name</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Tracking Type</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>ABC Class</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatedClasses.map((itemClass) => (
                      <tr key={itemClass.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: '600' }}>{itemClass.class_code}</td>
                        <td style={{ padding: '0.75rem' }}>{itemClass.class_name}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            background: '#f0f9ff',
                            color: '#0369a1',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {itemClass.tracking_type}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            background: '#fef3c7',
                            color: '#92400e',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {itemClass.abc_classification}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            background: itemClass.is_active ? '#d1fae5' : '#fee2e2',
                            color: itemClass.is_active ? '#065f46' : '#991b1b',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {itemClass.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <a 
                            href={`/inventory/item-class-coding/${itemClass.id}/edit`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              background: '#dbeafe',
                              color: '#3b82f6',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              textDecoration: 'none',
                              marginRight: '0.25rem'
                            }}
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {relatedClasses.length === 0 && (
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center',
              border: '1px solid #e5e7eb',
              color: '#9ca3af'
            }}>
              <Package2 size={48} style={{ margin: '0 auto 1rem', opacity: '0.5' }} />
              <p style={{ margin: '0 0 1rem 0' }}>No item classes assigned to this category yet</p>
              <a 
                href={`/inventory/item-class-coding?category_id=${category.id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  textDecoration: 'none'
                }}
              >
                <Plus size={16} />
                Create First Class
              </a>
            </div>
          )}
        </div>
      </div>
    </App>
  );
}
