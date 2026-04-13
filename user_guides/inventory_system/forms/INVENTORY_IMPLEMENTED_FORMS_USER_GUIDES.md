# Inventory module — implemented forms (user guides + AI briefing)

**Purpose:** This document is for end users, testers, and **LLM / AI agents**. It explains which inventory forms exist in the ERP, where they live in the app, what they do, and where the code is.

**Scope:** **Currently implemented** inventory screens (Laravel + Inertia/React), including **PR, PO, GRN**, and **GRN-linked Purchase Invoice** (see procurement guide linked below). Other transactional forms in `more_required_fields.md` that are not yet built remain out of scope here.

**Last aligned to codebase:** 2026-04-12 (`routes/web.php`, prefix `inventory/*`; reporting + RAHJ realtime GRN statuses aligned to `draft` / `qc_pending` / `posted`).

---

## 1) Common prerequisites

| Requirement | Notes |
|-------------|--------|
| Authentication | Routes use `web.auth` — user must be logged in. |
| Company + location | **Item Class / Category / Group coding** and **Item Master** typically require **both**; otherwise you may see an empty list or `"Company and Location information is required."` |
| Session key differences (AI / debugging) | **Coding + Item Master:** `comp_id` / `location_id` and/or `user_comp_id` / `user_location_id` (per controller). **UOM Master / UOM Conversion:** `user_comp_id`. **Master Data:** `comp_id` (or request/session equivalent). |
| Master Data extras | Tax / GL dropdowns may use `location_id` from session or request. |
| UI language | `useTranslations()` + `lang/en|ur/inventory.json` (and `common.json`). |
| Form component | Most forms use **`GeneralizedForm`** (`resources/js/Components/GeneralizedForm.jsx`); the generic master-data screen uses it too. |

---

## 2) Quick index — all implemented inventory forms

| # | Form (user-facing name) | List URL | Create URL | Edit URL pattern |
|---|-------------------------|----------|------------|------------------|
| 1 | Item Class Coding | `/inventory/item-class-coding` | `/inventory/item-class-coding/create` | `/inventory/item-class-coding/{id}/edit` |
| 2 | Item Category Coding | `/inventory/item-category-coding` | `/inventory/item-category-coding/create` | `/inventory/item-category-coding/{id}/edit` |
| 3 | Item Group Coding | `/inventory/item-group-coding` | `/inventory/item-group-coding/create` | `/inventory/item-group-coding/{id}/edit` |
| 4 | UOM Master (Unit of Measure) | `/inventory/uom-master` | `/inventory/uom-master/create` | `/inventory/uom-master/{id}/edit` |
| 5 | UOM Conversion | `/inventory/uom-conversion` | `/inventory/uom-conversion/create` | `/inventory/uom-conversion/{id}/edit` *(set-based)* |
| 6 | Item Master | `/inventory/item-master` | `/inventory/item-master/create` | `/inventory/item-master/{id}/edit` |
| 7+ | Master Data (generic) — see §8 | `/inventory/master-data/{slug}` | `/inventory/master-data/{slug}/create` | `/inventory/master-data/{slug}/{id}/edit` |
| 8 | Purchase Requisition (PR) | `/inventory/purchase-requisition` | `/inventory/purchase-requisition/create` | `/inventory/purchase-requisition/{id}/edit` |
| 9 | Purchase Order (PO) | `/inventory/purchase-order` | `/inventory/purchase-order/create` | `/inventory/purchase-order/{id}/edit` |
| 10 | Goods Receipt Note (GRN) | `/inventory/goods-receipt-note` | `/inventory/goods-receipt-note/create` | `/inventory/goods-receipt-note/{id}/edit` |

**Delete:** Usually from list screens; master-data: `DELETE /inventory/master-data/{slug}/{id}`.

**Procurement suite (PR → PO → GRN → Purchase Invoice):** See [PROCUREMENT_FORMS_USER_GUIDE_EN.md](./PROCUREMENT_FORMS_USER_GUIDE_EN.md) for field-by-field English user documentation. Purchase Invoice UI: `GET /inventory/goods-receipt-note/{id}/purchase-invoice`.

---

## 3) Item Class Coding

