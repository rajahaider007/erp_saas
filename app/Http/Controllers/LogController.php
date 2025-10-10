<?php

namespace App\Http\Controllers;

use App\Services\AuditLogService;
use App\Services\RecoveryService;
use App\Services\SecurityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LogController extends Controller
{
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

        $companyId = session('user_comp_id');
        
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
                  ->orWhere('al.table_name', 'like', "%{$search}%")
                  ->orWhere('u.name', 'like', "%{$search}%");
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

        // Get all users for filter
        $users = DB::table('tbl_users')
            ->where('comp_id', session('user_comp_id'))
            ->select(
                'id',
                DB::raw("CONCAT(fname, ' ', COALESCE(mname, ''), ' ', lname) as name"),
                'email'
            )
            ->get();

        return Inertia::render('Logs/ActivityLogs', [
            'logs' => $logs,
            'users' => $users,
            'filters' => [
                'search' => $search,
                'module' => $module,
                'action' => $action,
                'user_id' => $userId,
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'per_page' => $perPage
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

        $query = DB::table('tbl_security_logs as sl')
            ->leftJoin('tbl_users as u', 'sl.user_id', '=', 'u.id')
            ->select(
                'sl.*',
                DB::raw("CONCAT(u.fname, ' ', COALESCE(u.mname, ''), ' ', u.lname) as user_name"),
                'u.email as user_email'
            )
            ->where('u.comp_id', session('user_comp_id')); // Company filtering via user

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

        return Inertia::render('Logs/SecurityLogs', [
            'logs' => $logs,
            'filters' => [
                'event_type' => $eventType,
                'risk_level' => $riskLevel,
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'per_page' => $perPage
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
}

