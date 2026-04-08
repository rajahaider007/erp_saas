<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const ROWS = [
        '200010001000001' => 'Vendor Test — AP Control',
        '200010007000001' => 'Vendor Test — Trade Payables',
        '200010008000001' => 'Vendor Test — Other Creditors',
    ];

    private const PREVIOUS = [
        '200010001000001' => 'Accounts Payable',
        '200010007000001' => 'Trade Payables',
        '200010008000001' => 'Other Creditors',
    ];

    public function up(): void
    {
        if (! Schema::hasTable('chart_of_accounts')) {
            return;
        }

        foreach (self::ROWS as $code => $name) {
            DB::table('chart_of_accounts')
                ->where('account_code', $code)
                ->whereNull('deleted_at')
                ->update([
                    'account_name' => $name,
                    'updated_at' => now(),
                ]);
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('chart_of_accounts')) {
            return;
        }

        foreach (self::PREVIOUS as $code => $name) {
            DB::table('chart_of_accounts')
                ->where('account_code', $code)
                ->whereNull('deleted_at')
                ->update([
                    'account_name' => $name,
                    'updated_at' => now(),
                ]);
        }
    }
};
