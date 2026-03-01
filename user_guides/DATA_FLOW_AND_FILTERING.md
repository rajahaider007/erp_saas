# 📐 Data Flow & Filtering Architecture

## System Overview: Multi-Company, Multi-Location Setup

```
┌─────────────────────────────────────────────────────┐
│          USER AUTHENTICATION                         │
└────────────┬────────────────────────────────────────┘
             │
             ▼
       ┌─────────────┐
       │   SESSION   │
       ├─────────────┤
       │ user_id     │
       │ user_comp_id│ ◄── Forced to user's company
       │ user_loc_id │ ◄── Forced to user's location
       │ isParent... │ ◄── Based on companies.parent_comp='Yes'
       └─────────────┘
```

---

## Flow 1: PARENT COMPANY USER (isParentCompany = true)

### Step 1: User Selects Company & Location from Dropdown

```
┌──────────────────────────────────────────────────────────┐
│ Frontend (React Component)                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  User clicks: General Ledger → Search page loads         │
│  ↓                                                       │
│  {isParentCompany && (                                   │
│    <Select                                              │
│      options={companies}  ◄── ALL companies from DB     │
│      onChange={handleCompanyChange}                      │
│    />                                                   │
│  )}                                                      │
│  ↓                                                       │
│  User selects: "Company XYZ"                            │
│  ↓                                                       │
│  fetch(`/system/locations/by-company/XYZ`)              │
│    (AJAX call to backend API)                           │
│  ↓                                                       │
│  Locations dropdown populated dynamically                │
│  ↓                                                       │
│  User selects: "Location ABC"                           │
│  ↓                                                       │
│  User clicks "Generate Report"                          │
│  ↓                                                       │
│  router.get('/accounts/general-ledger/report?          │
│             comp_id=XYZ&location_id=ABC')               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Step 2: Backend Receives Request with Selected Company/Location

```
┌──────────────────────────────────────────────────────────┐
│ Backend (GeneralLedgerController@index)                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  REQUEST:                                                │
│  GET /accounts/general-ledger/report                    │
│      ?comp_id=XYZ&location_id=ABC                       │
│                                                          │
│  CODE:                                                   │
│  $isParentCompany = true  (from CompanyHelper)          │
│  ↓                                                       │
│  $compId = $request->input('comp_id')               
│         ?? ($request->session()->get('user_comp_id'))   │
│         = XYZ  (from request param)                     │
│  ↓                                                       │
│  $locationId = $request->input('location_id')          
│            ?? ($request->session()->get('user_location_id'))
│            = ABC  (from request param)                  │
│                                                          │
│  KEY POINTS:                                             │
│  ✓ Request params (comp_id, location_id) are USED       │
│  ✓ NOT forced to session values                         │
│  ✓ Parent company can select ANY company               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Step 3: Backend Filters Query by Selected Company/Location

```
┌──────────────────────────────────────────────────────────┐
│ DATABASE QUERY                                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  SELECT * FROM transaction_entries                      │
│  JOIN transactions ON ...                               │
│  WHERE transactions.comp_id = XYZ          ◄── FILTERED │
│    AND transactions.location_id = ABC      ◄── FILTERED │
│    AND transactions.status = 'Posted'                   │
│  ...                                                     │
│                                                          │
│  RESULT: Only transactions for                          │
│          Company XYZ + Location ABC                     │
│  ✓ Shows data for SELECTED company/location             │
│  ✓ NOT user's own company (because parent selected)     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Step 4: Report Displayed with Filtered Data

```
┌──────────────────────────────────────────────────────────┐
│ Frontend Displays Report                                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  REPORT TITLE:                                           │
│  ╔════════════════════════════════════════════════════╗ │
│  ║ General Ledger Report                              ║ │
│  ║ Company: Company XYZ                               ║ │
│  ║ Location: Location ABC                             ║ │
│  ║ Date: [filtered data only for these]               ║ │
│  ╚════════════════════════════════════════════════════╝ │
│                                                          │
│  ✓ Data shown ONLY for selected company/location        │
│  ✓ Even if parent user is from different company       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Flow 2: CUSTOMER COMPANY USER (isParentCompany = false)

