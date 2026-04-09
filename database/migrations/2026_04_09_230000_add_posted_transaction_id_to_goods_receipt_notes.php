<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('goods_receipt_notes', function (Blueprint $table) {
            if (! Schema::hasColumn('goods_receipt_notes', 'posted_transaction_id')) {
                $table->unsignedBigInteger('posted_transaction_id')->nullable()->after('status');
                $table->index('posted_transaction_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('goods_receipt_notes', function (Blueprint $table) {
            if (Schema::hasColumn('goods_receipt_notes', 'posted_transaction_id')) {
                $table->dropIndex(['posted_transaction_id']);
                $table->dropColumn('posted_transaction_id');
            }
        });
    }
};
