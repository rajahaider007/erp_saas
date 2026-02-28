# Required Configuration Forms - IFRS/IAS Compliance Roadmap

## Summary
The Chart of Account Code Configuration system is complete and operational. The system now provides three interfaces for managing Level 4 account codes:
1. ✅ Generalized Level 4 Code Configuration
2. ✅ Bank Account Configuration
3. ✅ Cash Account Configuration

To achieve FULL compliance with international accounting standards, the following additional configuration forms are RECOMMENDED:

---

## Priority 1: CRITICAL (Implement First)

### 1. Cost Center Configuration
**Standard Reference:** IFRS 8 - Operating Segments, IAS 1 - Segment Information

**Purpose:** Allocate expenses and assets to cost centers for departmental profitability analysis and IFRS 8 segment reporting.

**Required Fields:**
```
- Cost Center Code (unique, e.g., CC-001)
- Cost Center Name (e.g., "Sales Department")
- Department Head (responsible person)
- Budget Amount (for variance analysis)
- Allocation Method (Percentage, Fixed, Driver-based)
- Status (Active, Inactive, Archived)
```

**Database Table:**
```sql
CREATE TABLE cost_centers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  comp_id INT,
  location_id INT,
  cost_center_code VARCHAR(20) UNIQUE,
  cost_center_name VARCHAR(255),
  department_head_id INT,
  budget_amount DECIMAL(15,2),
  allocation_method ENUM('Percentage', 'Fixed', 'Driver'),
  status ENUM('Active', 'Inactive', 'Archived'),
  created_at TIMESTAMP,
  UNIQUE(cost_center_code, comp_id, location_id)
);

-- Link to Chart of Accounts for allocation
ALTER TABLE transaction_entries ADD COLUMN cost_center_id INT;
```

**Implementation Steps:**
1. Create CostCenterController with CRUD operations
2. Create CostCenter model with relationships to transaction_entries
3. Create React form for cost center creation/editing
4. Add menu item under Accounts → Configuration
5. Integrate with journal voucher form (allow selecting cost center during posting)
6. Add cost center report generation

**Integration Points:**
- Journal Voucher form: Add cost center dropdown
- Financial reports: Add cost center filtering
- Budget vs. Actual report: Compare budget to actuals by cost center

---

### 2. Department/Profit Center Configuration  
**Standard Reference:** IFRS 8 - Reportable Segments, IAS 1 - Segment Reporting

**Purpose:** Track revenue and expense by business unit/division for segment reporting compliance.

**Required Fields:**
```
- Profit Center Code (unique, e.g., PC-001)
- Profit Center Name (e.g., "Manufacturing", "Services")
- Profit Center Manager (responsible person)
- Start Date
- End Date (for closed divisions)
- Reporting Currency
- Status (Active, Inactive, Closed)
```

**Database Table:**
```sql
CREATE TABLE profit_centers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  comp_id INT,
  profit_center_code VARCHAR(20) UNIQUE,
  profit_center_name VARCHAR(255),
  manager_id INT,
  reporting_currency VARCHAR(3),
  start_date DATE,
  end_date DATE NULL,
  status ENUM('Active', 'Inactive', 'Closed'),
  created_at TIMESTAMP,
  UNIQUE(profit_center_code, comp_id)
);

-- Link to Chart of Accounts
ALTER TABLE transaction_entries ADD COLUMN profit_center_id INT;
```

**Implementation Steps:**
1. Create ProfitCenterController with CRUD operations
2. Create ProfitCenter model
3. Create React form for profit center setup
4. Integrate with journal voucher transactions
5. Build segment reporting dashboard
6. Add consolidation logic for group reporting

**IFRS 8 Compliance:**
- Report revenue, expenses, assets by reportable segment
- Identify geographically based segments
- Track inter-segment transactions separately
- Report segment assets and liabilities

---

## Priority 2: IMPORTANT (Implement Second)

### 3. Budget Configuration
**Standard Reference:** IAS 1 - Management Commentary, Best Practice Financial Management

