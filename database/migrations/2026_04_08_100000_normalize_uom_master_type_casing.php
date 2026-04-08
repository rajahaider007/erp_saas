<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Align uom_masters.uom_type with UOM Master / Required Master Forms spec (Title case: Length, Weight, …).
     */
    public function up(): void
    {
        $map = [
            'length' => 'Length',
            'weight' => 'Weight',
            'volume' => 'Volume',
            'quantity' => 'Quantity',
            'time' => 'Time',
            'area' => 'Area',
            'other' => 'Other',
        ];

        foreach ($map as $from => $to) {
            DB::table('uom_masters')->where('uom_type', $from)->update(['uom_type' => $to]);
        }
    }

    public function down(): void
    {
        $map = [
            'Length' => 'length',
            'Weight' => 'weight',
            'Volume' => 'volume',
            'Quantity' => 'quantity',
            'Time' => 'time',
            'Area' => 'area',
            'Other' => 'other',
        ];

        foreach ($map as $from => $to) {
            DB::table('uom_masters')->where('uom_type', $from)->update(['uom_type' => $to]);
        }
    }
};
