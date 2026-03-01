# 🧪 Data Filtering - Practical Verification Guide

**Purpose:** Step-by-step tests to verify company/location filtering is working correctly  
**Duration:** ~15 minutes per test  
**Prerequisites:** 2 user accounts (1 parent company, 1 customer company)

---

## ✅ TEST 1: Parent Company Can View Multiple Companies

### Setup Required:
- **Parent Company Account:** Admin user from Company A (that owns Company B)
- **Data:** Some transactions in Company A and Company B

### Test Steps:

1. **Login as Parent Company User**
   ```
   Username: parent_admin@company-a.com
   (User's primary company should be Company A)
   ```

2. **Navigate to General Ledger Report**
   ```
   Menu: Accounts → General Ledger
   ```

3. **Verify Company Dropdown Visible**
   ```
   ✓ You should see "Company Selection" dropdown
   ✓ Dropdown shows: Company A, Company B, Company C (all active companies)
   ✓ Currently shows "Company A" (your primary company)
   ```

4. **Select Different Company**
   ```
   Click dropdown → Select "Company B"
   ✓ Location dropdown appears
   ✓ Shows "Company B's" locations
   ```

5. **Select Location in That Company**
   ```
   Location dropdown → Select "Location B1"
   ```

6. **Generate Report**
   ```
   Click "Generate Report" button
   ```

7. **Verify Data is Correct**
   ```
   ✓ Report title shows: "Company: Company B" and "Location: Location B1"
   ✓ Accounts shown are from Company B's chart of accounts
   ✓ Transactions shown are from Company B + Location B1 ONLY
   ✓ You are NOT seeing Company A's data anymore
   ```

8. **Switch to Different Company**
   ```
   Click "Search/Filters" button (or back button)
   Select Company A from dropdown
   Click "Generate Report"
   ✓ Report now shows Company A data
   ✓ Verify it's completely different from Company B report
   ```

### ✅ Expected Result:
- Dropdown visible for parent company
- Can select any company
- Report data changes based on selection
- Data is isolated per company/location

### ❌ If Test Fails:
- **No company dropdown?** → Balance Sheet/Income Statement not implemented
- **Shows same data for all companies?** → Filtering not applied
- **Shows error?** → Check if CompanyHelper is working correctly

---

## ✅ TEST 2: Customer Company Cannot See Other Companies

### Setup Required:
- **Customer Company Account:** Regular user from Company B
- **Not a parent company**

### Test Steps:

1. **Login as Customer Company User**
   ```
   Username: user@company-b.com
   (User's primary company should be Company B ONLY)
   ```

2. **Navigate to General Ledger Report**
   ```
   Menu: Accounts → General Ledger
   ```

3. **Verify Company Dropdown NOT Visible**
   ```
   ✓ Page loads directly to report view (no search page)
   ✓ NO "Company Selection" dropdown visible
   ✓ NO "Location Selection" dropdown visible
   ✓ You see your company data directly
   ```

4. **Verify Data is Your Company Only**
   ```
   ✓ Report shows Company B data
   ✓ Report shows your location only
   ✓ Accounts match your company's chart of accounts
   ```

5. **Try URL Manipulation Test**
   ```
   Current URL: http://localhost:8000/accounts/general-ledger/report
   
   Manually change to:
   http://localhost:8000/accounts/general-ledger/report?comp_id=1&location_id=2
   
   ✓ Report STILL shows Company B data
   ✓ NOT Company 1 data (even though you tried comp_id=1)
   ✓ This proves URL manipulation doesn't work
   ```

6. **Test All Reports**
   Repeat the above for:
   - Currency Ledger
   - Trial Balance
   - Cash Book
   - Chart of Accounts
   
   ```
   Result: ✓ All show your company data only
   Result: ✓ All ignore comp_id/location_id in URL
   ```

### ✅ Expected Result:
- No dropdown visible
- Cannot select different company
- Only your company's data shown
- URL manipulation doesn't work

### ❌ If Test Fails:
- **Can see company dropdown?** → Filtering broken (serious security issue!)
- **Can see other company data after URL manipulation?** → Filtering not applied
- **Shows all accounts from all companies?** → Database query not filtering properly