**Purpose:** Set budgets for revenue, expenses, and capital expenditures. Compare actuals to budget for variance analysis.

**Required Fields:**
```
- Budget Period (Fiscal Year)
- Cost Center (link to cost center)
- Account Code (link to chart of accounts)
- Budget Type (Revenue, Expense, Capital)
- Q1 Amount, Q2 Amount, Q3 Amount, Q4 Amount
- Annual Total (calculated)
- Responsible Manager
- Status (Draft, Approved, Active, Closed)
```

**Database Table:**
```sql
CREATE TABLE budgets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  comp_id INT,
  location_id INT,
  fiscal_year INT,
  cost_center_id INT,
  account_id INT,
  budget_type ENUM('Revenue', 'Expense', 'Capital'),
  q1_amount DECIMAL(15,2),
  q2_amount DECIMAL(15,2),
  q3_amount DECIMAL(15,2),
  q4_amount DECIMAL(15,2),
  annual_total DECIMAL(15,2),
  responsible_manager_id INT,
  status ENUM('Draft', 'Approved', 'Active', 'Closed'),
  created_at TIMESTAMP,
  UNIQUE(fiscal_year, cost_center_id, account_id, comp_id)
);
```

**Implementation Steps:**
1. Create BudgetController with CRUD operations
2. Create Budget model with relationships
3. Create React form with quarterly breakdown
4. Build budget vs. actual comparison report
5. Add variance analysis (favorable/unfavorable)
6. Create budget approval workflow

**Integration Points:**
- Dashboard: Show budget vs. actual KPIs
- Financial reports: Add budget columns
- Cost center report: Compare to budget

---

### 4. Inter-company Configuration
**Standard Reference:** IAS 24 - Related Party Disclosures, IFRS 10 - Consolidated Financial Statements

**Purpose:** Track and consolidate inter-company transactions for group reporting.

**Required Fields:**
```
- Selling Company (Company A)
- Buying Company (Company B)
- Transaction Type (Service, Goods, Loan)
- Markup Percentage (for inventory transfers)
- Payment Terms
- Elimination Rules (automatic consolidation)
- Start Date / End Date
```

**Database Table:**
```sql
CREATE TABLE intercompany_relations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_comp_id INT,
  child_comp_id INT,
  relation_type ENUM('Subsidiary', 'Associated', 'Joint Venture'),
  revenue_account_id INT,
  elimination_account_id INT,
  consolidation_percentage INT,
  created_at TIMESTAMP
);

-- Track inter-company transactions
ALTER TABLE transactions ADD COLUMN intercompany_relation_id INT;
ALTER TABLE transactions ADD COLUMN eliminated_from_group BOOLEAN;
```

**Implementation Steps:**
1. Create IntercompanyRelation model
2. Create IntercompanyConfigurationController
3. Create React form for company relationships
4. Build consolidation elimination logic
5. Create consolidated financial statements
6. Add variance by entity report

**IFRS 10 Compliance:**
- Identify subsidiary relationships
- Eliminate inter-company transactions on consolidation
- Consolidate 100% owned subsidiaries
- Equity account for non-controlling interests

---

## Priority 3: RECOMMENDED (Implement Third)

### 5. Expense Recognition Pattern Configuration
**Standard Reference:** IFRS 15 - Revenue from Contracts with Customers, IAS 18 - Revenue Recognition

**Purpose:** Define how revenue/expenses are recognized over time (service contracts, subscriptions).

**Scenarios:**
- Monthly SaaS subscription revenue recognition
- Project-based revenue (milestone-based recognition)
- Service contracts (percentage of completion)
- Warranty obligations (provision over warranty period)

**Configuration:**
```
- Pattern Name (e.g., "Monthly Subscription")
- Recognition Method (Monthly, Milestone, POC, Performance)
- Trigger Events (Invoice, Delivery, Project Completion, Time-based)
- Linked Accounts (Revenue, Unearned Revenue, Deferred Revenue)
- Status (Active, Inactive)
```

