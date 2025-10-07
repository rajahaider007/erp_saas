<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use App\Http\Controllers\Auth\LoginController;
use Inertia\Inertia;
use App\Http\Controllers\system\ModuleController;
use App\Http\Controllers\system\SectionController;
use App\Http\Controllers\system\MenuController;
use App\Http\Controllers\system\CompanyController;
use App\Http\Controllers\system\PackageController;
use App\Http\Controllers\system\PackageFeatureController;
use App\Http\Controllers\system\LocationController;
use App\Http\Controllers\system\DepartmentController;
use App\Http\Controllers\system\UserController;
use App\Http\Controllers\system\CurrencyController;

// Public routes
Route::get('/', function () {
    return Inertia::render('Welcome');
});

// Sections Management Routes
Route::prefix('system/sections')->name('system.sections.')->middleware('web.auth')->group(function () {
    Route::get('/', [SectionController::class, 'index'])->middleware('permission:can_view,/system/sections')->name('index');
    Route::get('/create', [SectionController::class, 'create'])->middleware('permission:can_add,/system/sections')->name('create');
    Route::post('/', [SectionController::class, 'store'])->middleware('permission:can_add,/system/sections')->name('store');
    Route::get('/{section}/edit', [SectionController::class, 'edit'])->middleware('permission:can_edit,/system/sections')->name('edit');
    Route::put('/{section}', [SectionController::class, 'update'])->middleware('permission:can_edit,/system/sections')->name('update');
    Route::patch('/{section}', [SectionController::class, 'update'])->middleware('permission:can_edit,/system/sections')->name('update');
    Route::delete('/{section}', [SectionController::class, 'destroy'])->middleware('permission:can_delete,/system/sections')->name('destroy');
    // API
    Route::get('/by-module/{module}', [SectionController::class, 'listByModule'])->middleware('permission:can_view,/system/sections')->name('by-module');
    // Bulk & export
    Route::post('/bulk-status', [SectionController::class, 'bulkUpdateStatus'])->middleware('permission:can_edit,/system/sections')->name('bulk-status');
    Route::post('/bulk-destroy', [SectionController::class, 'bulkDestroy'])->middleware('permission:can_delete,/system/sections')->name('bulk-destroy');
    Route::get('/export-csv', [SectionController::class, 'exportCsv'])->middleware('permission:can_view,/system/sections')->name('export-csv');
});

// Menus Management Routes
Route::prefix('system/menus')->name('system.menus.')->middleware('web.auth')->group(function () {
    Route::get('/', [MenuController::class, 'index'])->name('index');
    Route::get('/create', [MenuController::class, 'create'])->name('create');
    Route::post('/', [MenuController::class, 'store'])->name('store');
    Route::get('/{menu}/edit', [MenuController::class, 'edit'])->name('edit');
    Route::put('/{menu}', [MenuController::class, 'update'])->name('update');
    Route::patch('/{menu}', [MenuController::class, 'update'])->name('update');
    Route::delete('/{menu}', [MenuController::class, 'destroy'])->name('destroy');
    // API
    Route::get('/by-module/{module}', [MenuController::class, 'listByModule'])->name('by-module');
    // Bulk & export
    Route::post('/bulk-status', [MenuController::class, 'bulkUpdateStatus'])->name('bulk-status');
    Route::post('/bulk-destroy', [MenuController::class, 'bulkDestroy'])->name('bulk-destroy');
    Route::get('/export-csv', [MenuController::class, 'exportCsv'])->name('export-csv');
});

Route::get('/login', function () {
    return Inertia::render('Login');
})->name('login');

// Authentication routes (no middleware)
Route::post('/login', [LoginController::class, 'login'])->name('login.submit');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

Route::get('/dashboard', function (Request $request) {
    return Inertia::render('dashboard/index');
})->middleware('web.auth')->name('dashboard');

