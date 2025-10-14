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
            $table->unsignedBigInteger('level4_account_id')->nullable()->after('level3_account_id');
            
            $table->index(['level4_account_id']);
            $table->foreign('level4_account_id')->references('id')->on('chart_of_accounts')->onDelete('cascade');
        });
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
