<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('inventory_items')) {
            return; // Table already exists, skip migration
        }
        
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();

            // Company & Location
            $table->unsignedBigInteger('comp_id')->nullable()->index();
            $table->unsignedBigInteger('location_id')->nullable()->index();

            // Section A: Header Fields
            $table->string('item_code', 50)->unique();
            $table->string('item_name_short', 50);
            $table->string('item_name_long', 250)->nullable();
            $table->enum('item_status', ['active', 'inactive', 'discontinued', 'blocked'])->default('active');
            $table->enum('item_type', ['raw_material', 'finished_good', 'trading', 'consumable', 'service']);
            $table->foreignId('item_class_id')->nullable()->constrained('inventory_item_classes')->onDelete('restrict');
            $table->foreignId('item_category_id')->nullable()->constrained('inventory_item_categories')->onDelete('restrict');
            $table->foreignId('item_group_id')->nullable()->constrained('inventory_item_groups')->onDelete('restrict');
            $table->string('brand', 100)->nullable();
            $table->string('item_image_path')->nullable();

            // Section B: Tracking & UOM Configuration
            $table->enum('tracking_mode', ['none', 'lot', 'serial'])->default('none');
            $table->foreignId('stock_uom_id')->nullable()->constrained('uom_masters')->onDelete('restrict');
            $table->foreignId('purchase_uom_id')->nullable()->constrained('uom_masters')->onDelete('restrict');
            $table->foreignId('sales_uom_id')->nullable()->constrained('uom_masters')->onDelete('restrict');

            // Section C: Costing & Procurement
            $table->enum('costing_method', ['fifo', 'weighted_avg', 'standard_cost', 'lifo'])->default('fifo');
            $table->decimal('standard_cost', 15, 2)->nullable();
            $table->decimal('last_purchase_price', 15, 2)->nullable();
            $table->decimal('minimum_order_qty', 15, 4)->nullable();
            $table->decimal('reorder_point', 15, 4)->nullable();
            $table->decimal('safety_stock', 15, 4)->nullable();
            $table->decimal('maximum_stock_level', 15, 4)->nullable();
            $table->integer('lead_time_days')->nullable();
            $table->foreignId('default_vendor_id')->nullable()->constrained('vendors')->onDelete('set null');

            // Section D: Expiry & Storage
            $table->boolean('expiry_tracking')->default(false);
            $table->integer('shelf_life_days')->nullable();
            $table->enum('expiry_basis', ['manufacturing_date', 'receipt_date'])->nullable();
            $table->integer('near_expiry_alert_days')->nullable();
            $table->enum('storage_temperature_class', ['ambient', 'chilled', 'frozen', 'controlled'])->nullable();
            $table->boolean('hazardous_material')->default(false);

            // Section E: Physical Attributes
            $table->decimal('gross_weight_kg', 10, 3)->nullable();
            $table->decimal('net_weight_kg', 10, 3)->nullable();
            $table->decimal('volume_cbm', 10, 3)->nullable();
            $table->string('dimensions', 50)->nullable();

            // Section F: Tax & Trade Compliance
            $table->foreignId('tax_category_id')->nullable()->constrained('tax_categories')->onDelete('restrict');
            $table->string('hsn_code', 20)->nullable();
            $table->string('hs_tariff_code', 10)->nullable();
            $table->foreignId('country_of_origin_id')->nullable()->constrained('countries')->onDelete('set null');
            $table->string('barcode_gtin', 20)->unique()->nullable();

            // Section G: GL Account Mapping (Critical)
            $table->foreignId('inventory_gl_account_id')->nullable()->constrained('chart_of_accounts')->onDelete('restrict');
            $table->foreignId('cogs_gl_account_id')->nullable()->constrained('chart_of_accounts')->onDelete('restrict');
            $table->foreignId('writeoff_gl_account_id')->nullable()->constrained('chart_of_accounts')->onDelete('restrict');
            $table->foreignId('price_variance_gl_account_id')->nullable()->constrained('chart_of_accounts')->onDelete('restrict');

            // Section H: Classification & Analytics
            $table->enum('abc_classification', ['a', 'b', 'c'])->nullable();
            $table->integer('slow_moving_threshold_days')->default(180);

            // General
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by')->nullable()->index();
            $table->unsignedBigInteger('updated_by')->nullable()->index();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['comp_id', 'location_id']);
            $table->index(['item_code']);
            $table->index(['item_status']);
            $table->index(['item_type']);
            $table->index(['costing_method']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
