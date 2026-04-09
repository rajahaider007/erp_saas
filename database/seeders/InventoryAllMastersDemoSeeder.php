<?php

namespace Database\Seeders;

use App\Models\AccountConfiguration;
use App\Models\ChartOfAccount;
use App\Models\Company;
use App\Models\Country;
use App\Models\InventoryBarcodeType;
use App\Models\InventoryBrand;
use App\Models\InventoryComplianceCode;
use App\Models\InventoryItem;
use App\Models\InventoryItemCategory;
use App\Models\InventoryItemClass;
use App\Models\InventoryItemGroup;
use App\Models\InventoryPackageType;
use App\Models\InventoryReasonCode;
use App\Models\InventoryTemperatureClass;
use App\Models\InventoryZoneBin;
use App\Models\Location;
use App\Models\TaxCategory;
use App\Models\UomConversion;
use App\Models\UomMaster;
use App\Services\Inventory\ItemCategoryCostingAccountService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Demo data for Inventory master-data screens: 10 rows per form (idempotent via firstOrCreate / existence checks).
 *
 * Depends on: companies, locations, countries (seed CountrySeeder first for real ISO rows), chart + account configuration
 * (for item categories and party masters). Skips sections that cannot be created and logs a message.
 */
class InventoryAllMastersDemoSeeder extends Seeder
{
    public function run(): void
    {
        $companies = Company::query()->orderBy('id')->get();

        if ($companies->isEmpty()) {
            $this->command?->warn('InventoryAllMastersDemoSeeder: no companies found.');

            return;
        }

        $this->seedDemoCountries();
        $costing = app(ItemCategoryCostingAccountService::class);
        foreach ($companies as $company) {
            $cid = (int) $company->id;
            $location = Location::query()->where('company_id', $cid)->orderBy('id')->first();

            if (! $location) {
                $this->command?->warn("InventoryAllMastersDemoSeeder: no location for company {$cid}; skipped.");

                continue;
            }

            $lid = (int) $location->id;
            $countryIdForTax = Country::query()->orderBy('id')->value('id');

            $this->seedDemoBranches($cid);
            $this->seedItemClasses($cid, $lid);
            $this->seedItemGroups($cid, $lid);
            $this->seedItemCategories($cid, $lid, $costing);
            $this->seedTaxCategories($cid, $countryIdForTax);
            $this->seedBrands($cid, $countryIdForTax);
            $this->seedReasonCodes($cid);
            $this->seedTemperatureClasses($cid);
            $this->seedPackageTypes($cid);
            $this->seedBarcodeTypes($cid);
            $this->seedComplianceCodes($cid);
            $this->seedZoneBins($cid, $lid);
            $this->seedExtraUoms($cid);
            $this->seedUomConversions($cid);
            $this->seedPartyLedgers($cid, $lid);
            $this->seedItems($cid, $lid);
        }

        $this->command?->info('InventoryAllMastersDemoSeeder finished.');
    }

    private function seedDemoCountries(): void
    {
        for ($i = 1; $i <= 10; $i++) {
            $code = sprintf('Q%02d', $i);
            $iso2 = sprintf('Z%d', $i - 1);
            if ($i === 10) {
                $iso2 = 'ZZ';
            }

            Country::firstOrCreate(
                ['country_code' => $code],
                [
                    'country_name' => 'Demo Region '.$i,
                    'iso_2_code' => $iso2,
                    'iso_numeric_code' => str_pad((string) (800 + $i), 3, '0', STR_PAD_LEFT),
                    'region' => 'Demo',
                    'sub_region' => 'Seed',
                    'is_active' => true,
                ]
            );
        }
    }

    private function seedDemoBranches(int $companyId): void
    {
        for ($i = 1; $i <= 10; $i++) {
            $name = 'DEMO Branch '.str_pad((string) $i, 2, '0', STR_PAD_LEFT);
            Location::firstOrCreate(
                [
                    'company_id' => $companyId,
                    'location_name' => $name,
                ],
                [
                    'address' => 'Demo industrial area',
                    'city' => 'Demo City',
                    'country' => 'Demo',
                    'status' => true,
                    'sort_order' => 100 + $i,
                ]
            );
        }
    }

