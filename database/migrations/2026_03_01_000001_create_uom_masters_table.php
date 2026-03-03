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
        Schema::create('uom_masters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            
            $table->string('uom_code', 20);
            $table->string('uom_name', 100);
            $table->string('uom_type', 50); // length, weight, volume, quantity, area, time
            $table->string('symbol', 10)->nullable();
            $table->decimal('conversion_factor', 15, 6)->default(1);
            $table->foreignId('base_uom_id')->nullable()->constrained('uom_masters')->onDelete('set null');
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'uom_code']);
            $table->index(['company_id']);
            $table->index(['uom_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('uom_masters');
    }
};
