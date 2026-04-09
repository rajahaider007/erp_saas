<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('purchase_requisitions')) {
            return;
        }

        Schema::create('purchase_requisitions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('comp_id')->index();
            $table->unsignedBigInteger('location_id')->index();
            $table->string('pr_number', 40);
            $table->date('pr_date');
            $table->date('required_by_date')->nullable();
            $table->foreignId('deliver_to_location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->text('delivery_address')->nullable();
            $table->foreignId('currency_id')->nullable()->constrained('currencies')->nullOnDelete();
            $table->decimal('fx_rate', 18, 6)->nullable();
            $table->string('priority', 20)->default('normal');
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->string('requested_by', 120)->nullable();
            $table->text('justification')->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 32)->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('tbl_users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('tbl_users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['comp_id', 'location_id', 'pr_number'], 'purchase_requisitions_number_unique');
        });

        Schema::create('purchase_requisition_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_requisition_id')->constrained('purchase_requisitions')->cascadeOnDelete();
            $table->unsignedSmallInteger('line_no');
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->restrictOnDelete();
            $table->string('item_description', 500)->nullable();
            $table->foreignId('uom_id')->constrained('uom_masters')->restrictOnDelete();
            $table->decimal('quantity', 18, 6);
            $table->decimal('estimated_unit_price', 18, 6)->nullable();
            $table->date('need_by_date')->nullable();
            $table->string('line_notes', 500)->nullable();
            $table->timestamps();

            $table->unique(['purchase_requisition_id', 'line_no'], 'pr_lines_doc_line_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_requisition_lines');
        Schema::dropIfExists('purchase_requisitions');
    }
};
