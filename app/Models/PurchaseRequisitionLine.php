<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class PurchaseRequisitionLine extends Model
{
    protected $fillable = [
        'purchase_requisition_id',
        'line_no',
        'inventory_item_id',
        'item_description',
        'uom_id',
        'quantity',
        'estimated_unit_price',
        'need_by_date',
        'line_notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:6',
        'estimated_unit_price' => 'decimal:6',
        'need_by_date' => 'date',
    ];

    public function purchaseRequisition(): BelongsTo
    {
        return $this->belongsTo(PurchaseRequisition::class);
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    public function uom(): BelongsTo
    {
        return $this->belongsTo(UomMaster::class, 'uom_id');
    }

    public function purchaseOrderLines(): HasMany
    {
        return $this->hasMany(PurchaseOrderLine::class, 'purchase_requisition_line_id');
    }

    /**
     * Sum of ordered quantities on PO lines linked to this PR line.
     * Draft + approved POs count toward commitment so totals cannot exceed the PR across multiple POs.
     *
     * @param  int|null  $excludePurchaseOrderId  When editing a PO, exclude its current lines from the sum.
     */
    public function sumOrderedOnLinkedPurchaseOrders(?int $excludePurchaseOrderId = null): string
    {
        $q = DB::table('purchase_order_lines as pol')
            ->join('purchase_orders as po', 'po.id', '=', 'pol.purchase_order_id')
            ->where('pol.purchase_requisition_line_id', $this->id)
            ->whereIn('po.status', ['draft', 'approved']);

        if ($excludePurchaseOrderId !== null) {
            $q->where('po.id', '!=', $excludePurchaseOrderId);
        }

        $sum = $q->sum('pol.ordered_qty');

        return (string) ($sum ?? 0);
    }

    /**
     * Quantity still available to place on PO line(s), optionally ignoring an order being edited.
     */
    public function remainingQtyAvailableForPurchaseOrder(?int $excludePurchaseOrderId = null): float
    {
        $ordered = (float) $this->sumOrderedOnLinkedPurchaseOrders($excludePurchaseOrderId);

        return max(0.0, (float) $this->quantity - $ordered);
    }

    /**
     * Total ordered on all linked PO lines (draft + approved). For final capacity checks before approve.
     */
    public function totalOrderedAcrossAllPurchaseOrders(): float
    {
        return (float) $this->sumOrderedOnLinkedPurchaseOrders(null);
    }
}
