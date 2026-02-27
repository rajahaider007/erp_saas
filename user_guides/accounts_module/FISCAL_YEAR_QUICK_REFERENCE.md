# Fiscal Year Management - Quick Reference Card

## 📊 Overview at a Glance

```
SYSTEM STRUCTURE:
    Company → Fiscal Year → 13 Periods → Transactions
    
EXAMPLE:
    ABC Corp → FY 2025 → Jan 2025, Feb 2025, ... Adj 2025 → Journal Entries
```

---

## 🎯 Three Main Features

### 1️⃣ Fiscal Year Configuration
**What**: Manage fiscal years and accounting periods  
**Where**: `/accounts/fiscal-year-configuration`  
**Do**: Create years, lock periods, close periods  

### 2️⃣ Balance Sheet
**What**: Financial position as of specific date  
**Where**: `/accounts/balance-sheet`  
**Shows**: Assets, Liabilities, Equity (at a point in time)  

### 3️⃣ Income Statement
**What**: Profit/Loss for a period  
**Where**: `/accounts/income-statement`  
**Shows**: Revenue, Expenses, Net Profit (for a date range)  

---

## 🔢 Period Structure

**Every fiscal year has 13 periods:**

| Period | Name | Purpose |
|--------|------|---------|
| 1-12 | Jan-Dec | Regular monthly transactions |
| 13 | Adjustment | Year-end accruals & adjustments |

---

## 📅 How Fiscal Year is Calculated

**Formula:**
```
If: Transaction Date >= Fiscal Year Start
Then: Fiscal Year = Current Calendar Year
Else: Fiscal Year = Prior Calendar Year
```

**Examples** (assuming fiscal year starts April 1):

| Transaction Date | Fiscal Year | Reason |
|------------------|-------------|--------|
| 2026-01-15 | 2025 | Before April 1 |
| 2026-03-31 | 2025 | Before April 1 |
| 2026-04-01 | 2026 | On/after April 1 |
| 2026-12-31 | 2026 | After April 1 |

---

## 🔗 User Workflows

### Create Fiscal Year
```
1. Go to Fiscal Year Configuration
2. Enter year number in "Create New Year" form
3. Click "+" button
4. System creates 13 periods automatically
```

### Post Journal Entry
```
1. Go to Journal Voucher → Create
2. Enter voucher date (e.g., 2026-03-15)
3. Fill in debit/credit entries
4. Click "Save & Post"
5. System automatically:
   - Calculates fiscal year (e.g., 2025)
   - Assigns to period (e.g., March 2025)
   - Validates period is Open ✓
   - Saves with fiscal_year = "2025"
```

### Generate Balance Sheet
```
1. Go to Balance Sheet
2. Enter "As At Date" (e.g., 2026-03-31)
3. (Optional) Enter "Comparative Date"
4. Click "Generate"
5. View statement:
   - Assets = Liabilities + Equity?
   - All in selected fiscal year currency
```

### Analyze Income Statement
```
1. Go to Income Statement
2. Enter "From Date" (period start)
3. Enter "To Date" (period end)
4. Click "Generate"
5. View P&L across fiscal years (if date range spans multiple FYs)
```

---

## 🔐 Period Status Rules

### Status Definitions

**Open** 🟢
- Can create new transactions
- Can modify existing entries

**Locked** 🟡
- Under audit/review
- Cannot post new transactions
- Can modify with approval

**Closed** 🔴
- Permanently archived
- No changes allowed
- For historical reference

### Transition Flow
```
         ┌─────────┐
         │  OPEN   │ ← Start here
         └────┬────┘
              │ Manual lock
              ▼
         ┌─────────┐
         │ LOCKED  │ ← Period has posted transactions?
         └────┬────┘   Yes: OK to close
              │ Manual close
              ▼
         ┌─────────┐
         │ CLOSED  │ ← Permanent
         └─────────┘
```

---

## ⚡ Quick Rules

| Scenario | Can Post? | Result |
|----------|-----------|--------|
| Period is **Open** | ✅ Yes | Transaction accepted |
| Period is **Locked** | ❌ No | Error: Period locked |
| Period is **Closed** | ❌ No | Error: Period closed |
| No period exists | ❌ No | Error: No period found |
| Multiple fiscal years | ✅ Yes* | Each assigned to correct FY |

*Dates range across multiple fiscal years

---

## 📊 Report Filters Explained

### Balance Sheet
**Includes transactions where:**
```
    fiscal_year <= Report Fiscal Year
    AND
    voucher_date <= Report Date
```

**Example:**
- Report date: March 31, 2026
- Fiscal year: 2025
- Includes: All transactions from Jan 2025 through March 31, 2026

### Income Statement
**Includes transactions where:**
```
    fiscal_year BETWEEN From Fiscal Year AND To Fiscal Year
    AND
    voucher_date BETWEEN From Date AND To Date
```

