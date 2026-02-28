# International Accounting Standards Configuration Guide

## Overview
This document outlines the required and recommended configurations for compliance with international accounting standards (IAS/IFRS) as implemented in the ERP system.

## IAS 1 - Presentation of Financial Statements

### 1. Chart of Account Hierarchy (REQUIRED)
**Level 1 (Class):** Fixed - Asset, Liability, Equity, Revenue, Expense  
**Level 2 (Group):** Predefined groups within each class  
**Level 3 (Sub-group):** User-defined for detailed classification  
**Level 4 (Account):** Most detailed transactional level  

Status: ✅ **IMPLEMENTED**  
Location: `/accounts/chart-of-accounts`

### 2. Account Type Classification (REQUIRED)
Accounts must be classified as:
- **Asset:** Economic resources with future benefit
- **Liability:** Obligations to transfer economic resources
- **Equity:** Residual interest in assets after liabilities
- **Revenue:** Increases in economic benefits
- **Expense:** Decreases in economic benefits
- **Contra-Asset:** Reduces asset value
- **Contra-Revenue:** Reduces revenue

Status: ✅ **IMPLEMENTED**  
Configuration: Available in Chart of Accounts and all code configuration forms

### 3. Fiscal Year and Period Management (REQUIRED)
- **Fiscal Year:** Must have defined start and end dates
- **Accounting Periods:** Must be configured for each fiscal year
- **Period Status:**
  - **Open:** Active for transaction posting
  - **Locked:** Under review, existing entries modifiable
  - **Closed:** Permanently locked, no changes allowed
  - **Adjustment:** Special period for year-end adjustments

Status: ✅ **IMPLEMENTED**  
Location: `/accounts/fiscal-year-configuration`

### 4. Currency Management (REQUIRED for Multinational/Multicurrency)
- Primary reporting currency
- Transaction currencies
- Exchange rate management
- Foreign exchange gain/loss accounts

Status: ✅ **IMPLEMENTED**  
Location: `/system/currencies`

---

## IFRS 8 - Segment Reporting (CONDITIONAL)

### Required If:
- Entity reports to stock exchange
- Has multiple reportable segments
- Operates in multiple geographic regions

### Configuration Items:
1. **Segment Definition**
   - Geographic segments
   - Business segments
   - Product lines

2. **Cost Allocation**
   - Department allocation
   - Cost center allocation
   - Profit center allocation

Status: ⚠️ **RECOMMENDED**  
Location: To be implemented - `Cost Center Configuration`

---

## IFRS 15 - Revenue Recognition (CONDITIONAL)

### Required If:
- Operates in multiple industries
- Has complex revenue arrangements
- Has performance obligations

### Configuration Items:
1. **Revenue Categories**
   - Operating revenue
   - Service revenue
   - Investment revenue
   - Extraordinary revenue

2. **Revenue Recognition Points**
   - Point of sale
   - Upon delivery
   - Upon completion
   - Upon payment

Status: ⚠️ **RECOMMENDED**  
Note: Revenue accounts configured in Chart of Accounts

---

## IAS 16 - Property, Plant & Equipment (CONDITIONAL)

### Required If:
- Entity holds significant fixed assets
- Has depreciation requirements
- Requires asset management tracking

### Configuration Items:
1. **Asset Categories**
2. **Depreciation Methods**
3. **Useful Life Classification**
4. **Salvage Value Tracking**

Status: ⚠️ **RECOMMENDED**  
Location: To be implemented - `Fixed Asset Configuration`

---

## IAS 21 - Foreign Exchange (REQUIRED for Multicurrency)

### Configuration Items:
1. **Transaction Recording:**
   - At transaction date exchange rate
   
2. **Translation Methods:**
   - Temporal method
   - Current rate method
   
3. **Exchange Difference Accounts:**
   - Realized gains/losses
   - Unrealized gains/losses

Status: ✅ **IMPLEMENTED**  
Location: Exchange Rate Configuration (integrated with transaction posting)

---

## IAS 37 - Provisions, Contingent Liabilities (REQUIRED)

### Configuration Items:
1. **Provision Categories**
2. **Contingency Tracking**
3. **Estimation Methods**
4. **Disclosure Requirements**

Status: ⚠️ **RECOMMENDED**  
Note: Can be configured through Expense accounts

---

## Complete Configuration Checklist

### Phase 1: Essential (MUST HAVE)
- [x] Chart of Account Hierarchy (Levels 1-4)
- [x] Account Type Classification
- [x] Fiscal Year Configuration
- [x] Accounting Periods
- [x] Currency Setup
- [x] Level 4 Account Code Generation
- [x] Bank Account Codes
- [x] Cash Account Codes

