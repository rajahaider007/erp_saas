# Logging System - Quick Implementation Guide

## Overview

This guide provides quick reference for implementing DELETE and UPDATE logging in your ERP system.

---

## When to Log

### ✅ MUST LOG

```php
// Financial Transactions
- Journal Voucher: Create, Update, Delete, Post, Unpost
- Payment/Receipt Vouchers
- Any amount changes
- Account code changes
- Transaction date changes
- Status changes (Draft → Posted)

// Master Data
- Chart of Accounts: Create, Update, Delete
- Currency Rate Changes
- User Permission Changes
- Company Settings

// Security
- Login/Logout
- Failed login attempts
- Permission changes
```

### ❌ DON'T LOG

```php
// No value change
Old: amount = 50000, New: amount = 50000  → Don't log

// Auto-generated fields
- updated_at timestamps
- last_viewed_at
- view_count

// Non-critical reads
- Page views (optional)
- Search queries (optional)
```

---

## DELETE Logging - Step by Step

### Step 1: Save Complete Snapshot BEFORE Delete

```php
// In your Controller delete method

public function destroy($id)
{
    DB::beginTransaction();
    
    try {
        // STEP 1: Get complete data BEFORE delete
        $voucher = DB::table('tbl_voucher')->where('id', $id)->first();
        $entries = DB::table('tbl_voucher_entries')
                     ->where('voucher_id', $id)
                     ->get();
        $attachments = DB::table('tbl_voucher_attachments')
                         ->where('voucher_id', $id)
                         ->get();
        
        // STEP 2: Validate deletion
        if ($voucher->status == 'POSTED') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete posted voucher'
            ], 400);
        }
        
        // STEP 3: Save to recovery table
        DB::table('tbl_deleted_data_recovery')->insert([
            'original_table' => 'tbl_voucher',
            'original_id' => $id,
            'record_identifier' => $voucher->voucher_number,
            'data_snapshot' => json_encode($voucher),
            'related_data' => json_encode([
                'entries' => $entries->toArray(),
                'attachments' => $attachments->toArray()
            ]),
            'deleted_by' => auth()->id(),
            'deleted_at' => now(),
            'delete_reason' => request()->input('reason'),
            'recovery_expires_at' => now()->addDays(90),
            'status' => 'DELETED'
        ]);
        
        // STEP 4: Log to audit trail
        AuditLogService::log(
            'DELETE',
            'Accounts',
            'tbl_voucher',
            $id,
            (array)$voucher,  // old data
            null,              // new data (null for delete)
            "Deleted Journal Voucher: {$voucher->voucher_number}"
        );
        
        // STEP 5: Perform actual deletion
        DB::table('tbl_voucher_entries')->where('voucher_id', $id)->delete();
        DB::table('tbl_voucher_attachments')->where('voucher_id', $id)->delete();
        DB::table('tbl_voucher')->where('id', $id)->delete();
        
        DB::commit();
        
        return response()->json([
            'success' => true,
            'message' => 'Voucher deleted successfully. Can be recovered within 90 days.'
        ]);
        
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Delete error: ' . $e->getMessage());
        return response()->json(['success' => false, 'message' => 'Delete failed'], 500);
    }
}
```

---

## UPDATE Logging - Step by Step

### Step 1: Get Old Data BEFORE Update

