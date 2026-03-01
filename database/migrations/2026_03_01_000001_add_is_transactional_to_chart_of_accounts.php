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
        Schema::table('chart_of_accounts', function (Blueprint $table) {
            // Add is_transactional column if it doesn't exist
            if (!Schema::hasColumn('chart_of_accounts', 'is_transactional')) {
                $table->boolean('is_transactional')->default(false)->after('account_level');
                $table->index(['is_transactional']);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chart_of_accounts', function (Blueprint $table) {
            if (Schema::hasColumn('chart_of_accounts', 'is_transactional')) {
                $table->dropIndex(['is_transactional']);
                $table->dropColumn('is_transactional');
            }
        });
    }
};
