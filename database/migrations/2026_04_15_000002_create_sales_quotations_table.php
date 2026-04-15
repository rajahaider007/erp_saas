<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('sales_quotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comp_id')->constrained('companies');
            $table->foreignId('location_id')->constrained('locations');
            $table->string('quotation_no')->unique();
            $table->foreignId('customer_id')->constrained('sales_customers');
            $table->enum('state', ['draft', 'sent', 'confirmed', 'cancelled', 'expired'])->default('draft');
            $table->date('quotation_date');
            $table->date('expiry_date')->nullable();
            $table->foreignId('currency_id')->constrained('currencies');
            $table->decimal('exchange_rate', 10, 6)->default(1);
            $table->text('description')->nullable();
            $table->decimal('amount_untaxed', 14, 2)->default(0);
            $table->decimal('amount_tax', 14, 2)->default(0);
            $table->decimal('amount_total', 14, 2)->default(0);
            $table->decimal('amount_total_base', 14, 2)->default(0);
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('comp_id');
            $table->index('quotation_no');
            $table->index('customer_id');
            $table->index('state');
        });
    }

    public function down(): void {
        Schema::dropIfExists('sales_quotations');
    }
};
