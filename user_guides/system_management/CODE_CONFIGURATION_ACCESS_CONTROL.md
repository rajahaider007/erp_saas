# Code Configuration - Access Control

## 🔐 Parent Company Only Feature

Code Configuration module is **RESTRICTED** to **Parent Companies Only** (`parent_comp = 'Yes'`).

Customer companies (`parent_comp = 'No'`) **CANNOT** access this feature.

---

## ✅ Access Control Implementation

### All Protected Routes:
1. **Index/List** - `/system/code-configurations`
2. **Create Form** - `/system/code-configurations/create`
3. **Store** - `POST /system/code-configurations`
4. **Show** - `/system/code-configurations/{id}`
5. **Edit Form** - `/system/code-configurations/{id}/edit`
6. **Update** - `PUT/PATCH /system/code-configurations/{id}`
7. **Delete** - `DELETE /system/code-configurations/{id}`
8. **API - Get Locations** - `GET /system/code-configurations/api/locations-by-company`

### Protection Method:
```php
// Only parent companies can access code configuration
if (!CompanyHelper::isCurrentCompanyParent()) {
    return redirect()->route('dashboard')
        ->with('error', 'Access denied. This feature is only available for parent companies.');
}
```

---

## 🎯 Business Logic

### Why Parent Company Only?

**Code Configuration** is a **centralized system-wide feature** that allows parent companies to:

1. **Define coding structures** for all customer companies
2. **Set standards** across the entire organization
3. **Control numbering formats** at parent/company/location levels
4. **Maintain consistency** in code generation

### Benefits:

✅ **Centralized Control** - Parent company manages all code structures
✅ **Standardization** - Uniform coding across all customer companies
✅ **Flexibility** - Can configure at parent, company, or location level
✅ **Scalability** - Easy to add new code types as business grows

---

## 📊 Access Levels

### Parent Company (parent_comp = 'Yes')
- ✅ **Full Access** to Code Configuration module
- ✅ Can create configurations for:
  - Parent level (applies to all companies)
  - Specific customer companies
  - Specific locations
- ✅ Can view, edit, delete all configurations
- ✅ Can manage all 50+ code types

### Customer Company (parent_comp = 'No')
- ❌ **No Access** to Code Configuration module
- ❌ Cannot view the menu
- ❌ Cannot create/edit configurations
- ❌ Redirected to dashboard if trying to access directly
- ℹ️ **Uses** the configurations set by parent company

---

## 🔄 How It Works

### Configuration Hierarchy:

```
Parent Company
    └── Code Configuration (CUST-0001, CUST-0002...)
            ├── Applies to all companies (if company_id = NULL)
            ├── OR specific to Company A (if company_id = A)
            │       └── Applies to all locations in Company A
            │       └── OR specific to Location X (if location_id = X)
            └── Customer companies USE these codes automatically
```

### Example Scenario:

**Parent Company Creates:**
```
Code Type: Customer Code
Company: ABC Corp (Customer Company)
Location: Karachi Branch
Prefix: ABC-KHI-CUST
Next Number: 1
Format: ABC-KHI-CUST-0001
```

**Result:**
- When ABC Corp creates a new customer in Karachi Branch
- System automatically generates: `ABC-KHI-CUST-0001`
- ABC Corp users don't need to configure anything
- They just use the codes as defined by parent company

---

## 🚫 Error Messages

### If Customer Company Tries to Access:

**Redirect Message:**
```
Access denied. This feature is only available for parent companies.
```

**Redirect To:** Dashboard (`/dashboard`)

---

## 🔧 Implementation Details

### Files Modified:

1. **Controller:** `app/Http/Controllers/system/CodeConfigurationController.php`
   - Added `CompanyHelper::isCurrentCompanyParent()` check
   - Protected all methods (index, create, store, edit, update, destroy, show)

2. **Helper Used:** `app/Helpers/CompanyHelper.php`
   - Method: `isCurrentCompanyParent()`
   - Checks: `session('user_comp_id')` against `companies.parent_comp`

### Security:
- ✅ Controller-level protection
- ✅ Checks on every action (GET/POST/PUT/DELETE)
- ✅ API endpoint protection
- ✅ Session-based company verification

---

## 📝 Menu Visibility

### Recommendation:

The menu item should also be conditionally shown:

**In System Menu Configuration:**
```javascript
// Only show for parent companies
if (CompanyHelper::isCurrentCompanyParent()) {
    // Show "Code Configuration" menu
}
```

This ensures customer companies don't even see the menu option in their sidebar.

---

## ✨ Summary

| Feature | Parent Company | Customer Company |
|---------|---------------|------------------|
| **View Menu** | ✅ Yes | ❌ No (Should be hidden) |
| **Access Module** | ✅ Yes | ❌ No (Redirected) |
| **Create Config** | ✅ Yes | ❌ No |
| **Edit Config** | ✅ Yes | ❌ No |
| **Delete Config** | ✅ Yes | ❌ No |
| **Use Codes** | ✅ Yes | ✅ Yes (Auto-generated) |

---

**Created:** October 2025  
**Version:** 1.0  
**Security Level:** High  
**Access Type:** Parent Company Exclusive

