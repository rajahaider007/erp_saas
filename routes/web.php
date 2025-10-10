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

Route::get('/accounts/chart-of-accounts', [App\Http\Controllers\Accounts\ChartOfAccountsController::class, 'index'])->middleware('web.auth')->name('accounts.chart-of-accounts');

// Voucher Number Configuration Routes
Route::prefix('accounts/voucher-number-configuration')->name('accounts.voucher-number-configuration.')->middleware('web.auth')->group(function () {
    Route::get('/', [App\Http\Controllers\Accounts\VoucherNumberConfigurationController::class, 'index'])->name('index');

    Route::get('/create', [App\Http\Controllers\Accounts\VoucherNumberConfigurationController::class, 'create'])->name('create');

    Route::post('/create', [App\Http\Controllers\Accounts\VoucherNumberConfigurationController::class, 'store'])->name('store');

    Route::get('/{id}/edit', [App\Http\Controllers\Accounts\VoucherNumberConfigurationController::class, 'edit'])->name('edit');

    Route::get('/{id}', [App\Http\Controllers\Accounts\VoucherNumberConfigurationController::class, 'show'])->name('show');
    Route::put('/{id}', [App\Http\Controllers\Accounts\VoucherNumberConfigurationController::class, 'update'])->name('update');
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
    // Print routes
    Route::get('/{id}/print-summary', [App\Http\Controllers\Accounts\JournalVoucherController::class, 'printSummary'])->name('print-summary');
    Route::get('/{id}/print-detailed', [App\Http\Controllers\Accounts\JournalVoucherController::class, 'printDetailed'])->name('print-detailed');
    // Post route
    Route::post('/{id}/post', [App\Http\Controllers\Accounts\JournalVoucherController::class, 'post'])->name('post');
    // Delete route
    Route::delete('/{id}', [App\Http\Controllers\Accounts\JournalVoucherController::class, 'destroy'])->name('destroy');
    // Export routes
    Route::get('/export-csv', [App\Http\Controllers\Accounts\JournalVoucherController::class, 'exportCsv'])->name('export-csv');
    Route::get('/export-excel', [App\Http\Controllers\Accounts\JournalVoucherController::class, 'exportExcel'])->name('export-excel');
    Route::get('/export-pdf', [App\Http\Controllers\Accounts\JournalVoucherController::class, 'exportPdf'])->name('export-pdf');
    // Bulk actions
    Route::post('/bulk-post', [App\Http\Controllers\Accounts\JournalVoucherController::class, 'bulkPost'])->name('bulk-post');
});

// General Ledger Routes
Route::prefix('accounts/general-ledger')->name('accounts.general-ledger.')->middleware('web.auth')->group(function () {
    Route::get('/', [App\Http\Controllers\Accounts\GeneralLedgerController::class, 'search'])->name('search');
    Route::get('/report', [App\Http\Controllers\Accounts\GeneralLedgerController::class, 'index'])->name('report');
    Route::get('/print', [App\Http\Controllers\Accounts\GeneralLedgerController::class, 'print'])->name('print');
    Route::get('/export-excel', [App\Http\Controllers\Accounts\GeneralLedgerController::class, 'exportExcel'])->name('export-excel');
    Route::get('/export-pdf', [App\Http\Controllers\Accounts\GeneralLedgerController::class, 'exportPDF'])->name('export-pdf');
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
    Route::post('/upload-attachments', [App\Http\Controllers\AttachmentController::class, 'uploadAttachments']);
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


// Voucher Attachments Routes
Route::prefix('storage/voucher-attachments')->middleware('web.auth')->group(function () {
    Route::get('/{filename}', [App\Http\Controllers\AttachmentController::class, 'serveVoucherAttachment']);
});

Route::prefix('attachments')->middleware('web.auth')->group(function () {
    Route::get('/download/{filename}', [App\Http\Controllers\AttachmentController::class, 'downloadVoucherAttachment']);
    Route::get('/list/{voucherId}', [App\Http\Controllers\AttachmentController::class, 'listVoucherAttachments']);
});

Route::post('/generate-voucher', [App\Http\Controllers\TestController::class, 'generateVoucher']);

Route::post('/transactions', [App\Http\Controllers\TestController::class, 'getTransactions']);

Route::post('/create-voucher', [App\Http\Controllers\TestController::class, 'createVoucher']);


// Set selected module in session
Route::post('/set-current-module', [App\Http\Controllers\ModuleController::class, 'setCurrentModule'])->middleware('web.auth');

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
Route::get('/system/dashboard', [App\Http\Controllers\DashboardController::class, 'systemDashboard'])->middleware('web.auth')->name('system.dashboard');

// Dynamic Module Dashboards
Route::get('/{module}/dashboard', [App\Http\Controllers\DashboardController::class, 'moduleDashboard'])->middleware('web.auth')->name('module.dashboard');

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

// Currency Ledger Routes
Route::get('/accounts/currency-ledger', [App\Http\Controllers\Accounts\CurrencyLedgerController::class, 'search'])->name('currency-ledger');
Route::get('/accounts/currency-ledger/search', [App\Http\Controllers\Accounts\CurrencyLedgerController::class, 'search'])->name('currency-ledger.search');
Route::get('/accounts/currency-ledger/report', [App\Http\Controllers\Accounts\CurrencyLedgerController::class, 'index'])->name('currency-ledger.report');
Route::get('/accounts/currency-ledger/print', [App\Http\Controllers\Accounts\CurrencyLedgerController::class, 'print'])->name('currency-ledger.print');
Route::get('/accounts/currency-ledger/export-excel', [App\Http\Controllers\Accounts\CurrencyLedgerController::class, 'exportExcel'])->name('currency-ledger.export-excel');
Route::get('/accounts/currency-ledger/export-pdf', [App\Http\Controllers\Accounts\CurrencyLedgerController::class, 'exportPDF'])->name('currency-ledger.export-pdf');

// ═══════════════════════════════════════════════════════════
// LOG MANAGEMENT ROUTES
// ═══════════════════════════════════════════════════════════
use App\Http\Controllers\LogController;

Route::prefix('system/logs')->name('logs.')->middleware('web.auth')->group(function () {
    // Activity Logs
    Route::get('/activity', [LogController::class, 'activityLogs'])->name('activity');
    Route::get('/activity/{id}/details', [LogController::class, 'changeDetails'])->name('details');
    Route::get('/timeline', [LogController::class, 'timeline'])->name('timeline');
    
    // Deleted Items & Recovery
    Route::get('/deleted-items', [LogController::class, 'deletedItems'])->name('deleted-items');
    Route::post('/deleted-items/{id}/restore', [LogController::class, 'restore'])->name('restore');
    
    // Security Logs
    Route::get('/security', [LogController::class, 'securityLogs'])->name('security');
    
    // Reports & Analytics
    Route::get('/reports', [LogController::class, 'reports'])->name('reports');
    Route::get('/export', [LogController::class, 'export'])->name('export');
});