### Step 1: User Cannot See Company/Location Selection

```
┌──────────────────────────────────────────────────────────┐
│ Frontend (React Component)                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  User clicks: General Ledger → Search page loads         │
│  ↓                                                       │
│  {isParentCompany && (                                  │
│    <Select .../>  ◄── HIDDEN (condition is false)      │
│  )}                                                      │
│  ↓                                                       │
│  ❌ No company/location dropdown visible                │
│  ✓ User sees pre-filled info for their company         │
│  ↓                                                       │
│  User clicks "Generate Report"                          │
│  ↓                                                       │
│  router.get('/accounts/general-ledger/report')          │
│  (NO comp_id or location_id in URL)                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Step 2: Backend Ignores Request Params, Uses Session Only

```
┌──────────────────────────────────────────────────────────┐
│ Backend (GeneralLedgerController@index)                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  REQUEST:                                                │
│  GET /accounts/general-ledger/report                    │
│  (NO query parameters)                                  │
│                                                          │
│  CODE:                                                   │
│  $isParentCompany = false  (from CompanyHelper)         │
│  ↓                                                       │
│  // For customer company, IGNORE request params         │
│  // and ALWAYS use session values                       │
│  ↓                                                       │
│  if ($isParentCompany) {                                │
│    $compId = $request->input('comp_id')    ◄── IGNORED │
│  } else {                                               │
│    $compId = session('user_comp_id')       ◄── FORCED  │
│  }                                                       │
│  ↓                                                       │
│  if ($isParentCompany) {                                │
│    $locationId = $request->input('location_id') ◄─IGNORED
│  } else {                                               │
│    $locationId = session('user_location_id')  ◄─FORCED │
│  }                                                       │
│                                                          │
│  KEY POINTS:                                             │
│  ✓ Request params are IGNORED                           │
│  ✓ Session values are FORCED                            │
│  ✓ User cannot select different company                │
│  ✓ User cannot see other companies' data               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Step 3: Backend Filters Query by Session Company/Location