**User goal:** Top level of item classification — **Class** (code + name).

**Prerequisite:** Valid **company** and **location** context (§1).

**Hierarchy:** `Class → Category → Group` (a category belongs to a class; Item Master links into this hierarchy).

**Fields (create/edit):**

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| class_code | Text | Yes | Unique within company/location scope (see controller rules) |
| class_name | Text | Yes | |
| description | Textarea | No | |
| is_active | Toggle | No | Active / inactive |

**Technical:**

- Controller: `App\Http\Controllers\Inventory\ItemClassCodingController`
- UI: `resources/js/Pages/Inventory/ItemClassCoding/List.jsx`, `Create.jsx`
- i18n: `inventory.item_class_coding.*` in `lang/*/inventory.json`

---

## 4) Item Category Coding

**User goal:** Create a **category** under an **Item Class**.

**Prerequisite:** Company + location (§1).

**Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| item_class_id | Select | Yes | Parent class |
| category_code | Text | Yes | |
| category_name | Text | Yes | |
| description | Textarea | No | |
| is_active | Toggle | No | |

**Technical:** `ItemCategoryCodingController`, `ItemCategoryCoding/List.jsx`, `Create.jsx`, `inventory.item_category_coding.*`

---

## 5) Item Group Coding

**User goal:** Maintain item **groups** (code, name, description, status).

**Prerequisite:** Company + location (§1).

**Fields:** `group_code`, `group_name`, `description`, `is_active` (as in current UI).

**Technical:** `ItemGroupCodingController`, `ItemGroupCoding/*`, `inventory.item_group_coding.*`

---

## 6) UOM Master (Unit of Measure)

**User goal:** Define units of measure (e.g. KG, PCS, M).

**Fields (typical):**

| Field | Notes |
|-------|--------|
| uom_code | Normalized to uppercase on save; unique per company |
| uom_name | |
| uom_type | Length, Weight, Volume, Quantity, Time, Area, Other |
| symbol | e.g. kg, pcs |
| description | Max 200 chars |
| decimal_precision | Integer |
| is_active | |

**Technical:** `UomMasterController`, `UomMaster/List.jsx`, `Create.jsx`, `inventory.uom_master.*`

**Note:** `/inventory/master-data/uom-coding` is generic CRUD on the same **`uom_masters`** table; the dedicated UOM Master screen is the primary UX.

---

## 7) UOM Conversion

**User goal:** Map one **From UOM** to multiple **To UOM** rows with a conversion factor and multiply/divide operation.

**UX model:** Pick From UOM once; table with multiple rows — each row: To UOM, Operation (Multiply/Divide), Factor.

**Technical:** `UomConversionController`, `UomConversion/List.jsx`, `Create.jsx`, `inventory.uom_conversion.*`  
**DB:** `conversion_direction` values: `multiply` / `divide` (lowercase).

**Note:** `/inventory/master-data/uom-conversion` is an alternate generic master-data form (simpler single-row style); the dedicated conversion UI is more flexible.

---

## 8) Item Master

**User goal:** Full item record — classification, tracking, costing, tax, GL mapping, etc.

**Prerequisite:** Company + location (`comp_id` / `location_id` etc. — §1).

**Sections (create UI — multi-section `GeneralizedForm` style):**

| Section | Purpose (summary) |
|---------|-------------------|
| A — Header | item_code, names, status, type, class, category, group, brand, image |
| B — Tracking & UOM | tracking mode, stock/purchase/sales UOM, conversion sub-form behaviour as implemented |
| C — Costing & Procurement | costing method, standard cost, MOQ, reorder, lead time, vendor, substitutes |
| D — Expiry & Storage | expiry toggle, shelf life, alerts, temperature class, hazardous flag |
| E — Physical Attributes | weight, volume, dimensions |
| F — Tax & Trade | tax category, HSN, tariff, origin, barcode |
| G — Identifiers & alternate codes | alternates, inspection, consignment flags |
| H — GL mapping | inventory, COGS, write-off, price variance accounts |
| I — Classification & analytics | ABC, slow-moving threshold |

**Edit mode note:** Some **tracking/UOM** sections are only shown for **new** items (`isEditMode` conditional) — QA should verify the edit flow separately.

