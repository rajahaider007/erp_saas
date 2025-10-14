<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Services\AuditLogService;

class GeneralLedgerController extends Controller
{
    use CheckUserPermissions;
    /**
     * Display the General Ledger report page
     */
    public function index()
    {
        // Check if user has permission to can_view
        $this->requirePermission($request, null, 'can_view');
        return Inertia::render('Reports/GeneralLedger/Index');
    }

    /**
     * Get General Ledger report data
     */
    public function getData(Request $request)
    {
        Log::info('=== GENERAL LEDGER REPORT REQUEST STARTED ===');
        
        $filters = $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'account_codes' => 'nullable|array',
            'account_types' => 'nullable|array',
            'currency' => 'nullable|string',
            'include_zero_balances' => 'boolean',
            'show_details' => 'boolean',
            'group_by' => 'nullable|string|in:account,type,period',
            'sort_by' => 'nullable|string|in:account_code,account_name,balance',
            'sort_order' => 'nullable|string|in:asc,desc'
        ]);

        // Set default values
        $filters = array_merge([
            'date_from' => now()->startOfMonth()->format('Y-m-d'),
            'date_to' => now()->endOfMonth()->format('Y-m-d'),
            'account_codes' => [],
            'account_types' => [],
            'currency' => 'USD',
            'include_zero_balances' => false,
            'show_details' => true,
            'group_by' => 'account',
            'sort_by' => 'account_code',
            'sort_order' => 'asc'
        ], $filters);

        try {
            $reportData = $this->generateReportData($filters);
            
            // Log report generation
            try {
                $userId = session('user_id');
                $compId = session('user_comp_id');
                $locationId = session('user_location_id');
                
                $reportDataForLog = [
                    'report_type' => 'General Ledger Report',
                    'report_name' => 'General Ledger',
                    'date_from' => $filters['date_from'],
                    'date_to' => $filters['date_to'],
                    'account_codes_count' => count($filters['account_codes'] ?? []),
                    'account_types_count' => count($filters['account_types'] ?? []),
                    'currency' => $filters['currency'],
                    'include_zero_balances' => $filters['include_zero_balances'],
                    'show_details' => $filters['show_details'],
                    'group_by' => $filters['group_by'],
                    'sort_by' => $filters['sort_by'],
                    'sort_order' => $filters['sort_order'],
                    'total_records' => count($reportData),
                    'comp_id' => $compId,
                    'location_id' => $locationId
                ];
                
                AuditLogService::logReport('VIEW', null, $reportDataForLog);
                Log::info('General Ledger report generated successfully', $reportDataForLog);
            } catch (\Exception $auditException) {
                Log::warning('Failed to create audit log for general ledger report', [
                    'error' => $auditException->getMessage(),
                    'filters' => $filters
                ]);
            }
            
            return response()->json([
                'success' => true,
                'report' => $reportData,
                'filters' => $filters,
                'generated_at' => now()->toISOString()
            ]);
        } catch (\Exception $e) {
            Log::error('General Ledger Report Error: ' . $e->getMessage(), [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'filters' => $filters
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error generating report: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate report data based on filters
     */
    private function generateReportData($filters)
    {
        $query = DB::table('chart_of_accounts as coa')
            ->leftJoin('journal_entries as je', function($join) use ($filters) {
                $join->on('coa.id', '=', 'je.account_id')
                     ->whereBetween('je.transaction_date', [$filters['date_from'], $filters['date_to']]);
            })
            ->leftJoin('journal_entry_items as jei', 'je.id', '=', 'jei.journal_entry_id')
            ->select([
                'coa.id as account_id',
                'coa.account_code',
                'coa.account_name',
                'coa.account_type',
                'coa.parent_id',
                'coa.is_active',
                DB::raw('COALESCE(SUM(CASE WHEN jei.debit_amount > 0 THEN jei.debit_amount ELSE 0 END), 0) as debit_total'),
                DB::raw('COALESCE(SUM(CASE WHEN jei.credit_amount > 0 THEN jei.credit_amount ELSE 0 END), 0) as credit_total'),
                DB::raw('COUNT(DISTINCT je.id) as transactions_count'),
                DB::raw('MAX(je.transaction_date) as last_transaction_date')
            ])
            ->where('coa.is_active', true)
            ->groupBy('coa.id', 'coa.account_code', 'coa.account_name', 'coa.account_type', 'coa.parent_id', 'coa.is_active');

        // Apply filters
        if (!empty($filters['account_codes'])) {
            $query->whereIn('coa.account_code', $filters['account_codes']);
        }

        if (!empty($filters['account_types'])) {
            $query->whereIn('coa.account_type', $filters['account_types']);
        }

        // Get opening balances
        $openingBalances = $this->getOpeningBalances($filters);

        // Execute query
        $results = $query->get();

        // Process results
        $reportData = [];
        foreach ($results as $row) {
            $openingBalance = $openingBalances[$row->account_id] ?? 0;
            $closingBalance = $openingBalance + $row->debit_total - $row->credit_total;

            // Skip zero balances if filter is set
            if (!$filters['include_zero_balances'] && $closingBalance == 0 && $row->debit_total == 0 && $row->credit_total == 0) {
                continue;
            }

            $reportData[] = [
                'account_id' => $row->account_id,
                'account_code' => $row->account_code,
                'account_name' => $row->account_name,
                'account_type' => ucfirst($row->account_type),
                'opening_balance' => $openingBalance,
                'debit_total' => $row->debit_total,
                'credit_total' => $row->credit_total,
                'closing_balance' => $closingBalance,
                'transactions_count' => $row->transactions_count,
                'last_transaction_date' => $row->last_transaction_date
            ];
        }

        // Sort results
        $sortBy = $filters['sort_by'];
        $sortOrder = $filters['sort_order'];
        
        usort($reportData, function($a, $b) use ($sortBy, $sortOrder) {
            $valueA = $a[$sortBy] ?? '';
            $valueB = $b[$sortBy] ?? '';
            
            if ($sortBy === 'balance') {
                $valueA = $a['closing_balance'];
                $valueB = $b['closing_balance'];
            }
            
            if ($sortOrder === 'desc') {
                return $valueB <=> $valueA;
            }
            return $valueA <=> $valueB;
        });

        return $reportData;
    }

    /**
     * Get opening balances for accounts
     */
    private function getOpeningBalances($filters)
    {
        $openingBalances = [];
        
        // Get balances from previous period
        $query = DB::table('chart_of_accounts as coa')
            ->leftJoin('journal_entries as je', function($join) use ($filters) {
                $join->on('coa.id', '=', 'je.account_id')
                     ->where('je.transaction_date', '<', $filters['date_from']);
            })
            ->leftJoin('journal_entry_items as jei', 'je.id', '=', 'jei.journal_entry_id')
            ->select([
                'coa.id as account_id',
                DB::raw('COALESCE(SUM(jei.debit_amount - jei.credit_amount), 0) as opening_balance')
            ])
            ->where('coa.is_active', true)
            ->groupBy('coa.id');

        if (!empty($filters['account_codes'])) {
            $query->whereIn('coa.account_code', $filters['account_codes']);
        }

        if (!empty($filters['account_types'])) {
            $query->whereIn('coa.account_type', $filters['account_types']);
        }

        $results = $query->get();
        
        foreach ($results as $row) {
            $openingBalances[$row->account_id] = $row->opening_balance;
        }

        return $openingBalances;
    }

    /**
     * Export report to PDF
     */
    public function exportPDF(Request $request)
    {
        Log::info('=== GENERAL LEDGER PDF EXPORT STARTED ===');
        
        try {
            $filters = $request->input('filters', []);
            $visibleColumns = $request->input('visibleColumns', []);
            
            // Generate report data
            $reportData = $this->generateReportData($filters);
            
            // Log PDF export
            try {
                $userId = session('user_id');
                $compId = session('user_comp_id');
                $locationId = session('user_location_id');
                
                $exportData = [
                    'report_type' => 'General Ledger Report',
                    'export_format' => 'PDF',
                    'date_from' => $filters['date_from'] ?? null,
                    'date_to' => $filters['date_to'] ?? null,
                    'total_records' => count($reportData),
                    'visible_columns' => $visibleColumns,
                    'comp_id' => $compId,
                    'location_id' => $locationId
                ];
                
                AuditLogService::logReport('EXPORT', null, $exportData);
                Log::info('General Ledger PDF export successful', $exportData);
            } catch (\Exception $auditException) {
                Log::warning('Failed to create audit log for PDF export', [
                    'error' => $auditException->getMessage()
                ]);
            }
            
            // Create PDF using a PDF library (e.g., DomPDF, TCPDF, etc.)
            // This is a placeholder - you'll need to implement actual PDF generation
            $pdf = $this->generatePDF($reportData, $filters, $visibleColumns);
            
            return response($pdf, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="General_Ledger_Report.pdf"'
            ]);
            
        } catch (\Exception $e) {
            Log::error('General Ledger PDF export error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error exporting PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export report to Excel
     */
    public function exportExcel(Request $request)
    {
        Log::info('=== GENERAL LEDGER EXCEL EXPORT STARTED ===');
        
        try {
            $filters = $request->input('filters', []);
            $visibleColumns = $request->input('visibleColumns', []);
            
            // Generate report data
            $reportData = $this->generateReportData($filters);
            
            // Log Excel export
            try {
                $userId = session('user_id');
                $compId = session('user_comp_id');
                $locationId = session('user_location_id');
                
                $exportData = [
                    'report_type' => 'General Ledger Report',
                    'export_format' => 'Excel',
                    'date_from' => $filters['date_from'] ?? null,
                    'date_to' => $filters['date_to'] ?? null,
                    'total_records' => count($reportData),
                    'visible_columns' => $visibleColumns,
                    'comp_id' => $compId,
                    'location_id' => $locationId
                ];
                
                AuditLogService::logReport('EXPORT', null, $exportData);
                Log::info('General Ledger Excel export successful', $exportData);
            } catch (\Exception $auditException) {
                Log::warning('Failed to create audit log for Excel export', [
                    'error' => $auditException->getMessage()
                ]);
            }
            
            // Create Excel file using a library like PhpSpreadsheet
            // This is a placeholder - you'll need to implement actual Excel generation
            $excel = $this->generateExcel($reportData, $filters, $visibleColumns);
            
            return response($excel, 200, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="General_Ledger_Report.xlsx"'
            ]);
            
        } catch (\Exception $e) {
            Log::error('General Ledger Excel export error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error exporting Excel: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export report to CSV
     */
    public function exportCSV(Request $request)
    {
        Log::info('=== GENERAL LEDGER CSV EXPORT STARTED ===');
        
        try {
            $filters = $request->input('filters', []);
            $visibleColumns = $request->input('visibleColumns', []);
            
            // Generate report data
            $reportData = $this->generateReportData($filters);
            
            // Log CSV export
            try {
                $userId = session('user_id');
                $compId = session('user_comp_id');
                $locationId = session('user_location_id');
                
                $exportData = [
                    'report_type' => 'General Ledger Report',
                    'export_format' => 'CSV',
                    'date_from' => $filters['date_from'] ?? null,
                    'date_to' => $filters['date_to'] ?? null,
                    'total_records' => count($reportData),
                    'visible_columns' => $visibleColumns,
                    'comp_id' => $compId,
                    'location_id' => $locationId
                ];
                
                AuditLogService::logReport('EXPORT', null, $exportData);
                Log::info('General Ledger CSV export successful', $exportData);
            } catch (\Exception $auditException) {
                Log::warning('Failed to create audit log for CSV export', [
                    'error' => $auditException->getMessage()
                ]);
            }
            
            // Create CSV
            $csv = $this->generateCSV($reportData, $filters, $visibleColumns);
            
            return response($csv, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="General_Ledger_Report.csv"'
            ]);
            
        } catch (\Exception $e) {
            Log::error('General Ledger CSV export error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error exporting CSV: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate PDF content
     */
    private function generatePDF($reportData, $filters, $visibleColumns)
    {
        // This is a placeholder for PDF generation
        // You would use a library like DomPDF, TCPDF, or Laravel Snappy
        $html = $this->generateReportHTML($reportData, $filters, $visibleColumns);
        
        // For now, return HTML as placeholder
        return $html;
    }

    /**
     * Generate Excel content
     */
    private function generateExcel($reportData, $filters, $visibleColumns)
    {
        // This is a placeholder for Excel generation
        // You would use PhpSpreadsheet library
        return "Excel generation not implemented yet";
    }

    /**
     * Generate CSV content
     */
    private function generateCSV($reportData, $filters, $visibleColumns)
    {
        $output = fopen('php://temp', 'r+');
        
        // Add headers
        $headers = [];
        if ($visibleColumns['account_code']) $headers[] = 'Account Code';
        if ($visibleColumns['account_name']) $headers[] = 'Account Name';
        if ($visibleColumns['account_type']) $headers[] = 'Type';
        if ($visibleColumns['opening_balance']) $headers[] = 'Opening Balance';
        if ($visibleColumns['debit_total']) $headers[] = 'Debit Total';
        if ($visibleColumns['credit_total']) $headers[] = 'Credit Total';
        if ($visibleColumns['closing_balance']) $headers[] = 'Closing Balance';
        if ($visibleColumns['transactions_count']) $headers[] = 'Transactions';
        if ($visibleColumns['last_transaction_date']) $headers[] = 'Last Transaction';
        
        fputcsv($output, $headers);
        
        // Add data rows
        foreach ($reportData as $row) {
            $csvRow = [];
            if ($visibleColumns['account_code']) $csvRow[] = $row['account_code'];
            if ($visibleColumns['account_name']) $csvRow[] = $row['account_name'];
            if ($visibleColumns['account_type']) $csvRow[] = $row['account_type'];
            if ($visibleColumns['opening_balance']) $csvRow[] = $row['opening_balance'];
            if ($visibleColumns['debit_total']) $csvRow[] = $row['debit_total'];
            if ($visibleColumns['credit_total']) $csvRow[] = $row['credit_total'];
            if ($visibleColumns['closing_balance']) $csvRow[] = $row['closing_balance'];
            if ($visibleColumns['transactions_count']) $csvRow[] = $row['transactions_count'];
            if ($visibleColumns['last_transaction_date']) $csvRow[] = $row['last_transaction_date'];
            
            fputcsv($output, $csvRow);
        }
        
        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);
        
        return $csv;
    }

    /**
     * Generate HTML for report
     */
    private function generateReportHTML($reportData, $filters, $visibleColumns)
    {
        $html = '<!DOCTYPE html>
        <html>
        <head>
            <title>General Ledger Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .currency { font-family: monospace; }
            </style>
        </head>
        <body>
            <h1>General Ledger Report</h1>
            <p>Period: ' . $filters['date_from'] . ' to ' . $filters['date_to'] . '</p>
            <p>Generated: ' . now()->format('Y-m-d H:i:s') . '</p>
            
            <table>
                <thead>
                    <tr>';
        
        if ($visibleColumns['account_code']) $html .= '<th>Account Code</th>';
        if ($visibleColumns['account_name']) $html .= '<th>Account Name</th>';
        if ($visibleColumns['account_type']) $html .= '<th>Type</th>';
        if ($visibleColumns['opening_balance']) $html .= '<th class="text-right">Opening Balance</th>';
        if ($visibleColumns['debit_total']) $html .= '<th class="text-right">Debit Total</th>';
        if ($visibleColumns['credit_total']) $html .= '<th class="text-right">Credit Total</th>';
        if ($visibleColumns['closing_balance']) $html .= '<th class="text-right">Closing Balance</th>';
        if ($visibleColumns['transactions_count']) $html .= '<th class="text-center">Transactions</th>';
        if ($visibleColumns['last_transaction_date']) $html .= '<th>Last Transaction</th>';
        
        $html .= '</tr>
                </thead>
                <tbody>';
        
        foreach ($reportData as $row) {
            $html .= '<tr>';
            if ($visibleColumns['account_code']) $html .= '<td>' . $row['account_code'] . '</td>';
            if ($visibleColumns['account_name']) $html .= '<td>' . $row['account_name'] . '</td>';
            if ($visibleColumns['account_type']) $html .= '<td>' . $row['account_type'] . '</td>';
            if ($visibleColumns['opening_balance']) $html .= '<td class="text-right currency">' . number_format($row['opening_balance'], 2) . '</td>';
            if ($visibleColumns['debit_total']) $html .= '<td class="text-right currency">' . number_format($row['debit_total'], 2) . '</td>';
            if ($visibleColumns['credit_total']) $html .= '<td class="text-right currency">' . number_format($row['credit_total'], 2) . '</td>';
            if ($visibleColumns['closing_balance']) $html .= '<td class="text-right currency">' . number_format($row['closing_balance'], 2) . '</td>';
            if ($visibleColumns['transactions_count']) $html .= '<td class="text-center">' . $row['transactions_count'] . '</td>';
            if ($visibleColumns['last_transaction_date']) $html .= '<td>' . ($row['last_transaction_date'] ? date('Y-m-d', strtotime($row['last_transaction_date'])) : '-') . '</td>';
            $html .= '</tr>';
        }
        
        $html .= '</tbody>
            </table>
        </body>
        </html>';
        
        return $html;
    }
}