---

## ✅ TEST 3: Location Selection Works Correctly

### Setup Required:
- **Parent Company Account**
- **Multiple locations in same company**
- **Transactions in different locations**

### Test Steps:

1. **Login as Parent Company**

2. **Go to Trial Balance**
   ```
   Menu: Accounts → Trial Balance
   ```

3. **Verify Company/Location Dropdowns**
   ```
   ✓ Company dropdown visible
   ✓ Location dropdown visible but disabled
   ```

4. **Select Company**
   ```
   Company dropdown → Select a company
   ✓ Location dropdown becomes ENABLED
   ✓ Shows only that company's locations
   ```

5. **Select Different Locations & Compare**
   ```
   Location dropdown → Select "Location 1"
   Click "Generate Report"
   
   NOTE: Account balances shown
   
   Go back, select "Location 2"
   Click "Generate Report"
   
   ✓ Balances are DIFFERENT for Location 2
   ✓ Proves location filter is working
   ✓ Each location has its own account data
   ```

6. **Verify Multi-Location Data Isolation**
   ```
   ✓ Location 1 shows only its accounts
   ✓ Location 2 shows different account balances
   ✓ Accounts are not mixed
   ```

### ✅ Expected Result:
- Location dropdown dynamically loads
- Data changes based on location selection
- Each location has isolated data

### ❌ If Test Fails:
- **Location dropdown doesn't populate?** → AJAX endpoint broken
- **Same data for all locations?** → Filtering not applied to location_id
- **No location dropdown?** → Missing Search page

---

## ✅ TEST 4: Session Fallback Works

### Setup Required:
- Any user account
- Ability to check browser console

### Test Steps:

1. **Login as Parent Company User**

2. **Go to General Ledger**
   ```
   Menu: Accounts → General Ledger
   ```

3. **DON'T select company/location**
   ```
   Just click "Generate Report" directly
   (without selecting from dropdowns)
   ```

4. **Verify Report Loads**
   ```
   ✓ Report loads without error
   ✓ Shows YOUR company's data (from session)
   ✓ Shows YOUR location's data (from session)
   ✓ Proves session fallback works
   ```

5. **Check Network Tab**
   ```
   Browser Dev Tools → Network tab
   Look for request to: /accounts/general-ledger/report
   
   ✓ If you didn't select company, URL has NO query params
   ✓ But report still shows data
   ✓ Proves session default is working
   ```

### ✅ Expected Result:
- Page works without explicit company/location selection
- Uses session defaults

### ❌ If Test Fails:
- **Shows error "Company and Location required"?** → Session values not set
- **Shows all data?** → Filtering not applied

---

## ✅ TEST 5: All 8 Reports Filtering Works

### Quick Checklist (5 minutes per report):

For EACH report:

