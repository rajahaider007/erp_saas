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
        Schema::create('package_modules', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('package_id');
            $table->unsignedBigInteger('module_id');
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();
            
            $table->unique(['package_id', 'module_id']);
            $table->index(['package_id', 'is_enabled']);
            $table->index(['module_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('package_modules');
    }
};
