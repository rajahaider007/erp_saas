<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('purchase_requisitions')) {
            return;
        }

        Schema::table('purchase_requisitions', function (Blueprint $table) {
            if (! Schema::hasColumn('purchase_requisitions', 'vendor_id')) {
                $table->foreignId('vendor_id')->nullable()->constrained('chart_of_accounts')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('purchase_requisitions')) {
            return;
        }

        Schema::table('purchase_requisitions', function (Blueprint $table) {
            if (Schema::hasColumn('purchase_requisitions', 'vendor_id')) {
                $table->dropForeignKeyIfExists(['vendor_id']);
                $table->dropColumn('vendor_id');
            }
        });
    }
};
