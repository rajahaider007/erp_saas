<?php

namespace App\Models\Sales;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Company;
use App\Models\Currency;
use App\Models\Location;

class Customer extends Model
{
    protected $table = 'sales_customers';

    protected $fillable = [
        'comp_id',
        'location_id',
        'customer_code',
        'customer_name',
        'customer_type',
        'parent_company_id',
        'registration_no',
        'tax_id',
        'industry_sector',
        'customer_since',
        'active_status',
        'primary_email',
        'secondary_email',
        'phone',
        'mobile',
        'billing_address',
        'shipping_address',
        'language_preference',
        'time_zone',
        'currency_id',
        'pricelist_id',
        'payment_terms',
        'credit_limit',
        'credit_limit_warning_percent',
        'tax_category',
        'tax_group_id',
        'receivable_account_id',
        'salesperson_id',
        'sales_team_id',
        'collection_officer_id',
        'default_warehouse_id',
        'default_delivery_method',
        'incoterms',
        'delivery_instructions',
        'notes',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'customer_since' => 'date',
        'active_status' => 'boolean',
        'credit_limit' => 'decimal:2',
        'credit_limit_warning_percent' => 'decimal:2',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'comp_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    public function quotations(): HasMany
    {
        return $this->hasMany(Quotation::class);
    }

    public function salesOrders(): HasMany
    {
        return $this->hasMany(SalesOrder::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}
