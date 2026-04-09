<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GrnSupplierInvoiceLineTax extends Model
{
    protected $fillable = [
        'grn_supplier_invoice_id',
        'goods_receipt_note_line_id',
        'tax_amount',
    ];

    protected $casts = [
        'tax_amount' => 'decimal:2',
    ];

    public function grnSupplierInvoice(): BelongsTo
    {
        return $this->belongsTo(GrnSupplierInvoice::class);
    }

    public function goodsReceiptNoteLine(): BelongsTo
    {
        return $this->belongsTo(GoodsReceiptNoteLine::class);
    }
}
