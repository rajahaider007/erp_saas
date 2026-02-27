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
        // Skip if tables already exist
        if (Schema::hasTable('user_sessions')) {
            return;
        }

        Schema::create('user_sessions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('session_id', 191)->index(); // Reduced to 191 for index compatibility
            $table->ipAddress('ip_address');
            $table->text('user_agent')->nullable();
            $table->longText('device_info')->nullable(); // JSON stored as text for compatibility
            $table->boolean('is_active')->default(true)->index();
            $table->timestamp('last_activity')->nullable()->index();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamp('terminated_at')->nullable();
            $table->string('termination_reason')->nullable();
            $table->timestamps();

                       // Foreign key constraint
            // $table->foreign('user_id')->references('id')->on('tbl_users')->onDelete('cascade');

            // Composite indexes for better performance
            $table->index(['user_id', 'is_active']);
            $table->index(['user_id', 'session_id']);
            $table->index(['expires_at', 'is_active']);
        });

        // Add remember_token and device_info columns to users table
        Schema::table('tbl_users', function (Blueprint $table) {
            if (!Schema::hasColumn('tbl_users', 'remember_token')) {
                $table->string('remember_token', 100)->nullable()->after('token');
            }
            if (!Schema::hasColumn('tbl_users', 'device_info')) {
                $table->longText('device_info')->nullable()->after('session_id'); // JSON stored as text for compatibility
            }
            if (!Schema::hasColumn('tbl_users', 'last_activity')) {
                $table->timestamp('last_activity')->nullable()->index();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_sessions');

        Schema::table('tbl_users', function (Blueprint $table) {
            $table->dropColumn(['remember_token', 'device_info','last_activity']);
        });
    }
};
