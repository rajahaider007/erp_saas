<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class InventoryDocumentNumberService
{
    public const DOCUMENT_PURCHASE_REQUISITION = 'Purchase Requisition';

    public const DOCUMENT_PURCHASE_ORDER = 'Purchase Order';

    public const DOCUMENT_GOODS_RECEIPT_NOTE = 'Goods Receipt Note';

    public const DOCUMENT_GRN_SUPPLIER_INVOICE = 'GRN Supplier Invoice';

    protected const TABLE = 'inventory_document_number_configurations';

    public static function documentTypes(): array
    {
        return [
            self::DOCUMENT_PURCHASE_REQUISITION,
            self::DOCUMENT_PURCHASE_ORDER,
            self::DOCUMENT_GOODS_RECEIPT_NOTE,
            self::DOCUMENT_GRN_SUPPLIER_INVOICE,
        ];
    }

    public static function previewNext(int $compId, int $locationId, string $documentType): string
    {
        $config = self::fetchActiveConfig($compId, $locationId, $documentType);
        if (! $config) {
            $len = 6;

            return self::defaultPrefix($documentType).str_pad('1', $len, '0', STR_PAD_LEFT);
        }

        [$running, $length, $prefix] = self::computeRunningForDisplay($config);

        return $prefix.str_pad((string) $running, $length, '0', STR_PAD_LEFT);
    }

    public static function allocateNext(int $compId, int $locationId, string $documentType): string
    {
        return DB::transaction(function () use ($compId, $locationId, $documentType) {
            $config = DB::table(self::TABLE)
                ->where('comp_id', $compId)
                ->where('location_id', $locationId)
                ->where('document_type', $documentType)
                ->where('is_active', true)
                ->lockForUpdate()
                ->first();

            if (! $config) {
                self::insertDefaultConfig($compId, $locationId, $documentType);
                $config = DB::table(self::TABLE)
                    ->where('comp_id', $compId)
                    ->where('location_id', $locationId)
                    ->where('document_type', $documentType)
                    ->lockForUpdate()
                    ->first();
            }

            if (! $config) {
                return self::defaultPrefix($documentType).str_pad('1', 6, '0', STR_PAD_LEFT);
            }

            $runningNumber = (int) $config->running_number;
            $numberLength = max(1, min(10, (int) $config->number_length));
            $prefix = (string) $config->prefix;
            $resetFrequency = $config->reset_frequency ?? 'Never';
            $lastReset = $config->last_reset_date ?? null;

            $shouldReset = self::shouldResetRunning($resetFrequency, $lastReset);

            if ($shouldReset) {
                $runningNumber = 1;
            }

            $documentNumber = $prefix.str_pad((string) $runningNumber, $numberLength, '0', STR_PAD_LEFT);

            $updates = [
                'running_number' => $runningNumber + 1,
                'updated_at' => now(),
            ];

            if ($shouldReset) {
                $updates['last_reset_date'] = now();
            }

            DB::table(self::TABLE)->where('id', $config->id)->update($updates);

            return $documentNumber;
        });
    }

    private static function fetchActiveConfig(int $compId, int $locationId, string $documentType)
    {
        return DB::table(self::TABLE)
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('document_type', $documentType)
            ->where('is_active', true)
            ->first();
    }

    /**
     * @param  object  $config
     * @return array{0: int, 1: int, 2: string}
     */
    private static function computeRunningForDisplay($config): array
    {
        $runningNumber = (int) $config->running_number;
        $numberLength = max(1, min(10, (int) $config->number_length));
        $prefix = (string) $config->prefix;
        $resetFrequency = $config->reset_frequency ?? 'Never';
        $lastReset = $config->last_reset_date ?? null;

        if (self::shouldResetRunning($resetFrequency, $lastReset)) {
            $runningNumber = 1;
        }

        return [$runningNumber, $numberLength, $prefix];
    }

    private static function shouldResetRunning(string $resetFrequency, ?string $lastResetDate): bool
    {
        if ($resetFrequency === 'Monthly') {
            return ! $lastResetDate || (now()->format('Y-m') !== date('Y-m', strtotime($lastResetDate)));
        }

        if ($resetFrequency === 'Yearly') {
            return ! $lastResetDate || (now()->format('Y') !== date('Y', strtotime($lastResetDate)));
        }

        return false;
    }

    private static function insertDefaultConfig(int $compId, int $locationId, string $documentType): void
    {
        $now = now();
        try {
            DB::table(self::TABLE)->insert([
                'comp_id' => $compId,
                'location_id' => $locationId,
                'document_type' => $documentType,
                'prefix' => self::defaultPrefix($documentType),
                'running_number' => 1,
                'number_length' => 6,
                'reset_frequency' => 'Never',
                'last_reset_date' => null,
                'is_active' => true,
                'created_by' => Auth::id() ?? 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        } catch (\Throwable) {
            // Another request may have inserted the same comp/location/type (race).
        }
    }

    private static function defaultPrefix(string $documentType): string
    {
        return match ($documentType) {
            self::DOCUMENT_PURCHASE_REQUISITION => 'PR-',
            self::DOCUMENT_PURCHASE_ORDER => 'PO-',
            self::DOCUMENT_GOODS_RECEIPT_NOTE => 'GRN-',
            self::DOCUMENT_GRN_SUPPLIER_INVOICE => 'SIV-',
            default => 'INV-',
        };
    }
}
