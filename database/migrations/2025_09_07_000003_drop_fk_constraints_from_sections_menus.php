<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop foreign keys from sections table if they exist
        if (Schema::hasTable('sections')) {
            try {
                // Use a raw query to safely attempt deletion
                DB::statement('ALTER TABLE sections DROP FOREIGN KEY sections_module_id_foreign');
            } catch (\Throwable $e) {
                // Silently continue if key doesn't exist
            }
        }

        // Drop foreign keys from menus table if they exist
        if (Schema::hasTable('menus')) {
            try {
                DB::statement('ALTER TABLE menus DROP FOREIGN KEY menus_module_id_foreign');
            } catch (\Throwable $e) {
                // Silently continue if key doesn't exist
            }
            
            try {
                DB::statement('ALTER TABLE menus DROP FOREIGN KEY menus_section_id_foreign');
            } catch (\Throwable $e) {
                // Silently continue if key doesn't exist
            }
        }
    }

    public function down(): void
    {
        // No-op: we intentionally do not recreate FKs
    }
};


