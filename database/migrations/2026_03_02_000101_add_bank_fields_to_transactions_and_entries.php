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
        if (Schema::hasTable('transactions')) {
            Schema::table('transactions', function (Blueprint $table) {
                if (!Schema::hasColumn('transactions', 'bank_account_id')) {
                    $table->unsignedBigInteger('bank_account_id')->nullable()->after('voucher_sub_type');
                    $table->index('bank_account_id');
                }
            });

            try {
                Schema::table('transactions', function (Blueprint $table) {
                    $table->foreign('bank_account_id')->references('id')->on('chart_of_accounts');
                });
            } catch (\Throwable $e) {
                // FK may already exist or referenced table may not be available yet.
            }
        }

        if (Schema::hasTable('transaction_entries')) {
            Schema::table('transaction_entries', function (Blueprint $table) {
                if (!Schema::hasColumn('transaction_entries', 'cheque_number')) {
                    $table->string('cheque_number', 100)->nullable()->after('reference');
                }
                if (!Schema::hasColumn('transaction_entries', 'cheque_date')) {
                    $table->date('cheque_date')->nullable()->after('cheque_number');
                }
                if (!Schema::hasColumn('transaction_entries', 'slip_number')) {
                    $table->string('slip_number', 100)->nullable()->after('cheque_date');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('transactions')) {
            try {
                Schema::table('transactions', function (Blueprint $table) {
                    $table->dropForeign(['bank_account_id']);
                });
            } catch (\Throwable $e) {
                // Ignore when FK doesn't exist.
            }

            Schema::table('transactions', function (Blueprint $table) {
                if (Schema::hasColumn('transactions', 'bank_account_id')) {
                    $table->dropIndex(['bank_account_id']);
                    $table->dropColumn('bank_account_id');
                }
            });
        }

        if (Schema::hasTable('transaction_entries')) {
            Schema::table('transaction_entries', function (Blueprint $table) {
                if (Schema::hasColumn('transaction_entries', 'slip_number')) {
                    $table->dropColumn('slip_number');
                }
                if (Schema::hasColumn('transaction_entries', 'cheque_date')) {
                    $table->dropColumn('cheque_date');
                }
                if (Schema::hasColumn('transaction_entries', 'cheque_number')) {
                    $table->dropColumn('cheque_number');
                }
            });
        }
    }
};
