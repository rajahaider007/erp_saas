<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('uom_conversions')->where('conversion_direction', 'Multiply')->update(['conversion_direction' => 'multiply']);
        DB::table('uom_conversions')->where('conversion_direction', 'Divide')->update(['conversion_direction' => 'divide']);
    }

    public function down(): void
    {
        DB::table('uom_conversions')->where('conversion_direction', 'multiply')->update(['conversion_direction' => 'Multiply']);
        DB::table('uom_conversions')->where('conversion_direction', 'divide')->update(['conversion_direction' => 'Divide']);
    }
};
