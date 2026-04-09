<?php

namespace App\Services;

use App\Models\GoodsReceiptNote;
use App\Models\GoodsReceiptNoteLine;

class GrnPurchaseInvoicePayloadService
{
    /**
     * @return array<string, mixed>
     */
    public static function serializeGrn(GoodsReceiptNote $doc): array
    {
        $doc->loadMissing([
            'lines.purchaseOrderLine.taxCategory.inputTaxGlAccount',
            'lines.inventoryItem.inventoryGlAccount',
            'lines.inventoryItem.taxCategory.inputTaxGlAccount',
            'vendor:id,account_code,account_name',
            'purchaseOrder:id,po_number',
            'receiveLocation:id,location_name',
            'currency:id,code,name',
        ]);

        $linesOut = [];
        $missingGl = 0;
        $missingTaxGl = 0;
        $totalAcceptedValue = 0.0;
        $totalTaxDefault = 0.0;

        foreach ($doc->lines as $l) {
            /** @var GoodsReceiptNoteLine $l */
            $receiptQty = (float) $l->receipt_qty;
            $accepted = $l->accepted_qty !== null && $l->accepted_qty !== ''
                ? (float) $l->accepted_qty
                : $receiptQty;
            $accepted = min($accepted, $receiptQty);
            $unitCost = (float) $l->unit_cost;
            $lineVal = round($accepted * $unitCost, 2);
            $totalAcceptedValue += $lineVal;

            $item = $l->inventoryItem;
            $gl = $item?->inventoryGlAccount;
            if ($lineVal > 0 && (! $item || ! $item->inventory_gl_account_id)) {
                $missingGl++;
            }

            $taxCat = $l->purchaseOrderLine?->taxCategory ?? $item?->taxCategory;
            $rate = $taxCat ? (float) $taxCat->tax_rate : 0.0;
            $defaultTax = 0.0;
            if ($lineVal > 0 && $taxCat && $rate > 0) {
                $defaultTax = match ($taxCat->tax_calculation_method) {
                    'fixed_amount' => round(min($rate, $lineVal), 2),
                    default => round($lineVal * ($rate / 100), 2),
                };
            }
            $totalTaxDefault += $defaultTax;
            $inputGl = $taxCat?->inputTaxGlAccount;
            if ($lineVal > 0 && $defaultTax > 0.000001 && (! $taxCat || ! $taxCat->input_tax_gl_account_id)) {
                $missingTaxGl++;
            }

            $linesOut[] = [
                'id' => $l->id,
                'line_no' => $l->line_no,
                'item_label' => $item
                    ? $item->item_code.' — '.$item->item_name_short
                    : (string) $l->inventory_item_id,
                'item_description' => $l->item_description ?? '',
                'accepted_qty' => $accepted,
                'unit_cost' => $unitCost,
                'line_value' => $lineVal,
                'inventory_gl_account_id' => $item?->inventory_gl_account_id,
                'inventory_gl_label' => $gl
                    ? $gl->account_code.' — '.$gl->account_name
                    : '',
                'tax_category_id' => $taxCat?->id,
                'tax_code' => $taxCat?->tax_code ?? '',
                'tax_name' => $taxCat?->tax_name ?? '',
                'tax_type' => $taxCat?->tax_type ?? '',
                'tax_rate' => $rate,
                'tax_calculation_method' => $taxCat?->tax_calculation_method ?? 'percentage_net',
                'input_tax_gl_account_id' => $taxCat?->input_tax_gl_account_id,
                'input_tax_gl_label' => $inputGl
                    ? $inputGl->account_code.' — '.$inputGl->account_name
                    : '',
                'default_tax_amount' => $defaultTax,
            ];
        }

        return [
            'id' => $doc->id,
            'grn_number' => $doc->grn_number,
            'status' => $doc->status,
            'receipt_date' => $doc->receipt_date?->format('Y-m-d') ?? '',
            'posting_date' => $doc->posting_date?->format('Y-m-d') ?? '',
            'vendor_display' => $doc->vendor
                ? $doc->vendor->account_code.' - '.$doc->vendor->account_name
                : '',
            'po_number' => $doc->purchaseOrder?->po_number ?? '',
            'receive_location_name' => $doc->receiveLocation?->location_name ?? '',
            'currency_code' => $doc->currency?->code ?? '',
            'fx_rate' => $doc->fx_rate !== null && $doc->fx_rate !== '' ? (string) $doc->fx_rate : '',
            'overall_qc_status' => $doc->overall_qc_status,
            'three_way_match_status' => $doc->three_way_match_status ?? 'pending',
            'notes' => $doc->notes ?? '',
            'lines' => $linesOut,
            'total_accepted_value' => round($totalAcceptedValue, 2),
            'total_default_tax' => round($totalTaxDefault, 2),
            'grand_total_default' => round($totalAcceptedValue + $totalTaxDefault, 2),
            'missing_inventory_gl_lines' => $missingGl,
            'missing_input_tax_gl_lines' => $missingTaxGl,
        ];
    }
}
