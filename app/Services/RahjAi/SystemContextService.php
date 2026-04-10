<?php

namespace App\Services\RahjAi;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * System Context Intelligence Service
 * 
 * Provides complete user/system context:
 * - Current company, location, user role
 * - Accessible modules and forms
 * - Recent activities and pending items
 * - Smart suggestions based on context
 */
class SystemContextService
{
    /**
     * Build complete system context for user
     */
    public function buildUserContext(Request $request): array
    {
        $user = $request->user();

        return [
            'user' => [
                'id' => $user?->id,
                'name' => $user?->name,
                'email' => $user?->email,
                'roles' => $user?->roles()->pluck('name')->toArray() ?? [],
            ],
            'company' => [
                'id' => $request->header('X-Company-Id') ?? $user?->company_id,
                'name' => $this->getCompanyName($user?->company_id),
                'currency' => $this->getCompanyCurrency($user?->company_id),
            ],
            'location' => [
                'id' => $request->header('X-Location-Id') ?? $user?->location_id,
                'name' => $this->getLocationName($user?->location_id),
            ],
            'accessible_modules' => $this->getAccessibleModules($user),
            'recent_activities' => $this->getRecentActivities($user),
            'pending_items' => $this->getPendingItems($user),
            'quick_actions' => $this->getSuggestedActions($user),
        ];
    }

    /**
     * Get all accessible modules for user
     */
    protected function getAccessibleModules($user): array
    {
        if (!$user) {
            return [];
        }

        $modules = [];

        // Check permissions
        $permissions = $user->getPermissionsViaRoles()->pluck('name')->toArray();

        if ($this->hasPermission($permissions, 'accounts')) {
            $modules['accounts'] = [
                'name' => 'Accounting',
                'routes' => [
                    'chart_of_accounts' => '/accounts/chart-of-accounts',
                    'journal_voucher' => '/accounts/journal-voucher',
                    'dashboard' => '/accounts/dashboard',
                    'trial_balance' => '/accounts/reports/trial-balance',
                ],
            ];
        }

        if ($this->hasPermission($permissions, 'inventory')) {
            $modules['inventory'] = [
                'name' => 'Inventory',
                'routes' => [
                    'items' => '/inventory/items',
                    'purchase_order' => '/inventory/purchase-order',
                    'goods_receipt' => '/inventory/goods-receipt-note',
                    'stock_level' => '/inventory/stock-level',
                ],
            ];
        }

        if ($this->hasPermission($permissions, 'sales')) {
            $modules['sales'] = [
                'name' => 'Sales',
                'routes' => [
                    'sales_order' => '/sales/orders',
                    'customer' => '/sales/customers',
                    'invoice' => '/sales/invoices',
                ],
            ];
        }

        return $modules;
    }

