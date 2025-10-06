<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update Voucher Number Configuration menu route
        DB::table('menus')
            ->where('menu_name', 'Voucher Number Configuration')
            ->orWhere('menu_name', 'Voucher Number Conf...')
            ->update([
                'route' => '/accounts/voucher-number-configuration',
                'updated_at' => now()
            ]);

        // Also update Chart of Accounts route if needed
        DB::table('menus')
            ->where('menu_name', 'Chart of Accounts')
            ->update([
                'route' => '/accounts/chart-of-accounts',
                'updated_at' => now()
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert Voucher Number Configuration menu route
        DB::table('menus')
            ->where('menu_name', 'Voucher Number Configuration')
            ->orWhere('menu_name', 'Voucher Number Conf...')
            ->update([
                'route' => '/accounts/voucher-number-configuration',
                'updated_at' => now()
            ]);

        // Revert Chart of Accounts route
        DB::table('menus')
            ->where('menu_name', 'Chart of Accounts')
            ->update([
                'route' => '/accounts/chart-of-accounts',
                'updated_at' => now()
            ]);
    }
};