    private function seedItemClasses(int $compId, int $locationId): void
    {
        for ($i = 1; $i <= 10; $i++) {
            $code = 'D-CLS-'.str_pad((string) $i, 2, '0', STR_PAD_LEFT);
            InventoryItemClass::firstOrCreate(
                [
                    'comp_id' => $compId,
                    'location_id' => $locationId,
                    'class_code' => $code,
                ],
                [
                    'class_name' => 'Demo class '.$i,
                    'description' => 'Seeded demo item class.',
                    'is_active' => true,
                ]
            );
        }
    }

    private function seedItemGroups(int $compId, int $locationId): void
    {
        for ($i = 1; $i <= 10; $i++) {
            $code = 'D-GRP-'.str_pad((string) $i, 2, '0', STR_PAD_LEFT);
            InventoryItemGroup::firstOrCreate(
                [
                    'comp_id' => $compId,
                    'location_id' => $locationId,
                    'group_code' => $code,
                ],
                [
                    'group_name' => 'Demo group '.$i,
                    'description' => 'Seeded demo item group.',
                    'is_active' => true,
                ]
            );
        }
    }

    private function seedItemCategories(int $compId, int $locationId, ItemCategoryCostingAccountService $costing): void
    {
        $classes = InventoryItemClass::query()
            ->byCompanyAndLocation($compId, $locationId)
            ->orderBy('id')
            ->get();

        if ($classes->isEmpty()) {
            return;
        }

        for ($i = 1; $i <= 10; $i++) {
            $code = 'D-CAT-'.str_pad((string) $i, 2, '0', STR_PAD_LEFT);
            $class = $classes[($i - 1) % $classes->count()];

            $category = InventoryItemCategory::firstOrCreate(
                [
                    'comp_id' => $compId,
                    'location_id' => $locationId,
                    'category_code' => $code,
                ],
                [
                    'category_name' => 'Demo category '.$i,
                    'item_class_id' => $class->id,
                    'description' => 'Seeded demo category.',
                    'is_active' => true,
                ]
            );

            if ($category->inventory_gl_account_id && $category->cogs_gl_account_id) {
                continue;
            }

            try {
                $costing->ensureCostingHeads($category->fresh());
            } catch (\Throwable $e) {
                $this->command?->warn("InventoryAllMastersDemoSeeder: category costing skipped ({$code}): ".$e->getMessage());
            }
        }
    }

    private function seedTaxCategories(int $companyId, ?int $countryId): void
    {
        if (! $countryId) {
            $this->command?->warn('InventoryAllMastersDemoSeeder: no country for tax categories.');

            return;
        }

        for ($i = 1; $i <= 10; $i++) {
            $suffix = str_pad((string) $i, 2, '0', STR_PAD_LEFT);
            TaxCategory::firstOrCreate(
                [
                    'company_id' => $companyId,
                    'tax_code' => 'D-TAX-'.$suffix,
                ],
                [
                    'tax_name' => 'Demo tax '.$i.'%',
                    'tax_type' => $i % 2 === 0 ? 'vat' : 'gst',
                    'tax_rate' => min(5 + $i, 25),
                    'tax_calculation_method' => 'percentage_net',
                    'is_compound_tax' => false,
                    'compound_base_tax_category_id' => null,
                    'tax_category_group' => 'both',
                    'applicable_for' => 'both',
                    'input_tax_gl_account_id' => null,
                    'output_tax_gl_account_id' => null,
                    'tax_payable_gl_account_id' => null,
                    'country_id' => $countryId,
                    'hsn_sac_required' => false,
                    'e_invoice_required' => false,
                    'reverse_charge_applicable' => false,
                    'reverse_charge_gl_account_id' => null,
                    'input_tax_claimable' => true,
                    'exemption_certificate_required' => false,
                    'effective_from_date' => now()->startOfYear()->toDateString(),
                    'effective_to_date' => null,
                    'description' => 'Seeded demo tax category.',
                    'is_active' => true,
                ]
            );
        }
    }

