# Fiscal Year System - Testing & Verification Guide

## Pre-Flight Checklist

Before testing the fiscal year system, verify:

- [ ] Both migrations executed successfully
- [ ] Database tables `fiscal_periods` and updated `transactions` table exist
- [ ] All controllers imported FiscalYearHelper
- [ ] Routes are registered in `routes/web.php`
- [ ] Header.jsx shows fiscal year badge
- [ ] React components created in `resources/js/Pages/Accounts/`
- [ ] Company has `fiscal_year_start` configured (check `companies` table)

---

## Test Case 1: Fiscal Year Auto-Creation

### Objective
Verify that fiscal year configuration auto-creates current and next fiscal year upon first access.

### Steps
```
1. Open browser and navigate to: /accounts/fiscal-year-configuration
2. Observe left sidebar "Create New Year" form
3. Verify periods are listed (should see January 2025, February 2025, ... Adjustment 2025)
4. Look for next fiscal year (2026) periods as well
```

### Expected Results
✅ Two fiscal years displayed (current and next)
✅ Each year shows 13 periods (12 months + 1 adjustment)
✅ Period names properly formatted: "January 2025", "February 2025", etc.
✅ Period dates align with company fiscal year start
✅ Status shows "Open" for all new periods

### Failure Scenarios
❌ Only one fiscal year shows → FiscalYearConfigurationController not running auto-creation logic
❌ Periods are numbered 1-13 but not named → Issue with `createFiscalYear()` period name generation
❌ Period dates don't match company fiscal year start → Issue with fiscal year start calculation

---

## Test Case 2: Create Journal Voucher with Fiscal Year

### Objective
Verify that creating a journal voucher automatically captures the fiscal year.

### Steps
```
1. Navigate to: /accounts/journal-voucher/create
2. Fill in transaction details:
   - Voucher Date: 2026-03-15
   - Description: Test Entry
   - Add line items with debit/credit entries
3. Click "Save & Post"
4. Verify transaction was saved
5. Check database: SELECT * FROM transactions WHERE id = [last_id]
```

### Expected Results
✅ Transaction saves successfully
✅ Database shows `fiscal_year = "2025"` (for March 15, 2026 entry)
✅ Database shows `period_id = 3` (March is period 3)
✅ Header badge shows "FY 2025"

### Failure Scenarios
❌ Error "No accounting period found" → Fiscal year/period doesn't exist (run Test Case 1 first)
❌ Transaction saved but fiscal_year is NULL → FiscalYearHelper not called in store()
❌ fiscal_year = "2026" (wrong year) → Issue with fiscal_year_start offset calculation

---

## Test Case 3: Try Posting to Locked Period

### Objective
Verify that the system prevents posting to locked periods.

### Steps
```
1. In Fiscal Year Configuration, click "Lock" on a period (e.g., January 2025)
2. Verify status changes to "Locked"
3. Navigate to: /accounts/journal-voucher/create
4. Fill in transaction with voucher date in January 2025
5. Click "Save & Post"
6. Observe error message
```

### Expected Results
✅ Error displays: "The accounting period is Locked and cannot accept new transactions"
✅ Transaction is NOT saved
✅ User is redirected back to form with validation error

### Failure Scenarios
❌ Transaction is saved despite locked period → Period validation not implemented in JournalVoucherController
❌ Cryptic database error → Missing try/catch in validation logic

---

## Test Case 4: Balance Sheet Report

### Objective
Verify balance sheet calculation filters by fiscal year.

### Steps
```
1. Navigate to: /accounts/balance-sheet
2. Select "As At Date": 2026-03-31
3. (Optional) Select "Comparative Date": 2025-03-31
4. Click "Generate"
5. Observe report structure:
   - Assets (Current/Non-Current)
   - Liabilities (Current/Non-Current)
   - Equity (Capital/Reserves/Earnings)
```

### Expected Results
✅ Report displays with proper IAS 1 structure
✅ Balance equation validates: Assets = Liabilities + Equity
✅ All accounts classified to correct sections
✅ Currency formatted correctly (2 decimals)
✅ Fiscal year appears in report header

### Failure Scenarios
❌ Report shows 0 balances → Fiscal year filter excluding all transactions
❌ Balance equation shows error → Issue in `calculateAccountBalance()` debit/credit logic
❌ Accounts in wrong sections → Chart of accounts classification issue (not fiscal year related)

---

## Test Case 5: Income Statement Report

### Objective
Verify income statement calculates P&L across fiscal year boundaries.

### Steps
```
1. Navigate to: /accounts/income-statement
2. Select "From Date": 2025-04-01 (fiscal year start)
3. Select "To Date": 2026-03-31 (fiscal year end)
4. Click "Generate"
5. Observe sections:
   - Revenue
   - Cost of Goods Sold
   - Gross Profit
   - Operating Expenses
   - Operating Profit
   - Finance Items
   - Profit Before Tax
   - Tax
   - Net Profit
```

### Expected Results
✅ All sections display with proper hierarchy
✅ Net Profit showing (green if positive, red if negative)
✅ Subtotals calculate correctly at each stage
✅ Fiscal year range displayed in header
✅ Data matches accounting principles (revenues credit positive, expenses debit positive)

### Failure Scenarios
❌ P&L shows 0 balances → Fiscal year or date filtering issue
❌ Numbers seem inverted → Issue in `calculateIncomeStatementBalance()` sign logic
❌ Sections missing → Issue in account classification or filtering

---

## Test Case 6: Header Fiscal Year Badge

### Objective
Verify fiscal year displays in application header.

### Steps
```
1. Navigate to any page after logging in
2. Look at top-right of header near company name
3. Verify fiscal year badge appears
```

