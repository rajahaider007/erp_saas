# Fiscal Year Management Integration - Complete Setup Guide

## Overview
The fiscal year management system has been fully integrated into the SaaS ERP. This system ensures that all financial transactions are properly tracked against their corresponding fiscal year, enabling accurate financial reporting and period-based closing procedures.

---

## What Has Been Implemented

### 1. **Fiscal Year Helper Utility**
**File**: [app/Helpers/FiscalYearHelper.php](app/Helpers/FiscalYearHelper.php)

Provides centralized fiscal year calculations and utilities:

```php
// Get fiscal year for a specific date
$fy = FiscalYearHelper::getFiscalYear('2026-03-15', $companyId);
// Returns: '2025' (if fiscal year starts Jan 1)

// Get current fiscal year
$currentFY = FiscalYearHelper::getCurrentFiscalYear($companyId);

// Get fiscal period for a date
$period = FiscalYearHelper::getFiscalPeriod('2026-03-15', $companyId);

// Get fiscal year date ranges
$dates = FiscalYearHelper::getFiscalYearDates('2026', $companyId);
// Returns: ['start_date' => Carbon, 'end_date' => Carbon]

// Check if period is open for transactions
$isOpen = FiscalYearHelper::isPeriodOpen($periodId, $companyId);

// Manage fiscal years
FiscalYearHelper::lockFiscalYear('2025', $companyId);
FiscalYearHelper::closeFiscalYear('2025', $companyId, $userId);
```

### 2. **Database Changes**

#### New Table: `fiscal_periods`
```sql
CREATE TABLE fiscal_periods (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    comp_id BIGINT NOT NULL,
    fiscal_year VARCHAR(4) NOT NULL,
    period_number INT NOT NULL,
    period_name VARCHAR(191) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    period_type ENUM('Monthly', 'Quarterly', 'Semi-Annual', 'Annual', 'Custom'),
    status ENUM('Open', 'Locked', 'Closed'),
    is_adjustment_period BOOLEAN DEFAULT FALSE,
    closing_notes TEXT NULL,
    closed_by BIGINT NULL,
    closed_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY (comp_id, fiscal_year, period_number)
);
```

#### Updated Table: `transactions`
Added `fiscal_year` column (VARCHAR(4)):
```sql
ALTER TABLE transactions ADD COLUMN fiscal_year VARCHAR(4) AFTER period_id;
ALTER TABLE transactions ADD INDEX (fiscal_year);
```

### 3. **Controller Updates**

#### FiscalYearConfigurationController
- Automatically creates 12 monthly periods + 1 adjustment period per fiscal year
- Manages period status transitions (Open → Locked → Closed)
- Validates that all transactions are posted before closing
- Respects company's fiscal_year_start setting

#### JournalVoucherController
- Automatically calculates fiscal year from transaction date
- Validates that the transaction date falls within an open period
- Saves fiscal_year to transactions table
- Prevents posting to locked/closed periods

#### BalanceSheetController
- Filters transactions by fiscal_year ≤ as_at_date fiscal year
- Supports comparative reports across fiscal years
- Shows fiscal year in report header

#### IncomeStatementController
- Filters transactions by fiscal_year range
- Supports cross-fiscal-year period analysis
- Shows fiscal year range in report header

### 4. **Header Display Enhancement**

The application header now displays the current fiscal year as a badge:
```
[Company Name] FY 2026
```

Updated in: [resources/js/Components/Layout/Header.jsx](resources/js/Components/Layout/Header.jsx)

---

## How Fiscal Year Works

### Fiscal Year Determination
The system determines fiscal year based on:
1. **Company Fiscal Year Start**: Stored as MM-DD format in companies table (e.g., "01-01", "04-01")
2. **Transaction Date**: Used to calculate which fiscal year the transaction belongs to