// Modules page - ERP modules selection
Route::get('/erp-modules', function (Request $request) {
    return Inertia::render('Modules/index');
})->middleware('web.auth')->name('erp.modules');

// Accounts Module Routes
Route::get('/accounts', function (Request $request) {
    return Inertia::render('Modules/Accounts/index');
})->middleware('web.auth')->name('accounts');

Route::get('/accounts/chart-of-accounts', function (Request $request) {
    // User is already authenticated by web.auth middleware
    $userId = $request->input('user_id'); // Set by web.auth middleware

    // Debug: Log the user ID
    Log::info('Chart of Accounts - User ID: ' . $userId);

    $user = DB::table('tbl_users')->where('id', $userId)->first();

    // Debug: Log if user is found
    Log::info('Chart of Accounts - User found: ' . ($user ? 'Yes' : 'No'));

    // Fallback: If user not found, try to get from session directly
    if (!$user) {
        $userId = $request->session()->get('user_id');
        $user = DB::table('tbl_users')->where('id', $userId)->where('status', 'active')->first();
        Log::info('Chart of Accounts - Fallback user found: ' . ($user ? 'Yes' : 'No'));
    }

    $currencies = DB::table('currencies')
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->get();

    // Debug: Log user data
    Log::info('Chart of Accounts - User data:', [
        'user_comp_id' => $user->comp_id ?? 'null',
        'user_location_id' => $user->location_id ?? 'null',
        'session_comp_id' => $request->session()->get('user_comp_id') ?? 'null',
        'session_location_id' => $request->session()->get('user_location_id') ?? 'null',
        'final_comp_id' => $compId ?? 'null',
        'final_location_id' => $locationId ?? 'null'
    ]);

    $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id') ?? $user->comp_id;
    $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id') ?? $user->location_id;

    // Validate required company and location IDs
    if (!$compId || !$locationId) {
        return Inertia::render('Accounts/ChartOfAccounts', [
            'currencies' => $currencies,
            'accounts' => [],
            'error' => 'Company and Location information is required. Please contact administrator.'
        ]);
    }

    $accounts = DB::table('chart_of_accounts')
        ->where('comp_id', $compId)
        ->where('location_id', $locationId)
        ->orderBy('account_code')
        ->get();

    return Inertia::render('Accounts/ChartOfAccounts', [
        'currencies' => $currencies,
        'accounts' => $accounts
    ]);
})->middleware('web.auth')->name('accounts.chart-of-accounts');

