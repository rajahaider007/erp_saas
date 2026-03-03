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
        Schema::create('inventory_item_classes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('comp_id')->nullable()->index();
            $table->unsignedBigInteger('location_id')->nullable()->index();
            $table->string('class_code', 30);
            $table->string('class_name', 150);
            $table->string('tracking_type', 20)->default('none');
            $table->string('abc_classification', 1)->default('C');
            $table->string('description', 500)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['comp_id', 'location_id', 'class_code'], 'uq_inv_item_cls_code');
            $table->index(['comp_id', 'location_id', 'is_active'], 'idx_inv_item_cls_comp_loc_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_item_classes');
    }
};
