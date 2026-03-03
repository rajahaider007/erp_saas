<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_brands', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('brand_code', 30);
            $table->string('brand_name', 120);
            $table->string('manufacturer', 120)->nullable();
            $table->foreignId('country_id')->nullable()->constrained('countries')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'brand_code', 'deleted_at'], 'brands_unique_active');
        });

        Schema::create('inventory_reason_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('reason_code', 30);
            $table->string('reason_description', 255);
            $table->enum('reason_type', ['adjustment', 'return', 'transfer', 'writeoff']);
            $table->foreignId('default_gl_account_id')->nullable()->constrained('chart_of_accounts')->nullOnDelete();
            $table->boolean('requires_approval')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'reason_code', 'deleted_at'], 'reason_codes_unique_active');
        });

        Schema::create('inventory_temperature_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('class_code', 30);
            $table->string('class_name', 100);
            $table->string('temperature_range', 100)->nullable();
            $table->text('storage_requirements')->nullable();
            $table->string('monitoring_frequency', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'class_code', 'deleted_at'], 'temperature_classes_unique_active');
        });

        Schema::create('inventory_transporters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('transporter_code', 30);
            $table->string('transporter_name', 150);
            $table->string('contact_details', 255)->nullable();
            $table->string('vehicle_types', 255)->nullable();
            $table->string('service_area', 255)->nullable();
            $table->decimal('rating', 3, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'transporter_code', 'deleted_at'], 'transporters_unique_active');
        });

        Schema::create('inventory_customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('customer_code', 30);
            $table->string('customer_name', 150);
            $table->string('contact_details', 255)->nullable();
            $table->decimal('credit_limit', 18, 2)->nullable();
            $table->string('payment_terms', 100)->nullable();
            $table->string('tax_registration', 100)->nullable();
            $table->foreignId('country_id')->nullable()->constrained('countries')->nullOnDelete();
            $table->foreignId('currency_id')->nullable()->constrained('currencies')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'customer_code', 'deleted_at'], 'customers_unique_active');
        });

        Schema::create('inventory_package_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('package_code', 30);
            $table->string('package_name', 120);
            $table->string('dimensions', 120)->nullable();
            $table->decimal('weight_capacity', 18, 3)->nullable();
            $table->decimal('volume_capacity', 18, 3)->nullable();
            $table->string('nesting_rule', 120)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'package_code', 'deleted_at'], 'package_types_unique_active');
        });

        Schema::create('inventory_barcode_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('barcode_type', 30);
            $table->string('format_pattern', 120)->nullable();
            $table->unsignedInteger('length')->nullable();
            $table->string('validation_rule', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['company_id', 'barcode_type', 'deleted_at'], 'barcode_types_unique_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_barcode_types');
        Schema::dropIfExists('inventory_package_types');
        Schema::dropIfExists('inventory_customers');
        Schema::dropIfExists('inventory_transporters');
        Schema::dropIfExists('inventory_temperature_classes');
        Schema::dropIfExists('inventory_reason_codes');
        Schema::dropIfExists('inventory_brands');
    }
};
