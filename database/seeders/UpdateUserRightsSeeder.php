<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Menu;
use App\Models\UserRight;
use Illuminate\Support\Facades\DB;

class UpdateUserRightsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::beginTransaction();
        
        try {
            // Get all users
            $users = User::where('status', 'active')->get();
            
            // Get all menus
            $menus = Menu::where('status', true)->get();
            
            echo "Found {$users->count()} users and {$menus->count()} menus\n";
            
            foreach ($users as $user) {
                echo "Processing user: {$user->loginid} (ID: {$user->id})\n";
                
                foreach ($menus as $menu) {
                    // Check if user right already exists
                    $existingRight = UserRight::where('user_id', $user->id)
                        ->where('menu_id', $menu->id)
                        ->first();
                    
                    if (!$existingRight) {
                        // Create new user right with all permissions enabled by default
                        UserRight::create([
                            'user_id' => $user->id,
                            'menu_id' => $menu->id,
                            'can_view' => true,
                            'can_add' => true,
                            'can_edit' => true,
                            'can_delete' => true,
                        ]);
                        
                        echo "  Created rights for menu: {$menu->menu_name} (ID: {$menu->id})\n";
                    } else {
                        echo "  Rights already exist for menu: {$menu->menu_name} (ID: {$menu->id})\n";
                    }
                }
            }
            
            // Clean up duplicate rights
            $this->cleanupDuplicateRights();
            
            DB::commit();
            echo "User rights update completed successfully!\n";
            
        } catch (\Exception $e) {
            DB::rollback();
            echo "Error updating user rights: " . $e->getMessage() . "\n";
            throw $e;
        }
    }
    
    /**
     * Clean up duplicate user rights
     */
    private function cleanupDuplicateRights(): void
    {
        echo "Cleaning up duplicate rights...\n";
        
        // Find duplicates
        $duplicates = DB::table('user_rights')
            ->select('user_id', 'menu_id', DB::raw('COUNT(*) as count'))
            ->groupBy('user_id', 'menu_id')
            ->having('count', '>', 1)
            ->get();
        
        foreach ($duplicates as $duplicate) {
            echo "  Found {$duplicate->count} duplicates for user {$duplicate->user_id}, menu {$duplicate->menu_id}\n";
            
            // Keep the first one, delete the rest
            $rights = UserRight::where('user_id', $duplicate->user_id)
                ->where('menu_id', $duplicate->menu_id)
                ->orderBy('id')
                ->get();
            
            // Delete all except the first one
            for ($i = 1; $i < $rights->count(); $i++) {
                $rights[$i]->delete();
                echo "    Deleted duplicate right ID: {$rights[$i]->id}\n";
            }
        }
        
        echo "Duplicate cleanup completed.\n";
    }
}
