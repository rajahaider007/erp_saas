import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import GeneralizedForm from '@/Components/GeneralizedForm';
import SalesPageShell from '@/Components/Sales/PageShell';

export default function PaymentForm({ isCreate = true, initialData = null, customers = [] }) {
    const { data, setData, post, put, errors, processing } = useForm({
        customer_id: initialData?.customer_id || '',
        payment_method: initialData?.payment_method || 'bank_transfer',
        payment_date: initialData?.payment_date || new Date().toISOString().split('T')[0],
        currency_id: initialData?.currency_id || '1',
        exchange_rate: initialData?.exchange_rate || '1',
        payment_amount: initialData?.payment_amount || '',
        reference_no: initialData?.reference_no || '',
        payment_account: initialData?.payment_account || '',
        remarks: initialData?.remarks || '',
    });

    const handleSubmit = (formData) => {
        if (isCreate) {
            post(route('sales.payment.store'), {
                data: formData,
            });
        } else {
            put(route('sales.payment.update', initialData.id), {
                data: formData,
            });
        }
    };

    const formFields = [
        {
            name: 'customer_id',
            type: 'select',
            label: 'Customer',
            required: true,
            options: customers.map(c => ({ value: c.id, label: c.customer_name })),
        },
        {
            name: 'payment_method',
            type: 'select',
            label: 'Payment Method',
            required: true,
            options: [
                { value: 'bank_transfer', label: 'بینک منتقلی' },
                { value: 'cheque', label: 'چیک' },
                { value: 'cash', label: 'نقد' },
                { value: 'online', label: 'آن لائن' },
                { value: 'credit_card', label: 'کریڈٹ کارڈ' },
                { value: 'other', label: 'دیگر' },
            ],
        },
        {
            name: 'payment_date',
            type: 'date',
            label: 'Payment Date',
            required: true,
        },
        {
            name: 'currency_id',
            type: 'select',
            label: 'Currency',
            options: [
                { value: '1', label: 'PKR' },
                { value: '2', label: 'USD' },
                { value: '3', label: 'EUR' },
            ],
        },
        {
            name: 'exchange_rate',
            type: 'number',
            label: 'Exchange Rate',
            step: '0.000001',
        },
        {
            name: 'payment_amount',
            type: 'number',
            label: 'Payment Amount',
            required: true,
            step: '0.01',
        },
        {
            name: 'reference_no',
            type: 'text',
            label: 'Reference No (Check/Transfer Ref)',
        },
        {
            name: 'payment_account',
            type: 'text',
            label: 'Payment Account',
        },
        {
            name: 'remarks',
            type: 'textarea',
            label: 'Remarks',
            rows: 3,
        },
    ];

    return (
        <SalesPageShell>
            <Head title={isCreate ? 'Create Payment' : 'Edit Payment'} />
            <div className="mx-auto max-w-4xl text-gray-900 dark:text-gray-100">
                <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                    {isCreate ? 'نیا ادائیگی درج کریں' : 'ادائیگی میں ترمیم'}
                </h1>
                <GeneralizedForm
                    fields={formFields}
                    onSubmit={handleSubmit}
                    initialData={data}
                    isLoading={processing}
                    errors={errors}
                />
            </div>
        </SalesPageShell>
    );
}
