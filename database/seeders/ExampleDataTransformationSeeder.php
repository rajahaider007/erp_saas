<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExampleDataTransformationSeeder extends Seeder
{
    /**
     * This seeder demonstrates the data transformation from 3-level to 4-level structure
     * Run this seeder to see examples of how accounts will be transformed
     */
    public function run(): void
    {
        $this->command->info('=== Chart of Accounts 4-Level Transformation Examples ===');
        $this->command->info('');
        
        // Example transformations
        $examples = [
            [
                'before' => [
                    'level1' => 'Assets',
                    'level2' => 'Current Assets', 
                    'level3' => 'Cash in Hand'
                ],
                'after' => [
                    'level1' => 'Assets',
                    'level2' => 'Current Assets',
                    'level3' => 'Cash Account / Cash In Hand',
                    'level4' => 'Cash in Hand'
                ]
            ],
            [
                'before' => [
                    'level1' => 'Assets',
                    'level2' => 'Current Assets',
                    'level3' => 'Bank Account'
                ],
                'after' => [
                    'level1' => 'Assets',
                    'level2' => 'Current Assets',
                    'level3' => 'Bank Account',
                    'level4' => 'Bank Account'
                ]
            ],
            [
                'before' => [
                    'level1' => 'Assets',
                    'level2' => 'Current Assets',
                    'level3' => 'Accounts Receivable'
                ],
                'after' => [
                    'level1' => 'Assets',
                    'level2' => 'Current Assets',
                    'level3' => 'Accounts Receivable',
                    'level4' => 'Accounts Receivable'
                ]
            ],
            [
                'before' => [
                    'level1' => 'Liabilities',
                    'level2' => 'Current Liabilities',
                    'level3' => 'Accounts Payable'
                ],
                'after' => [
                    'level1' => 'Liabilities',
                    'level2' => 'Current Liabilities',
                    'level3' => 'Accounts Payable',
                    'level4' => 'Accounts Payable'
                ]
            ],
            [
                'before' => [
                    'level1' => 'Expenses',
                    'level2' => 'Operating Expenses',
                    'level3' => 'Office Supplies'
                ],
                'after' => [
                    'level1' => 'Expenses',
                    'level2' => 'Operating Expenses',
                    'level3' => 'Office Supplies',
                    'level4' => 'Office Supplies'
                ]
            ]
        ];
        
        foreach ($examples as $index => $example) {
            $this->command->info("Example " . ($index + 1) . ":");
            $this->command->info("BEFORE (3-Level):");
            $this->command->info("  Level 1: " . $example['before']['level1']);
            $this->command->info("  Level 2: " . $example['before']['level2']);
            $this->command->info("  Level 3: " . $example['before']['level3'] . " (Transactional)");
            $this->command->info("");
            $this->command->info("AFTER (4-Level):");
            $this->command->info("  Level 1: " . $example['after']['level1']);
            $this->command->info("  Level 2: " . $example['after']['level2']);
            $this->command->info("  Level 3: " . $example['after']['level3'] . " (Sub-Parent)");
            $this->command->info("  Level 4: " . $example['after']['level4'] . " (Transactional)");
            $this->command->info("");
            $this->command->info("---");
            $this->command->info("");
        }
        
        $this->command->info('=== Account Code Structure ===');
        $this->command->info('');
        $this->command->info('Level 1: 100000000000000 (Assets)');
        $this->command->info('Level 2: 100010000000000 (Current Assets)');
        $this->command->info('Level 3: 100010000000001 (Cash Account / Cash In Hand)');
        $this->command->info('Level 4: 100010000000001001 (Cash in Hand)');
        $this->command->info('');
        
        $this->command->info('=== Migration Process ===');
        $this->command->info('1. Existing Level 3 accounts become Level 4');
        $this->command->info('2. New Level 3 accounts are created as sub-parents');
        $this->command->info('3. Parent-child relationships are updated');
        $this->command->info('4. Account codes are regenerated for proper hierarchy');
        $this->command->info('');
        
        $this->command->info('=== Benefits ===');
        $this->command->info('✓ Better organization and grouping');
        $this->command->info('✓ More detailed reporting capabilities');
        $this->command->info('✓ Scalable structure for complex businesses');
        $this->command->info('✓ Maintains existing transactional data integrity');
        $this->command->info('');
    }
}
