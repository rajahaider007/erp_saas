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
        Schema::create('inventory_item_categories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('comp_id')->nullable()->index();
            $table->unsignedBigInteger('location_id')->nullable()->index();
            $table->string('category_code', 30);
            $table->string('category_name', 150);
            $table->string('inventory_type', 50)->default('trading_goods');
            $table->string('valuation_method', 30)->default('weighted_average');
            $table->string('description', 500)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['comp_id', 'location_id', 'category_code'], 'uq_inv_item_cat_code');
            $table->index(['comp_id', 'location_id', 'is_active'], 'idx_inv_item_cat_comp_loc_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_item_categories');
    }
};
