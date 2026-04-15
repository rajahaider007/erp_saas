<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('sales_quotation_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_id')->constrained('sales_quotations')->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained('inventory_items');
            $table->string('product_name');
            $table->string('product_code')->nullable();
            $table->decimal('quantity', 10, 4)->default(0);
            $table->string('unit_of_measure')->nullable();
            $table->decimal('unit_price', 12, 4)->default(0);
            $table->decimal('discount_type', 5, 2)->default(0); // percentage
            $table->decimal('discount_amount', 12, 4)->default(0);
            $table->decimal('line_amount_untaxed', 14, 4)->default(0);
            $table->decimal('tax_amount', 14, 4)->default(0);
            $table->decimal('line_amount_total', 14, 4)->default(0);
            $table->integer('line_sequence')->default(1);
            $table->timestamps();
            
            $table->index('quotation_id');
            $table->index('product_id');
        });
    }

    public function down(): void {
        Schema::dropIfExists('sales_quotation_lines');
    }
};
