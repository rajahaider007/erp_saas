<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('purchase_orders')) {
            return;
        }

        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('comp_id')->index();
            $table->unsignedBigInteger('location_id')->index();
            $table->string('po_number', 40);
            $table->foreignId('purchase_requisition_id')->nullable()->constrained('purchase_requisitions')->nullOnDelete();
            $table->foreignId('vendor_id')->constrained('chart_of_accounts')->restrictOnDelete();
            $table->string('po_type', 20)->default('standard');
            $table->boolean('is_blanket')->default(false);
            $table->string('vendor_reference', 120)->nullable();
            $table->date('po_date');
            $table->date('expected_delivery_date')->nullable();
            $table->foreignId('ship_to_location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->text('delivery_address')->nullable();
            $table->foreignId('currency_id')->nullable()->constrained('currencies')->nullOnDelete();
            $table->decimal('fx_rate', 18, 6)->nullable();
            $table->string('incoterms', 16)->nullable();
            $table->string('incoterms_location', 120)->nullable();
            $table->string('payment_terms', 120)->nullable();
            $table->decimal('advance_payment_percent', 8, 4)->nullable();
            $table->boolean('tax_inclusive')->default(false);
            $table->decimal('header_discount_percent', 8, 4)->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 32)->default('draft');
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('tbl_users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('tbl_users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('tbl_users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['comp_id', 'location_id', 'po_number'], 'purchase_orders_number_unique');
        });

        Schema::create('purchase_order_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained('purchase_orders')->cascadeOnDelete();
            $table->unsignedSmallInteger('line_no');
            $table->foreignId('purchase_requisition_line_id')->nullable()->constrained('purchase_requisition_lines')->nullOnDelete();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->restrictOnDelete();
            $table->string('item_description', 500)->nullable();
            $table->foreignId('uom_id')->constrained('uom_masters')->restrictOnDelete();
            $table->decimal('ordered_qty', 18, 6);
            $table->decimal('unit_price', 18, 6);
            $table->decimal('line_discount_percent', 8, 4)->nullable();
            $table->foreignId('tax_category_id')->nullable()->constrained('tax_categories')->nullOnDelete();
            $table->date('expected_line_delivery_date')->nullable();
            $table->foreignId('receive_location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('line_notes', 500)->nullable();
            $table->decimal('received_qty', 18, 6)->default(0);
            $table->string('line_status', 24)->default('open');
            $table->timestamps();

            $table->unique(['purchase_order_id', 'line_no'], 'po_lines_doc_line_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_order_lines');
        Schema::dropIfExists('purchase_orders');
    }
};