**Technical:** `ItemMasterController`, `ItemMaster/List.jsx`, `Create.jsx`, `inventory.item_master.create.*` (large translation tree).

---

## 9) Master Data (generic CRUD) — all `{slug}` forms

**User goal:** Maintain many different masters from one React pair: `MasterData/List`, `MasterData/Create`.

**URL pattern:**

- List: `/inventory/master-data/{slug}`
- Create: `/inventory/master-data/{slug}/create`
- Edit: `/inventory/master-data/{slug}/{id}/edit`

**Supported `{slug}` values** (from `MasterDataController::config()`):

| slug | Screen title (config) | Model area |
|------|------------------------|------------|
| `uom-coding` | UOM Coding | `UomMaster` *(duplicate path vs dedicated UOM Master)* |
| `uom-conversion` | UOM Conversion Configuration | `UomConversion` |
| `tax-category` | Tax Category Configuration | Tax categories + GL links |
| `vendor-master` | Vendor Master | Vendors |
| `warehouse-master` | Warehouse / Location Master | Inventory warehouses |
| `zone-bin-master` | Zone / Bin Configuration | Zone/bin rows |
| `country-master` | Country Master | Countries |
| `brand-master` | Brand Configuration | Inventory brands |
| `reason-code-master` | Reason Code Configuration | Adjustment/return reasons |
| `temperature-class-master` | Temperature Class Configuration | Cold chain classes |
| `transporter-master` | Transporter Master | Logistics |
| `customer-master` | Customer Master | Inventory customers |
| `package-type-master` | Package Type Configuration | Packaging |
| `barcode-type-master` | Barcode Type Configuration | Barcode types |

**Route note:** Vendor Master is served at `/inventory/master-data/vendor-master` in the app, not `/purchase/supplier-master`.

**Field definitions:** `MasterDataController` `fields` / `rules` arrays in PHP — single source of truth.

**i18n:** `lang/*/inventory.json` → `inventory.master_data.masters.{slug}.fields.*`, `list_columns`, `title`, and `inventory.master_data.option_sets.*` (select options).

**Technical:** `App\Http\Controllers\Inventory\MasterDataController`

---

## 10) What is NOT implemented yet (reference for AI)

**Implemented as transactional screens:** Purchase Requisition, Purchase Order, Goods Receipt Note, GRN Purchase Invoice posting — see [PROCUREMENT_FORMS_USER_GUIDE_EN.md](./PROCUREMENT_FORMS_USER_GUIDE_EN.md).

Still **not** available (or only partial) per broader blueprint (`more_required_fields.md`, FORM 3–12 and beyond), examples:

- Landed cost allocation UI (beyond GRN header flags), full three-way match automation, Stock Transfer, Delivery, Stock Adjustment, RTV, RMA, Physical Count, Cost revaluation / write-down.

Use `user_guides/inventory_system/more_required_fields.md` and `INVENTORY_SYSTEM_FINAL_BLUEPRINT.md` for planned scope.

---

## 11) File map (for developers / AI code navigation)

| Area | Laravel controllers | React pages |
|------|---------------------|-------------|
| Coding | `ItemClassCodingController`, `ItemCategoryCodingController`, `ItemGroupCodingController` | `Pages/Inventory/Item*Coding/*` |
| UOM | `UomMasterController`, `UomConversionController` | `Pages/Inventory/UomMaster/*`, `UomConversion/*` |
| Item | `ItemMasterController` | `Pages/Inventory/ItemMaster/*` |
| Generic masters | `MasterDataController` | `Pages/Inventory/MasterData/List.jsx`, `Create.jsx` |
| Procurement | `PurchaseRequisitionController`, `PurchaseOrderController`, `GoodsReceiptNoteController` | `Pages/Inventory/PurchaseRequisition/*`, `PurchaseOrder/*`, `GoodsReceiptNote/*` |

---

## 12) Suggested test checklist (QA)

- Each form: create → appears on list → edit → (optional) delete  
- Missing company / location: error or empty state  
- EN/UR toggle: labels still correct (especially master-data and item master)  
- Item Master: required-field validation; image upload if enabled  

---

*End of implemented forms user guide.*
