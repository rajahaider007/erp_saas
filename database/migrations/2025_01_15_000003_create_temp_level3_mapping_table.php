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
        Schema::create('temp_level3_mapping', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('old_parent_id');
            $table->unsignedBigInteger('new_parent_id');
            $table->unsignedBigInteger('level4_account_id');
            $table->timestamps();
            
            $table->index(['old_parent_id']);
            $table->index(['new_parent_id']);
            $table->index(['level4_account_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('temp_level3_mapping');
    }
};
