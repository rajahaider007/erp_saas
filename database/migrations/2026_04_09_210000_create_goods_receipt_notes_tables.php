<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('goods_receipt_notes')) {
            return;
        }

        Schema::create('goods_receipt_notes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('comp_id')->index();
            $table->unsignedBigInteger('location_id')->index();
            $table->string('grn_number', 40);
            $table->foreignId('purchase_order_id')->constrained('purchase_orders')->restrictOnDelete();
            $table->foreignId('vendor_id')->constrained('chart_of_accounts')->restrictOnDelete();
            $table->string('grn_type', 24)->default('standard');
            $table->date('receipt_date');
            $table->date('posting_date')->nullable();
            $table->foreignId('receive_location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('vehicle_number', 80)->nullable();
            $table->string('transporter_name', 160)->nullable();
            $table->string('driver_contact', 160)->nullable();
            $table->string('seal_number', 80)->nullable();
            $table->string('container_number', 80)->nullable();
            $table->string('bol_awb', 120)->nullable();
            $table->string('packing_list_ref', 120)->nullable();
            $table->string('vendor_delivery_note_no', 120)->nullable();
            $table->foreignId('currency_id')->nullable()->constrained('currencies')->nullOnDelete();
            $table->decimal('fx_rate', 18, 6)->nullable();
            $table->string('overall_qc_status', 24)->default('pending');
            $table->boolean('landed_cost_applies')->default(false);
            $table->string('landed_cost_reference', 120)->nullable();
            $table->string('three_way_match_status', 24)->default('pending');
            $table->text('notes')->nullable();
            $table->string('status', 32)->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('tbl_users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('tbl_users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['comp_id', 'location_id', 'grn_number'], 'goods_receipt_notes_number_unique');
        });

        Schema::create('goods_receipt_note_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goods_receipt_note_id')->constrained('goods_receipt_notes')->cascadeOnDelete();
            $table->unsignedSmallInteger('line_no');
            $table->foreignId('purchase_order_line_id')->constrained('purchase_order_lines')->restrictOnDelete();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->restrictOnDelete();
            $table->string('item_description', 500)->nullable();
            $table->foreignId('uom_id')->constrained('uom_masters')->restrictOnDelete();
            $table->decimal('po_ordered_qty', 18, 6);
            $table->decimal('snapshot_previously_received_qty', 18, 6)->default(0);
            $table->decimal('receipt_qty', 18, 6);
            $table->decimal('unit_cost', 18, 6);
            $table->decimal('accepted_qty', 18, 6)->nullable();
            $table->decimal('rejected_qty', 18, 6)->nullable();
            $table->string('rejection_reason', 120)->nullable();
            $table->string('qc_line_status', 24)->default('passed');
            $table->string('lot_batch_no', 120)->nullable();
            $table->date('manufacturing_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->decimal('temperature_at_receipt', 10, 4)->nullable();
            $table->foreignId('put_away_location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('line_notes', 500)->nullable();
            $table->timestamps();

            $table->unique(['goods_receipt_note_id', 'line_no'], 'grn_lines_doc_line_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goods_receipt_note_lines');
        Schema::dropIfExists('goods_receipt_notes');
    }
};
