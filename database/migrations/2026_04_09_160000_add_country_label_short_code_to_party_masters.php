<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            if (! Schema::hasColumn('vendors', 'short_code')) {
                $table->string('short_code', 30)->nullable()->after('vendor_name');
            }
            if (! Schema::hasColumn('vendors', 'country_label')) {
                $table->string('country_label', 150)->nullable()->after('country_id');
            }
        });

        Schema::table('inventory_customers', function (Blueprint $table) {
            if (! Schema::hasColumn('inventory_customers', 'short_code')) {
                $table->string('short_code', 30)->nullable()->after('customer_name');
            }
            if (! Schema::hasColumn('inventory_customers', 'country_label')) {
                $table->string('country_label', 150)->nullable()->after('country_id');
            }
        });

        Schema::table('inventory_transporters', function (Blueprint $table) {
            if (! Schema::hasColumn('inventory_transporters', 'short_code')) {
                $table->string('short_code', 30)->nullable()->after('transporter_name');
            }
            if (! Schema::hasColumn('inventory_transporters', 'country_label')) {
                $table->string('country_label', 150)->nullable()->after('service_area');
            }
            if (! Schema::hasColumn('inventory_transporters', 'currency_id')) {
                $table->foreignId('currency_id')->nullable()->after('country_label')->constrained('currencies')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('inventory_transporters', function (Blueprint $table) {
            if (Schema::hasColumn('inventory_transporters', 'currency_id')) {
                $table->dropConstrainedForeignId('currency_id');
            }
            if (Schema::hasColumn('inventory_transporters', 'country_label')) {
                $table->dropColumn('country_label');
            }
            if (Schema::hasColumn('inventory_transporters', 'short_code')) {
                $table->dropColumn('short_code');
            }
        });

        Schema::table('inventory_customers', function (Blueprint $table) {
            if (Schema::hasColumn('inventory_customers', 'country_label')) {
                $table->dropColumn('country_label');
            }
            if (Schema::hasColumn('inventory_customers', 'short_code')) {
                $table->dropColumn('short_code');
            }
        });

        Schema::table('vendors', function (Blueprint $table) {
            if (Schema::hasColumn('vendors', 'country_label')) {
                $table->dropColumn('country_label');
            }
            if (Schema::hasColumn('vendors', 'short_code')) {
                $table->dropColumn('short_code');
            }
        });
    }
};