**Implementation Steps:**
1. Create ExpenseRecognitionPattern model
2. Create pattern configuration form
3. Integrate with revenue posting automation
4. Build deferred revenue aging report
5. Create accrual reversal automation

---

## Priority 4: NICE-TO-HAVE (Implement Later)

### 6. Tax Configuration
**Standard Reference:** IAS 12 - Income Taxes, Local tax regulations

**Purpose:** Define tax rates, jurisdiction-specific rules, and tax code mappings.

**Configuration Items:**
```
- Tax Jurisdiction (Federal, State, Local)
- Tax Type (Income Tax, VAT/GST, Sales Tax, Payroll Tax)
- Tax Rate (percentage)
- Effective Date (when rate applied)
- Linked Chart of Accounts (tax payment, tax expense, tax receivable)
- Tax Calculation Method (Based on revenue, profit, transaction)
```

**Implementation Steps:**
1. Create TaxConfiguration model
2. Create tax configuration form
3. Update journal voucher posting logic to apply taxes
4. Build tax returns generation
5. Create tax planning reports

---

### 7. Fixed Asset Management Configuration
**Standard Reference:** IAS 16 - Property, Plant & Equipment, IAS 23 - Borrowing Costs

**Purpose:** Track and depreciate fixed assets for balance sheet presentation.

**Configuration Items:**
```
- Asset Category (Furniture, Vehicles, Equipment, Buildings)
- Depreciation Method (Straight-line, Declining balance, Units of production)
- Useful Life (in years)
- Salvage Value (residual value)
- Depreciation Expense Account (linked to Chart of Accounts)
- Accumulated Depreciation Account
```

**Implementation Steps:**
1. Create AssetCategory model
2. Create DepreciationMethod configuration
3. Create Asset register form
4. Build depreciation schedule calculator
5. Create monthly depreciation journal entry automation
6. Build fixed asset report

---

### 8. Inventory Valuation Configuration  
**Standard Reference:** IAS 2 - Inventories, IAS 23 - Borrowing Costs

**Purpose:** Define inventory valuation methods (FIFO, LIFO, Weighted Average, Specific Identification).

**Configuration Items:**
```
- Inventory Category (Raw Materials, Work in Process, Finished Goods)
- Valuation Method (FIFO, LIFO, Weighted Average, Specific ID)
- Standard Cost Variance Accounts
- Obsolescence Reserve Method
- Write-down Review Frequency
```

**Implementation Steps:**
1. Create InventoryValuationMethod model
2. Create valuation configuration form
3. Integrate with inventory posting
4. Build inventory aging report
5. Create obsolescence reserve automation

---

## Integration Architecture

### Configuration Dependency Tree
```
Chart of Account Codes (✅ COMPLETE)
  ├─ Cost Center Configuration (Priority 1)
  │   ├─ Budget Configuration (Priority 2)
  │   └─ Dashboard KPI Reports
  │
  ├─ Profit Center Configuration (Priority 1)
  │   ├─ IFRS 8 Segment Reporting
  │   └─ Consolidation Reports
  │
  ├─ Budget Configuration (Priority 2)
  │   └─ Variance Analysis
  │
  ├─ Inter-company Configuration (Priority 2)
  │   └─ Consolidation Sheets
  │
  ├─ Expense Recognition Patterns (Priority 3)
  │   └─ Revenue Automation
  │
  ├─ Tax Configuration (Priority 4)
  │   └─ Tax Returns
  │
  ├─ Fixed Asset Configuration (Priority 4)
  │   └─ Depreciation Scheduling
  │
  └─ Inventory Valuation (Priority 4)
      └─ Inventory Reports
```

### Database Relationship Map
```
chart_of_accounts
├── transaction_entries
│   ├── cost_center_id → cost_centers
│   ├── profit_center_id → profit_centers
│   └── budget related for variance
│
companies
├── budgets
├── cost_centers
├── profit_centers
└── intercompany_relations

fiscal_years
└── budgets (by period)
```

