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
            $table->unsignedBigInteger('comp_id')->nullable()->after('id');
            $table->unsignedBigInteger('location_id')->nullable()->after('comp_id');
            
            $table->index(['comp_id']);
            $table->index(['location_id']);
            $table->index(['comp_id', 'location_id']);
            
            $table->foreign('comp_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('location_id')->references('id')->on('locations')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chart_of_accounts', function (Blueprint $table) {
            $table->dropForeign(['comp_id']);
            $table->dropForeign(['location_id']);
            $table->dropIndex(['comp_id']);
            $table->dropIndex(['location_id']);
            $table->dropIndex(['comp_id', 'location_id']);
            $table->dropColumn(['comp_id', 'location_id']);
        });
    }
};
