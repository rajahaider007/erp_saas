<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE tax_categories MODIFY tax_type ENUM('gst','vat','sales_tax','excise','custom','customs_duty','withholding_tax','other') NOT NULL");

            DB::table('tax_categories')
                ->whereRaw('LOWER(TRIM(tax_type)) = ?', ['custom'])
                ->update(['tax_type' => 'customs_duty']);

            DB::table('tax_categories')
                ->whereRaw('LOWER(TRIM(tax_type)) = ?', ['custom duty'])
                ->update(['tax_type' => 'customs_duty']);

            DB::table('tax_categories')
                ->whereRaw('LOWER(TRIM(tax_type)) = ?', ['withholding'])
                ->update(['tax_type' => 'withholding_tax']);

            DB::table('tax_categories')
                ->whereRaw('LOWER(TRIM(tax_type)) = ?', ['sales tax'])
                ->update(['tax_type' => 'sales_tax']);

            DB::table('tax_categories')
                ->whereRaw('LOWER(TRIM(tax_type)) NOT IN (?, ?, ?, ?, ?, ?, ?)', ['gst', 'vat', 'sales_tax', 'customs_duty', 'withholding_tax', 'excise', 'other'])
                ->update(['tax_type' => 'other']);

            DB::statement("ALTER TABLE tax_categories MODIFY tax_type ENUM('gst','vat','sales_tax','customs_duty','withholding_tax','excise','other') NOT NULL");
            DB::statement('ALTER TABLE tax_categories MODIFY tax_rate DECIMAL(8,4) NOT NULL');
        }

        Schema::table('tax_categories', function (Blueprint $table) {
            if (!Schema::hasColumn('tax_categories', 'tax_calculation_method')) {
                $table->string('tax_calculation_method', 50)->default('percentage_net')->after('tax_rate');
            }
            if (!Schema::hasColumn('tax_categories', 'is_compound_tax')) {
                $table->boolean('is_compound_tax')->default(false)->after('tax_calculation_method');
            }
            if (!Schema::hasColumn('tax_categories', 'compound_base_tax_category_id')) {
                $table->foreignId('compound_base_tax_category_id')->nullable()->after('is_compound_tax')->constrained('tax_categories')->nullOnDelete();
            }
            if (!Schema::hasColumn('tax_categories', 'tax_category_group')) {
                $table->enum('tax_category_group', ['input_tax', 'output_tax', 'both'])->default('both')->after('compound_base_tax_category_id');
            }
            if (!Schema::hasColumn('tax_categories', 'input_tax_gl_account_id')) {
                $table->foreignId('input_tax_gl_account_id')->nullable()->after('applicable_for')->constrained('chart_of_accounts')->nullOnDelete();
            }
            if (!Schema::hasColumn('tax_categories', 'output_tax_gl_account_id')) {
                $table->foreignId('output_tax_gl_account_id')->nullable()->after('input_tax_gl_account_id')->constrained('chart_of_accounts')->nullOnDelete();
            }
            if (!Schema::hasColumn('tax_categories', 'tax_payable_gl_account_id')) {
                $table->foreignId('tax_payable_gl_account_id')->nullable()->after('output_tax_gl_account_id')->constrained('chart_of_accounts')->nullOnDelete();
            }
            if (!Schema::hasColumn('tax_categories', 'country_id')) {
                $table->foreignId('country_id')->nullable()->after('tax_payable_gl_account_id')->constrained('countries')->nullOnDelete();
            }
            if (!Schema::hasColumn('tax_categories', 'hsn_sac_required')) {
                $table->boolean('hsn_sac_required')->default(false)->after('country_id');
            }
            if (!Schema::hasColumn('tax_categories', 'e_invoice_required')) {
                $table->boolean('e_invoice_required')->default(false)->after('hsn_sac_required');
            }
            if (!Schema::hasColumn('tax_categories', 'reverse_charge_applicable')) {
                $table->boolean('reverse_charge_applicable')->default(false)->after('e_invoice_required');
            }
            if (!Schema::hasColumn('tax_categories', 'reverse_charge_gl_account_id')) {
                $table->foreignId('reverse_charge_gl_account_id')->nullable()->after('reverse_charge_applicable')->constrained('chart_of_accounts')->nullOnDelete();
            }
            if (!Schema::hasColumn('tax_categories', 'input_tax_claimable')) {
                $table->boolean('input_tax_claimable')->default(true)->after('reverse_charge_gl_account_id');
            }
            if (!Schema::hasColumn('tax_categories', 'exemption_certificate_required')) {
                $table->boolean('exemption_certificate_required')->default(false)->after('input_tax_claimable');
            }
            if (!Schema::hasColumn('tax_categories', 'effective_from_date')) {
                $table->date('effective_from_date')->nullable()->after('exemption_certificate_required');
            }
            if (!Schema::hasColumn('tax_categories', 'effective_to_date')) {
                $table->date('effective_to_date')->nullable()->after('effective_from_date');
            }
            if (!Schema::hasColumn('tax_categories', 'created_by')) {
                $table->foreignId('created_by')->nullable()->after('is_active')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('tax_categories', 'updated_by')) {
                $table->foreignId('updated_by')->nullable()->after('created_by')->constrained('users')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        DB::table('tax_categories')
            ->where('tax_type', 'customs_duty')
            ->update(['tax_type' => 'custom']);

        DB::table('tax_categories')
            ->where('tax_type', 'withholding_tax')
            ->update(['tax_type' => 'gst']);

        DB::table('tax_categories')
            ->where('tax_type', 'other')
            ->update(['tax_type' => 'gst']);

        Schema::table('tax_categories', function (Blueprint $table) {
            if (Schema::hasColumn('tax_categories', 'updated_by')) {
                $table->dropConstrainedForeignId('updated_by');
            }
            if (Schema::hasColumn('tax_categories', 'created_by')) {
                $table->dropConstrainedForeignId('created_by');
            }
            if (Schema::hasColumn('tax_categories', 'effective_to_date')) {
                $table->dropColumn('effective_to_date');
            }
            if (Schema::hasColumn('tax_categories', 'effective_from_date')) {
                $table->dropColumn('effective_from_date');
            }
            if (Schema::hasColumn('tax_categories', 'exemption_certificate_required')) {
                $table->dropColumn('exemption_certificate_required');
            }
            if (Schema::hasColumn('tax_categories', 'input_tax_claimable')) {
                $table->dropColumn('input_tax_claimable');
            }
            if (Schema::hasColumn('tax_categories', 'reverse_charge_gl_account_id')) {
                $table->dropConstrainedForeignId('reverse_charge_gl_account_id');
            }
            if (Schema::hasColumn('tax_categories', 'reverse_charge_applicable')) {
                $table->dropColumn('reverse_charge_applicable');
            }
            if (Schema::hasColumn('tax_categories', 'e_invoice_required')) {
                $table->dropColumn('e_invoice_required');
            }
            if (Schema::hasColumn('tax_categories', 'hsn_sac_required')) {
                $table->dropColumn('hsn_sac_required');
            }
            if (Schema::hasColumn('tax_categories', 'country_id')) {
                $table->dropConstrainedForeignId('country_id');
            }
            if (Schema::hasColumn('tax_categories', 'tax_payable_gl_account_id')) {
                $table->dropConstrainedForeignId('tax_payable_gl_account_id');
            }
            if (Schema::hasColumn('tax_categories', 'output_tax_gl_account_id')) {
                $table->dropConstrainedForeignId('output_tax_gl_account_id');
            }
            if (Schema::hasColumn('tax_categories', 'input_tax_gl_account_id')) {
                $table->dropConstrainedForeignId('input_tax_gl_account_id');
            }
            if (Schema::hasColumn('tax_categories', 'tax_category_group')) {
                $table->dropColumn('tax_category_group');
            }
            if (Schema::hasColumn('tax_categories', 'compound_base_tax_category_id')) {
                $table->dropConstrainedForeignId('compound_base_tax_category_id');
            }
            if (Schema::hasColumn('tax_categories', 'is_compound_tax')) {
                $table->dropColumn('is_compound_tax');
            }
            if (Schema::hasColumn('tax_categories', 'tax_calculation_method')) {
                $table->dropColumn('tax_calculation_method');
            }
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE tax_categories MODIFY tax_type ENUM('vat','gst','sales_tax','excise','custom') NOT NULL");
            DB::statement('ALTER TABLE tax_categories MODIFY tax_rate DECIMAL(5,2) NOT NULL');
        }
    }
};