    private function seedBrands(int $companyId, ?int $countryId): void
    {
        for ($i = 1; $i <= 10; $i++) {
            $code = 'D-BRD-'.str_pad((string) $i, 2, '0', STR_PAD_LEFT);
            InventoryBrand::firstOrCreate(
                [
                    'company_id' => $companyId,
                    'brand_code' => $code,
                ],
                [
                    'brand_name' => 'Demo brand '.$i,
                    'manufacturer' => 'Demo manufacturer '.$i,
                    'country_id' => $countryId,
                    'is_active' => true,
                ]
            );
        }
    }

    private function seedReasonCodes(int $companyId): void
    {
        $types = ['adjustment', 'return', 'transfer', 'writeoff'];

        for ($i = 1; $i <= 10; $i++) {
            $code = 'D-RSN-'.str_pad((string) $i, 2, '0', STR_PAD_LEFT);
            InventoryReasonCode::firstOrCreate(
                [
                    'company_id' => $companyId,
                    'reason_code' => $code,
                ],
                [
                    'reason_description' => 'Demo reason '.$i,
                    'reason_type' => $types[($i - 1) % count($types)],
                    'default_gl_account_id' => null,
                    'requires_approval' => $i % 3 === 0,
                    'is_active' => true,
                ]
            );
        }
    }

    private function seedTemperatureClasses(int $companyId): void
    {
        for ($i = 1; $i <= 10; $i++) {
            $code = 'D-TMP-'.str_pad((string) $i, 2, '0', STR_PAD_LEFT);
            InventoryTemperatureClass::firstOrCreate(
                [
                    'company_id' => $companyId,
                    'class_code' => $code,
                ],
                [
                    'class_name' => 'Demo temp class '.$i,
                    'temperature_range' => (0 + $i).' °C — '.(5 + $i).' °C',
                    'storage_requirements' => 'Dry / demo.',
                    'monitoring_frequency' => 'Daily',
                    'is_active' => true,
                ]
            );
        }
    }

    private function seedPackageTypes(int $companyId): void
    {
        for ($i = 1; $i <= 10; $i++) {
            $code = 'D-PKG-'.str_pad((string) $i, 2, '0', STR_PAD_LEFT);
            InventoryPackageType::firstOrCreate(
                [
                    'company_id' => $companyId,
                    'package_code' => $code,
                ],
                [
                    'package_name' => 'Demo package '.$i,
                    'dimensions' => (10 + $i).'×20×30 cm',
                    'weight_capacity' => 5 + $i,
                    'volume_capacity' => 0.01 * $i,
                    'nesting_rule' => 'Standard nest',
                    'is_active' => true,
                ]
            );
        }
    }

    private function seedBarcodeTypes(int $companyId): void
    {
        $types = ['EAN-13', 'UPC', 'QR', 'Code128'];

        for ($i = 1; $i <= 10; $i++) {
            $t = $types[($i - 1) % count($types)];
            $key = 'DEMO-'.str_pad((string) $i, 2, '0', STR_PAD_LEFT).'-'.$t;
            InventoryBarcodeType::firstOrCreate(
                [
                    'company_id' => $companyId,
                    'barcode_type' => $key,
                ],
                [
                    'format_pattern' => $t.' pattern '.$i,
                    'length' => 8 + $i,
                    'validation_rule' => 'Demo validation '.$i,
                    'is_active' => true,
                ]
            );
        }
    }

