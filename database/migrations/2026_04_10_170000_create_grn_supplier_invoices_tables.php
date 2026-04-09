<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('grn_supplier_invoices')) {
            Schema::create('grn_supplier_invoices', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('comp_id')->index();
                $table->unsignedBigInteger('location_id')->index();
                $table->string('invoice_number', 40);
                $table->unsignedBigInteger('vendor_id');
                $table->date('voucher_date')->nullable();
                $table->string('reference_number', 100)->nullable();
                $table->date('supplier_invoice_date')->nullable();
                $table->date('due_date')->nullable();
                $table->string('description', 250)->nullable();
                $table->text('notes')->nullable();
                $table->string('status', 24)->default('draft');
                $table->unsignedBigInteger('posted_transaction_id')->nullable()->index();
                $table->unsignedBigInteger('created_by')->nullable();
                $table->unsignedBigInteger('updated_by')->nullable();
                $table->timestamps();

                $table->unique(['comp_id', 'location_id', 'invoice_number'], 'grn_supplier_invoices_number_unique');
            });

            Schema::table('grn_supplier_invoices', function (Blueprint $table) {
                $table->foreign('vendor_id', 'gsi_vendor_fk')->references('id')->on('chart_of_accounts')->restrictOnDelete();
                $table->foreign('created_by', 'gsi_created_fk')->references('id')->on('tbl_users')->nullOnDelete();
                $table->foreign('updated_by', 'gsi_updated_fk')->references('id')->on('tbl_users')->nullOnDelete();
            });
        }

        if (! Schema::hasTable('grn_supplier_invoice_grns')) {
            Schema::create('grn_supplier_invoice_grns', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('grn_supplier_invoice_id');
                $table->unsignedBigInteger('goods_receipt_note_id');
                $table->timestamps();

                $table->unique(
                    ['grn_supplier_invoice_id', 'goods_receipt_note_id'],
                    'grn_si_grn_unique'
                );
            });

            Schema::table('grn_supplier_invoice_grns', function (Blueprint $table) {
                $table->foreign('grn_supplier_invoice_id', 'gsi_grns_inv_fk')
                    ->references('id')->on('grn_supplier_invoices')->cascadeOnDelete();
                $table->foreign('goods_receipt_note_id', 'gsi_grns_grn_fk')
                    ->references('id')->on('goods_receipt_notes')->restrictOnDelete();
            });
        }

        if (! Schema::hasTable('grn_supplier_invoice_line_taxes')) {
            Schema::create('grn_supplier_invoice_line_taxes', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('grn_supplier_invoice_id');
                $table->unsignedBigInteger('goods_receipt_note_line_id');
                $table->decimal('tax_amount', 18, 2)->default(0);
                $table->timestamps();

                $table->unique(
                    ['grn_supplier_invoice_id', 'goods_receipt_note_line_id'],
                    'grn_si_line_tax_unique'
                );
            });

            Schema::table('grn_supplier_invoice_line_taxes', function (Blueprint $table) {
                $table->foreign('grn_supplier_invoice_id', 'gsi_lt_inv_fk')
                    ->references('id')->on('grn_supplier_invoices')->cascadeOnDelete();
                $table->foreign('goods_receipt_note_line_id', 'gsi_lt_line_fk')
                    ->references('id')->on('goods_receipt_note_lines')->restrictOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('grn_supplier_invoice_line_taxes');
        Schema::dropIfExists('grn_supplier_invoice_grns');
        Schema::dropIfExists('grn_supplier_invoices');
    }
};