---

## Implementation Schedule Recommendation

### Month 1: Foundation
- [ ] Deploy Chart of Account Code Configuration (✅ DONE)
- [ ] Train users on new interfaces
- [ ] Create initial bank, cash, and Level 4 codes
- [ ] Verify all routes and permissions working

### Month 2: Segment Reporting (IAS 1 / IFRS 8)
- [ ] Implement Cost Center Configuration
- [ ] Implement Profit Center Configuration
- [ ] Build segment reporting dashboard
- [ ] Create segment analysis reports

### Month 3: Financial Planning (IAS 1 / Management Commentary)
- [ ] Implement Budget Configuration
- [ ] Build budget vs. actual report
- [ ] Create variance analysis dashboard
- [ ] Set up budget approval workflow

### Month 4: Group Consolidation (IFRS 10)
- [ ] Implement Inter-company Configuration
- [ ] Build consolidation logic
- [ ] Create consolidated financial statements
- [ ] Test elimination entries

### Month 5-6: Advanced Features
- [ ] Revenue Recognition Patterns (IFRS 15)
- [ ] Tax Configuration (IAS 12)
- [ ] Fixed Asset Management (IAS 16)
- [ ] Inventory Valuation (IAS 2)

---

## Standards Compliance Checklist

### IAS 1 - Presentation of Financial Statements
- [x] Proper asset/liability/equity classification
- [x] Account hierarchy for statement presentation
- [x] Fiscal year period management
- [ ] Managem Narrative Reports (segment reporting via profit centers)
- [ ] Budget vs. Actual commentary (via budgets)

### IFRS 8 - Operating Segments
- [ ] Segment identification (via profit centers)
- [ ] Segment revenue/profit reporting (via profit centers)
- [ ] Segment assets/liabilities (via profit centers)
- [ ] Inter-segment reconciliation (via inter-company)

### IAS 12 - Income Taxes
- [ ] Tax rate configuration by jurisdiction
- [ ] Current and deferred tax accounts
- [ ] Tax loss carryforward tracking
- [ ] Tax reconciliation reporting

### IAS 16 - Property, Plant & Equipment
- [ ] Asset categorization
- [ ] Depreciation schedule calculation
- [ ] Accumulated depreciation tracking
- [ ] Revaluation reserve management

### IAS 21 - Foreign Exchange
- [x] Multi-currency support (✅ in bank/cash config)
- [x] Exchange rate management
- [ ] Unrealized exchange gain/loss accounts
- [ ] Foreign subsidiary translation

### IAS 24 - Related Party Disclosures
- [ ] Inter-company relationships (via inter-company config)
- [ ] Related party transaction tracking
- [ ] Management compensation registers
- [ ] Related party disclosure reports

---

## Success Metrics

After implementing all recommended configurations:
- ✅ Full IAS 1 compliance for single entity
- ✅ IFRS 8 segment reporting capability
- ✅ IFRS 10 group consolidation capability
- ✅ Complete audit trail for all transactions
- ✅ Automated financial statement generation
- ✅ Budget vs. actual variance monitoring
- ✅ Tax compliance reporting
- ✅ Fixed asset depreciation automation
- ✅ Inventory valuation compliance
- ✅ Related party transaction tracking

---

## Quick Start - Next Actions

**Immediate (Today):**
1. ✅ Run seeder: `php artisan db:seed --class=AccountingConfigurationMenuSeeder`
2. ✅ Test generalized, bank, and cash configuration forms
3. ✅ Verify routes and permissions

**This Week:**
1. Create initial Level 4 codes for all accounts
2. Test journal voucher posting with various account types
3. Generate sample financial statements
4. Verify multi-currency posting

**Next Week:**
1. Plan Cost Center Configuration implementation
2. Identify cost centers in organization
3. Define cost allocation rules
4. Design budget structure

---

**Document Version:** 1.0  
**Created:** February 2026  
**Status:** Ready for Implementation  
**Compliance Target:** IFRS/IAS 2024 Edition
