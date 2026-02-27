<?php

namespace App\Http\Controllers\Accounts;

use App\Http\Controllers\Controller;
use App\Http\Traits\CheckUserPermissions;
use App\Models\FiscalPeriod;
use App\Helpers\CompanyHelper;
use App\Helpers\FiscalYearHelper;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FiscalYearConfigurationController extends Controller
{
    use CheckUserPermissions;

    /**
     * Display fiscal years and periods
     */
    public function index(Request $request): Response
    {
        $compId = $request->input('comp_id') ?? $request->session()->get('user_comp_id');
        $locationId = $request->input('location_id') ?? $request->session()->get('user_location_id');

        if (!$compId || !$locationId) {
            return Inertia::render('Accounts/FiscalYearConfiguration/Index', [
                'fiscalYears' => [],
                'periods' => [],
                'error' => 'Company and Location information is required.'
            ]);
        }

        // Get company to know fiscal year start
        $company = DB::table('companies')->where('id', $compId)->first();
        
        // Get current fiscal year
        $currentFiscalYear = $this->getCurrentFiscalYear($company->fiscal_year_start ?? '01-01');

        // Get all fiscal years with their periods
        $fiscalYears = FiscalPeriod::where('comp_id', $compId)
            ->select('fiscal_year')
            ->distinct()
            ->orderByDesc('fiscal_year')
            ->get()
            ->pluck('fiscal_year')
            ->toArray();

        // If no fiscal years exist, create current and next year
        if (empty($fiscalYears)) {
            $this->createFiscalYear($compId, $currentFiscalYear, $company->fiscal_year_start ?? '01-01');
            $this->createFiscalYear($compId, (int)$currentFiscalYear + 1, $company->fiscal_year_start ?? '01-01');
            $fiscalYears = [$currentFiscalYear, (int)$currentFiscalYear + 1];
        }

        // Get selected year (default to current)
        $selectedYear = $request->input('fiscal_year', $currentFiscalYear);

        // Get periods for selected year
        $periods = FiscalPeriod::where('comp_id', $compId)
            ->where('fiscal_year', $selectedYear)
            ->orderBy('period_number')
            ->get();

        return Inertia::render('Accounts/FiscalYearConfiguration/Index', [
            'company' => $company,
            'fiscalYears' => $fiscalYears,
            'selectedYear' => $selectedYear,
            'periods' => $periods,
            'currentFiscalYear' => $currentFiscalYear,
            'fiscalYear' => $currentFiscalYear
        ]);
    }

    /**
     * Create a new fiscal year with periods
     */
    public function createYear(Request $request)
    {
        $compId = $request->input('comp_id') ?? $request->session()->get('user_comp_id');
        $year = $request->input('year');

        if (!$compId || !$year) {
            return redirect()->back()->with('error', 'Invalid request');
        }

        // Check if year already exists
        $exists = FiscalPeriod::where('comp_id', $compId)
            ->where('fiscal_year', $year)
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', "Fiscal year {$year} already exists");
        }

        $company = DB::table('companies')->where('id', $compId)->first();
        $this->createFiscalYear($compId, $year, $company->fiscal_year_start ?? '01-01');

        return redirect()->back()->with('success', "Fiscal year {$year} created successfully with 12 monthly periods");
    }

    /**
     * Update period status
     */
    public function updatePeriodStatus(Request $request)
    {
        $periodId = $request->input('period_id');
        $status = $request->input('status');
        $compId = $request->session()->get('user_comp_id');

        if (!$periodId || !in_array($status, ['Open', 'Locked', 'Closed'])) {
            return redirect()->back()->with('error', 'Invalid request');
        }

        $period = FiscalPeriod::where('id', $periodId)
            ->where('comp_id', $compId)
            ->first();

        if (!$period) {
            return redirect()->back()->with('error', 'Period not found');
        }

        // Validate status transitions
        if ($status === 'Closed' && !$period->canClose()) {
            return redirect()->back()->with('error', 'This period cannot be closed');
        }

        // If closing, verify all entries are posted
        if ($status === 'Closed') {
            $unpostedCount = DB::table('transactions')
                ->where('period_id', $periodId)
                ->where('status', '!=', 'Posted')
                ->count();

            if ($unpostedCount > 0) {
                return redirect()->back()->with('error', 'Cannot close period. All transactions must be posted.');
            }
        }

        $period->update([
            'status' => $status,
            'closed_by' => $request->session()->get('user_id'),
            'closed_at' => $status === 'Closed' ? now() : null
        ]);

        return redirect()->back()->with('success', "Period status updated to {$status}");
    }

    /**
     * Get current fiscal year based on fiscal year start
     */
    private function getCurrentFiscalYear($fiscalYearStart = '01-01'): string
    {
        $today = Carbon::today();
        list($startMonth, $startDay) = explode('-', $fiscalYearStart);
        
        $fiscalYearStart = Carbon::create($today->year, $startMonth, $startDay);
        
        // If today is before fiscal year start, current fiscal year started last calendar year
        if ($today->lt($fiscalYearStart)) {
            return (string)($today->year - 1);
        }
        
        return (string)$today->year;
    }

    /**
     * Create fiscal year with monthly periods
     */
    private function createFiscalYear($compId, $year, $fiscalYearStart = '01-01'): void
    {
        list($startMonth, $startDay) = explode('-', $fiscalYearStart);
        $startDate = Carbon::create(
            (int)$year,
            (int)$startMonth,
            (int)$startDay
        );

        // Create 12 monthly periods
        for ($i = 1; $i <= 12; $i++) {
            $periodStart = $startDate->copy()->addMonths($i - 1);
            $periodEnd = $periodStart->copy()->endOfMonth();
            
            // Ensure end date doesn't exceed fiscal year boundary
            $nextYearStart = $startDate->copy()->addYear();
            if ($periodEnd->gte($nextYearStart)) {
                $periodEnd = $nextYearStart->copy()->subDay();
            }

            FiscalPeriod::create([
                'comp_id' => $compId,
                'fiscal_year' => (string)$year,
                'period_number' => $i,
                'period_name' => $periodStart->format('F Y'),
                'start_date' => $periodStart,
                'end_date' => $periodEnd,
                'period_type' => 'Monthly',
                'status' => 'Open',
                'is_adjustment_period' => false,
            ]);
        }

        // Create adjustment period at year end
        $adjustmentStart = $startDate->copy()->addMonths(12);
        $adjustmentEnd = $adjustmentStart->copy()->addDays(5);

        FiscalPeriod::create([
            'comp_id' => $compId,
            'fiscal_year' => (string)$year,
            'period_number' => 13,
            'period_name' => "Adjustments {$year}",
            'start_date' => $adjustmentStart,
            'end_date' => $adjustmentEnd,
            'period_type' => 'Custom',
            'status' => 'Open',
            'is_adjustment_period' => true,
        ]);
    }
}
