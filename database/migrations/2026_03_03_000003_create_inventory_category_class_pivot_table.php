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
        Schema::create('inventory_category_class', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id')->index();
            $table->unsignedBigInteger('class_id')->index();
            $table->timestamps();

            $table->unique(['category_id', 'class_id'], 'uq_inv_cat_cls');
            
            $table->foreign('category_id', 'fk_inv_cat_cls_category')
                ->references('id')
                ->on('inventory_item_categories')
                ->onDelete('cascade');
                
            $table->foreign('class_id', 'fk_inv_cat_cls_class')
                ->references('id')
                ->on('inventory_item_classes')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_category_class');
    }
};
