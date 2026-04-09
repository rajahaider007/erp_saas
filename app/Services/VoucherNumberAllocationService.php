<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VoucherNumberAllocationService
{
    /**
     * Reserve and return the next voucher number for a voucher type (same rules as journal / cash vouchers).
     */
    public static function allocateNext(int $compId, int $locationId, string $voucherType, ?int $createdBy): string
    {
        $userId = $createdBy !== null && $createdBy > 0 ? $createdBy : 1;

        $config = DB::table('voucher_number_configurations')
            ->where('comp_id', $compId)
            ->where('location_id', $locationId)
            ->where('voucher_type', $voucherType)
            ->where('is_active', true)
            ->first();

        if (! $config) {
            $defaultPrefix = match ($voucherType) {
                'Purchase Invoice' => 'PI',
                'Journal' => 'JV',
                default => 'VN',
            };

            $configId = DB::table('voucher_number_configurations')->insertGetId([
                'comp_id' => $compId,
                'location_id' => $locationId,
                'voucher_type' => $voucherType,
                'prefix' => $defaultPrefix,
                'number_length' => 4,
                'running_number' => 1,
                'reset_frequency' => 'Never',
                'is_active' => true,
                'created_by' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $config = (object) [
                'id' => $configId,
                'running_number' => 1,
                'number_length' => 4,
                'prefix' => $defaultPrefix,
                'reset_frequency' => 'Never',
                'last_reset_date' => null,
            ];
        }

        $runningNumber = (int) $config->running_number;
        $numberLength = max(1, min(20, (int) $config->number_length));
        $prefix = (string) $config->prefix;
        $resetFrequency = $config->reset_frequency ?? 'Never';
        $lastReset = $config->last_reset_date ?? null;

        $shouldReset = false;
        if ($resetFrequency === 'Monthly') {
            $shouldReset = ! $lastReset || (now()->format('Y-m') !== date('Y-m', strtotime((string) $lastReset)));
        } elseif ($resetFrequency === 'Yearly') {
            $shouldReset = ! $lastReset || (now()->format('Y') !== date('Y', strtotime((string) $lastReset)));
        }

        if ($shouldReset) {
            $runningNumber = 1;
            DB::table('voucher_number_configurations')
                ->where('id', $config->id)
                ->update(['last_reset_date' => now()]);
        }

        $voucherNumber = $prefix.str_pad((string) $runningNumber, $numberLength, '0', STR_PAD_LEFT);

        Log::info('Allocated voucher number', [
            'voucher_type' => $voucherType,
            'voucher_number' => $voucherNumber,
            'comp_id' => $compId,
            'location_id' => $locationId,
        ]);

        DB::table('voucher_number_configurations')
            ->where('id', $config->id)
            ->update([
                'running_number' => $runningNumber + 1,
                'updated_at' => now(),
            ]);

        return $voucherNumber;
    }
}
