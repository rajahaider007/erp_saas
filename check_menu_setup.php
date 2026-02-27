<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);
$request = \Illuminate\Http\Request::capture();
$kernel->handle($request);

use App\Models\Module, App\Models\Section, App\Models\Menu, App\Models\User;

echo "=== MODULES ===\n";
Module::all(['id', 'module_name'])->each(fn($m) => echo "{$m->id} - {$m->module_name}\n");

echo "\n=== SECTIONS in Accounts ===\n";
$accountsModule = Module::where('module_name', 'Accounts')->first();
if ($accountsModule) {
    Section::where('module_id', $accountsModule->id)->get(['id', 'module_id', 'section_name'])->each(fn($s) => echo "{$s->id} - {$s->section_name}\n");
}

echo "\n=== EXISTING MENUS for Accounts ===\n";
if ($accountsModule) {
    Menu::where('module_id', $accountsModule->id)->with('section')->get(['id', 'section_id', 'module_id', 'menu_name', 'route'])->each(fn($m) => echo "{$m->id} - {$m->menu_name} ({$m->route}) - Section: {$m->section->section_name}\n");
}

echo "\n=== ALL USERS ===\n";
User::all(['id', 'name', 'email'])->each(fn($u) => echo "{$u->id} - {$u->name} ({$u->email})\n");
