# Sales Module - Phase 2 Action Plan

**Previous Status:** Phase 1 Complete ✅  
**Current Phase:** Phase 2 - Complete React Pages & Migrations  

---

## 🎯 Phase 2 Objectives (Next Steps)

### Priority 1: Database Migrations (BLOCKING)
Without migrations, data cannot be stored. This MUST be done first.

**What to do:**
```bash
# Run migrations (will fail - no migrations exist yet)
php artisan migrate:make create_sales_customers_table
php artisan migrate:make create_sales_quotations_table
php artisan migrate:make create_sales_quotation_lines_table
php artisan migrate:make create_sales_orders_table
php artisan migrate:make create_sales_order_lines_table
php artisan migrate:make create_sales_deliveries_table
php artisan migrate:make create_sales_delivery_lines_table
php artisan migrate:make create_sales_invoices_table
php artisan migrate:make create_sales_invoice_lines_table
php artisan migrate:make create_sales_payments_table
php artisan migrate:make create_sales_payment_allocations_table
```

**Table schema examples:**

For `sales_customers`:
```php
Schema::create('sales_customers', function (Blueprint $table) {
    $table->id();
    $table->foreignId('comp_id')->constrained('companies');
    $table->foreignId('location_id')->constrained('locations');
    $table->string('customer_code')->unique();
    $table->string('customer_name');
    $table->enum('customer_type', ['retail', 'wholesale', 'distributor']);
    $table->string('email')->nullable();
    $table->string('phone')->nullable();
    $table->foreignId('currency_id')->constrained('currencies');
    $table->integer('payment_terms')->default(30);
    $table->decimal('credit_limit', 14, 2)->default(0);
    $table->decimal('warning_percentage', 5, 2)->default(80);
    $table->date('customer_since')->nullable();
    $table->boolean('active_status')->default(true);
    $table->string('created_by')->nullable();
    $table->string('updated_by')->nullable();
    $table->timestamps();
    $table->softDeletes();
});
```

Repeat for all 11 tables using the Model definitions.

---

### Priority 2: Complete React Pages (12 Pages)

**Pages to create (copy/adapt from Customer/Form.jsx and Index.jsx):**

1. **Quotation/Index.jsx**
   - List all quotations with filters (status, customer, date range)
   - Search by quotation_no, customer_name
   - Columns: quotation_no, customer, amount_total, state, created_at, actions

2. **Quotation/Form.jsx**
   - Create/edit quotation using GeneralizedForm
   - Fields: customer_id, quotation_no, state, quotation_date, expiry_date, description, amount_total
   - Include line items section

3. **SalesOrder/Index.jsx**
   - List all orders with status filter
   - Search by order_no or customer_name
   - Columns: order_no, customer, amount_total, state, commitment_date, actions

4. **SalesOrder/Form.jsx**
   - Create/edit order using GeneralizedForm
   - Fields: customer_id, quotation_id (optional), order_no, state, delivery_date, currency_id
   - Support line items

5. **Invoice/Index.jsx**
   - List all invoices with payment status filter
   - Search by invoice_no
   - Columns: invoice_no, customer, amount_total, payment_status, due_date, actions
   - Add "Post" action for draft invoices

6. **Invoice/Form.jsx**
   - Create/edit invoice
   - Fields: sales_order_id, invoice_no, invoice_date, due_date, description, amount_total
   - Support line items

7. **Payment/Index.jsx**
   - List all payments with customer filter
   - Search by payment_no or customer_name
   - Columns: payment_no, customer, payment_amount, payment_date, method, actions

8. **Payment/Form.jsx** (if needed)
   - Register payment with invoice allocation
   - Support multiple allocation lines

9. **DeliveryOrder/Index.jsx** (Optional)
   - List all delivery orders
   - Filter by sales order

10. **DeliveryOrder/Form.jsx** (Optional)
    - Create/edit delivery order from sales order

---

### Priority 3: Testing (Manual)

Once migrations and pages are done:

```
1. Create a Customer (name: "ABC Corp")
2. Create QUotation for that customer
3. Create Sales Order from that quotation
4. Create Delivery Order from sales order
5. Create Invoice from Delivery Order
6. Register Payment for that invoice
7. Verify all amounts calculate correctly
8. Check that statuses update automatically
```

---

## 📝 Migration Template

Use this template for all migration files:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('sales_TABLENAME', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comp_id')->constrained('companies');
            // ... other columns from Model definition
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void {
        Schema::dropIfExists('sales_TABLENAME');
    }
};
```

---

## 🎨 React Form Template

Use this template for all remaining form pages:

```jsx
import React from 'react';
import { useForm } from '@inertiajs/react';
import GeneralizedForm from '@/Components/GeneralizedForm';
import BaseLayout from '@/Layouts/BaseLayout';

export default function Form({ entity, isCreate = true, initialData = null }) {
    const { data, setData, post, put, errors, processing } = useForm({
        // fields from controller
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isCreate) {
            post(route('sales.entity.store'));
        } else {
            put(route('sales.entity.update', initialData.id));
        }
    };

    const formFields = [
        // Field definitions
    ];

    return (
        <BaseLayout title={isCreate ? 'Create Entity' : 'Edit Entity'}>
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6">
                    {isCreate ? 'Create New Entity' : 'Edit Entity'}
                </h1>
                <GeneralizedForm
                    fields={formFields}
                    onSubmit={handleSubmit}
                    initialData={initialData}
                    isLoading={processing}
                    errors={errors}
                />
            </div>
        </BaseLayout>
    );
}
```

---

## 📋 Remaining Tasks Checklist

- [ ] Create 11 migration files with proper schemas
- [ ] Run `php artisan migrate` and verify tables created
- [ ] Create Quotation/Index.jsx
- [ ] Create Quotation/Form.jsx
- [ ] Create SalesOrder/Index.jsx
- [ ] Create SalesOrder/Form.jsx
- [ ] Create Invoice/Index.jsx
- [ ] Create Invoice/Form.jsx
- [ ] Create Payment/Index.jsx
- [ ] Create Payment/Form.jsx (if needed)
- [ ] Test full O2C workflow
- [ ] Debug any issues with data submission
- [ ] Verify calculations (totals, taxes)
- [ ] Update SALES_MODULE_IMPLEMENTATION.md with completion

---

## 🔗 Reference Files

- **Models:** `app/Models/Sales/` - Check fillable arrays and relationships
- **Controllers:** `app/Http/Controllers/Sales/` - Check store/update validation
- **Completed Example:** `resources/js/Pages/Sales/Customer/` - Use as pattern
- **Routes:** `routes/web.php` lines 570-625 - Verify route names match forms

---

## ⚠️ Common Pitfalls to Avoid

1. **Forgetting foreign key constraints** - Add `->constrained()` after `foreignId()`
2. **Wrong column names** - Copy from Model $fillable array exactly
3. **Missing timestamps** - Always add `$table->timestamps()`
4. **Soft deletes** - Add `$table->softDeletes()` if using `SoftDeletes` trait
5. **Form field names** - Must match database column names exactly
6. **Route names** - Use exact route names from routes/web.php in controller redirects

---

## 📞 Quick Command Reference

```bash
# List all routes
php artisan route:list | grep sales

# Check database structure
php artisan tinker
> Schema::getTableListing()
> Schema::getColumns('sales_customers')

# Reset database (careful!)
php artisan migrate:reset
php artisan migrate

# Make new migration
php artisan make:migration create_sales_TABLENAME_table
```

---

**Estimated time for Phase 2:** 4-6 hours  
**Difficulty:** Medium  
**Blocker:** Migrations MUST be created before testing

Good luck! 🚀
