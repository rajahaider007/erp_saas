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
        Schema::table('code_configurations', function (Blueprint $table) {
            $table->unsignedBigInteger('level2_account_id')->nullable()->after('location_id');
            $table->unsignedBigInteger('level3_account_id')->nullable()->after('level2_account_id');
            
            $table->foreign('level2_account_id')->references('id')->on('chart_of_accounts')->onDelete('set null');
            $table->foreign('level3_account_id')->references('id')->on('chart_of_accounts')->onDelete('set null');
            
            $table->index(['level2_account_id']);
            $table->index(['level3_account_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('code_configurations', function (Blueprint $table) {
            $table->dropForeign(['level2_account_id']);
            $table->dropForeign(['level3_account_id']);
            $table->dropIndex(['level2_account_id']);
            $table->dropIndex(['level3_account_id']);
            $table->dropColumn(['level2_account_id', 'level3_account_id']);
        });
    }
};