# Reports: Company & Location Filters Implementation

## Overview
**Parent companies** can now **select any company and location** to view reports across the entire system. **Customer companies** only see data for their own company and locations automatically.

---

## ✅ Implemented Features

### 1. **General Ledger Report**
**Location:** `Accounts > General Ledger`

**For Parent Companies:**
- ✅ Select any company from dropdown (Select2)
- ✅ Select any location within that company
- ✅ Location dropdown updates dynamically when company is selected
- ✅ Can view data across all companies

**For Customer Companies:**
- ✅ Automatically filtered to their own company
- ✅ Company/Location selects are hidden
- ✅ No access to other companies' data

---

## 📁 Files Modified

### Backend:
1. **`app/Http/Controllers/Accounts/GeneralLedgerController.php`**
   - Added `CompanyHelper` import
   - `index()` method: Added company/location filtering
   - `search()` method: Pass companies, locations, isParentCompany to frontend
   - Returns `companies`, `locations`, `isParentCompany` flags

### Frontend:
2. **`resources/js/Pages/Accounts/GeneralLedger/Search.jsx`**
   - Added company & location Select2 dropdowns
   - Dynamic location loading based on company selection
   - Only visible for parent companies
   - Integrated with existing filters

### Routes:
3. **`routes/web.php`**
   - Added API endpoint: `/api/locations-by-company/{companyId}`
   - Returns locations for selected company
   - Used for dynamic location dropdown

---

## 🔧 How It Works

### Parent Company Flow:
```
1. User opens General Ledger → Search/Filters page
2. Parent company sees:
   - Company dropdown (Select2)
   - Location dropdown (disabled until company selected)
   - Account dropdown
   - Date range, voucher type, status, amount filters

3. User selects Company
   → Locations are fetched via AJAX
   → Location dropdown is populated

4. User selects Location
   → Accounts for that company/location are shown

5. User clicks "Generate Report"
   → Data filtered for selected company/location
```

### Customer Company Flow:
```
1. User opens General Ledger → Search/Filters page
2. Customer company sees:
   - Account dropdown (only their accounts)
   - Date range, voucher type, status, amount filters
   - NO company/location selects

3. User clicks "Generate Report"
   → Data automatically filtered to their own company/location
```

---

## 🎨 UI Features

### Select2 Integration
- **Search functionality** - Type to search companies/locations
- **Clearable** - X button to clear selection
- **Dark theme styling** - Matches existing UI
- **Disabled state** - Location disabled until company selected
- **Placeholder text** - Clear instructions

### Filter Display
```javascript
// Parent Company Filters (in order):
1. Company Selection ← NEW
2. Location Selection ← NEW (appears after company selected)
3. Account Selection
4. Date Range
5. Voucher Type
6. Transaction Status
7. Amount Range

// Customer Company Filters (in order):
1. Account Selection
2. Date Range
3. Voucher Type
4. Transaction Status
5. Amount Range
```

---

## 🔌 API Endpoint

### Get Locations by Company
**URL:** `/system/locations/by-company/{companyId}`  
**Method:** GET  
**Auth:** Required (web.auth middleware)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "location_name": "Head Office"
    },
    {
      "id": 2,
      "location_name": "Branch Office"
    }
  ]
}
```

**Usage in Frontend:**
```javascript
const response = await fetch(`/system/locations/by-company/${companyId}`);
const data = await response.json();
const locations = data.data || [];
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────┐
│   Parent Company    │
│    Logs In          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│   General Ledger Search Page    │
│                                  │
│   [Select Company ▼]             │
│         │                        │
│         ├─ Company 1            │
│         ├─ Company 2            │
│         └─ Company 3            │
└─────────┬──────────────────────┘
          │
          │ User Selects Company
          ▼
    ┌─────────────────┐
    │ AJAX Request to │
    │ /api/locations- │
    │ by-company/{id} │
    └─────────┬───────┘
              │
              ▼
    ┌──────────────────────┐
    │ Returns Locations    │
    │ for that Company     │
    └─────────┬────────────┘
              │
              ▼