// Voucher Number Configuration Routes
Route::prefix('accounts/voucher-number-configuration')->name('accounts.voucher-number-configuration.')->middleware('web.auth')->group(function () {
    Route::get('/', function (Request $request) {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        if (!$compId || !$locationId) {
            return Inertia::render('Accounts/VoucherNumberConfiguration/List', [
                'configurations' => [],
                'error' => 'Company and Location information is required. Please contact administrator.'
            ]);
        }

        $configurations = DB::table('voucher_number_configurations')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->orderBy('voucher_type')
            ->get();

        return Inertia::render('Accounts/VoucherNumberConfiguration/List', [
            'configurations' => [
                'data' => $configurations,
                'total' => $configurations->count(),
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 25,
                'from' => 1,
                'to' => $configurations->count()
            ]
        ]);
    })->name('index');

    Route::get('/create', function (Request $request) {
        return Inertia::render('Accounts/VoucherNumberConfiguration/create');
    })->name('create');

    Route::post('/create', function (Request $request) {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        $userId = $request->input('user_id') ?? $request->session()->get('user_id');

        if (!$compId || !$locationId || !$userId) {
            return redirect()->back()->with('error', 'User authentication information is required.');
        }

        // Validate the request
        $validator = Validator::make($request->all(), [
            'voucher_type' => 'required|string|max:50',
            'prefix' => 'required|string|max:20',
            'number_length' => 'required|integer|min:1|max:10',
            'reset_frequency' => 'required|in:Monthly,Yearly,Never',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // Check if configuration already exists
        $existing = DB::table('voucher_number_configurations')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('voucher_type', $request->voucher_type)
            ->first();

        if ($existing) {
            return redirect()->back()->with('error', 'Configuration already exists for this voucher type')->withInput();
        }

        // Create the configuration
        $id = DB::table('voucher_number_configurations')->insertGetId([
            'comp_id' => $compId,
            'location_id' => $locationId,
            'voucher_type' => $request->voucher_type,
            'prefix' => $request->prefix,
            'running_number' => 1,
            'number_length' => $request->number_length,
            'reset_frequency' => $request->reset_frequency,
            'last_reset_date' => null,
            'is_active' => true,
            'created_by' => $userId,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return redirect()->route('accounts.voucher-number-configuration.index')
            ->with('success', 'Voucher configuration created successfully!');
    });

    Route::get('/{id}/edit', function (Request $request, $id) {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        if (!$compId || !$locationId) {
            return redirect()->route('accounts.voucher-number-configuration.index')
                ->with('error', 'Company and Location information is required.');
        }

        $configuration = DB::table('voucher_number_configurations')
            ->where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->first();

        if (!$configuration) {
            return redirect()->route('accounts.voucher-number-configuration.index')
                ->with('error', 'Configuration not found.');
        }

         return Inertia::render('Accounts/VoucherNumberConfiguration/create', [
             'configuration' => $configuration,
             'id' => $id,
             'edit_mode' => true
         ]);
    })->name('edit');

    Route::get('/{id}/show', function (Request $request, $id) {
        $compId = $request->input('user_comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('user_location_id') ?? $request->session()->get('user_location_id');
        
        if (!$compId || !$locationId) {
            return redirect()->route('accounts.voucher-number-configuration.index')
                ->with('error', 'Company and Location information is required.');
        }

        $configuration = DB::table('voucher_number_configurations')
            ->where('id', $id)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->first();

        if (!$configuration) {
            return redirect()->route('accounts.voucher-number-configuration.index')
                ->with('error', 'Configuration not found.');
        }

        return Inertia::render('Accounts/VoucherNumberConfiguration/show', [
            'configuration' => $configuration
        ]);
    })->name('show');
});

// Chart of Accounts API Routes
Route::prefix('api/chart-of-accounts')->middleware('web.auth')->group(function () {
    Route::get('/', [App\Http\Controllers\Accounts\ChartOfAccountsController::class, 'index']);
    Route::post('/', [App\Http\Controllers\Accounts\ChartOfAccountsController::class, 'store']);
    Route::put('/{id}', [App\Http\Controllers\Accounts\ChartOfAccountsController::class, 'update']);
    Route::delete('/{id}', [App\Http\Controllers\Accounts\ChartOfAccountsController::class, 'destroy']);
});

// Voucher Number Configuration API Routes
Route::prefix('api/voucher-number-configuration')->middleware('web.auth')->group(function () {
    Route::get('/', [App\Http\Controllers\Accounts\VoucherNumberConfigurationController::class, 'index']);
    Route::post('/', [App\Http\Controllers\Accounts\VoucherNumberConfigurationController::class, 'store']);
    Route::put('/{id}', [App\Http\Controllers\Accounts\VoucherNumberConfigurationController::class, 'update']);
    Route::delete('/{id}', [App\Http\Controllers\Accounts\VoucherNumberConfigurationController::class, 'destroy']);
    // Bulk operations
    Route::post('/bulk-status', [App\Http\Controllers\Accounts\VoucherNumberConfigurationController::class, 'bulkUpdateStatus']);
    Route::post('/bulk-destroy', [App\Http\Controllers\Accounts\VoucherNumberConfigurationController::class, 'bulkDestroy']);
    Route::get('/export-csv', [App\Http\Controllers\Accounts\VoucherNumberConfigurationController::class, 'exportCsv']);
});

// Journal Voucher Routes
Route::prefix('accounts/journal-voucher')->name('accounts.journal-voucher.')->middleware('web.auth')->group(function () {
    Route::get('/', [App\Http\Controllers\Accounts\JournalVoucherController::class, 'index'])->name('index');
    Route::get('/create', [App\Http\Controllers\Accounts\JournalVoucherController::class, 'create'])->name('create');
    Route::post('/', [App\Http\Controllers\Accounts\JournalVoucherController::class, 'store'])->name('store');
    Route::get('/{id}', [App\Http\Controllers\Accounts\JournalVoucherController::class, 'show'])->name('show');
    Route::get('/{id}/edit', [App\Http\Controllers\Accounts\JournalVoucherController::class, 'edit'])->name('edit');
    Route::put('/{id}', [App\Http\Controllers\Accounts\JournalVoucherController::class, 'update'])->name('update');
});


// Exchange Rate API Routes
Route::prefix('api/exchange-rate')->middleware('web.auth')->group(function () {
    Route::get('/{fromCurrency}/{toCurrency}', function (Request $request, $fromCurrency, $toCurrency) {
        try {
            $exchangeRateService = new \App\Services\ExchangeRateService();
            $result = $exchangeRateService->convert(1, $fromCurrency, $toCurrency);
            
            if ($result) {
                return response()->json([
                    'success' => true,
                    'rate' => $result['exchange_rate'],
                    'from_currency' => $result['from_currency'],
                    'to_currency' => $result['to_currency'],
                    'from_amount' => $result['from_amount'],
                    'to_amount' => $result['to_amount']
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Unable to fetch exchange rate'
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching exchange rate: ' . $e->getMessage()
            ], 500);
        }
    });
});

// Attachment Upload API Routes
Route::prefix('api')->middleware('web.auth')->group(function () {
    Route::post('/upload-attachments', function (Request $request) {
        try {
            $request->validate([
                'attachments.*' => 'required|file|max:300|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif'
            ]);

            $uploadedAttachments = [];
            
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $filename = time() . '_' . $file->getClientOriginalName();
                    $path = $file->storeAs('voucher-attachments', $filename, 'public');
                    
                    $attachment = [
                        'id' => uniqid(),
                        'name' => $file->getClientOriginalName(),
                        'filename' => $filename,
                        'path' => $path,
                        'url' => asset('storage/' . $path),
                        'size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                        'created_at' => now()
                    ];
                    
                    $uploadedAttachments[] = $attachment;
                }
            }

            return response()->json([
                'success' => true,
                'attachments' => $uploadedAttachments
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error uploading attachments: ' . $e->getMessage()
            ], 500);
        }
    });
});

// Journal Voucher API Routes
Route::prefix('api/journal-voucher')->middleware('web.auth')->group(function () {
    Route::get('/', [App\Http\Controllers\Accounts\JournalVoucherController::class, 'index']);
    Route::post('/', [App\Http\Controllers\Accounts\JournalVoucherController::class, 'store']);
    Route::get('/{id}', [App\Http\Controllers\Accounts\JournalVoucherController::class, 'show']);
    Route::put('/{id}', [App\Http\Controllers\Accounts\JournalVoucherController::class, 'update']);
    Route::delete('/{id}', [App\Http\Controllers\Accounts\JournalVoucherController::class, 'destroy']);
    Route::post('/{id}/post', [App\Http\Controllers\Accounts\JournalVoucherController::class, 'post']);
});

// Set selected module in session
Route::post('/set-current-module', function (Request $request) {
    $request->validate([
        'module_id' => 'required|exists:modules,id'
    ]);

    $module = DB::table('modules')->where('id', $request->module_id)->first();
    if (!$module) {
        return response()->json(['success' => false, 'message' => 'Module not found']);
    }

    // Save module data to session
    session([
        'current_module' => [
            'id' => $module->id,
            'name' => $module->module_name,
            'folder_name' => $module->folder_name,
            'slug' => $module->slug
        ]
    ]);

    return response()->json(['success' => true, 'module' => session('current_module')]);
})->middleware('web.auth');

// Get current module data from session
Route::get('/get-current-module', function (Request $request) {
    $currentModule = session('current_module');

    if (!$currentModule) {
        return response()->json([
            'success' => false,
            'message' => 'No module selected',
            'data' => null
        ]);
    }

    // Get sections and menus for current module
    $sections = DB::table('sections')
        ->where('module_id', $currentModule['id'])
        ->where('status', true)
        ->orderBy('sort_order')
        ->get();

    // Get menus for each section
    $sectionsWithMenus = $sections->map(function ($section) {
        $menus = DB::table('menus')
            ->where('section_id', $section->id)
            ->where('status', true)
            ->orderBy('sort_order')
            ->get();

        $section->menus = $menus;
        return $section;
    });

    return response()->json([
        'success' => true,
        'data' => [
            'module' => $currentModule,
            'sections' => $sectionsWithMenus
        ]
    ]);
})->middleware('web.auth');

// System Module Dashboard
Route::get('/system/dashboard', function (Request $request) {
    // Get system module info
    $moduleData = DB::table('modules')
        ->where('folder_name', 'system')
        ->where('status', true)
        ->first();

    if (!$moduleData) {
        abort(404, 'System module not found');
    }

    // Get system module's sections with their menus
    $sections = DB::table('sections')
        ->where('module_id', $moduleData->id)
        ->where('status', true)
        ->orderBy('sort_order', 'asc')
        ->get();

    // Get all menus for system module
    $menus = DB::table('menus')
        ->join('sections', 'menus.section_id', '=', 'sections.id')
        ->where('sections.module_id', $moduleData->id)
        ->where('menus.status', true)
        ->orderBy('menus.sort_order', 'asc')
        ->select('menus.*', 'sections.id as section_id')
        ->get();

    // Group menus by sections
    $sectionsWithMenus = $sections->map(function ($section) use ($menus) {
        $section->menus = $menus->where('section_id', $section->id)->values();
        return $section;
    });

    return Inertia::render('Modules/Dynamic/index', [
        'module' => $moduleData,
        'sections' => $sectionsWithMenus,
        'menus' => $menus
    ]);
})->middleware('web.auth')->name('system.dashboard');

// Dynamic Module Dashboards
Route::get('/{module}/dashboard', function (Request $request, $module) {
    // Get module info from database
    $moduleData = DB::table('modules')
        ->where('folder_name', $module)
        ->where('status', true)
        ->first();

    if (!$moduleData) {
        abort(404, 'Module not found');
    }

    // Get module's sections with their menus
    $sections = DB::table('sections')
        ->where('module_id', $moduleData->id)
        ->where('status', true)
        ->orderBy('sort_order', 'asc')
        ->get();

    // Get all menus for this module
    $menus = DB::table('menus')
        ->join('sections', 'menus.section_id', '=', 'sections.id')
        ->where('sections.module_id', $moduleData->id)
        ->where('menus.status', true)
        ->orderBy('menus.sort_order', 'asc')
        ->select('menus.*', 'sections.id as section_id')
        ->get();

    // Group menus by sections
    $sectionsWithMenus = $sections->map(function ($section) use ($menus) {
        $section->menus = $menus->where('section_id', $section->id)->values();
        return $section;
    });

    return Inertia::render('Modules/Dynamic/index', [
        'module' => $moduleData,
        'sections' => $sectionsWithMenus,
        'menus' => $menus
    ]);
})->middleware('web.auth')->name('module.dashboard');

// System Module Management Routes (ADD MISSING EDIT ROUTE)
Route::get('/system/AddModules', [ModuleController::class, 'index'])->middleware('web.auth')->name('system.add_modules');
Route::get('/system/AddModules/add', [ModuleController::class, 'create'])->middleware('web.auth')->name('system.add_modules.add');
Route::get('/system/AddModules/{module}/edit', [ModuleController::class, 'edit'])->middleware('web.auth')->name('system.add_modules.edit');
Route::get('/system/AddModules/{module}', [ModuleController::class, 'show'])->middleware('web.auth')->name('system.add_modules.show');

// Module Management Routes
Route::prefix('modules')->name('modules.')->middleware('web.auth')->group(function () {
    // API endpoints (must be before parameterized routes)
    Route::get('/current-module-data', [ModuleController::class, 'getCurrentModuleData'])->name('current-module-data');
    Route::get('/active/list', [ModuleController::class, 'getActiveModules'])->name('active.list');
    Route::get('/api/{id}', [ModuleController::class, 'getSingleModule'])->name('api.single');

    // Main CRUD routes
    Route::get('/', [ModuleController::class, 'index'])->name('index');
    Route::get('/create', [ModuleController::class, 'create'])->name('create');
    Route::post('/', [ModuleController::class, 'store'])->name('store');
    Route::get('/{module}', [ModuleController::class, 'show'])->name('show');
    Route::get('/{module}/edit', [ModuleController::class, 'edit'])->name('edit');
    Route::put('/{module}', [ModuleController::class, 'update'])->name('update');
    Route::patch('/{module}', [ModuleController::class, 'update'])->name('update');
    Route::delete('/{module}', [ModuleController::class, 'destroy'])->name('destroy');

    // Bulk operations
    Route::post('/bulk-status', [ModuleController::class, 'bulkUpdateStatus'])->name('bulk-status');
    Route::post('/bulk-destroy', [ModuleController::class, 'bulkDestroy'])->name('bulk-destroy');
    Route::post('/update-sort-order', [ModuleController::class, 'updateSortOrder'])->name('update-sort-order');

    // Export functionality
    Route::get('/export-csv', [ModuleController::class, 'exportCsv'])->name('export-csv');
});

// Companies Management Routes
Route::prefix('system/companies')->name('system.companies.')->middleware('web.auth')->group(function () {
    Route::get('/', [CompanyController::class, 'index'])->middleware('permission:can_view,/system/companies')->name('index');
    Route::get('/create', [CompanyController::class, 'create'])->middleware('permission:can_add,/system/companies')->name('create');
    Route::post('/', [CompanyController::class, 'store'])->middleware('permission:can_add,/system/companies')->name('store');
    Route::get('/{company}', [CompanyController::class, 'show'])->middleware('permission:can_view,/system/companies')->name('show');
    Route::get('/{company}/edit', [CompanyController::class, 'edit'])->middleware('permission:can_edit,/system/companies')->name('edit');
    Route::put('/{company}', [CompanyController::class, 'update'])->middleware('permission:can_edit,/system/companies')->name('update');
    Route::patch('/{company}', [CompanyController::class, 'update'])->middleware('permission:can_edit,/system/companies')->name('update');
    Route::delete('/{company}', [CompanyController::class, 'destroy'])->middleware('permission:can_delete,/system/companies')->name('destroy');
    // Bulk operations
    Route::post('/bulk-status', [CompanyController::class, 'bulkUpdateStatus'])->middleware('permission:can_edit,/system/companies')->name('bulk-status');
    Route::post('/bulk-destroy', [CompanyController::class, 'bulkDestroy'])->middleware('permission:can_delete,/system/companies')->name('bulk-destroy');
    // Export functionality
    Route::get('/export-csv', [CompanyController::class, 'exportCsv'])->middleware('permission:can_view,/system/companies')->name('export-csv');
});

// Packages Management Routes
Route::prefix('system/packages')->name('system.packages.')->middleware('web.auth')->group(function () {
    Route::get('/', [PackageController::class, 'index'])->name('index');
    Route::get('/create', [PackageController::class, 'create'])->name('create');
    Route::post('/', [PackageController::class, 'store'])->name('store');
    Route::get('/{package}/edit', [PackageController::class, 'edit'])->name('edit');
    Route::put('/{package}', [PackageController::class, 'update'])->name('update');
    Route::patch('/{package}', [PackageController::class, 'update'])->name('update');
    Route::delete('/{package}', [PackageController::class, 'destroy'])->name('destroy');
    // Bulk operations
    Route::post('/bulk-status', [PackageController::class, 'bulkUpdateStatus'])->name('bulk-status');
    Route::post('/bulk-destroy', [PackageController::class, 'bulkDestroy'])->name('bulk-destroy');
    Route::post('/update-sort-order', [PackageController::class, 'updateSortOrder'])->name('update-sort-order');
});

// Package Features Management Routes
Route::prefix('system/package-features')->name('system.package-features.')->middleware('web.auth')->group(function () {
    Route::get('/', [PackageFeatureController::class, 'index'])->name('index');
    Route::get('/create', [PackageFeatureController::class, 'create'])->name('create');
    Route::post('/', [PackageFeatureController::class, 'store'])->name('store');
    Route::get('/{package}/edit', [PackageFeatureController::class, 'edit'])->name('edit');
    Route::put('/{package}', [PackageFeatureController::class, 'update'])->name('update');
    Route::patch('/{package}', [PackageFeatureController::class, 'update'])->name('update');
    Route::delete('/{packageFeature}', [PackageFeatureController::class, 'destroy'])->name('destroy');
    // Bulk operations
    Route::post('/bulk-destroy', [PackageFeatureController::class, 'bulkDestroy'])->name('bulk-destroy');
});

// Locations Management Routes
Route::prefix('system/locations')->name('system.locations.')->middleware('web.auth')->group(function () {
    Route::get('/', [LocationController::class, 'index'])->name('index');
    Route::get('/create', [LocationController::class, 'create'])->name('create');
    Route::post('/', [LocationController::class, 'store'])->name('store');
    Route::get('/{location}/edit', [LocationController::class, 'edit'])->name('edit');
    Route::put('/{location}', [LocationController::class, 'update'])->name('update');
    Route::patch('/{location}', [LocationController::class, 'update'])->name('update');
    Route::delete('/{location}', [LocationController::class, 'destroy'])->name('destroy');
    // Bulk operations
    Route::post('/bulk-status', [LocationController::class, 'bulkUpdateStatus'])->name('bulk-status');
    Route::post('/bulk-destroy', [LocationController::class, 'bulkDestroy'])->name('bulk-destroy');
    Route::post('/update-sort-order', [LocationController::class, 'updateSortOrder'])->name('update-sort-order');
    // API
    Route::get('/by-company/{company}', [LocationController::class, 'listByCompany'])->name('by-company');
});

// Departments Management Routes
Route::prefix('system/departments')->name('system.departments.')->middleware('web.auth')->group(function () {
    Route::get('/', [DepartmentController::class, 'index'])->name('index');
    Route::get('/create', [DepartmentController::class, 'create'])->name('create');
    Route::post('/', [DepartmentController::class, 'store'])->name('store');
    Route::get('/{department}/edit', [DepartmentController::class, 'edit'])->name('edit');
    Route::put('/{department}', [DepartmentController::class, 'update'])->name('update');
    Route::patch('/{department}', [DepartmentController::class, 'update'])->name('update');
    Route::delete('/{department}', [DepartmentController::class, 'destroy'])->name('destroy');
    // Bulk operations
    Route::post('/bulk-status', [DepartmentController::class, 'bulkUpdateStatus'])->name('bulk-status');
    Route::post('/bulk-destroy', [DepartmentController::class, 'bulkDestroy'])->name('bulk-destroy');
    Route::post('/update-sort-order', [DepartmentController::class, 'updateSortOrder'])->name('update-sort-order');
    // API
    Route::get('/by-location/{location}', [DepartmentController::class, 'listByLocation'])->name('by-location');
});

// Users Management Routes
Route::prefix('system/users')->name('system.users.')->middleware('web.auth')->group(function () {
    Route::get('/', [UserController::class, 'index'])->name('index');
    Route::get('/create', [UserController::class, 'create'])->name('create');
    Route::post('/', [UserController::class, 'store'])->name('store');
    Route::get('/{user}', [UserController::class, 'show'])->name('show');
    Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
    Route::get('/{user}/rights', [UserController::class, 'rights'])->name('rights');
    Route::put('/{user}/rights', [UserController::class, 'updateRights'])->name('update-rights');
    Route::put('/{user}', [UserController::class, 'update'])->name('update');
    Route::patch('/{user}', [UserController::class, 'update'])->name('update');
    Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');
    // Bulk operations
    Route::post('/bulk-status', [UserController::class, 'bulkUpdateStatus'])->name('bulk-status');
    Route::post('/bulk-destroy', [UserController::class, 'bulkDestroy'])->name('bulk-destroy');
    // API
    Route::get('/locations/by-company/{company}', [UserController::class, 'getLocationsByCompany'])->name('locations.by-company');
    Route::get('/departments/by-location/{location}', [UserController::class, 'getDepartmentsByLocation'])->name('departments.by-location');
});

// Reports Routes
Route::prefix('accounts/reports')->name('accounts.reports.')->middleware('web.auth')->group(function () {
    // General Ledger Report Routes
    Route::prefix('general-ledger')->name('general-ledger.')->group(function () {
        Route::get('/', [App\Http\Controllers\Reports\GeneralLedgerController::class, 'index'])->name('index');
        Route::post('/data', [App\Http\Controllers\Reports\GeneralLedgerController::class, 'getData'])->name('data');
        Route::post('/export/pdf', [App\Http\Controllers\Reports\GeneralLedgerController::class, 'exportPDF'])->name('export.pdf');
        Route::post('/export/excel', [App\Http\Controllers\Reports\GeneralLedgerController::class, 'exportExcel'])->name('export.excel');
        Route::post('/export/csv', [App\Http\Controllers\Reports\GeneralLedgerController::class, 'exportCSV'])->name('export.csv');
    });
});

// Currencies Management Routes
Route::prefix('system/currencies')->name('system.currencies.')->middleware('web.auth')->group(function () {
    Route::get('/', [CurrencyController::class, 'index'])->name('index');
    Route::get('/create', [CurrencyController::class, 'create'])->name('create');
    Route::post('/', [CurrencyController::class, 'store'])->name('store');
    Route::get('/converter', [CurrencyController::class, 'converter'])->name('converter');
    Route::get('/{currency}', [CurrencyController::class, 'show'])->name('show');
    Route::get('/{currency}/edit', [CurrencyController::class, 'edit'])->name('edit');
    Route::get('/{currency}/history', [CurrencyController::class, 'history'])->name('history');
    Route::put('/{currency}', [CurrencyController::class, 'update'])->name('update');
    Route::patch('/{currency}', [CurrencyController::class, 'update'])->name('update');
    Route::delete('/{currency}', [CurrencyController::class, 'destroy'])->name('destroy');
    // Special actions
    Route::post('/{currency}/toggle-status', [CurrencyController::class, 'toggleStatus'])->name('toggle-status');
    Route::post('/{currency}/set-as-base', [CurrencyController::class, 'setAsBase'])->name('set-as-base');
    Route::post('/bulk-update-rates', [CurrencyController::class, 'bulkUpdateRates'])->name('bulk-update-rates');
    Route::post('/update-from-api', [CurrencyController::class, 'updateFromApi'])->name('update-from-api');
    Route::post('/convert', [CurrencyController::class, 'convertCurrency'])->name('convert');
    // API endpoints for dropdowns
    Route::get('/api/active', [CurrencyController::class, 'getActive'])->name('api.active');
    Route::get('/api/all', [CurrencyController::class, 'getAll'])->name('api.all');
    Route::get('/{currency}/history-data', [CurrencyController::class, 'getHistoryData'])->name('history-data');
});
