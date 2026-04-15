<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('sales_delivery_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_id')->constrained('sales_deliveries')->onDelete('cascade');
            $table->foreignId('order_line_id')->constrained('sales_order_lines');
            $table->foreignId('product_id')->nullable()->constrained('inventory_items');
            $table->string('product_name');
            $table->string('product_code')->nullable();
            $table->decimal('quantity', 10, 4)->default(0);
            $table->string('unit_of_measure')->nullable();
            $table->string('lot_no')->nullable();
            $table->string('serial_no')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('location_code')->nullable();
            $table->integer('line_sequence')->default(1);
            $table->timestamps();
            
            $table->index('delivery_id');
            $table->index('order_line_id');
            $table->index('product_id');
        });
    }

    public function down(): void {
        Schema::dropIfExists('sales_delivery_lines');
    }
};
