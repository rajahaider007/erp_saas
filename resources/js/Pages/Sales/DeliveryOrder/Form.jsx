import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import GeneralizedForm from '@/Components/GeneralizedForm';
import SalesPageShell from '@/Components/Sales/PageShell';

export default function DeliveryOrderForm({ isCreate = true, initialData = null, salesOrders = [] }) {
    const { data, setData, post, put, errors, processing } = useForm({
        sales_order_id: initialData?.sales_order_id || '',
        delivery_method: initialData?.delivery_method || 'standard',
        delivery_date: initialData?.delivery_date || new Date().toISOString().split('T')[0],
        carrier: initialData?.carrier || '',
        tracking_no: initialData?.tracking_no || '',
        weight: initialData?.weight || '',
        volume: initialData?.volume || '',
        delivery_address: initialData?.delivery_address || '',
        receiver_name: initialData?.receiver_name || '',
        receiver_phone: initialData?.receiver_phone || '',
        remarks: initialData?.remarks || '',
    });

    const handleSubmit = (formData) => {
        if (isCreate) {
            post(route('sales.delivery.store'), {
                data: formData,
            });
        } else {
            put(route('sales.delivery.update', initialData.id), {
                data: formData,
            });
        }
    };

    const formFields = [
        {
            name: 'sales_order_id',
            type: 'select',
            label: 'Sales Order',
            required: true,
            options: salesOrders.map(o => ({ value: o.id, label: `${o.sales_order_no} - ${o.customer?.customer_name}` })),
        },
        {
            name: 'delivery_method',
            type: 'select',
            label: 'Delivery Method',
            options: [
                { value: 'standard', label: 'معیاری' },
                { value: 'express', label: 'تیز' },
                { value: 'pickup', label: 'پک اپ' },
                { value: 'custom', label: 'حسب ضرورت' },
            ],
        },
        {
            name: 'delivery_date',
            type: 'date',
            label: 'Delivery Date',
        },
        {
            name: 'carrier',
            type: 'text',
            label: 'Carrier/Company',
        },
        {
            name: 'tracking_no',
            type: 'text',
            label: 'Tracking Number',
        },
        {
            name: 'weight',
            type: 'number',
            label: 'Weight (kg)',
            step: '0.01',
        },
        {
            name: 'volume',
            type: 'number',
            label: 'Volume (cbm)',
            step: '0.01',
        },
        {
            name: 'delivery_address',
            type: 'textarea',
            label: 'Delivery Address',
            rows: 3,
        },
        {
            name: 'receiver_name',
            type: 'text',
            label: 'Receiver Name',
        },
        {
            name: 'receiver_phone',
            type: 'text',
            label: 'Receiver Phone',
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
            <Head title={isCreate ? 'Create Delivery' : 'Edit Delivery'} />
            <div className="mx-auto max-w-4xl text-gray-900 dark:text-gray-100">
                <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                    {isCreate ? 'نیا Delivery بنائیں' : 'Delivery میں ترمیم'}
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
