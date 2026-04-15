import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Trash2, Plus } from 'lucide-react';
import { calculateLineItem, calculateHeaderTotals, formatNumber } from '@/utils/SalesCalculations';
import SalesPageShell from '@/Components/Sales/PageShell';

const inputFull =
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100';
const inputSm = 'rounded border border-gray-300 bg-white px-2 py-1 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100';
const labelCls = 'mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300';

export default function InvoiceForm({ isCreate = true, initialData = null, customers = [], salesOrders = [], products = [] }) {
  const [lineItems, setLineItems] = useState(initialData?.line_items || []);
  const [selectedOrder, setSelectedOrder] = useState(initialData?.sales_order_id || '');

  const { data, setData, post, put, errors, processing } = useForm({
    customer_id: initialData?.customer_id || '',
    sales_order_id: initialData?.sales_order_id || '',
    invoice_date: initialData?.invoice_date || new Date().toISOString().split('T')[0],
    due_date: initialData?.due_date || '',
    currency_id: initialData?.currency_id || '1',
    exchange_rate: initialData?.exchange_rate || '1',
    terms_and_conditions: initialData?.terms_and_conditions || '',
    line_items: lineItems,
  });

  const handleOrderChange = (e) => {
    const orderId = e.target.value;
    setSelectedOrder(orderId);
    setData('sales_order_id', orderId);

    if (orderId) {
      const order = salesOrders.find((o) => o.id == orderId);
      if (order) {
        setData('customer_id', order.customer_id);
        setData('currency_id', order.currency_id);
        setData('exchange_rate', order.exchange_rate);

        if (order.line_items?.length > 0) {
          setLineItems(
            order.line_items.map((item) => ({
              ...item,
              id: null,
            })),
          );
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = {
      ...data,
      line_items: lineItems,
    };

    if (isCreate) {
      post(route('sales.invoice.store'), {
        data: finalData,
      });
    } else {
      put(route('sales.invoice.update', initialData.id), {
        data: finalData,
      });
    }
  };

  const addLineItem = () => {
    const newItem = {
      id: null,
      product_id: '',
      product_name: '',
      product_code: '',
      quantity: 1,
      unit_of_measure: 'PC',
      unit_price: 0,
      discount_type: 0,
      discount_amount: 0,
      line_amount_untaxed: 0,
      tax_amount: 0,
      line_amount_total: 0,
      line_sequence: lineItems.length + 1,
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems];

    if (field === 'product_id') {
      const product = products.find((p) => p.id == value);
      if (product) {
        updated[index].product_id = value;
        updated[index].product_name = product.name;
        updated[index].product_code = product.code;
        updated[index].unit_price = product.price || 0;
      }
    } else {
      updated[index][field] = isNaN(value) ? value : parseFloat(value) || 0;
    }

    const calculated = calculateLineItem(updated[index]);
    updated[index] = { ...updated[index], ...calculated };

    setLineItems(updated);
  };

  const headers = calculateHeaderTotals(lineItems);

  return (
    <SalesPageShell>
      <Head title={isCreate ? 'Create Invoice' : 'Edit Invoice'} />
      <div className="mx-auto max-w-7xl text-gray-900 dark:text-gray-100">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          {isCreate ? 'نیا بل بنائیں' : 'بل میں ترمیم'}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className={labelCls}>
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={data.customer_id}
                onChange={(e) => setData('customer_id', e.target.value)}
                className={inputFull}
                required
              >
                <option value="">Select Customer</option>
                {customers?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customer_name}
                  </option>
                ))}
              </select>
              {errors.customer_id && <p className="mt-1 text-sm text-red-500">{errors.customer_id}</p>}
            </div>

            <div>
              <label className={labelCls}>Sales Order (اختیاری)</label>
              <select value={selectedOrder} onChange={handleOrderChange} className={inputFull}>
                <option value="">Select Sales Order</option>
                {salesOrders?.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.sales_order_no} - {o.customer?.customer_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={data.invoice_date}
                onChange={(e) => setData('invoice_date', e.target.value)}
                className={inputFull}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Due Date</label>
              <input
                type="date"
                value={data.due_date}
                onChange={(e) => setData('due_date', e.target.value)}
                className={inputFull}
              />
            </div>

            <div>
              <label className={labelCls}>Currency</label>
              <select value={data.currency_id} onChange={(e) => setData('currency_id', e.target.value)} className={inputFull}>
                <option value="1">PKR</option>
                <option value="2">USD</option>
                <option value="3">EUR</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Exchange Rate</label>
              <input
                type="number"
                value={data.exchange_rate}
                onChange={(e) => setData('exchange_rate', e.target.value)}
                className={inputFull}
                step="0.000001"
              />
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Line Items</h2>
              <button
                type="button"
                onClick={addLineItem}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500"
              >
                <Plus size={18} />
                Line Item شامل کریں
              </button>
            </div>

            {lineItems.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Product</th>
                      <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">Qty</th>
                      <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">Unit Price</th>
                      <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">Discount %</th>
                      <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">Total</th>
                      <th className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {lineItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                        <td className="px-4 py-3">
                          <select
                            value={item.product_id}
                            onChange={(e) => updateLineItem(idx, 'product_id', e.target.value)}
                            className={`w-full ${inputSm}`}
                          >
                            <option value="">Select Product</option>
                            {products?.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(idx, 'quantity', e.target.value)}
                            className={`w-20 text-right ${inputSm}`}
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => updateLineItem(idx, 'unit_price', e.target.value)}
                            className={`w-24 text-right ${inputSm}`}
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.discount_type}
                            onChange={(e) => updateLineItem(idx, 'discount_type', e.target.value)}
                            className={`w-20 text-right ${inputSm}`}
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                          {formatNumber(item.line_amount_total)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeLineItem(idx)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-600 dark:text-gray-400">
                <p>کوئی line items نہیں۔ شامل کرنے کے لیے بٹن دبائیں۔</p>
              </div>
            )}
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-6 dark:bg-gray-900/40 md:grid-cols-3">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Subtotal</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(headers.amount_untaxed)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Tax</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(headers.amount_tax)}</p>
            </div>
            <div className="rounded bg-blue-50 py-2 text-center dark:bg-blue-900/20">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(headers.amount_total)}</p>
            </div>
          </div>

          <div className="mb-8">
            <label className={labelCls}>Terms & Conditions</label>
            <textarea
              value={data.terms_and_conditions}
              onChange={(e) => setData('terms_and_conditions', e.target.value)}
              rows={4}
              className={inputFull}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              type="submit"
              disabled={processing}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {processing ? 'saving...' : 'Save Invoice'}
            </button>
            <Link
              href={route('sales.invoice.index')}
              className="rounded-lg bg-gray-200 px-6 py-2 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </SalesPageShell>
  );
}
