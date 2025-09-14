<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PackageFeature extends Model
{
    use HasFactory;

    protected $fillable = [
        'package_id',
        'menu_id',
        'is_enabled',
    ];

    protected $casts = [
        'is_enabled' => 'boolean'
    ];

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }

    /**
     * Get the module through the menu relationship
     */
    public function module()
    {
        return $this->hasOneThrough(Module::class, Menu::class, 'id', 'id', 'menu_id', 'module_id');
    }

    /**
     * Get the section through the menu relationship
     */
    public function section()
    {
        return $this->hasOneThrough(Section::class, Menu::class, 'id', 'id', 'menu_id', 'section_id');
    }
}
