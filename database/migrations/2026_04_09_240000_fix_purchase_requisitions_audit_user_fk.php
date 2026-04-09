<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * purchase_requisitions originally referenced Laravel's `users` table, but this app
     * authenticates against `tbl_users`. Saving a PR failed FK checks and rolled back the transaction.
     */
    public function up(): void
    {
        if (! Schema::hasTable('purchase_requisitions') || ! Schema::hasTable('tbl_users')) {
            return;
        }

        Schema::table('purchase_requisitions', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
        });

        Schema::table('purchase_requisitions', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('tbl_users')->nullOnDelete();
            $table->foreign('updated_by')->references('id')->on('tbl_users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('purchase_requisitions') || ! Schema::hasTable('users')) {
            return;
        }

        Schema::table('purchase_requisitions', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
        });

        Schema::table('purchase_requisitions', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();
        });
    }
};
