<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Services\AuditLogService;
use App\Services\RecoveryService;
use App\Services\SecurityLogService;
use App\Helpers\CompanyHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LogController extends Controller
{
    use CheckUserPermissions;
    /**
     * Display activity logs
     */
    public function activityLogs(Request $request)
    {
        $search = $request->input('search');
        $module = $request->input('module');
        $action = $request->input('action');
        $userId = $request->input('user_id');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $perPage = $request->input('per_page', 25);

        // For parent companies, allow company/location selection
        // For customer companies, use their session company/location
        $isParentCompany = CompanyHelper::isCurrentCompanyParent();
        
        $companyId = $request->input('comp_id') ?? session('user_comp_id');
        $locationId = $request->input('location_id') ?? session('user_location_id');
        
        // Debug logging
        Log::info('Activity Logs Query', [
            'company_id' => $companyId,
            'total_logs_in_db' => DB::table('tbl_audit_logs')->count(),
            'logs_for_company' => DB::table('tbl_audit_logs')->where('company_id', $companyId)->count()
        ]);

        $query = DB::table('tbl_audit_logs as al')
            ->leftJoin('tbl_users as u', 'al.user_id', '=', 'u.id')
            ->select(
                'al.*',
                DB::raw("CONCAT(COALESCE(u.fname, 'System'), ' ', COALESCE(u.mname, ''), ' ', COALESCE(u.lname, '')) as user_name"),
                'u.email as user_email'
            )
            ->where('al.company_id', $companyId);

        // Apply filters
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('al.description', 'like', "%{$search}%")
                  ->orWhere('al.module_name', 'like', "%{$search}%")
                  ->orWhere('al.action_type', 'like', "%{$search}%")
                  ->orWhere('al.table_name', 'like', "%{$search}%")
                  ->orWhere('u.fname', 'like', "%{$search}%")
                  ->orWhere('u.lname', 'like', "%{$search}%");
            });
        }

        if ($module) {
            $query->where('al.module_name', $module);
        }

        if ($action) {
            $query->where('al.action_type', $action);
        }

        if ($userId) {
            $query->where('al.user_id', $userId);
        }

        if ($fromDate) {
            $query->whereDate('al.created_at', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('al.created_at', '<=', $toDate);
        }

        $logs = $query
            ->orderBy('al.created_at', 'desc')
            ->paginate($perPage);

        // Get companies and locations for parent companies only
        $companies = [];
        $locations = [];
        
        if ($isParentCompany) {
            $companies = DB::table('companies')
                ->where('status', true)
                ->orderBy('company_name')
                ->get(['id', 'company_name']);
            
            // If company is selected, get its locations
            if ($companyId) {
                $locations = DB::table('locations')
                    ->where('company_id', $companyId)
                    ->where('status', 'Active')
                    ->orderBy('location_name')
                    ->get(['id', 'location_name']);
            }
        }

        // Get all users for filter (filter by company)
        $users = DB::table('tbl_users')
            ->where('comp_id', $companyId)
            ->select(
                'id',
                DB::raw("CONCAT(fname, ' ', COALESCE(mname, ''), ' ', lname) as name"),
                'email'
            )
            ->get();

        return Inertia::render('Logs/ActivityLogs', [
            'logs' => $logs,
            'users' => $users,
            'companies' => $companies,
            'locations' => $locations,
            'isParentCompany' => $isParentCompany,
            'filters' => [
                'search' => $search,
                'module' => $module,
                'action' => $action,
                'user_id' => $userId,
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'per_page' => $perPage,
                'comp_id' => $companyId,
                'location_id' => $locationId
            ]
        ]);
    }

    /**
     * Display deleted items recovery page
     */
    public function deletedItems(Request $request)
    {
        $table = $request->input('table');
        $search = $request->input('search');
        $perPage = $request->input('per_page', 25);

        $query = DB::table('tbl_deleted_data_recovery as r')
            ->leftJoin('tbl_users as u', 'r.deleted_by', '=', 'u.id')
            ->select(
                'r.*',
                DB::raw("CONCAT(u.fname, ' ', COALESCE(u.mname, ''), ' ', u.lname) as deleted_by_name"),
                'u.email as deleted_by_email',
                DB::raw('DATEDIFF(r.recovery_expires_at, NOW()) as days_remaining')
            )
            ->where('r.status', 'DELETED')
            ->where('r.recovery_expires_at', '>', now())
            ->where('u.comp_id', session('user_comp_id')); // Company filtering via user

        if ($table) {
            $query->where('r.original_table', $table);
        }

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('r.record_identifier', 'like', "%{$search}%")
                  ->orWhere('r.delete_reason', 'like', "%{$search}%");
            });
        }

        $deletedItems = $query
            ->orderBy('r.deleted_at', 'desc')
            ->paginate($perPage);

        return Inertia::render('Logs/DeletedItems', [
            'deletedItems' => $deletedItems,
            'filters' => [
                'table' => $table,
                'search' => $search,
                'per_page' => $perPage
            ]
        ]);
    }

    /**
     * Restore deleted item
     */
    public function restore(Request $request, $id)
    {
        try {
            $notes = $request->input('notes');
            $result = RecoveryService::restore($id, $notes);

            return response()->json([
                'success' => true,
                'message' => 'Data restored successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * View change details
     */
    public function changeDetails($id)
    {
        $log = DB::table('tbl_audit_logs as al')
            ->leftJoin('tbl_users as u', 'al.user_id', '=', 'u.id')
            ->select(
                'al.*',
                DB::raw("CONCAT(u.fname, ' ', COALESCE(u.mname, ''), ' ', u.lname) as user_name"),
                'u.email as user_email'
            )
            ->where('al.id', $id)
            ->where('al.company_id', session('user_comp_id')) // Company filtering
            ->first();

        if (!$log) {
            abort(404);
        }

        return Inertia::render('Logs/ChangeDetails', [
            'log' => $log
        ]);
    }

    /**
     * View record timeline
     */
    public function timeline(Request $request)
    {
        $table = $request->input('table');
        $recordId = $request->input('record_id');

        if (!$table || !$recordId) {
            abort(400, 'Table and record ID required');
        }

        $timeline = DB::table('tbl_audit_logs as al')
            ->leftJoin('tbl_users as u', 'al.user_id', '=', 'u.id')
            ->select(
                'al.*',
                DB::raw("CONCAT(u.fname, ' ', COALESCE(u.mname, ''), ' ', u.lname) as user_name"),
                'u.email as user_email'
            )
            ->where('al.table_name', $table)
            ->where('al.record_id', $recordId)
            ->where('al.company_id', session('user_comp_id')) // Company filtering
            ->orderBy('al.created_at', 'asc')
            ->get();

        return Inertia::render('Logs/Timeline', [
            'timeline' => $timeline,
            'table' => $table,
            'recordId' => $recordId
        ]);
    }

    /**
     * Security logs
     */
    public function securityLogs(Request $request)
    {
        $eventType = $request->input('event_type');
        $riskLevel = $request->input('risk_level');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $perPage = $request->input('per_page', 25);

        // For parent companies, allow company/location selection
        // For customer companies, use their session company/location
        $isParentCompany = CompanyHelper::isCurrentCompanyParent();
        
        $companyId = $request->input('comp_id') ?? session('user_comp_id');
        $locationId = $request->input('location_id') ?? session('user_location_id');

        $query = DB::table('tbl_security_logs as sl')
            ->leftJoin('tbl_users as u', 'sl.user_id', '=', 'u.id')
            ->select(
                'sl.*',
                DB::raw("CONCAT(u.fname, ' ', COALESCE(u.mname, ''), ' ', u.lname) as user_name"),
                'u.email as user_email'
            )
            ->where('u.comp_id', $companyId); // Company filtering via user

        if ($eventType) {
            $query->where('sl.event_type', $eventType);
        }

        if ($riskLevel) {
            $query->where('sl.risk_level', $riskLevel);
        }

        if ($fromDate) {
            $query->whereDate('sl.created_at', '>=', $fromDate);
        }

        if ($toDate) {
            $query->whereDate('sl.created_at', '<=', $toDate);
        }

        $logs = $query
            ->orderBy('sl.created_at', 'desc')
            ->paginate($perPage);

        // Get companies and locations for parent companies only
        $companies = [];
        $locations = [];
        
        if ($isParentCompany) {
            $companies = DB::table('companies')
                ->where('status', true)
                ->orderBy('company_name')
                ->get(['id', 'company_name']);
            
            // If company is selected, get its locations
            if ($companyId) {
                $locations = DB::table('locations')
                    ->where('company_id', $companyId)
                    ->where('status', 'Active')
                    ->orderBy('location_name')
                    ->get(['id', 'location_name']);
            }
        }

        return Inertia::render('Logs/SecurityLogs', [
            'logs' => $logs,
            'companies' => $companies,
            'locations' => $locations,
            'isParentCompany' => $isParentCompany,
            'filters' => [
                'event_type' => $eventType,
                'risk_level' => $riskLevel,
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'per_page' => $perPage,
                'comp_id' => $companyId,
                'location_id' => $locationId
            ]
        ]);
    }

    /**
     * Get log reports/statistics
     */
    public function reports(Request $request)
    {
        $fromDate = $request->input('from_date', now()->subDays(30)->format('Y-m-d'));
        $toDate = $request->input('to_date', now()->format('Y-m-d'));

        // Activity summary by module
        $activityByModule = DB::table('tbl_audit_logs')
            ->select(
                'module_name',
                'action_type',
                DB::raw('COUNT(*) as total')
            )
            ->whereBetween('created_at', [$fromDate, $toDate])
            ->where('company_id', session('user_comp_id')) // Company filtering
            ->groupBy('module_name', 'action_type')
            ->get();

        // Top active users
        $topUsers = DB::table('tbl_audit_logs as al')
            ->leftJoin('tbl_users as u', 'al.user_id', '=', 'u.id')
            ->select(
                'al.user_id',
                DB::raw("CONCAT(u.fname, ' ', COALESCE(u.mname, ''), ' ', u.lname) as name"),
                'u.email',
                DB::raw('COUNT(*) as total_actions')
            )
            ->whereBetween('al.created_at', [$fromDate, $toDate])
            ->where('al.company_id', session('user_comp_id')) // Company filtering
            ->groupBy('al.user_id', 'u.fname', 'u.mname', 'u.lname', 'u.email')
            ->orderBy('total_actions', 'desc')
            ->limit(10)
            ->get();

        // Security incidents
        $securityIncidents = DB::table('tbl_security_logs as sl')
            ->leftJoin('tbl_users as u', 'sl.user_id', '=', 'u.id')
            ->where('sl.event_status', 'FAILED')
            ->whereBetween('sl.created_at', [$fromDate, $toDate])
            ->where('u.comp_id', session('user_comp_id')) // Company filtering via user
            ->count();

        // Deleted items count
        $deletedItemsCount = DB::table('tbl_deleted_data_recovery as r')
            ->leftJoin('tbl_users as u', 'r.deleted_by', '=', 'u.id')
            ->where('r.status', 'DELETED')
            ->where('u.comp_id', session('user_comp_id')) // Company filtering via user
            ->count();

        // Calculate activity statistics
        $activityStats = [
            'total' => $activityByModule->sum('total'),
            'today' => DB::table('tbl_audit_logs')
                ->where('company_id', session('user_comp_id'))
                ->whereDate('created_at', today())
                ->count(),
            'this_week' => DB::table('tbl_audit_logs')
                ->where('company_id', session('user_comp_id'))
                ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                ->count(),
            'this_month' => DB::table('tbl_audit_logs')
                ->where('company_id', session('user_comp_id'))
                ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
                ->count(),
            'module_breakdown' => $activityByModule->map(function($item) {
                return [
                    'module_name' => $item->module_name,
                    'total_actions' => $item->total
                ];
            })->toArray()
        ];

        // Calculate security statistics
        $securityStats = [
            'failed_logins' => DB::table('tbl_security_logs as sl')
                ->leftJoin('tbl_users as u', 'sl.user_id', '=', 'u.id')
                ->where('u.comp_id', session('user_comp_id'))
                ->where('sl.event_type', 'LOGIN_FAILED')
                ->whereBetween('sl.created_at', [$fromDate, $toDate])
                ->count(),
            'suspicious_activities' => DB::table('tbl_security_logs as sl')
                ->leftJoin('tbl_users as u', 'sl.user_id', '=', 'u.id')
                ->where('u.comp_id', session('user_comp_id'))
                ->where('sl.risk_level', 'HIGH')
                ->whereBetween('sl.created_at', [$fromDate, $toDate])
                ->count(),
            'permission_denied' => DB::table('tbl_security_logs as sl')
                ->leftJoin('tbl_users as u', 'sl.user_id', '=', 'u.id')
                ->where('u.comp_id', session('user_comp_id'))
                ->where('sl.event_type', 'PERMISSION_DENIED')
                ->whereBetween('sl.created_at', [$fromDate, $toDate])
                ->count(),
            'critical_events' => DB::table('tbl_security_logs as sl')
                ->leftJoin('tbl_users as u', 'sl.user_id', '=', 'u.id')
                ->where('u.comp_id', session('user_comp_id'))
                ->where('sl.risk_level', 'CRITICAL')
                ->whereBetween('sl.created_at', [$fromDate, $toDate])
                ->count()
        ];

        return Inertia::render('Logs/Reports', [
            'activityStats' => $activityStats,
            'securityStats' => $securityStats,
            'topUsers' => $topUsers,
            'securityIncidents' => [],
            'filters' => [
                'from_date' => $fromDate,
                'to_date' => $toDate
            ]
        ]);
    }

    /**
     * Export logs data to Excel or PDF
     */
    public function export(Request $request)
    {
        $reportType = $request->input('report_type', 'overview');
        $fromDate = $request->input('from_date', now()->subDays(30)->format('Y-m-d'));
        $toDate = $request->input('to_date', now()->format('Y-m-d'));
        $format = $request->input('format', 'excel');
        
        $companyId = session('user_comp_id');
        
        try {
            if ($format === 'excel') {
                return $this->exportToExcel($reportType, $fromDate, $toDate, $companyId);
            } elseif ($format === 'pdf') {
                return $this->exportToPDF($reportType, $fromDate, $toDate, $companyId);
            } else {
                return response()->json(['error' => 'Invalid format'], 400);
            }
        } catch (\Exception $e) {
            Log::error('Export failed: ' . $e->getMessage());
            return response()->json(['error' => 'Export failed'], 500);
        }
    }

    /**
     * Export to Excel format
     */
    private function exportToExcel($reportType, $fromDate, $toDate, $companyId)
    {
        // Create a simple CSV export for now (can be enhanced with PhpSpreadsheet later)
        $filename = "logs_report_{$reportType}_{$fromDate}_to_{$toDate}.csv";
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($reportType, $fromDate, $toDate, $companyId) {
            $file = fopen('php://output', 'w');
            
            if ($reportType === 'activity' || $reportType === 'overview') {
                // Activity logs export
                fputcsv($file, ['Date', 'User', 'Module', 'Action', 'Description', 'IP Address']);
                
                $logs = DB::table('tbl_audit_logs as al')
                    ->leftJoin('tbl_users as u', 'al.user_id', '=', 'u.id')
                    ->select(
                        'al.created_at',
                        DB::raw("CONCAT(COALESCE(u.fname, 'System'), ' ', COALESCE(u.mname, ''), ' ', COALESCE(u.lname, '')) as user_name"),
                        'al.module_name',
                        'al.action_type',
                        'al.description',
                        'al.ip_address'
                    )
                    ->where('al.company_id', $companyId)
                    ->whereBetween('al.created_at', [$fromDate, $toDate])
                    ->orderBy('al.created_at', 'desc')
                    ->get();

                foreach ($logs as $log) {
                    fputcsv($file, [
                        $log->created_at,
                        $log->user_name,
                        $log->module_name,
                        $log->action_type,
                        $log->description,
                        $log->ip_address
                    ]);
                }
            } elseif ($reportType === 'security') {
                // Security logs export
                fputcsv($file, ['Date', 'User', 'Event Type', 'Risk Level', 'Description', 'IP Address']);
                
                $logs = DB::table('tbl_security_logs as sl')
                    ->leftJoin('tbl_users as u', 'sl.user_id', '=', 'u.id')
                    ->select(
                        'sl.created_at',
                        DB::raw("CONCAT(u.fname, ' ', COALESCE(u.mname, ''), ' ', u.lname) as user_name"),
                        'sl.event_type',
                        'sl.risk_level',
                        'sl.description',
                        'sl.ip_address'
                    )
                    ->where('u.comp_id', $companyId)
                    ->whereBetween('sl.created_at', [$fromDate, $toDate])
                    ->orderBy('sl.created_at', 'desc')
                    ->get();

                foreach ($logs as $log) {
                    fputcsv($file, [
                        $log->created_at,
                        $log->user_name,
                        $log->event_type,
                        $log->risk_level,
                        $log->description,
                        $log->ip_address
                    ]);
                }
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export to PDF format
     */
    private function exportToPDF($reportType, $fromDate, $toDate, $companyId)
    {
        // For now, return a simple text response
        // In a real implementation, you would use a PDF library like DomPDF or TCPDF
        $data = "Log Report - {$reportType}\n";
        $data .= "Period: {$fromDate} to {$toDate}\n";
        $data .= "Generated: " . now()->format('Y-m-d H:i:s') . "\n\n";
        
        if ($reportType === 'activity' || $reportType === 'overview') {
            $count = DB::table('tbl_audit_logs')
                ->where('company_id', $companyId)
                ->whereBetween('created_at', [$fromDate, $toDate])
                ->count();
            $data .= "Total Activity Logs: {$count}\n";
        } elseif ($reportType === 'security') {
            $count = DB::table('tbl_security_logs as sl')
                ->leftJoin('tbl_users as u', 'sl.user_id', '=', 'u.id')
                ->where('u.comp_id', $companyId)
                ->whereBetween('sl.created_at', [$fromDate, $toDate])
                ->count();
            $data .= "Total Security Events: {$count}\n";
        }

        $filename = "logs_report_{$reportType}_{$fromDate}_to_{$toDate}.txt";
        
        return response($data)
            ->header('Content-Type', 'text/plain')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}

