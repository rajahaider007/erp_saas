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
            $table->string('attachment_id')->nullable()->after('base_credit_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaction_entries', function (Blueprint $table) {
            $table->dropColumn('attachment_id');
        });
    }
};