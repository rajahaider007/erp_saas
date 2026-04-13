<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Persisted quantity ledger rows (Phase 3 start — see docs/INVENTORY_REPORTING_STANDARDS.md).
     * First source: GRN purchase invoice posting (accepted qty at document unit cost).
     */
    public function up(): void
    {
        if (Schema::hasTable('inventory_transactions')) {
            return;
        }

        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('comp_id');
            $table->unsignedBigInteger('location_id');
            $table->string('source_type', 64)->default('grn_purchase_invoice_post');
            $table->unsignedBigInteger('goods_receipt_note_id');
            $table->unsignedBigInteger('goods_receipt_note_line_id');
            $table->unsignedBigInteger('inventory_item_id');
            $table->decimal('quantity_delta', 18, 6);
            $table->unsignedBigInteger('uom_id')->nullable();
            $table->decimal('unit_cost', 18, 6)->nullable();
            $table->decimal('line_value_foreign', 18, 2)->default(0);
            $table->string('document_currency_code', 8);
            $table->unsignedBigInteger('posted_transaction_id');
            $table->date('voucher_date');
            $table->dateTime('movement_at');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->unique(
                ['posted_transaction_id', 'goods_receipt_note_line_id'],
                'inv_tx_posted_grn_line_unique'
            );
            $table->index(['comp_id', 'location_id', 'voucher_date'], 'inv_tx_comp_loc_voucher_idx');
            $table->index(['comp_id', 'location_id', 'inventory_item_id'], 'inv_tx_comp_loc_item_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
    }
};
