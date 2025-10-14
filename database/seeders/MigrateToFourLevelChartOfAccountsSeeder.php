<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MigrateToFourLevelChartOfAccountsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * This seeder migrates existing 3-level chart of accounts to 4-level structure
     */
    public function run(): void
    {
        DB::transaction(function () {
            // Step 1: Update existing Level 3 accounts to Level 4
            DB::statement("UPDATE chart_of_accounts SET account_level = 4 WHERE account_level = 3");
            
            // Step 2: Update the supports_children and is_transactional flags
            DB::statement("UPDATE chart_of_accounts SET is_transactional = CASE 
            WHEN account_level = 4 THEN true 
            ELSE false 
        END");
            
            // Step 3: Insert Level 3 sub-parent accounts for existing Level 4 accounts
            $this->createLevel3Accounts();
            
            // Step 4: Update parent_account_id for Level 4 accounts to point to new Level 3 accounts
            $this->updateLevel4ParentReferences();
        });
    }
    
    /**
     * Create Level 3 sub-parent accounts for existing Level 4 accounts
     */
    private function createLevel3Accounts(): void
    {
        // Get all Level 4 accounts grouped by their current parent (Level 2)
        $level4Accounts = DB::table('chart_of_accounts')
            ->where('account_level', 4)
            ->get();
            
        $parentGroups = $level4Accounts->groupBy('parent_account_id');
        
        foreach ($parentGroups as $level2ParentId => $level4AccountsGroup) {
            if (!$level2ParentId) continue;
            
            // Get the Level 2 parent account details
            $level2Parent = DB::table('chart_of_accounts')
                ->where('id', $level2ParentId)
                ->first();
                
            if (!$level2Parent) continue;
            
            // Create Level 3 sub-parent accounts based on the existing Level 4 accounts
            $level3AccountsCreated = [];
            
            foreach ($level4AccountsGroup as $level4Account) {
                // Create a Level 3 account name based on the Level 4 account
                $level3AccountName = $this->generateLevel3AccountName($level4Account->account_name, $level2Parent->account_name);
                
                // Check if we already created a similar Level 3 account
                $existingLevel3 = collect($level3AccountsCreated)->first(function ($level3) use ($level3AccountName) {
                    return $level3['account_name'] === $level3AccountName;
                });
                
                if ($existingLevel3) {
                    // Use existing Level 3 account
                    $level3AccountId = $existingLevel3['id'];
                } else {
                    // Create new Level 3 sub-parent account
                    $level3AccountId = DB::table('chart_of_accounts')->insertGetId([
                        'account_code' => $this->generateLevel3Code($level2Parent->account_code, count($level3AccountsCreated) + 1),
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
                        'account_name' => $level3AccountName
                    ];
                }
                
                // Store mapping for updating this specific Level 4 account
                DB::table('temp_level3_mapping')->insert([
                    'old_parent_id' => $level2ParentId,
                    'new_parent_id' => $level3AccountId,
                    'level4_account_id' => $level4Account->id,
                    'created_at' => now(),
                ]);
            }
        }
    }
    
    /**
     * Update parent_account_id for Level 4 accounts to point to new Level 3 accounts
     */
    private function updateLevel4ParentReferences(): void
    {
        $mappings = DB::table('temp_level3_mapping')->get();
        
        foreach ($mappings as $mapping) {
            DB::table('chart_of_accounts')
                ->where('id', $mapping->level4_account_id)
                ->update(['parent_account_id' => $mapping->new_parent_id]);
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
        // Examples:
        // "Cash in Hand" -> "Cash Account / Cash In Hand"
        // "Bank Account" -> "Bank Account"
        // "Accounts Receivable" -> "Accounts Receivable"
        
        $level4Lower = strtolower($level4AccountName);
        $level2Lower = strtolower($level2AccountName);
        
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