### Expected Results
✅ Badge displays: "FY 2026" (or current fiscal year)
✅ Amber background with dark text
✅ Appears next to company name
✅ Updates correctly when fiscal year changes

### Failure Scenarios
❌ Badge doesn't appear → `fiscalYear` not passed from controller
❌ Shows wrong fiscal year → Issue in `getCurrentFiscalYear()` calculation
❌ Styling broken → Tailwind classes not applied correctly

---

## SQL Verification Queries

Run these queries in your database client to verify data:

### Check Fiscal Periods Created
```sql
SELECT fiscal_year, COUNT(*) as period_count, GROUP_CONCAT(period_name)
FROM fiscal_periods
WHERE comp_id = 1
GROUP BY fiscal_year
ORDER BY fiscal_year DESC;
```

**Expected**: Should show 2025 and 2026 with 13 periods each

### Check Transaction Fiscal Years
```sql
SELECT fiscal_year, COUNT(*) as transaction_count
FROM transactions
WHERE comp_id = 1 AND status = 'Posted'
GROUP BY fiscal_year
ORDER BY fiscal_year DESC;
```

**Expected**: Should show transactions distributed by fiscal year

### Verify Period Status
```sql
SELECT fiscal_year, status, COUNT(*) as period_count
FROM fiscal_periods
WHERE comp_id = 1
GROUP BY fiscal_year, status
ORDER BY fiscal_year DESC, 
         FIELD(status, 'Open', 'Locked', 'Closed');
```

**Expected**: Mix of Open, Locked, and Closed periods

### Check Unassigned Transactions
```sql
SELECT COUNT(*) as unassigned_count
FROM transactions
WHERE comp_id = 1 AND fiscal_year IS NULL;
```

**Expected**: Should return 0 (all transactions should have fiscal_year)

---

## Performance Testing

### Load Test Queries

Test with large transaction volumes:

```sql
-- Time query for 10,000 transactions
SELECT coa.account_code, SUM(t.base_debit_amount) as debit_total
FROM chart_of_accounts coa
LEFT JOIN transactions t ON coa.id = t.account_id
WHERE coa.comp_id = 1
  AND t.fiscal_year <= '2025'
  AND t.status = 'Posted'
GROUP BY coa.id
LIMIT 200;
```

**Expected Response**: < 500ms

### Index Verification
```sql
SHOW INDEX FROM fiscal_periods;
SHOW INDEX FROM transactions;
```

**Expected Indexes**:
- `fiscal_periods`: (comp_id, fiscal_year), (comp_id, status)
- `transactions`: (fiscal_year), plus existing indexes

---

## Debugging Commands

### Check FiscalYearHelper in Action

Create a test route temporarily:

```php
Route::get('/debug/fiscal-year/{date}/{comp_id}', function($date, $comp_id) {
    $fy = \App\Helpers\FiscalYearHelper::getFiscalYear($date, $comp_id);
    $period = \App\Helpers\FiscalYearHelper::getFiscalPeriod($date, $comp_id);
    
    return [
        'date' => $date,
        'company_id' => $comp_id,
        'fiscal_year' => $fy,
        'period' => $period ? [
            'id' => $period->id,
            'period_name' => $period->period_name,
            'status' => $period->status,
        ] : null,
    ];
});
```

Access: `http://localhost:8000/debug/fiscal-year/2026-03-15/1`

Expected response:
```json
{
    "date": "2026-03-15",
    "company_id": 1,
    "fiscal_year": "2025",
    "period": {
        "id": 3,
        "period_name": "March 2025",
        "status": "Open"
    }
}
```

---

## Troubleshooting Flowchart

```
Issue: No fiscal years showing
    ↓
Check: company.fiscal_year_start set? 
    → No: Set to "01-01" or company's actual start
    → Yes: Continue
    ↓
Check: FiscalYearConfigurationController runs getCurrentFiscalYear()?
    → No: Code missing auto-creation logic
    → Yes: Check database fiscal_periods table
    ↓
Check: fiscal_periods table has records?
    → No: Run migrations again
    → Yes: Issue elsewhere

Issue: fiscal_year column is NULL
    ↓
Check: Transaction created after migration?
    → No: Old transactions need UPDATE statement
    → Yes: Continue
    ↓
Check: JournalVoucherController calls FiscalYearHelper::getFiscalYear()?
    → No: Add FiscalYearHelper import and call
    → Yes: Check filesystem that file was saved
    ↓
Check: Code is syntactically correct?
    → No: Fix PHP syntax errors
    → Yes: Transaction should have fiscal_year
```

---

## Integration Checklist

- [ ] FiscalYearHelper handles fiscal year start offset correctly
- [ ] JournalVoucherController prevents posting to locked periods
- [ ] Balance sheet filters by fiscal_year ≤ report date fiscal year
- [ ] Income statement filters by fiscal year range
- [ ] Header component displays fiscal year badge
- [ ] All route permissions use CheckUserPermissions trait
- [ ] Database tables indexed for fiscal_year queries
- [ ] Error messages are user-friendly
- [ ] Comparative reporting works across fiscal years
- [ ] Period closing workflow prevents unposted transactions

---

## Success Criteria

✅ **All Tests Pass**: Fiscal year system is production-ready
✅ **Performance**: Queries return in < 1 second for 100k transactions
✅ **Data Integrity**: No NULL fiscal_year values in transactions
✅ **User Experience**: Error messages clear and actionable
✅ **Audit Trail**: All fiscal year changes logged

---

**Test Status**: Ready for QA
**Last Updated**: $(date)
**Next Steps**: User Acceptance Testing (UAT)
