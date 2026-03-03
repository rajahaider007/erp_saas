<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Vendor;
use App\Models\Company;
use App\Models\Country;

class VendorSeeder extends Seeder
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

        $india = Country::where('country_code', 'IND')->first();
        $usa = Country::where('country_code', 'USA')->first();
        $germany = Country::where('country_code', 'DDE')->first();

        $vendors = [
            // Indian Vendors
            [
                'vendor_code' => 'VND001',
                'vendor_name' => 'Sunrise Manufacturing Ltd.',
                'contact_person' => 'Rajesh Kumar',
                'email' => 'rajesh@sunrise-mfg.com',
                'phone' => '+91-9876543210',
                'address' => 'Plot 123, Industrial Area',
                'city' => 'Mumbai',
                'state' => 'Maharashtra',
                'postal_code' => '400001',
                'country_id' => $india?->id,
                'tax_id' => 'GSTN123456789',
            ],
            [
                'vendor_code' => 'VND002',
                'vendor_name' => 'Global Supplies Inc.',
                'contact_person' => 'Priya Singh',
                'email' => 'priya@globalsupplies.in',
                'phone' => '+91-9876543211',
                'address' => 'Block C, Tech Park',
                'city' => 'Bangalore',
                'state' => 'Karnataka',
                'postal_code' => '560001',
                'country_id' => $india?->id,
                'tax_id' => 'GSTN987654321',
            ],
            [
                'vendor_code' => 'VND003',
                'vendor_name' => 'Green Valley Producers',
                'contact_person' => 'Arjun Patel',
                'email' => 'arjun@greenvalley.co.in',
                'phone' => '+91-9876543212',
                'address' => 'Village Jhakri',
                'city' => 'Ahmedabad',
                'state' => 'Gujarat',
                'postal_code' => '380001',
                'country_id' => $india?->id,
                'tax_id' => 'GSTN456789123',
            ],

            // US Vendors
            [
                'vendor_code' => 'VND004',
                'vendor_name' => 'Quality Components USA',
                'contact_person' => 'John Smith',
                'email' => 'john@qualityusa.com',
                'phone' => '+1-2125551234',
                'address' => '123 Main Street',
                'city' => 'New York',
                'state' => 'NY',
                'postal_code' => '10001',
                'country_id' => $usa?->id,
                'tax_id' => 'EIN12-3456789',
            ],
            [
                'vendor_code' => 'VND005',
                'vendor_name' => 'TechSupply Corp',
                'contact_person' => 'Sarah Johnson',
                'email' => 'sarah@techsupply.com',
                'phone' => '+1-4155551234',
                'address' => '456 Tech Blvd',
                'city' => 'San Francisco',
                'state' => 'CA',
                'postal_code' => '94101',
                'country_id' => $usa?->id,
                'tax_id' => 'EIN98-7654321',
            ],

            // German Vendors
            [
                'vendor_code' => 'VND006',
                'vendor_name' => 'Precision Engineering GmbH',
                'contact_person' => 'Klaus Mueller',
                'email' => 'klaus@precision-eng.de',
                'phone' => '+49-30-1234567',
                'address' => 'Alexanderplatz 10',
                'city' => 'Berlin',
                'state' => 'Berlin',
                'postal_code' => '10178',
                'country_id' => $germany?->id,
                'tax_id' => 'DE123456789',
            ],
            [
                'vendor_code' => 'VND007',
                'vendor_name' => 'Industrial Solutions AG',
                'contact_person' => 'Heike Wagner',
                'email' => 'heike@ind-solutions.de',
                'phone' => '+49-201-1234567',
                'address' => 'Ruhrstraße 45',
                'city' => 'Essen',
                'state' => 'North Rhine-Westphalia',
                'postal_code' => '45128',
                'country_id' => $germany?->id,
                'tax_id' => 'DE987654321',
            ],
        ];

        foreach ($companies as $company) {
            foreach ($vendors as $vendorData) {
                Vendor::firstOrCreate(
                    [
                        'company_id' => $company->id,
                        'vendor_code' => $vendorData['vendor_code'],
                    ],
                    array_merge($vendorData, [
                        'company_id' => $company->id,
                        'is_active' => true,
                    ])
                );
            }
        }

        $this->command->info('Vendor data seeded successfully!');
    }
}
