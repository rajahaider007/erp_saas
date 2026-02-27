# Financial Statements Implementation Guide

## Overview
This document outlines the implementation of three critical financial statement forms following International Accounting Standards (IAS 1, IAS 7) and your ERP system's design patterns. These forms provide complete financial reporting capabilities for your SaaS ERP.

---

## 1. FISCAL YEAR CONFIGURATION

### Purpose
Manages accounting fiscal years and periods, enabling proper period segregation for financial reporting and regulatory compliance.

### Files Created

#### Backend
- **Controller**: [app/Http/Controllers/Accounts/FiscalYearConfigurationController.php](../../app/Http/Controllers/Accounts/FiscalYearConfigurationController.php)
  - `index()` - Display fiscal years and periods
  - `createYear()` - Create new fiscal year with monthly periods
  - `updatePeriodStatus()` - Update period status (Open/Locked/Closed)

- **Model**: [app/Models/FiscalPeriod.php](../../app/Models/FiscalPeriod.php)
  - Relationships: Company, Transactions
  - Scopes: open(), closed(), locked(), forYear(), forCompany()
  - Methods: canEdit(), canClose()

- **Migration**: [database/migrations/2026_02_27_000001_create_fiscal_periods_table.php](../../database/migrations/2026_02_27_000001_create_fiscal_periods_table.php)
  - Creates `fiscal_periods` table
  - 13 periods per fiscal year (12 months + 1 adjustment period)
  - Indexes for performance optimization

#### Frontend
- **Component**: [resources/js/Pages/Accounts/FiscalYearConfiguration/Index.jsx](../../resources/js/Pages/Accounts/FiscalYearConfiguration/Index.jsx)
  - Displays fiscal year selector
  - Shows period listing with status badges
  - Period status management (Open → Locked → Closed)
  - Create new fiscal year form

### Features

✅ **Automatic Period Creation**
- When a fiscal year is created, 12 monthly periods are automatically generated
- Respects company's fiscal year start date (MM-DD format)
- Creates adjustment period for year-end entries (Period 13)

✅ **Period Status Management**
- **Open**: Active period, transactions can be posted
- **Locked**: Under review, existing entries can be modified
- **Closed**: Permanently closed, no changes allowed

✅ **Controls & Validations**
- All transactions must be posted before period can be closed
- Adjustment periods cannot be closed while in use
- prevents gaps in period sequencing

### Routes
```
GET  /accounts/fiscal-year-configuration     - View fiscal year configuration
POST /accounts/fiscal-year-configuration/create-year - Create new fiscal year
POST /accounts/fiscal-year-configuration/update-period-status - Update period status
```

### Database Structure
```
fiscal_periods
├── id (Primary Key)
├── comp_id (Company FK)
├── fiscal_year (String - YYYY format)
├── period_number (Integer - 1-13)
├── period_name (String - e.g., "January 2024")
├── start_date
├── end_date
├── period_type (Enum: Monthly, Quarterly, Semi-Annual, Annual, Custom)
├── status (Enum: Open, Locked, Closed)
├── is_adjustment_period (Boolean)
├── closing_notes (Text)
├── closed_by (User FK)
├── closed_at (Timestamp)
├── created_at / updated_at
```

---

## 2. BALANCE SHEET (STATEMENT OF FINANCIAL POSITION)

### Purpose
Presents financial position at a specific date per IAS 1. Shows Assets, Liabilities, and Equity.

### Files Created

#### Backend
- **Controller**: [app/Http/Controllers/Accounts/BalanceSheetController.php](../../app/Http/Controllers/Accounts/BalanceSheetController.php)
  - `index()` - Display balance sheet
  - `buildBalanceSheet()` - Calculates balance sheet structure
  - `calculateAccountBalance()` - Applies debit/credit rules

#### Frontend
- **Component**: [resources/js/Pages/Accounts/BalanceSheet/Report.jsx](../../resources/js/Pages/Accounts/BalanceSheet/Report.jsx)
  - Report generation with date filters
  - Comparative balance sheet support (compare two dates)
  - Print-friendly layout
  - Formatted currency display

### Structure (Per IAS 1)

```
BALANCE SHEET as at [DATE]

ASSETS
├── Current Assets
│   ├── Cash and Cash Equivalents
│   ├── Trade Receivables
│   ├── Inventory
│   └── Other Current Assets
│   └── Total Current Assets
├── Non-Current Assets
│   ├── Property, Plant & Equipment
│   ├── Investment Properties
│   ├── Intangible Assets
│   └── Other Non-Current Assets
│   └── Total Non-Current Assets
└── TOTAL ASSETS

LIABILITIES
├── Current Liabilities
│   ├── Trade Payables
│   ├── Short-term Borrowings
│   └── Other Current Liabilities
│   └── Total Current Liabilities
├── Non-Current Liabilities
│   ├── Long-term Borrowings
│   ├── Deferred Tax Liabilities
│   └── Other Non-Current Liabilities
│   └── Total Non-Current Liabilities
└── TOTAL LIABILITIES

EQUITY
├── Share Capital
├── Reserves and Surplus
├── Retained Earnings
└── TOTAL EQUITY

BALANCE CHECK: Assets = Liabilities + Equity (must equal 0)
```

