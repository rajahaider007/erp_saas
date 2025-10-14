<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UpdateExistingChartOfAccountsDataSeeder extends Seeder
{
    /**
     * This seeder updates existing chart of accounts data to the new 4-level structure
     * It specifically handles the transformation you requested:
     * Level 1: Assets
     * Level 2: Current Assets  
     * Level 3: Cash Account / Cash In Hand (NEW)
     * Level 4: Cash in Hand (moved from Level 3)
     */
    public function run(): void
    {
        $this->command->info('Starting Chart of Accounts 4-Level Data Migration...');
        
        DB::transaction(function () {
            // Step 1: Update existing Level 3 accounts to Level 4
            $this->command->info('Step 1: Converting Level 3 accounts to Level 4...');
            DB::statement("UPDATE chart_of_accounts SET account_level = 4 WHERE account_level = 3");
            
            // Step 2: Update the is_transactional flag
            $this->command->info('Step 2: Updating account flags...');
            DB::statement("UPDATE chart_of_accounts SET 
                is_transactional = CASE 
                    WHEN account_level = 4 THEN true 
                    ELSE false 
                END
            ");
            
            // Step 3: Create Level 3 sub-parent accounts
            $this->command->info('Step 3: Creating Level 3 sub-parent accounts...');
            $this->createLevel3SubParentAccounts();
            
            // Step 4: Update parent references
            $this->command->info('Step 4: Updating parent-child relationships...');
            $this->updateParentReferences();
            
            $this->command->info('Migration completed successfully!');
        });
    }
    
    /**
     * Create Level 3 sub-parent accounts for existing Level 4 accounts
     */
    private function createLevel3SubParentAccounts(): void
    {
        // Get all Level 4 accounts grouped by their current parent (Level 2)
        $level4Accounts = DB::table('chart_of_accounts')
            ->where('account_level', 4)
            ->get();
            
        $parentGroups = $level4Accounts->groupBy('parent_account_id');
        $level3AccountsCreated = [];
        
        foreach ($parentGroups as $level2ParentId => $level4AccountsGroup) {
            if (!$level2ParentId) continue;
            
            // Get the Level 2 parent account details
            $level2Parent = DB::table('chart_of_accounts')
                ->where('id', $level2ParentId)
                ->first();
                
            if (!$level2Parent) continue;
            
            $this->command->info("  Processing Level 2: {$level2Parent->account_name}");
            
            foreach ($level4AccountsGroup as $level4Account) {
                // Generate Level 3 account name based on the Level 4 account
                $level3AccountName = $this->generateLevel3AccountName($level4Account->account_name, $level2Parent->account_name);
                
                // Check if we already created a similar Level 3 account
                $existingLevel3 = collect($level3AccountsCreated)->first(function ($level3) use ($level3AccountName, $level2ParentId) {
                    return $level3['account_name'] === $level3AccountName && $level3['level2_parent_id'] == $level2ParentId;
                });
                
                if ($existingLevel3) {
                    // Use existing Level 3 account
                    $level3AccountId = $existingLevel3['id'];
                    $this->command->info("    Using existing Level 3: {$level3AccountName}");
                } else {
                    // Create new Level 3 sub-parent account
                    $sequenceNumber = count(array_filter($level3AccountsCreated, function($acc) use ($level2ParentId) {
                        return $acc['level2_parent_id'] == $level2ParentId;
                    })) + 1;
                    
                    $level3AccountId = DB::table('chart_of_accounts')->insertGetId([
                        'account_code' => $this->generateLevel3Code($level2Parent->account_code, $sequenceNumber),
                        'account_name' => $level3AccountName,
                        'account_type' => $level2Parent->account_type,
                        'parent_account_id' => $level2ParentId,
                        'account_level' => 3,
                        'is_transactional' => false,
                        'currency' => $level2Parent->currency,
                        'status' => $level2Parent->status,
                        'short_code' => $this->generateLevel3ShortCode($level4Account->short_code, $level2Parent->short_code),
                        'comp_id' => $level2Parent->comp_id,
                        'location_id' => $level2Parent->location_id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    
                    $level3AccountsCreated[] = [
                        'id' => $level3AccountId,
                        'account_name' => $level3AccountName,
                        'level2_parent_id' => $level2ParentId
                    ];
                    
                    $this->command->info("    Created Level 3: {$level3AccountName} (Code: {$this->generateLevel3Code($level2Parent->account_code, $sequenceNumber)})");
                }
                
                // Store mapping for updating this specific Level 4 account
                DB::table('temp_level3_mapping')->insert([
                    'old_parent_id' => $level2ParentId,
                    'new_parent_id' => $level3AccountId,
                    'level4_account_id' => $level4Account->id,
                    'created_at' => now(),
                ]);
                
                $this->command->info("    Mapped Level 4: {$level4Account->account_name} -> Level 3: {$level3AccountName}");
            }
        }
    }
    
    /**
     * Update parent references for Level 4 accounts
     */
    private function updateParentReferences(): void
    {
        $mappings = DB::table('temp_level3_mapping')->get();
        
        foreach ($mappings as $mapping) {
            $level4Account = DB::table('chart_of_accounts')->find($mapping->level4_account_id);
            $level3Account = DB::table('chart_of_accounts')->find($mapping->new_parent_id);
            
            DB::table('chart_of_accounts')
                ->where('id', $mapping->level4_account_id)
                ->update(['parent_account_id' => $mapping->new_parent_id]);
                
            $this->command->info("    Updated: {$level4Account->account_name} -> Parent: {$level3Account->account_name}");
        }
        
        // Clean up temporary table
        DB::statement('DROP TABLE IF EXISTS temp_level3_mapping');
    }
    
    /**
     * Generate Level 3 account code based on Level 2 parent code
     */
    private function generateLevel3Code(string $level2Code, int $sequenceNumber = 1): string
    {
        // Level 2 code format: 100010000000000
        // Level 3 code format: 100010001000000, 100010002000000, etc.
        $baseCode = substr($level2Code, 0, 7); // Get first 7 digits (1000100)
        return $baseCode . str_pad($sequenceNumber, 3, '0', STR_PAD_LEFT) . '000000'; // Add sequence + 000000
    }
    
    /**
     * Generate Level 3 account name based on Level 4 account
     */
    private function generateLevel3AccountName(string $level4AccountName, string $level2AccountName): string
    {
        $level4Lower = strtolower($level4AccountName);
        
        // Special cases for common account types
        if (strpos($level4Lower, 'cash') !== false && strpos($level4Lower, 'hand') !== false) {
            return 'Cash Account / Cash In Hand';
        }
        
        if (strpos($level4Lower, 'bank') !== false) {
            return 'Bank Account';
        }
        
        if (strpos($level4Lower, 'accounts receivable') !== false || strpos($level4Lower, 'debtors') !== false) {
            return 'Accounts Receivable';
        }
        
        if (strpos($level4Lower, 'accounts payable') !== false || strpos($level4Lower, 'creditors') !== false) {
            return 'Accounts Payable';
        }
        
        if (strpos($level4Lower, 'inventory') !== false || strpos($level4Lower, 'stock') !== false) {
            return 'Inventory Account';
        }
        
        if (strpos($level4Lower, 'fixed asset') !== false || strpos($level4Lower, 'equipment') !== false) {
            return 'Fixed Assets';
        }
        
        if (strpos($level4Lower, 'office supplies') !== false || strpos($level4Lower, 'stationery') !== false) {
            return 'Office Supplies';
        }
        
        if (strpos($level4Lower, 'rent') !== false) {
            return 'Rent Expenses';
        }
        
        if (strpos($level4Lower, 'salary') !== false || strpos($level4Lower, 'wages') !== false) {
            return 'Salary & Wages';
        }
        
        // Default: Use the Level 4 account name as Level 3 name
        return $level4AccountName;
    }
    
    /**
     * Generate Level 3 short code
     */
    private function generateLevel3ShortCode(?string $level4ShortCode, ?string $level2ShortCode): ?string
    {
        if (!$level4ShortCode && !$level2ShortCode) {
            return null;
        }
        
        // If Level 4 has short code, use it as base
        if ($level4ShortCode) {
            return $level4ShortCode;
        }
        
        // If Level 2 has short code, use it
        if ($level2ShortCode) {
            return $level2ShortCode;
        }
        
        return null;
    }
}
