<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\AccountConfiguration;
use App\Models\ChartOfAccount;
use App\Models\Country;
use App\Models\Currency;
use App\Models\InventoryBarcodeType;
use App\Models\InventoryBrand;
use App\Models\InventoryComplianceCode;
use App\Models\InventoryPackageType;
use App\Models\InventoryReasonCode;
use App\Models\InventoryTemperatureClass;
use App\Models\InventoryZoneBin;
use App\Models\Location;
use App\Models\TaxCategory;
use App\Models\UomConversion;
use App\Models\UomMaster;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class MasterDataController extends Controller
{
    /** Master-data keys that create a Level 4 chart_of_accounts row under a chosen Level 3 parent */
    private const PARTY_MASTERS_WITH_COA = [
        'vendor-master',
        'customer-master',
        'transporter-master',
    ];

    public function list(Request $request, string $master)
    {
        $config = $this->config($master);
        $companyId = $this->companyId($request);

        if (! $config || ! $companyId) {
            return Inertia::render('Inventory/MasterData/List', [
                'items' => [],
                'filters' => [],
                'config' => $config,
                'error' => ! $companyId ? 'Company information is required.' : 'Invalid master selected.',
            ]);
        }

        $query = $this->baseQueryForMaster($config, $companyId, $master, $this->locationId($request));

        if (in_array($master, self::PARTY_MASTERS_WITH_COA, true)) {
            $sortBy = $request->input('sort_by', $config['default_sort'] ?? $config['key_field']);
            $sortBy = $this->remapPartyListSortColumn($master, $sortBy);
            $request->merge(['sort_by' => $sortBy]);
        }

        if ($master === 'zone-bin-master') {
            $query->with('location:id,location_name');
        }

        if ($request->filled('search')) {
            $search = '%'.$request->input('search').'%';
            $query->where(function ($q) use ($config, $search) {
                foreach ($config['search'] as $index => $column) {
                    if ($index === 0) {
                        $q->where($column, 'like', $search);

                        continue;
                    }
                    $q->orWhere($column, 'like', $search);
                }
            });
        }

        if ($request->filled('is_active')) {
            if (in_array($master, self::PARTY_MASTERS_WITH_COA, true)) {
                $query->where('status', $request->boolean('is_active') ? 'Active' : 'Inactive');
            } else {
                $query->where('is_active', $request->boolean('is_active'));
            }
        }

        $sortBy = $request->input('sort_by', $config['default_sort'] ?? $config['key_field']);
        $sortOrder = $request->input('sort_order', 'asc');
        $items = $query->orderBy($sortBy, $sortOrder)->paginate(15)->appends($request->query());

        if (in_array($master, self::PARTY_MASTERS_WITH_COA, true)) {
            $items->getCollection()->transform(function ($row) use ($master) {
                return $this->decoratePartyCoaRowForList($master, $row);
            });
        }

        if ($master === 'zone-bin-master') {
            $items->getCollection()->transform(function ($row) {
                $row->setAttribute('location_label', $row->location?->location_name ?? '');

                return $row;
            });
        }

        return Inertia::render('Inventory/MasterData/List', [
            'items' => $items,
            'filters' => [
                'search' => $request->input('search'),
                'is_active' => $request->input('is_active'),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
            'config' => $config,
        ]);
    }

    public function create(Request $request, string $master)
    {
        $config = $this->config($master);
        $companyId = $this->companyId($request);

        if (! $config || ! $companyId) {
            return Inertia::render('Inventory/MasterData/Create', [
                'config' => $config,
                'error' => ! $companyId ? 'Company information is required.' : 'Invalid master selected.',
            ]);
        }

        return Inertia::render('Inventory/MasterData/Create', [
            'config' => $config,
            'options' => $this->options($master, $companyId, $this->locationId($request)),
            'record' => null,
            'edit_mode' => false,
        ]);
    }

    public function store(Request $request, string $master)
    {
        $config = $this->config($master);
        $companyId = $this->companyId($request);

        if (! $config || ! $companyId) {
            return back()->withErrors(['error' => 'Invalid request context.']);
        }

        $validated = $request->validate($this->rules($config, $companyId, null, $master));
        $validated['company_id'] = $companyId;

        if ($master === 'tax-category') {
            $this->applyTaxCategoryRules($validated, null);
            $validated['created_by'] = auth()->id();
            $validated['updated_by'] = auth()->id();
        }

        if ($master === 'country-master') {
            $validated['iso_2_code'] = $validated['iso_2_code'] ?? strtoupper(substr($validated['country_code'], 0, 2));
            $validated['iso_numeric_code'] = $validated['iso_numeric_code'] ?? str_pad((string) (abs(crc32($validated['country_code'])) % 1000), 3, '0', STR_PAD_LEFT);
        }

        if ($master === 'uom-coding') {
            $validated['uom_code'] = strtoupper(trim($validated['uom_code']));
            $validated['created_by'] = auth()->id();
            $validated['updated_by'] = auth()->id();
        }

        if (in_array($master, self::PARTY_MASTERS_WITH_COA, true)) {
            $this->normalizePartyMasterAttributes($validated);
            $this->ensurePartyMasterCoaInput($validated, null);
            $locationId = $this->locationId($request);
            $coaFields = $this->pullPartyCoaRequestFields($validated);
            try {
                DB::beginTransaction();
                $this->createPartyChartOfAccount(
                    $master,
                    $validated,
                    $coaFields['level3_parent_id'],
                    $companyId,
                    $locationId
                );
                DB::commit();
            } catch (\Throwable $e) {
                DB::rollBack();
                throw $e;
            }

            return redirect()->route('inventory.master-data.list', ['master' => $master])
                ->with('success', $config['title'].' created successfully.');
        }

        $config['model']::create($validated);

        return redirect()->route('inventory.master-data.list', ['master' => $master])
            ->with('success', $config['title'].' created successfully.');
    }

    public function edit(Request $request, string $master, int $id)
    {
        $config = $this->config($master);
        $companyId = $this->companyId($request);

        if (! $config || ! $companyId) {
            return back()->withErrors(['error' => 'Invalid request context.']);
        }

        $record = $this->masterRecordQuery($config, $companyId, $master, $this->locationId($request))->find($id);

        if (! $record) {
            return back()->withErrors(['error' => 'Record not found.']);
        }

        if (in_array($master, self::PARTY_MASTERS_WITH_COA, true)) {
            $this->decoratePartyCoaRecordForForm($master, $record);
        }

        return Inertia::render('Inventory/MasterData/Create', [
            'config' => $config,
            'options' => $this->options($master, $companyId, $this->locationId($request)),
            'record' => $record,
            'edit_mode' => true,
        ]);
    }

    public function update(Request $request, string $master, int $id)
    {
        $config = $this->config($master);
        $companyId = $this->companyId($request);

        if (! $config || ! $companyId) {
            return back()->withErrors(['error' => 'Invalid request context.']);
        }

        $record = $this->masterRecordQuery($config, $companyId, $master, $this->locationId($request))->find($id);

        if (! $record) {
            return back()->withErrors(['error' => 'Record not found.']);
        }

        $validated = $request->validate($this->rules($config, $companyId, $record->id, $master));

        if ($master === 'tax-category') {
            $this->applyTaxCategoryRules($validated, $record->id);
            $validated['updated_by'] = auth()->id();
        }

        if ($master === 'country-master') {
            $validated['iso_2_code'] = $validated['iso_2_code'] ?? $record->iso_2_code ?? strtoupper(substr($validated['country_code'] ?? $record->country_code, 0, 2));
            $validated['iso_numeric_code'] = $validated['iso_numeric_code'] ?? $record->iso_numeric_code ?? str_pad((string) (abs(crc32($validated['country_code'] ?? $record->country_code)) % 1000), 3, '0', STR_PAD_LEFT);
        }

        if ($master === 'uom-coding') {
            $validated['uom_code'] = strtoupper(trim($validated['uom_code']));
            $validated['updated_by'] = auth()->id();
        }

        if (in_array($master, self::PARTY_MASTERS_WITH_COA, true)) {
            $this->normalizePartyMasterAttributes($validated);
            $this->ensurePartyMasterCoaInput($validated, $record);
            $this->pullPartyCoaRequestFields($validated);
            $partyCodeField = $this->partyCodeFieldForMaster($master);
            unset($validated[$partyCodeField]);
            try {
                DB::beginTransaction();
                $this->applyPartyMasterUpdatesToCoa($master, $record, $validated, $companyId);
                DB::commit();
            } catch (\Throwable $e) {
                DB::rollBack();
                throw $e;
            }

            return redirect()->route('inventory.master-data.list', ['master' => $master])
                ->with('success', $config['title'].' updated successfully.');
        }

        $record->update($validated);

        return redirect()->route('inventory.master-data.list', ['master' => $master])
            ->with('success', $config['title'].' updated successfully.');
    }

    public function destroy(Request $request, string $master, int $id)
    {
        $config = $this->config($master);
        $companyId = $this->companyId($request);

        if (! $config || ! $companyId) {
            return back()->withErrors(['error' => 'Invalid request context.']);
        }

        $record = $this->masterRecordQuery($config, $companyId, $master, $this->locationId($request))->find($id);
        if (! $record) {
            return back()->withErrors(['error' => 'Record not found.']);
        }

        $record->delete();

        return redirect()->route('inventory.master-data.list', ['master' => $master])
            ->with('success', $config['title'].' deleted successfully.');
    }

    /**
     * Next auto Level 4 account code for a Level 3 parent (for party master forms, real-time preview).
     */
    public function nextLevel4Preview(Request $request)
    {
        $request->validate([
            'parent_id' => ['required', 'integer', 'exists:chart_of_accounts,id'],
        ]);

        $companyId = $this->companyId($request);
        $locationId = $this->locationId($request);
        if (! $companyId || ! $locationId) {
            return response()->json(['message' => 'Company and location required.'], 400);
        }

        $parent = ChartOfAccount::query()
            ->where('id', $request->integer('parent_id'))
            ->where('comp_id', $companyId)
            ->where('location_id', $locationId)
            ->where('account_level', 3)
            ->where('status', 'Active')
            ->first();

        if (! $parent) {
            return response()->json(['message' => 'Invalid Level 3 account for this company and location.'], 422);
        }

        return response()->json([
            'next_code' => $this->nextLevel4AccountCode($parent),
        ]);
    }

    private function companyId(Request $request): ?int
    {
        return $request->input('comp_id')
            ?? $request->session()->get('comp_id')
            ?? $request->input('user_comp_id')
            ?? $request->session()->get('user_comp_id');
    }

    private function locationId(Request $request): ?int
    {
        return $request->input('location_id')
            ?? $request->session()->get('location_id')
            ?? $request->input('user_location_id')
            ?? $request->session()->get('user_location_id');
    }

    private function rules(array $config, int $companyId, ?int $id = null, ?string $master = null): array
    {
        $rules = $config['rules'];

        if (! empty($config['unique'])) {
            foreach ($config['unique'] as $column) {
                $companyCol = ($config['table'] ?? '') === 'chart_of_accounts' ? 'comp_id' : 'company_id';
                $rule = Rule::unique($config['table'], $column)
                    ->where(fn ($query) => $query->where($companyCol, $companyId)->whereNull('deleted_at'));

                if ($id) {
                    $rule = $rule->ignore($id);
                }

                $rules[$column] = Arr::prepend((array) ($rules[$column] ?? []), $rule);
            }
        }

        if ($master && in_array($master, self::PARTY_MASTERS_WITH_COA, true)) {
            $codeField = $this->partyCodeFieldForMaster($master);
            $uniqueRule = Rule::unique('chart_of_accounts', 'account_code')->whereNull('deleted_at');
            if ($id) {
                $uniqueRule = $uniqueRule->ignore($id);
            }
            $rules[$codeField] = array_merge((array) ($rules[$codeField] ?? []), [$uniqueRule]);
        }

        if ($master === 'zone-bin-master') {
            $rules['location_id'] = [
                'required',
                'integer',
                Rule::exists('locations', 'id')->where(fn ($q) => $q->where('company_id', $companyId)),
            ];
        }

        // Party / GL code is assigned on the server from the Level 3 parent sequence; ignore client input on create.
        if ($master && in_array($master, self::PARTY_MASTERS_WITH_COA, true) && ! $id) {
            foreach (['vendor_code', 'customer_code', 'transporter_code'] as $partyCodeCol) {
                if (isset($rules[$partyCodeCol])) {
                    $rules[$partyCodeCol] = ['nullable', 'string', 'max:15'];
                }
            }
        }

        return $rules;
    }

    private function options(string $master, int $companyId, ?int $locationId): array
    {
        $uomOptions = UomMaster::byCompany($companyId)->active()->get(['id', 'uom_code', 'uom_name'])
            ->map(fn ($row) => ['value' => (string) $row->id, 'label' => $row->uom_code.' - '.$row->uom_name])->values();

        $countryOptions = Country::active()->get(['id', 'country_code', 'country_name'])
            ->map(fn ($row) => ['value' => (string) $row->id, 'label' => $row->country_code.' - '.$row->country_name])->values();

        $currencyOptions = Currency::active()->get(['id', 'code', 'name'])
            ->map(fn ($row) => ['value' => (string) $row->id, 'label' => $row->code.' - '.$row->name])->values();

        $currencyCountryMeta = $this->currencyCountryMeta();

        $glAccountOptions = ChartOfAccount::query()
            ->where('comp_id', $companyId)
            ->when($locationId, fn ($q) => $q->where('location_id', $locationId))
            ->where('status', 'Active')
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name'])
            ->map(fn ($row) => ['value' => (string) $row->id, 'label' => $row->account_code.' - '.$row->account_name])->values();

        $fallbackLevel3 = $this->allActiveLevel3ChartOptions($companyId, $locationId);

        $level3VendorChartOptions = $this->level3OptionsFromAccountConfiguration($companyId, $locationId, ['accounts_payable']);
        if ($level3VendorChartOptions->isEmpty()) {
            $level3VendorChartOptions = $fallbackLevel3;
        }

        $level3CustomerChartOptions = $this->level3OptionsFromAccountConfiguration($companyId, $locationId, ['accounts_receivable']);
        if ($level3CustomerChartOptions->isEmpty()) {
            $level3CustomerChartOptions = $fallbackLevel3;
        }

        $level3TransporterChartOptions = $this->level3OptionsFromAccountConfiguration($companyId, $locationId, ['accrued_expense']);
        if ($level3TransporterChartOptions->isEmpty()) {
            $level3TransporterChartOptions = $this->level3OptionsFromAccountConfiguration($companyId, $locationId, ['accounts_payable']);
        }
        if ($level3TransporterChartOptions->isEmpty()) {
            $level3TransporterChartOptions = $fallbackLevel3;
        }

        $locationOptions = Location::where('company_id', $companyId)->where('status', true)->get(['id', 'location_name'])
            ->map(fn ($row) => ['value' => (string) $row->id, 'label' => $row->location_name])->values();

        $taxCategoryOptions = TaxCategory::byCompany($companyId)->active()->get(['id', 'tax_code', 'tax_name'])
            ->map(fn ($row) => ['value' => (string) $row->id, 'label' => $row->tax_code.' - '.$row->tax_name])->values();

        return [
            'uomOptions' => $uomOptions,
            'countryOptions' => $countryOptions,
            'currencyOptions' => $currencyOptions,
            'currencyCountryOptions' => $currencyCountryMeta['currencyCountryOptions'],
            'currencyDefaultByCountry' => $currencyCountryMeta['currencyDefaultByCountry'],
            'glAccountOptions' => $glAccountOptions,
            'level3VendorChartOptions' => $level3VendorChartOptions,
            'level3CustomerChartOptions' => $level3CustomerChartOptions,
            'level3TransporterChartOptions' => $level3TransporterChartOptions,
            'locationOptions' => $locationOptions,
            'taxCategoryOptions' => $taxCategoryOptions,
            'taxTypeOptions' => [
                ['value' => 'gst', 'label' => 'GST'],
                ['value' => 'vat', 'label' => 'VAT'],
                ['value' => 'sales_tax', 'label' => 'Sales Tax'],
                ['value' => 'customs_duty', 'label' => 'Customs Duty'],
                ['value' => 'withholding_tax', 'label' => 'Withholding Tax'],
                ['value' => 'excise', 'label' => 'Excise'],
                ['value' => 'other', 'label' => 'Other'],
            ],
            'taxCalculationMethodOptions' => [
                ['value' => 'percentage_net', 'label' => 'Percentage of Net'],
                ['value' => 'percentage_gross', 'label' => 'Percentage of Gross'],
                ['value' => 'fixed_amount', 'label' => 'Fixed Amount'],
                ['value' => 'slab_based', 'label' => 'Slab-based'],
            ],
            'taxCategoryGroupOptions' => [
                ['value' => 'input_tax', 'label' => 'Input Tax'],
                ['value' => 'output_tax', 'label' => 'Output Tax'],
                ['value' => 'both', 'label' => 'Both'],
            ],
            'applicableOnOptions' => [
                ['value' => 'purchase', 'label' => 'Purchase'],
                ['value' => 'sales', 'label' => 'Sales'],
                ['value' => 'both', 'label' => 'Both'],
            ],
            'uomTypeOptions' => [
                ['value' => 'Length', 'label' => 'Length'],
                ['value' => 'Weight', 'label' => 'Weight'],
                ['value' => 'Volume', 'label' => 'Volume'],
                ['value' => 'Quantity', 'label' => 'Quantity'],
                ['value' => 'Time', 'label' => 'Time'],
                ['value' => 'Area', 'label' => 'Area'],
                ['value' => 'Other', 'label' => 'Other'],
            ],
            'vendorTypeOptions' => [
                ['value' => 'local', 'label' => 'Local'],
                ['value' => 'import', 'label' => 'Import'],
            ],
            'reasonTypeOptions' => [
                ['value' => 'adjustment', 'label' => 'Adjustment'],
                ['value' => 'return', 'label' => 'Return'],
                ['value' => 'transfer', 'label' => 'Transfer'],
                ['value' => 'writeoff', 'label' => 'Write-off'],
            ],
            'taxSystemOptions' => [
                ['value' => 'gst', 'label' => 'GST'],
                ['value' => 'vat', 'label' => 'VAT'],
                ['value' => 'sales_tax', 'label' => 'Sales Tax'],
            ],
            'conversionDirectionOptions' => [
                ['value' => 'multiply', 'label' => 'Multiply'],
                ['value' => 'divide', 'label' => 'Divide'],
            ],
            'barcodeTypeOptions' => [
                ['value' => 'EAN-13', 'label' => 'EAN-13'],
                ['value' => 'UPC', 'label' => 'UPC'],
                ['value' => 'QR', 'label' => 'QR'],
                ['value' => 'Code128', 'label' => 'Code128'],
            ],
            'inventoryComplianceCodeKindOptions' => [
                ['value' => InventoryComplianceCode::KIND_HSN_SAC, 'label' => 'HSN / SAC'],
                ['value' => InventoryComplianceCode::KIND_HS_TARIFF, 'label' => 'HS Tariff'],
            ],
        ];
    }

    /**
     * Distinct country names from the currencies table (with default currency id per country for forms).
     *
     * @return array{currencyCountryOptions: list<array{value: string, label: string}>, currencyDefaultByCountry: array<string, string>}
     */
    private function currencyCountryMeta(): array
    {
        $rows = Currency::active()
            ->whereNotNull('country')
            ->where('country', '!=', '')
            ->orderBy('sort_order')
            ->orderBy('code')
            ->get(['id', 'country']);

        $defaultByCountry = [];
        $options = [];

        foreach ($rows as $row) {
            $country = trim((string) $row->country);
            if ($country === '') {
                continue;
            }
            if (! array_key_exists($country, $defaultByCountry)) {
                $defaultByCountry[$country] = (string) $row->id;
                $options[] = ['value' => $country, 'label' => $country];
            }
        }

        return [
            'currencyCountryOptions' => $options,
            'currencyDefaultByCountry' => $defaultByCountry,
        ];
    }

    private function config(string $master): ?array
    {
        $configs = [
            'uom-coding' => [
                'key' => 'uom-coding',
                'title' => 'UOM Coding',
                'model' => UomMaster::class,
                'table' => 'uom_masters',
                'key_field' => 'uom_code',
                'name_field' => 'uom_name',
                'search' => ['uom_code', 'uom_name', 'symbol'],
                'default_sort' => 'uom_code',
                'unique' => ['uom_code'],
                'rules' => [
                    'uom_code' => ['required', 'string', 'max:20'],
                    'uom_name' => ['required', 'string', 'max:100'],
                    'uom_type' => ['required', Rule::in(['Length', 'Weight', 'Volume', 'Quantity', 'Time', 'Area', 'Other'])],
                    'symbol' => ['required', 'string', 'max:10'],
                    'is_base_uom' => ['nullable', 'boolean'],
                    'decimal_precision' => ['required', 'integer', 'min:0', 'max:6'],
                    'description' => ['nullable', 'string', 'max:200'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'uom_code', 'label' => 'UOM Code', 'type' => 'text', 'required' => true],
                    ['name' => 'uom_name', 'label' => 'UOM Name', 'type' => 'text', 'required' => true],
                    ['name' => 'symbol', 'label' => 'UOM Symbol', 'type' => 'text', 'required' => true],
                    ['name' => 'uom_type', 'label' => 'UOM Type', 'type' => 'select', 'required' => true, 'optionsKey' => 'uomTypeOptions'],
                    ['name' => 'decimal_precision', 'label' => 'Decimal Precision', 'type' => 'number', 'required' => true, 'min' => 0, 'max' => 6],
                    ['name' => 'is_base_uom', 'label' => 'Base UOM Flag', 'type' => 'toggle'],
                    ['name' => 'description', 'label' => 'Description', 'type' => 'textarea'],
                    ['name' => 'is_active', 'label' => 'Status', 'type' => 'toggle'],
                ],
                'list_columns' => ['uom_code' => 'UOM Code', 'uom_name' => 'UOM Name', 'uom_type' => 'Type'],
            ],
            'uom-conversion' => [
                'key' => 'uom-conversion',
                'title' => 'UOM Conversion Configuration',
                'model' => UomConversion::class,
                'table' => 'uom_conversions',
                'key_field' => 'id',
                'name_field' => 'id',
                'search' => ['conversion_direction'],
                'default_sort' => 'id',
                'unique' => [],
                'rules' => [
                    'from_uom_id' => ['required', 'exists:uom_masters,id'],
                    'to_uom_id' => ['required', 'different:from_uom_id', 'exists:uom_masters,id'],
                    'conversion_factor' => ['required', 'numeric', 'min:0.000001'],
                    'conversion_direction' => ['required', Rule::in(['multiply', 'divide'])],
                    'effective_date' => ['nullable', 'date'],
                    'is_item_specific' => ['nullable', 'boolean'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'from_uom_id', 'label' => 'From UOM', 'type' => 'select', 'required' => true, 'optionsKey' => 'uomOptions'],
                    ['name' => 'to_uom_id', 'label' => 'To UOM', 'type' => 'select', 'required' => true, 'optionsKey' => 'uomOptions'],
                    ['name' => 'conversion_factor', 'label' => 'Conversion Factor', 'type' => 'number', 'required' => true],
                    ['name' => 'conversion_direction', 'label' => 'Conversion Direction', 'type' => 'select', 'required' => true, 'optionsKey' => 'conversionDirectionOptions'],
                    ['name' => 'effective_date', 'label' => 'Effective Date', 'type' => 'date'],
                    ['name' => 'is_item_specific', 'label' => 'Item Specific', 'type' => 'toggle'],
                    ['name' => 'is_active', 'label' => 'Status', 'type' => 'toggle'],
                ],
                'list_columns' => ['from_uom_id' => 'From UOM', 'to_uom_id' => 'To UOM', 'conversion_factor' => 'Factor'],
            ],
            'tax-category' => [
                'key' => 'tax-category',
                'title' => 'Tax Category Configuration',
                'model' => TaxCategory::class,
                'table' => 'tax_categories',
                'key_field' => 'tax_code',
                'name_field' => 'tax_name',
                'search' => ['tax_code', 'tax_name', 'tax_type'],
                'default_sort' => 'tax_code',
                'unique' => ['tax_code'],
                'rules' => [
                    'tax_code' => ['required', 'string', 'max:20'],
                    'tax_name' => ['required', 'string', 'max:100'],
                    'tax_type' => ['required', Rule::in(['gst', 'vat', 'sales_tax', 'customs_duty', 'withholding_tax', 'excise', 'other'])],
                    'tax_rate' => ['required', 'numeric', 'decimal:0,4', 'min:0', 'max:100'],
                    'tax_calculation_method' => ['required', Rule::in(['percentage_net', 'percentage_gross', 'fixed_amount', 'slab_based'])],
                    'is_compound_tax' => ['nullable', 'boolean'],
                    'compound_base_tax_category_id' => ['nullable', 'exists:tax_categories,id'],
                    'tax_category_group' => ['required', Rule::in(['input_tax', 'output_tax', 'both'])],
                    'applicable_for' => ['required', Rule::in(['purchase', 'sales', 'both'])],
                    'input_tax_gl_account_id' => ['nullable', 'exists:chart_of_accounts,id'],
                    'output_tax_gl_account_id' => ['nullable', 'exists:chart_of_accounts,id'],
                    'tax_payable_gl_account_id' => ['nullable', 'exists:chart_of_accounts,id'],
                    'country_id' => ['required', 'exists:countries,id'],
                    'hsn_sac_required' => ['nullable', 'boolean'],
                    'e_invoice_required' => ['nullable', 'boolean'],
                    'reverse_charge_applicable' => ['nullable', 'boolean'],
                    'reverse_charge_gl_account_id' => ['nullable', 'exists:chart_of_accounts,id'],
                    'input_tax_claimable' => ['required', 'boolean'],
                    'exemption_certificate_required' => ['nullable', 'boolean'],
                    'effective_from_date' => ['required', 'date'],
                    'effective_to_date' => ['nullable', 'date', 'after_or_equal:effective_from_date'],
                    'description' => ['nullable', 'string', 'max:500'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'tax_code', 'label' => 'Tax Code', 'type' => 'text', 'required' => true],
                    ['name' => 'tax_name', 'label' => 'Tax Name', 'type' => 'text', 'required' => true],
                    ['name' => 'tax_type', 'label' => 'Tax Type', 'type' => 'select', 'required' => true, 'optionsKey' => 'taxTypeOptions'],
                    ['name' => 'tax_rate', 'label' => 'Tax Rate (%)', 'type' => 'number', 'required' => true, 'min' => 0, 'max' => 100],
                    ['name' => 'tax_calculation_method', 'label' => 'Tax Calculation Method', 'type' => 'select', 'required' => true, 'optionsKey' => 'taxCalculationMethodOptions'],
                    ['name' => 'is_compound_tax', 'label' => 'Compound Tax', 'type' => 'toggle'],
                    ['name' => 'compound_base_tax_category_id', 'label' => 'Compound Base Tax Code', 'type' => 'select', 'optionsKey' => 'taxCategoryOptions'],
                    ['name' => 'tax_category_group', 'label' => 'Tax Category Group', 'type' => 'select', 'required' => true, 'optionsKey' => 'taxCategoryGroupOptions'],
                    ['name' => 'applicable_for', 'label' => 'Applicable On', 'type' => 'select', 'required' => true, 'optionsKey' => 'applicableOnOptions'],
                    ['name' => 'input_tax_gl_account_id', 'label' => 'Input Tax GL Account', 'type' => 'select', 'optionsKey' => 'glAccountOptions'],
                    ['name' => 'output_tax_gl_account_id', 'label' => 'Output Tax GL Account', 'type' => 'select', 'optionsKey' => 'glAccountOptions'],
                    ['name' => 'tax_payable_gl_account_id', 'label' => 'Tax Payable GL Account', 'type' => 'select', 'optionsKey' => 'glAccountOptions'],
                    ['name' => 'country_id', 'label' => 'Country / Region', 'type' => 'select', 'required' => true, 'optionsKey' => 'countryOptions'],
                    ['name' => 'hsn_sac_required', 'label' => 'HSN/SAC Code Applicability', 'type' => 'toggle'],
                    ['name' => 'e_invoice_required', 'label' => 'E-Invoice Required', 'type' => 'toggle'],
                    ['name' => 'reverse_charge_applicable', 'label' => 'Reverse Charge Applicable', 'type' => 'toggle'],
                    ['name' => 'reverse_charge_gl_account_id', 'label' => 'Reverse Charge GL Account', 'type' => 'select', 'optionsKey' => 'glAccountOptions'],
                    ['name' => 'input_tax_claimable', 'label' => 'Input Tax Claimable', 'type' => 'toggle', 'required' => true],
                    ['name' => 'exemption_certificate_required', 'label' => 'Exemption Certificate Required', 'type' => 'toggle'],
                    ['name' => 'effective_from_date', 'label' => 'Effective From Date', 'type' => 'date', 'required' => true],
                    ['name' => 'effective_to_date', 'label' => 'Effective To Date', 'type' => 'date'],
                    ['name' => 'description', 'label' => 'Description / Notes', 'type' => 'textarea'],
                    ['name' => 'is_active', 'label' => 'Status', 'type' => 'toggle'],
                ],
                'list_columns' => ['tax_code' => 'Tax Code', 'tax_name' => 'Tax Name', 'tax_type' => 'Tax Type', 'tax_rate' => 'Tax Rate'],
            ],
            'vendor-master' => [
                'key' => 'vendor-master',
                'title' => 'Vendor Master',
                'party_type' => 'vendor',
                'model' => ChartOfAccount::class,
                'table' => 'chart_of_accounts',
                'key_field' => 'vendor_code',
                'name_field' => 'vendor_name',
                'search' => ['account_code', 'short_code', 'account_name', 'contact_person', 'email'],
                'default_sort' => 'account_code',
                'unique' => [],
                'rules' => [
                    'coa_level3_parent_id' => ['nullable', 'integer', 'exists:chart_of_accounts,id'],
                    'vendor_code' => ['required', 'string', 'max:15'],
                    'short_code' => ['nullable', 'string', 'max:30'],
                    'vendor_name' => ['required', 'string', 'max:150'],
                    'contact_person' => ['nullable', 'string', 'max:100'],
                    'phone' => ['nullable', 'string', 'max:20'],
                    'email' => ['nullable', 'email', 'max:100'],
                    'address' => ['nullable', 'string'],
                    'payment_terms' => ['nullable', 'string', 'max:100'],
                    'currency_id' => ['nullable', 'exists:currencies,id'],
                    'tax_registration_number' => ['nullable', 'string', 'max:100'],
                    'bank_details' => ['nullable', 'string'],
                    'credit_limit' => ['nullable', 'numeric', 'min:0'],
                    'vendor_type' => ['required', Rule::in(['local', 'import'])],
                    'country_label' => ['nullable', 'string', 'max:150'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'coa_level3_parent_id', 'label' => 'Payable — Level 3 parent (from Account Configuration)', 'type' => 'select', 'required' => true, 'searchable' => true, 'optionsKey' => 'level3VendorChartOptions', 'section' => 'Chart of accounts', 'placeholder' => 'Select Level 3 parent'],
                    ['name' => 'vendor_code', 'label' => 'Vendor / GL account code', 'type' => 'text', 'required' => false, 'placeholder' => 'Auto-assigned from Level 3 parent', 'inputTitle' => 'Generated automatically as the next Level 4 code under the selected parent and stored on this Chart of Accounts row.', 'section' => 'Chart of accounts'],
                    ['name' => 'short_code', 'label' => 'Short code', 'type' => 'text', 'placeholder' => 'Optional', 'section' => 'Identity'],
                    ['name' => 'vendor_name', 'label' => 'Vendor name (legal)', 'type' => 'text', 'required' => true, 'section' => 'Identity'],
                    ['name' => 'contact_person', 'label' => 'Primary contact person', 'type' => 'text', 'section' => 'Contact'],
                    ['name' => 'phone', 'label' => 'Phone', 'type' => 'text', 'section' => 'Contact'],
                    ['name' => 'email', 'label' => 'Email', 'type' => 'email', 'section' => 'Contact'],
                    ['name' => 'address', 'label' => 'Address', 'type' => 'textarea', 'section' => 'Contact'],
                    ['name' => 'country_label', 'label' => 'Country (from currencies)', 'type' => 'select', 'searchable' => true, 'optionsKey' => 'currencyCountryOptions', 'section' => 'Commercial', 'placeholder' => 'Select country'],
                    ['name' => 'currency_id', 'label' => 'Currency', 'type' => 'select', 'optionsKey' => 'currencyOptions', 'section' => 'Commercial', 'placeholder' => 'Select currency'],
                    ['name' => 'payment_terms', 'label' => 'Payment terms', 'type' => 'text', 'section' => 'Commercial'],
                    ['name' => 'vendor_type', 'label' => 'Vendor type', 'type' => 'select', 'required' => true, 'optionsKey' => 'vendorTypeOptions', 'section' => 'Commercial', 'placeholder' => 'Select type'],
                    ['name' => 'tax_registration_number', 'label' => 'Tax registration number', 'type' => 'text', 'section' => 'Commercial'],
                    ['name' => 'bank_details', 'label' => 'Bank details', 'type' => 'textarea', 'section' => 'Commercial'],
                    ['name' => 'credit_limit', 'label' => 'Credit limit', 'type' => 'number', 'section' => 'Commercial'],
                    ['name' => 'is_active', 'label' => 'Status', 'type' => 'toggle', 'section' => 'Commercial'],
                ],
                'list_columns' => ['vendor_code' => 'Vendor Code', 'short_code' => 'Short', 'vendor_name' => 'Vendor Name', 'gl_account_code' => 'GL Code', 'vendor_type' => 'Type'],
            ],
            'zone-bin-master' => [
                'key' => 'zone-bin-master',
                'title' => 'Zone / Bin Configuration',
                'model' => InventoryZoneBin::class,
                'table' => 'inventory_zone_bins',
                'key_field' => 'bin_code',
                'name_field' => 'zone_name',
                'search' => ['zone_code', 'zone_name', 'bin_code', 'aisle'],
                'default_sort' => 'zone_code',
                'unique' => [],
                'rules' => [
                    'location_id' => ['required', 'integer'],
                    'zone_code' => ['required', 'string', 'max:30'],
                    'zone_name' => ['required', 'string', 'max:120'],
                    'aisle' => ['nullable', 'string', 'max:40'],
                    'bin_code' => ['required', 'string', 'max:40'],
                    'bin_capacity' => ['nullable', 'numeric', 'min:0'],
                    'temperature_class' => ['nullable', 'string', 'max:50'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'location_id', 'label' => 'Branch / location', 'type' => 'select', 'required' => true, 'optionsKey' => 'locationOptions', 'searchable' => true],
                    ['name' => 'zone_code', 'label' => 'Zone Code', 'type' => 'text', 'required' => true],
                    ['name' => 'zone_name', 'label' => 'Zone Name', 'type' => 'text', 'required' => true],
                    ['name' => 'aisle', 'label' => 'Aisle', 'type' => 'text'],
                    ['name' => 'bin_code', 'label' => 'Bin Code', 'type' => 'text', 'required' => true],
                    ['name' => 'bin_capacity', 'label' => 'Bin Capacity', 'type' => 'number'],
                    ['name' => 'temperature_class', 'label' => 'Temperature Class', 'type' => 'text'],
                    ['name' => 'is_active', 'label' => 'Status', 'type' => 'toggle'],
                ],
                'list_columns' => ['location_label' => 'Branch / location', 'zone_code' => 'Zone Code', 'zone_name' => 'Zone Name', 'bin_code' => 'Bin Code'],
            ],
            'country-master' => [
                'key' => 'country-master',
                'title' => 'Country Master',
                'model' => Country::class,
                'table' => 'countries',
                'key_field' => 'country_code',
                'name_field' => 'country_name',
                'search' => ['country_code', 'country_name', 'region'],
                'default_sort' => 'country_name',
                'unique' => [],
                'rules' => [
                    'country_code' => ['required', 'string', 'max:3'],
                    'country_name' => ['required', 'string', 'max:100'],
                    'currency_id' => ['nullable', 'exists:currencies,id'],
                    'tax_system' => ['nullable', Rule::in(['gst', 'vat', 'sales_tax'])],
                    'customs_rules' => ['nullable', 'string'],
                    'iso_2_code' => ['nullable', 'string', 'max:2'],
                    'iso_numeric_code' => ['nullable', 'string', 'max:3'],
                    'region' => ['nullable', 'string', 'max:50'],
                    'sub_region' => ['nullable', 'string', 'max:50'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'country_code', 'label' => 'Country Code (ISO)', 'type' => 'text', 'required' => true],
                    ['name' => 'country_name', 'label' => 'Country Name', 'type' => 'text', 'required' => true],
                    ['name' => 'currency_id', 'label' => 'Currency', 'type' => 'select', 'optionsKey' => 'currencyOptions'],
                    ['name' => 'tax_system', 'label' => 'Tax System', 'type' => 'select', 'optionsKey' => 'taxSystemOptions'],
                    ['name' => 'customs_rules', 'label' => 'Customs Rules', 'type' => 'textarea'],
                    ['name' => 'is_active', 'label' => 'Status', 'type' => 'toggle'],
                ],
                'list_columns' => ['country_code' => 'Code', 'country_name' => 'Country Name', 'tax_system' => 'Tax System'],
            ],
            'brand-master' => [
                'key' => 'brand-master',
                'title' => 'Brand Configuration',
                'model' => InventoryBrand::class,
                'table' => 'inventory_brands',
                'key_field' => 'brand_code',
                'name_field' => 'brand_name',
                'search' => ['brand_code', 'brand_name', 'manufacturer'],
                'default_sort' => 'brand_code',
                'unique' => ['brand_code'],
                'rules' => [
                    'brand_code' => ['required', 'string', 'max:30'],
                    'brand_name' => ['required', 'string', 'max:120'],
                    'manufacturer' => ['nullable', 'string', 'max:120'],
                    'country_id' => ['nullable', 'exists:countries,id'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'brand_code', 'label' => 'Brand Code', 'type' => 'text', 'required' => true],
                    ['name' => 'brand_name', 'label' => 'Brand Name', 'type' => 'text', 'required' => true],
                    ['name' => 'manufacturer', 'label' => 'Manufacturer', 'type' => 'text'],
                    ['name' => 'country_id', 'label' => 'Country of Origin', 'type' => 'select', 'optionsKey' => 'countryOptions'],
                    ['name' => 'is_active', 'label' => 'Status', 'type' => 'toggle'],
                ],
                'list_columns' => ['brand_code' => 'Brand Code', 'brand_name' => 'Brand Name', 'manufacturer' => 'Manufacturer'],
            ],
            'reason-code-master' => [
                'key' => 'reason-code-master',
                'title' => 'Reason Code Configuration',
                'model' => InventoryReasonCode::class,
                'table' => 'inventory_reason_codes',
                'key_field' => 'reason_code',
                'name_field' => 'reason_description',
                'search' => ['reason_code', 'reason_description', 'reason_type'],
                'default_sort' => 'reason_code',
                'unique' => ['reason_code'],
                'rules' => [
                    'reason_code' => ['required', 'string', 'max:30'],
                    'reason_description' => ['required', 'string', 'max:255'],
                    'reason_type' => ['required', Rule::in(['adjustment', 'return', 'transfer', 'writeoff'])],
                    'default_gl_account_id' => ['nullable', 'exists:chart_of_accounts,id'],
                    'requires_approval' => ['nullable', 'boolean'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'reason_code', 'label' => 'Reason Code', 'type' => 'text', 'required' => true],
                    ['name' => 'reason_description', 'label' => 'Reason Description', 'type' => 'text', 'required' => true],
                    ['name' => 'reason_type', 'label' => 'Reason Type', 'type' => 'select', 'required' => true, 'optionsKey' => 'reasonTypeOptions'],
                    ['name' => 'default_gl_account_id', 'label' => 'Default GL Account', 'type' => 'select', 'optionsKey' => 'glAccountOptions'],
                    ['name' => 'requires_approval', 'label' => 'Requires Approval', 'type' => 'toggle'],
                    ['name' => 'is_active', 'label' => 'Status', 'type' => 'toggle'],
                ],
                'list_columns' => ['reason_code' => 'Reason Code', 'reason_description' => 'Description', 'reason_type' => 'Type'],
            ],
            'temperature-class-master' => [
                'key' => 'temperature-class-master',
                'title' => 'Temperature Class Configuration',
                'model' => InventoryTemperatureClass::class,
                'table' => 'inventory_temperature_classes',
                'key_field' => 'class_code',
                'name_field' => 'class_name',
                'search' => ['class_code', 'class_name', 'temperature_range'],
                'default_sort' => 'class_code',
                'unique' => ['class_code'],
                'rules' => [
                    'class_code' => ['required', 'string', 'max:30'],
                    'class_name' => ['required', 'string', 'max:100'],
                    'temperature_range' => ['nullable', 'string', 'max:100'],
                    'storage_requirements' => ['nullable', 'string'],
                    'monitoring_frequency' => ['nullable', 'string', 'max:100'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'class_code', 'label' => 'Class Code', 'type' => 'text', 'required' => true],
                    ['name' => 'class_name', 'label' => 'Class Name', 'type' => 'text', 'required' => true],
                    ['name' => 'temperature_range', 'label' => 'Temperature Range', 'type' => 'text'],
                    ['name' => 'storage_requirements', 'label' => 'Storage Requirements', 'type' => 'textarea'],
                    ['name' => 'monitoring_frequency', 'label' => 'Monitoring Frequency', 'type' => 'text'],
                    ['name' => 'is_active', 'label' => 'Status', 'type' => 'toggle'],
                ],
                'list_columns' => ['class_code' => 'Class Code', 'class_name' => 'Class Name', 'temperature_range' => 'Temperature Range'],
            ],
            'compliance-code-master' => [
                'key' => 'compliance-code-master',
                'title' => 'HSN / SAC & HS Tariff Codes',
                'model' => InventoryComplianceCode::class,
                'table' => 'inventory_compliance_codes',
                'key_field' => 'code',
                'name_field' => 'description',
                'search' => ['code', 'description', 'code_kind'],
                'default_sort' => 'code',
                'unique' => ['code_kind', 'code'],
                'rules' => [
                    'code_kind' => ['required', Rule::in([InventoryComplianceCode::KIND_HSN_SAC, InventoryComplianceCode::KIND_HS_TARIFF])],
                    'code' => ['required', 'string', 'max:20'],
                    'description' => ['nullable', 'string', 'max:255'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'code_kind', 'label' => 'Code Type', 'type' => 'select', 'required' => true, 'optionsKey' => 'inventoryComplianceCodeKindOptions'],
                    ['name' => 'code', 'label' => 'Code', 'type' => 'text', 'required' => true],
                    ['name' => 'description', 'label' => 'Description', 'type' => 'text'],
                    ['name' => 'is_active', 'label' => 'Status', 'type' => 'toggle'],
                ],
                'list_columns' => ['code_kind' => 'Type', 'code' => 'Code', 'description' => 'Description'],
            ],
            'transporter-master' => [
                'key' => 'transporter-master',
                'title' => 'Transporter Master',
                'party_type' => 'transporter',
                'model' => ChartOfAccount::class,
                'table' => 'chart_of_accounts',
                'key_field' => 'transporter_code',
                'name_field' => 'transporter_name',
                'search' => ['account_code', 'short_code', 'account_name', 'service_area', 'contact_details'],
                'default_sort' => 'account_code',
                'unique' => [],
                'rules' => [
                    'coa_level3_parent_id' => ['nullable', 'integer', 'exists:chart_of_accounts,id'],
                    'transporter_code' => ['required', 'string', 'max:15'],
                    'short_code' => ['nullable', 'string', 'max:30'],
                    'transporter_name' => ['required', 'string', 'max:150'],
                    'contact_details' => ['nullable', 'string', 'max:255'],
                    'vehicle_types' => ['nullable', 'string', 'max:255'],
                    'service_area' => ['nullable', 'string', 'max:255'],
                    'country_label' => ['nullable', 'string', 'max:150'],
                    'currency_id' => ['nullable', 'exists:currencies,id'],
                    'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'coa_level3_parent_id', 'label' => 'Accrued / Payable — Level 3 parent (from Account Configuration)', 'type' => 'select', 'required' => true, 'searchable' => true, 'optionsKey' => 'level3TransporterChartOptions', 'section' => 'Chart of accounts', 'placeholder' => 'Select Level 3 parent'],
                    ['name' => 'transporter_code', 'label' => 'Transporter / GL account code', 'type' => 'text', 'required' => false, 'placeholder' => 'Auto-assigned from Level 3 parent', 'inputTitle' => 'Generated automatically as the next Level 4 code under the selected parent.', 'section' => 'Chart of accounts'],
                    ['name' => 'short_code', 'label' => 'Short code', 'type' => 'text', 'placeholder' => 'Optional', 'section' => 'Identity'],
                    ['name' => 'transporter_name', 'label' => 'Transporter name', 'type' => 'text', 'required' => true, 'section' => 'Identity'],
                    ['name' => 'contact_details', 'label' => 'Contact details', 'type' => 'textarea', 'section' => 'Contact & operations'],
                    ['name' => 'vehicle_types', 'label' => 'Vehicle types', 'type' => 'text', 'section' => 'Contact & operations'],
                    ['name' => 'service_area', 'label' => 'Service area', 'type' => 'text', 'section' => 'Contact & operations'],
                    ['name' => 'country_label', 'label' => 'Country (from currencies)', 'type' => 'select', 'searchable' => true, 'optionsKey' => 'currencyCountryOptions', 'section' => 'Commercial', 'placeholder' => 'Select country'],
                    ['name' => 'currency_id', 'label' => 'Currency', 'type' => 'select', 'optionsKey' => 'currencyOptions', 'section' => 'Commercial', 'placeholder' => 'Select currency'],
                    ['name' => 'rating', 'label' => 'Rating', 'type' => 'number', 'section' => 'Commercial'],
                    ['name' => 'is_active', 'label' => 'Status', 'type' => 'toggle', 'section' => 'Commercial'],
                ],
                'list_columns' => ['transporter_code' => 'Code', 'short_code' => 'Short', 'transporter_name' => 'Transporter Name', 'gl_account_code' => 'GL Code', 'rating' => 'Rating'],
            ],
            'customer-master' => [
                'key' => 'customer-master',
                'title' => 'Customer Master',
                'party_type' => 'customer',
                'model' => ChartOfAccount::class,
                'table' => 'chart_of_accounts',
                'key_field' => 'customer_code',
                'name_field' => 'customer_name',
                'search' => ['account_code', 'short_code', 'account_name', 'contact_details'],
                'default_sort' => 'account_code',
                'unique' => [],
                'rules' => [
                    'coa_level3_parent_id' => ['nullable', 'integer', 'exists:chart_of_accounts,id'],
                    'customer_code' => ['required', 'string', 'max:15'],
                    'short_code' => ['nullable', 'string', 'max:30'],
                    'customer_name' => ['required', 'string', 'max:150'],
                    'contact_details' => ['nullable', 'string', 'max:255'],
                    'credit_limit' => ['nullable', 'numeric', 'min:0'],
                    'payment_terms' => ['nullable', 'string', 'max:100'],
                    'tax_registration' => ['nullable', 'string', 'max:100'],
                    'country_label' => ['nullable', 'string', 'max:150'],
                    'currency_id' => ['nullable', 'exists:currencies,id'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'coa_level3_parent_id', 'label' => 'Receivable — Level 3 parent (from Account Configuration)', 'type' => 'select', 'required' => true, 'searchable' => true, 'optionsKey' => 'level3CustomerChartOptions', 'section' => 'Chart of accounts', 'placeholder' => 'Select Level 3 parent'],
                    ['name' => 'customer_code', 'label' => 'Customer / GL account code', 'type' => 'text', 'required' => false, 'placeholder' => 'Auto-assigned from Level 3 parent', 'inputTitle' => 'Generated automatically as the next Level 4 code under the selected parent.', 'section' => 'Chart of accounts'],
                    ['name' => 'short_code', 'label' => 'Short code', 'type' => 'text', 'placeholder' => 'Optional', 'section' => 'Identity'],
                    ['name' => 'customer_name', 'label' => 'Customer name', 'type' => 'text', 'required' => true, 'section' => 'Identity'],
                    ['name' => 'contact_details', 'label' => 'Contact details', 'type' => 'textarea', 'section' => 'Contact'],
                    ['name' => 'country_label', 'label' => 'Country (from currencies)', 'type' => 'select', 'searchable' => true, 'optionsKey' => 'currencyCountryOptions', 'section' => 'Commercial', 'placeholder' => 'Select country'],
                    ['name' => 'currency_id', 'label' => 'Currency', 'type' => 'select', 'optionsKey' => 'currencyOptions', 'section' => 'Commercial', 'placeholder' => 'Select currency'],
                    ['name' => 'credit_limit', 'label' => 'Credit limit', 'type' => 'number', 'section' => 'Commercial'],
                    ['name' => 'payment_terms', 'label' => 'Payment terms', 'type' => 'text', 'section' => 'Commercial'],
                    ['name' => 'tax_registration', 'label' => 'Tax registration', 'type' => 'text', 'section' => 'Commercial'],
                    ['name' => 'is_active', 'label' => 'Status', 'type' => 'toggle', 'section' => 'Commercial'],
                ],
                'list_columns' => ['customer_code' => 'Customer Code', 'short_code' => 'Short', 'customer_name' => 'Customer Name', 'gl_account_code' => 'GL Code', 'credit_limit' => 'Credit Limit'],
            ],
            'package-type-master' => [
                'key' => 'package-type-master',
                'title' => 'Package Type Configuration',
                'model' => InventoryPackageType::class,
                'table' => 'inventory_package_types',
                'key_field' => 'package_code',
                'name_field' => 'package_name',
                'search' => ['package_code', 'package_name', 'nesting_rule'],
                'default_sort' => 'package_code',
                'unique' => ['package_code'],
                'rules' => [
                    'package_code' => ['required', 'string', 'max:30'],
                    'package_name' => ['required', 'string', 'max:120'],
                    'dimensions' => ['nullable', 'string', 'max:120'],
                    'weight_capacity' => ['nullable', 'numeric', 'min:0'],
                    'volume_capacity' => ['nullable', 'numeric', 'min:0'],
                    'nesting_rule' => ['nullable', 'string', 'max:120'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'package_code', 'label' => 'Package Code', 'type' => 'text', 'required' => true],
                    ['name' => 'package_name', 'label' => 'Package Name', 'type' => 'text', 'required' => true],
                    ['name' => 'dimensions', 'label' => 'Dimensions', 'type' => 'text'],
                    ['name' => 'weight_capacity', 'label' => 'Weight Capacity', 'type' => 'number'],
                    ['name' => 'volume_capacity', 'label' => 'Volume Capacity', 'type' => 'number'],
                    ['name' => 'nesting_rule', 'label' => 'Nesting Rule', 'type' => 'text'],
                    ['name' => 'is_active', 'label' => 'Status', 'type' => 'toggle'],
                ],
                'list_columns' => ['package_code' => 'Package Code', 'package_name' => 'Package Name', 'dimensions' => 'Dimensions'],
            ],
            'barcode-type-master' => [
                'key' => 'barcode-type-master',
                'title' => 'Barcode Type Configuration',
                'model' => InventoryBarcodeType::class,
                'table' => 'inventory_barcode_types',
                'key_field' => 'barcode_type',
                'name_field' => 'barcode_type',
                'search' => ['barcode_type', 'format_pattern', 'validation_rule'],
                'default_sort' => 'barcode_type',
                'unique' => ['barcode_type'],
                'rules' => [
                    'barcode_type' => ['required', 'string', 'max:30'],
                    'format_pattern' => ['nullable', 'string', 'max:120'],
                    'length' => ['nullable', 'integer', 'min:1'],
                    'validation_rule' => ['nullable', 'string', 'max:255'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'barcode_type', 'label' => 'Barcode Type', 'type' => 'select', 'required' => true, 'optionsKey' => 'barcodeTypeOptions'],
                    ['name' => 'format_pattern', 'label' => 'Format / Pattern', 'type' => 'text'],
                    ['name' => 'length', 'label' => 'Length', 'type' => 'number'],
                    ['name' => 'validation_rule', 'label' => 'Validation Rule', 'type' => 'textarea'],
                    ['name' => 'is_active', 'label' => 'Status', 'type' => 'toggle'],
                ],
                'list_columns' => ['barcode_type' => 'Barcode Type', 'format_pattern' => 'Format', 'length' => 'Length'],
            ],
        ];

        return $configs[$master] ?? null;
    }

    /**
     * @return \Illuminate\Support\Collection<int, array{value: string, label: string}>
     */
    private function allActiveLevel3ChartOptions(int $companyId, ?int $locationId)
    {
        return ChartOfAccount::query()
            ->where('comp_id', $companyId)
            ->when($locationId, fn ($q) => $q->where('location_id', $locationId))
            ->where('account_level', 3)
            ->where('status', 'Active')
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name'])
            ->map(fn ($row) => [
                'value' => (string) $row->id,
                'label' => $row->account_code.' - '.$row->account_name,
            ])
            ->values();
    }

    /**
     * Level 3 accounts registered in account_configurations for the given config types (e.g. accounts_payable).
     *
     * @param  list<string>  $configTypes
     * @return \Illuminate\Support\Collection<int, array{value: string, label: string}>
     */
    private function level3OptionsFromAccountConfiguration(int $companyId, ?int $locationId, array $configTypes)
    {
        if (! $locationId || $configTypes === [] || ! Schema::hasTable('account_configurations')) {
            return collect();
        }

        return AccountConfiguration::query()
            ->active()
            ->byCompanyAndLocation($companyId, $locationId)
            ->whereIn('config_type', $configTypes)
            ->where('account_level', 3)
            ->whereNotNull('account_id')
            ->whereHas('chartAccount', function ($q) use ($companyId, $locationId) {
                $q->where('comp_id', $companyId)
                    ->where('location_id', $locationId)
                    ->where('account_level', 3)
                    ->where('status', 'Active');
            })
            ->with(['chartAccount:id,account_code,account_name'])
            ->orderBy('account_code')
            ->get()
            ->map(function (AccountConfiguration $row) {
                $coa = $row->chartAccount;

                return [
                    'value' => (string) $row->account_id,
                    'label' => ($coa?->account_code ?? $row->account_code).' - '.($coa?->account_name ?? $row->account_name),
                ];
            })
            ->unique('value')
            ->values();
    }

    /** @return list<string> */
    private function accountConfigTypesForPartyMaster(string $master): array
    {
        return match ($master) {
            'vendor-master' => ['accounts_payable'],
            'customer-master' => ['accounts_receivable'],
            'transporter-master' => ['accrued_expense', 'accounts_payable'],
            default => [],
        };
    }

    /**
     * Level 3 COA ids whose Level 4 children are listed in this party master (with Account Configuration when set;
     * otherwise all active Level 3 for the company, matching {@see options()} fallback).
     *
     * @return list<int>
     */
    private function level3ParentIdsForPartyMasterList(int $companyId, ?int $locationId, string $master): array
    {
        $types = $this->accountConfigTypesForPartyMaster($master);
        if ($types === []) {
            return [];
        }

        $activeLevel3Ids = ChartOfAccount::query()
            ->where('comp_id', $companyId)
            ->when($locationId, fn ($q) => $q->where('location_id', $locationId))
            ->where('account_level', 3)
            ->where('status', 'Active')
            ->pluck('id')
            ->all();

        if (! Schema::hasTable('account_configurations')) {
            return $activeLevel3Ids;
        }

        if (! $locationId) {
            return ChartOfAccount::query()
                ->where('comp_id', $companyId)
                ->where('account_level', 3)
                ->where('status', 'Active')
                ->pluck('id')
                ->all();
        }

        $configured = AccountConfiguration::query()
            ->active()
            ->byCompanyAndLocation($companyId, $locationId)
            ->whereIn('config_type', $types)
            ->where('account_level', 3)
            ->exists();

        if (! $configured) {
            return $activeLevel3Ids;
        }

        return AccountConfiguration::query()
            ->active()
            ->byCompanyAndLocation($companyId, $locationId)
            ->whereIn('config_type', $types)
            ->where('account_level', 3)
            ->whereNotNull('account_id')
            ->pluck('account_id')
            ->unique()
            ->values()
            ->all();
    }

    private function assertLevel3AllowedForPartyMaster(
        ChartOfAccount $level3,
        int $companyId,
        int $locationId,
        string $master
    ): void {
        $types = $this->accountConfigTypesForPartyMaster($master);
        if ($types === [] || ! Schema::hasTable('account_configurations')) {
            return;
        }

        $configured = AccountConfiguration::query()
            ->active()
            ->byCompanyAndLocation($companyId, $locationId)
            ->whereIn('config_type', $types)
            ->where('account_level', 3)
            ->exists();

        if (! $configured) {
            return;
        }

        $allowed = AccountConfiguration::query()
            ->active()
            ->byCompanyAndLocation($companyId, $locationId)
            ->whereIn('config_type', $types)
            ->where('account_level', 3)
            ->where('account_id', $level3->id)
            ->exists();

        if (! $allowed) {
            throw ValidationException::withMessages([
                'coa_level3_parent_id' => 'This Level 3 account is not allowed for this party type in Account Configuration.',
            ]);
        }
    }

    private function normalizePartyMasterAttributes(array &$validated): void
    {
        $validated['short_code'] = isset($validated['short_code']) && trim((string) $validated['short_code']) !== ''
            ? trim((string) $validated['short_code'])
            : null;
        $validated['country_label'] = isset($validated['country_label']) && trim((string) $validated['country_label']) !== ''
            ? trim((string) $validated['country_label'])
            : null;
    }

    private function ensurePartyMasterCoaInput(array $validated, $record): void
    {
        $hasLedger = $record instanceof ChartOfAccount
            && (int) $record->account_level === 4
            && (int) ($record->parent_account_id ?? 0) > 0;
        if ($hasLedger) {
            return;
        }
        if (empty($validated['coa_level3_parent_id'])) {
            throw ValidationException::withMessages([
                'coa_level3_parent_id' => 'Select a Level 3 Chart of Account parent. A Level 4 ledger account will be created under it.',
            ]);
        }
    }

    /**
     * @return array{level3_parent_id: ?int}
     */
    private function pullPartyCoaRequestFields(array &$validated): array
    {
        $level3 = isset($validated['coa_level3_parent_id']) && $validated['coa_level3_parent_id'] !== ''
            ? (int) $validated['coa_level3_parent_id']
            : null;
        unset($validated['coa_level3_parent_id'], $validated['coa_gl_account_code']);

        return [
            'level3_parent_id' => $level3,
        ];
    }

    private function partyCodeFieldForMaster(string $master): string
    {
        return match ($master) {
            'vendor-master' => 'vendor_code',
            'customer-master' => 'customer_code',
            'transporter-master' => 'transporter_code',
            default => 'vendor_code',
        };
    }

    private function partyDisplayNameForMaster(string $master, array $validated): string
    {
        return match ($master) {
            'vendor-master' => (string) ($validated['vendor_name'] ?? ''),
            'customer-master' => (string) ($validated['customer_name'] ?? ''),
            'transporter-master' => (string) ($validated['transporter_name'] ?? ''),
            default => 'Party',
        };
    }

    private function partyLedgerShortCodeForMaster(string $master, array $validated): string
    {
        $explicit = trim((string) ($validated['short_code'] ?? ''));
        if ($explicit !== '') {
            $clean = preg_replace('/[^A-Za-z0-9]/', '', $explicit);

            return $clean !== '' ? $clean : 'PARTY';
        }

        $raw = match ($master) {
            'vendor-master' => (string) ($validated['vendor_code'] ?? ''),
            'customer-master' => (string) ($validated['customer_code'] ?? ''),
            'transporter-master' => (string) ($validated['transporter_code'] ?? ''),
            default => 'PARTY',
        };

        return preg_replace('/[^A-Za-z0-9]/', '', $raw) ?: 'PARTY';
    }

    /**
     * Ledger short_code on create: optional explicit short_code, else derived from generated account code.
     */
    private function partyLedgerShortCodeForPartyCreate(array $validated, string $accountCode): string
    {
        $explicit = trim((string) ($validated['short_code'] ?? ''));
        if ($explicit !== '') {
            $clean = preg_replace('/[^A-Za-z0-9]/', '', $explicit);

            return $clean !== '' ? $clean : 'PARTY';
        }

        $raw = preg_replace('/[^A-Za-z0-9]/', '', $accountCode);

        return $raw !== '' ? $raw : 'PARTY';
    }

    private function resolveLevel3ChartParent(int $level3Id, int $companyId, int $locationId): ChartOfAccount
    {
        $acct = ChartOfAccount::query()
            ->where('id', $level3Id)
            ->where('comp_id', $companyId)
            ->where('location_id', $locationId)
            ->where('account_level', 3)
            ->where('status', 'Active')
            ->first();

        if (! $acct) {
            throw ValidationException::withMessages([
                'coa_level3_parent_id' => 'The selected account is not a valid Level 3 Chart of Account for this company and location.',
            ]);
        }

        return $acct;
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

    private function createPartyChartOfAccount(
        string $master,
        array $validated,
        ?int $level3Id,
        int $companyId,
        ?int $locationId
    ): ChartOfAccount {
        if (! $level3Id) {
            throw ValidationException::withMessages([
                'coa_level3_parent_id' => 'Level 3 Chart of Account parent is required.',
            ]);
        }
        if (! $locationId) {
            throw ValidationException::withMessages([
                'coa_level3_parent_id' => 'Location is required to create a Chart of Account code.',
            ]);
        }

        $level3 = $this->resolveLevel3ChartParent($level3Id, $companyId, $locationId);
        $this->assertLevel3AllowedForPartyMaster($level3, $companyId, $locationId, $master);
        $codeField = $this->partyCodeFieldForMaster($master);
        $accountCode = $this->nextLevel4AccountCode($level3);

        if (strlen($accountCode) > 15) {
            throw ValidationException::withMessages([
                $codeField => 'Generated account code exceeds Chart of Accounts length limit.',
            ]);
        }

        if (ChartOfAccount::where('account_code', $accountCode)->exists()) {
            throw ValidationException::withMessages([
                $codeField => 'The next sequence code already exists in Chart of Accounts. Refresh and try again.',
            ]);
        }

        $partyName = $this->partyDisplayNameForMaster($master, $validated);
        $shortCode = $this->partyLedgerShortCodeForPartyCreate($validated, $accountCode);

        $status = ($validated['is_active'] ?? true) ? 'Active' : 'Inactive';

        return ChartOfAccount::create(array_merge([
            'account_code' => $accountCode,
            'account_name' => Str::limit($partyName, 100, ''),
            'account_type' => $level3->account_type,
            'parent_account_id' => $level3->id,
            'account_level' => 4,
            'is_transactional' => true,
            'currency' => $level3->currency ?? 'PKR',
            'status' => $status,
            'short_code' => Str::limit($shortCode, 20, ''),
            'comp_id' => $companyId,
            'location_id' => $locationId,
            'party_type' => $this->partyTypeForMaster($master),
        ], $this->partySpecificCoaAttributes($master, $validated)));
    }

    /**
     * Single-record fetch for edit / update / destroy (party masters use comp_id + party_type).
     */
    private function masterRecordQuery(array $config, int $companyId, string $master, ?int $locationId = null)
    {
        $query = $config['model']::query();

        if (in_array($master, self::PARTY_MASTERS_WITH_COA, true)) {
            $partyType = $config['party_type'];
            $level3Ids = $this->level3ParentIdsForPartyMasterList($companyId, $locationId, $master);

            return $query
                ->where('comp_id', $companyId)
                ->where(function ($q) use ($partyType, $level3Ids) {
                    $q->where('party_type', $partyType);
                    if ($level3Ids !== []) {
                        $q->orWhere(function ($q2) use ($partyType, $level3Ids) {
                            $q2->where('account_level', 4)
                                ->whereIn('parent_account_id', $level3Ids)
                                ->where(function ($q3) use ($partyType) {
                                    $q3->whereNull('party_type')->orWhere('party_type', $partyType);
                                });
                        });
                    }
                });
        }

        return $query->where('company_id', $companyId);
    }

    private function baseQueryForMaster(array $config, int $companyId, string $master, ?int $locationId = null)
    {
        if (in_array($master, self::PARTY_MASTERS_WITH_COA, true)) {
            $partyType = $config['party_type'];
            $level3Ids = $this->level3ParentIdsForPartyMasterList($companyId, $locationId, $master);

            return $config['model']::query()
                ->where('comp_id', $companyId)
                ->where(function ($q) use ($partyType, $level3Ids) {
                    $q->where('party_type', $partyType);
                    if ($level3Ids !== []) {
                        $q->orWhere(function ($q2) use ($partyType, $level3Ids) {
                            $q2->where('account_level', 4)
                                ->whereIn('parent_account_id', $level3Ids)
                                ->where(function ($q3) use ($partyType) {
                                    $q3->whereNull('party_type')->orWhere('party_type', $partyType);
                                });
                        });
                    }
                });
        }

        return $config['model']::query()->where('company_id', $companyId);
    }

    private function remapPartyListSortColumn(string $master, string $sortBy): string
    {
        return match ($master) {
            'vendor-master' => match ($sortBy) {
                'vendor_code' => 'account_code',
                'vendor_name' => 'account_name',
                default => $sortBy,
            },
            'customer-master' => match ($sortBy) {
                'customer_code' => 'account_code',
                'customer_name' => 'account_name',
                default => $sortBy,
            },
            'transporter-master' => match ($sortBy) {
                'transporter_code' => 'account_code',
                'transporter_name' => 'account_name',
                'rating' => 'transporter_rating',
                default => $sortBy,
            },
            default => $sortBy,
        };
    }

    private function decoratePartyCoaRowForList(string $master, $row)
    {
        $row->setAttribute('gl_account_code', $row->account_code);
        if ($master === 'vendor-master') {
            $row->setAttribute('vendor_code', $row->account_code);
            $row->setAttribute('vendor_name', $row->account_name);
            $row->setAttribute('is_active', $row->status === 'Active');
        } elseif ($master === 'customer-master') {
            $row->setAttribute('customer_code', $row->account_code);
            $row->setAttribute('customer_name', $row->account_name);
            $row->setAttribute('is_active', $row->status === 'Active');
        } elseif ($master === 'transporter-master') {
            $row->setAttribute('transporter_code', $row->account_code);
            $row->setAttribute('transporter_name', $row->account_name);
            $row->setAttribute('rating', $row->transporter_rating);
            $row->setAttribute('is_active', $row->status === 'Active');
        }

        return $row;
    }

    private function decoratePartyCoaRecordForForm(string $master, ChartOfAccount $record): void
    {
        $this->decoratePartyCoaRowForList($master, $record);
        $record->setAttribute('coa_level3_parent_id', $record->parent_account_id ? (string) $record->parent_account_id : '');
        $record->setAttribute('coa_gl_account_code', $record->account_code);
        if ($master === 'customer-master') {
            $record->setAttribute('tax_registration', $record->tax_registration_number);
        }
        if ($record->currency_id && empty($record->country_label)) {
            $cur = Currency::query()->find($record->currency_id);
            if ($cur?->country) {
                $record->setAttribute('country_label', trim((string) $cur->country));
            }
        }
    }

    private function partyTypeForMaster(string $master): string
    {
        return match ($master) {
            'vendor-master' => 'vendor',
            'customer-master' => 'customer',
            'transporter-master' => 'transporter',
            default => '',
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function partySpecificCoaAttributes(string $master, array $validated): array
    {
        return match ($master) {
            'vendor-master' => [
                'contact_person' => $validated['contact_person'] ?? null,
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
                'payment_terms' => $validated['payment_terms'] ?? null,
                'currency_id' => $validated['currency_id'] ?? null,
                'tax_registration_number' => $validated['tax_registration_number'] ?? null,
                'bank_details' => $validated['bank_details'] ?? null,
                'credit_limit' => $validated['credit_limit'] ?? null,
                'vendor_type' => $validated['vendor_type'] ?? null,
                'country_label' => $validated['country_label'] ?? null,
            ],
            'customer-master' => [
                'contact_details' => $validated['contact_details'] ?? null,
                'credit_limit' => $validated['credit_limit'] ?? null,
                'payment_terms' => $validated['payment_terms'] ?? null,
                'tax_registration_number' => $validated['tax_registration'] ?? null,
                'country_label' => $validated['country_label'] ?? null,
                'currency_id' => $validated['currency_id'] ?? null,
            ],
            'transporter-master' => [
                'contact_details' => $validated['contact_details'] ?? null,
                'vehicle_types' => $validated['vehicle_types'] ?? null,
                'service_area' => $validated['service_area'] ?? null,
                'country_label' => $validated['country_label'] ?? null,
                'currency_id' => $validated['currency_id'] ?? null,
                'transporter_rating' => $validated['rating'] ?? null,
            ],
            default => [],
        };
    }

    private function applyPartyMasterUpdatesToCoa(string $master, ChartOfAccount $record, array $validated, int $companyId): void
    {
        $name = $this->partyDisplayNameForMaster($master, $validated);
        $updates = array_merge([
            'account_name' => Str::limit($name, 100, ''),
            'status' => ($validated['is_active'] ?? true) ? 'Active' : 'Inactive',
            'party_type' => $this->partyTypeForMaster($master),
        ], $this->partySpecificCoaAttributes($master, $validated));
        $short = $this->partyLedgerShortCodeForMaster($master, $validated);
        if ($short !== '' && $short !== 'PARTY') {
            $updates['short_code'] = Str::limit($short, 20, '');
        }
        ChartOfAccount::query()
            ->where('id', $record->id)
            ->where('comp_id', $companyId)
            ->update($updates);
    }

    private function applyTaxCategoryRules(array &$validated, ?int $recordId = null): void
    {
        $validated['tax_code'] = strtoupper(trim($validated['tax_code']));

        if (($validated['is_compound_tax'] ?? false) && empty($validated['compound_base_tax_category_id'])) {
            throw ValidationException::withMessages([
                'compound_base_tax_category_id' => 'Compound base tax code is required when compound tax is enabled.',
            ]);
        }

        if (! ($validated['is_compound_tax'] ?? false)) {
            $validated['compound_base_tax_category_id'] = null;
        }

        if (! empty($validated['compound_base_tax_category_id']) && $recordId && (int) $validated['compound_base_tax_category_id'] === $recordId) {
            throw ValidationException::withMessages([
                'compound_base_tax_category_id' => 'Compound tax base code cannot self-reference.',
            ]);
        }

        if (($validated['reverse_charge_applicable'] ?? false) && empty($validated['reverse_charge_gl_account_id'])) {
            throw ValidationException::withMessages([
                'reverse_charge_gl_account_id' => 'Reverse charge GL account is required when reverse charge is enabled.',
            ]);
        }

        if (! ($validated['reverse_charge_applicable'] ?? false)) {
            $validated['reverse_charge_gl_account_id'] = null;
        }

        if (($validated['applicable_for'] ?? null) === 'purchase' && empty($validated['input_tax_gl_account_id'])) {
            throw ValidationException::withMessages([
                'input_tax_gl_account_id' => 'Input tax GL account is required when applicable on Purchase.',
            ]);
        }

        if (($validated['applicable_for'] ?? null) === 'sales' && empty($validated['output_tax_gl_account_id'])) {
            throw ValidationException::withMessages([
                'output_tax_gl_account_id' => 'Output tax GL account is required when applicable on Sales.',
            ]);
        }

        if (($validated['applicable_for'] ?? null) === 'both') {
            if (empty($validated['input_tax_gl_account_id']) || empty($validated['output_tax_gl_account_id'])) {
                throw ValidationException::withMessages([
                    'input_tax_gl_account_id' => 'Input and Output tax GL accounts are required when applicable on Both.',
                ]);
            }
        }

        if (((float) ($validated['tax_rate'] ?? 0)) === 0.0 && ! ($validated['exemption_certificate_required'] ?? false)) {
            throw ValidationException::withMessages([
                'tax_rate' => 'Tax rate 0.00 is allowed only for exempt/zero-rated taxes with exemption certificate required.',
            ]);
        }

        if ($recordId && isset($validated['is_active']) && ! $validated['is_active']) {
            $hasOpenUsage = DB::table('inventory_items')->where('tax_category_id', $recordId)->exists();
            if ($hasOpenUsage) {
                throw ValidationException::withMessages([
                    'is_active' => 'Cannot deactivate tax code because it is used in active records.',
                ]);
            }
        }
    }
}
