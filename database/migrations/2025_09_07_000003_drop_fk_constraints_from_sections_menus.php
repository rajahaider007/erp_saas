<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Best-effort: drop foreign keys if they exist
        Schema::table('sections', function (Blueprint $table) {
            try { $table->dropForeign(['module_id']); } catch (\Throwable $e) {}
        });

        Schema::table('menus', function (Blueprint $table) {
            try { $table->dropForeign(['module_id']); } catch (\Throwable $e) {}
            try { $table->dropForeign(['section_id']); } catch (\Throwable $e) {}
        });
    }

    public function down(): void
    {
        // No-op: we intentionally do not recreate FKs
    }
};


