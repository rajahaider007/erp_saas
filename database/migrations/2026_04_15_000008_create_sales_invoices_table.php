<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('sales_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comp_id')->constrained('companies');
            $table->foreignId('location_id')->constrained('locations');
            $table->string('invoice_no')->unique();
            $table->foreignId('customer_id')->constrained('sales_customers');
            $table->foreignId('sales_order_id')->nullable()->constrained('sales_orders');
            $table->foreignId('delivery_id')->nullable()->constrained('sales_deliveries');
            $table->enum('state', ['draft', 'posted', 'cancelled'])->default('draft');
            $table->enum('payment_status', ['unpaid', 'partial', 'paid'])->default('unpaid');
            $table->date('invoice_date');
            $table->date('due_date')->nullable();
            $table->foreignId('currency_id')->constrained('currencies');
            $table->decimal('exchange_rate', 10, 6)->default(1);
            $table->text('terms_and_conditions')->nullable();
            $table->decimal('amount_untaxed', 14, 2)->default(0);
            $table->decimal('amount_tax', 14, 2)->default(0);
            $table->decimal('amount_total', 14, 2)->default(0);
            $table->decimal('amount_total_base', 14, 2)->default(0);
            $table->decimal('paid_amount', 14, 2)->default(0);
            $table->decimal('outstanding_amount', 14, 2)->default(0);
            $table->timestamp('posted_at')->nullable();
            $table->string('posted_by')->nullable();
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('comp_id');
            $table->index('invoice_no');
            $table->index('customer_id');
            $table->index('state');
            $table->index('payment_status');
        });
    }

    public function down(): void {
        Schema::dropIfExists('sales_invoices');
    }
};
