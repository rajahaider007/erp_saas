# Inventory module — full detail for RAHJ AI

**Purpose:** Code-aligned reference for **Inventory** URLs, Inertia pages, procurement documents, master data, numbering, and reports.  
**Primary sources:** `routes/web.php`, `app/Http/Controllers/Inventory/*`, `docs/INVENTORY_REPORTING_STANDARDS.md`.  
**RAG:** `npm run rag:build` ingests `user_guides/`.

**Related:** Vendor/customer navigation hints live in `user_guides/rahj_ai/ERP_NAVIGATION_ROUTES.md`.

---

## Table of contents

1. [Scope & auth](#1-scope--auth)
2. [Master index: paths and Laravel route names](#2-master-index-paths-and-laravel-route-names)
3. [Coding masters (item hierarchy, UOM)](#3-coding-masters-item-hierarchy-uom)
4. [Item master](#4-item-master)
5. [Dynamic master data (`/inventory/master-data/{master}`)](#5-dynamic-master-data-inventorymaster-datamaster)
6. [Procurement documents](#6-procurement-documents)
7. [GRN supplier invoice](#7-grn-supplier-invoice)
8. [Inventory document number configuration](#8-inventory-document-number-configuration)
9. [Reports (`/inventory/reports`)](#9-reports-inventoryreports)
10. [Purchase cycle data model (tables)](#10-purchase-cycle-data-model-tables)
11. [Deeper docs in repo](#11-deeper-docs-in-repo)
12. [Rebuild corpus](#12-rebuild-corpus)

---

## 1. Scope & auth

| Item | Detail |
|------|--------|
| Auth | All routes below use **`middleware('web.auth')`**. |
| Company / location | Controllers read **`user_comp_id`**, **`user_location_id`**, and often **`comp_id`**, **`location_id`** from **request** or **session** (order differs by controller — see §9 for reporting resolution order). Missing context → empty lists or an **`error`** prop / JSON **422**. |
| Menu permissions | **`CheckUserPermissions`** is used on **Goods Receipt Note**, **GRN Supplier Invoice**, and **Inventory Reporting** actions (`can_view`, `can_add`, `can_edit`, `can_delete` as implemented per method). **Purchase Requisition**, **Purchase Order**, **Item Master**, **coding controllers**, and **MasterDataController** do **not** use that trait in code — they rely on **`web.auth`** only unless you add checks later. |
| GRN menu quirk | The permission trait treats routes whose name starts with **`inventory.goods-receipt-note.`** specially (shared menu rows). |

---

## 2. Master index: paths and Laravel route names

| Area | Prefix | Route name pattern / examples |
|------|--------|-------------------------------|
| Item category coding | `/inventory/item-category-coding` | `inventory.item-category-coding.list`, `.create`, `.store`, `.edit`, `.update`, `.destroy` |
| Item class coding | `/inventory/item-class-coding` | Same shape + `inventory.item-class-coding.bulk-destroy` |
| Item group coding | `/inventory/item-group-coding` | Same shape + `.bulk-destroy` |
| UOM master (dedicated) | `/inventory/uom-master` | `inventory.uom-master.list`, `.create`, `.store`, `.edit`, `.update`, `.destroy`, `.bulk-destroy` |
| UOM conversion (dedicated) | `/inventory/uom-conversion` | `inventory.uom-conversion.*` (same CRUD + bulk-destroy) |
| Purchase requisition | `/inventory/purchase-requisition` | `inventory.purchase-requisition.index`, `.create`, `.store`, `.edit`, `.update`, `.destroy`, `.approve`, `.bulk-approve`, `.invoice` |
| Purchase order | `/inventory/purchase-order` | `inventory.purchase-order.*` + **`prefill-pr`** |
| GRN supplier invoice | `/inventory/grn-supplier-invoice` | `inventory.grn-supplier-invoice.*` + **`eligible-grns`**, **`preview-lines`**, `.invoice` (variants include **voucher**) |
| Goods receipt note | `/inventory/goods-receipt-note` | `inventory.goods-receipt-note.*` + **`prefill-po`**, `.approve`, `.invoice` |
| Document number configuration | `/inventory/document-number-configuration` | `inventory.document-number-configuration.index`, `.create`, `.store`, `.show`, `.edit`, `.update`, `.destroy` |
| Reports hub | `/inventory/reports` | See §9 |
| Item master | `/inventory/item-master` | `inventory.item-master.list`, `.create`, `.store`, `.edit`, `.update`, `.destroy`, `.bulk-destroy`, `.export-csv` |
| Master data | `/inventory/master-data` | `inventory.master-data.next-level4-preview`, `.list`, `.create`, `.store`, `.edit`, `.update`, `.destroy` (see §5) |

**Note:** List screens for coding forms use the action name **`list`**, not `index`.

---

## 3. Coding masters (item hierarchy, UOM)

Standard CRUD: `GET /` (list), `GET /create`, `POST /`, `GET /{id}/edit`, `PUT /{id}/delete`, `DELETE /{id}`. Bulk destroy where registered.

| Path prefix | Controller | Inertia pages |
|-------------|------------|---------------|
| `/inventory/item-category-coding` | `ItemCategoryCodingController` | `Inventory/ItemCategoryCoding/List`, `Create` |
| `/inventory/item-class-coding` | `ItemClassCodingController` | `Inventory/ItemClassCoding/List`, `Create` |
| `/inventory/item-group-coding` | `ItemGroupCodingController` | `Inventory/ItemGroupCoding/List`, `Create` |
| `/inventory/uom-master` | `UomMasterController` | `Inventory/UomMaster/List`, `Create` |
| `/inventory/uom-conversion` | `UomConversionController` | `Inventory/UomConversion/List`, `Create` |

**Overlap with master data:** `MasterDataController` also defines **`uom-coding`** and **`uom-conversion`** keys (§5) targeting the same underlying models/tables. Prefer **one** UX path per deployment to avoid user confusion; both are valid routes in code.

---

## 4. Item master

**Prefix:** `/inventory/item-master` — `inventory.item-master.*`

| Method | Path | Name | UI |
|--------|------|------|-----|
| GET | `/` | `list` | `Inventory/ItemMaster/List` |
| GET | `/create` | `create` | `Inventory/ItemMaster/Create` |
| POST | `/` | `store` | — |
| GET | `/{id}/edit` | `edit` | `Inventory/ItemMaster/Create` (edit mode) |
| PUT | `/{id}` | `update` | — |
| DELETE | `/{id}` | `destroy` | — |
| POST | `/bulk-destroy` | `bulk-destroy` | — |
| GET | `/export-csv` | `export-csv` | download |

---

## 5. Dynamic master data (`/inventory/master-data/{master}`)

**Controller:** `MasterDataController`  
**Inertia:** `Inventory/MasterData/List` (list), **`Inventory/MasterData/Create`** for both create and edit (`edit_mode`, `record`).

| Method | Path | Route name |
|--------|------|------------|
| GET | `/inventory/master-data/next-level4-preview` | `inventory.master-data.next-level4-preview` |
| GET | `/inventory/master-data/{master}` | `inventory.master-data.list` |
| GET | `/inventory/master-data/{master}/create` | `inventory.master-data.create` |
| POST | `/inventory/master-data/{master}` | `inventory.master-data.store` |
| GET | `/inventory/master-data/{master}/{id}/edit` | `inventory.master-data.edit` |
| PUT | `/inventory/master-data/{master}/{id}` | `inventory.master-data.update` |
| DELETE | `/inventory/master-data/{master}/{id}` | `inventory.master-data.destroy` |

### 5.1 Supported `{master}` keys (from `config()`)

These are the **only** keys with a non-null config; any other slug → “Invalid master selected.”

| `{master}` key | Title (UI) |
|----------------|------------|
| `uom-coding` | UOM Coding |
| `uom-conversion` | UOM Conversion Configuration |
| `tax-category` | Tax Category Configuration |
| `vendor-master` | Vendor Master |
| `zone-bin-master` | Zone / Bin Configuration |
| `country-master` | Country Master |
| `brand-master` | Brand Master |
| `reason-code-master` | Reason Code Master |
| `temperature-class-master` | Temperature Class Master |
| `compliance-code-master` | Compliance Code Master |
| `transporter-master` | Transporter Master |
| `customer-master` | Customer Master |
| `package-type-master` | Package Type Configuration |
| `barcode-type-master` | Barcode Type Configuration |

### 5.2 Company / location resolution

`companyId()` / `locationId()` use, in order: **`comp_id`** / **`location_id`** from request, then session **`comp_id`** / **`location_id`**, then **`user_comp_id`** / **`user_location_id`**.

### 5.3 Party masters → Chart of accounts (Level 4)

**`vendor-master`**, **`customer-master`**, **`transporter-master`** create/update **Level 4 `chart_of_accounts`** rows under a chosen **Level 3** parent, with `account_configurations` mapping:

| Master | `config_type` used for Level 3 picker |
|--------|--------------------------------------|
| `vendor-master` | `accounts_payable` |
| `customer-master` | `accounts_receivable` |
| `transporter-master` | `accrued_expense`, `accounts_payable` |

**`country-master`** is **global** (no `company_id` on store).  
**List pagination:** **15** per page; filters: **`search`**, **`is_active`**, **`sort_by`**, **`sort_order`**.

### 5.4 Menu / permissions

`inventory.master-data.*` uses **one** route name for all masters; `CheckUserPermissions` resolves menus by **list path** `/inventory/master-data/{master}` when the trait’s special case applies (see trait).

---

## 6. Procurement documents

### 6.1 Purchase requisition (PR)

**Prefix:** `/inventory/purchase-requisition` — `inventory.purchase-requisition.*`

| Path | Name | UI |
|------|------|-----|
| `/` | `index` | `Inventory/PurchaseRequisition/List` |
| `/create` | `create` | `Inventory/PurchaseRequisition/Create` |
| POST `/` | `store` | — |
| `/{id}/edit` | `edit` | `Create` |
| PUT `/{id}` | `update` | — |
| DELETE `/{id}` | `destroy` | — |
| POST `/{id}/approve` | `approve` | — |
| POST `/bulk-approve` | `bulk-approve` | — |
| `GET /{id}/invoice/{variant}` | `invoice` | `variant` = **`summary`** \| **`detailed`** |

### 6.2 Purchase order (PO)

**Prefix:** `/inventory/purchase-order` — `inventory.purchase-order.*`

| Path | Name | Notes |
|------|------|--------|
| `/` | `index` | `Inventory/PurchaseOrder/List` |
| `/create` | `create` | `Inventory/PurchaseOrder/Create` |
| **`GET /prefill-pr/{id}`** | `prefill-pr` | Seed PO from PR |
| POST `/` | `store` | — |
| `/{id}/edit` | `edit` | — |
| PUT `/{id}` | `update` | — |
| DELETE `/{id}` | `destroy` | — |
| POST `/{id}/approve` | `approve` | — |
| POST `/bulk-approve` | `bulk-approve` | — |
| `GET /{id}/invoice/{variant}` | `invoice` | **`summary`** \| **`detailed`** |

### 6.3 Goods receipt note (GRN)

**Prefix:** `/inventory/goods-receipt-note` — `inventory.goods-receipt-note.*`  
**Permissions:** `CheckUserPermissions` on index/create/store/edit/approve/destroy/show-style actions.

| Path | Name | UI |
|------|------|-----|
| `/` | `index` | `Inventory/GoodsReceiptNote/List` |
| `/create` | `create` | `Inventory/GoodsReceiptNote/Create` |
| **`GET /prefill-po/{id}`** | `prefill-po` | — |
| POST `/` | `store` | — |
| `/{id}/edit` | `edit` | `Create` |
| PUT `/{id}` | `update` | — |
| POST `/{id}/approve` | `approve` | — |
| DELETE `/{id}` | `destroy` | — |
| `GET /{id}/invoice/{variant}` | `invoice` | **`summary`** \| **`detailed`** |

---

## 7. GRN supplier invoice

**Prefix:** `/inventory/grn-supplier-invoice` — `inventory.grn-supplier-invoice.*`  
**Purpose:** Vendor invoice document **linked to one or more GRNs**; **`POST /{id}/post`** drives financial posting when implemented.  
**Permissions:** `CheckUserPermissions` throughout.

| Path | Name | UI / behaviour |
|------|------|----------------|
| `/` | `index` | `Inventory/GrnSupplierInvoice/List` |
| `/create` | `create` | `Inventory/GrnSupplierInvoice/Create` |
| POST `/` | `store` | — |
| **`GET /eligible-grns`** | `eligible-grns` | JSON/helper for selectable GRNs |
| **`GET /preview-lines`** | `preview-lines` | Line preview |
| `/{id}/edit` | `edit` | `Create` |
| PUT `/{id}` | `update` | — |
| DELETE `/{id}` | `destroy` | — |
| **`POST /{id}/post`** | `post` | Posting |
| `GET /{id}/invoice/{variant}` | `invoice` | **`summary`** \| **`detailed`** \| **`voucher`** |

**RAHJ AI:** Do not use this screen to **register** a new vendor — use **Vendor master** (`/inventory/master-data/vendor-master`). See `ERP_NAVIGATION_ROUTES.md`.

---

## 8. Inventory document number configuration

**Prefix:** `/inventory/document-number-configuration` — `inventory.document-number-configuration.*`

| Path | Name | UI |
|------|------|-----|
| GET `/` | `index` | `Inventory/DocumentNumberConfiguration/List` |
| GET `/create` | `create` | `Inventory/DocumentNumberConfiguration/create` (lowercase) |
| **POST `/create`** | `store` | Body posts to **`/create`** (same pattern as accounts voucher numbering) |
| GET `/{id}` | `show` | `.../show` |
| GET `/{id}/edit` | `edit` | — |
| PUT `/{id}` | `update` | — |
| DELETE `/{id}` | `destroy` | — |

**Distinction:** **`/system/code-configurations`** (system module) is separate from this **inventory** numbering screen.

---

## 9. Reports (`/inventory/reports`)

**Controller:** `InventoryReportingController`  
**Standards:** `docs/INVENTORY_REPORTING_STANDARDS.md`  
**Permissions:** `requirePermission(..., 'can_view')` on listed actions.

### 9.1 Company / location resolution (reporting)

`resolvedCompId` tries in order: **`session user_comp_id`**, **`user_comp_id`** input, **`auth user comp_id`**, **`comp_id`** input, **`session comp_id`**.  
`resolvedLocationId` tries: **`session user_location_id`**, **`user_location_id`**, **`auth user location_id`**, **`location_id`**, **`session location_id`**.

### 9.2 Row caps (code constants)

| Report | Export (CSV/Excel) max rows | PDF max rows | Print max rows |
|--------|----------------------------|--------------|----------------|
| Goods receipt register | **25 000** | **3 000** | **10 000** |
| Purchase order lines | **25 000** | **3 000** | **10 000** |

Exports add a **truncation note** row when the cap is hit.

### 9.3 Hub

| Method | Path | Name | Component |
|--------|------|------|-----------|
| GET | `/inventory/reports/` | `inventory.reports.index` | `Inventory/Reports/Index` |

### 9.4 Goods receipt register (line-level)

| Method | Path | Name | Component / notes |
|--------|------|------|-------------------|
| GET | `/goods-receipt-register` | `goods-receipt-register` | `GoodsReceiptRegisterSearch` |
| GET | `/goods-receipt-register/report` | `goods-receipt-register.report` | `GoodsReceiptRegisterReport` |
| POST | `/goods-receipt-register/data` | `goods-receipt-register.data` | JSON for grid |
| GET | `/goods-receipt-register/export/csv` | `goods-receipt-register.export.csv` | streamed CSV (UTF‑8 BOM) |
| GET | `/goods-receipt-register/export/excel` | `goods-receipt-register.export.excel` | streamed XLS |
| GET | `/goods-receipt-register/export/pdf` | `goods-receipt-register.export.pdf` | Dompdf |
| GET | `/goods-receipt-register/print` | `goods-receipt-register.print` | print view |

**Query / API filters** (validated):

| Key | Rules / default |
|-----|------------------|
| `date_from`, `date_to` | nullable date |
| `date_basis` | `receipt` (default) or `posting` — chooses `goods_receipt_notes.receipt_date` vs `posting_date` |
| `vendor_id` | nullable integer |
| `status` | string, default **`all`** |
| `posted_only` | boolean, default false |
| `search` | max 255; matches GRN #, PO #, item code/name, line description |
| `sort_by` | `receipt_date`, `grn_number`, `vendor`, `item_code`, `line_amount` |
| `sort_order` | `asc` / `desc` |
| `per_page`, `page` | API only: `per_page` 10–200, default 50 |

**Data joins (summary):** `goods_receipt_note_lines` → `goods_receipt_notes` → PO, item, vendor (`chart_of_accounts` party), UOM, currency.

### 9.5 Purchase order lines register

| Method | Path | Name | Component |
|--------|------|------|-----------|
| GET | `/purchase-order-lines` | `purchase-order-lines` | `PurchaseOrderLinesSearch` |
| GET | `/purchase-order-lines/report` | `purchase-order-lines.report` | `PurchaseOrderLinesReport` |
| POST | `/purchase-order-lines/data` | `purchase-order-lines.data` | JSON |
| GET | `/purchase-order-lines/export/csv` | `purchase-order-lines.export.csv` | |
| GET | `/purchase-order-lines/export/excel` | `purchase-order-lines.export.excel` | |
| GET | `/purchase-order-lines/export/pdf` | `purchase-order-lines.export.pdf` | |
| GET | `/purchase-order-lines/print` | `purchase-order-lines.print` | |

**Filters:**

| Key | Rules / default |
|-----|------------------|
| `date_from`, `date_to` | nullable date (PO date) |
| `vendor_id` | nullable integer |
| `status` | default **`all`** |
| `open_lines_only` | boolean |
| `search` | max 255 |
| `sort_by` | `po_date`, `po_number`, `vendor`, `item_code`, `balance_qty` |
| `sort_order` | `asc` / `desc` |
| `per_page`, `page` | API: 10–200, default 50 |

---

## 10. Purchase cycle data model (tables)

| Document | Primary tables |
|----------|----------------|
| PR | `purchase_requisitions`, `purchase_requisition_lines` |
| PO | `purchase_orders`, `purchase_order_lines` |
| GRN | `goods_receipt_notes`, `goods_receipt_note_lines` |
| GRN supplier invoice | `grn_supplier_invoices`, pivot `grn_supplier_invoice_grns`, taxes `grn_supplier_invoice_line_taxes` |
| Posted link | `posted_transaction_id` on GRN / invoice → accounts `transactions` |

**Three-way match:** PO line ↔ GRN line ↔ Supplier invoice line (quantities and amounts). GRN lines carry `purchase_order_line_id`, `po_ordered_qty`, `snapshot_previously_received_qty`, receipt/accept/reject quantities.

---

## 11. Deeper docs in repo

| Topic | Path |
|-------|------|
| Reporting standards & catalogue | `docs/INVENTORY_REPORTING_STANDARDS.md` |
| Blueprints | `user_guides/inventory_system/INVENTORY_SYSTEM_FINAL_BLUEPRINT.md`, `INVENTORY_MODULE_INTERNATIONAL_STANDARDS_BLUEPRINT.md` |
| Forms / fields | `user_guides/inventory_system/forms/INVENTORY_IMPLEMENTED_FORMS_USER_GUIDES.md`, `PROCUREMENT_FORMS_USER_GUIDE_EN.md` |

---

## 12. Rebuild corpus

```bash
npm run rag:build
```

---

## Retrieval keywords

inventory item category class group coding, uom master uom conversion duplicate master-data, item master export csv, vendor master customer transporter chart of accounts level 4, tax category zone bin country brand reason code, purchase requisition purchase order prefill pr, goods receipt note prefill po approve, grn supplier invoice eligible grns preview lines post voucher invoice variant, document number configuration inventory, inventory reports goods receipt register date basis posting receipt, purchase order lines register open lines only, posted_transaction_id three way match, user_comp_id location_id, inventory.reports.data export pdf row limit.
