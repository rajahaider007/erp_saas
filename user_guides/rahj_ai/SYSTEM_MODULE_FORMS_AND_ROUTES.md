# System module (Admin) — full detail for RAHJ AI

**Purpose:** Deep, code-aligned reference for the **System / Admin** area so the assistant can answer *where to go*, *what fields mean*, *who can access*, and *what filters exist* — without inventing screens.  
**Sources:** `routes/web.php`, `app/Http/Controllers/system/*`, `app/Http/Controllers/LogController.php`, `resources/js/Pages/Modules/System/Dashboard.jsx`, `app/Helpers/CompanyHelper.php` (behaviour referenced from controllers).  
**RAG:** Ingested via `npm run rag:build` → `scripts/build-rag-corpus.js`.

---

## Table of contents

1. [Architecture & entry](#1-architecture--entry)
2. [System dashboard (UI tiles)](#2-system-dashboard-ui-tiles)
3. [Parent vs customer company rules](#3-parent-vs-customer-company-rules)
4. [Users](#4-users)
5. [Companies](#5-companies)
6. [Locations](#6-locations)
7. [Departments](#7-departments)
8. [Sections](#8-sections)
9. [Menus](#9-menus)
10. [Modules: two admin surfaces](#10-modules-two-admin-surfaces)
11. [Packages & package features](#11-packages--package-features)
12. [Code configurations](#12-code-configurations)
13. [Currencies](#13-currencies)
14. [Chart of Accounts (system APIs only)](#14-chart-of-accounts-system-apis-only)
15. [Attachment manager](#15-attachment-manager)
16. [Logs, recovery, security, analytics](#16-logs-recovery-security-analytics)
17. [Query parameters cheat sheet](#17-query-parameters-cheat-sheet)
18. [Rebuild corpus](#18-rebuild-corpus)

---

## 1. Architecture & entry

| Concept | Detail |
|--------|--------|
| Module record | DB `modules` row with `folder_name = 'system'` drives **[System dashboard](/system/dashboard)** content (sections/menus from `sections` / `menus`). |
| ERP picker | **[ERP modules](/erp-modules)** — user chooses which module context to work in. |
| Default redirect | **`/dashboard`** → **`/system/dashboard`** (`dashboard` → `system.dashboard`). |
| Permissions | Most system CRUD uses `CheckUserPermissions` + menu route (e.g. `can_view,/system/companies`). Sections/Menus use `requirePermission($request, null, 'can_view')` etc. with menu resolved inside trait. |
| RAHJ AI | Portal **[`/rahj-ai`](/rahj-ai)**; chat **`POST /rahj-ai/chat`**. |

---

## 2. System dashboard (UI tiles)

From **`resources/js/Pages/Modules/System/Dashboard.jsx`** — quick links (labels come from i18n `modules.system.dashboard.modules_grid.*`):

| Tile key | Href |
|----------|------|
| user_management | `/system/users` |
| company_management | `/system/companies` |
| module_management | `/system/AddModules` |
| package_management | `/system/packages` |
| location_management | `/system/locations` |
| department_management | `/system/departments` |
| currency_management | `/system/currencies` |
| menu_management | `/system/menus` |
| storage | `/system/attachment-manager` |

**Not on this grid but in routes:** `/system/sections`, `/system/package-features`, `/system/code-configurations`, `/system/logs/*`, global **`/modules`**.

---

## 3. Parent vs customer company rules

Several screens **restrict “customer” companies** (non-parent) using `CompanyHelper`:

| Area | Rule (from controllers) |
|------|-------------------------|
| **Locations** | `CompanyHelper::canManageParentSettings()` — if false, redirect to dashboard with “Only parent companies can manage locations.” |
| **Code configurations** | `CompanyHelper::isCurrentCompanyParent()` — if false, redirect to dashboard: feature only for parent companies. |
| **Companies create/update** | Customer companies: `CompanyHelper::getRestrictedFieldsForCustomer()` fields stripped on save; some validation rules relaxed (`sometimes` vs `required`) via `validationRules()`. |
| **Company list** | `CompanyHelper::applyCompanyFilter()` — parent sees broader company set; customer typically scoped. |

**RAHJ AI:** If user is “child” company admin and a screen says access denied, explain they need **parent / SaaS admin** rights, not a different URL.

---

## 4. Users

**Routes:** `system.users.*` under `/system/users`.

### 4.1 Pages (Inertia)

| Action | Path | Component (from controller) |
|--------|------|-------------------------------|
| List | `/system/users` | `system/Users/index` |
| Create | `/system/users/create` | `system/Users/create` |
| View | `/system/users/{user}` | `system/Users/show` |
| Edit | `/system/users/{user}/edit` | `system/Users/create` (same form, edit mode) |
| **Rights** | `/system/users/{user}/rights` | `system/Users/UserRights` |
| Update rights | `PUT /system/users/{user}/rights` | — |

### 4.2 List filters (query string)

Supported on index: `search`, `company_id`, `location_id`, `department_id`, `role`, `status`, `sort_by`, `sort_direction`, `per_page` (default **25**).

Search matches: `fname`, `mname`, `lname`, `email`, `loginid`, `phone`.

### 4.3 Create / update validation (server)

**Create (`store`):**

| Field | Rules |
|-------|--------|
| fname | required, string, max 100 |
| mname | nullable, string, max 100 |
| lname | required, string, max 100 |
| email | required, email, max 255, unique `tbl_users.email` |
| phone | nullable, max 20 |
| loginid | required, max 255, unique `tbl_users.loginid` |
| pincode | nullable, max 10 |
| comp_id / location_id / dept_id | nullable, exists on respective tables |
| password | required, min 8, `confirmed` |
| status | required, in: `active`, `inactive`, `suspended`, `pending` |
| timezone | nullable, max 50 (default **UTC**) |
| language | nullable, max 10 (default **en**) |
| currency | nullable, max 10 (default **USD**) |
| theme | nullable, in: `light`, `dark`, `system` (default **dark**) |

**Update (`update`):** same except `password` nullable; email/loginid unique ignores current user id.

### 4.4 User rights screen

- **Data:** Menus come from **`$user->company->getAvailableMenusForRights()`** — so rights are limited to what the **company’s package** exposes.
- Each row includes: `menu_name`, `route`, `icon`, `section_name`, `module_name`, `folder_name`.
- **Save:** `updateRights` reads **`user_rights`** array from request and calls `updateUserRights` (per-menu flags; implementation in controller/trait).
- **RAHJ AI:** “User ko X screen ki permission do” → open **[Users](/system/users)** → user → **[Rights](/system/users/{id}/rights)**; toggles are package-scoped.

### 4.5 JSON helpers

- `GET /system/users/locations/by-company/{company}`
- `GET /system/users/departments/by-location/{location}`

Used by SPA cascades (company → location → department).

---

## 5. Companies

**Routes:** `system.companies.*`, base **`/system/companies`**, middleware **`permission:can_* ,/system/companies`**.

### 5.1 Pages

| Action | Path | Component |
|--------|------|-----------|
| List | `/system/companies` | `system/Companies/List` |
| Create | `/system/companies/create` | `system/Companies/Create` |
| View | `/system/companies/{company}` | `system/Companies/Show` |
| Edit | `/system/companies/{company}/edit` | `system/Companies/Create` (edit mode) |

Create/Edit receive: `packages` (active packages), `isParentCompany`, `restrictedFields` for customer UX.

### 5.2 List filters

`search`, `status`, `country`, `sort_by`, `sort_direction`, `per_page` (default **25**). Search: `company_name`, `company_code`, `email`, `registration_number`.

Props: `isParentCompany` from `CompanyHelper::isCurrentCompanyParent()`.

### 5.3 Store / update validation (high level)

From `CompanyController::validationRules()`:

- **Required (typical):** `company_name`, `registration_number`, `company_type` (enum: `private_limited`, `public_limited`, `partnership`, `sole_proprietorship`, `llc`), `email` (unique), `address_line_1`, `city`, `country`, `status` (boolean).
- **Uniques:** `company_code`, `tax_id` (nullable but unique when set).
- **Parent-only (when `isCurrentCompanyParent()`):** `license_start_date`, `license_end_date` (after start), `package_id` required, etc.; customer gets `sometimes` on restricted fields.
- **Logo:** optional image jpeg/png/jpg/gif, **max 10MB**, stored under `companies/logos` on `public` disk.
- **Other:** bank fields, branding colours, `attachment_storage_limit_mb` (1–10000), `features` / `settings` arrays, fiscal year string, revenue/employee optional numerics.

**Auto behaviour:** If `company_code` empty → generated from name prefix + random digits. Parent: default license dates if missing. Audit: `AuditLogService::logCompany` on create.

---

## 6. Locations

**Base:** `/system/locations`.

### 6.1 Access

- **Permission** checks + **`CompanyHelper::canManageParentSettings()`** — non-parent redirected with access denied.

### 6.2 Validation (`rules()`)

| Field | Rule |
|-------|------|
| company_id | required, exists companies |
| location_name | required, 2–100 chars, regex alphanumerics/spaces/`-_ .`, unique per `company_id` |
| address, city, state, country | optional strings (max as in rules) |
| postal_code | optional, max 20 |
| phone | optional, max 20 |
| email | optional, email, max 100 |
| status | optional boolean |
| sort_order | optional int 0–9999 |

### 6.3 List filters

`search` (name, address, city, or related company name), `company_id`, `status`, `per_page` (capped **100**).

### 6.4 API

`GET /system/locations/by-company/{company}` — locations for dropdowns.

---

## 7. Departments

**Base:** `/system/departments`.

### 7.1 Validation

| Field | Rule |
|-------|------|
| company_id | required |
| location_id | required |
| department_name | required, 2–100, same regex as location name, **unique per location_id** |
| description | optional, max 500 |
| manager_name / manager_email / manager_phone | optional |
| status, sort_order | optional |

### 7.2 List filters

`search` (department name, manager, or related company/location), `company_id`, `location_id`, `status`, `per_page` (max **100**).

### 7.3 API

`GET /system/departments/by-location/{location}`.

---

## 8. Sections

**Base:** `/system/sections`, names `system.sections.*`.

### 8.1 Validation

| Field | Rule |
|-------|------|
| module_id | required, exists modules |
| section_name | required, 2–100, regex `^[a-zA-Z0-9\s\-\_\.]+$`, **unique per module_id** |
| status | optional boolean (default true) |
| sort_order | optional 0–9999; if 0/unset on create → auto max+1 within module |

### 8.2 List filters

`module_id`, `search` (section name), `status`, `per_page` (max **100**).

### 8.3 Bulk / export

- `POST .../bulk-status`, `POST .../bulk-destroy`
- `GET .../export-csv`
- `GET .../by-module/{module}` (API style list)

**Page:** `system/Sections/List`, add `system/Sections/add`, edit `system/Sections/edit`.

---

## 9. Menus

**Base:** `/system/menus`, names `system.menus.*`.

### 9.1 Validation

| Field | Rule |
|-------|------|
| module_id | required |
| section_id | required, exists sections |
| menu_name | required, 2–100, same regex as section name, **unique per section_id** |
| route | nullable, max 255 (this is the **sidebar URL path**, e.g. `/system/users`) |
| icon | nullable, max 100 |
| status | optional boolean |
| sort_order | optional; if 0/unset → auto max+1 within section |

### 9.2 List filters

`module_id`, `section_id`, `search` (menu name), `status`, `per_page` (max **100**).

### 9.3 Pages

`system/Menus/List`, `system/Menus/add`, `system/Menus/edit`.

**RAHJ AI:** New screen not showing in sidebar → admin must add **Menu** with correct `route` under right **Section/Module**, and grant **user rights** for that menu.

---

## 10. Modules: two admin surfaces

| Surface | Entry | Purpose |
|---------|--------|---------|
| **System “Add modules”** | `/system/AddModules` | Legacy-style module list; `system.add_modules`, add `/system/AddModules/add`, show/edit `{module}`. |
| **Global modules resource** | `/modules` | Full CRUD + export + sort + APIs (`modules.current-module-data`, `modules.active.list`, etc.). |

**RAHJ AI:** “Module enable / package feature” may involve **packages** + **menus/sections**, not only `/modules`.

---

## 11. Packages & package features

| Area | Base path | Notes |
|------|-----------|--------|
| Packages | `/system/packages` | CRUD, bulk status/destroy, `update-sort-order`, export CSV. |
| Package features | `/system/package-features` | CRUD, bulk destroy on features. |

Packages drive **company assignment** (`package_id` on company) and **which menus appear in user rights** (`getAvailableMenusForRights`).

---

## 12. Code configurations

**Base:** `/system/code-configurations`, route name prefix **`code-configurations.*`**.

### 12.1 Access

- **Only parent companies** (`CompanyHelper::isCurrentCompanyParent()`). Others redirected to dashboard with error.

### 12.2 Purpose

Defines **auto / structured coding** per company & location, linked to **Chart of Accounts** levels (relations: `level2Account`, `level3Account` on model). Used across ERP document types (sales, purchase, inventory, finance, HR, etc.).

### 12.3 List filters

`company_id`, `location_id`, `code_type`, `is_active`, `search` (on `code_type` text), paginate **15**.

### 12.4 Code type values (from `CodeConfigurationController::getCodeTypes()`)

Examples the UI can assign (value → label):

- **Customer & sales:** `customer`, `lead`, `sales_order`, `sales_invoice`, `sales_return`, `quotation`
- **Supplier & purchase:** `vendor`, `supplier`, `purchase_order`, `purchase_invoice`, `purchase_return`, `grn`
- **Inventory:** `product`, `raw_material`, `finished_goods`, `batch`, `serial`, `bin_location`, `warehouse`
- **Financial:** `bank`, `cash`, `payment_voucher`, `receipt_voucher`, `journal_voucher`, `expense`, `budget`, `cost_center`
- **HR:** `employee`, `department`, `designation`, `attendance`, `payroll`, `leave`
- **Assets / projects / manufacturing / other:** `asset`, `fixed_asset`, `asset_maintenance`, `project`, `job`, `task`, `work_order`, `bom`, `production_order`, `job_card`, `quality_inspection`, `contract`, `delivery_note`, `shipment`, `complaint`, `warranty`, `barcode`

**Authoritative list:** `app/Http/Controllers/system/CodeConfigurationController.php` method `getCodeTypes()`.

### 12.5 API

`GET /system/code-configurations/api/locations-by-company` — for dependent dropdowns.

---

## 13. Currencies

**Base:** `/system/currencies`, names `system.currencies.*`.

**Notable paths:**

| Path | Role |
|------|------|
| `/system/currencies` | List |
| `/system/currencies/create` | Create |
| `/system/currencies/converter` | Conversion UI |
| `/system/currencies/{currency}` | Show |
| `/system/currencies/{currency}/edit` | Edit |
| `/system/currencies/{currency}/history` | Rate history page |
| `/system/currencies/{currency}/history-data` | History JSON for charts/tables |

**POST actions:** toggle status, set as base, bulk update rates, update from API, convert.  
**GET APIs:** `api/active`, `api/all`.

---

## 14. Chart of Accounts (system APIs only)

Prefix **`/system/chart-of-accounts`** — **helper endpoints for dropdowns**, not the main COA tree:

- `GET .../level2-accounts`
- `GET .../level3-accounts`
- `GET .../accounts-by-company-location`

**End-user COA browser:** [`/accounts/chart-of-accounts`](/accounts/chart-of-accounts).

---

## 15. Attachment manager

| UI | `/system/attachment-manager` |
| REST (used by SPA) | `/api/attachment-manager/*` — list, upload, folders, delete, rename, file read/save, storage usage |

**RAHJ AI:** Guide users to **Attachment manager** for file browser UI; API paths are internal to the frontend.

---

## 16. Logs, recovery, security, analytics

All under **`/system/logs`**, Inertia under `Logs/*`.

### 16.1 Activity logs — `/system/logs/activity`

- **Table:** `tbl_audit_logs` joined with `tbl_users` for display name/email.
- **Company scope:** `al.company_id` = selected/session company (`comp_id` query or `user_comp_id`).
- **Default date range:** last **7 days** through today if not supplied.
- **Filters:** `search`, `module`, `action`, `user_id`, `from_date`, `to_date`, `per_page` (default 25).
- **Parent companies:** extra company/location dropdowns in UI (from controller props).

**Detail:** `/system/logs/activity/{id}/details` — single log row (still scoped to session company).

### 16.2 Timeline — `/system/logs/timeline`

Query params: **`table`**, **`record_id`** (required). Shows chronological audit rows for that record. Scoped to `session('user_comp_id')`.

### 16.3 Deleted items — `/system/logs/deleted-items`

Recovery / recycle-bin style flows; **restore:** `POST /system/logs/deleted-items/{id}/restore` (optional `notes`); **purge:** `POST .../purge` via `purgeRecovery` (permanent).

### 16.4 Security logs — `/system/logs/security`

- **Table:** `tbl_security_logs` + user join; filter by `event_type`, `risk_level`, date range, pagination.
- **Company filter:** via `u.comp_id` = session/request company.

### 16.5 Reports & analytics — `/system/logs/reports` ⚠ naming

This is **audit/security analytics**, **not** financial statements.

**Data (from `LogController::reports`):**

- Date range default: last 7 days → today; scoped to **`session('user_comp_id')`**.
- **Activity:** counts by `module_name` + `action_type`; totals for today / this week / this month; top **10** users by action count.
- **Security stats:** failed logins (`LOGIN_FAILED`), high risk, `PERMISSION_DENIED`, `CRITICAL` risk in range.
- **Deleted items:** count of rows in recovery table with status `DELETED` (via join filter).

**Page:** `Logs/Reports`.

### 16.6 Export — `/system/logs/export`

Exports log-related data (formats handled in controller — used for compliance / downloads).

---

## 17. Query parameters cheat sheet

| Screen | Common query keys |
|--------|-------------------|
| Users index | search, company_id, location_id, department_id, role, status, sort_by, sort_direction, per_page |
| Companies index | search, status, country, sort_by, sort_direction, per_page |
| Locations index | search, company_id, status, per_page |
| Departments index | search, company_id, location_id, status, per_page |
| Sections index | module_id, search, status, per_page |
| Menus index | module_id, section_id, search, status, per_page |
| Code configurations | company_id, location_id, code_type, is_active, search |
| Activity logs | search, module, action, user_id, from_date, to_date, per_page, comp_id (parent) |
| Security logs | event_type, risk_level, from_date, to_date, per_page, comp_id, location_id |
| Log reports | from_date, to_date |

---

## 18. Rebuild corpus

After editing this file:

```bash
npm run rag:build
```

---

## Retrieval keywords (mixed language)

system dashboard, admin panel, users, loginid, email, rights, package menus, company register, registration number, parent company, customer company, location address, department manager, section, menu route, sidebar, AddModules, modules CRUD, package features, code configuration, code type, bank cash journal voucher code, currency converter, rate history, attachment manager, activity log, audit, timeline, deleted items restore, purge recycle, security log, permission denied, log reports analytics, export logs, super admin, access denied parent only.
