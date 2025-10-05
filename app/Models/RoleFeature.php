<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoleFeature extends Model
{
    use HasFactory;

    protected $fillable = [
        'role_id',
        'menu_id',
        'is_enabled',
    ];

    protected $casts = [
        'is_enabled' => 'boolean'
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
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