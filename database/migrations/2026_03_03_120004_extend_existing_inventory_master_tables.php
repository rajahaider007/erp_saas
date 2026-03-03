<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('uom_masters', function (Blueprint $table) {
            $table->boolean('is_base_uom')->default(false)->after('symbol');
            $table->unsignedTinyInteger('decimal_precision')->default(2)->after('is_base_uom');
        });

        Schema::table('tax_categories', function (Blueprint $table) {
            $table->foreignId('gl_account_id')->nullable()->after('tax_rate')->constrained('chart_of_accounts')->nullOnDelete();
            $table->string('country_region', 100)->nullable()->after('applicable_for');
        });

        Schema::table('countries', function (Blueprint $table) {
            $table->foreignId('currency_id')->nullable()->after('country_name')->constrained('currencies')->nullOnDelete();
            $table->string('tax_system', 50)->nullable()->after('iso_numeric_code');
            $table->text('customs_rules')->nullable()->after('sub_region');
        });

        Schema::table('vendors', function (Blueprint $table) {
            $table->string('payment_terms', 100)->nullable()->after('address');
            $table->foreignId('currency_id')->nullable()->after('country_id')->constrained('currencies')->nullOnDelete();
            $table->string('tax_registration_number', 100)->nullable()->after('tax_id');
            $table->text('bank_details')->nullable()->after('tax_registration_number');
            $table->decimal('credit_limit', 18, 2)->nullable()->after('bank_details');
            $table->enum('vendor_type', ['local', 'import'])->default('local')->after('credit_limit');
        });
    }

    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->dropConstrainedForeignId('currency_id');
            $table->dropColumn(['payment_terms', 'tax_registration_number', 'bank_details', 'credit_limit', 'vendor_type']);
        });

        Schema::table('countries', function (Blueprint $table) {
            $table->dropConstrainedForeignId('currency_id');
            $table->dropColumn(['tax_system', 'customs_rules']);
        });

        Schema::table('tax_categories', function (Blueprint $table) {
            $table->dropConstrainedForeignId('gl_account_id');
            $table->dropColumn(['country_region']);
        });

        Schema::table('uom_masters', function (Blueprint $table) {
            $table->dropColumn(['is_base_uom', 'decimal_precision']);
        });
    }
};
