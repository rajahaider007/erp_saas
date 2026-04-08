<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            if (! Schema::hasColumn('vendors', 'chart_of_account_id')) {
                $table->foreignId('chart_of_account_id')
                    ->nullable()
                    ->after('company_id')
                    ->constrained('chart_of_accounts')
                    ->nullOnDelete();
            }
        });

        Schema::table('inventory_customers', function (Blueprint $table) {
            if (! Schema::hasColumn('inventory_customers', 'chart_of_account_id')) {
                $table->foreignId('chart_of_account_id')
                    ->nullable()
                    ->after('company_id')
                    ->constrained('chart_of_accounts')
                    ->nullOnDelete();
            }
        });

        Schema::table('inventory_transporters', function (Blueprint $table) {
            if (! Schema::hasColumn('inventory_transporters', 'chart_of_account_id')) {
                $table->foreignId('chart_of_account_id')
                    ->nullable()
                    ->after('company_id')
                    ->constrained('chart_of_accounts')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            if (Schema::hasColumn('vendors', 'chart_of_account_id')) {
                $table->dropConstrainedForeignId('chart_of_account_id');
            }
        });

        Schema::table('inventory_customers', function (Blueprint $table) {
            if (Schema::hasColumn('inventory_customers', 'chart_of_account_id')) {
                $table->dropConstrainedForeignId('chart_of_account_id');
            }
        });

        Schema::table('inventory_transporters', function (Blueprint $table) {
            if (Schema::hasColumn('inventory_transporters', 'chart_of_account_id')) {
                $table->dropConstrainedForeignId('chart_of_account_id');
            }
        });
    }
};
