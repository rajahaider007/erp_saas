<?php

namespace App\Helpers;

use App\Models\FiscalPeriod;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FiscalYearHelper
{
    /**
     * Get fiscal year for a given date and company
     * Uses company's fiscal_year_start to determine the fiscal year
     *
     * @param string|Carbon $date - Date to determine fiscal year for
     * @param int $compId - Company ID
     * @return string - Fiscal year (YYYY format)
     */
    public static function getFiscalYear($date, $compId): string
    {
        if (is_string($date)) {
            $date = Carbon::parse($date);
        }

        // Get company fiscal year start
        $company = DB::table('companies')->where('id', $compId)->first();
        if (!$company) {
            return (string)$date->year;
        }

        $fiscalYearStart = $company->fiscal_year_start ?? '01-01';
        list($startMonth, $startDay) = explode('-', $fiscalYearStart);

        $fiscalYearStartDate = Carbon::create($date->year, (int)$startMonth, (int)$startDay);

        // If date is before fiscal year start, it belongs to previous fiscal year
        if ($date->lt($fiscalYearStartDate)) {
            return (string)($date->year - 1);
        }

        return (string)$date->year;
    }

    /**
     * Get current fiscal year for a company
     *
     * @param int $compId - Company ID
     * @return string - Current fiscal year
     */
    public static function getCurrentFiscalYear($compId): string
    {
        return self::getFiscalYear(Carbon::today(), $compId);
    }

    /**
     * Get fiscal period for a given date and company
     *
     * @param string|Carbon $date - Date to find period for
     * @param int $compId - Company ID
     * @return FiscalPeriod|null
     */
    public static function getFiscalPeriod($date, $compId): ?FiscalPeriod
    {
        if (is_string($date)) {
            $date = Carbon::parse($date);
        }

        $fiscalYear = self::getFiscalYear($date, $compId);

        return FiscalPeriod::where('comp_id', $compId)
            ->where('fiscal_year', $fiscalYear)
            ->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->first();
    }

    /**
     * Get fiscal period by ID and verify it belongs to company
     *
     * @param int $periodId
     * @param int $compId
     * @return FiscalPeriod|null
     */
    public static function getPeriod($periodId, $compId): ?FiscalPeriod
    {
        return FiscalPeriod::where('id', $periodId)
            ->where('comp_id', $compId)
            ->first();
    }

    /**
     * Get fiscal year details (start and end dates)
     *
     * @param string $fiscalYear - Fiscal year (YYYY)
     * @param int $compId - Company ID
     * @return array|null - Array with start_date and end_date, or null if not found
     */
    public static function getFiscalYearDates($fiscalYear, $compId): ?array
    {
        $company = DB::table('companies')->where('id', $compId)->first();
        if (!$company) {
            return null;
        }

        $fiscalYearStart = $company->fiscal_year_start ?? '01-01';
        list($startMonth, $startDay) = explode('-', $fiscalYearStart);

        $startDate = Carbon::create((int)$fiscalYear, (int)$startMonth, (int)$startDay);
        $endDate = $startDate->copy()->addYear()->subDay();

        return [
            'start_date' => $startDate,
            'end_date' => $endDate
        ];
    }

    /**
     * Check if period is open (can accept transactions)
     *
     * @param int $periodId
     * @param int $compId
     * @return bool
     */
    public static function isPeriodOpen($periodId, $compId): bool
    {
        $period = self::getPeriod($periodId, $compId);
        return $period && $period->status === 'Open';
    }

    /**
     * Lock all periods in a fiscal year
     *
     * @param string $fiscalYear
     * @param int $compId
     * @return void
     */
    public static function lockFiscalYear($fiscalYear, $compId): void
    {
        FiscalPeriod::where('comp_id', $compId)
            ->where('fiscal_year', $fiscalYear)
            ->where('status', 'Open')
            ->update(['status' => 'Locked']);
    }

    /**
     * Close all periods in a fiscal year (year-end closing)
     *
     * @param string $fiscalYear
     * @param int $compId
     * @param int|null $closedBy - User ID
     * @return void
     */
    public static function closeFiscalYear($fiscalYear, $compId, $closedBy = null): void
    {
        FiscalPeriod::where('comp_id', $compId)
            ->where('fiscal_year', $fiscalYear)
            ->where('status', '!=', 'Closed')
            ->update([
                'status' => 'Closed',
                'closed_by' => $closedBy,
                'closed_at' => now()
            ]);
    }
}