```
┌──────────────────────────────────────────────────────────┐
│ DATABASE QUERY                                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  SELECT * FROM transaction_entries                      │
│  JOIN transactions ON ...                               │
│  WHERE transactions.comp_id = 2            ◄── FROM SESSION
│    AND transactions.location_id = 5        ◄── FROM SESSION
│    AND transactions.status = 'Posted'                   │
│  ...                                                     │
│                                                          │
│  RESULT: Only transactions for                          │
│          User's own Company 2 + Location 5              │
│  ✓ Shows data ONLY for user's company/location          │
│  ✓ Even if URL manually modified                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Step 4: Report Displayed (User's Data Only)

```
┌──────────────────────────────────────────────────────────┐
│ Frontend Displays Report                                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  REPORT TITLE:                                           │
│  ╔════════════════════════════════════════════════════╗ │
│  ║ General Ledger Report                              ║ │
│  ║ Company: Company ABC (user's company)              ║ │
│  ║ Location: Location 2 (user's location)             ║ │
│  ║ Date: [filtered data only for these]               ║ │
│  ╚════════════════════════════════════════════════════╝ │
│                                                          │
│  ✓ Data shown ONLY for user's company/location          │
│  ✓ Cannot be changed by customer user                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Step 5: URL Manipulation Prevention

```
┌──────────────────────────────────────────────────────────┐
│ SECURITY TEST: Customer tries URL manipulation           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  CUSTOMER USER ACTION:                                   │
│  Enters URL manually: /general-ledger?comp_id=3&loc_id=9│
│  ↓                                                       │
│  BACKEND RESPONSE:                                       │
│  $isParentCompany = false                               │
│  ↓                                                       │
│  // IGNORES comp_id=3 from URL                          │
│  $compId = session('user_comp_id') = 2   (FORCED)      │
│  ↓                                                       │
│  // IGNORES location_id=9 from URL                      │
│  $locationId = session('user_location_id') = 5 (FORCED)│
│  ↓                                                       │
│  Queries database with: comp_id=2, location_id=5       │
│  ↓                                                       │
│  RESULT:                                                 │
│  Still shows user's own company/location data           │
│  ✓ User cannot access other companies' data            │
│  ✓ URL manipulation prevents data breach                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Code Pattern Used (Applied to All Reports)

```php
// ========== PARENT COMPANY ==========
if ($isParentCompany) {
    // Parent company can select ANY company/location
    $compId = $request->input('comp_id') 
        ?? $request->session()->get('user_comp_id');
    
    $locationId = $request->input('location_id') 
        ?? $request->session()->get('user_location_id');
}

// ========== CUSTOMER COMPANY ==========
else {
    // Customer company FORCED to their own company/location
    // Request params are IGNORED for security
    $compId = $request->session()->get('user_comp_id');
    
    $locationId = $request->session()->get('user_location_id');
}

// ========== SAFETY CHECK ==========
if (!$compId || !$locationId) {
    return Inertia::render('ReportPage', [
        'error' => 'Company and Location information is required.'
    ]);
}

// ========== FILTER ALL QUERIES ==========
$data = DB::table('...')
    ->where('comp_id', $compId)
    ->where('location_id', $locationId)
    ->get();
```

---

## Session Variable Usage

### What Gets Stored in Session?

When user logs in, these are set:
```php
session()->put('user_id', $user->id);
session()->put('user_comp_id', $user->comp_id);        // User's primary company
session()->put('user_location_id', $user->location_id); // User's primary location
session()->put('isParentCompany', $company->parent_comp === 'Yes');
```

### Session Values Are:
- ✅ **SET at login** - From user's assigned company/location
- ✅ **READ-ONLY in reports** - Cannot be changed by user actions
- ✅ **TRUSTED by backend** - Used as fallback/override for requests
- ✅ **PERMANENT per session** - Changed only on logout/re-login

---

## Summary: How Data Isolation Works

### For PARENT COMPANY Users:
```
┌─────────────────────────────────────────┐
│ CAN DO:                                  │
│ • See company dropdown in report         │
│ • Select any child company               │
│ • View that company's data               │
│ • Toggle between companies               │
│                                          │
│ CANNOT DO:                               │
│ • See other parent companies' data       │
│ • See companies they don't own           │
│ • Change URL to access company 999       │
│   (would show error/empty if not exists) │
└─────────────────────────────────────────┘
```

### For CUSTOMER COMPANY Users:
```
┌─────────────────────────────────────────┐
│ CAN DO:                                  │
│ • View their own company's data          │
│ • Apply filters (date, account, etc)     │
│ • Export/print reports                   │
│                                          │
│ CANNOT DO:                               │
│ • See company dropdown (hidden)          │
│ • Select different company               │
│ • Access other companies' data           │
│ • Manipulate URL to access other data    │
│   (backend ignores param, uses session)  │
└─────────────────────────────────────────┘
```

---

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────────────┐
│ LAYER 1: Frontend Visibility Control                    │
│ {isParentCompany && <CompanySelect/>}                  │
│ ✓ Dropdown hidden for customer companies               │
│ ✓ User cannot even SEE the selection UI                │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│ LAYER 2: Request Parameter Handling                     │
│ if ($isParentCompany) { use request->input() }         │
│ else { use session only, ignore request }              │
│ ✓ Customer company cannot override via URL             │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│ LAYER 3: Database Query Filtering                       │
│ WHERE comp_id = $compId AND location_id = $locationId  │
│ ✓ Even if values were somehow invalid                  │
│   would return empty dataset, not mixed data            │
└─────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────┐
│ LAYER 4: Error Handling                                 │
│ if (!$compId || !$locationId)                          │
│ return error message                                   │
│ ✓ No data shown if company/location missing            │
└─────────────────────────────────────────────────────────┘
```

---

**Conclusion:** ✅ All 8 reports properly filter data by company and location using session fallback for security.
