<?php

use Illuminate\Support\Facades\Route;
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

// Public routes
Route::get('/', function () {
    return Inertia::render('Welcome');
});

// Sections Management Routes
Route::prefix('system/sections')->name('system.sections.')->group(function () {
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
Route::prefix('system/menus')->name('system.menus.')->group(function () {
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
    
    // Get module's sections and menus
    $sections = DB::table('sections')
        ->where('module_id', $moduleData->id)
        ->where('status', true)
        ->orderBy('sort_order', 'asc')
        ->get();
    
    $menus = DB::table('menus')
        ->join('sections', 'menus.section_id', '=', 'sections.id')
        ->where('sections.module_id', $moduleData->id)
        ->where('menus.status', true)
        ->orderBy('sections.sort_order', 'asc')
        ->orderBy('menus.sort_order', 'asc')
        ->select('menus.*', 'sections.section_name')
        ->get();
    
    return Inertia::render('Modules/Dynamic/index', [
        'module' => $moduleData,
        'sections' => $sections,
        'menus' => $menus
    ]);
})->middleware('web.auth')->name('module.dashboard');

// System Module Management Routes (ADD MISSING EDIT ROUTE)
Route::get('/system/AddModules', [ModuleController::class, 'index'])->name('system.add_modules');
Route::get('/system/AddModules/add', [ModuleController::class, 'create'])->name('system.add_modules.add');
Route::get('/system/AddModules/{module}/edit', [ModuleController::class, 'edit'])->name('system.add_modules.edit');
Route::get('/system/AddModules/{module}', [ModuleController::class, 'show'])->name('system.add_modules.show');

// Module Management Routes
Route::prefix('modules')->name('modules.')->group(function () {
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
    
    // API endpoints
    Route::get('/active/list', [ModuleController::class, 'getActiveModules'])->name('active.list');
    Route::get('/api/{id}', [ModuleController::class, 'getSingleModule'])->name('api.single');
});

// Companies Management Routes
Route::prefix('system/companies')->name('system.companies.')->group(function () {
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
Route::prefix('system/packages')->name('system.packages.')->group(function () {
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
Route::prefix('system/package-features')->name('system.package-features.')->group(function () {
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
Route::prefix('system/locations')->name('system.locations.')->group(function () {
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
Route::prefix('system/departments')->name('system.departments.')->group(function () {
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
Route::prefix('system/users')->name('system.users.')->group(function () {
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