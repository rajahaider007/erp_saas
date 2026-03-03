<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_warehouses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('warehouse_code', 30);
            $table->string('warehouse_name', 150);
            $table->string('address')->nullable();
            $table->string('warehouse_type', 40)->default('main');
            $table->string('storage_temperature_class', 50)->nullable();
            $table->decimal('capacity', 18, 3)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id']);
            $table->unique(['company_id', 'warehouse_code', 'deleted_at'], 'warehouses_unique_active');
        });

        Schema::create('inventory_zone_bins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('warehouse_id')->constrained('inventory_warehouses')->onDelete('cascade');
            $table->string('zone_code', 30);
            $table->string('zone_name', 120);
            $table->string('aisle', 40)->nullable();
            $table->string('bin_code', 40);
            $table->decimal('bin_capacity', 18, 3)->nullable();
            $table->string('temperature_class', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['company_id']);
            $table->unique(['company_id', 'warehouse_id', 'bin_code', 'deleted_at'], 'zone_bins_unique_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_zone_bins');
        Schema::dropIfExists('inventory_warehouses');
    }
};
