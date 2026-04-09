<?php

namespace App\Services;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RecoveryService
{
    /**
     * Base query: recoverable rows visible to the given company (snapshot comp_id/company_id or deleter's company).
     */
    public static function queryRecoverableForCompany(int $compId): Builder
    {
        return DB::table('tbl_deleted_data_recovery as r')
            ->leftJoin('tbl_users as u', 'r.deleted_by', '=', 'u.id')
            ->where('r.status', 'DELETED')
            ->where('r.recovery_expires_at', '>', now())
            ->where(function ($q) use ($compId) {
                $q->whereRaw(
                    'CAST(JSON_UNQUOTE(JSON_EXTRACT(r.data_snapshot, \'$.comp_id\')) AS UNSIGNED) = ?',
                    [$compId]
                )->orWhereRaw(
                    'CAST(JSON_UNQUOTE(JSON_EXTRACT(r.data_snapshot, \'$.company_id\')) AS UNSIGNED) = ?',
                    [$compId]
                )->orWhere('u.comp_id', $compId);
            });
    }

    /**
     * Save data for recovery before deletion
     *
     * @param  string  $table  Original table name
     * @param  int  $recordId  Original record ID
     * @param  array  $data  Main record data
     * @param  array|null  $relatedData  Related records (entries, attachments, etc.)
     * @param  string|null  $identifier  User-friendly identifier (e.g., voucher number)
     * @param  string|null  $reason  Reason for deletion
     * @return int Recovery record ID
     */
    public static function saveForRecovery(
        string $table,
        int $recordId,
        array $data,
        ?array $relatedData = null,
        ?string $identifier = null,
        ?string $reason = null
    ): int {
        try {
            $recoveryId = DB::table('tbl_deleted_data_recovery')->insertGetId([
                'original_table' => $table,
                'original_id' => $recordId,
                'record_identifier' => $identifier,
                'data_snapshot' => json_encode($data),
                'related_data' => $relatedData ? json_encode($relatedData) : null,
                'deleted_by' => Auth::id(),
                'deleted_at' => now(),
                'delete_reason' => $reason,
                'delete_ip' => request()->ip(),
                'recovery_expires_at' => now()->addDays(90),
                'status' => 'DELETED',
            ]);

            return $recoveryId;
        } catch (\Exception $e) {
            Log::error('Recovery save error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Restore deleted data
     *
     * @param  int  $recoveryId  Recovery record ID
     * @param  string|null  $notes  Recovery notes
     * @return array Restored data
     */
    public static function restore(int $recoveryId, ?string $notes = null): array
    {
        $compId = (int) session('user_comp_id');
        if (! $compId) {
            throw new \Exception('Company context required');
        }
        if (! self::queryRecoverableForCompany($compId)->where('r.id', $recoveryId)->exists()) {
            throw new \Exception('Recovery record not found or access denied');
        }

        DB::beginTransaction();

        try {
            // Get recovery record
            $recovery = DB::table('tbl_deleted_data_recovery')
                ->where('id', $recoveryId)
                ->where('status', 'DELETED')
                ->first();

            if (! $recovery) {
                throw new \Exception('Recovery record not found or already recovered');
            }

            // Check if expired
            if (now() > $recovery->recovery_expires_at) {
                throw new \Exception('Recovery period expired');
            }

            // Decode data
            $mainData = json_decode($recovery->data_snapshot, true);
            $relatedData = $recovery->related_data ? json_decode($recovery->related_data, true) : null;

            if (! is_array($mainData)) {
                throw new \Exception('Invalid recovery snapshot');
            }

            // Restore main record
            $newId = DB::table($recovery->original_table)->insertGetId($mainData);

            // Restore related data if exists
            if (is_array($relatedData)) {
                foreach ($relatedData as $relatedTable => $records) {
                    if (is_array($records)) {
                        foreach ($records as $record) {
                            $record = is_array($record)
                                ? $record
                                : json_decode(json_encode($record), true);
                            if (! is_array($record)) {
                                continue;
                            }
                            if (array_key_exists('voucher_id', $record)) {
                                $record['voucher_id'] = $newId;
                            }
                            if (array_key_exists('transaction_id', $record)) {
                                $record['transaction_id'] = $newId;
                            }
                            if (array_key_exists('purchase_requisition_id', $record)) {
                                $record['purchase_requisition_id'] = $newId;
                            }
                            DB::table($relatedTable)->insert($record);
                        }
                    }
                }
            }

            // Log the recovery
            AuditLogService::log(
                'RECOVER',
                'Recovery',
                $recovery->original_table,
                $newId,
                null,
                $mainData,
                "Recovered deleted record: {$recovery->record_identifier}"
            );

            // Update recovery record
            DB::table('tbl_deleted_data_recovery')
                ->where('id', $recoveryId)
                ->update([
                    'status' => 'RECOVERED',
                    'recovered_at' => now(),
                    'recovered_by' => Auth::id(),
                    'recovery_notes' => $notes,
                ]);

            DB::commit();

            return [
                'success' => true,
                'new_id' => $newId,
                'original_id' => $recovery->original_id,
                'table' => $recovery->original_table,
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Recovery restore error: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Remove a recovery entry permanently (no restore possible). Row is deleted from the recovery table.
     */
    public static function purgeFromRecycleBin(int $recoveryId): bool
    {
        $compId = (int) session('user_comp_id');
        if (! $compId) {
            throw new \Exception('Company context required');
        }

        $recovery = self::queryRecoverableForCompany($compId)
            ->where('r.id', $recoveryId)
            ->select('r.id', 'r.record_identifier', 'r.original_table', 'r.original_id')
            ->first();

        if (! $recovery) {
            throw new \Exception('Recovery record not found or access denied');
        }

        DB::table('tbl_deleted_data_recovery')->where('id', $recoveryId)->delete();

        AuditLogService::log(
            'DELETE',
            'Recovery',
            'tbl_deleted_data_recovery',
            (int) $recovery->id,
            null,
            [
                'original_table' => $recovery->original_table,
                'original_id' => $recovery->original_id,
                'record_identifier' => $recovery->record_identifier,
            ],
            'Purged item from deleted-data recovery (backup removed)'
        );

        return true;
    }

    /**
     * Get all recoverable items
     */
    public static function getRecoverableItems(?string $table = null, int $limit = 100)
    {
        $query = DB::table('tbl_deleted_data_recovery as r')
            ->leftJoin('tbl_users as u', 'r.deleted_by', '=', 'u.id')
            ->select(
                'r.*',
                'u.name as deleted_by_name',
                'u.email as deleted_by_email'
            )
            ->where('r.status', 'DELETED')
            ->where('r.recovery_expires_at', '>', now());

        if ($table) {
            $query->where('r.original_table', $table);
        }

        return $query
            ->orderBy('r.deleted_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Delete permanently (called by cleanup job)
     */
    public static function permanentDelete(int $recoveryId): bool
    {
        try {
            DB::table('tbl_deleted_data_recovery')
                ->where('id', $recoveryId)
                ->update([
                    'status' => 'PERMANENTLY_DELETED',
                ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Permanent delete error: '.$e->getMessage());

            return false;
        }
    }
}