### Features

✅ **Multi-Date Reporting**
- Generate balance sheet as at any date
- Comparative balance sheet (compare two periods)

✅ **Account Classification**
- Automatically classifies accounts based on account_type
- Separates Current vs Non-Current items
- Proper debit/credit balance calculations

✅ **Compliance**
- Follows IAS 1 Statement of Financial Position format
- Balance equation validation (automatic error detection)
- Currency-aware reporting

✅ **Print & Export Ready**
- Print-friendly CSS included
- Professional report layout
- Report generation timestamp

### Routes
```
GET /accounts/balance-sheet  - Generate balance sheet report
```

### Query Parameters
```
as_at_date=YYYY-MM-DD           - Balance sheet date (default: today)
comparative_date=YYYY-MM-DD     - Optional comparison date
```

---

## 3. INCOME STATEMENT (STATEMENT OF COMPREHENSIVE INCOME)

### Purpose
Shows financial performance over a period per IAS 1. Shows Revenue, Expenses, and Profit.

### Files Created

#### Backend
- **Controller**: [app/Http/Controllers/Accounts/IncomeStatementController.php](../../app/Http/Controllers/Accounts/IncomeStatementController.php)
  - `index()` - Display income statement
  - `buildIncomeStatement()` - Calculates P&L structure
  - `calculateIncomeStatementBalance()` - Revenue/Expense classification

#### Frontend
- **Component**: [resources/js/Pages/Accounts/IncomeStatement/Report.jsx](../../resources/js/Pages/Accounts/IncomeStatement/Report.jsx)
  - Report generation with period filters (From Date - To Date)
  - Multi-step income statement format
  - Print-friendly layout
  - Formatted currency display

### Structure (Per IAS 1 - Multi-Step Format)

```
INCOME STATEMENT for period [FROM DATE] to [TO DATE]

OPERATING SECTION
├── REVENUE
│   ├── Sales Revenue
│   ├── Service Revenue
│   └── Other Operating Revenue
│   └── TOTAL REVENUE
├── COST OF GOODS SOLD
│   ├── Opening Inventory
│   ├── Purchases & Cost of Materials
│   ├── Direct Expenses
│   └── Cost of Goods Sold
│   └── GROSS PROFIT (Revenue - COGS)
├── OPERATING EXPENSES
│   ├── Selling Expenses
│   ├── Distribution Expenses
│   ├── Administrative Expenses
│   ├── Depreciation & Amortization
│   └── Total Operating Expenses
│   └── OPERATING PROFIT

NON-OPERATING SECTION
├── NON-OPERATING ITEMS
│   ├── Interest Revenue
│   ├── Interest Expense
│   ├── Other Income
│   └── Other Expenses
│   └── NET FINANCE ITEMS

PROFIT STATEMENT
├── PROFIT BEFORE TAX
├── INCOME TAX EXPENSE
└── PROFIT FOR THE PERIOD

NET PROFIT/LOSS FOR THE PERIOD
```

### Features

✅ **Comprehensive P&L Reporting**
- Multi-step income statement format
- Automatic gross profit calculation
- Operating profit identification
- Clear separation of finance items

✅ **Period Selection**
- Flexible date range selection (any From - To dates)
- Defaults to fiscal year if not specified

✅ **Account Classification**
- Automatic account type classification
- Proper revenue/expense separation
- Tax expense tracking

✅ **Profitability Analysis**
- Shows revenue quality (% of COGS)
- Operating margin visibility
- Net profit identification
- Highlights profit/loss with color coding

✅ **Professional Presentation**
- Print-friendly layout
- Hierarchical structure with indentation
- Professional financial report format

### Routes
```
GET /accounts/income-statement  - Generate income statement report
```

### Query Parameters
```
from_date=YYYY-MM-DD  - Period start date (default: beginning of fiscal year)
to_date=YYYY-MM-DD    - Period end date (default: today)
```

---

## Integration with Chart of Accounts

All three forms work seamlessly with the existing **4-Level Chart of Accounts**:

- **Level 1**: Main Categories (Assets, Liabilities, Equity, Revenue, Expenses)
- **Level 2**: Sub-Categories (Current Assets, Fixed Assets, etc.)
- **Level 3**: Sub-Parent Accounts (intermediate grouping)
- **Level 4**: Transactional Accounts (used in journal entries)