```php
public function update(Request $request, $id)
{
    DB::beginTransaction();
    
    try {
        // STEP 1: Get OLD data before any changes
        $oldVoucher = DB::table('tbl_voucher')->where('id', $id)->first();
        $oldEntries = DB::table('tbl_voucher_entries')
                        ->where('voucher_id', $id)
                        ->get()
                        ->toArray();
        
        // Store old data for comparison
        $oldData = [
            'voucher' => (array)$oldVoucher,
            'entries' => $oldEntries
        ];
        
        // STEP 2: Validate request
        $validated = $request->validate([
            'transaction_date' => 'required|date',
            'voucher_type' => 'required',
            'description' => 'required',
            'entries' => 'required|array|min:2',
            // ... more validation
        ]);
        
        // STEP 3: Detect actual changes
        $hasChanges = $this->detectChanges($oldData, $validated);
        
        if (!$hasChanges) {
            return response()->json([
                'success' => false,
                'message' => 'No changes detected'
            ]);
        }
        
        // STEP 4: Update the record
        DB::table('tbl_voucher')->where('id', $id)->update([
            'transaction_date' => $validated['transaction_date'],
            'description' => $validated['description'],
            'updated_at' => now(),
            'updated_by' => auth()->id()
        ]);
        
        // Update entries
        DB::table('tbl_voucher_entries')->where('voucher_id', $id)->delete();
        foreach ($validated['entries'] as $entry) {
            DB::table('tbl_voucher_entries')->insert([
                'voucher_id' => $id,
                'account_code' => $entry['account_code'],
                'debit_amount' => $entry['debit_amount'] ?? 0,
                'credit_amount' => $entry['credit_amount'] ?? 0,
                // ... more fields
            ]);
        }
        
        // STEP 5: Log ONLY if actual changes exist
        $newData = [
            'voucher' => $validated,
            'entries' => $validated['entries']
        ];
        
        AuditLogService::log(
            'UPDATE',
            'Accounts',
            'tbl_voucher',
            $id,
            $oldData,
            $newData,
            "Updated Journal Voucher: {$oldVoucher->voucher_number}"
        );
        
        // STEP 6: Log field-level changes
        $this->logFieldChanges($id, $oldData, $newData);
        
        DB::commit();
        
        return response()->json([
            'success' => true,
            'message' => 'Voucher updated successfully'
        ]);
        
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Update error: ' . $e->getMessage());
        return response()->json(['success' => false, 'message' => 'Update failed'], 500);
    }
}

/**
 * Detect if there are actual changes
 */
private function detectChanges($oldData, $newData)
{
    // Compare voucher fields
    foreach ($newData['voucher'] ?? [] as $key => $newValue) {
        $oldValue = $oldData['voucher'][$key] ?? null;
        
        // Skip auto-generated fields
        if (in_array($key, ['updated_at', 'updated_by'])) {
            continue;
        }
        
        if ($oldValue != $newValue) {
            return true; // Change detected
        }
    }
    
    // Compare entries (simple comparison)
    if (count($oldData['entries']) != count($newData['entries'])) {
        return true;
    }
    
    return false;
}

/**
 * Log field-level changes for detailed tracking
 */
private function logFieldChanges($voucherId, $oldData, $newData)
{
    $changes = [];
    
    // Check voucher-level changes
    foreach ($newData['voucher'] as $field => $newValue) {
        $oldValue = $oldData['voucher'][$field] ?? null;
        
        if ($oldValue != $newValue) {
            DB::table('tbl_change_history')->insert([
                'table_name' => 'tbl_voucher',
                'record_id' => $voucherId,
                'field_name' => $field,
                'old_value' => $oldValue,
                'new_value' => $newValue,
                'changed_by' => auth()->id(),
                'changed_at' => now(),
                'change_type' => 'MANUAL'
            ]);
        }
    }
}
```

---

## Smart Change Detection

### Example: Only Log Actual Changes

```php
/**
 * Smart logging - only log if values actually changed
 */
class AuditLogService
{
    public static function log($action, $module, $table, $recordId, $oldData, $newData, $description)
    {
        // For UPDATE action, verify actual changes exist
        if ($action === 'UPDATE') {
            $changedFields = self::getChangedFields($oldData, $newData);
            
            if (empty($changedFields)) {
                // No actual changes, don't log
                return false;
            }
        }
        
        // Proceed with logging...
        DB::table('tbl_audit_logs')->insert([
            'user_id' => auth()->id(),
            'action_type' => $action,
            'module_name' => $module,
            'table_name' => $table,
            'record_id' => $recordId,
            'old_values' => $oldData ? json_encode($oldData) : null,
            'new_values' => $newData ? json_encode($newData) : null,
            'changed_fields' => $changedFields ? json_encode($changedFields) : null,
            'description' => $description,
            'ip_address' => request()->ip(),
            'created_at' => now()
        ]);
        
        return true;
    }
    
    /**
     * Get only the fields that changed
     */
    private static function getChangedFields($oldData, $newData)
    {
        if (!$oldData || !$newData) {
            return null;
        }
        
        $changes = [];
        
        foreach ($newData as $key => $newValue) {
            // Skip auto-generated fields
            if (in_array($key, ['updated_at', 'updated_by', 'created_at', 'created_by'])) {
                continue;
            }
            
            $oldValue = $oldData[$key] ?? null;
            
            // Check if value actually changed
            if ($oldValue != $newValue) {
                $changes[$key] = [
                    'old' => $oldValue,
                    'new' => $newValue
                ];
            }
        }
        
        return !empty($changes) ? $changes : null;
    }
}
```