    /**
     * Get recent activities for context
     */
    protected function getRecentActivities($user): array
    {
        if (!$user) {
            return [];
        }

        try {
            $activities = DB::table('activity_logs')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(['action', 'subject', 'created_at'])
                ->toArray();

            return array_map(fn($a) => [
                'action' => $a->action,
                'subject' => $a->subject,
                'timestamp' => $a->created_at,
            ], $activities);
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Get pending items that need attention
     */
    protected function getPendingItems($user): array
    {
        if (!$user) {
            return [];
        }

        $pending = [];

        try {
            // Pending approvals
            $approvals = DB::table('approvals')
                ->where('status', 'pending')
                ->where('assigned_to', $user->id)
                ->count();

            if ($approvals > 0) {
                $pending['pending_approvals'] = $approvals;
            }

            // Pending POs
            $pos = DB::table('purchase_orders')
                ->where('company_id', $user->company_id)
                ->whereIn('status', ['draft', 'pending'])
                ->count();

            if ($pos > 0) {
                $pending['pending_pos'] = $pos;
            }

            // Pending GRNs
            $grns = DB::table('goods_receipt_notes')
                ->where('company_id', $user->company_id)
                ->whereIn('status', ['draft', 'pending_qc'])
                ->count();

            if ($grns > 0) {
                $pending['pending_grns'] = $grns;
            }
        } catch (\Exception $e) {
            // Silently handle if tables don't exist
        }

        return $pending;
    }

    /**
     * Get smart suggestions based on user context and time
     */
    protected function getSuggestedActions($user): array
    {
        if (!$user) {
            return [];
        }

        $suggestions = [];
        $hour = now()->hour;

        // Morning suggestions
        if ($hour >= 8 && $hour < 12) {
            $suggestions[] = [
                'action' => 'Check pending approvals',
                'route' => '/approvals',
                'priority' => 'high',
            ];
        }

        // Afternoon - receipt focus
        if ($hour >= 12 && $hour < 17) {
            $suggestions[] = [
                'action' => 'Update goods receipts',
                'route' => '/inventory/goods-receipt-note',
                'priority' => 'medium',
            ];
        }

        // End of day - closing
        if ($hour >= 17) {
            $suggestions[] = [
                'action' => 'Post pending journal vouchers',
                'route' => '/accounts/journal-voucher',
                'priority' => 'high',
            ];
        }

        return $suggestions;
    }

    /**
     * Provide contextual help for current screen/form
     */
    public function getContextualHelp(string $formType, array $formData = []): string
    {
        return match ($formType) {
            'chart_of_accounts' => "
📚 **Chart of Accounts Help**

**What is a Chart of Accounts?**
A systematic list of all accounts in your company, organized in a hierarchy:
- **Level 1**: Main categories (Assets, Liabilities, etc.)
- **Level 2**: Groups (Current Assets, Fixed Assets, etc.)
- **Level 3**: Sub-groups (Receivables, Inventory, etc.)
- **Level 4**: Individual accounts (used in journal entries)

**Creating a Level 4 Code:**
1. **Code**: 3-20 uppercase characters (e.g., *COGS*, *RENT*, *SALARY*)
2. **Name**: Full descriptive name (e.g., *Cost of Goods Sold*)
3. **Type**: Choose from Asset, Liability, Equity, Revenue, Expense, Contra-Asset
4. **Parent**: Select the Level 3 parent account
5. **Transactional**: Mark if this account appears in journal entries

**Example:**
- Code: *RENT*
- Name: *Office Rent Expense*
- Type: *Expense*
- Parent: *Occupancy Costs* (Level 3)
",

            'journal_voucher' => "
📚 **Journal Voucher Help**

**What is a Journal Voucher?**
A document recording financial transactions with equal debits and credits.

**Golden Rule:** Debits always equal Credits!

**Example:**
If you pay rent of 10,000 PKR:
| Account | Type | Amount |
|---------|------|---------|
| Rent Expense | Debit | 10,000 |
| Cash | Credit | 10,000 |

**Creating a Voucher:**
1. Enter date (cannot be future date)
2. Add description (e.g., *Payment of monthly rent*)
3. Add at least 2 lines (one debit, one credit)
4. Ensure total debits = total credits
5. Post to ledger
",

            'purchase_order' => "
📚 **Purchase Order Help**

**What is a PO?**
An official document sent to a supplier confirming purchase of goods/services.

**Purchase Flow:**
1. **Create PO** → authorize commitment
2. **Send to Supplier** → supplier prepares goods
3. **Receive GRN** → goods arrive at warehouse
4. **Quality Check** → inspect received goods
5. **Post to Inventory** → update stock levels

**Creating a PO:**
1. Select supplier
2. Add items with quantities and prices
3. System calculates total automatically
4. Set expected delivery date
5. Submit for approval
",

            default => "How can I help you?",
        };
    }

    /**
     * Get data dictionary for a specific field
     */
    public function getFieldDictionary(string $formType, string $fieldName): array
    {
        return match ($formType . '::' . $fieldName) {
            'chart_of_accounts::account_code' => [
                'label' => 'Account Code',
                'description' => 'Unique identifier for the account',
                'format' => '3-20 uppercase letters/numbers',
                'example' => 'RENT, COGS, SALARY',
                'validation' => 'Required, unique, no spaces',
            ],
            'journal_voucher::line_type' => [
                'label' => 'Line Type',
                'description' => 'Whether this is a debit or credit entry',
                'options' => ['Debit', 'Credit'],
                'rule' => 'Debits increase assets/expenses; Credits increase liabilities/revenue',
            ],
            'purchase_order::supplier_id' => [
                'label' => 'Supplier',
                'description' => 'The vendor you are purchasing from',
                'required' => true,
                'tip' => 'Must have active supplier record in system',
            ],
            default => [],
        };
    }

    // Helper methods
    protected function hasPermission(array $permissions, string $module): bool
    {
        return in_array("view_{$module}", $permissions, true) ||
               in_array("manage_{$module}", $permissions, true);
    }

    protected function getCompanyName(int $companyId = null): string
    {
        if (!$companyId) {
            return 'Unknown Company';
        }

        return DB::table('companies')
            ->where('id', $companyId)
            ->value('name') ?? "Company {$companyId}";
    }

    protected function getLocationName(int $locationId = null): string
    {
        if (!$locationId) {
            return 'Unknown Location';
        }

        return DB::table('locations')
            ->where('id', $locationId)
            ->value('name') ?? "Location {$locationId}";
    }

    protected function getCompanyCurrency(int $companyId = null): string
    {
        return 'PKR'; // Default, can be from company settings
    }
}
