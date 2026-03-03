<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\TaxCategory;
use App\Models\Company;

class TaxCategorySeeder extends Seeder
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

        $taxCategories = [
            // Standard Tax Categories
            ['tax_code' => 'EXEMPT', 'tax_name' => 'Tax Exempt', 'tax_type' => 'gst', 'tax_rate' => 0.00, 'applicable_for' => 'both'],
            ['tax_code' => 'ZERO', 'tax_name' => 'Zero Rated', 'tax_type' => 'gst', 'tax_rate' => 0.00, 'applicable_for' => 'both'],
            
            // GST - 5%
            ['tax_code' => 'GST5', 'tax_name' => 'GST 5%', 'tax_type' => 'gst', 'tax_rate' => 5.00, 'applicable_for' => 'both'],
            
            // GST - 12%
            ['tax_code' => 'GST12', 'tax_name' => 'GST 12%', 'tax_type' => 'gst', 'tax_rate' => 12.00, 'applicable_for' => 'both'],
            
            // GST - 18%
            ['tax_code' => 'GST18', 'tax_name' => 'GST 18%', 'tax_type' => 'gst', 'tax_rate' => 18.00, 'applicable_for' => 'both'],
            
            // GST - 28%
            ['tax_code' => 'GST28', 'tax_name' => 'GST 28%', 'tax_type' => 'gst', 'tax_rate' => 28.00, 'applicable_for' => 'both'],
            
            // VAT Standard
            ['tax_code' => 'VAT_STD', 'tax_name' => 'VAT Standard', 'tax_type' => 'vat', 'tax_rate' => 20.00, 'applicable_for' => 'both'],
            
            // VAT Reduced
            ['tax_code' => 'VAT_RED', 'tax_name' => 'VAT Reduced', 'tax_type' => 'vat', 'tax_rate' => 10.00, 'applicable_for' => 'both'],
            
            // Sales Tax - Standard
            ['tax_code' => 'SLTAX_STD', 'tax_name' => 'Sales Tax Standard', 'tax_type' => 'sales_tax', 'tax_rate' => 15.00, 'applicable_for' => 'sales'],
            
            // Excise
            ['tax_code' => 'EXCISE', 'tax_name' => 'Excise Duty', 'tax_type' => 'excise', 'tax_rate' => 5.00, 'applicable_for' => 'purchase'],
            
            // Custom
            ['tax_code' => 'CUSTOM', 'tax_name' => 'Custom Duty', 'tax_type' => 'custom', 'tax_rate' => 10.00, 'applicable_for' => 'purchase'],
        ];

        foreach ($companies as $company) {
            foreach ($taxCategories as $taxData) {
                TaxCategory::firstOrCreate(
                    [
                        'company_id' => $company->id,
                        'tax_code' => $taxData['tax_code'],
                    ],
                    array_merge($taxData, [
                        'is_active' => true,
                    ])
                );
            }
        }

        $this->command->info('Tax Category data seeded successfully!');
    }
}