---

## Data Recovery

### Restore Deleted Item

```php
public function restore($recoveryId)
{
    DB::beginTransaction();
    
    try {
        // Get recovery record
        $recovery = DB::table('tbl_deleted_data_recovery')
                      ->where('id', $recoveryId)
                      ->where('status', 'DELETED')
                      ->first();
        
        if (!$recovery) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found or already recovered'
            ], 404);
        }
        
        // Check if expired
        if (now() > $recovery->recovery_expires_at) {
            return response()->json([
                'success' => false,
                'message' => 'Recovery period expired'
            ], 400);
        }
        
        // Decode data
        $voucherData = json_decode($recovery->data_snapshot, true);
        $relatedData = json_decode($recovery->related_data, true);
        
        // Restore main record
        $voucherId = DB::table('tbl_voucher')->insertGetId($voucherData);
        
        // Restore related records
        foreach ($relatedData['entries'] as $entry) {
            $entry['voucher_id'] = $voucherId;
            DB::table('tbl_voucher_entries')->insert($entry);
        }
        
        // Log the recovery
        AuditLogService::log(
            'RECOVER',
            'Accounts',
            'tbl_voucher',
            $voucherId,
            null,
            $voucherData,
            "Recovered deleted voucher: {$voucherData['voucher_number']}"
        );
        
        // Update recovery record
        DB::table('tbl_deleted_data_recovery')
          ->where('id', $recoveryId)
          ->update([
              'status' => 'RECOVERED',
              'recovered_at' => now(),
              'recovered_by' => auth()->id()
          ]);
        
        DB::commit();
        
        return response()->json([
            'success' => true,
            'message' => 'Data recovered successfully',
            'voucher_id' => $voucherId
        ]);
        
    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Recovery error: ' . $e->getMessage());
        return response()->json(['success' => false, 'message' => 'Recovery failed'], 500);
    }
}
```

---

## Database Configuration

### Add Separate Log Database Connection

```php
// config/database.php

'connections' => [
    
    // Main database
    'mysql' => [
        'driver' => 'mysql',
        'host' => env('DB_HOST', '127.0.0.1'),
        'database' => env('DB_DATABASE', 'erp_production'),
        'username' => env('DB_USERNAME', 'root'),
        'password' => env('DB_PASSWORD', ''),
        // ...
    ],
    
    // Separate log database
    'logs' => [
        'driver' => 'mysql',
        'host' => env('LOG_DB_HOST', '127.0.0.1'),
        'database' => env('LOG_DB_DATABASE', 'erp_logs'),
        'username' => env('LOG_DB_USERNAME', 'root'),
        'password' => env('LOG_DB_PASSWORD', ''),
        // ...
    ],
    
],
```

### Use Log Database Connection

```php
// Use log database for logging
DB::connection('logs')->table('tbl_audit_logs')->insert([...]);

// Use main database for business data
DB::connection('mysql')->table('tbl_voucher')->insert([...]);
```

---

## Automatic Archival

### Laravel Command for Archival