┌──────────────────────────────────┐
│   [Select Location ▼]             │
│         │                         │
│         ├─ Location 1            │
│         ├─ Location 2            │
│         └─ Location 3            │
└──────────────────────────────────┘
```

---

## 🧪 Testing Checklist

### Parent Company Tests:
- [ ] Login as parent company
- [ ] Go to General Ledger → Filters
- [ ] Verify Company dropdown is visible
- [ ] Select a company
- [ ] Verify Location dropdown is populated
- [ ] Select a location
- [ ] Generate report
- [ ] Verify data shows for selected company/location
- [ ] Change to different company
- [ ] Verify locations update accordingly
- [ ] Generate report for different company
- [ ] Verify correct data displays

### Customer Company Tests:
- [ ] Login as customer company
- [ ] Go to General Ledger → Filters
- [ ] Verify Company/Location dropdowns are NOT visible
- [ ] Generate report
- [ ] Verify data shows only for own company/location
- [ ] Try to manually add `?comp_id=X` to URL
- [ ] Verify system still filters to own company

### API Tests:
- [ ] Call `/api/locations-by-company/1` (replace 1 with valid company ID)
- [ ] Verify returns array of locations
- [ ] Call with invalid company ID
- [ ] Verify returns empty array or error
- [ ] Call without authentication
- [ ] Verify requires login

---

## 🚀 Future Enhancements

### To Apply Same Filters to Other Reports:

1. **Currency Ledger Report**
2. **Trial Balance**
3. **Profit & Loss Statement**
4. **Balance Sheet**
5. **Cash Flow Statement**

**Steps to Add:**
```php
// In Controller:
use App\Helpers\CompanyHelper;

$isParentCompany = CompanyHelper::isCurrentCompanyParent();
$compId = $request->input('comp_id') ?? session('user_comp_id');
$locationId = $request->input('location_id') ?? session('user_location_id');

if ($isParentCompany) {
    $companies = DB::table('companies')->where('status', true)->get();
    $locations = DB::table('locations')->where('comp_id', $compId)->get();
}

// Pass to view:
return Inertia::render('Report/Page', [
    'companies' => $companies ?? [],
    'locations' => $locations ?? [],
    'isParentCompany' => $isParentCompany
]);
```

```jsx
// In Frontend (React):
const { companies = [], locations = [], isParentCompany = false } = usePage().props;

{isParentCompany && (
  <>
    <Select 
      options={companyOptions}
      value={selectedCompany}
      onChange={handleCompanyChange}
      placeholder="Select company..."
    />
    
    {selectedCompany && (
      <Select 
        options={locationOptions}
        value={selectedLocation}
        onChange={setSelectedLocation}
        placeholder="Select location..."
      />
    )}
  </>
)}
```

---

## 🔐 Security

### Access Control:
- ✅ Backend validates `isParentCompany` using `CompanyHelper`
- ✅ Customer companies CANNOT see company/location dropdowns
- ✅ Even if URL parameters are manipulated, backend filters by session company
- ✅ API endpoint checks authentication
- ✅ Database queries always respect company boundaries

### Data Isolation:
```php
// For Customer Companies:
$compId = session('user_comp_id');  // Always use session
$query->where('comp_id', $compId);   // Always filter

// For Parent Companies:
$compId = $request->input('comp_id') ?? session('user_comp_id');
// Can select any company OR default to session company
```

---

## 📝 Usage Guide

### For System Administrators (Parent Company):

1. **Login** to your parent company account
2. **Navigate** to Accounts → General Ledger
3. **Click** "Search/Filters" or the filter icon
4. **Select** the company you want to view data for
5. **Wait** for locations to load
6. **Select** a location within that company
7. **Choose** other filters (account, date range, etc.)
8. **Click** "Generate Report"
9. **View** the report with data from selected company/location

### For Regular Users (Customer Company):

1. **Login** to your customer company account
2. **Navigate** to Accounts → General Ledger
3. **Click** "Search/Filters" or the filter icon
4. **Note:** You will only see your own company's accounts
5. **Choose** filters (account, date range, etc.)
6. **Click** "Generate Report"
7. **View** the report with your company's data only

---

## 💡 Tips

### Dynamic Location Loading:
- Locations automatically update when company changes
- Uses AJAX for instant response
- No page reload required

### URL Parameters:
Reports remember your selection via URL:
```
/accounts/general-ledger/report?comp_id=1&location_id=2&from_date=2025-01-01
```

### Filter Persistence:
- All filters are saved in URL
- Refresh page → filters remain
- Share URL with colleagues → they see same report

---

## ⚠️ Important Notes

1. **Parent Company Status**
   - Determined by `parent_comp = 'Yes'` in companies table
   - Cached in session for performance

2. **Session Variables**
   - `user_comp_id` - Current user's company
   - `user_location_id` - Current user's location
   - These override for parent companies when they select different company

3. **Backwards Compatibility**
   - Existing reports still work without selection
   - Default to session company/location if not selected
   - No breaking changes to existing functionality

---

## 🐛 Troubleshooting

### Issue: Locations not loading
**Solution:** Check `/api/locations-by-company/{id}` endpoint is accessible

### Issue: Company dropdown empty
**Solution:** Verify companies table has `status = true` records

### Issue: Can't see filters as parent company
**Solution:** Check `parent_comp` column in companies table = 'Yes'

### Issue: Customer company sees all companies
**Solution:** Verify `CompanyHelper::isCurrentCompanyParent()` logic

---

**Implementation Date:** October 10, 2025  
**Status:** ✅ Complete and Ready for Testing  
**Applied To:** General Ledger Report  
**Next:** Currency Ledger, Trial Balance, P&L, Balance Sheet

