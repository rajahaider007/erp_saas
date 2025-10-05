<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'role_name' => 'Super Admin',
                'description' => 'Full system access with all permissions',
                'status' => true,
                'sort_order' => 1
            ],
            [
                'role_name' => 'Admin',
                'description' => 'Administrative access with most permissions',
                'status' => true,
                'sort_order' => 2
            ],
            [
                'role_name' => 'Manager',
                'description' => 'Management level access with limited permissions',
                'status' => true,
                'sort_order' => 3
            ],
            [
                'role_name' => 'User',
                'description' => 'Basic user access with minimal permissions',
                'status' => true,
                'sort_order' => 4
            ],
            [
                'role_name' => 'Viewer',
                'description' => 'Read-only access to most features',
                'status' => true,
                'sort_order' => 5
            ]
        ];

        foreach ($roles as $roleData) {
            Role::create($roleData);
        }
    }
}