<?php

namespace App\Services;

use App\Helpers\FiscalYearHelper;
use App\Models\GoodsReceiptNote;
use App\Models\GoodsReceiptNoteLine;
use App\Models\InventoryItem;
use App\Models\TaxCategory;
use App\Services\Inventory\InventoryLedgerWriter;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class GrnPurchaseInvoicePostingService
{
    private const EAGER = [
        'lines.inventoryItem.inventoryGlAccount',
        'lines.inventoryItem.taxCategory.inputTaxGlAccount',
        'lines.purchaseOrderLine.taxCategory.inputTaxGlAccount',
        'vendor:id,account_code,account_name',
        'currency:id,code',
        'purchaseOrder:id,po_number',
    ];

    /**
     * Post purchase invoice for a single GRN (delegates to {@see postMultiple}).
     *
     * @param  array<int, float>  $lineTaxAmountByLineId
     * @param  array<int, array{account_id: int, debit_amount: float, credit_amount: float, description?: string|null}>  $additionalEntries
     */
    public function post(
        GoodsReceiptNote $grn,
        string $voucherDate,
        ?string $referenceNumber,
        ?string $description,
        int $userId,
        array $lineTaxAmountByLineId = [],
        array $additionalEntries = []
    ): int {
        $grn->load(self::EAGER);

        return $this->postMultiple(
            collect([$grn]),
            $voucherDate,
            $referenceNumber,
            $description,
            $userId,
            $lineTaxAmountByLineId,
            $additionalEntries
        );
    }

    /**
     * Post one purchase invoice voucher covering multiple GRNs (same vendor, company, location, currency).
     *
     * @param  Collection<int, GoodsReceiptNote>  $grns
     * @param  array<int, float>  $lineTaxAmountByLineId
     * @param  array<int, array{account_id: int, debit_amount: float, credit_amount: float, description?: string|null}>  $additionalEntries
     */
    public function postMultiple(
        Collection $grns,
        string $voucherDate,
        ?string $referenceNumber,
        ?string $description,
        int $userId,
        array $lineTaxAmountByLineId = [],
        array $additionalEntries = []
    ): int {
        if ($grns->isEmpty()) {
            throw ValidationException::withMessages([
                'grns' => __('validation.required', ['attribute' => 'grns']),
            ]);
        }

        foreach ($grns as $grn) {
            $grn->loadMissing(self::EAGER);
        }

        $first = $grns->first();
        foreach ($grns as $grn) {
            if ($grn->posted_transaction_id) {
                throw ValidationException::withMessages([
                    'grn' => __('inventory_messages.goods_receipt_note.errors.purchase_invoice_already_posted'),
                ]);
            }
            if ($grn->status !== 'qc_pending') {
                throw ValidationException::withMessages([
                    'grn' => __('inventory_messages.goods_receipt_note.errors.purchase_invoice_wrong_status'),
                ]);
            }
            if ((int) $grn->vendor_id !== (int) $first->vendor_id
                || (int) $grn->comp_id !== (int) $first->comp_id
                || (int) $grn->location_id !== (int) $first->location_id) {
                throw ValidationException::withMessages([
                    'grns' => __('inventory_messages.goods_receipt_note.errors.purchase_invoice_lines_incomplete'),
                ]);
            }
        }

        $this->assertSameCurrencyAndFx($grns, $first);

        $company = DB::table('companies')->where('id', $first->comp_id)->first();
        $defaultCurrency = $company->default_currency_code ?? 'PKR';

        $rawCode = trim((string) ($first->currency?->code ?? $defaultCurrency));
        $documentCurrency = $rawCode !== '' ? mb_strtoupper(mb_substr($rawCode, 0, 3)) : mb_strtoupper(mb_substr($defaultCurrency, 0, 3));
        $fx = $first->fx_rate !== null && $first->fx_rate !== '' && (float) $first->fx_rate > 0
            ? (float) $first->fx_rate
            : 1.0;

        $debitByAccount = [];
        $lineMeta = [];

        foreach ($grns as $grn) {
            foreach ($grn->lines as $line) {
                /** @var GoodsReceiptNoteLine $line */
                $receiptQty = (float) $line->receipt_qty;
                $accepted = $line->accepted_qty !== null && $line->accepted_qty !== ''
                    ? (float) $line->accepted_qty
                    : $receiptQty;
                $accepted = min($accepted, $receiptQty);
                $unitCost = (float) $line->unit_cost;
                $lineForeign = round($accepted * $unitCost, 2);
                if ($lineForeign <= 0) {
                    continue;
                }

                /** @var InventoryItem|null $item */
                $item = $line->inventoryItem;
                $glId = $item?->inventory_gl_account_id;
                if (! $glId) {
                    throw ValidationException::withMessages([
                        'lines' => __('inventory_messages.goods_receipt_note.errors.missing_inventory_gl', [
                            'item' => $item ? $item->item_code : (string) $line->inventory_item_id,
                        ]),
                    ]);
                }

                $debitByAccount[$glId] = ($debitByAccount[$glId] ?? 0) + $lineForeign;
                $lineMeta[] = [
                    'grn_number' => $grn->grn_number,
                    'line_no' => $line->line_no,
                    'item_label' => $item
                        ? $item->item_code.' — '.$item->item_name_short
                        : (string) $line->inventory_item_id,
                    'amount' => $lineForeign,
                    'account_id' => (int) $glId,
                ];
            }
        }

        if ($debitByAccount === []) {
            throw ValidationException::withMessages([
                'lines' => __('inventory_messages.goods_receipt_note.errors.purchase_invoice_zero_amount'),
            ]);
        }

        $taxDebitByAccount = [];
        foreach ($grns as $grn) {
            foreach ($grn->lines as $line) {
                /** @var GoodsReceiptNoteLine $line */
                $receiptQty = (float) $line->receipt_qty;
                $accepted = $line->accepted_qty !== null && $line->accepted_qty !== ''
                    ? (float) $line->accepted_qty
                    : $receiptQty;
                $accepted = min($accepted, $receiptQty);
                $unitCost = (float) $line->unit_cost;
                $lineNetForeign = round($accepted * $unitCost, 2);
                if ($lineNetForeign <= 0) {
                    continue;
                }

                $taxForeign = array_key_exists($line->id, $lineTaxAmountByLineId)
                    ? round((float) $lineTaxAmountByLineId[$line->id], 2)
                    : $this->defaultTaxForeignForLine($line, $lineNetForeign);

                if ($taxForeign < -0.000001) {
                    throw ValidationException::withMessages([
                        'lines' => __('inventory_messages.goods_receipt_note.errors.purchase_invoice_tax_negative'),
                    ]);
                }
                if ($taxForeign < 0.000001) {
                    continue;
                }

                $taxCat = $this->taxCategoryForLine($line);
                $inputGl = $taxCat?->input_tax_gl_account_id;
                if (! $inputGl) {
                    throw ValidationException::withMessages([
                        'lines' => __('inventory_messages.goods_receipt_note.errors.missing_input_tax_gl', [
                            'line' => (string) $line->line_no,
                        ]),
                    ]);
                }

                $taxDebitByAccount[(int) $inputGl] = ($taxDebitByAccount[(int) $inputGl] ?? 0) + $taxForeign;
            }
        }

        $normalizedExtra = [];
        foreach ($additionalEntries as $i => $row) {
            $aid = (int) ($row['account_id'] ?? 0);
            $dr = isset($row['debit_amount']) ? round((float) $row['debit_amount'], 2) : 0.0;
            $cr = isset($row['credit_amount']) ? round((float) $row['credit_amount'], 2) : 0.0;
            if ($dr > 0 && $cr > 0) {
                throw ValidationException::withMessages([
                    "additional_entries.$i" => __('inventory_messages.goods_receipt_note.errors.purchase_invoice_extra_both_sides'),
                ]);
            }
            if ($dr <= 0 && $cr <= 0) {
                continue;
            }
            $normalizedExtra[] = [
                'account_id' => $aid,
                'debit_amount' => $dr,
                'credit_amount' => $cr,
                'description' => isset($row['description']) ? (string) $row['description'] : '',
            ];
        }

        $fiscalYear = FiscalYearHelper::getFiscalYear($voucherDate, $first->comp_id);
        $fiscalPeriod = FiscalYearHelper::getFiscalPeriod($voucherDate, $first->comp_id);

        if (! $fiscalPeriod) {
            throw ValidationException::withMessages([
                'voucher_date' => __('inventory_messages.goods_receipt_note.errors.no_fiscal_period'),
            ]);
        }

        if ($fiscalPeriod->status !== 'Open' && ! $fiscalPeriod->is_adjustment_period) {
            throw ValidationException::withMessages([
                'voucher_date' => __('inventory_messages.goods_receipt_note.errors.fiscal_period_not_open', [
                    'status' => $fiscalPeriod->status,
                ]),
            ]);
        }

        $voucherNumber = VoucherNumberAllocationService::allocateNext(
            $first->comp_id,
            $first->location_id,
            'Purchase Invoice',
            $userId
        );

        $grnRefList = $grns->pluck('grn_number')->unique()->values()->implode(', ');
        if (mb_strlen($grnRefList) > 100) {
            $grnRefList = mb_substr($grnRefList, 0, 97).'…';
        }

        $desc = $description !== null && $description !== ''
            ? mb_substr($description, 0, 250)
            : ($grns->count() === 1
                ? __('inventory_messages.goods_receipt_note.purchase_invoice_default_description', [
                    'grn' => $first->grn_number,
                    'po' => $first->purchaseOrder?->po_number ?? '',
                ])
                : __('inventory_messages.goods_receipt_note.purchase_invoice_default_description_multi', [
                    'grns' => $grns->pluck('grn_number')->unique()->implode(', '),
                ]));

        $taxDescGrnLabel = $grns->count() === 1
            ? $first->grn_number
            : $grns->pluck('grn_number')->unique()->implode(', ');

        $exchangeRate = $fx;

        return (int) DB::transaction(function () use (
            $grns,
            $first,
            $voucherDate,
            $referenceNumber,
            $desc,
            $voucherNumber,
            $fiscalPeriod,
            $documentCurrency,
            $exchangeRate,
            $debitByAccount,
            $taxDebitByAccount,
            $normalizedExtra,
            $lineMeta,
            $userId,
            $grnRefList,
            $fiscalYear,
            $taxDescGrnLabel
        ) {
            $now = now();

            $transactionId = DB::table('transactions')->insertGetId([
                'voucher_number' => $voucherNumber,
                'voucher_date' => $voucherDate,
                'voucher_type' => 'Purchase Invoice',
                'voucher_sub_type' => 'GRN',
                'reference_number' => $referenceNumber !== null && $referenceNumber !== ''
                    ? mb_substr($referenceNumber, 0, 100)
                    : $grnRefList,
                'description' => $desc,
                'status' => 'Posted',
                'total_debit' => 0,
                'total_credit' => 0,
                'currency_code' => $documentCurrency,
                'exchange_rate' => $exchangeRate,
                'base_currency_total' => 0,
                'attachments' => json_encode([]),
                'period_id' => $fiscalPeriod->id,
                'fiscal_year' => $fiscalYear,
                'comp_id' => $first->comp_id,
                'location_id' => $first->location_id,
                'created_by' => $userId,
                'approved_by' => $userId,
                'posted_by' => $userId,
                'approved_at' => $now,
                'posted_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $lineNo = 1;
            $sumForeignDebit = 0.0;
            $sumForeignCredit = 0.0;
            $sumBaseDebit = 0.0;
            $sumBaseCredit = 0.0;

            $insertRow = function (
                int $accountId,
                float $foreignDr,
                float $foreignCr,
                string $entryDesc,
                string $reference
            ) use (
                &$lineNo,
                $transactionId,
                $documentCurrency,
                $exchangeRate,
                $first,
                $now,
                &$sumForeignDebit,
                &$sumForeignCredit,
                &$sumBaseDebit,
                &$sumBaseCredit
            ): void {
                $foreignDr = round($foreignDr, 2);
                $foreignCr = round($foreignCr, 2);
                $baseDr = round($foreignDr * (1 / $exchangeRate), 2);
                $baseCr = round($foreignCr * (1 / $exchangeRate), 2);
                $sumForeignDebit += $foreignDr;
                $sumForeignCredit += $foreignCr;
                $sumBaseDebit += $baseDr;
                $sumBaseCredit += $baseCr;

                DB::table('transaction_entries')->insert([
                    'transaction_id' => $transactionId,
                    'line_number' => $lineNo,
                    'account_id' => $accountId,
                    'description' => $entryDesc !== '' ? mb_substr($entryDesc, 0, 500) : '',
                    'debit_amount' => $foreignDr,
                    'credit_amount' => $foreignCr,
                    'currency_code' => $documentCurrency,
                    'exchange_rate' => $exchangeRate,
                    'base_debit_amount' => $baseDr,
                    'base_credit_amount' => $baseCr,
                    'reference' => mb_substr($reference, 0, 100),
                    'comp_id' => $first->comp_id,
                    'location_id' => $first->location_id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                $lineNo++;
            };

            ksort($debitByAccount);
            foreach ($debitByAccount as $accountId => $foreignDebit) {
                $foreignDebit = round((float) $foreignDebit, 2);
                $entryDesc = collect($lineMeta)
                    ->where('account_id', (int) $accountId)
                    ->map(fn ($m) => $m['grn_number'].'#'.$m['line_no'].' '.$m['item_label'])
                    ->take(5)
                    ->implode('; ');
                if (mb_strlen($entryDesc) > 500) {
                    $entryDesc = mb_substr($entryDesc, 0, 497).'…';
                }
                $insertRow((int) $accountId, $foreignDebit, 0.0, $entryDesc !== '' ? $entryDesc : $desc, $grnRefList);
            }

            ksort($taxDebitByAccount);
            $taxEntryDesc = $grns->count() === 1
                ? __('inventory_messages.goods_receipt_note.purchase_invoice_tax_entry_desc', ['grn' => $taxDescGrnLabel])
                : __('inventory_messages.goods_receipt_note.purchase_invoice_tax_entry_desc_multi', ['grns' => $taxDescGrnLabel]);

            foreach ($taxDebitByAccount as $accountId => $foreignDebit) {
                $foreignDebit = round((float) $foreignDebit, 2);
                $insertRow(
                    (int) $accountId,
                    $foreignDebit,
                    0.0,
                    $taxEntryDesc,
                    $grnRefList
                );
            }

            foreach ($normalizedExtra as $extra) {
                $ref = $referenceNumber !== null && $referenceNumber !== ''
                    ? mb_substr($referenceNumber, 0, 100)
                    : $grnRefList;
                $ed = $extra['description'] !== ''
                    ? mb_substr($extra['description'], 0, 500)
                    : $desc;
                $insertRow(
                    (int) $extra['account_id'],
                    $extra['debit_amount'],
                    $extra['credit_amount'],
                    $ed,
                    $ref
                );
            }

            $sumForeignDebit = round($sumForeignDebit, 2);
            $sumForeignCredit = round($sumForeignCredit, 2);
            $vendorForeign = round($sumForeignDebit - $sumForeignCredit, 2);

            if ($vendorForeign <= 0) {
                throw ValidationException::withMessages([
                    'entries' => __('inventory_messages.goods_receipt_note.errors.purchase_invoice_vendor_not_positive'),
                ]);
            }

            $insertRow((int) $first->vendor_id, 0.0, $vendorForeign, $desc, $referenceNumber !== null && $referenceNumber !== ''
                ? mb_substr($referenceNumber, 0, 100)
                : $grnRefList);

            $sumBaseDebit = round($sumBaseDebit, 2);
            $sumBaseCredit = round($sumBaseCredit, 2);

            DB::table('transactions')->where('id', $transactionId)->update([
                'total_debit' => $sumBaseDebit,
                'total_credit' => $sumBaseCredit,
                'base_currency_total' => $sumBaseDebit,
                'updated_at' => $now,
            ]);

            if (abs($sumBaseDebit - $sumBaseCredit) > 0.02) {
                throw ValidationException::withMessages([
                    'entries' => __('inventory_messages.goods_receipt_note.errors.purchase_invoice_unbalanced'),
                ]);
            }

            InventoryLedgerWriter::recordPurchaseInvoicePosting(
                $grns,
                $transactionId,
                $userId,
                $voucherDate,
                $documentCurrency,
                $now
            );

            foreach ($grns as $grn) {
                $grn->posted_transaction_id = $transactionId;
                $grn->status = 'posted';
                $grn->three_way_match_status = 'matched';
                $grn->updated_by = $userId;
                $grn->save();
            }

            return $transactionId;
        });
    }

    /**
     * @param  Collection<int, GoodsReceiptNote>  $grns
     */
    private function assertSameCurrencyAndFx(Collection $grns, GoodsReceiptNote $first): void
    {
        $cid = $first->currency_id;
        $fx = $first->fx_rate;
        foreach ($grns as $grn) {
            if ((int) ($grn->currency_id ?? 0) !== (int) ($cid ?? 0)) {
                throw ValidationException::withMessages([
                    'grns' => __('inventory_messages.goods_receipt_note.purchase_invoice_multi_currency_mismatch'),
                ]);
            }
            $a = $fx === null || $fx === '' ? 1.0 : (float) $fx;
            $b = $grn->fx_rate === null || $grn->fx_rate === '' ? 1.0 : (float) $grn->fx_rate;
            if (abs($a - $b) > 0.000001) {
                throw ValidationException::withMessages([
                    'grns' => __('inventory_messages.goods_receipt_note.purchase_invoice_multi_currency_mismatch'),
                ]);
            }
        }
    }

    private function taxCategoryForLine(GoodsReceiptNoteLine $line): ?TaxCategory
    {
        $line->loadMissing(['purchaseOrderLine.taxCategory', 'inventoryItem.taxCategory']);

        return $line->purchaseOrderLine?->taxCategory
            ?? $line->inventoryItem?->taxCategory;
    }

    private function defaultTaxForeignForLine(GoodsReceiptNoteLine $line, float $lineNetForeign): float
    {
        $cat = $this->taxCategoryForLine($line);
        if (! $cat) {
            return 0.0;
        }
        $rate = (float) $cat->tax_rate;
        if ($rate <= 0) {
            return 0.0;
        }

        return match ($cat->tax_calculation_method) {
            'fixed_amount' => round(min($rate, max(0.0, $lineNetForeign)), 2),
            default => round($lineNetForeign * ($rate / 100), 2),
        };
    }
}
