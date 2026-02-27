<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds fiscal_year column to track which fiscal year a transaction belongs to
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Add fiscal_year column after period_id
            if (!Schema::hasColumn('transactions', 'fiscal_year')) {
                $table->string('fiscal_year', 4)->nullable()->after('period_id')->index();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            if (Schema::hasColumn('transactions', 'fiscal_year')) {
                $table->dropColumn('fiscal_year');
            }
        });
    }
};
