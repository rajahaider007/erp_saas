<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('sales_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comp_id')->constrained('companies');
            $table->foreignId('location_id')->constrained('locations');
            $table->string('sales_order_no')->unique();
            $table->foreignId('customer_id')->constrained('sales_customers');
            $table->foreignId('quotation_id')->nullable()->constrained('sales_quotations');
            $table->enum('state', ['draft', 'confirmed', 'in_delivery', 'delivered', 'invoiced', 'closed'])->default('draft');
            $table->date('order_date');
            $table->date('commitment_date')->nullable(); // delivery deadline
            $table->foreignId('currency_id')->constrained('currencies');
            $table->decimal('exchange_rate', 10, 6)->default(1);
            $table->string('reference_no')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('amount_untaxed', 14, 2)->default(0);
            $table->decimal('amount_tax', 14, 2)->default(0);
            $table->decimal('amount_total', 14, 2)->default(0);
            $table->decimal('amount_total_base', 14, 2)->default(0);
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('comp_id');
            $table->index('sales_order_no');
            $table->index('customer_id');
            $table->index('state');
        });
    }

    public function down(): void {
        Schema::dropIfExists('sales_orders');
    }
};
