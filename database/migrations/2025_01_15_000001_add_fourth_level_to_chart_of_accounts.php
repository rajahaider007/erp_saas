<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, update existing Level 3 accounts to Level 4
        DB::statement("UPDATE chart_of_accounts SET account_level = 4 WHERE account_level = 3");
        
        // Add new column to track if account is transactional
        Schema::table('chart_of_accounts', function (Blueprint $table) {
            $table->boolean('is_transactional')->default(false)->after('account_level');
            
            // Add index for better performance
            $table->index(['is_transactional']);
        });
        
        // Update existing accounts based on their level
        DB::statement("UPDATE chart_of_accounts SET is_transactional = CASE 
            WHEN account_level = 4 THEN true 
            ELSE false 
        END");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove new column
        Schema::table('chart_of_accounts', function (Blueprint $table) {
            $table->dropIndex(['is_transactional']);
            $table->dropColumn(['is_transactional']);
        });
        
        // Revert Level 4 accounts back to Level 3
        DB::statement("UPDATE chart_of_accounts SET account_level = 3 WHERE account_level = 4");
    }
};
