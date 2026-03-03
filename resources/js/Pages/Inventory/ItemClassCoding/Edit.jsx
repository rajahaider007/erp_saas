import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, Grid, Grid2x2, Edit3 } from 'lucide-react';
import App from '../../App.jsx';
import GeneralizedForm from '../../../Components/GeneralizedForm.jsx';
import Breadcrumbs from '../../../Components/Breadcrumbs';

export default function Edit() {
  const { itemClass, trackingTypeOptions = [], abcClassificationOptions = [], flash } = usePage().props;
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

    router.put(`/inventory/item-class-coding/${itemClass.id}`, formData, {
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
    { icon: Grid, label: 'Inventory', href: '#' },
    { icon: Grid2x2, label: 'Item Classes', href: '/inventory/item-class-coding/list' },
    { label: `Edit: ${itemClass.class_code}` }
  ];

  const formFields = [
    {
      name: 'class_code',
      label: 'Class Code',
      type: 'text',
      required: true,
      maxLength: 30,
      defaultValue: itemClass.class_code,
      help: 'Unique identifier (max 30 characters, uppercase)',
      disabled: false
    },
    {
      name: 'class_name',
      label: 'Class Name',
      type: 'text',
      required: true,
      maxLength: 150,
      defaultValue: itemClass.class_name,
      help: 'Display name for this class'
    },
    {
      name: 'tracking_type',
      label: 'Tracking Type',
      type: 'select',
      required: true,
      options: trackingTypeOptions || [],
      defaultValue: itemClass.tracking_type,
      help: 'Method for tracking items (none, batch, or serial)'
    },
    {
      name: 'abc_classification',
      label: 'ABC Classification',
      type: 'select',
      required: true,
      options: abcClassificationOptions || [],
      defaultValue: itemClass.abc_classification,
      help: 'ABC classification for inventory control (A=High Value, B=Medium, C=Standard)'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      maxLength: 500,
      defaultValue: itemClass.description || '',
      placeholder: 'Optional description...',
      help: 'Additional details about this class'
    },
    {
      name: 'is_active',
      label: 'Active',
      type: 'toggle',
      defaultValue: itemClass.is_active,
      help: 'Enable or disable this class'
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
              onClick={() => router.get('/inventory/item-class-coding/list')}
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
                Edit Item Class
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: 0
              }}>
                Update the item class details below
              </p>
            </div>

            <GeneralizedForm 
              fields={formFields}
              onSubmit={handleSubmit}
              loading={loading}
              errors={errors}
              submitButtonText="Update Class"
              submitButtonIcon={<Save size={18} />}
            />
          </div>

          {/* Category Info Card */}
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '1.5rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              color: '#111827',
              margin: '0 0 1rem 0'
            }}>
              Category Information
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                  Category Code
                </p>
                <p style={{
                  fontFamily: 'monospace',
                  fontWeight: '600',
                  color: '#111827',
                  fontSize: '1rem',
                  margin: 0
                }}>
                  {itemClass.category?.category_code || 'N/A'}
                </p>
              </div>

              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                  Category Name
                </p>
                <p style={{
                  fontWeight: '600',
                  color: '#111827',
                  fontSize: '1rem',
                  margin: 0
                }}>
                  {itemClass.category?.category_name || 'N/A'}
                </p>
              </div>

              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                  Inventory Type
                </p>
                <p style={{
                  fontWeight: '600',
                  color: '#111827',
                  fontSize: '1rem',
                  margin: 0
                }}>
                  {itemClass.category?.inventory_type || 'N/A'}
                </p>
              </div>

              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                  Valuation Method
                </p>
                <p style={{
                  fontWeight: '600',
                  color: '#111827',
                  fontSize: '1rem',
                  margin: 0
                }}>
                  {itemClass.category?.valuation_method || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </App>
  );
}
