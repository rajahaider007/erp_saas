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
        Schema::table('uom_masters', function (Blueprint $table) {
            if (!Schema::hasColumn('uom_masters', 'description')) {
                $table->text('description')->nullable()->after('symbol');
            }
            if (!Schema::hasColumn('uom_masters', 'created_by')) {
                $table->foreignId('created_by')->nullable()->after('display_order')->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('uom_masters', 'updated_by')) {
                $table->foreignId('updated_by')->nullable()->after('created_by')->constrained('users')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('uom_masters', function (Blueprint $table) {
            if (Schema::hasColumn('uom_masters', 'description')) {
                $table->dropColumn('description');
            }
            if (Schema::hasColumn('uom_masters', 'created_by')) {
                $table->dropForeignIdFor('users', 'created_by');
            }
            if (Schema::hasColumn('uom_masters', 'updated_by')) {
                $table->dropForeignIdFor('users', 'updated_by');
            }
        });
    }
};
