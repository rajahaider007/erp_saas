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
        if (!Schema::hasTable('transaction_entries')) {
            return;
        }

        // Attempt to drop columns - if they don't exist, the error will be caught
        try {
            Schema::table('transaction_entries', function (Blueprint $table) {
                $table->dropColumn([
                    'cost_center_id',
                    'project_id', 
                    'department_id'
                ]);
            });
        } catch (\Throwable $e) {
            // Columns might not exist - that's OK
        }
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
