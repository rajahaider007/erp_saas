<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RecoveryService
{
    /**
     * Save data for recovery before deletion
     * 
     * @param string $table Original table name
     * @param int $recordId Original record ID
     * @param array $data Main record data
     * @param array|null $relatedData Related records (entries, attachments, etc.)
     * @param string|null $identifier User-friendly identifier (e.g., voucher number)
     * @param string|null $reason Reason for deletion
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
                'status' => 'DELETED'
            ]);
            
            return $recoveryId;
        } catch (\Exception $e) {
            Log::error('Recovery save error: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Restore deleted data
     * 
     * @param int $recoveryId Recovery record ID
     * @param string|null $notes Recovery notes
     * @return array Restored data
     */
    public static function restore(int $recoveryId, ?string $notes = null): array
    {
        DB::beginTransaction();
        
        try {
            // Get recovery record
            $recovery = DB::table('tbl_deleted_data_recovery')
                ->where('id', $recoveryId)
                ->where('status', 'DELETED')
                ->first();
            
            if (!$recovery) {
                throw new \Exception('Recovery record not found or already recovered');
            }
            
            // Check if expired
            if (now() > $recovery->recovery_expires_at) {
                throw new \Exception('Recovery period expired');
            }
            
            // Decode data
            $mainData = json_decode($recovery->data_snapshot, true);
            $relatedData = $recovery->related_data ? json_decode($recovery->related_data, true) : null;
            
            // Restore main record
            $newId = DB::table($recovery->original_table)->insertGetId($mainData);
            
            // Restore related data if exists
            if ($relatedData) {
                foreach ($relatedData as $relatedTable => $records) {
                    if (is_array($records)) {
                        foreach ($records as $record) {
                            // Update foreign key to new ID
                            if (isset($record['voucher_id'])) {
                                $record['voucher_id'] = $newId;
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
                    'recovery_notes' => $notes
                ]);
            
            DB::commit();
            
            return [
                'success' => true,
                'new_id' => $newId,
                'original_id' => $recovery->original_id,
                'table' => $recovery->original_table
            ];
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Recovery restore error: ' . $e->getMessage());
            throw $e;
        }
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
                    'status' => 'PERMANENTLY_DELETED'
                ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Permanent delete error: ' . $e->getMessage());
            return false;
        }
    }
}

