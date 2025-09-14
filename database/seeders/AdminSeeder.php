<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admins = [
            [
                'id' => 1,
                'fname' => 'System',
                'mname' => null,
                'lname' => 'Administrator',
                'email' => 'admin@erpsystem.com',
                'phone' => '+1234567890',
                'loginid' => 'admin',
                'pincode' => '12345',
                'comp_id' => 1,
                'location_id' => 1,
                'dept_id' => 1,
                'password' => Hash::make('Admin@123'),
                'token' => null,
                'status' => 'active',
                'role' => 'super_admin',
                'permissions' => json_encode([
                    'users' => ['create', 'read', 'update', 'delete'],
                    'financial' => ['create', 'read', 'update', 'delete'],
                    'reports' => ['create', 'read', 'update', 'delete'],
                    'settings' => ['create', 'read', 'update', 'delete'],
                    'system' => ['create', 'read', 'update', 'delete']
                ]),
                'timezone' => 'UTC',
                'language' => 'en',
                'currency' => 'USD',
                'theme' => 'system',
                'two_factor_enabled' => false,
                'force_password_change' => false,
                'password_changed_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 2,
                'fname' => 'Finance',
                'mname' => null,
                'lname' => 'Manager',
                'email' => 'finance@erpsystem.com',
                'phone' => '+1234567891',
                'loginid' => 'finance_mgr',
                'pincode' => '12346',
                'comp_id' => 1,
                'location_id' => 1,
                'dept_id' => 2,
                'password' => Hash::make('Finance@123'),
                'token' => null,
                'status' => 'active',
                'role' => 'manager',
                'permissions' => json_encode([
                    'financial' => ['create', 'read', 'update', 'delete'],
                    'reports' => ['read', 'create'],
                    'users' => ['read']
                ]),
                'timezone' => 'UTC',
                'language' => 'en',
                'currency' => 'USD',
                'theme' => 'light',
                'two_factor_enabled' => false,
                'force_password_change' => false,
                'password_changed_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 3,
                'fname' => 'Account',
                'mname' => null,
                'lname' => 'Executive',
                'email' => 'accounts@erpsystem.com',
                'phone' => '+1234567892',
                'loginid' => 'acc_exec',
                'pincode' => '12347',
                'comp_id' => 1,
                'location_id' => 1,
                'dept_id' => 2,
                'password' => Hash::make('Account@123'),
                'token' => null,
                'status' => 'active',
                'role' => 'user',
                'permissions' => json_encode([
                    'financial' => ['create', 'read', 'update'],
                    'reports' => ['read']
                ]),
                'timezone' => 'Asia/Karachi',
                'language' => 'en',
                'currency' => 'PKR',
                'theme' => 'dark',
                'two_factor_enabled' => false,
                'force_password_change' => true,
                'password_changed_at' => Carbon::now()->subMonths(3),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        ];

        foreach ($admins as $admin) {
            DB::table('tbl_users')->insert($admin);
        }
    }
}