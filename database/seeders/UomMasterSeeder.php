<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\UomMaster;
use App\Models\Company;

class UomMasterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companies = Company::all();

        if ($companies->isEmpty()) {
            $this->command->info('No companies found. Please seed companies first.');
            return;
        }

        $uoms = [
            // Quantity
            ['uom_code' => 'PCS', 'uom_name' => 'Piece', 'uom_type' => 'quantity', 'symbol' => 'pcs', 'conversion_factor' => 1.0],
            ['uom_code' => 'DOZ', 'uom_name' => 'Dozen', 'uom_type' => 'quantity', 'symbol' => 'doz', 'conversion_factor' => 12.0],
            ['uom_code' => 'GRS', 'uom_name' => 'Gross', 'uom_type' => 'quantity', 'symbol' => 'grs', 'conversion_factor' => 144.0],

            // Weight
            ['uom_code' => 'KG', 'uom_name' => 'Kilogram', 'uom_type' => 'weight', 'symbol' => 'kg', 'conversion_factor' => 1.0],
            ['uom_code' => 'G', 'uom_name' => 'Gram', 'uom_type' => 'weight', 'symbol' => 'g', 'conversion_factor' => 0.001],
            ['uom_code' => 'MG', 'uom_name' => 'Milligram', 'uom_type' => 'weight', 'symbol' => 'mg', 'conversion_factor' => 0.000001],
            ['uom_code' => 'LBS', 'uom_name' => 'Pound', 'uom_type' => 'weight', 'symbol' => 'lbs', 'conversion_factor' => 0.453592],

            // Volume
            ['uom_code' => 'L', 'uom_name' => 'Liter', 'uom_type' => 'volume', 'symbol' => 'L', 'conversion_factor' => 1.0],
            ['uom_code' => 'ML', 'uom_name' => 'Milliliter', 'uom_type' => 'volume', 'symbol' => 'mL', 'conversion_factor' => 0.001],
            ['uom_code' => 'GAL', 'uom_name' => 'Gallon (US)', 'uom_type' => 'volume', 'symbol' => 'gal', 'conversion_factor' => 3.78541],
            ['uom_code' => 'BBL', 'uom_name' => 'Barrel', 'uom_type' => 'volume', 'symbol' => 'bbl', 'conversion_factor' => 159.0],

            // Length
            ['uom_code' => 'M', 'uom_name' => 'Meter', 'uom_type' => 'length', 'symbol' => 'm', 'conversion_factor' => 1.0],
            ['uom_code' => 'CM', 'uom_name' => 'Centimeter', 'uom_type' => 'length', 'symbol' => 'cm', 'conversion_factor' => 0.01],
            ['uom_code' => 'MM', 'uom_name' => 'Millimeter', 'uom_type' => 'length', 'symbol' => 'mm', 'conversion_factor' => 0.001],
            ['uom_code' => 'FT', 'uom_name' => 'Foot', 'uom_type' => 'length', 'symbol' => 'ft', 'conversion_factor' => 0.3048],

            // Area
            ['uom_code' => 'SQM', 'uom_name' => 'Square Meter', 'uom_type' => 'area', 'symbol' => 'm²', 'conversion_factor' => 1.0],
            ['uom_code' => 'SQFT', 'uom_name' => 'Square Foot', 'uom_type' => 'area', 'symbol' => 'ft²', 'conversion_factor' => 0.092903],

            // Time (for services)
            ['uom_code' => 'HR', 'uom_name' => 'Hour', 'uom_type' => 'time', 'symbol' => 'hr', 'conversion_factor' => 1.0],
            ['uom_code' => 'DAY', 'uom_name' => 'Day', 'uom_type' => 'time', 'symbol' => 'day', 'conversion_factor' => 24.0],
        ];

        foreach ($companies as $company) {
            $displayOrder = 0;
            foreach ($uoms as $uomData) {
                UomMaster::firstOrCreate(
                    [
                        'company_id' => $company->id,
                        'uom_code' => $uomData['uom_code'],
                    ],
                    array_merge($uomData, [
                        'display_order' => $displayOrder++,
                        'is_active' => true,
                    ])
                );
            }
        }

        $this->command->info('UOM Master data seeded successfully!');
    }
}
