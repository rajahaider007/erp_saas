<?php

namespace App\Services\RahjAi;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

/**
 * Knowledge Base Builder - Generates comprehensive system documentation
 *
 * Automatically extracts:
 * - Database schema (tables, columns, relationships)
 * - Business rules and validations
 * - Module workflows
 * - Data relationships
 */
class KnowledgeBaseBuilder
{
    public function buildCompleteKnowledgeBase(): void
    {
        $knowledge = [
            'database_schema' => $this->extractDatabaseSchema(),
            'business_entities' => $this->extractBusinessEntities(),
            'module_workflows' => $this->extractModuleWorkflows(),
            'data_relationships' => $this->extractDataRelationships(),
            'validation_rules' => $this->extractValidationRules(),
            'system_config' => $this->extractSystemConfiguration(),
        ];

        // RAG JSONL is produced by `npm run rag:build` (guides + live schema + code). Do not append
        // huge schema blobs here — they overwrite ranking and confuse navigation answers.
        $this->saveToRagCorpus($knowledge);
    }

    /**
     * Extract all database tables, columns, types, and relationships
     */
    protected function extractDatabaseSchema(): array
    {
        $tables = Schema::getTableListing();
        $schema = [];

        foreach ($tables as $table) {
            if (in_array($table, ['migrations', 'jobs', 'failed_jobs'], true)) {
                continue;
            }

            $columns = Schema::getColumns($table);
            $columnInfo = [];

            foreach ($columns as $column) {
                $columnInfo[] = [
                    'name' => $column['name'],
                    'type' => $column['type'],
                    'nullable' => $column['nullable'],
                    'default' => $column['default'],
                    'key_type' => $this->detectKeyType($table, $column['name']),
                ];
            }

            $schema[$table] = [
                'columns' => $columnInfo,
                'indexes' => Schema::getIndexes($table),
                'foreign_keys' => $this->extractForeignKeys($table),
                'sample_records' => $this->getSampleRecords($table),
            ];
        }

        return $schema;
    }

    /**
     * Extract business entities and their properties
     */
    protected function extractBusinessEntities(): array
    {
        $entities = [
            'accounts' => [
                'chart_of_accounts' => $this->analyzeChartOfAccounts(),
                'account_types' => $this->getAccountTypes(),
                'journal_vouchers' => $this->analyzeJournalVouchers(),
            ],
            'inventory' => [
                'items' => $this->analyzeInventoryItems(),
                'warehouses' => $this->analyzeWarehouses(),
                'transactions' => $this->analyzeInventoryTransactions(),
            ],
            'purchasing' => [
                'purchase_orders' => $this->analyzePurchaseOrders(),
                'suppliers' => $this->analyzeSuppliers(),
            ],
            'sales' => [
                'sales_orders' => $this->analyzeSalesOrders(),
                'customers' => $this->analyzeCustomers(),
            ],
        ];

        return $entities;
    }

    /**
     * Extract module workflows and processes
     */
    protected function extractModuleWorkflows(): array
    {
        return [
            'accounts' => [
                'chart_of_accounts_creation' => [
                    'steps' => [
                        'Select Level (1-4)',
                        'Assign code and name',
                        'Set account type',
                        'Configure posting rules',
                        'Link to tax categories',
                    ],
                    'validations' => 'Code unique, parent must exist, type required',
                ],
                'journal_entry' => [
                    'steps' => [
                        'Create voucher header',
                        'Add debit/credit lines',
                        'Ensure balanced entry',
                        'Assign reference',
                        'Post to ledger',
                    ],
                ],
            ],
            'inventory' => [
                'purchase_flow' => [
                    'steps' => [
                        'Create Purchase Requisition',
                        'Approve PR',
                        'Create Purchase Order',
                        'Send to supplier',
                        'Receive goods (GRN)',
                        'QC inspection',
                        'Stock receipt',
                    ],
                ],
                'sales_flow' => [
                    'steps' => [
                        'Create Sales Order',
                        'Pick items from warehouse',
                        'Generate packing slip',
                        'Post shipment',
                        'Generate invoice',
                    ],
                ],
            ],
        ];
    }

