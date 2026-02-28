# Chart of Account & Cash Book Reports

## Overview
This document describes the implementation and usage of the Chart of Account and Cash Book reports in the ERP system, following international accounting standards (IFRS/IAS).

---

## Chart of Account Report
- **Standard:** IAS 1, IFRS 8
- **Features:**
  - Hierarchical account structure (Levels 1-4)
  - Account balances, types, and status
  - Filtering by level, type, status, and code/name
  - IFRS-compliant presentation
- **Backend:**
  - Controller: `app/Http/Controllers/Reports/ChartOfAccountReportController.php`
  - Route: `/accounts/reports/chart-of-account` (search), `/accounts/reports/chart-of-account/report` (report)
- **Frontend:**
  - React: `resources/js/Pages/Reports/ChartOfAccount/Search.jsx`, `Report.jsx`
- **How to Use:**
  1. Navigate to Chart of Account report from the Reports menu.
  2. Select company/location (if parent company).
  3. Apply filters and view the hierarchical report.

---

## Cash Book Report
- **Standard:** IAS 7
- **Features:**
  - Tracks all cash and bank account transactions
  - Opening/closing balances, receipts, payments
  - Multi-account and single-account views
  - Date range and advanced filtering
  - IFRS-compliant cash flow tracking
- **Backend:**
  - Controller: `app/Http/Controllers/Reports/CashBookReportController.php`
  - Route: `/accounts/reports/cash-book` (search), `/accounts/reports/cash-book/report` (report)
- **Frontend:**
  - React: `resources/js/Pages/Reports/CashBook/Search.jsx`, `Report.jsx`
- **How to Use:**
  1. Navigate to Cash Book report from the Reports menu.
  2. Select company/location (if parent company).
  3. Filter by account, date, or view type.
  4. View receipts, payments, and running balances.

---

## Compliance Notes
- All reports follow double-entry accounting and IFRS/IAS requirements.
- Chart of Account structure supports segment and consolidated reporting.
- Cash Book supports reconciliation and cash flow analysis.

---

## File Locations
- Controllers: `app/Http/Controllers/Reports/`
- React Views: `resources/js/Pages/Reports/ChartOfAccount/`, `CashBook/`
- Routes: `routes/web.php`

---

For further details, see code comments and user guides in `user_guides/`.
