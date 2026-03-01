# 🔍 Company & Location Filter Implementation - Code Reference

## How It Works in Working Reports

### Frontend Pattern (e.g., General Ledger Search)
**File:** `resources/js/Pages/Accounts/GeneralLedger/Search.jsx`

```javascript
// 1. Get companies and locations from backend
const { auth, companies, locations, isParentCompany } = usePage().props;

// 2. Show company dropdown ONLY for parent companies
{isParentCompany && (
  <div>
    <label>Company Selection</label>
    <Select
      options={companyOptions}
      value={selectedCompany}
      onChange={handleCompanyChange}
      placeholder="Select a company..."
    />
  </div>
)}

// 3. When company is selected, fetch locations via AJAX
const handleCompanyChange = async (selectedOption) => {
  setSelectedCompany(selectedOption);
  setSelectedLocation(null);
  
  if (selectedOption) {
    const response = await fetch(
      `/system/locations/by-company/${selectedOption.value}`
    );
    const data = await response.json();
    setAvailableLocations(data.data || []);
  }
};

// 4. Show location dropdown (populated from AJAX response)
{selectedCompany && (
  <Select
    options={locationOptions}
    value={selectedLocation}
    onChange={(e) => setSelectedLocation(e)}
    placeholder="Select a location..."
  />
)}

// 5. When user clicks "Generate Report", send selected values to backend
const handleGenerateReport = () => {
  const params = new URLSearchParams();
  if (selectedCompany) params.set('comp_id', selectedCompany.value);
  if (selectedLocation) params.set('location_id', selectedLocation.value);
  
  router.get('/accounts/general-ledger/report?' + params.toString());
};
```

---

### Backend Pattern (e.g., GeneralLedgerController)
**File:** `app/Http/Controllers/Accounts/GeneralLedgerController.php`

```php
public function index(Request $request): Response
{
    // 1. Check if user's company is parent company
    $isParentCompany = CompanyHelper::isCurrentCompanyParent();
    
    // 2. Get comp_id and location_id from request or session
    $compId = $request->input('comp_id') 
        ?? $request->session()->get('user_comp_id');
    
    $locationId = $request->input('location_id') 
        ?? $request->session()->get('user_location_id');
    
    // 3. Fetch companies and locations for parent companies
    $companies = [];
    $locations = [];
    
    if ($isParentCompany) {
        // Get ALL companies
        $companies = DB::table('companies')
            ->where('status', true)
            ->orderBy('company_name')
            ->get(['id', 'company_name']);
        
        // Get locations for selected company
        if ($compId) {
            $locations = DB::table('locations')
                ->where('company_id', $compId)
                ->where('status', 'Active')
                ->orderBy('location_name')
                ->get(['id', 'location_name']);
        }
    }
    
    // 4. Build report data filtered by comp_id and location_id
    $query = DB::table('transaction_entries')
        ->join('transactions', ...)
        ->where('transactions.comp_id', $compId)  // ← FILTER BY COMPANY
        ->where('transactions.location_id', $locationId)  // ← FILTER BY LOCATION
        ->where(...)
        ->get();
    
    // 5. Return to frontend with companies/locations list
    return Inertia::render('Accounts/GeneralLedger/Report', [
        'ledgerData' => $query,
        'companies' => $companies,  // ← For dropdown
        'locations' => $locations,  // ← For dropdown
        'isParentCompany' => $isParentCompany,
    ]);
}
```

---

## 🚨 Issues Found

### ❌ ISSUE 1: Balance Sheet
**File:** `app/Http/Controllers/Accounts/BalanceSheetController.php`

```php
public function index(Request $request): Response
{
    $compId = $request->input('comp_id') 
        ?? $request->session()->get('user_comp_id');
    
    $locationId = $request->input('location_id') 
        ?? $request->session()->get('user_location_id');
    
    // ✅ BACKEND FILTERING WORKS - data is filtered correctly
    $balanceSheetData = $this->buildHierarchicalBalanceSheet(
        $compId, $locationId, $asAtDate
    );
    
    return Inertia::render('Accounts/BalanceSheet/Report', [
        'balanceSheetData' => $balanceSheetData,
        // ❌ BUT NO COMPANIES/LOCATIONS PASSED TO FRONTEND!
        // ❌ And NO SEARCH PAGE to select company/location
    ]);
}
```

**Problem:**
- ❌ Controllers doesn't pass `companies`, `locations`, `isParentCompany` to view
- ❌ No dedicated Search.jsx page
- ❌ Parent companies can only see their own company's balance sheet
- ❌ URL parameters don't help because there's no UI to set them

**Impact:** Parent companies CANNOT view balance sheets of their child companies

---

### ❌ ISSUE 2: Income Statement
**File:** `app/Http/Controllers/Accounts/IncomeStatementController.php`

