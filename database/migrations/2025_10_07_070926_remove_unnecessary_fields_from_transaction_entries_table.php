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
        Schema::table('transaction_entries', function (Blueprint $table) {
            // Remove unnecessary fields that are not needed for transaction entries
            $table->dropColumn([
                'cost_center_id',
                'project_id', 
                'department_id'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaction_entries', function (Blueprint $table) {
            // Add back the fields if rollback is needed
            $table->unsignedBigInteger('cost_center_id')->nullable();
            $table->unsignedBigInteger('project_id')->nullable();
            $table->unsignedBigInteger('department_id')->nullable();
        });
    }
};
