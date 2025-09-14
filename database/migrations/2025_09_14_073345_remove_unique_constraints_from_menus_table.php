<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            // Remove unique constraint on section_id and menu_name
            $table->dropUnique(['section_id', 'menu_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            // Re-add unique constraint if rolling back
            $table->unique(['section_id', 'menu_name']);
        });
    }
};
