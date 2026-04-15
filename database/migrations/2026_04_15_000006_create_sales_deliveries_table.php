<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('sales_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comp_id')->constrained('companies');
            $table->foreignId('location_id')->constrained('locations');
            $table->string('delivery_no')->unique();
            $table->foreignId('sales_order_id')->constrained('sales_orders');
            $table->foreignId('customer_id')->constrained('sales_customers');
            $table->enum('state', ['draft', 'assigned', 'in_transit', 'delivered', 'cancelled'])->default('draft');
            $table->date('delivery_date')->nullable();
            $table->enum('delivery_method', ['standard', 'express', 'pickup', 'custom'])->default('standard');
            $table->string('carrier')->nullable();
            $table->string('tracking_no')->nullable();
            $table->decimal('weight', 10, 2)->nullable(); // kg
            $table->decimal('volume', 10, 2)->nullable(); // cbm
            $table->text('delivery_address')->nullable();
            $table->string('receiver_name')->nullable();
            $table->string('receiver_phone')->nullable();
            $table->text('remarks')->nullable();
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('comp_id');
            $table->index('delivery_no');
            $table->index('sales_order_id');
            $table->index('state');
        });
    }

    public function down(): void {
        Schema::dropIfExists('sales_deliveries');
    }
};