**Example:**
- From date: April 1, 2025
- To date: March 31, 2026
- Includes: All transactions for fiscal year 2025

---

## 🎨 Visual Indicators

### Header Badge
```
┌──────────────────────────────┐
│  Company Name        FY 2025  │ ← Shows current fiscal year
└──────────────────────────────┘
```

### Period Status Badges
```
Period 1 (January 2025)        ✓ OPEN
Period 2 (February 2025)       🔒 LOCKED
Period 3 (March 2025)          ✗ CLOSED
```

### Report Validation
```
Balance Sheet Validation:

Assets:                    $100,000
Liabilities:              $ 60,000
Equity:                   $ 40,000

Equation: 100,000 = 60,000 + 40,000 ✓ BALANCED
```

---

## 🔍 Troubleshooting

### Problem: "No accounting period found"
**Cause**: Transaction date doesn't match any period  
**Fix**: Create fiscal year in configuration first  

### Problem: "Period is Locked - cannot post"
**Cause**: Trying to post to locked/closed period  
**Fix**: Either:
- Unlock period (click Unlock button), or
- Post to Open period instead

### Problem: Fiscal year not showing in header
**Cause**: Page not passing fiscal year from controller  
**Fix**: Refresh page or navigate to different section

### Problem: Balance sheet doesn't balance
**Cause**: Account classification issue (not fiscal year related)  
**Fix**: Check chart of accounts classifications

---

## 📱 Common Dates

| Event | Key Date | Action |
|-------|----------|--------|
| Year Start | April 1 | FY 2026 begins |
| Month End | April 30 | Lock April period |
| Month Close | May 1 | Close April period |
| Quarter End | June 30 | Lock Q1 |
| Half Year | Sep 30 | Lock H1 |
| Year End | March 31 | Post to Adjustment Period |
| FY Close | April 15 | Close all FY periods |

---

## 🔗 Field Reference

### In Transactions Table
```
Column: fiscal_year
Type: VARCHAR(4)
Example: "2025"
Purpose: Track which fiscal year transaction belongs to
Index: Yes (for fast queries)
```

### In Fiscal Periods Table
```
Column: status
Type: ENUM
Values: 'Open', 'Locked', 'Closed'
Default: 'Open'
Purpose: Control which periods accept new transactions
```

---

## 💾 Data Retention

| Data | Retention | Action |
|------|-----------|--------|
| **Open Periods** | Indefinite | Modify/delete allowed |
| **Locked Periods** | Indefinite | View/modify with approval |
| **Closed Periods** | Forever | Archive/view only |

---

## 🎓 Training Checklist

- [ ] Understand fiscal year auto-calculation (company fiscal_year_start)
- [ ] Know how to create new fiscal years
- [ ] Can identify period status from icons
- [ ] Understand Open/Locked/Closed restrictions
- [ ] Know how to lock period for month-end
- [ ] Know how to close period after verification
- [ ] Can generate balance sheet as-of date
- [ ] Can generate income statement for period
- [ ] Know what to do if posted to wrong period
- [ ] Understand that fiscal year is automatic on posting

---

## 🚀 Performance Tips

1. **Close periods promptly** - Reduces open item reconciliation
2. **Post in batches** - More efficient than one-at-a-time
3. **Review reports regularly** - Catch errors early
4. **Lock months monthly** - Standard accounting practice
5. **Archive old fiscal years** - Keeps database lean

---

## 📞 Support Contacts

| Issue | Where | Who |
|-------|-------|-----|
| Fiscal year not created | Fiscal Year Configuration | Admin/Controller |
| Period won't open | Period Status | Finance Manager |
| Report shows wrong amounts | Balance Sheet/Income Statement | Financial Analyst |
| Database errors | System Logs | Technical Admin |

---

## 📚 Related Documentation

- **Full Guide**: [FISCAL_YEAR_MANAGEMENT_INTEGRATION.md](user_guides/accounts_module/FISCAL_YEAR_MANAGEMENT_INTEGRATION.md)
- **Testing**: [FISCAL_YEAR_TESTING_GUIDE.md](user_guides/accounts_module/FISCAL_YEAR_TESTING_GUIDE.md)
- **Technical**: [FINANCIAL_STATEMENTS_IMPLEMENTATION.md](FINANCIAL_STATEMENTS_IMPLEMENTATION.md)

---

## ✅ Implementation Status

| Component | Status |
|-----------|--------|
| Database tables | ✅ Created |
| Fiscal year calculation | ✅ Working |
| Period management | ✅ Functional |
| Balance sheet | ✅ Operational |
| Income statement | ✅ Operational |
| Header badge | ✅ Visible |
| Period validation | ✅ Enforced |

**Overall Status**: 🟢 **PRODUCTION READY**

---

*Last Updated: Implementation Complete*
*Version: 1.0*
*Keep this card handy for quick reference!*
