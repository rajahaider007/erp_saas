<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            if (! Schema::hasColumn('inventory_items', 'purchase_gl_account_id')) {
                $table->foreignId('purchase_gl_account_id')
                    ->nullable()
                    ->after('inventory_gl_account_id')
                    ->constrained('chart_of_accounts')
                    ->nullOnDelete();
            }
            if (! Schema::hasColumn('inventory_items', 'sales_gl_account_id')) {
                $table->foreignId('sales_gl_account_id')
                    ->nullable()
                    ->after('purchase_gl_account_id')
                    ->constrained('chart_of_accounts')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            if (Schema::hasColumn('inventory_items', 'sales_gl_account_id')) {
                $table->dropConstrainedForeignId('sales_gl_account_id');
            }
            if (Schema::hasColumn('inventory_items', 'purchase_gl_account_id')) {
                $table->dropConstrainedForeignId('purchase_gl_account_id');
            }
        });
    }
};
