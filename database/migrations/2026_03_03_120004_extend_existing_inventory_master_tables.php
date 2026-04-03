<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('uom_masters', 'is_base_uom')) {
            Schema::table('uom_masters', function (Blueprint $table) {
                $table->boolean('is_base_uom')->default(false)->after('symbol');
            });
        }

        if (! Schema::hasColumn('uom_masters', 'decimal_precision')) {
            Schema::table('uom_masters', function (Blueprint $table) {
                $after = Schema::hasColumn('uom_masters', 'is_base_uom') ? 'is_base_uom' : 'symbol';
                $table->unsignedTinyInteger('decimal_precision')->default(2)->after($after);
            });
        }

        Schema::table('tax_categories', function (Blueprint $table) {
            if (! Schema::hasColumn('tax_categories', 'gl_account_id')) {
                $table->foreignId('gl_account_id')->nullable()->after('tax_rate')->constrained('chart_of_accounts')->nullOnDelete();
            }
            if (! Schema::hasColumn('tax_categories', 'country_region')) {
                $table->string('country_region', 100)->nullable()->after('applicable_for');
            }
        });

        Schema::table('countries', function (Blueprint $table) {
            if (! Schema::hasColumn('countries', 'currency_id')) {
                $table->foreignId('currency_id')->nullable()->after('country_name')->constrained('currencies')->nullOnDelete();
            }
            if (! Schema::hasColumn('countries', 'tax_system')) {
                $table->string('tax_system', 50)->nullable()->after('iso_numeric_code');
            }
            if (! Schema::hasColumn('countries', 'customs_rules')) {
                $table->text('customs_rules')->nullable()->after('sub_region');
            }
        });

        Schema::table('vendors', function (Blueprint $table) {
            if (! Schema::hasColumn('vendors', 'payment_terms')) {
                $table->string('payment_terms', 100)->nullable()->after('address');
            }
            if (! Schema::hasColumn('vendors', 'currency_id')) {
                $table->foreignId('currency_id')->nullable()->after('country_id')->constrained('currencies')->nullOnDelete();
            }
            if (! Schema::hasColumn('vendors', 'tax_registration_number')) {
                $table->string('tax_registration_number', 100)->nullable()->after('tax_id');
            }
            if (! Schema::hasColumn('vendors', 'bank_details')) {
                $table->text('bank_details')->nullable()->after('tax_registration_number');
            }
            if (! Schema::hasColumn('vendors', 'credit_limit')) {
                $table->decimal('credit_limit', 18, 2)->nullable()->after('bank_details');
            }
            if (! Schema::hasColumn('vendors', 'vendor_type')) {
                $table->enum('vendor_type', ['local', 'import'])->default('local')->after('credit_limit');
            }
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

        // uom_masters.is_base_uom / decimal_precision are defined in 2026_03_01_000001; do not drop here.
    }
};
