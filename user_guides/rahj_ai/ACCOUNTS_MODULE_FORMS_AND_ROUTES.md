# Accounts module — full detail for RAHJ AI

**Purpose:** Code-aligned reference for **Accounts** URLs, Inertia pages, configuration, vouchers, reports, and APIs.  
**Primary sources:** `routes/web.php`, `app/Http/Controllers/Accounts/*`, `app/Http/Controllers/Reports/*` (under `accounts/reports`), `app/Models/AccountConfiguration.php`, `app/Http/Traits/CheckUserPermissions.php`.  
**RAG:** `npm run rag:build` ingests `user_guides/`.

**Critical:** There are **two different General Ledger stacks** — [`/accounts/general-ledger`](#9-general-ledger-accounts-module) (Accounts module, Inertia under `Accounts/GeneralLedger/*`) vs [`/accounts/reports/general-ledger`](#16-accountsreports--reports-namespace) (Reports module, Inertia `Reports/GeneralLedger/Index`, JSON `POST .../data`). Do not conflate them in answers.

---

## Table of contents

1. [Entry & scope](#1-entry--scope)
2. [Master index: paths and Laravel route names](#2-master-index-paths-and-laravel-route-names)
3. [Dashboard & dashboard financial reports](#3-dashboard--dashboard-financial-reports)
4. [Chart of accounts](#4-chart-of-accounts)
5. [Account configuration (GL role mapping)](#5-account-configuration-gl-role-mapping)
6. [Voucher number configuration](#6-voucher-number-configuration)
7. [Vouchers — common pattern](#7-vouchers--common-pattern)
8. [Journal voucher](#8-journal-voucher)
9. [Bank / cash / opening vouchers](#9-bank--cash--opening-vouchers)
10. [General Ledger (Accounts module)](#10-general-ledger-accounts-module)
11. [Trial balance](#11-trial-balance)
12. [Balance sheet](#12-balance-sheet)
13. [Income statement](#13-income-statement)
14. [Fiscal year configuration](#14-fiscal-year-configuration)
15. [Chart of account code configuration (Level 4 codes)](#15-chart-of-account-code-configuration-level-4-codes)
16. [Currency ledger](#16-currency-ledger)
17. [`/accounts/reports/*` (Reports namespace)](#17-accountsreports--reports-namespace)
18. [Related APIs & attachments](#18-related-apis--attachments)
19. [Deeper docs in repo](#19-deeper-docs-in-repo)
20. [Rebuild corpus](#20-rebuild-corpus)

---

## 1. Entry & scope

| Item | Detail |
|------|--------|
| Module entry | `GET /accounts` → **302** to `/accounts/dashboard`. |
| Dashboard | `GET /accounts/dashboard` — Laravel name **`accounts`** (not `accounts.dashboard`). |
| Auth | `middleware('web.auth')` on all routes in this guide. |
| Company / location | Most screens resolve **`user_comp_id`** and **`user_location_id`** from the **request body/query** (Inertia) or **session**. Missing values → empty data or an **`error`** string prop (varies by controller). |
| Permissions | Controllers using `CheckUserPermissions` call `requirePermission($request, null, 'can_view'|'can_add'|'can_edit'|'can_delete')`. The trait resolves the **current route name**, looks up `menus.route`, then checks `user_rights` for that menu. If **no menu row** matches the route name (or base route derived from it), access is **allowed** (fail-open). **`super_admin`** bypasses checks. |
| Parent companies | Several reports use `CompanyHelper::isCurrentCompanyParent()`: when true, **`comp_id` / `location_id`** may be taken from **query/body** (`comp_id`, `location_id`) in addition to session, and company/location dropdowns are passed to the UI. **Fiscal year configuration** uses `comp_id` / `location_id` from input **or** session keys `user_comp_id` / `user_location_id` (see §14). |

---

## 2. Master index: paths and Laravel route names

Use this for precise linking and permission debugging.

| Prefix / path | Route name prefix or examples |
|---------------|-------------------------------|
| `/accounts/dashboard` | `accounts` |
| `/accounts/dashboard-report/{reportType}` | `accounts.dashboard-report` |
| `/accounts/chart-of-accounts` | `accounts.chart-of-accounts` |
| `/accounts/voucher-number-configuration/*` | `accounts.voucher-number-configuration.index`, `.create`, `.store`, `.show`, `.edit`, `.update` |
| `/accounts/account-configuration/*` | `accounts.account-configuration.index`, `.create`, `.store`, `.edit`, `.update`, `.bulk-destroy`, `.bulk-status` |
| `/accounts/journal-voucher/*` | `accounts.journal-voucher.index`, `.create`, `.store`, `.show`, `.edit`, `.update`, `.print-summary`, `.print-detailed`, `.post`, `.destroy`, `.export-csv`, `.export-excel`, `.export-pdf`, `.bulk-post` |
| `/accounts/bank-voucher/*` | Same shape as journal with `accounts.bank-voucher.*` |
| `/accounts/cash-voucher/*` | Same shape with `accounts.cash-voucher.*` |
| `/accounts/opening-voucher/*` | Same shape with `accounts.opening-voucher.*` |
| `/accounts/general-ledger/*` | `accounts.general-ledger.search`, `.report`, `.print`, `.export-excel`, `.export-pdf` |
| `/accounts/trial-balance/*` | `accounts.trial-balance.search`, `.report`, `.print`, `.export-excel`, `.export-pdf` |
| `/accounts/fiscal-year-configuration/*` | `accounts.fiscal-year-configuration.index`, `.create-year`, `.update-period-status` |
| `/accounts/code-configuration/*` | `accounts.code-configuration.index`, `.store`, `.update`, `.destroy`, `.bank.show`, `.bank.store`, `.cash.show`, `.cash.store`, `.requirements` |
| `/accounts/balance-sheet/*` | `accounts.balance-sheet.search`, `.report`, `.level4-details` |
| `/accounts/income-statement/*` | `accounts.income-statement.search`, `.report` |
| `/accounts/currency-ledger/*` | **`currency-ledger`**, `currency-ledger.search`, `currency-ledger.report`, `currency-ledger.print`, `currency-ledger.export-excel`, `currency-ledger.export-pdf` (names are **not** prefixed with `accounts.`). |
| `/accounts/reports/general-ledger/*` | `accounts.reports.general-ledger.index`, `.data`, `.export.pdf`, `.export.excel`, `.export.csv` |
| `/accounts/reports/chart-of-account/*` | `accounts.reports.chart-of-account.search`, `.report` |
| `/accounts/reports/cash-book/*` | `accounts.reports.cash-book.search`, `.report` |

---

## 3. Dashboard & dashboard financial reports

### 3.1 Main dashboard

| Path | Component | Controller |
|------|-----------|------------|
| `/accounts/dashboard` | `Modules/Accounts/index` | `AccountsDashboardController@index` |

**Props (success path):** `dashboardStats`, `recentTransactions`, `accountsSummary`, `financialCards`, `currencySymbol`. On failure / missing scope: `error` and reduced props.

**Important — revenue, expenses, and profit on the dashboard:**

- `getDashboardStatistics()` uses the **calendar year** of `date('Y')`: **`{$year}-01-01`** through **`{$year}-12-31`** for **`voucher_date`**, not the company fiscal year.
- **Revenue:** posted `transaction_entries` joined to `transactions`, `chart_of_accounts`, `account_configurations` where `ac.config_type` ∈ **`sales`**, **`service_income`**, **`other_income`**, and `t.status = 'Posted'`. Metric: `SUM(te.credit_amount - te.debit_amount)` (signed).
- **Expenses (profit margin):** same pattern with `ac.config_type` ∈ **`purchase`**, **`cost_of_goods_sold`**, **`salary_expense`**, **`rent_expense`**, **`utility_expense`**, **`depreciation_expense`**, **`interest_expense`**, **`other_expense`** only. Other expense `config_type` values (e.g. `amortization_expense`, `insurance_expense`, …) are **not** included in this dashboard total.
- **Outstanding invoices:** `transactions` with `status` ∈ `Draft`, `Pending`, `Approved` and `voucher_type` ∈ `Sales Invoice`, `Invoice` — sums **`total_credit`**.
- **Pending payments:** same statuses, `voucher_type` ∈ `Payment`, `Cash Payment`, `Bank Payment` — sums **`total_debit`**.
- **Recent transactions:** last 10 **Posted**, ordered by **`posted_at`** desc; display uses `voucher_type` → label/icon map (e.g. `Journal`, `Bank Payment`, `Opening`, …).
- **Accounts summary:** counts from `chart_of_accounts` for `comp_id` + `location_id` (total, transactional, grouped by `account_level`).

### 3.2 Dashboard financial cards → full-screen reports

**Route:** `GET /accounts/dashboard-report/{reportType}` — name `accounts.dashboard-report`.

**Component:** `Accounts/DashboardFinancialReport`.

**Query params:** `from_date`, `to_date` (optional). Movement slice uses **`transactions.voucher_date`** for **Posted** rows; **closing** = `chart_of_accounts.opening_balance` (if column exists, else 0) + movement in range (`base_debit_amount` / `base_credit_amount` in the movement subquery).

**Valid `reportType` values** (anything else → Inertia with `error`: **"Invalid report type requested."**):

| `reportType` | Card title (code) | `account_configurations.config_type` filter |
|--------------|-------------------|---------------------------------------------|
| `main-payable` | Main Payable | `accounts_payable` |
| `main-receivable` | Main Receivable | `accounts_receivable` |
| `current-cash` | Current Cash In Hand | `cash`, `petty_cash` |
| `all-cash-codes` | All Cash Codes | `cash`, `petty_cash`, `bank` |
| `bank-balances` | Bank Balances | `bank` |

Rows are **active** `account_configurations` joined to **transactional**, **Active** level-4 `chart_of_accounts` for the same `comp_id` / `location_id`.

---

## 4. Chart of accounts

| Path | Controller | UI |
|------|------------|-----|
| `GET /accounts/chart-of-accounts` | `ChartOfAccountsController@index` | `Accounts/ChartOfAccounts` |

Resolves `comp_id` / `location_id` from request, session, or **`tbl_users`** (fallback `session('user_id')`). Loads active **`currencies`** and all COA rows for the scope. Uses **`requirePermission(..., 'can_view')`**.

**SPA / JSON API:** `GET|POST /api/chart-of-accounts`, `PUT /api/chart-of-accounts/{id}`, `DELETE /api/chart-of-accounts/{id}` — same controller methods (tree CRUD for the React page).

**Distinction:** System module exposes **`/system/chart-of-accounts/*`** helper GETs — see `SYSTEM_MODULE_FORMS_AND_ROUTES.md`. **Primary accountant COA maintenance** is **`/accounts/chart-of-accounts`**.

---

## 5. Account configuration (GL role mapping)

**Web prefix:** `/accounts/account-configuration` — names `accounts.account-configuration.*`.

| Method | Path | Action |
|--------|------|--------|
| GET | `/` | List |
| GET | `/create` | Create form |
| POST | `/` | Store |
| GET | `/{id}/edit` | Edit form |
| PUT | `/{id}` | Update |
| POST | `/bulk-destroy` | Bulk delete |
| POST | `/bulk-status` | Bulk status |

**Inertia:** **`Accounts/AccountConfiguration/List`** and **`Accounts/AccountConfiguration/Create`** for both **create and edit** (`edit_mode`, `configuration`, `id` props on edit).

### 5.1 List filters (query)

`search`, `status`, **`config_type`**, **`account_level`**, `sort_by`, `sort_direction`, `per_page` (default **25**). Parent company users may receive **`companies` / `locations`** props for scope switching (see controller).

### 5.2 `config_type` values (authoritative)

From **`AccountConfiguration::getConfigTypes()`** — keys are stored in DB:

**Assets:** `cash`, `bank`, `petty_cash`, `accounts_receivable`, `inventory`, `fixed_asset`, `intangible_asset`, `short_term_investment`, `long_term_investment`, `prepaid_expense`, `input_tax`, `security_deposit`, `employee_advance`, `deferred_tax_asset`, `other_asset`

**Liabilities:** `accounts_payable`, `accrued_expense`, `short_term_loan`, `long_term_loan`, `tax_payable`, `unearned_revenue`, `other_liability`

**Equity:** `capital`, `drawings`, `retained_earnings`

**Income:** `sales`, `service_income`, `interest_income`, `other_income`

**Expense:** `purchase`, `cost_of_goods_sold`, `salary_expense`, `rent_expense`, `utility_expense`, `depreciation_expense`, `amortization_expense`, `interest_expense`, `insurance_expense`, `maintenance_expense`, `marketing_expense`, `travel_expense`, `office_expense`, `other_expense`

**Legacy:** `output_tax`, `investment`, `other`

### 5.3 Store / update rules

- **`config_type`:** `required|in:<all keys above>`
- **`account_id`:** required; must exist in `chart_of_accounts` for same `comp_id` / `location_id` and **`account_level` ∈ {3, 4}** (control or transactional nodes).
- **Uniqueness:** no duplicate row for same **`comp_id` + `location_id` + `account_id` + `config_type`** (store blocks duplicate; update blocks if another id would collide).
- **Update only:** `is_active` optional boolean.

### 5.4 API helpers

`DELETE /api/account-configuration/{id}`, `POST /api/account-configuration/bulk-destroy`, `POST /api/account-configuration/bulk-status`.

---

## 6. Voucher number configuration

**Web:** `/accounts/voucher-number-configuration` — `accounts.voucher-number-configuration.*`

| Path | Action |
|------|--------|
| GET `/` | List |
| GET `/create` | Create form |
| POST `/create` | **Store** (body posts to `/create`, not `/`) |
| GET `/{id}` | Show |
| GET `/{id}/edit` | Edit |
| PUT `/{id}` | Update |

**Inertia:** `Accounts/VoucherNumberConfiguration/List`, `create` (lowercase filename), `show` (lowercase).

**API:** `/api/voucher-number-configuration` — index-style `GET/POST`, `PUT/{id}`, `DELETE/{id}`, plus `POST bulk-status`, `POST bulk-destroy`, `GET export-csv`.

---

## 7. Vouchers — common pattern

Shared **route shape** per voucher type:

| Feature | Routes |
|---------|--------|
| Register | `GET /`, `GET /create`, `POST /` |
| Document | `GET /{id}`, `GET /{id}/edit`, `PUT /{id}`, `DELETE /{id}` |
| Posting | `POST /{id}/post` |
| Prints | `GET /{id}/print-summary`, `GET /{id}/print-detailed` |
| Exports | `GET /export-csv`, `/export-excel`, `/export-pdf` |
| Bulk post | `POST /bulk-post` |

**Prefixes:**

- `/accounts/journal-voucher` — `accounts.journal-voucher.*`
- `/accounts/bank-voucher` — `accounts.bank-voucher.*`
- `/accounts/cash-voucher` — `accounts.cash-voucher.*`
- `/accounts/opening-voucher` — `accounts.opening-voucher.*`

**Inertia families:**

- Journal → `Accounts/JournalVoucher/List`, `Create`, `Show`, `PrintSummary`, `PrintDetailed`
- Bank → `Accounts/BankVoucher/...`
- Cash → `Accounts/CashVoucher/...`
- Opening → `Accounts/OpeningVoucher/...`

**List filters (typical):** `search`, `status`, `from_date`, `to_date`, `sort_by` (default `id`), `sort_direction` (default `desc`), `per_page` (default `25`). Search matches `voucher_number`, `description`, `reference_number`.

---

## 8. Journal voucher

### 8.1 Permissions

`can_view` on list; `can_add` on create/store; `can_edit` / `can_delete` on mutating actions (see controller methods).

### 8.2 Data scope

List/query filters **`transactions.voucher_type = 'Journal'`** for `comp_id` + `location_id`.

**Create** loads level-**4** transactional accounts (`getTransactionalAccounts`), active currencies, preview numbering, fiscal context via **`FiscalYearHelper`**. Requires `comp_id`, `location_id`, and for store **`user_id`** (session or request) or redirect back with error.

### 8.3 Store validation (core)

| Field | Rule |
|-------|------|
| `voucher_date` | required, date |
| `description` | nullable, max 250 |
| `reference_number` | nullable, max 100 |
| `entries` | required array, **min 2** |
| `entries.*.account_id` | required; exists in `chart_of_accounts` with **`account_level = 4`** |
| `entries.*.description` | nullable, max 500 |
| `entries.*.debit_amount` / `credit_amount` | nullable numeric ≥ 0 |
| `entries.*.currency_code` | required, max 3 |
| `entries.*.exchange_rate` | required numeric, min `0.000001` |
| `entries.*.attachment_id` | nullable string |
| `attachments` | optional array of strings |

**After validation:** each line **debit XOR credit**; **base** totals must match within **0.01** (base amounts use `1/exchange_rate` per line). Voucher number **auto-generated** for type **`Journal`**. Fiscal **period** must exist; period must be **`Open`** or **adjustment** (not **Closed**). Successful **post** sets transaction status to **Posted** (and writes entries as per service layer).

### 8.4 Journal API

`GET|POST /api/journal-voucher`, `GET|PUT|DELETE /api/journal-voucher/{id}`, `POST /api/journal-voucher/{id}/post` — same controller.

---

## 9. Bank / cash / opening vouchers

Same **route surface** as §7 (list/create/show/edit/post/print/export/bulk-post).

**`transactions.voucher_type` values used in list queries:**

| Module | `voucher_type` values |
|--------|------------------------|
| Bank voucher | **`Bank Payment`**, **`Bank Receipt`** |
| Cash voucher | **`Cash Payment`**, **`Cash Receipt`** (subtype often chosen on the form as `voucher_sub_type`) |
| Opening voucher | **`Opening`** |

**User-facing hints:** bank receipt/payment → **Bank voucher**; cash receipt/payment → **Cash voucher**; opening balances → **Opening voucher** (draft → post workflow like other vouchers).

---

## 10. General Ledger (Accounts module)

**Prefix:** `/accounts/general-ledger` — `accounts.general-ledger.*`  
**Controller:** `App\Http\Controllers\Accounts\GeneralLedgerController`

| Path | Method | Name | Component |
|------|--------|------|-----------|
| `/` | GET | `search` | `Accounts/GeneralLedger/Search` |
| `/report` | GET | `report` | `Accounts/GeneralLedger/Report` |
| `/print` | GET | `print` | `Accounts/GeneralLedger/Print` |
| `/export-excel` | GET | `export-excel` | file download |
| `/export-pdf` | GET | `export-pdf` | file download |

**Search screen:** level-**4** transactional `chart_of_accounts` for dropdowns; parent companies get `companies` / `locations` lists. Uses `user_comp_id` / `user_location_id` from request or session.

**Report (`index`):** query props include `account_id`, `from_date`, `to_date`, `search`, `voucher_type`, `status` (default **`Posted`**), `min_amount`, `max_amount`, and for parent flows `comp_id` / `location_id` as applicable.

---

## 11. Trial balance

**Prefix:** `/accounts/trial-balance` — `accounts.trial-balance.*`  
**Controller:** `Accounts\TrialBalanceController`

| Path | Name | Component |
|------|------|------------|
| `/` | `search` | `Accounts/TrialBalance/Search` |
| `/report` | `report` | `Accounts/TrialBalance/Report` |
| `/print` | `print` | `Accounts/TrialBalance/Print` |
| `/export-excel` | `export-excel` | download |
| `/export-pdf` | `export-pdf` | download |

**Parent company:** search uses `comp_id` / `location_id` from query or session when `isCurrentCompanyParent()`.

---

## 12. Balance sheet

**Prefix:** `/accounts/balance-sheet` — `accounts.balance-sheet.*`  
**Controller:** `Accounts\BalanceSheetController`

| Path | Name | Component |
|------|------|------------|
| `/` | `search` | `Accounts/BalanceSheet/Search` |
| `/report` | `report` | `Accounts/BalanceSheet/Report` |
| `/level4-details` | `level4-details` | JSON/detail endpoint for level-4 lines |

**Report query params (typical):** `as_at_date` (defaults to today), optional **`comparative_date`**. Parent company: `comp_id`, `location_id` from query or session.

**Note:** No dedicated print/export routes in `web.php` for this controller — export behavior, if any, lives in the React layer or future routes.

---

## 13. Income statement

**Prefix:** `/accounts/income-statement` — `accounts.income-statement.*`  
**Controller:** `Accounts\IncomeStatementController`

| Path | Name | Component |
|------|------|------------|
| `/` | `search` | `Accounts/IncomeStatement/Search` |
| `/report` | `report` | `Accounts/IncomeStatement/Report` |

**Report query params (typical):** `from_date`, `to_date`. Parent company: `comp_id`, `location_id` from query or session.

---

## 14. Fiscal year configuration

**Prefix:** `/accounts/fiscal-year-configuration` — `accounts.fiscal-year-configuration.*`  
**Component:** `Accounts/FiscalYearConfiguration/Index`

| Path | Name | Role |
|------|------|------|
| GET `/` | `index` | List fiscal years + periods |
| POST `/create-year` | `create-year` | Create a year; body needs **`year`**; **`comp_id`** from request or **`user_comp_id`** session |
| POST `/update-period-status` | `update-period-status` | Body: **`period_id`**, **`status`** ∈ `Open`, `Locked`, `Closed`; scoped by session **`user_comp_id`** |

**Behaviour:** `index` reads **`comp_id`** from `comp_id` input or **`user_comp_id`** session (and **`location_id`** / **`user_location_id`**). If **no periods** exist for the company, controller **seeds** the **current** and **next** fiscal year via `companies.fiscal_year_start` (default **`01-01`**). Creating a year explicitly creates **12 monthly periods** (success message states this).

---

## 15. Chart of account code configuration (Level 4 codes)

**Prefix:** `/accounts/code-configuration` — `accounts.code-configuration.*`  
**Controller:** `Accounts\ChartOfAccountCodeConfigurationController`

| Path | Name | Role |
|------|------|------|
| GET `/` | `index` | Generalized Level 4 code config |
| POST `/` | `store` | Store |
| PUT `/{id}` | `update` | Update |
| DELETE `/{id}` | `destroy` | Destroy |
| GET `/bank` | `bank.show` | Bank COA setup |
| POST `/bank` | `bank.store` | Save bank mapping |
| GET `/cash` | `cash.show` | Cash COA setup |
| POST `/cash` | `cash.store` | Save cash mapping |
| GET `/requirements` | `requirements` | JSON completeness |

**Components:** `Accounts/ChartOfAccountCodeConfiguration/Index`, `BankConfiguration`, `CashConfiguration`.

**API:** `GET /api/code-configuration/level3-accounts`, `GET /api/code-configuration/level4-codes/{level3AccountId}`.

**Distinction:** **`/system/code-configurations`** = **document numbering** types (PR, PO, etc.). **`/accounts/code-configuration`** = **COA Level 4 / bank / cash** accounting setup.

---

## 16. Currency ledger

**Paths:**

| Path | Route name |
|------|------------|
| `/accounts/currency-ledger` | `currency-ledger` |
| `/accounts/currency-ledger/search` | `currency-ledger.search` |
| `/accounts/currency-ledger/report` | `currency-ledger.report` |
| `/accounts/currency-ledger/print` | `currency-ledger.print` |
| `/accounts/currency-ledger/export-excel` | `currency-ledger.export-excel` |
| `/accounts/currency-ledger/export-pdf` | `currency-ledger.export-pdf` |

**Controller:** `Accounts\CurrencyLedgerController`  
**Components:** `Accounts/CurrencyLedger/Search`, `Report`, `Print`.

**Report filters (typical):** `account_id`, `from_date`, `to_date`, `search`, **`currency_code`**, `voucher_type`, `status` (default **`Posted`**), `min_amount`, `max_amount`; parent company: `comp_id` / `location_id` + dropdown data.

---

## 17. `/accounts/reports/*` (Reports namespace)

Controllers under **`App\Http\Controllers\Reports`**. These routes are **separate** from the Accounts-module GL in §10.

### 17.1 General ledger (Reports)

| Method | Path | Name | Notes |
|--------|------|------|--------|
| GET | `/accounts/reports/general-ledger/` | `accounts.reports.general-ledger.index` | Inertia: `Reports/GeneralLedger/Index` |
| POST | `/accounts/reports/general-ledger/data` | `accounts.reports.general-ledger.data` | JSON report payload |
| POST | `/accounts/reports/general-ledger/export/pdf` | `accounts.reports.general-ledger.export.pdf` | |
| POST | `/accounts/reports/general-ledger/export/excel` | `accounts.reports.general-ledger.export.excel` | |
| POST | `/accounts/reports/general-ledger/export/csv` | `accounts.reports.general-ledger.export.csv` | |

**`getData` validated filters:** `date_from`, `date_to` (nullable dates); `account_codes`, `account_types` (nullable arrays); `currency` (string); `include_zero_balances`, `show_details` (booleans); `group_by` ∈ `account`, `type`, `period`; `sort_by` ∈ `account_code`, `account_name`, `balance`; `sort_order` ∈ `asc`, `desc`. Defaults include current month span, `currency` **`USD`**, `show_details` **true**, `group_by` **`account`**.

### 17.2 Chart of account report

| Method | Path | Name |
|--------|------|------|
| GET | `/accounts/reports/chart-of-account/` | `accounts.reports.chart-of-account.search` |
| GET | `/accounts/reports/chart-of-account/report` | `accounts.reports.chart-of-account.report` |

No export routes registered here in `web.php`.

### 17.3 Cash book report

| Method | Path | Name |
|--------|------|------|
| GET | `/accounts/reports/cash-book/` | `accounts.reports.cash-book.search` |
| GET | `/accounts/reports/cash-book/report` | `accounts.reports.cash-book.report` |

**RAHJ AI:** If the user says “GL report”, clarify **`/accounts/general-ledger`** vs **`/accounts/reports/general-ledger`**.

---

## 18. Related APIs & attachments

### 18.1 JSON / REST-style (all `web.auth`)

| Prefix | Purpose |
|--------|---------|
| `/api/chart-of-accounts` | COA CRUD for SPA |
| `/api/voucher-number-configuration` | Voucher numbering + bulk + CSV export |
| `/api/account-configuration` | Deletes + bulk destroy/status |
| `/api/code-configuration/*` | Level 3 list + Level 4 codes by parent |
| `/api/journal-voucher` | Journal voucher CRUD + post |
| `/api/exchange-rate/{fromCurrency}/{toCurrency}` | Returns `success`, `rate`, amounts via `ExchangeRateService::convert(1, …)` |

### 18.2 Voucher attachments (web.auth)

Served under **`/attachments`** (not raw `/storage/public`):

- `GET /attachments/serve/{filename}`
- `GET /attachments/download/{filename}`
- `GET /attachments/list/{voucherId}`

**Upload / usage:** `POST /api/upload-attachments` and storage usage endpoints under `/api` (see `AttachmentController` in `web.php`).

---

## 19. Deeper docs in repo

| Topic | Path |
|-------|------|
| COA 4-level model | `user_guides/accounts_module/CHART_OF_ACCOUNTS_4_LEVEL_IMPLEMENTATION_GUIDE.md` |
| Journal voucher | `user_guides/accounts_module/JOURNAL_VOUCHER_GUIDE.md` |
| Fiscal year | `user_guides/accounts_module/FISCAL_YEAR_*`, `README_FISCAL_YEAR_SYSTEM.md` |
| Financial statements | `user_guides/accounts_module/FINANCIAL_STATEMENTS_IMPLEMENTATION.md` |
| Opening voucher | `user_guides/OPENING_VOUCHER_IMPLEMENTATION.md` |
| Chart/cash docs | `user_guides/DOCUMENTATION_GUIDE_CHART_CASH_REPORTS.md` |

---

## 20. Rebuild corpus

```bash
npm run rag:build
```

---

## Retrieval keywords

accounts dashboard, calendar year revenue, profit margin expenses, bank balances report, cash in hand, main payable, main receivable, account configuration, config_type, chart of accounts, journal voucher, api journal-voucher, post voucher, bank payment bank receipt, cash payment cash receipt, opening voucher, general ledger, accounts general ledger search report, trial balance, balance sheet, income statement, fiscal year, period locked closed, level 4 account code, currency ledger, currency-ledger route name, GL export, posted transactions, double entry, user_comp_id location_id, accounts reports general ledger data, cash book report, chart of account report, voucher attachments.
