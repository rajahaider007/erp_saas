<?php

use Illuminate\Support\Facades\Route;
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

// Public routes
Route::get('/', function () {
    return Inertia::render('Welcome');
});

// Sections Management Routes
Route::prefix('system/sections')->name('system.sections.')->group(function () {
    Route::get('/', [SectionController::class, 'index'])->name('index');
    Route::get('/create', [SectionController::class, 'create'])->name('create');
    Route::post('/', [SectionController::class, 'store'])->name('store');
    Route::get('/{section}/edit', [SectionController::class, 'edit'])->name('edit');
    Route::put('/{section}', [SectionController::class, 'update'])->name('update');
    Route::patch('/{section}', [SectionController::class, 'update'])->name('update');
    Route::delete('/{section}', [SectionController::class, 'destroy'])->name('destroy');
    // API
    Route::get('/by-module/{module}', [SectionController::class, 'listByModule'])->name('by-module');
    // Bulk & export
    Route::post('/bulk-status', [SectionController::class, 'bulkUpdateStatus'])->name('bulk-status');
    Route::post('/bulk-destroy', [SectionController::class, 'bulkDestroy'])->name('bulk-destroy');
    Route::get('/export-csv', [SectionController::class, 'exportCsv'])->name('export-csv');
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

Route::get('/dashboard', function () {
    return Inertia::render('dashboard/index');
})->name('dashboard');

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
    Route::get('/', [CompanyController::class, 'index'])->name('index');
    Route::get('/create', [CompanyController::class, 'create'])->name('create');
    Route::post('/', [CompanyController::class, 'store'])->name('store');
    Route::get('/{company}', [CompanyController::class, 'show'])->name('show');
    Route::get('/{company}/edit', [CompanyController::class, 'edit'])->name('edit');
    Route::put('/{company}', [CompanyController::class, 'update'])->name('update');
    Route::patch('/{company}', [CompanyController::class, 'update'])->name('update');
    Route::delete('/{company}', [CompanyController::class, 'destroy'])->name('destroy');
    // Bulk operations
    Route::post('/bulk-status', [CompanyController::class, 'bulkUpdateStatus'])->name('bulk-status');
    Route::post('/bulk-destroy', [CompanyController::class, 'bulkDestroy'])->name('bulk-destroy');
    // Export functionality
    Route::get('/export-csv', [CompanyController::class, 'exportCsv'])->name('export-csv');
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