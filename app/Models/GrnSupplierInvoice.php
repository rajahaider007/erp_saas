<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GrnSupplierInvoice extends Model
{
    protected $fillable = [
        'comp_id',
        'location_id',
        'invoice_number',
        'vendor_id',
        'voucher_date',
        'reference_number',
        'supplier_invoice_date',
        'due_date',
        'description',
        'notes',
        'status',
        'posted_transaction_id',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'voucher_date' => 'date',
        'supplier_invoice_date' => 'date',
        'due_date' => 'date',
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'vendor_id');
    }

    public function goodsReceiptNotes(): BelongsToMany
    {
        return $this->belongsToMany(GoodsReceiptNote::class, 'grn_supplier_invoice_grns')
            ->withTimestamps();
    }

    public function lineTaxes(): HasMany
    {
        return $this->hasMany(GrnSupplierInvoiceLineTax::class);
    }
}