### Phase 2: Recommended (SHOULD HAVE)
- [ ] Cost Center Configuration
- [ ] Department Allocation
- [ ] Budget Configuration
- [ ] Inter-company Transaction Setup
- [ ] Consolidation Parameters

### Phase 3: Optional (NICE TO HAVE)
- [ ] Segment Reporting Configuration
- [ ] Fixed Asset Management
- [ ] Inventory Valuation Methods
- [ ] Provision Tracking

---

## Bank Account Configuration

### Purpose
Create individual bank account codes under the main "Bank Accounts" Level 3 account.

### Fields
- **Bank Name:** Full name of the bank and account type
- **Account Code:** Unique identifier for the account
- **Account Number:** Bank-provided account number
- **Branch:** Bank branch information
- **Currency:** Currency of the account
- **Transactional:** Whether the account can accept direct postings

### Best Practices
1. Use consistent naming convention: `BANK_CODE - Account Type`
2. Include branch information for multi-branch banks
3. Set currency to match the account's actual currency
4. Make all bank accounts transactional (✓)

---

## Cash Account Configuration

### Purpose
Create individual cash account codes under the main "Cash" Level 3 account.

### Fields
- **Cash Location:** Description of the cash location/box
- **Account Code:** Unique identifier for the cash location
- **Custodian:** Person responsible for the cash
- **Currency:** Currency held in that location
- **Transactional:** Whether the location can directly receive cash

### Best Practices
1. Use descriptive names: `Office Cash Box - [Location]`
2. Assign single custodian per location for accountability
3. Maintain separate codes for different currencies
4. Make all cash accounts transactional (✓)

---

## Generalized Level 4 Code Configuration

### Purpose
Create any Level 4 account code under any Level 3 account to establish the complete chart of account structure.

### When to Use
- Creating sub-accounts under revenue, expense, asset, or liability heads
- Establishing accounts for specific cost centers
- Creating project-specific accounts
- Establishing accounts for different tax jurisdictions

### Configuration Steps
1. Navigate to Chart of Account Codes Configuration
2. Select a Level 3 account
3. Click "Add Level 4 Code"
4. Fill in:
   - Account Code (unique identifier)
   - Account Name
   - Account Type (must match parent)
   - Transactional (can it receive journal entries?)
5. Submit to create

---

## Compliance Checks

### Quarterly Review
- [ ] Verify all active accounts are in use
- [ ] Review and reconcile all account balances
- [ ] Confirm period status transitions are correct
- [ ] Check for any inactive accounts that need reactivation

### Annual Review
- [ ] Audit full chart of accounts structure
- [ ] Verify compliance with current standards
- [ ] Update account categories if needed
- [ ] Archive unused accounts
- [ ] Plan for next fiscal year periods

### Reporting
- [ ] Trial balance generation
- [ ] Balance sheet reconciliation
- [ ] Income statement reconciliation
- [ ] General ledger validations

---

## Technical Implementation Details

### Database Structure
```
chart_of_accounts
├── account_level (1-4)
├── account_code (unique per company/location)
├── account_name
├── account_type (Asset, Liability, etc.)
├── parent_account_id (NULL for Level 1)
├── is_transactional (boolean)
├── comp_id (company)
└── location_id (location)

transactions
├── voucher_date
├── fiscal_year
├── period_id
├── status (Draft, Posted, Approved)
└── ...

transaction_entries
├── account_id (references chart_of_accounts)
├── debit_amount
├── credit_amount
├── base_debit_amount
└── base_credit_amount
```

### API Endpoints
```
GET  /api/code-configuration/level3-accounts
GET  /api/code-configuration/level4-codes/{level3AccountId}
POST /accounts/code-configuration
PUT  /accounts/code-configuration/{id}
DELETE /accounts/code-configuration/{id}
POST /accounts/code-configuration/bank
POST /accounts/code-configuration/cash
```

---

## Troubleshooting

### Issue: Cannot create Level 4 account
**Possible Causes:**
- Level 3 account not found
- Account code already exists for this company
- Missing company/location information

**Solution:**
1. Verify Level 3 account exists in Chart of Accounts
2. Check account code uniqueness
3. Confirm user has proper company/location assigned

### Issue: Cannot post to account
**Possible Causes:**
- Account is not marked as transactional
- Account is inactive
- Period is closed/locked

**Solution:**
1. Edit the account and enable "Transactional"
2. Change account status to "Active"
3. Check fiscal period status

---

## Support & Updates

For changes to accounting standards compliance:
- Document changes in the IMPLEMENTATION_AUDIT_TRAIL
- Run seeder to update menu structure: `php artisan db:seed AccountingConfigurationMenuSeeder`
- Test with sample transactions before production use
- Backup data before major configuration changes

---

**Last Updated:** February 2026  
**Compliance Version:** IFRS 2024 / IAS 1-37  
**System Version:** ERP v2.0
