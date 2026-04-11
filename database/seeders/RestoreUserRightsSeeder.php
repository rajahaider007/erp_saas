<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RestoreUserRightsSeeder extends Seeder
{
    public function run(): void
    {
        if (! Schema::hasTable('user_rights') || ! Schema::hasTable('tbl_users') || ! Schema::hasTable('menus')) {
            return;
        }

        // Get all active users
        $users = DB::table('tbl_users')->where('status', 'active')->get();
        
        // Get all menus
        $menus = DB::table('menus')->where('status', 1)->get();

        foreach ($users as $user) {
            foreach ($menus as $menu) {
                // Skip if right already exists
                $exists = DB::table('user_rights')
                    ->where('user_id', $user->id)
                    ->where('menu_id', $menu->id)
                    ->exists();

                if ($exists) {
                    continue;
                }

                // Grant full permissions for super admin and admin users
                $canView = true;
                $canAdd = in_array($user->role, ['super_admin', 'admin']);
                $canEdit = in_array($user->role, ['super_admin', 'admin']);
                $canDelete = in_array($user->role, ['super_admin', 'admin']);

                DB::table('user_rights')->insert([
                    'user_id' => $user->id,
                    'menu_id' => $menu->id,
                    'can_view' => $canView,
                    'can_add' => $canAdd,
                    'can_edit' => $canEdit,
                    'can_delete' => $canDelete,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info('User rights restored successfully!');
    }
}
