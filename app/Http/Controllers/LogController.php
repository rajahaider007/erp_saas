<?php

namespace App\Http\Controllers;

use App\Services\AuditLogService;
use App\Services\RecoveryService;
use App\Services\SecurityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        $query = DB::table('tbl_audit_logs as al')
            ->leftJoin('tbl_users as u', 'al.user_id', '=', 'u.id')
            ->select(
                'al.*',
                DB::raw("CONCAT(u.fname, ' ', COALESCE(u.mname, ''), ' ', u.lname) as user_name"),
                'u.email as user_email'
            )
            ->where('al.company_id', session('user_comp_id'));

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
            ->where('r.recovery_expires_at', '>', now());

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
            );

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
            ->groupBy('al.user_id', 'u.fname', 'u.mname', 'u.lname', 'u.email')
            ->orderBy('total_actions', 'desc')
            ->limit(10)
            ->get();

        // Security incidents
        $securityIncidents = DB::table('tbl_security_logs')
            ->where('event_status', 'FAILED')
            ->whereBetween('created_at', [$fromDate, $toDate])
            ->count();

        // Deleted items count
        $deletedItemsCount = DB::table('tbl_deleted_data_recovery')
            ->where('status', 'DELETED')
            ->count();

        return Inertia::render('Logs/Reports', [
            'stats' => [
                'activity_by_module' => $activityByModule,
                'top_users' => $topUsers,
                'security_incidents' => $securityIncidents,
                'deleted_items_count' => $deletedItemsCount
            ],
            'filters' => [
                'from_date' => $fromDate,
                'to_date' => $toDate
            ]
        ]);
    }
}

