<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserRight extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'menu_id',
        'can_view',
        'can_add',
        'can_edit',
        'can_delete',
    ];

    protected $casts = [
        'can_view' => 'boolean',
        'can_add' => 'boolean',
        'can_edit' => 'boolean',
        'can_delete' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
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