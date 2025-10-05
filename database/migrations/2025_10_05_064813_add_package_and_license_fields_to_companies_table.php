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
        Schema::table('companies', function (Blueprint $table) {
            // Add package relationship
            $table->foreignId('package_id')->nullable()->constrained('packages')->onDelete('set null');
            
            // Add license date fields
            $table->date('license_start_date')->nullable();
            $table->date('license_end_date')->nullable();
            
            // Remove old subscription fields
            $table->dropColumn(['subscription_status', 'subscription_expiry']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            // Drop new fields
            $table->dropForeign(['package_id']);
            $table->dropColumn(['package_id', 'license_start_date', 'license_end_date']);
            
            // Restore old subscription fields
            $table->enum('subscription_status', ['trial', 'active', 'expired', 'suspended'])->default('trial');
            $table->date('subscription_expiry')->nullable();
        });
    }
};