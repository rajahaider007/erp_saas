import React, { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import GeneralizedForm from '@/Components/GeneralizedForm';
import SalesPageShell from '@/Components/Sales/PageShell';

export default function CustomerForm({ isCreate, customer, currencies, customerTypes }) {
    const formDataRef = useRef(null);
    const [alert, setAlert] = useState(null);

    const initialData = isCreate ? {
        customer_name: '',
        customer_type: 'Company',
        primary_email: '',
        phone: '',
        currency_id: currencies?.[0]?.id || '',
        payment_terms: 'net30',
        credit_limit: 0,
        credit_limit_warning_percent: 80,
        active_status: true,
        customer_since: new Date().toISOString().split('T')[0],
    } : customer;

    const formFields = [
        {
            fieldName: 'customer_name',
            fieldType: 'text',
            label: 'Customer Name',
            placeholder: 'Enter customer name',
            required: true,
            validation: 'required|string|max:200',
        },
        {
            fieldName: 'customer_type',
            fieldType: 'select',
            label: 'Customer Type',
            required: true,
            options: customerTypes.map(type => ({ label: type, value: type })),
        },
        {
            fieldName: 'primary_email',
            fieldType: 'email',
            label: 'Primary Email',
            placeholder: 'customer@example.com',
            required: true,
        },
        {
            fieldName: 'phone',
            fieldType: 'tel',
            label: 'Phone',
            placeholder: '+1 (555) 000-0000',
        },
        {
            fieldName: 'currency_id',
            fieldType: 'select',
            label: 'Default Currency',
            required: true,
            options: currencies.map(c => ({ label: c.code, value: c.id })),
        },
        {
            fieldName: 'payment_terms',
            fieldType: 'text',
            label: 'Payment Terms',
            placeholder: 'e.g., Net 30, Net 60',
        },
        {
            fieldName: 'credit_limit',
            fieldType: 'number',
            label: 'Credit Limit',
            placeholder: '0',
        },
        {
            fieldName: 'credit_limit_warning_percent',
            fieldType: 'number',
            label: 'Credit Limit Warning %',
            placeholder: '80',
        },
        {
            fieldName: 'customer_since',
            fieldType: 'date',
            label: 'Customer Since',
        },
        {
            fieldName: 'active_status',
            fieldType: 'switch',
            label: 'Active',
        },
    ];

    const handleSubmit = async (formData) => {
        try {
            const url = isCreate ? route('sales.customer.store') : route('sales.customer.update', customer.id);
            const method = isCreate ? 'post' : 'put';

            router[method](url, formData, {
                onSuccess: () => {
                    setAlert({ type: 'success', message: isCreate ? 'Customer created successfully' : 'Customer updated successfully' });
                },
                onError: (errors) => {
                    setAlert({ type: 'error', message: Object.values(errors).join(', ') });
                },
            });
        } catch (error) {
            setAlert({ type: 'error', message: 'An error occurred' });
        }
    };

    return (
        <SalesPageShell>
            <Head title={isCreate ? 'Create Customer' : 'Edit Customer'} />
            <div className="max-w-4xl mx-auto">
                <GeneralizedForm
                    ref={formDataRef}
                    title={isCreate ? 'New Customer' : 'Edit Customer'}
                    subtitle={isCreate ? 'Add a new customer to your database' : 'Update customer information'}
                    fields={formFields}
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    submitText={isCreate ? 'Create Customer' : 'Update Customer'}
                    resetText="Reset"
                    showReset={true}
                />
            </div>
        </SalesPageShell>
    );
}