```
Report: General Ledger
├─ Parent company sees dropdown? ✓ YES / ❌ NO
├─ Can select different company? ✓ YES / ❌ NO
├─ Data changes based on selection? ✓ YES / ❌ NO
├─ Customer company can't select? ✓ YES / ❌ NO
└─ Customer company locked to own data? ✓ YES / ❌ NO

Report: Currency Ledger
├─ Parent company sees dropdown? ✓ YES / ❌ NO
├─ Can select different company? ✓ YES / ❌ NO
├─ Data changes based on selection? ✓ YES / ❌ NO
├─ Customer company can't select? ✓ YES / ❌ NO
└─ Customer company locked to own data? ✓ YES / ❌ NO

Report: Trial Balance
├─ Parent company sees dropdown? ✓ YES / ❌ NO
├─ Can select different company? ✓ YES / ❌ NO
├─ Data changes based on selection? ✓ YES / ❌ NO
├─ Customer company can't select? ✓ YES / ❌ NO
└─ Customer company locked to own data? ✓ YES / ❌ NO

Report: Cash Book
├─ Parent company sees dropdown? ✓ YES / ❌ NO
├─ Can select different company? ✓ YES / ❌ NO
├─ Data changes based on selection? ✓ YES / ❌ NO
├─ Customer company can't select? ✓ YES / ❌ NO
└─ Customer company locked to own data? ✓ YES / ❌ NO

Report: Chart of Accounts Report
├─ Parent company sees dropdown? ✓ YES / ❌ NO
├─ Can select different company? ✓ YES / ❌ NO
├─ Data changes based on selection? ✓ YES / ❌ NO
├─ Customer company can't select? ✓ YES / ❌ NO
└─ Customer company locked to own data? ✓ YES / ❌ NO

Report: Balance Sheet
├─ Parent company sees dropdown? ✓ YES / ❌ NO
├─ Can select different company? ✓ YES / ❌ NO
├─ Data changes based on selection? ✓ YES / ❌ NO
├─ Customer company can't select? ✓ YES / ❌ NO
└─ Customer company locked to own data? ✓ YES / ❌ NO

Report: Income Statement
├─ Parent company sees dropdown? ✓ YES / ❌ NO
├─ Can select different company? ✓ YES / ❌ NO
├─ Data changes based on selection? ✓ YES / ❌ NO
├─ Customer company can't select? ✓ YES / ❌ NO
└─ Customer company locked to own data? ✓ YES / ❌ NO

Report: Chart of Accounts Configuration
├─ Parent company sees dropdown? ✓ YES / ❌ NO
├─ Can select different company? ✓ YES / ❌ NO
├─ Data changes based on selection? ✓ YES / ❌ NO
├─ Customer company can't select? ✓ YES / ❌ NO
└─ Customer company locked to own data? ✓ YES / ❌ NO
```

### Scoring:
- **40/40 ✅** = All systems working perfectly
- **35-39 ✓** = 5 reports working, 2 missing search pages (Balance Sheet, Income Statement)
- **<35 ❌** = Issues with filtering logic

---

## 🔥 Critical Security Tests

### Test: Customer Company Cannot Access Other Data

```
Step 1: Login as customer company user (Company B)
Step 2: Note the URL for General Ledger
        Current: /accounts/general-ledger/report

Step 3: Try to access Company A data
        Change to: /accounts/general-ledger/report?comp_id=1&location_id=1

Step 4: Verify result
        ✅ CORRECT: Still shows Company B data (customer's company)
        ❌ SECURITY ISSUE: Shows Company A data (customer accessed other company!)
```

### Test: Parent Company Can Select Any Company

```
Step 1: Login as parent company user
Step 2: Go to General Ledger
Step 3: Use dropdown to select each child company
Step 4: Verify each report shows correct company data
        ✅ CORRECT: Each company's data is different
        ❌ ERROR: All companies show same data
```

---

## 📋 Documentation Reference

For detailed information, see:
- [DATA_FILTERING_SECURITY_AUDIT.md](DATA_FILTERING_SECURITY_AUDIT.md) - Complete audit results
- [DATA_FLOW_AND_FILTERING.md](DATA_FLOW_AND_FILTERING.md) - Architectural details
- [REPORTS_COMPANY_LOCATION_STATUS.md](REPORTS_COMPANY_LOCATION_STATUS.md) - Feature status

---

## 🎯 Troubleshooting Guide

### Problem: Company dropdown not visible
```
Try:
1. Check user's comp_id in database:
   SELECT parent_comp FROM companies WHERE id = ?
   
2. If parent_comp = 'Yes' → dropdown SHOULD show
3. If parent_comp = 'No' → dropdown should NOT show
4. Clear browser cache and reload
```

### Problem: Data not changing when company selected
```
Try:
1. Open browser console (F12)
2. Go to Network tab
3. Click "Generate Report"
4. Find request to /accounts/general-ledger/report
5. Check if comp_id and location_id are in URL parameters
6. If missing → Frontend not sending them
7. If present but wrong data → Backend not filtering
```

### Problem: Session not falling back
```
Try:
1. Login and note your session company
2. Go to report without selecting company
3. Check what company data shows up
4. Should match your session company
5. If wrong → Session values not set at login
```

---

**Test Date:** _______________  
**Tester Name:** _______________  
**Test Result:** ✅ PASS / ❌ FAIL  
**Notes:** ___________________________________________________