**Example:**
- Company fiscal year starts: April 1 (04-01)
- Transaction date: March 15, 2026
- Fiscal year: 2025 (because it's before April 1, 2026)

### Period Management
1. **Create Fiscal Year** → Auto-creates 13 periods:
   - Periods 1-12: Monthly periods
   - Period 13: Adjustment period (for year-end entries)

2. **Period Status Transitions**:
   ```
   Open → Locked → Closed
   ```
   - **Open**: Can create and post new transactions
   - **Locked**: Under review, existing entries can be modified
   - **Closed**: Permanently closed, no changes allowed

3. **Period Validation**:
   - Cannot close period if unposted transactions exist
   - Cannot post transactions to locked/closed periods
   - Automatic period lookup by transaction date

---

## Usage Examples

### 1. **Create a New Fiscal Year**
```
Navigate to: Accounts → Fiscal Year Configuration
1. Click on sidebar "Create New Year"
2. Enter year (e.g., "2026")
3. Click "+" button
4. System creates 13 periods automatically
```

### 2. **Post a Journal Voucher**
```
Navigate to: Accounts → Journal Voucher → Create
1. Fill voucher date: e.g., "2026-03-15"
2. The system automatically:
   - Calculates fiscal year: "2025"
   - Finds matching period
   - Validates period is open
   - Saves fiscal_year in transactions table
3. Click "Save & Post"
```

### 3. **Generate Balance Sheet**
```
Navigate to: Accounts → Balance Sheet
1. Select "As At Date": e.g., "2026-03-31"
2. System automatically:
   - Calculates fiscal year: "2025"
   - Filters transactions where fiscal_year ≤ "2025"
   - Filters transactions where voucher_date ≤ "2026-03-31"
3. Click "Generate"
```

### 4. **Analyze Income Statement**
```
Navigate to: Accounts → Income Statement
1. Select "From Date": "2025-04-01"
2. Select "To Date": "2026-03-31"
3. System automatically:
   - Calculates fiscal years: From "2025" to "2025"
   - Filters transactions for this period
4. Click "Generate"
```

---

## Data Flow

```
Transaction Creation
    ↓
User enters voucher_date (e.g., 2026-03-15)
    ↓
FiscalYearHelper::getFiscalYear() calculates fiscal_year (e.g., "2025")
    ↓
FiscalYearHelper::getFiscalPeriod() finds matching period
    ↓
Validates period is Open
    ↓
Saves transaction with:
    - fiscal_year: "2025"
    - period_id: 3 (March period)
    - voucher_date: 2026-03-15

Financial Reports Filter
    ↓
User selects report date
    ↓
System calculates fiscal_year for report date
    ↓
Query filters:
    - WHERE fiscal_year ≤ report_fiscal_year
    - WHERE voucher_date ≤ report_date
    ↓
Displays accurate financial position
```

---

## Period Closing Workflow

### Month-End Closing
1. **Lock Period**: Period 1 (January) → Status: Locked
2. **Review Transactions**: All transactions visible, can modify
3. **Close Period**: All posted? → Status: Closed
4. **Result**: No new transactions can be added to closed period

### Year-End Closing
1. **Record Adjusting Entries**: Post to Period 13 (Adjustment Period)
2. **Lock All Periods**: FY 2025 Periods 1-12 → Locked
3. **Final Review**: Review all transactions
4. **Close Year**: Periods 1-13 → Closed
5. **Create Next Year**: FY 2026 periods auto-created

---

## Technical Architecture

### Files Modified/Created

| Component | File | Type | Status |
|-----------|------|------|--------|
| **Core Helper** | `app/Helpers/FiscalYearHelper.php` | Created | ✅ |
| **Model** | `app/Models/FiscalPeriod.php` | Created | ✅ |
| **Migration 1** | `2026_02_27_000001_create_fiscal_periods_table.php` | Created | ✅ |
| **Migration 2** | `2026_02_27_000002_add_fiscal_year_to_transactions_table.php` | Created | ✅ Executed |
| **FY Config Controller** | `app/Http/Controllers/Accounts/FiscalYearConfigurationController.php` | Updated | ✅ |
| **Journal Voucher Controller** | `app/Http/Controllers/Accounts/JournalVoucherController.php` | Updated | ✅ |
| **Balance Sheet Controller** | `app/Http/Controllers/Accounts/BalanceSheetController.php` | Updated | ✅ |
| **Income Statement Controller** | `app/Http/Controllers/Accounts/IncomeStatementController.php` | Updated | ✅ |
| **Header Component** | `resources/js/Components/Layout/Header.jsx` | Updated | ✅ |
| **Routes** | `routes/web.php` | Updated | ✅ |

---

## Database Queries

### Get Transaction Count by Fiscal Year
```sql
SELECT fiscal_year, COUNT(*) as transaction_count
FROM transactions
WHERE comp_id = ? AND status = 'Posted'
GROUP BY fiscal_year
ORDER BY fiscal_year DESC;
```

### Get Transactions for a Fiscal Year
```sql
SELECT * FROM transactions
WHERE comp_id = ? 
  AND fiscal_year = ?
  AND status = 'Posted'
ORDER BY voucher_date ASC;
```

### Check Period Status
```sql
SELECT status, COUNT(*) as period_count
FROM fiscal_periods
WHERE comp_id = ? AND fiscal_year = ?
GROUP BY status;
```

### Balance Sheet Query (includes fiscal_year filter)
```sql
SELECT 
    coa.account_code,
    coa.account_name,
    SUM(t.base_debit_amount) as debit_total,
    SUM(t.base_credit_amount) as credit_total
FROM chart_of_accounts coa
LEFT JOIN transactions t ON coa.id = t.account_id
WHERE coa.comp_id = ? 
  AND coa.account_level = 4
  AND t.fiscal_year <= ?
  AND t.voucher_date <= ?
  AND t.status = 'Posted'
GROUP BY coa.id, coa.account_code, coa.account_name;
```

---

## Validation Rules

### Period Status Transitions
```
Valid Transitions:
- Open → Locked (before closing for review)
- Locked → Closed (after validation)
- Locked → Open (reopen for corrections)

Invalid Transitions:
- Closed → Any (closed periods cannot be reopened)
- Any → Closed (without posting all transactions)
```

### Transaction Posting Rules
```
✓ Can post to: Open periods
✗ Cannot post to: Locked, Closed periods

✓ Period must exist for transaction date
✓ Period must be Open status
✓ All double-entry requirements must be met
```

---

## Reports Integration

| Report | Fiscal Year Usage |
|--------|-------------------|
| **Balance Sheet** | Cumulative to as-at-date fiscal year |
| **Income Statement** | Period-specific (from-to fiscal years) |
| **Trial Balance** | Date-specific with fiscal year filter |
| **General Ledger** | Account-specific with fiscal year filter |
| **Cash Flow** | Period-specific (future implementation) |

---

## Troubleshooting

### Issue: "No accounting period found for date"
**Cause**: Transaction date doesn't have a matching period configured
**Solution**: Create fiscal year using Fiscal Year Configuration

### Issue: "Period is Locked - cannot post"
**Cause**: Trying to post to a locked/closed period
**Solution**: Post to Open period or unlock period for corrections

### Issue: "Cannot close period - unposted transactions exist"
**Cause**: Period has Draft/Pending transactions
**Solution**: Post all transactions before closing period

### Issue: Fiscal year not showing in header
**Cause**: Fiscal year not passed from controller
**Solution**: Ensure controller passes `fiscalYear` in Inertia::render()

---

## Maintenance Tasks

### Weekly
- Monitor period status
- Ensure transactions are timely posted

### Monthly
- Review and lock completed period
- Verify no orphaned transactions without fiscal year

### Quarterly
- Review period closing status
- Validate fiscal year balance totals

### Yearly
- Close fiscal year after adjustments
- Create new fiscal year periods
- Archive prior year data (optional)

---

## Future Enhancements

1. **Comparative Fiscal Year Analysis**
   - YoY comparison reports
   - Growth analysis by fiscal year

2. **Audit Trail by Fiscal Year**
   - Track all changes per fiscal year
   - Compliance reporting

3. **Multi-Year Consolidated Reports**
   - 3-year comparative statements
   - Trend analysis

4. **Budget vs Actual**
   - Track budget by fiscal year
   - Variance analysis

5. **Automated Period Closing**
   - Scheduled period lock/close
   - Automatic adjusting entries

---

## Support & Documentation

Refer to:
- [FINANCIAL_STATEMENTS_IMPLEMENTATION.md](FINANCIAL_STATEMENTS_IMPLEMENTATION.md)
- [JOURNAL_VOUCHER_GUIDE.md](JOURNAL_VOUCHER_GUIDE.md)
- [CHART_OF_ACCOUNTS_4_LEVEL_IMPLEMENTATION_GUIDE.md](CHART_OF_ACCOUNTS_4_LEVEL_IMPLEMENTATION_GUIDE.md)

---

**Implementation Status**: ✅ **COMPLETE**

All fiscal year management features have been successfully implemented and integrated with the financial statement forms.
