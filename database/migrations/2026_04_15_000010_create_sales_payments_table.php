<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('sales_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comp_id')->constrained('companies');
            $table->foreignId('location_id')->constrained('locations');
            $table->string('payment_no')->unique();
            $table->foreignId('customer_id')->constrained('sales_customers');
            $table->enum('payment_method', ['bank_transfer', 'cheque', 'cash', 'online', 'credit_card', 'other'])->default('bank_transfer');
            $table->date('payment_date');
            $table->foreignId('currency_id')->constrained('currencies');
            $table->decimal('exchange_rate', 10, 6)->default(1);
            $table->decimal('payment_amount', 14, 2)->default(0);
            $table->decimal('payment_amount_base', 14, 2)->default(0);
            $table->string('reference_no')->nullable(); // cheque no, bank transfer ref
            $table->string('payment_account')->nullable();
            $table->text('remarks')->nullable();
            $table->boolean('is_advance_payment')->default(false);
            $table->boolean('is_reconciled')->default(false);
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('comp_id');
            $table->index('payment_no');
            $table->index('customer_id');
            $table->index('payment_date');
            $table->index('is_reconciled');
        });
    }

    public function down(): void {
        Schema::dropIfExists('sales_payments');
    }
};