```php
// app/Console/Commands/ArchiveOldLogs.php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ArchiveOldLogs extends Command
{
    protected $signature = 'logs:archive';
    protected $description = 'Archive old logs to archive database';

    public function handle()
    {
        $this->info('Starting log archival...');
        
        // Move 30+ day logs to archive
        $cutoffDate = now()->subDays(30);
        
        $archived = DB::connection('logs')
            ->table('tbl_audit_logs')
            ->where('created_at', '<', $cutoffDate)
            ->get();
        
        if ($archived->count() > 0) {
            // Insert to archive
            DB::connection('archive')
                ->table('tbl_audit_logs_archive')
                ->insert($archived->toArray());
            
            // Delete from active
            DB::connection('logs')
                ->table('tbl_audit_logs')
                ->where('created_at', '<', $cutoffDate)
                ->delete();
            
            $this->info("Archived {$archived->count()} logs");
        }
        
        // Delete expired recovery items
        $deleted = DB::connection('logs')
            ->table('tbl_deleted_data_recovery')
            ->where('recovery_expires_at', '<', now())
            ->where('status', 'DELETED')
            ->delete();
        
        if ($deleted > 0) {
            $this->info("Deleted {$deleted} expired recovery items");
        }
        
        $this->info('Archival completed!');
    }
}
```

### Schedule the Command

```php
// app/Console/Kernel.php

protected function schedule(Schedule $schedule)
{
    // Run archival daily at 3 AM
    $schedule->command('logs:archive')
             ->dailyAt('03:00')
             ->withoutOverlapping();
}
```

---

## Quick Checklist

### Before Implementation

```
□ Understand DELETE flow
□ Understand UPDATE flow
□ Know when to log vs when not to log
□ Understand change detection logic
□ Review database schema
□ Setup separate log database
```

### During Implementation

```
□ Always get old data BEFORE update/delete
□ Use DB transactions
□ Only log actual changes
□ Save complete snapshot for deletes
□ Log to both audit_logs and change_history
□ Filter sensitive data (passwords)
```

### After Implementation

```
□ Test create, update, delete operations
□ Verify logs are created correctly
□ Test recovery process
□ Check performance impact
□ Setup automatic archival
□ Train users on recovery interface
```

---

## Common Mistakes to Avoid

```php
// ❌ DON'T: Log after deletion
DB::table('tbl_voucher')->where('id', $id)->delete();
// Data is gone, can't log it now!

// ✅ DO: Get data first, then delete
$data = DB::table('tbl_voucher')->where('id', $id)->first();
// Save to recovery table
DB::table('tbl_voucher')->where('id', $id)->delete();


// ❌ DON'T: Log when nothing changed
$old = ['amount' => 50000];
$new = ['amount' => 50000]; // Same value!
AuditLogService::log(...); // Wasteful

// ✅ DO: Check for changes first
if ($old != $new) {
    AuditLogService::log(...);
}


// ❌ DON'T: Store passwords in logs
AuditLogService::log('UPDATE', 'System', 'users', $id, 
    ['password' => 'secret123'], ...); // Security risk!

// ✅ DO: Filter sensitive data
$filtered = filterSensitive($userData);
AuditLogService::log('UPDATE', 'System', 'users', $id, $filtered, ...);
```

---

## Testing

### Test Delete and Recovery

```php
// Test case
public function test_voucher_deletion_and_recovery()
{
    // Create a voucher
    $voucher = Voucher::create([...]);
    
    // Delete it
    $response = $this->delete("/accounts/journal-voucher/{$voucher->id}");
    $response->assertSuccessful();
    
    // Check recovery record exists
    $recovery = DB::table('tbl_deleted_data_recovery')
        ->where('original_table', 'tbl_voucher')
        ->where('original_id', $voucher->id)
        ->first();
    
    $this->assertNotNull($recovery);
    $this->assertEquals('DELETED', $recovery->status);
    
    // Recover it
    $response = $this->post("/recovery/restore/{$recovery->id}");
    $response->assertSuccessful();
    
    // Verify it's back
    $restored = DB::table('tbl_voucher')->where('id', $voucher->id)->first();
    $this->assertNotNull($restored);
}
```

---

**Quick Reference Complete!**

Next steps:
1. Create migration files
2. Create service classes
3. Integrate with controllers
4. Test thoroughly

Good luck! 🚀