    private function seedComplianceCodes(int $companyId): void
    {
        for ($i = 1; $i <= 10; $i++) {
            $kind = $i % 2 === 0 ? InventoryComplianceCode::KIND_HS_TARIFF : InventoryComplianceCode::KIND_HSN_SAC;
            $code = $kind === InventoryComplianceCode::KIND_HSN_SAC
                ? 'DHSN'.str_pad((string) $i, 4, '0', STR_PAD_LEFT)
                : 'DHTF'.str_pad((string) $i, 4, '0', STR_PAD_LEFT);

            InventoryComplianceCode::firstOrCreate(
                [
                    'company_id' => $companyId,
                    'code_kind' => $kind,
                    'code' => $code,
                ],
                [
                    'description' => 'Demo compliance code '.$i,
                    'is_active' => true,
                ]
            );
        }
    }

    private function seedZoneBins(int $companyId, int $locationId): void
    {
        for ($i = 1; $i <= 10; $i++) {
            $suffix = str_pad((string) $i, 2, '0', STR_PAD_LEFT);
            InventoryZoneBin::firstOrCreate(
                [
                    'company_id' => $companyId,
                    'location_id' => $locationId,
                    'zone_code' => 'DZ'.$suffix,
                    'bin_code' => 'DB'.$suffix,
                ],
                [
                    'zone_name' => 'Demo zone '.$i,
                    'aisle' => 'Rack-'.str_pad((string) $i, 2, '0', STR_PAD_LEFT),
                    'bin_capacity' => 100 + ($i * 10),
                    'temperature_class' => 'Ambient',
                    'is_active' => true,
                ]
            );
        }
    }

    private function seedExtraUoms(int $companyId): void
    {
        $types = ['Quantity', 'Weight', 'Volume', 'Length', 'Area', 'Time', 'Other'];

        for ($i = 1; $i <= 10; $i++) {
            $code = 'DU'.str_pad((string) $i, 2, '0', STR_PAD_LEFT);
            UomMaster::firstOrCreate(
                [
                    'company_id' => $companyId,
                    'uom_code' => $code,
                ],
                [
                    'uom_name' => 'Demo UOM '.$i,
                    'uom_type' => $types[($i - 1) % count($types)],
                    'symbol' => 'd'.$i,
                    'description' => 'Seeded demo unit.',
                    'is_base_uom' => false,
                    'decimal_precision' => 3,
                    'conversion_factor' => 1,
                    'base_uom_id' => null,
                    'is_active' => true,
                    'display_order' => 900 + $i,
                ]
            );
        }
    }

    private function auditConfigLevel3(int $compId, int $locationId, string $configType): ?int
    {
        $config = AccountConfiguration::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('config_type', $configType)
            ->where('is_active', true)
            ->orderBy('id')
            ->first();

        if (! $config?->account_id) {
            return null;
        }

        $coa = ChartOfAccount::query()->find($config->account_id);
        if (! $coa) {
            return null;
        }

        if ((int) $coa->account_level === 3) {
            return (int) $coa->id;
        }

        if ((int) $coa->account_level === 4 && $coa->parent_account_id) {
            return (int) $coa->parent_account_id;
        }

        return null;
    }

    private function seedUomConversions(int $companyId): void
    {
        $uoms = UomMaster::query()
            ->where('company_id', $companyId)
            ->orderBy('id')
            ->pluck('id')
            ->all();

        if (count($uoms) < 2) {
            return;
        }

        for ($i = 0; $i < 10; $i++) {
            $fromId = (int) $uoms[$i % count($uoms)];
            $toId = (int) $uoms[($i + 1) % count($uoms)];
            if ($fromId === $toId) {
                $toId = (int) $uoms[($i + 2) % count($uoms)];
            }
            if ($fromId === $toId) {
                continue;
            }

            UomConversion::firstOrCreate(
                [
                    'company_id' => $companyId,
                    'from_uom_id' => $fromId,
                    'to_uom_id' => $toId,
                ],
                [
                    'conversion_factor' => 1 + (($i + 1) * 0.1),
                    'conversion_direction' => $i % 2 === 0 ? 'multiply' : 'divide',
                    'is_active' => true,
                ]
            );
        }
    }