    /**
     * Extract data relationships and connections
     */
    protected function extractDataRelationships(): array
    {
        return [
            'account_hierarchy' => [
                'description' => 'Chart of Accounts organized in 4 levels: Category > Type > Sub-Type > Code',
                'example' => '1000 > 1100 > 1110 > 1111',
            ],
            'company_location_structure' => [
                'description' => 'Multi-company, multi-location with location-specific settings',
                'hierarchy' => 'Company > Location > Department',
            ],
            'inventory_warehouse_network' => [
                'description' => 'Multiple warehouses with inter-warehouse transfers',
                'tracking' => 'Item code, warehouse code, quantity, cost center',
            ],
        ];
    }

    /**
     * Extract validation rules from models
     */
    protected function extractValidationRules(): array
    {
        return [
            'accounts' => [
                'account_code' => 'required|unique|uppercase|3-20 chars',
                'account_name' => 'required|2-100 chars',
                'account_type' => 'required|enum(Asset, Liability, Equity, Revenue, Expense)',
            ],
            'inventory' => [
                'item_code' => 'required|unique',
                'quantity' => 'numeric|minimum 0',
                'price' => 'numeric|minimum 0.01',
            ],
        ];
    }

    /**
     * Extract system configuration
     */
    protected function extractSystemConfiguration(): array
    {
        return [
            'fiscal_year_start' => env('FISCAL_YEAR_START', '2026-01-01'),
            'company_id' => env('DEFAULT_COMPANY_ID', 1),
            'currency' => env('DEFAULT_CURRENCY', 'PKR'),
            'decimal_places' => 2,
            'modules_enabled' => ['accounts', 'inventory', 'purchasing', 'sales', 'hr'],
        ];
    }

    // Helper methods
    protected function analyzeChartOfAccounts(): array
    {
        try {
            return DB::table('accounts')->select('id', 'code', 'name', 'type', 'level', 'parent_id')->limit(50)->get()->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    protected function analyzeInventoryItems(): array
    {
        try {
            return DB::table('items')->select('id', 'code', 'name', 'category')->limit(30)->get()->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    protected function getSampleRecords(string $table, int $limit = 3): array
    {
        try {
            return DB::table($table)->limit($limit)->get()->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    protected function extractForeignKeys(string $table): array
    {
        // Implementation depends on DB driver
        return [];
    }

    protected function getAccountTypes(): array
    {
        return ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'Contra-Asset'];
    }

    protected function detectKeyType(string $table, string $column): ?string
    {
        if ($column === 'id') {
            return 'primary';
        }
        if (str_ends_with($column, '_id')) {
            return 'foreign';
        }

        return null;
    }

    protected function analyzeJournalVouchers(): array
    {
        return [];
    }

    protected function analyzeWarehouses(): array
    {
        return [];
    }

    protected function analyzeInventoryTransactions(): array
    {
        return [];
    }

    protected function analyzePurchaseOrders(): array
    {
        return [];
    }

    protected function analyzeSuppliers(): array
    {
        return [];
    }

    protected function analyzeSalesOrders(): array
    {
        return [];
    }

    protected function analyzeCustomers(): array
    {
        return [];
    }

    /**
     * Save generated knowledge to RAG corpus (JSONL format)
     */
    protected function saveToRagCorpus(array $knowledge): void
    {
        $overlayPath = base_path('docs/rag/artisan_schema_overlay.jsonl');

        File::ensureDirectoryExists(dirname($overlayPath));

        $chunks = [];
        foreach ($knowledge as $category => $data) {
            $json = json_encode($data, JSON_UNESCAPED_UNICODE);

            $chunks[] = [
                'source_type' => 'database_schema',
                'source_path' => "system::{$category}",
                'document_title' => "System Knowledge: {$category}",
                'section_title' => $category,
                'content' => $json,
                'tags' => [$category, 'system', 'knowledge'],
            ];
        }

        $body = '';
        foreach ($chunks as $chunk) {
            $body .= json_encode($chunk, JSON_UNESCAPED_UNICODE)."\n";
        }

        File::put($overlayPath, $body);
    }
}
