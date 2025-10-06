<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateVoucherNumberConfigurationsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('voucher_number_configurations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('comp_id');
            $table->unsignedBigInteger('location_id');
            $table->string('voucher_type', 50);
            $table->string('prefix', 20);
            $table->integer('running_number')->default(1);
            $table->integer('number_length')->default(4);
            $table->enum('reset_frequency', ['Monthly', 'Yearly', 'Never'])->default('Yearly');
            $table->date('last_reset_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by');
            $table->timestamps();

            // Indexes for performance
            $table->index(['comp_id', 'location_id', 'voucher_type'], 'voucher_config_comp_loc_type_idx');
            $table->index('voucher_type', 'voucher_config_type_idx');
            $table->index('is_active', 'voucher_config_active_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('voucher_number_configurations');
    }
}
