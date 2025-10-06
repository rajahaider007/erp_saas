<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class FixMenuStructure extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        // Create Accounts module if it doesn't exist
        if (DB::table('modules')->where('folder_name', 'accounts')->count() == 0) {
            DB::table('modules')->insert([
                'module_name' => 'Accounts',
                'folder_name' => 'accounts',
                'slug' => 'accounts',
                'status' => 1,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Create Account Management section if it doesn't exist
        if (DB::table('sections')->where('section_name', 'Account Management')->count() == 0) {
            $accountsModuleId = DB::table('modules')->where('folder_name', 'accounts')->value('id');
            DB::table('sections')->insert([
                'module_id' => $accountsModuleId,
                'section_name' => 'Account Management',
                'slug' => 'account-management',
                'status' => 1,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Get the Account Management section ID
        $accountSectionId = DB::table('sections')->where('section_name', 'Account Management')->value('id');
        $accountsModuleId = DB::table('modules')->where('folder_name', 'accounts')->value('id');

        // Add Chart of Accounts to Accounts module
        if (DB::table('menus')->where('menu_name', 'Chart of Accounts')->count() == 0) {
            DB::table('menus')->insert([
                'module_id' => $accountsModuleId,
                'section_id' => $accountSectionId,
                'menu_name' => 'Chart of Accounts',
                'route' => '/accounts/chart-of-accounts',
                'icon' => 'FileText',
                'status' => 1,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Add Voucher Number Configuration to Accounts module
        if (DB::table('menus')->where('menu_name', 'Voucher Number Configuration')->count() == 0) {
            DB::table('menus')->insert([
                'module_id' => $accountsModuleId,
                'section_id' => $accountSectionId,
                'menu_name' => 'Voucher Number Configuration',
                'route' => '/accounts/voucher-number-configuration',
                'icon' => 'Settings',
                'status' => 1,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        // Remove the menus we added
        DB::table('menus')->where('menu_name', 'Chart of Accounts')->delete();
        DB::table('menus')->where('menu_name', 'Voucher Number Configuration')->delete();
        
        // Remove the section and module
        DB::table('sections')->where('section_name', 'Account Management')->delete();
        DB::table('modules')->where('folder_name', 'accounts')->delete();
    }
}
