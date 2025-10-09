<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations - Create all logging tables
     */
    public function up(): void
    {
        // 1. Audit Logs - Main audit trail
        Schema::create('tbl_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedInteger('company_id')->nullable();
            $table->unsignedInteger('location_id')->nullable();
            $table->string('module_name', 100)->nullable();
            $table->string('table_name', 100)->nullable();
            $table->unsignedBigInteger('record_id')->nullable();
            $table->enum('action_type', ['CREATE', 'READ', 'UPDATE', 'DELETE', 'POST', 'UNPOST', 'APPROVE', 'REJECT', 'IMPORT', 'EXPORT']);
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->json('changed_fields')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('session_id', 255)->nullable();
            $table->text('description')->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            $table->index('user_id');
            $table->index('company_id');
            $table->index(['table_name', 'record_id']);
            $table->index('created_at');
            $table->index('action_type');
            $table->index('module_name');
        });

        // 2. Deleted Data Recovery
        Schema::create('tbl_deleted_data_recovery', function (Blueprint $table) {
            $table->id();
            $table->string('original_table', 100);
            $table->unsignedBigInteger('original_id');
            $table->string('record_identifier', 255)->nullable();
            $table->json('data_snapshot');
            $table->json('related_data')->nullable();
            $table->unsignedBigInteger('deleted_by');
            $table->timestamp('deleted_at')->useCurrent();
            $table->string('delete_reason', 500)->nullable();
            $table->string('delete_ip', 45)->nullable();
            $table->timestamp('recovery_expires_at')->nullable();
            $table->timestamp('recovered_at')->nullable();
            $table->unsignedBigInteger('recovered_by')->nullable();
            $table->text('recovery_notes')->nullable();
            $table->enum('status', ['DELETED', 'RECOVERED', 'EXPIRED', 'PERMANENTLY_DELETED'])->default('DELETED');
            
            $table->index(['original_table', 'original_id']);
            $table->index('record_identifier');
            $table->index('status');
            $table->index('recovery_expires_at');
            $table->index('deleted_at');
        });

        // 3. Change History (Field-level tracking)
        Schema::create('tbl_change_history', function (Blueprint $table) {
            $table->id();
            $table->string('table_name', 100);
            $table->unsignedBigInteger('record_id');
            $table->string('record_identifier', 255)->nullable();
            $table->string('field_name', 100);
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();
            $table->unsignedBigInteger('changed_by');
            $table->timestamp('changed_at')->useCurrent();
            $table->string('change_reason', 500)->nullable();
            $table->string('change_ip', 45)->nullable();
            $table->enum('change_type', ['MANUAL', 'IMPORT', 'API', 'SYSTEM'])->default('MANUAL');
            $table->boolean('is_reversed')->default(false);
            $table->timestamp('reversed_at')->nullable();
            $table->unsignedBigInteger('reversed_by')->nullable();
            
            $table->index(['table_name', 'record_id']);
            $table->index('field_name');
            $table->index('changed_at');
            $table->index('changed_by');
        });

        // 4. Security Logs
        Schema::create('tbl_security_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('username', 255)->nullable();
            $table->string('event_type', 100);
            $table->enum('event_status', ['SUCCESS', 'FAILED', 'BLOCKED', 'WARNING']);
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('location_info', 255)->nullable();
            $table->json('additional_data')->nullable();
            $table->enum('risk_level', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])->default('LOW');
            $table->timestamp('created_at')->useCurrent();
            
            $table->index('user_id');
            $table->index('username');
            $table->index('event_type');
            $table->index('event_status');
            $table->index('risk_level');
            $table->index('created_at');
        });

        // 5. User Activity Logs
        Schema::create('tbl_user_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedInteger('company_id')->nullable();
            $table->string('session_id', 255)->nullable();
            $table->string('url', 500)->nullable();
            $table->string('route_name', 255)->nullable();
            $table->string('method', 10)->nullable();
            $table->string('controller', 255)->nullable();
            $table->string('action', 255)->nullable();
            $table->json('parameters')->nullable();
            $table->integer('response_status')->nullable();
            $table->integer('execution_time')->nullable()->comment('in milliseconds');
            $table->integer('memory_usage')->nullable()->comment('in bytes');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            $table->index('user_id');
            $table->index('session_id');
            $table->index('route_name');
            $table->index('created_at');
        });

        // 6. Report Logs
        Schema::create('tbl_report_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedInteger('company_id')->nullable();
            $table->string('report_name', 255);
            $table->string('report_type', 100)->nullable();
            $table->json('parameters')->nullable();
            $table->date('date_range_from')->nullable();
            $table->date('date_range_to')->nullable();
            $table->string('export_format', 20)->nullable();
            $table->integer('record_count')->nullable();
            $table->integer('file_size')->nullable()->comment('bytes');
            $table->integer('generation_time')->nullable()->comment('milliseconds');
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            $table->index('user_id');
            $table->index('report_name');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbl_report_logs');
        Schema::dropIfExists('tbl_user_activity_logs');
        Schema::dropIfExists('tbl_security_logs');
        Schema::dropIfExists('tbl_change_history');
        Schema::dropIfExists('tbl_deleted_data_recovery');
        Schema::dropIfExists('tbl_audit_logs');
    }
};

