<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('sales_payment_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained('sales_payments')->onDelete('cascade');
            $table->foreignId('invoice_id')->constrained('sales_invoices');
            $table->decimal('allocated_amount', 14, 2)->default(0);
            $table->decimal('allocated_amount_base', 14, 2)->default(0);
            $table->decimal('forex_gain_loss', 14, 4)->default(0);
            $table->text('remarks')->nullable();
            $table->timestamps();
            
            $table->index('payment_id');
            $table->index('invoice_id');
            $table->unique(['payment_id', 'invoice_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('sales_payment_allocations');
    }
};
