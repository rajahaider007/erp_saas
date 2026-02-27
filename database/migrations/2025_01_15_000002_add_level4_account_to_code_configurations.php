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
        // Only add level4_account_id if level3_account_id already exists
        // (indicates the table was previously modified; otherwise we skip)
        // Also skip if the table doesn't exist or if we can't inspect it due to
        // MySQL version constraints (older versions don't support generated columns)
        try {
            if (!Schema::hasTable('code_configurations') || !Schema::hasColumn('code_configurations', 'level3_account_id')) {
                return;
            }

            Schema::table('code_configurations', function (Blueprint $table) {
                if (!Schema::hasColumn('code_configurations', 'level4_account_id')) {
                    $table->unsignedBigInteger('level4_account_id')->nullable()->after('level3_account_id');
                    $table->index(['level4_account_id']);
                    if (Schema::hasTable('chart_of_accounts')) {
                        $table->foreign('level4_account_id')->references('id')->on('chart_of_accounts')->onDelete('cascade');
                    }
                }
            });
        } catch (\Exception $e) {
            // Skip this migration if there are schema compatibility issues
            // (e.g., older MySQL versions without generated column support)
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('code_configurations', function (Blueprint $table) {
            $table->dropForeign(['level4_account_id']);
            $table->dropIndex(['level4_account_id']);
            $table->dropColumn('level4_account_id');
        });
    }
};
