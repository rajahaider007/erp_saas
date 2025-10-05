<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserRightsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all menus for module 1 (System Admin Panel)
        $menus = DB::table('menus')
            ->where('module_id', 1)
            ->where('status', 1)
            ->get();

        // Get user ID 1 (System Administrator)
        $userId = 1;

        // Clear existing rights for user 1
        DB::table('user_rights')->where('user_id', $userId)->delete();

        // Give full permissions to user 1 for all menus
        $rights = [];
        foreach ($menus as $menu) {
            $rights[] = [
                'user_id' => $userId,
                'menu_id' => $menu->id,
                'can_view' => 1,
                'can_add' => 1,
                'can_edit' => 1,
                'can_delete' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Insert all rights
        if (!empty($rights)) {
            DB::table('user_rights')->insert($rights);
            $this->command->info('User rights seeded successfully for user ID ' . $userId);
        } else {
            $this->command->warn('No menus found to seed rights for user ID ' . $userId);
        }
    }
}
