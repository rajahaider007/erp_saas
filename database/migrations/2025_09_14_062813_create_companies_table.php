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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            
            // Company Basic Information
            $table->string('company_name');
            $table->string('company_code')->unique();
            $table->string('legal_name')->nullable();
            $table->string('trading_name')->nullable();
            
            // Registration Details
            $table->string('registration_number')->unique();
            $table->string('tax_id')->unique()->nullable();
            $table->string('vat_number')->nullable();
            $table->date('incorporation_date')->nullable();
            $table->string('company_type')->default('private_limited'); // private_limited, public_limited, partnership, sole_proprietorship, llc
            
            // Contact Information
            $table->string('email')->unique();
            $table->string('phone', 20)->nullable();
            $table->string('fax', 20)->nullable();
            $table->string('website')->nullable();
            
            // Address Information
            $table->text('address_line_1');
            $table->text('address_line_2')->nullable();
            $table->string('city', 100);
            $table->string('state_province', 100)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->string('country', 100);
            $table->string('timezone', 50)->default('UTC');
            
            // Business Information
            $table->string('industry')->nullable();
            $table->text('business_description')->nullable();
            $table->integer('employee_count')->nullable();
            $table->decimal('annual_revenue', 15, 2)->nullable();
            $table->string('currency', 10)->default('USD');
            $table->string('fiscal_year_start', 10)->default('01-01'); // MM-DD format
            
            // Legal and Compliance
            $table->string('license_number')->nullable();
            $table->date('license_expiry')->nullable();
            $table->json('compliance_certifications')->nullable();
            $table->text('legal_notes')->nullable();
            
            // Financial Information
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_routing_number')->nullable();
            $table->string('swift_code')->nullable();
            $table->string('iban')->nullable();
            
            // Company Branding
            $table->string('logo')->nullable();
            $table->string('brand_color_primary', 7)->default('#3B82F6');
            $table->string('brand_color_secondary', 7)->default('#64748B');
            
            // System Settings
            $table->boolean('status')->default(true);
            $table->enum('subscription_status', ['active', 'trial', 'expired', 'suspended'])->default('trial');
            $table->date('subscription_expiry')->nullable();
            $table->json('settings')->nullable(); // Company-specific settings
            $table->json('features')->nullable(); // Enabled features/modules
            
            // Audit and Tracking
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for better performance
            $table->index(['status', 'subscription_status']);
            $table->index(['country', 'state_province']);
            $table->index(['industry', 'status']);
            $table->index('created_at');
            $table->index('subscription_expiry');
            
            // Foreign key constraints
            $table->foreign('created_by')->references('id')->on('tbl_users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('tbl_users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};