<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuditLogService
{
    /**
     * Log any data change for audit purposes
     * 
     * @param string $action Action type (CREATE, UPDATE, DELETE, POST, etc.)
     * @param string $module Module name (Accounts, System, etc.)
     * @param string $table Database table name
     * @param int|null $recordId Record ID
     * @param array|null $oldData Old data before change
     * @param array|null $newData New data after change
     * @param string|null $description Additional description
     * @return bool
     */
    public static function log(
        string $action,
        string $module,
        string $table,
        ?int $recordId = null,
        ?array $oldData = null,
        ?array $newData = null,
        ?string $description = null
    ): bool {
        try {
            $request = request();
            
            // For UPDATE action, verify actual changes exist
            if ($action === 'UPDATE') {
                $changedFields = self::getChangedFields($oldData, $newData);
                
                if (empty($changedFields)) {
                    // No actual changes, don't log
                    return false;
                }
            }
            
            // Calculate changed fields
            $changedFields = self::getChangedFields($oldData, $newData);
            
            // Insert into tbl_audit_logs (main audit trail)
            DB::table('tbl_audit_logs')->insert([
                'user_id' => Auth::id() ?? session('user_id'), // Fallback to session
                'company_id' => session('user_comp_id'),
                'location_id' => session('user_location_id'),
                'module_name' => $module,
                'table_name' => $table,
                'record_id' => $recordId,
                'action_type' => $action,
                'old_values' => $oldData ? json_encode($oldData) : null,
                'new_values' => $newData ? json_encode($newData) : null,
                'changed_fields' => $changedFields ? json_encode($changedFields) : null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->header('User-Agent'),
                'session_id' => session()->getId(),
                'description' => $description,
                'created_at' => now()
            ]);
            
            return true;
        } catch (\Exception $e) {
            Log::error('Audit log error: ' . $e->getMessage(), [
                'action' => $action,
                'module' => $module,
                'table' => $table,
                'record_id' => $recordId
            ]);
            return false;
        }
    }
    
    /**
     * Get only the fields that changed between old and new data
     * 
     * @param array|null $oldData
     * @param array|null $newData
     * @return array|null
     */
    private static function getChangedFields(?array $oldData, ?array $newData): ?array
    {
        if (!$oldData || !$newData) {
            return null;
        }
        
        $changes = [];
        
        // Skip fields that shouldn't be logged
        $skipFields = ['updated_at', 'updated_by', 'created_at', 'created_by', 'last_viewed_at'];
        
        foreach ($newData as $key => $newValue) {
            // Skip auto-generated fields
            if (in_array($key, $skipFields)) {
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
    
    /**
     * Log journal voucher operation
     */
    public static function logJournalVoucher(
        string $action,
        int $voucherId,
        array $voucherData,
        ?array $oldData = null
    ): bool {
        return self::log(
            $action,
            'Accounts',
            'transactions',
            $voucherId,
            $oldData,
            $voucherData,
            "Journal Voucher {$action}: " . ($voucherData['voucher_number'] ?? '')
        );
    }
    
    /**
     * Log chart of accounts operation
     */
    public static function logChartOfAccounts(
        string $action,
        int $accountId,
        array $accountData,
        ?array $oldData = null
    ): bool {
        return self::log(
            $action,
            'Accounts',
            'tbl_chart_of_accounts',
            $accountId,
            $oldData,
            $accountData,
            "Chart of Accounts {$action}: " . ($accountData['account_name'] ?? '')
        );
    }
    
    /**
     * Log user operation
     */
    public static function logUser(
        string $action,
        int $userId,
        array $userData,
        ?array $oldData = null
    ): bool {
        // Filter sensitive data
        $filteredNewData = self::filterSensitiveData($userData);
        $filteredOldData = $oldData ? self::filterSensitiveData($oldData) : null;
        
        // Create full name from fname, mname, lname
        $fullName = trim(
            ($userData['fname'] ?? '') . ' ' . 
            ($userData['mname'] ?? '') . ' ' . 
            ($userData['lname'] ?? '')
        );
        
        return self::log(
            $action,
            'System',
            'tbl_users',
            $userId,
            $filteredOldData,
            $filteredNewData,
            "User {$action}: " . $fullName
        );
    }
    
    /**
     * Filter sensitive data before logging
     */
    private static function filterSensitiveData(array $data): array
    {
        $sensitiveFields = [
            'password',
            'password_confirmation',
            'token',
            'api_key',
            'secret',
            'api_secret',
            'private_key'
        ];
        
        foreach ($sensitiveFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = '***FILTERED***';
            }
        }
        
        return $data;
    }
    
    /**
     * Get audit trail for a specific record
     */
    public static function getAuditTrail(string $table, int $recordId)
    {
        return DB::table('tbl_audit_logs as al')
            ->leftJoin('tbl_users as u', 'al.user_id', '=', 'u.id')
            ->select(
                'al.*',
                DB::raw("CONCAT(u.fname, ' ', COALESCE(u.mname, ''), ' ', u.lname) as user_name"),
                'u.email as user_email'
            )
            ->where('al.table_name', $table)
            ->where('al.record_id', $recordId)
            ->where('al.company_id', session('user_comp_id')) // Company filtering
            ->orderBy('al.created_at', 'desc')
            ->get();
    }
    
    /**
     * Get recent activity for a user
     */
    public static function getUserActivity(int $userId, int $limit = 50)
    {
        return DB::table('tbl_audit_logs')
            ->where('user_id', $userId)
            ->where('company_id', session('user_comp_id')) // Company filtering
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
    
    /**
     * Get audit summary for date range
     */
    public static function getAuditSummary(
        string $fromDate,
        string $toDate,
        ?string $module = null
    ) {
        $query = DB::table('tbl_audit_logs')
            ->select(
                'module_name',
                'action_type',
                DB::raw('COUNT(*) as total_actions'),
                DB::raw('COUNT(DISTINCT user_id) as unique_users')
            )
            ->whereBetween('created_at', [$fromDate, $toDate])
            ->where('company_id', session('user_comp_id')) // Company filtering
            ->groupBy('module_name', 'action_type');
        
        if ($module) {
            $query->where('module_name', $module);
        }
        
        return $query->get();
    }
    
    // ==================== ACCOUNTS MODULE LOGGING METHODS ====================
    
    /**
     * Log currency ledger operation
     */
    public static function logCurrencyLedger(
        string $action,
        int $recordId,
        array $data,
        ?array $oldData = null
    ): bool {
        return self::log(
            $action,
            'Accounts',
            'currency_ledgers',
            $recordId,
            $oldData,
            $data,
            "Currency Ledger {$action}: " . ($data['currency_code'] ?? '') . " - " . ($data['account_name'] ?? '')
        );
    }
    
    /**
     * Log general ledger operation
     */
    public static function logGeneralLedger(
        string $action,
        int $recordId,
        array $data,
        ?array $oldData = null
    ): bool {
        return self::log(
            $action,
            'Accounts',
            'general_ledgers',
            $recordId,
            $oldData,
            $data,
            "General Ledger {$action}: " . ($data['account_code'] ?? '') . " - " . ($data['account_name'] ?? '')
        );
    }
    
    /**
     * Log voucher number configuration operation
     */
    public static function logVoucherNumberConfiguration(
        string $action,
        int $recordId,
        array $data,
        ?array $oldData = null
    ): bool {
        return self::log(
            $action,
            'Accounts',
            'voucher_number_configurations',
            $recordId,
            $oldData,
            $data,
            "Voucher Number Configuration {$action}: " . ($data['voucher_type'] ?? '') . " - " . ($data['prefix'] ?? '')
        );
    }
    
    // ==================== SYSTEM MODULE LOGGING METHODS ====================
    
    /**
     * Log company operation
     */
    public static function logCompany(
        string $action,
        int $recordId,
        array $data,
        ?array $oldData = null
    ): bool {
        return self::log(
            $action,
            'System',
            'companies',
            $recordId,
            $oldData,
            $data,
            "Company {$action}: " . ($data['company_name'] ?? '')
        );
    }
    
    /**
     * Log currency operation
     */
    public static function logCurrency(
        string $action,
        int $recordId,
        array $data,
        ?array $oldData = null
    ): bool {
        return self::log(
            $action,
            'System',
            'currencies',
            $recordId,
            $oldData,
            $data,
            "Currency {$action}: " . ($data['name'] ?? '') . " (" . ($data['code'] ?? '') . ")"
        );
    }
    
    /**
     * Log department operation
     */
    public static function logDepartment(
        string $action,
        int $recordId,
        array $data,
        ?array $oldData = null
    ): bool {
        return self::log(
            $action,
            'System',
            'departments',
            $recordId,
            $oldData,
            $data,
            "Department {$action}: " . ($data['name'] ?? '')
        );
    }
    
    /**
     * Log location operation
     */
    public static function logLocation(
        string $action,
        int $recordId,
        array $data,
        ?array $oldData = null
    ): bool {
        return self::log(
            $action,
            'System',
            'locations',
            $recordId,
            $oldData,
            $data,
            "Location {$action}: " . ($data['name'] ?? '')
        );
    }
    
    /**
     * Log menu operation
     */
    public static function logMenu(
        string $action,
        int $recordId,
        array $data,
        ?array $oldData = null
    ): bool {
        return self::log(
            $action,
            'System',
            'menus',
            $recordId,
            $oldData,
            $data,
            "Menu {$action}: " . ($data['menu_name'] ?? '')
        );
    }
    
    /**
     * Log module operation
     */
    public static function logModule(
        string $action,
        int $recordId,
        array $data,
        ?array $oldData = null
    ): bool {
        return self::log(
            $action,
            'System',
            'modules',
            $recordId,
            $oldData,
            $data,
            "Module {$action}: " . ($data['module_name'] ?? '')
        );
    }
    
    /**
     * Log package operation
     */
    public static function logPackage(
        string $action,
        int $recordId,
        array $data,
        ?array $oldData = null
    ): bool {
        return self::log(
            $action,
            'System',
            'packages',
            $recordId,
            $oldData,
            $data,
            "Package {$action}: " . ($data['package_name'] ?? '')
        );
    }
    
    /**
     * Log package feature operation
     */
    public static function logPackageFeature(
        string $action,
        int $recordId,
        array $data,
        ?array $oldData = null
    ): bool {
        return self::log(
            $action,
            'System',
            'package_features',
            $recordId,
            $oldData,
            $data,
            "Package Feature {$action}: " . ($data['feature_name'] ?? '')
        );
    }
    
    /**
     * Log section operation
     */
    public static function logSection(
        string $action,
        int $recordId,
        array $data,
        ?array $oldData = null
    ): bool {
        return self::log(
            $action,
            'System',
            'sections',
            $recordId,
            $oldData,
            $data,
            "Section {$action}: " . ($data['section_name'] ?? '')
        );
    }
    
    /**
     * Log role operation
     */
    public static function logRole(
        string $action,
        int $recordId,
        array $data,
        ?array $oldData = null
    ): bool {
        return self::log(
            $action,
            'System',
            'roles',
            $recordId,
            $oldData,
            $data,
            "Role {$action}: " . ($data['role_name'] ?? '')
        );
    }
    
    /**
     * Log role feature operation
     */
    public static function logRoleFeature(
        string $action,
        int $recordId,
        array $data,
        ?array $oldData = null
    ): bool {
        return self::log(
            $action,
            'System',
            'role_features',
            $recordId,
            $oldData,
            $data,
            "Role Feature {$action}: Role " . ($data['role_id'] ?? '') . " - Feature " . ($data['feature_id'] ?? '')
        );
    }
    
    /**
     * Log code configuration operation
     */
    public static function logCodeConfiguration(
        string $action,
        int $recordId,
        array $data,
        ?array $oldData = null
    ): bool {
        return self::log(
            $action,
            'System',
            'code_configurations',
            $recordId,
            $oldData,
            $data,
            "Code Configuration {$action}: " . ($data['configuration_name'] ?? '')
        );
    }
    
    // ==================== AUTHENTICATION MODULE LOGGING METHODS ====================
    
    /**
     * Log authentication operation
     */
    public static function logAuthentication(
        string $action,
        ?int $recordId,
        array $data,
        ?array $oldData = null
    ): bool {
        $filteredData = self::filterSensitiveData($data);
        $filteredOldData = $oldData ? self::filterSensitiveData($oldData) : null;
        
        return self::log(
            $action,
            'Authentication',
            'tbl_users',
            $recordId,
            $filteredOldData,
            $filteredData,
            "Authentication {$action}: " . ($data['email'] ?? '')
        );
    }
    
    /**
     * Log profile operation
     */
    public static function logProfile(
        string $action,
        int $userId,
        array $data,
        ?array $oldData = null
    ): bool {
        $filteredData = self::filterSensitiveData($data);
        $filteredOldData = $oldData ? self::filterSensitiveData($oldData) : null;
        
        $fullName = trim(
            ($data['fname'] ?? '') . ' ' . 
            ($data['mname'] ?? '') . ' ' . 
            ($data['lname'] ?? '')
        );
        
        return self::log(
            $action,
            'Authentication',
            'tbl_users',
            $userId,
            $filteredOldData,
            $filteredData,
            "Profile {$action}: " . $fullName
        );
    }
    
    // ==================== REPORTS MODULE LOGGING METHODS ====================
    
    /**
     * Log report generation
     */
    public static function logReport(
        string $action,
        ?int $recordId,
        array $data,
        ?array $oldData = null
    ): bool {
        return self::log(
            $action,
            'Reports',
            'reports',
            $recordId,
            $oldData,
            $data,
            "Report {$action}: " . ($data['report_name'] ?? '') . " - " . ($data['report_type'] ?? '')
        );
    }
    
    // ==================== ATTACHMENT MODULE LOGGING METHODS ====================
    
    /**
     * Log attachment operation
     */
    public static function logAttachment(
        string $action,
        ?int $recordId,
        array $data,
        ?array $oldData = null
    ): bool {
        return self::log(
            $action,
            'Attachment',
            'attachments',
            $recordId,
            $oldData,
            $data,
            "Attachment {$action}: " . ($data['original_name'] ?? '') . " (" . ($data['file_type'] ?? '') . ")"
        );
    }
}

