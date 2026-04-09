<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('inventory_document_number_configurations')) {
            return;
        }

        Schema::create('inventory_document_number_configurations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('comp_id');
            $table->unsignedBigInteger('location_id');
            $table->string('document_type', 80);
            $table->string('prefix', 20);
            $table->unsignedInteger('running_number')->default(1);
            $table->unsignedTinyInteger('number_length')->default(6);
            $table->enum('reset_frequency', ['Monthly', 'Yearly', 'Never'])->default('Yearly');
            $table->date('last_reset_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->unique(['comp_id', 'location_id', 'document_type'], 'inv_doc_num_config_comp_loc_type_uq');
            $table->index(['comp_id', 'location_id'], 'inv_doc_num_config_comp_loc_idx');
            $table->index('is_active', 'inv_doc_num_config_active_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_document_number_configurations');
    }
};
