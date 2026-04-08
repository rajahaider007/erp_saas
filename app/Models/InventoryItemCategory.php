<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItemCategory extends Model
{
    use SoftDeletes;

    protected $table = 'inventory_item_categories';

    protected $fillable = [
        'comp_id',
        'location_id',
        'category_code',
        'category_name',
        'item_class_id',
        'description',
        'is_active',
        'inventory_gl_account_id',
        'purchase_gl_account_id',
        'sales_gl_account_id',
        'cogs_gl_account_id',
    ];

    protected $casts = [
        'comp_id' => 'integer',
        'location_id' => 'integer',
        'item_class_id' => 'integer',
        'is_active' => 'boolean',
        'inventory_gl_account_id' => 'integer',
        'purchase_gl_account_id' => 'integer',
        'sales_gl_account_id' => 'integer',
        'cogs_gl_account_id' => 'integer',
    ];

    public function itemClass()
    {
        return $this->belongsTo(InventoryItemClass::class, 'item_class_id');
    }

    public function inventoryGlAccount()
    {
        return $this->belongsTo(ChartOfAccount::class, 'inventory_gl_account_id');
    }

    public function purchaseGlAccount()
    {
        return $this->belongsTo(ChartOfAccount::class, 'purchase_gl_account_id');
    }

    public function salesGlAccount()
    {
        return $this->belongsTo(ChartOfAccount::class, 'sales_gl_account_id');
    }

    public function cogsGlAccount()
    {
        return $this->belongsTo(ChartOfAccount::class, 'cogs_gl_account_id');
    }

    public function classes()
    {
        return $this->belongsToMany(
            InventoryItemClass::class,
            'inventory_category_class',
            'category_id',
            'class_id'
        )->withTimestamps();
    }

    public function scopeByCompanyAndLocation($query, $compId, $locationId)
    {
        return $query->where('comp_id', $compId)->where('location_id', $locationId);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