```php
public function index(Request $request): Response
{
    $compId = $request->input('comp_id') 
        ?? $request->session()->get('user_comp_id');
    
    $locationId = $request->input('location_id') 
        ?? $request->session()->get('user_location_id');
    
    // ✅ BACKEND FILTERING WORKS
    $incomeStatementData = $this->buildIncomeStatement(
        $compId, $locationId, $fromDate, $toDate
    );
    
    return Inertia::render('Accounts/IncomeStatement/Report', [
        'incomeStatementData' => $incomeStatementData,
        // ❌ NO COMPANIES/LOCATIONS PASSED
        // ❌ NO SEARCH PAGE
    ]);
}
```

**Problem:** Same as Balance Sheet

---

## ✅ CORRECT IMPLEMENTATION

### Example: Trial Balance (CORRECT)

**Backend:** `app/Http/Controllers/Accounts/TrialBalanceController.php`

```php
// 👉 Has SEPARATE search() method
public function search(Request $request): Response
{
    $isParentCompany = CompanyHelper::isCurrentCompanyParent();

    // Get companies for parent
    $companies = [];
    if ($isParentCompany) {
        $companies = DB::table('companies')
            ->where('status', 1)
            ->select('id', 'company_name')
            ->get();
    }

    // Get locations for selected company
    $locations = [];
    if ($compId) {
        $locations = DB::table('locations')
            ->where('company_id', $compId)
            ->select('id', 'location_name')
            ->get();
    }

    // ✅ Pass all needed data to Search component
    return Inertia::render('Accounts/TrialBalance/Search', [
        'companies' => $companies,
        'locations' => $locations,
        'isParentCompany' => $isParentCompany,
    ]);
}

// 👉 Then has index() for report
public function index(Request $request): Response
{
    // Get comp_id/location_id from request (selected in search page)
    $compId = $request->input('comp_id') 
        ?? $request->session()->get('user_comp_id');
    
    // Build and return report data
    $data = $this->generateTrialBalance($compId, $locationId);
    
    return Inertia::render('Accounts/TrialBalance/Report', [
        'trialBalanceData' => $data,
    ]);
}
```

**Frontend:** `resources/js/Pages/Accounts/TrialBalance/Search.jsx`
- Dropdown to select company
- Dropdown to select location (loads dynamically)
- Button to "Generate Report" which calls `/accounts/trial-balance?comp_id=X&location_id=Y`

✅ **Result:** Fully functional!

---

## 🔧 Solution Plan

### For Balance Sheet:

**Step 1:** Create Search Component
```jsx
// resources/js/Pages/Accounts/BalanceSheet/Search.jsx
// Copy structure from TrialBalance/Search.jsx
// Add "As At Date" picker instead of date range
```

**Step 2:** Update Controller
```php
// app/Http/Controllers/Accounts/BalanceSheetController.php

// Add search() method:
public function search(Request $request): Response
{
    $isParentCompany = CompanyHelper::isCurrentCompanyParent();
    
    $companies = [];
    if ($isParentCompany) {
        $companies = DB::table('companies')->where('status', 1)->get();
    }
    
    $locations = DB::table('locations')
        ->where('company_id', $compId)->get();
    
    return Inertia::render('Accounts/BalanceSheet/Search', [
        'companies' => $companies,
        'locations' => $locations,
        'isParentCompany' => $isParentCompany,
    ]);
}

// Modify index() to NOT pass companies/locations
// (only pass to view if in REPORT, not in initial load)
```

**Step 3:** Update Routes
```php
// routes/web.php
Route::get('/accounts/balance-sheet/search', 
    [BalanceSheetController::class, 'search']
)->name('balance-sheet.search');

Route::get('/accounts/balance-sheet', 
    [BalanceSheetController::class, 'index']
)->name('balance-sheet.index');
```

**Step 4:** Update Navigation
- Change menu link from `/accounts/balance-sheet` to `/accounts/balance-sheet/search`

---

### For Income Statement:

Same approach as Balance Sheet

```jsx
// resources/js/Pages/Accounts/IncomeStatement/Search.jsx
// Company + Location dropdown
// Fiscal Period selector (or From/To Date range)
```

---

## 🧪 How to Test Current Issues

### Test Balance Sheet Issue:

1. **Login as Parent Company user**
2. **Go to:** Accounts → Balance Sheet
3. **Observe:**
   - ✅ You see balance sheet for YOUR company
   - ❌ You CANNOT see dropdown to select other companies
   - ❌ You CANNOT select different location
   - ❌ You CANNOT change "As At Date" via UI

4. **Try URL workaround:**
   - Copy URL: `http://localhost:8000/accounts/balance-sheet`
   - Manually add: `?comp_id=2&location_id=3` 
   - You'll see data changes (proves backend supports it)
   - But no UI to do this easily

### Test Income Statement Issue:

Same as Balance Sheet

---

## 🎯 Verification Checklist

- [x] 5 reports have working company/location filters
- [ ] Balance Sheet needs Search page implementation
- [ ] Income Statement needs Search page implementation
- [ ] All filters pass correct comp_id/location_id to database queries
- [ ] Session defaults work for customer companies
- [ ] Parent companies can see company selector
- [ ] Customer companies see dropdowns disabled/hidden

---

**Status:** ⚠️ 5 of 7 reports fully functional  
**Action Required:** Implement 2 missing search pages