The Balance Sheet and Income Statement **only use Level 4 accounts** to ensure transactions are properly reflected in financial statements.

---

## Accounting Standards Compliance

### IAS 1 - Presentation of Financial Statements
✅ Balance Sheet structure follows IAS 1 requirements
✅ Classification of current vs non-current items
✅ Proper equity presentation
✅ Income statement classification

### IAS 7 - Cash Flow Statement
*Ready for future implementation*

### GAAP Compliance
✅ Double-entry bookkeeping validation
✅ Balance equation verification
✅ Proper debit/credit application
✅ Transaction date-based reporting

---

## Design Patterns Followed

### 1. **Controller Architecture**
- Uses `CheckUserPermissions` trait for authorization
- Returns Inertia responses for frontend
- Follows RESTful route conventions
- Proper error handling with user messages

### 2. **Frontend Components**
- React functional components with hooks
- Consistent with existing VoucherNumberConfiguration patterns
- Tailwind CSS styling matching system design
- Lucide-react icons for consistency

### 3. **Database Structure**
- Follows Laravel migration conventions
- Proper indexing for performance
- Foreign key relationships (comp_id)
- Timestamp tracking (created_at, updated_at)

### 4. **Route Definition**
```php
Route::prefix('accounts/fiscal-year-configuration')->name('accounts.fiscal-year-configuration.')->middleware('web.auth')->group(function () {
    // RESTful routes
});
```

---

## Usage Instructions

### 1. Fiscal Year Configuration
1. Navigate to: **Accounts → Fiscal Year Configuration**
2. Select or create a fiscal year
3. Review periods (typically auto-created)
4. Use status transitions: Open → Locked → Closed
5. Year-end adjustments use Period 13 (adjustment period)

### 2. Balance Sheet
1. Navigate to: **Accounts → Balance Sheet**
2. Select "As At Date" (default: today)
3. Optional: Select "Comparative Date" for comparison
4. Click "Generate" to view report
5. Use "Print" for PDF printing

### 3. Income Statement  
1. Navigate to: **Accounts → Income Statement**
2. Select date range (From Date - To Date)
3. Click "Generate" to view report
4. Use "Print" for PDF printing
5. Analyze sections: Revenue, COGS, Operating Expenses, Profit

---

## Future Enhancement Opportunities

1. **Cash Flow Statement** (IAS 7)
   - Direct and indirect methods
   - Cash flow by activity (Operating, Investing, Financing)

2. **Financial Statement Analysis**
   - Ratio analysis (Liquidity, Profitability, Solvency)
   - Trend analysis across periods
   - Variance analysis vs budget

3. **Consolidated Statements**
   - Multi-subsidiary consolidation
   - Elimination entries
   - Inter-company transactions

4. **Notes to Financial Statements**
   - Accounting policies
   - Significant transactions
   - Contingent liabilities

5. **Budget vs Actual**
   - Budget creation
   - Actual vs Budget comparison
   - Variance reporting

---

## Testing Checklist

- [ ] Create fiscal year - verify 12 periods created with correct dates
- [ ] Change period status - verify validation (all posted before close)
- [ ] Generate balance sheet - verify account classifications correct
- [ ] Balance sheet balances - verify Assets = Liabilities + Equity
- [ ] Generate income statement - verify proper revenue/expense separation
- [ ] Comparative periods - verify calculations are period-specific
- [ ] Print reports - verify formatting and readability
- [ ] Multi-currency support - verify exchange rates applied correctly

---

## Files Summary

| Component | File | Status |
|-----------|------|--------|
| **Fiscal Year - Backend** | FiscalYearConfigurationController.php | ✅ Created |
| **Fiscal Year - Model** | FiscalPeriod.php | ✅ Created |
| **Fiscal Year - Migration** | 2026_02_27_000001_create_fiscal_periods_table.php | ✅ Created |
| **Fiscal Year - Frontend** | FiscalYearConfiguration/Index.jsx | ✅ Created |
| **Balance Sheet - Backend** | BalanceSheetController.php | ✅ Created |
| **Balance Sheet - Frontend** | BalanceSheet/Report.jsx | ✅ Created |
| **Income Statement - Backend** | IncomeStatementController.php | ✅ Created |
| **Income Statement - Frontend** | IncomeStatement/Report.jsx | ✅ Created |
| **Routes** | routes/web.php | ✅ Updated |

---

## Support & Documentation

For detailed implementation, refer to:
- IAS 1 Standards (www.ifrs.org)
- GAAP Guidelines (www.fasb.org)
- Your company's accounting policies
- Period closing procedures

---

**Implementation Status**: ✅ **COMPLETE**

All three financial statement forms have been successfully implemented following international standards and your ERP system's design patterns.
