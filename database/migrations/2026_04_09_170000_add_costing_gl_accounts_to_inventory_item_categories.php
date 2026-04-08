<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_item_categories', function (Blueprint $table) {
            if (! Schema::hasColumn('inventory_item_categories', 'inventory_gl_account_id')) {
                $table->foreignId('inventory_gl_account_id')
                    ->nullable()
                    ->after('is_active')
                    ->constrained('chart_of_accounts')
                    ->nullOnDelete();
            }
            if (! Schema::hasColumn('inventory_item_categories', 'purchase_gl_account_id')) {
                $table->foreignId('purchase_gl_account_id')
                    ->nullable()
                    ->after('inventory_gl_account_id')
                    ->constrained('chart_of_accounts')
                    ->nullOnDelete();
            }
            if (! Schema::hasColumn('inventory_item_categories', 'sales_gl_account_id')) {
                $table->foreignId('sales_gl_account_id')
                    ->nullable()
                    ->after('purchase_gl_account_id')
                    ->constrained('chart_of_accounts')
                    ->nullOnDelete();
            }
            if (! Schema::hasColumn('inventory_item_categories', 'cogs_gl_account_id')) {
                $table->foreignId('cogs_gl_account_id')
                    ->nullable()
                    ->after('sales_gl_account_id')
                    ->constrained('chart_of_accounts')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('inventory_item_categories', function (Blueprint $table) {
            foreach (['cogs_gl_account_id', 'sales_gl_account_id', 'purchase_gl_account_id', 'inventory_gl_account_id'] as $col) {
                if (Schema::hasColumn('inventory_item_categories', $col)) {
                    $table->dropConstrainedForeignId($col);
                }
            }
        });
    }
};