    private function nextLevel4AccountCode(ChartOfAccount $level3): string
    {
        $code = (string) $level3->account_code;
        $prefix = strlen($code) >= 9 ? substr($code, 0, 9) : str_pad($code, 9, '0', STR_PAD_RIGHT);

        $maxSuffix = (int) ChartOfAccount::query()
            ->where('parent_account_id', $level3->id)
            ->where('account_level', 4)
            ->pluck('account_code')
            ->map(fn ($c) => (int) substr((string) $c, -6))
            ->max();

        return $prefix.str_pad((string) ($maxSuffix + 1), 6, '0', STR_PAD_LEFT);
    }

    private function createPartyLedger(
        string $master,
        int $compId,
        int $locationId,
        int $level3Id,
        string $displayName,
        array $extra
    ): void {
        $level3 = ChartOfAccount::query()
            ->where('id', $level3Id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_level', 3)
            ->where('status', 'Active')
            ->first();

        if (! $level3) {
            return;
        }

        $codeTaken = fn (string $code): bool => ChartOfAccount::withTrashed()
            ->where('account_code', $code)
            ->exists();

        $accountCode = $this->nextLevel4AccountCode($level3);
        for ($guard = 0; $guard < 100 && $codeTaken($accountCode); $guard++) {
            $suffix = (int) substr($accountCode, -6);
            $accountCode = substr($accountCode, 0, -6).str_pad((string) ($suffix + 1), 6, '0', STR_PAD_LEFT);
        }
        if ($codeTaken($accountCode)) {
            return;
        }

        $partyType = match ($master) {
            'vendor-master' => 'vendor',
            'customer-master' => 'customer',
            'transporter-master' => 'transporter',
            default => null,
        };

        if (! $partyType) {
            return;
        }

        $short = preg_replace('/[^A-Za-z0-9]/', '', $accountCode) ?: 'PARTY';

        ChartOfAccount::create(array_merge([
            'account_code' => $accountCode,
            'account_name' => Str::limit($displayName, 100, ''),
            'account_type' => $level3->account_type,
            'parent_account_id' => $level3->id,
            'account_level' => 4,
            'is_transactional' => true,
            'currency' => $level3->currency ?? 'PKR',
            'status' => 'Active',
            'short_code' => Str::limit($short, 20, ''),
            'comp_id' => $compId,
            'location_id' => $locationId,
            'party_type' => $partyType,
        ], $extra));
    }

    private function seedPartyLedgers(int $compId, int $locationId): void
    {
        $ap = $this->auditConfigLevel3($compId, $locationId, 'accounts_payable');
        $ar = $this->auditConfigLevel3($compId, $locationId, 'accounts_receivable');
        $ae = $this->auditConfigLevel3($compId, $locationId, 'accrued_expense') ?? $ap;

        if ($ap) {
            for ($i = 1; $i <= 10; $i++) {
                $name = 'DEMO Vendor '.str_pad((string) $i, 2, '0', STR_PAD_LEFT);
                if (ChartOfAccount::query()->where('comp_id', $compId)->where('party_type', 'vendor')->where('account_name', $name)->exists()) {
                    continue;
                }
                $this->createPartyLedger('vendor-master', $compId, $locationId, $ap, $name, [
                    'contact_person' => 'Contact '.$i,
                    'email' => 'vendor'.$i.'@demo.local',
                    'phone' => '+92-300-000'.str_pad((string) $i, 4, '0', STR_PAD_LEFT),
                    'address' => 'Demo vendor address '.$i,
                    'vendor_type' => $i % 2 === 0 ? 'import' : 'local',
                ]);
            }
        } else {
            $this->command?->warn("InventoryAllMastersDemoSeeder: skipped vendors (no Level 3 accounts_payable config) company {$compId}.");
        }

        if ($ar) {
            for ($i = 1; $i <= 10; $i++) {
                $name = 'DEMO Customer '.str_pad((string) $i, 2, '0', STR_PAD_LEFT);
                if (ChartOfAccount::query()->where('comp_id', $compId)->where('party_type', 'customer')->where('account_name', $name)->exists()) {
                    continue;
                }
                $this->createPartyLedger('customer-master', $compId, $locationId, $ar, $name, [
                    'contact_details' => 'cust'.$i.'@demo.local',
                    'credit_limit' => 10000 * $i,
                    'payment_terms' => 'Net 30',
                ]);
            }
        } else {
            $this->command?->warn("InventoryAllMastersDemoSeeder: skipped customers (no Level 3 accounts_receivable config) company {$compId}.");
        }

        if ($ae) {
            for ($i = 1; $i <= 10; $i++) {
                $name = 'DEMO Transporter '.str_pad((string) $i, 2, '0', STR_PAD_LEFT);
                if (ChartOfAccount::query()->where('comp_id', $compId)->where('party_type', 'transporter')->where('account_name', $name)->exists()) {
                    continue;
                }
                $this->createPartyLedger('transporter-master', $compId, $locationId, $ae, $name, [
                    'contact_details' => 'trans'.$i.'@demo.local',
                    'vehicle_types' => 'Truck, van',
                    'service_area' => 'National',
                    'transporter_rating' => min(5, 3 + ($i % 3)),
                ]);
            }
        } else {
            $this->command?->warn("InventoryAllMastersDemoSeeder: skipped transporters (no accrued/payable Level 3 config) company {$compId}.");
        }
    }

    private function seedItems(int $compId, int $locationId): void
    {
        $category = InventoryItemCategory::query()
            ->byCompanyAndLocation($compId, $locationId)
            ->whereNotNull('inventory_gl_account_id')
            ->whereNotNull('cogs_gl_account_id')
            ->orderBy('id')
            ->first();

        $tax = TaxCategory::query()->where('company_id', $compId)->orderBy('id')->first();

        $stockUom = UomMaster::query()
            ->where('company_id', $compId)
            ->where('uom_code', 'PCS')
            ->value('id')
            ?? UomMaster::query()->where('company_id', $compId)->orderBy('id')->value('id');

        $writeoff = ChartOfAccount::query()
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('account_level', 4)
            ->where('is_transactional', true)
            ->where('account_type', 'Expenses')
            ->orderBy('id')
            ->first();

        if (! $category || ! $tax || ! $stockUom || ! $writeoff) {
            $this->command?->warn("InventoryAllMastersDemoSeeder: skipped demo items (need category GL, tax, UOM PCS, expense ledger) company {$compId}.");

            return;
        }

        $group = InventoryItemGroup::query()
            ->byCompanyAndLocation($compId, $locationId)
            ->orderBy('id')
            ->first();

        for ($i = 1; $i <= 10; $i++) {
            $code = 'D-ITEM-'.str_pad((string) $i, 4, '0', STR_PAD_LEFT);
            if (InventoryItem::query()->byCompanyAndLocation($compId, $locationId)->where('item_code', $code)->exists()) {
                continue;
            }

            $classId = (int) $category->item_class_id;
            $item = new InventoryItem;
            $item->fill([
                'item_code' => $code,
                'item_name_short' => 'Demo SKU '.$i,
                'item_name_long' => 'Demonstration stock item '.$i,
                'item_status' => 'active',
                'item_type' => 'trading',
                'item_class_id' => $classId,
                'item_category_id' => $category->id,
                'item_group_id' => $group?->id,
                'tracking_mode' => 'none',
                'stock_uom_id' => $stockUom,
                'purchase_uom_id' => $stockUom,
                'sales_uom_id' => $stockUom,
                'costing_method' => 'weighted_avg',
                'tax_category_id' => $tax->id,
                'inventory_gl_account_id' => $category->inventory_gl_account_id,
                'purchase_gl_account_id' => $category->purchase_gl_account_id,
                'sales_gl_account_id' => $category->sales_gl_account_id,
                'cogs_gl_account_id' => $category->cogs_gl_account_id,
                'writeoff_gl_account_id' => $writeoff->id,
                'standard_cost' => 10 * $i,
                'is_active' => true,
            ]);
            $item->comp_id = $compId;
            $item->location_id = $locationId;
            $item->save();
        }
    }
}
