<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\Country;
use App\Models\Currency;
use App\Models\InventoryBarcodeType;
use App\Models\InventoryBrand;
use App\Models\InventoryCustomer;
use App\Models\InventoryPackageType;
use App\Models\InventoryReasonCode;
use App\Models\InventoryTemperatureClass;
use App\Models\InventoryTransporter;
use App\Models\InventoryWarehouse;
use App\Models\InventoryZoneBin;
use App\Models\Location;
use App\Models\TaxCategory;
use App\Models\UomConversion;
use App\Models\UomMaster;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class MasterDataController extends Controller
{
    public function list(Request $request, string $master)
    {
        $config = $this->config($master);
        $companyId = $this->companyId($request);

        if (!$config || !$companyId) {
            return Inertia::render('Inventory/MasterData/List', [
                'items' => [],
                'filters' => [],
                'config' => $config,
                'error' => !$companyId ? 'Company information is required.' : 'Invalid master selected.',
            ]);
        }

        $query = $config['model']::query()->where('company_id', $companyId);

        if ($request->filled('search')) {
            $search = '%' . $request->input('search') . '%';
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
            $query->where('is_active', $request->boolean('is_active'));
        }

        $sortBy = $request->input('sort_by', $config['default_sort'] ?? $config['key_field']);
        $sortOrder = $request->input('sort_order', 'asc');
        $items = $query->orderBy($sortBy, $sortOrder)->paginate(15)->appends($request->query());

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

        if (!$config || !$companyId) {
            return Inertia::render('Inventory/MasterData/Create', [
                'config' => $config,
                'error' => !$companyId ? 'Company information is required.' : 'Invalid master selected.',
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

        if (!$config || !$companyId) {
            return back()->withErrors(['error' => 'Invalid request context.']);
        }

        $validated = $request->validate($this->rules($config, $companyId));
        $validated['company_id'] = $companyId;

        if ($master === 'country-master') {
            $validated['iso_2_code'] = $validated['iso_2_code'] ?? strtoupper(substr($validated['country_code'], 0, 2));
            $validated['iso_numeric_code'] = $validated['iso_numeric_code'] ?? str_pad((string) (abs(crc32($validated['country_code'])) % 1000), 3, '0', STR_PAD_LEFT);
        }

        $config['model']::create($validated);

        return redirect()->route('inventory.master-data.list', ['master' => $master])
            ->with('success', $config['title'] . ' created successfully.');
    }

    public function edit(Request $request, string $master, int $id)
    {
        $config = $this->config($master);
        $companyId = $this->companyId($request);

        if (!$config || !$companyId) {
            return back()->withErrors(['error' => 'Invalid request context.']);
        }

        $record = $config['model']::query()
            ->where('company_id', $companyId)
            ->find($id);

        if (!$record) {
            return back()->withErrors(['error' => 'Record not found.']);
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

        if (!$config || !$companyId) {
            return back()->withErrors(['error' => 'Invalid request context.']);
        }

        $record = $config['model']::query()
            ->where('company_id', $companyId)
            ->find($id);

        if (!$record) {
            return back()->withErrors(['error' => 'Record not found.']);
        }

        $validated = $request->validate($this->rules($config, $companyId, $record->id));

        if ($master === 'country-master') {
            $validated['iso_2_code'] = $validated['iso_2_code'] ?? $record->iso_2_code ?? strtoupper(substr($validated['country_code'] ?? $record->country_code, 0, 2));
            $validated['iso_numeric_code'] = $validated['iso_numeric_code'] ?? $record->iso_numeric_code ?? str_pad((string) (abs(crc32($validated['country_code'] ?? $record->country_code)) % 1000), 3, '0', STR_PAD_LEFT);
        }

        $record->update($validated);

        return redirect()->route('inventory.master-data.list', ['master' => $master])
            ->with('success', $config['title'] . ' updated successfully.');
    }

    public function destroy(Request $request, string $master, int $id)
    {
        $config = $this->config($master);
        $companyId = $this->companyId($request);

        if (!$config || !$companyId) {
            return back()->withErrors(['error' => 'Invalid request context.']);
        }

        $record = $config['model']::query()->where('company_id', $companyId)->find($id);
        if (!$record) {
            return back()->withErrors(['error' => 'Record not found.']);
        }

        $record->delete();

        return redirect()->route('inventory.master-data.list', ['master' => $master])
            ->with('success', $config['title'] . ' deleted successfully.');
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

    private function rules(array $config, int $companyId, ?int $id = null): array
    {
        $rules = $config['rules'];

        if (!empty($config['unique'])) {
            foreach ($config['unique'] as $column) {
                $rule = Rule::unique($config['table'], $column)
                    ->where(fn ($query) => $query->where('company_id', $companyId)->whereNull('deleted_at'));

                if ($id) {
                    $rule = $rule->ignore($id);
                }

                $rules[$column] = Arr::prepend((array) ($rules[$column] ?? []), $rule);
            }
        }

        return $rules;
    }

    private function options(string $master, int $companyId, ?int $locationId): array
    {
        $uomOptions = UomMaster::byCompany($companyId)->active()->get(['id', 'uom_code', 'uom_name'])
            ->map(fn ($row) => ['value' => (string) $row->id, 'label' => $row->uom_code . ' - ' . $row->uom_name])->values();

        $countryOptions = Country::active()->get(['id', 'country_code', 'country_name'])
            ->map(fn ($row) => ['value' => (string) $row->id, 'label' => $row->country_code . ' - ' . $row->country_name])->values();

        $currencyOptions = Currency::active()->get(['id', 'code', 'name'])
            ->map(fn ($row) => ['value' => (string) $row->id, 'label' => $row->code . ' - ' . $row->name])->values();

        $glAccountOptions = ChartOfAccount::query()
            ->where('comp_id', $companyId)
            ->when($locationId, fn ($q) => $q->where('location_id', $locationId))
            ->where('status', true)
            ->get(['id', 'account_code', 'account_name'])
            ->map(fn ($row) => ['value' => (string) $row->id, 'label' => $row->account_code . ' - ' . $row->account_name])->values();

        $warehouseOptions = InventoryWarehouse::byCompany($companyId)->active()->get(['id', 'warehouse_code', 'warehouse_name'])
            ->map(fn ($row) => ['value' => (string) $row->id, 'label' => $row->warehouse_code . ' - ' . $row->warehouse_name])->values();

        $locationOptions = Location::where('company_id', $companyId)->where('status', true)->get(['id', 'location_name'])
            ->map(fn ($row) => ['value' => (string) $row->id, 'label' => $row->location_name])->values();

        return [
            'uomOptions' => $uomOptions,
            'countryOptions' => $countryOptions,
            'currencyOptions' => $currencyOptions,
            'glAccountOptions' => $glAccountOptions,
            'warehouseOptions' => $warehouseOptions,
            'locationOptions' => $locationOptions,
            'taxTypeOptions' => [
                ['value' => 'gst', 'label' => 'GST'],
                ['value' => 'vat', 'label' => 'VAT'],
                ['value' => 'sales_tax', 'label' => 'Sales Tax'],
                ['value' => 'custom', 'label' => 'Custom Duty'],
            ],
            'applicableOnOptions' => [
                ['value' => 'purchase', 'label' => 'Purchase'],
                ['value' => 'sales', 'label' => 'Sales'],
                ['value' => 'both', 'label' => 'Both'],
            ],
            'uomTypeOptions' => [
                ['value' => 'length', 'label' => 'Length'],
                ['value' => 'weight', 'label' => 'Weight'],
                ['value' => 'volume', 'label' => 'Volume'],
                ['value' => 'quantity', 'label' => 'Quantity'],
                ['value' => 'time', 'label' => 'Time'],
            ],
            'vendorTypeOptions' => [
                ['value' => 'local', 'label' => 'Local'],
                ['value' => 'import', 'label' => 'Import'],
            ],
            'warehouseTypeOptions' => [
                ['value' => 'main', 'label' => 'Main'],
                ['value' => 'transit', 'label' => 'Transit'],
                ['value' => 'quarantine', 'label' => 'Quarantine'],
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
                    'uom_type' => ['required', Rule::in(['length', 'weight', 'volume', 'quantity', 'time'])],
                    'symbol' => ['nullable', 'string', 'max:10'],
                    'is_base_uom' => ['nullable', 'boolean'],
                    'decimal_precision' => ['nullable', 'integer', 'min:0', 'max:6'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'uom_code', 'label' => 'UOM Code', 'type' => 'text', 'required' => true],
                    ['name' => 'uom_name', 'label' => 'UOM Name', 'type' => 'text', 'required' => true],
                    ['name' => 'uom_type', 'label' => 'UOM Type', 'type' => 'select', 'required' => true, 'optionsKey' => 'uomTypeOptions'],
                    ['name' => 'symbol', 'label' => 'Symbol', 'type' => 'text'],
                    ['name' => 'is_base_uom', 'label' => 'Base UOM Flag', 'type' => 'toggle'],
                    ['name' => 'decimal_precision', 'label' => 'Decimal Precision', 'type' => 'number'],
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
                    'tax_rate' => ['required', 'numeric', 'min:0', 'max:100'],
                    'tax_type' => ['required', Rule::in(['gst', 'vat', 'sales_tax', 'custom'])],
                    'gl_account_id' => ['nullable', 'exists:chart_of_accounts,id'],
                    'applicable_for' => ['required', Rule::in(['purchase', 'sales', 'both'])],
                    'country_region' => ['nullable', 'string', 'max:100'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'tax_code', 'label' => 'Tax Code', 'type' => 'text', 'required' => true],
                    ['name' => 'tax_name', 'label' => 'Tax Name', 'type' => 'text', 'required' => true],
                    ['name' => 'tax_rate', 'label' => 'Tax Rate (%)', 'type' => 'number', 'required' => true],
                    ['name' => 'tax_type', 'label' => 'Tax Type', 'type' => 'select', 'required' => true, 'optionsKey' => 'taxTypeOptions'],
                    ['name' => 'gl_account_id', 'label' => 'Account Head', 'type' => 'select', 'optionsKey' => 'glAccountOptions'],
                    ['name' => 'applicable_for', 'label' => 'Applicable On', 'type' => 'select', 'required' => true, 'optionsKey' => 'applicableOnOptions'],
                    ['name' => 'country_region', 'label' => 'Country/Region', 'type' => 'text'],
                    ['name' => 'is_active', 'label' => 'Status', 'type' => 'toggle'],
                ],
                'list_columns' => ['tax_code' => 'Tax Code', 'tax_name' => 'Tax Name', 'tax_rate' => 'Tax Rate'],
            ],
            'vendor-master' => [
                'key' => 'vendor-master',
                'title' => 'Vendor Master',
                'model' => Vendor::class,
                'table' => 'vendors',
                'key_field' => 'vendor_code',
                'name_field' => 'vendor_name',
                'search' => ['vendor_code', 'vendor_name', 'contact_person', 'email'],
                'default_sort' => 'vendor_code',
                'unique' => ['vendor_code'],
                'rules' => [
                    'vendor_code' => ['required', 'string', 'max:20'],
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
                    'country_id' => ['nullable', 'exists:countries,id'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'vendor_code', 'label' => 'Vendor Code', 'type' => 'text', 'required' => true],
                    ['name' => 'vendor_name', 'label' => 'Vendor Name', 'type' => 'text', 'required' => true],
                    ['name' => 'contact_person', 'label' => 'Contact Person', 'type' => 'text'],
                    ['name' => 'phone', 'label' => 'Phone', 'type' => 'text'],
                    ['name' => 'email', 'label' => 'Email', 'type' => 'email'],
                    ['name' => 'address', 'label' => 'Address', 'type' => 'textarea'],
                    ['name' => 'payment_terms', 'label' => 'Payment Terms', 'type' => 'text'],
                    ['name' => 'currency_id', 'label' => 'Currency', 'type' => 'select', 'optionsKey' => 'currencyOptions'],
                    ['name' => 'tax_registration_number', 'label' => 'Tax Registration Number', 'type' => 'text'],
                    ['name' => 'bank_details', 'label' => 'Bank Details', 'type' => 'textarea'],
                    ['name' => 'credit_limit', 'label' => 'Credit Limit', 'type' => 'number'],
                    ['name' => 'vendor_type', 'label' => 'Vendor Type', 'type' => 'select', 'required' => true, 'optionsKey' => 'vendorTypeOptions'],
                    ['name' => 'country_id', 'label' => 'Country', 'type' => 'select', 'optionsKey' => 'countryOptions'],
                    ['name' => 'is_active', 'label' => 'Status', 'type' => 'toggle'],
                ],
                'list_columns' => ['vendor_code' => 'Vendor Code', 'vendor_name' => 'Vendor Name', 'vendor_type' => 'Type'],
            ],
            'warehouse-master' => [
                'key' => 'warehouse-master',
                'title' => 'Warehouse / Location Master',
                'model' => InventoryWarehouse::class,
                'table' => 'inventory_warehouses',
                'key_field' => 'warehouse_code',
                'name_field' => 'warehouse_name',
                'search' => ['warehouse_code', 'warehouse_name', 'warehouse_type'],
                'default_sort' => 'warehouse_code',
                'unique' => ['warehouse_code'],
                'rules' => [
                    'warehouse_code' => ['required', 'string', 'max:30'],
                    'warehouse_name' => ['required', 'string', 'max:150'],
                    'location_id' => ['nullable', 'exists:locations,id'],
                    'address' => ['nullable', 'string'],
                    'warehouse_type' => ['required', 'string', 'max:40'],
                    'storage_temperature_class' => ['nullable', 'string', 'max:50'],
                    'capacity' => ['nullable', 'numeric', 'min:0'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'warehouse_code', 'label' => 'Warehouse Code', 'type' => 'text', 'required' => true],
                    ['name' => 'warehouse_name', 'label' => 'Warehouse Name', 'type' => 'text', 'required' => true],
                    ['name' => 'location_id', 'label' => 'Company/Branch', 'type' => 'select', 'optionsKey' => 'locationOptions'],
                    ['name' => 'address', 'label' => 'Address', 'type' => 'textarea'],
                    ['name' => 'warehouse_type', 'label' => 'Warehouse Type', 'type' => 'select', 'required' => true, 'optionsKey' => 'warehouseTypeOptions'],
                    ['name' => 'storage_temperature_class', 'label' => 'Storage Temperature Class', 'type' => 'text'],
                    ['name' => 'capacity', 'label' => 'Capacity', 'type' => 'number'],
                    ['name' => 'is_active', 'label' => 'Status', 'type' => 'toggle'],
                ],
                'list_columns' => ['warehouse_code' => 'Warehouse Code', 'warehouse_name' => 'Warehouse Name', 'warehouse_type' => 'Type'],
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
                    'warehouse_id' => ['required', 'exists:inventory_warehouses,id'],
                    'zone_code' => ['required', 'string', 'max:30'],
                    'zone_name' => ['required', 'string', 'max:120'],
                    'aisle' => ['nullable', 'string', 'max:40'],
                    'bin_code' => ['required', 'string', 'max:40'],
                    'bin_capacity' => ['nullable', 'numeric', 'min:0'],
                    'temperature_class' => ['nullable', 'string', 'max:50'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'warehouse_id', 'label' => 'Warehouse Link', 'type' => 'select', 'required' => true, 'optionsKey' => 'warehouseOptions'],
                    ['name' => 'zone_code', 'label' => 'Zone Code', 'type' => 'text', 'required' => true],
                    ['name' => 'zone_name', 'label' => 'Zone Name', 'type' => 'text', 'required' => true],
                    ['name' => 'aisle', 'label' => 'Aisle', 'type' => 'text'],
                    ['name' => 'bin_code', 'label' => 'Bin Code', 'type' => 'text', 'required' => true],
                    ['name' => 'bin_capacity', 'label' => 'Bin Capacity', 'type' => 'number'],
                    ['name' => 'temperature_class', 'label' => 'Temperature Class', 'type' => 'text'],
                    ['name' => 'is_active', 'label' => 'Status', 'type' => 'toggle'],
                ],
                'list_columns' => ['zone_code' => 'Zone Code', 'zone_name' => 'Zone Name', 'bin_code' => 'Bin Code'],
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
            'transporter-master' => [
                'key' => 'transporter-master',
                'title' => 'Transporter Master',
                'model' => InventoryTransporter::class,
                'table' => 'inventory_transporters',
                'key_field' => 'transporter_code',
                'name_field' => 'transporter_name',
                'search' => ['transporter_code', 'transporter_name', 'service_area'],
                'default_sort' => 'transporter_code',
                'unique' => ['transporter_code'],
                'rules' => [
                    'transporter_code' => ['required', 'string', 'max:30'],
                    'transporter_name' => ['required', 'string', 'max:150'],
                    'contact_details' => ['nullable', 'string', 'max:255'],
                    'vehicle_types' => ['nullable', 'string', 'max:255'],
                    'service_area' => ['nullable', 'string', 'max:255'],
                    'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'transporter_code', 'label' => 'Transporter Code', 'type' => 'text', 'required' => true],
                    ['name' => 'transporter_name', 'label' => 'Transporter Name', 'type' => 'text', 'required' => true],
                    ['name' => 'contact_details', 'label' => 'Contact Details', 'type' => 'textarea'],
                    ['name' => 'vehicle_types', 'label' => 'Vehicle Types', 'type' => 'text'],
                    ['name' => 'service_area', 'label' => 'Service Area', 'type' => 'text'],
                    ['name' => 'rating', 'label' => 'Rating', 'type' => 'number'],
                    ['name' => 'is_active', 'label' => 'Status', 'type' => 'toggle'],
                ],
                'list_columns' => ['transporter_code' => 'Code', 'transporter_name' => 'Transporter Name', 'rating' => 'Rating'],
            ],
            'customer-master' => [
                'key' => 'customer-master',
                'title' => 'Customer Master',
                'model' => InventoryCustomer::class,
                'table' => 'inventory_customers',
                'key_field' => 'customer_code',
                'name_field' => 'customer_name',
                'search' => ['customer_code', 'customer_name', 'contact_details'],
                'default_sort' => 'customer_code',
                'unique' => ['customer_code'],
                'rules' => [
                    'customer_code' => ['required', 'string', 'max:30'],
                    'customer_name' => ['required', 'string', 'max:150'],
                    'contact_details' => ['nullable', 'string', 'max:255'],
                    'credit_limit' => ['nullable', 'numeric', 'min:0'],
                    'payment_terms' => ['nullable', 'string', 'max:100'],
                    'tax_registration' => ['nullable', 'string', 'max:100'],
                    'country_id' => ['nullable', 'exists:countries,id'],
                    'currency_id' => ['nullable', 'exists:currencies,id'],
                    'is_active' => ['nullable', 'boolean'],
                ],
                'fields' => [
                    ['name' => 'customer_code', 'label' => 'Customer Code', 'type' => 'text', 'required' => true],
                    ['name' => 'customer_name', 'label' => 'Customer Name', 'type' => 'text', 'required' => true],
                    ['name' => 'contact_details', 'label' => 'Contact Details', 'type' => 'textarea'],
                    ['name' => 'credit_limit', 'label' => 'Credit Limit', 'type' => 'number'],
                    ['name' => 'payment_terms', 'label' => 'Payment Terms', 'type' => 'text'],
                    ['name' => 'tax_registration', 'label' => 'Tax Registration', 'type' => 'text'],
                    ['name' => 'country_id', 'label' => 'Country', 'type' => 'select', 'optionsKey' => 'countryOptions'],
                    ['name' => 'currency_id', 'label' => 'Currency', 'type' => 'select', 'optionsKey' => 'currencyOptions'],
                    ['name' => 'is_active', 'label' => 'Status', 'type' => 'toggle'],
                ],
                'list_columns' => ['customer_code' => 'Customer Code', 'customer_name' => 'Customer Name', 'credit_limit' => 'Credit Limit'],
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
}
