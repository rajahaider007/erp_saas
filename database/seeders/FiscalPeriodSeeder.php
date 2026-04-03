<?php

namespace Database\Seeders;

use App\Helpers\FiscalYearHelper;
use App\Models\Company;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FiscalPeriodSeeder extends Seeder
{
    public function run(): void
    {
        $companies = Company::query()->orderBy('id')->get();

        if ($companies->isEmpty()) {
            $this->command->warn('FiscalPeriodSeeder skipped (no companies).');

            return;
        }

        foreach ($companies as $company) {
            $fiscalYear = FiscalYearHelper::getCurrentFiscalYear($company->id);
            $dates = FiscalYearHelper::getFiscalYearDates($fiscalYear, $company->id);

            if (! $dates) {
                continue;
            }

            $exists = DB::table('fiscal_periods')
                ->where('comp_id', $company->id)
                ->where('fiscal_year', $fiscalYear)
                ->where('status', 'Open')
                ->exists();

            if ($exists) {
                continue;
            }

            $now = now();

            DB::table('fiscal_periods')->insert([
                'comp_id' => $company->id,
                'fiscal_year' => $fiscalYear,
                'period_number' => 1,
                'period_name' => "FY {$fiscalYear}",
                'start_date' => $dates['start_date']->toDateString(),
                'end_date' => $dates['end_date']->toDateString(),
                'period_type' => 'Annual',
                'status' => 'Open',
                'is_adjustment_period' => false,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $this->command->info('Open fiscal periods ensured for current year (per company).');
    }
}
