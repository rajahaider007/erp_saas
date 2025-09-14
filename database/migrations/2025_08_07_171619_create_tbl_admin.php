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
        Schema::create('tbl_users', function (Blueprint $table) {
            $table->id();
            $table->string('fname', 100);
            $table->string('mname', 100)->nullable();
            $table->string('lname', 100);
            $table->string('email')->unique();
            $table->string('phone', 20)->nullable();
            $table->string('loginid')->unique();
            $table->string('pincode', 10)->nullable();
            $table->unsignedBigInteger('comp_id')->nullable();
            $table->unsignedBigInteger('location_id')->nullable();
            $table->unsignedBigInteger('dept_id')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('token')->nullable();
            
            // Additional columns for international standards
            $table->enum('status', ['active', 'inactive', 'suspended', 'pending'])->default('active');
            $table->enum('role', ['super_admin', 'admin', 'manager', 'user'])->default('admin');
            $table->json('permissions')->nullable();
            $table->string('avatar')->nullable();
            $table->string('timezone', 50)->default('UTC');
            $table->string('language', 10)->default('en');
            $table->string('currency', 10)->default('USD');
            $table->enum('theme', ['light', 'dark', 'system'])->default('system');
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();
            $table->integer('failed_login_attempts')->default(0);
            $table->timestamp('locked_until')->nullable();
            $table->boolean('two_factor_enabled')->default(false);
            $table->string('two_factor_secret')->nullable();
            $table->json('recovery_codes')->nullable();
            $table->string('session_id')->nullable();
            $table->boolean('force_password_change')->default(false);
            $table->timestamp('password_changed_at')->nullable();
            $table->json('login_history')->nullable();
            $table->string('created_by')->nullable();
            $table->string('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for better performance
            $table->index(['email', 'status']);
            $table->index(['loginid', 'status']);
            $table->index(['comp_id', 'location_id', 'dept_id']);
            $table->index('last_login_at');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_users');
    }
};