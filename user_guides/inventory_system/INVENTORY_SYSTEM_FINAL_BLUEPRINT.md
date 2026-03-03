# 📦 Inventory Module — Final International Standards Blueprint
> **Complete ERP System | Comprehensive Form & Implementation Guide**
>
> **Version:** 3.0 (Merged)  
> **Updated:** 2026-03-03  
> **Status:** Ready for Form Development  
> **Language:** Bilingual (English + Urdu)

---

## 🎯 Document Overview

**Ye final blueprint document ہے** jo دوں documents کو merge کر کے بنایا گیا ہے:
- ✅ Original functional design  
- ✅ Complete form specifications (har field ka data type, mandatory/optional, validation)
- ✅ Gap analysis — تمام missing fields add کیے گئے
- ✅ International compliance mapping  
- ✅ Controls, approvals, audit requirements  

**Output:** Direct input for form design team اور developers کے لیے ready۔

---

## 1) 🌍 Global Design Principles

### 1.1 Core Goals (بنیادی مقاصد)
1. **Accurate stock visibility** — real-time, location-wise
2. **Compliant valuation** — IFRS/IAS + local GAAP ready
3. **Strong controls** — audit trail, approvals, segregation of duties
4. **Multi-country readiness** — tax, currency, language, calendar, legal docs
5. **Scalable architecture** — SME سے enterprise تک

### 1.2 Operating Model
- Multi-company, Multi-branch / warehouse / bin / zone
- Multi-currency, Multi-UOM
- Batch / lot / serial tracking
- Expiry-aware inventory
- Landed cost allocation
- Optional consignment & 3PL support

### 1.3 Document Purpose & Use
This blueprint is designed for:
- **Form Design Teams:** Exact field specifications with data types
- **Developers:** Validation rules, GL mappings, integration points
- **Business Analysts:** Process flows, approval matrices, reporting requirements
- **Auditors:** Control framework, SoD requirements, audit trails

---

## 2) 📚 International Standards & Compliance Mapping

### 2.1 Accounting Standards

| Standard | Requirement | Implementation |
|---|---|---|
| IAS 2 | Cost formula, NRV, write-down/reversal | Supported methods: FIFO, Weighted Avg, Standard Cost |
| IAS 21 | Foreign currency purchase impact | Multi-currency support with FX rate management |
| IAS 8 | Costing policy change governance | Policy change audit trail, approval workflow |
| IAS 36 | Slow/obsolete stock impairment | Slow-moving thresholds, obsolescence reports |
| IFRS 15 | COGS timing with revenue recognition | COGS posting linked to delivery/invoice |
| ASC 330 | US GAAP inventory measurement | Feature-flag for US vs IFRS reporting |
| ASC 606 | US GAAP sales-COGS alignment | Sales-to-COGS reconciliation reports |

**Valuation Methods Supported:**
- FIFO (First In First Out)
- Moving Weighted Average
- Standard Cost (with variance tracking)
- LIFO *(feature-flagged — country/legal dependent)*

### 2.2 Tax & Trade Requirements
- VAT / GST / Sales Tax at purchase and sale side
- Input tax claim controls
- Customs duties into landed cost
- Withholding tax (where applicable)
- E-invoice / digital invoice (country plug-in layer)
- Incoterms 2020 reference fields
- HS Tariff codes for international trade

### 2.3 Data & Traceability Standards
- GS1-compatible product identifiers (GTIN, barcode, optional SSCC)
- Full audit trail (who / when / what / before / after)
- Lot/serial traceability — forward + backward
- Recall-ready reporting for regulated sectors
- Cold-chain compliance tracking (temperature logs)

### 2.4 Control & Audit Expectations
- **SoD:** requester ≠ approver ≠ receiver ≠ poster
- Maker-checker approvals for sensitive transactions
- Period locking + backdate control
- Reason codes mandatory for adjustments, write-offs, returns
- Immutable audit logs
- User activity tracking with override justification

---

## 3) 🧱 Inventory Data Model Blueprint

### 3.1 Master Data Objects
1. **Item Master** — Product definitions, tracking, pricing, tax mapping
2. **Warehouse / Zone / Bin Master** — Storage hierarchy, capacity, temperature classes
3. **Business Partner Master** — Vendor, Customer, Transporter, 3PL with payment terms
4. **UOM Master + Conversion Table** — Units, packaging hierarchy
5. **Reference Masters** — Reason codes, status codes, adjustment types, classifications
6. **GL Account Master** — Inventory, COGS, expense accounts for each item

### 3.2 Transactional Objects
- Purchase Requisition (PR)
- Purchase Order (PO)
- Goods Receipt Note (GRN)
- Purchase Invoice (AP Bill link)
- Goods Issue / Delivery
- Sales Invoice (AR link)
- Stock Transfer Request / Issue / Receipt
- Stock Adjustment
- Production Consumption / Receipt *(optional)*
- Return to Vendor (RTV)
- Customer Return (RMA)
- Stock Count (Cycle / Annual)
- Landed Cost Allocation
- Cost Revaluation / Write-down Proposal

### 3.3 Ledger Layers
| Ledger | Purpose | Update Trigger |
|---|---|---|
| Quantity Ledger | Stock movement by item-location | GRN, Delivery, Transfer |
| Valuation Ledger | Cost layer by item-location-method | Receipt, Purchase Invoice |
| Audit Ledger | Full event trail — immutable | Every transaction event |

---

## 4) 🔄 End-to-End Process Flows

### 4.1 Procure-to-Stock (P2S)
```
PR → PO Approval → Inbound Planning (ETA) → GRN → QC Inspection
→ Accepted Qty to Stock → Rejected to Return Bin
→ Landed Cost Allocation → AP 3-Way Match (PO-GRN-Invoice)
→ GL Posting (Inventory Dr / GRNI Cr, then GRNI Dr / AP Cr)
```
**Key Controls:**
- Over-receipt tolerance by PO line
- Mandatory lot/serial at GRN if tracking enabled
- UOM mismatch = hard block
- Inspection required flag triggers QC workflow

### 4.2 Stock-to-Sale (S2S)
```
Sales Order → Allocation/Reservation → Pick List Generation
→ Packing → Dispatch → Delivery Confirmation
→ Sales Invoice → COGS Posting (per valuation method)
```
**Key Controls:**
- Negative stock policy configurable (default OFF)
- FEFO/FIFO picking rule enforcement
- Credit hold integration with AR module
- COGS posting at delivery or invoice (configurable)

### 4.3 Internal Stock Transfer
```
Transfer Request (with Transit Tracking) → Approval (if value/qty threshold)
→ Issue from Source Warehouse → In-Transit Tracking
→ Receipt at Destination → Variance Handling → Audit Report
```
**Key Controls:**
- Source & destination must differ
- In-transit warehouse for long-distance transfers
- Variance reason code mandatory if short/excess
- Damage flag triggers quality report

### 4.4 Inventory Adjustment & Write-Off
```
Adjustment Request (Type: Gain/Loss/Write-Off/Revaluation/QC Rejection)
→ Reason Code (mandatory) → Qty & Cost Simulation
→ Approval (threshold-based: manager/CFO) → Posting
→ Audit Log Entry with GL Impact
```
**Key Controls:**
- Reason code non-negotiable (no default allowed)
- Approval threshold 2-level (manager, then finance admin if value > limit)
- System qty read-only (cannot be edited manually)
- GL account may be overridden by accountant with audit trail

### 4.5 Returns Flows

**Return to Vendor (RTV):**
```
GRN → Issue RTV Request (Reason: Quality/Expiry/Oversupply/Damage)
→ Debit Note Reference → Dispatch → Vendor Acknowledgement
→ Credit Note Receipt → GL Posting
```

**Customer Return (RMA):**
```
Sales Order / Invoice → Customer Return Request
→ Inspection Decision (Restock/Scrap/Repair/Return to Vendor)
→ Posting to Stock or Scrap Bin
→ Credit Note Entry → GL Posting
```

### 4.6 Physical Count (Cycle Count + Annual)
```
Count Plan Generation → Freeze Stock → Blind Count Option
→ Count Entry by Teams (Counter 1 + Counter 2 for supervision)
→ Variance Check (if > threshold → recount triggered)
→ Approval → Posting → Root-Cause Analytics
```
**Key Controls:**
- Blind count hides system qty from counter
- Automatic recount trigger if variance % exceeds threshold
- Supervisor mandatory for final approval
- Variance value tracked separately for GL impact

---

## 5) 📋 FORMS — Complete Field Specifications

> **Legend:**
> - 🔴 Mandatory | 🟡 Conditional | 🟢 Optional
> - **[NEW]** = Gap analysis سے add کیا گیا field
> - **Type Codes:** DEC = Decimal, INT = Integer, TXT = Text, LKP = Lookup, DRP = Dropdown, TGL = Toggle, FIL = File, SUB = Sub-table

---

### ⭐ FORM 1: Item Master

**Purpose:** Maintain complete product master with costing, tracking, and compliance data.

**Section A: Header Fields**

| # | Field Name | Type | Rules & Validation | Mandatory | Notes |
|---|---|---|---|---|---|
| 1 | Item Code | TXT | Unique, no spaces, alphanumeric + dashes allowed | 🔴 | Auto-generated or manual per config |
| 2 | Item Name (Short) | TXT | Max 50 characters, no special chars | 🔴 | Display in all pick lists |
| 3 | Item Name (Long/Description) | TXT | Max 250 characters | 🟢 | Full product description |
| 4 | Item Status | DRP | Active / Inactive / Discontinued / Blocked | 🔴 **[NEW]** | Inactive = no new transactions allowed |
| 5 | Item Type | DRP | Raw Material / Finished Good / Trading / Consumable / Service (Non-Stock) | 🔴 | Determines GL account category |
| 6 | Item Class | DRP | Linked to master class list | 🔴 | E.g., Electronics, Chemicals, Textiles |
| 7 | Item Category | DRP | Child of Item Class | 🔴 | E.g., Mobile Phones (under Electronics) |
| 8 | Item Group | DRP | Child of Category | 🟡 | Further sub-classification |
| 9 | Brand | TXT/DRP | From brand master or free text | 🟢 | For reporting and sales analytics |
| 10 | Item Image | FIL | JPG/PNG only, max 5 MB | 🟢 **[NEW]** | For mobile app display |

**Section B: Tracking & UOM Configuration**

| # | Field Name | Type | Rules & Validation | Mandatory | Notes |
|---|---|---|---|---|---|
| 11 | Tracking Mode | DRP | None / Lot / Serial | 🔴 | Determines GRN line-item requirements |
| 12 | Stock UOM | DRP | From UOM master (e.g., Unit, Box, kg, Liter) | 🔴 | Base unit for quantity ledger |
| 13 | Purchase UOM | DRP | May differ from Stock UOM | 🔴 **[NEW]** | Vendor billing unit |
| 14 | Sales UOM | DRP | May differ from Stock UOM | 🔴 **[NEW]** | Customer invoicing unit |
| 15 | UOM Conversion Table | SUB | Purchase → Stock → Sales with decimal factors | 🔴 **[NEW]** | Example: 12 pcs = 1 box; 1 box = 1 stock unit |
| 16 | Packaging Hierarchy | SUB | Unit / Box / Case / Pallet with qty per level | 🟡 **[NEW]** | For WMS, shipping optimization |

**Section C: Costing & Procurement**

| # | Field Name | Type | Rules & Validation | Mandatory | Notes |
|---|---|---|---|---|---|
| 17 | Costing Method | DRP | FIFO / Moving Weighted Average / Standard Cost | 🔴 | Per IAS 2 policy |
| 18 | Standard Cost | CUR | > 0, required if Standard Cost method selected | 🟡 | Fixed reference cost for variance tracking |
| 19 | Last Purchase Price | CUR | Auto-updated from last GRN, read-only | 🟢 | For quick reference |
| 20 | Minimum Order Qty (MOQ) | DEC | > 0, for PO generation alerts | 🟡 **[NEW]** | Vendor minimum requirement |
| 21 | Reorder Point | DEC | >= 0, triggers reorder report | 🟡 | When stock falls below this, alert |
| 22 | Safety Stock | DEC | >= 0, buffer for demand variability | 🟡 | Buffer stock level |
| 23 | Maximum Stock Level | DEC | > Reorder Point, triggers overstock alert | 🟢 | Upper limit before holding excess |
| 24 | Lead Time (days) | INT | > 0, for reorder planning | 🟡 **[NEW]** | Days from PO to GRN |
| 25 | Default Vendor | LKP | From active vendor master | 🟢 **[NEW]** | Auto-populate in PO if selected |
| 26 | Substitute Items | LKP (multi) | Other items that can substitute if stockout | 🟢 **[NEW]** | For sales order fulfillment flexibility |

**Section D: Expiry & Storage (Conditional)**

| # | Field Name | Type | Rules & Validation | Mandatory | Notes |
|---|---|---|---|---|---|
| 27 | Expiry Tracking | TGL | Yes / No | 🔴 | If Yes, fields 28-32 become mandatory |
| 28 | Shelf Life (days) | INT | > 0, only if Expiry Tracking = Yes | 🟡 | Days from manufacturing to expiry |
| 29 | Expiry Basis | DRP | Manufacturing Date / Receipt Date | 🟡 **[NEW]** | Start point for shelf life calculation |
| 30 | Near-Expiry Alert (days) | INT | > 0, e.g., 30 for alert 30 days before expiry | 🟡 **[NEW]** | Triggers stock report warning |
| 31 | Storage Temperature Class | DRP | Ambient / Chilled / Frozen / Controlled | 🟢 **[NEW]** | Affects warehouse bin assignment |
| 32 | Hazardous Material Flag | TGL | Yes / No | 🟡 **[NEW]** | Triggers compliance checks, special storage |

**Section E: Physical Attributes**

| # | Field Name | Type | Rules & Validation | Mandatory | Notes |
|---|---|---|---|---|---|
| 33 | Gross Weight (kg) | DEC | >= 0, decimal precision 3 | 🟢 **[NEW]** | For freight cost calculations |
| 34 | Net Weight (kg) | DEC | >= 0, <= Gross Weight | 🟢 **[NEW]** | Actual product weight |
| 35 | Volume (CBM) | DEC | >= 0, cubic meter | 🟢 **[NEW]** | For container & logistics planning |
| 36 | Dimensions (L×W×H cm) | TXT | Format: 10x20x5, free text | 🟢 **[NEW]** | For picking/packing efficiency |

**Section F: Tax & Trade Compliance**

| # | Field Name | Type | Rules & Validation | Mandatory | Notes |
|---|---|---|---|---|---|
| 37 | Tax Category | DRP | Linked to tax engine (e.g., 0%, 5%, 12%, 18%) | 🔴 | Determines output tax on sales |
| 38 | HSN Code / SAC Code | TXT | GST/VAT format validation per country | 🟡 **[NEW]** | India GST classification |
| 39 | HS Tariff Code | TXT | 6-8 digit international code | 🟡 **[NEW]** | Customs classification for imports |
| 40 | Country of Origin | DRP | ISO country list | 🟡 **[NEW]** | For import/export documentation |
| 41 | Barcode / GTIN | TXT | GS1 format (13-digit EAN or 12-digit UPC) validation | 🟡 | Unique for supply chain |
| 42 | Alternate Barcodes | SUB | Code, Type (EAN/UPC/QR), Vendor, Supplier Code | 🟢 **[NEW]** | Multiple symbologies support |

**Section G: Identifiers & Alternate Codes**

| # | Field Name | Type | Rules & Validation | Mandatory | Notes |
|---|---|---|---|---|---|
| 43 | Alternate Item Codes | SUB | Code / Type (Supplier/Customer/Internal) / Vendor Link | 🟡 **[NEW]** | Map vendor SKU, customer part number |
| 44 | Inspection Required | TGL | Yes / No | 🟡 **[NEW]** | Triggers QC workflow on GRN receipt |
| 45 | Consignment Item Flag | TGL | Yes / No | 🟢 **[NEW]** | For vendor-owned inventory tracking |

**Section H: Classification & Analytics**

| # | Field Name | Type | Rules & Validation | Mandatory | Notes |
|---|---|---|---|---|---|
| 46 | ABC Classification | DRP | A (High $) / B (Medium) / C (Low) | 🟡 **[NEW]** | For inventory management focus |
| 47 | Slow-Moving Threshold (days) | INT | > 0, default 180 days | 🟢 **[NEW]** | Days without movement = flag item |

**Section I: GL Account Mapping (Critical for Posting)**

| # | Field Name | Type | Rules & Validation | Mandatory | Notes |
|---|---|---|---|---|---|
| 48 | Inventory GL Account | LKP | From GL chart of accounts | 🔴 **[NEW]** | Balance sheet asset account |
| 49 | COGS GL Account | LKP | From GL chart of accounts | 🔴 **[NEW]** | P&L expense account |
| 50 | Write-Off GL Account | LKP | From GL chart of accounts | 🔴 **[NEW]** | For adjustments/write-downs |
| 51 | Price Variance GL Account | LKP | From GL chart of accounts, if Standard Cost method | 🟡 **[NEW]** | Standard cost variance tracking |

**Section J: Audit Trail (System-Generated, Read-Only)**

| # | Field Name | Type | Visibility |
|---|---|---|---|
| 52 | Created By | System | All users (read-only) |
| 53 | Created Date | System | All users (read-only) |
| 54 | Last Modified By | System | All users (read-only) |
| 55 | Last Modified Date | System | All users (read-only) |
| 56 | Modification History Log | System | Expandable trail with field-level changes |

---

### ⭐ FORM 2: Warehouse / Zone / Bin Master

**Purpose:** Define storage locations with hierarchical structure, capacity, and environmental controls.

| # | Field Name | Type | Rules | Mandatory | Notes |
|---|---|---|---|---|---|
| 1 | Warehouse Code | TXT | Unique per company, alphanumeric | 🔴 | E.g., WH001, WH-DELHI-01 |
| 2 | Warehouse Name | TXT | Max 100 chars | 🔴 | E.g., Main Warehouse, Kolkata Branch |
| 3 | Company | LKP | From company master, not changeable after creation | 🔴 | Ownership |
| 4 | Branch | LKP | From branch master, child of company | 🔴 | Location level |
| 5 | Address | TXT | Multi-line text, max 250 chars | 🟡 | Full warehouse address |
| 6 | Warehouse Type | DRP | Main / Transit / Quarantine / Return / Scrap | 🔴 **[NEW]** | Determines usage and reporting |
| 7 | Storage Temperature Class | DRP | Ambient (15-25°C) / Chilled (0-8°C) / Frozen (<-15°C) / Controlled (other) | 🟢 **[NEW]** | Cold-chain requirement |
| 8 | Zone Code | TXT | Unique within warehouse, alphanumeric | 🟡 | E.g., ZONE-A, ZONE-IMPORT |
| 9 | Aisle | TXT | Within zone, alphanumeric | 🟢 | Physical location pointer |
| 10 | Bin Code | TXT | Unique within warehouse, format: ZONE-AISLE-BIN | 🟡 | E.g., ZA-01-001 |
| 11 | Bin Capacity (Qty/Weight/Volume) | DEC | Quantity units, kg, or CBM | 🟢 **[NEW]** | Overstock alert threshold |
| 12 | Inbound Staging Bin | LKP | Points to this warehouse's staging bin | 🟡 **[NEW]** | Receiving temporary location |
| 13 | Outbound Staging Bin | LKP | Points to this warehouse's staging bin | 🟡 **[NEW]** | Dispatch temporary location |
| 14 | Active Flag | TGL | Yes / No | 🔴 | Inactive = no new receipts |

---

### ⭐ FORM 3: Purchase Order (PO)

**Purpose:** Create and manage purchase orders with approval workflow, multi-line items, and AP integration.

**Section A: Header Information**

| # | Field Name | Type | Rules | Mandatory | Notes |
|---|---|---|---|---|---|
| 1 | PO Number | Auto-TXT | Format per country config (e.g., PO-2026-00001) | 🔴 | Read-only, auto-generated |
| 2 | PO Type | DRP | Standard / Blanket / Import / Service | 🔴 **[NEW]** | Blanket = multi-release purchase agreement |
| 3 | Blanket PO Flag | TGL | Yes / No, enables release mechanism | 🟡 **[NEW]** | If Blanket → sub-form for releases |
| 4 | Vendor | LKP | From active vendor master | 🔴 | Block inactive vendors |
| 5 | Vendor Reference No. | TXT | Vendor's quote/offer number | 🟢 | For vendor communication |
| 6 | PO Date | DATE | Cannot be future-dated beyond policy (default +90 days) | 🔴 | Document date |
| 7 | Expected Delivery Date | DATE | >= PO Date, header-level default for all lines | 🔴 **[NEW]** | Target receipt date |
| 8 | Company | LKP | From company master | 🔴 | Document ownership |
| 9 | Branch / Warehouse | LKP | Ship-to location | 🔴 | Receiving warehouse |
| 10 | Delivery Address | TXT | Full ship-to address, max 250 chars | 🔴 **[NEW]** | Override vendor address if needed |
| 11 | Currency | DRP | ISO currency code (USD, GBP, INR, etc.) | 🔴 | For pricing and payment |
| 12 | FX Rate | DEC | Spot rate or manually entered, with date | 🔴 | For conversion to base currency |
| 13 | Incoterms 2020 | DRP | EXW / FCA / CPT / CIP / DAP / DDP / etc. | 🔴 **[NEW]** | International trade terms |
| 14 | Incoterms Location | TXT | Port/city for Incoterm (e.g., FOB Shanghai) | 🟡 **[NEW]** | Specifies risk transfer point |
| 15 | Payment Terms | DRP | From vendor master, overridable (e.g., Net 30, 2/10 Net 30) | 🔴 **[NEW]** | For AP scheduling |
| 16 | Advance Payment % | DEC | 0-100, if advance required | 🟡 **[NEW]** | % of order value for advance |
| 17 | Tax Inclusive Flag | TGL | Prices include tax or not | 🔴 | Affects GRN cost calculation |
| 18 | Header Discount % | DEC | >= 0, applied before line-level tax | 🟢 **[NEW]** | E.g., 5% volume discount |
| 19 | Notes / Terms | TXT | Max 500 chars, special conditions | 🟢 | Shipping, handling instructions |
| 20 | Attachments | FIL | Quote, spec sheet, contract, technical docs | 🟢 | Supporting documents |
| 21 | Status | System-DRP | Draft / Approved / Partially Received / Closed / Cancelled | 🔴 | Workflow state |
| 22 | Cancellation Reason | TXT | Mandatory if status = Cancelled | 🟡 **[NEW]** | Audit trail |

**Section B: Line Items (Sub-table)**

| # | Field Name | Type | Rules | Mandatory | Notes |
|---|---|---|---|---|---|
| 1 | Line No. | Auto-INT | Sequential 10, 20, 30... | 🔴 | System-generated |
| 2 | Item Code | LKP | From active item master only | 🔴 | Blocks inactive items |
| 3 | Item Description | Auto-TXT | Auto-filled from item master, editable | 🔴 | For clarity on PO printout |
| 4 | Item Specifications / Notes | TXT | QC reference, brand, model, revision | 🟢 **[NEW]** | Technical details for receiving |
| 5 | Purchase UOM | DRP | From item UOM config, auto-filled | 🔴 | Vendor billing unit |
| 6 | Ordered Qty | DEC | > 0, decimal allowed | 🔴 | Quantity in purchase UOM |
| 7 | Unit Price | CUR | > 0, in PO currency | 🔴 | Price per unit |
| 8 | Line Discount % | DEC | 0-100, applied before tax | 🟢 **[NEW]** | If item-level discount differs from header |
| 9 | Net Unit Price | Auto-CUR | (Unit Price) × (1 - Line Discount %) | 🔴 | Calculated field |
| 10 | Tax Code | DRP | From tax engine, e.g., 5%, 12%, 18% | 🔴 | Output tax category |
| 11 | Tax Amount (line) | Auto-CUR | (Net Unit Price × Ordered Qty) × Tax % | 🔴 | Auto-calculated |
| 12 | Line Total (excl. tax) | Auto-CUR | Net Unit Price × Ordered Qty | 🔴 | Base line amount |
| 13 | Line Total (incl. tax) | Auto-CUR | Line Total + Tax Amount | 🔴 | Gross line amount |
| 14 | Expected Line Delivery Date | DATE | Per-line override of header date | 🟡 **[NEW]** | If different from header |
| 15 | Warehouse / Bin | LKP | Target receiving location | 🟡 | For WMS pre-allocation |
| 16 | GRN Over-Receipt Tolerance % | DEC | 0-100, e.g., 2% (allows 2% overage) | 🟡 **[NEW]** | Block or warn if exceeded |
| 17 | Price Variance Tolerance % | DEC | 0-100, for AP match control | 🟡 **[NEW]** | 3-way match threshold |
| 18 | Received Qty | Auto-DEC | From GRN, cumulative, read-only | 🔴 | Linked to GRN line |
| 19 | Pending Qty | Auto-DEC | Ordered Qty - Received Qty | 🔴 | Open quantity |
| 20 | Line Status | System-DRP | Open / Partial / Closed / Cancelled | 🔴 | Line-level workflow |

**Section C: Approval & Amendment**

| # | Field Name | Type | Rules | Mandatory | Notes |
|---|---|---|---|---|---|
| 1 | Approval Workflow Status | System-DRP | Submitted / Approved / Rejected | 🔴 | Multi-level approval |
| 2 | Approved By | System-LKP | User who approved, auto-captured | 🔴 | SoD requirement |
| 3 | Approval Date | System-DATE | Auto-captured | 🔴 | Timestamp |
| 4 | Approval Comments | TXT | Optional approver notes | 🟢 | For clarification |
| 5 | Amendment Number | Auto-INT | Increments on each change post-approval | 🔴 **[NEW]** | PO-001-AMN-01, PO-001-AMN-02 |
| 6 | Amendment History | System-Log | Complete trail of changes with user & date | 🔴 **[NEW]** | Audit compliance |

**Section D: Summary (Auto-Calculated)**

| Field | Calculation |
|---|---|
| Total Line Amount (excl. tax) | Sum of all line totals excl. tax |
| Total Tax Amount | Sum of all line taxes |
| Total Order Amount (incl. tax) | Total Line + Total Tax |

---

### ⭐ FORM 4: Goods Receipt Note (GRN)

**Purpose:** Record receipt of goods from vendor, perform QC, and reconcile with PO/Invoice.

**Section A: Header**

| # | Field Name | Type | Rules | Mandatory | Notes |
|---|---|---|---|---|---|
| 1 | GRN Number | Auto-TXT | Format: GRN-2026-00001 | 🔴 | Read-only, auto-generated |
| 2 | GRN Type | DRP | Standard / Import / Return / Sample / Consolidated | 🔴 **[NEW]** | Consolidated = multiple POs in one receipt |
| 3 | PO Reference | LKP | Link to approved PO(s); multi-select if consolidated | 🔴 | Header PO lookup |
| 4 | Vendor | Auto-LKP | Auto-filled from PO, not editable | 🔴 | Read-only |
| 5 | Receipt Date | DATE | Cannot backdate beyond company policy (e.g., 30 days) | 🔴 | Physical receipt date |
| 6 | Posting Date | DATE | Fiscal period validation; may differ from receipt date | 🔴 | Accounting period |
| 7 | Company / Branch / Warehouse | LKP | From PO, not editable | 🔴 | Receiving entity |
| 8 | Vehicle Number | TXT | License plate or vehicle ID | 🟡 **[NEW]** | For delivery tracking |
| 9 | Transporter Name | LKP or TXT | From transporter master or free text | 🟡 **[NEW]** | Logistics info |
| 10 | Driver Name & Contact | TXT | Driver full name + phone number | 🟢 **[NEW]** | For issue resolution |
| 11 | Seal Number | TXT | Container seal for import/customs | 🟡 **[NEW]** | Import documentation |
| 12 | Container / Trailer Number | TXT | Shipping container or trailer ID | 🟡 **[NEW]** | Logistics reference |
| 13 | Bill of Lading / AWB No. | TXT | International shipment reference | 🟡 **[NEW]** | Customs clearance |
| 14 | Packing List Reference | TXT | Vendor's packing list number | 🟡 **[NEW]** | 3-way match support |
| 15 | Vendor Delivery Note No. | TXT | Vendor's DN reference | 🟢 | For reconciliation |
| 16 | Currency | DRP | From PO, auto-filled | 🔴 | For cost tracking |
| 17 | FX Rate | DEC | From PO or updated at receipt date | 🔴 | For base currency conversion |
| 18 | Overall QC Status | DRP | Pending / Passed / Failed / Partial / Waived | 🔴 **[NEW]** | Rolled up from line-level |
| 19 | Landed Cost Flag | TGL | Yes / No, links to LC form | 🟡 **[NEW]** | If import w/ freight/duties |
| 20 | Landed Cost Reference | LKP | If flag ON | 🟡 **[NEW]** | Link to LC document |
| 21 | 3-Way Match Status | System-DRP | Pending / Matched / Discrepancy / On Hold | 🔴 **[NEW]** | PO-GRN-AP Invoice match |
| 22 | Notes | TXT | Max 500 chars | 🟢 | Receiving notes |
| 23 | Attachments | FIL | Packing list, QC docs, photos, delivery proof | 🟢 | Supporting files |
| 24 | Status | System-DRP | Draft / QC Pending / Approved / Posted / Cancelled | 🔴 | Workflow state |

**Section B: Line Items (Sub-table)**

| # | Field Name | Type | Rules | Mandatory | Notes |
|---|---|---|---|---|---|
| 1 | PO Line Reference | Auto-TXT | Link to PO line | 🔴 | For line-level matching |
| 2 | Item Code | Auto-LKP | From PO, not editable | 🔴 | Read-only |
| 3 | Item Description | Auto-TXT | From item master | 🔴 | Read-only |
| 4 | Country of Origin (line) | DRP | Per-line for mixed shipments | 🟡 **[NEW]** | Customs + compliance |
| 5 | Purchase UOM | Auto-DRP | From PO | 🔴 | Read-only |
| 6 | PO Ordered Qty | Auto-DEC | From PO, read-only | 🔴 | Reference |
| 7 | Previously Received Qty | Auto-DEC | From past GRNs, read-only | 🔴 | Cumulative prior receipt |
| 8 | This Receipt Qty | DEC | > 0; ≤ (Pending Qty + Over-Receipt Tolerance) | 🔴 | Current receipt quantity |
| 9 | Unit Cost | CUR | From PO or overridable per policy (with approval reason) | 🔴 | Cost per PU in receipt currency |
| 10 | Accepted Qty | DEC | After QC, ≤ This Receipt Qty | 🔴 **[NEW]** | Passed QC units |
| 11 | Rejected Qty | Auto-DEC | This Receipt Qty - Accepted Qty | 🔴 **[NEW]** | Failed QC units |
| 12 | Rejection Reason | DRP | Mandatory if Rejected Qty > 0: Damage / Wrong Item / Wrong Qty / Quality / Expiry / Other | 🟡 **[NEW]** | Root cause |
| 13 | QC Status (line) | DRP | Passed / Failed / Partial / Waived | 🔴 **[NEW]** | Per-line QC mark |
| 14 | Lot / Batch Number | TXT | Mandatory if item tracking = Lot | 🟡 | Vendor's lot ID |
| 15 | Serial Numbers | SUB | One row per unit if item tracking = Serial | 🟡 | Format: SN-001, SN-002, ... |
| 16 | Manufacturing Date | DATE | Required if expiry tracking ON | 🟡 **[NEW]** | Mfg date from package |
| 17 | Expiry Date | DATE | Auto-calc: Mfg Date + Shelf Life; overridable | 🟡 **[NEW]** | When item expires |
| 18 | Temperature at Receipt | DEC | For cold-chain items, recorded temp | 🟢 **[NEW]** | Compliance check |
| 19 | Put-Away Bin | LKP | Target bin location post-receipt | 🟡 **[NEW]** | For WMS auto-allocation |
| 20 | Over-Receipt Tolerance % Check | System-CHK | Blocks if exceeded, shows warning if within | 🔴 **[NEW]** | Automated control |
| 21 | Line Total Cost | Auto-CUR | Accepted Qty × Unit Cost | 🔴 | For GL posting |

---

### ⭐ FORM 5: Landed Cost Allocation

**Purpose:** Allocate import costs (freight, insurance, duty, etc.) to GRN-linked items.

| # | Field Name | Type | Rules | Mandatory | Notes |
|---|---|---|---|---|---|
| 1 | LC Document No. | Auto-TXT | Format: LC-2026-00001 | 🔴 | Read-only |
| 2 | Reference GRN(s) | LKP (multi) | Multiple GRNs can share one LC | 🔴 **[NEW]** | Multi-select |
| 3 | LC Date | DATE | Receipt date or invoice date | 🔴 | For FX rate lookup |
| 4 | Company / Branch | LKP | From GRN | 🔴 | Read-only |
| **Cost Components Sub-table:** |  |  |  |  |  |
| 5 | Cost Type | DRP | Freight / Insurance / Customs Duty / Clearing / Handling / Other | 🔴 **[NEW]** | Categorize cost |
| 6 | Vendor / Carrier | LKP | Who charged this cost (freight company, customs broker) | 🟡 **[NEW]** | Payable entity |
| 7 | Vendor Invoice Reference | TXT | Invoice number for 3-way match with AP | 🟡 **[NEW]** | AP integration |
| 8 | Amount | CUR | > 0 | 🔴 | Cost in cost currency |
| 9 | Currency | DRP | ISO code (may differ from PO currency) | 🔴 | Cost currency |
| 10 | FX Rate at Allocation Date | DEC | For conversion to base currency | 🔴 **[NEW]** | Spot or manual |
| 11 | Amount in Base Currency | Auto-CUR | Amount × FX Rate | 🔴 | Standardized |
| **Allocation Settings:**  |  |  |  |  |  |
| 12 | Allocation Method | DRP | By Qty / By Value / By Weight / By Volume | 🔴 **[NEW]** | How to spread costs |
| 13 | Allocation Preview Table | Computed | Shows per-item, per-GRN breakdown before posting | 🔴 **[NEW]** | Read-only preview |
| 14 | GL Account | LKP | Freight Payable / Customs Payable, etc. | 🔴 | Expense/payable account |
| 15 | Status | System-DRP | Draft / Preview / Posted | 🔴 | Workflow |
| 16 | Posted By / Posted Date | System | Auto-captured on posting | 🔴 | Audit trail |

---

### ⭐ FORM 6: Stock Transfer

**Purpose:** Move inventory between warehouses/branches with approval and in-transit tracking.

**Section A: Header**

| # | Field Name | Type | Rules | Mandatory | Notes |
|---|---|---|---|---|---|
| 1 | Transfer No. | Auto-TXT | Format: TRN-2026-00001 | 🔴 | Read-only |
| 2 | Transfer Type | DRP | Inter-Warehouse / Inter-Branch / Inter-Company / Bin-to-Bin | 🔴 **[NEW]** | Scope of transfer |
| 3 | Transfer Date | DATE | — | 🔴 | Request date |
| 4 | Source Warehouse / Bin | LKP | Cannot be same as destination | 🔴 | Issue from |
| 5 | Destination Warehouse / Bin | LKP | Must differ from source | 🔴 | Receive at |
| 6 | In-Transit Warehouse | LKP | Optional, for multi-step transfers | 🟡 **[NEW]** | Intermediate location |
| 7 | Reason for Transfer | DRP | Rebalancing / Demand / Consolidation / Return / Other | 🟡 | Business reason |
| 8 | Status | System-DRP | Draft / Approved / In-Transit / Received / Closed | 🔴 | Workflow state |

**Section B: Line Items**

| # | Field Name | Type | Rules | Mandatory | Notes |
|---|---|---|---|---|---|
| 1 | Item Code | LKP | From active master | 🔴 | — |
| 2 | Lot / Batch | LKP | From source location stock | 🟡 | If item tracking = Lot |
| 3 | Serial Numbers | SUB | One per unit | 🟡 | If item tracking = Serial |
| 4 | UOM | Auto-DRP | From item master | 🔴 | — |
| 5 | Requested Qty | DEC | > 0 | 🔴 | Transfer quantity |
| 6 | Issued Qty | DEC | At issue time | 🔴 | Actual issued |
| 7 | Received Qty | DEC | At destination receipt | 🔴 | Actual received |
| 8 | Variance Qty | Auto-DEC | Issued - Received | 🔴 **[NEW]** | Short/excess |
| 9 | Variance Reason | DRP | In-Transit Loss / Damage / Handling / Incorrect / Other; mandatory if variance > 0 | 🟡 **[NEW]** | Root cause |
| 10 | Damage Flag | TGL | Yes / No | 🟡 **[NEW]** | Flags for inspection |
| 11 | Unit Cost | Auto-CUR | For valuation | 🔴 | From source location |

---

### ⭐ FORM 7: Delivery / Goods Issue

**Purpose:** Ship goods to customer, update COGS ledger.

| # | Field Name | Type | Rules | Mandatory | Notes |
|---|---|---|---|---|---|
| 1 | Delivery No. | Auto-TXT | Format: DEL-2026-00001 | 🔴 | Read-only |
| 2 | Sales Order Reference | LKP | — | 🔴 | Link to SO |
| 3 | Customer | Auto-TXT | From SO, read-only | 🔴 | — |
| 4 | Delivery Date | DATE | — | 🔴 | Dispatch date |
| 5 | Ship-To Address | TXT | From SO or editable | 🔴 | Customer location |
| 6 | Transporter | LKP | From transporter master | 🟡 | Carrier |
| 7 | Vehicle No. | TXT | License plate | 🟢 | Tracking |
| 8 | Dispatch Warehouse / Bin | LKP | Issue from | 🔴 | Source bin |
| 9 | Picking List Reference | LKP | — | 🟡 | Link to pick list |
| 10 | Item / Lot / Serial per line (Sub-table) | SUB | Item, lot/serial, ordered qty, delivered qty | 🔴 | Line items |
| 11 | Ordered Qty / Delivered Qty | DEC | — | 🔴 | Qty comparison |
| 12 | Short-Delivery Reason | DRP | Stock-out / Damage / Customer Request / Other; mandatory if delivered < ordered | 🟡 **[NEW]** | Why underfulfilled |
| 13 | COGS Amount | Auto-CUR | At valuation cost (FIFO/Avg/Std) | 🔴 | For GL posting |
| 14 | E-invoice Reference | TXT | Country compliance (e.g., India e-invoice ID) | 🟡 **[NEW]** | Digital invoice link |
| 15 | Status | System-DRP | Draft / Picked / Dispatched / Delivered / Posted | 🔴 | Workflow |

---

### ⭐ FORM 8: Stock Adjustment

**Purpose:** Record inventory gains, losses, write-offs with approval workflow and GL impact.

**Section A: Header**

| # | Field Name | Type | Rules | Mandatory | Notes |
|---|---|---|---|---|---|
| 1 | Adjustment No. | Auto-TXT | Format: ADJ-2026-00001 | 🔴 | Read-only |
| 2 | Adjustment Date | DATE | Fiscal period validation (no locked periods) | 🔴 | Transaction date |
| 3 | Adjustment Type | DRP | Gain / Loss / Write-Off / Revaluation / QC Rejection | 🔴 **[NEW]** | Category |
| 4 | Company / Branch / Warehouse | LKP | — | 🔴 | Location |

**Section B: Item Details**

| # | Field Name | Type | Rules | Mandatory | Notes |
|---|---|---|---|---|---|
| 5 | Item Code | LKP | Active items only | 🔴 | — |
| 6 | Lot / Batch / Serial | LKP | If tracked | 🟡 | — |
| 7 | UOM | Auto-DRP | From item master | 🔴 | — |
| 8 | System Qty (Before) | Auto-DEC | **Read-only — cannot be edited** | 🔴 **[NEW]** | Current ledger balance |
| 9 | Physical / Adjusted Qty | DEC | User enters actual count | 🔴 **[NEW]** | New balance |
| 10 | Variance Qty | Auto-DEC | Physical - System | 🔴 **[NEW]** | Difference |
| 11 | Unit Cost | Auto-CUR | From valuation layer (read-only or override with approval) | 🔴 | Cost per unit |
| 12 | Variance Value | Auto-CUR | Variance Qty × Unit Cost | 🔴 **[NEW]** | Financial impact |

**Section C: Reason & Approval**

| # | Field Name | Type | Rules | Mandatory | Notes |
|---|---|---|---|---|---|
| 13 | Reason Code | DRP | **Mandatory — no default** | 🔴 | Audit requirement |
| 14 | GL Account | LKP | Default from reason code, overridable by accountant | 🟡 **[NEW]** | P&L impact account |
| 15 | Supporting Document Ref. | TXT | Invoice, survey, QC report number | 🟡 **[NEW]** | Cross-reference |
| 16 | Attachments | FIL | QC report, survey photo, damage report | 🟢 | Evidence |
| 17 | Notes | TXT | Additional context | 🟢 | — |
| 18 | Approval Threshold Flag | System-TGL | Auto-flag if variance value > company threshold (e.g., $1000) | 🔴 **[NEW]** | 2-level approval |
| 19 | Reviewed By | LKP | Warehouse manager or storekeeper | 🔴 **[NEW]** | SoD: separate from approver |
| 20 | Reviewed Date | System-DATE | Auto-captured | 🔴 **[NEW]** | — |
| 21 | Approved By | LKP | Finance manager or CFO if value exceeds threshold | 🔴 | SoD requirement |
| 22 | Approval Date | System-DATE | Auto-captured | 🔴 | — |
| 23 | Status | System-DRP | Draft / Pending Approval / Approved / Posted / Rejected | 🔴 | Workflow |

---

### ⭐ FORM 9: Return to Vendor (RTV)

**Purpose:** Record goods return to vendor, link to debit note.

| # | Field Name | Type | Rules | Mandatory | Notes |
|---|---|---|---|---|---|
| 1 | RTV No. | Auto-TXT | Format: RTV-2026-00001 | 🔴 | Read-only |
| 2 | GRN Reference | LKP | Source of returned goods | 🔴 | Links to receipt |
| 3 | PO Reference | Auto-TXT | Auto-filled from GRN | 🔴 | Read-only |
| 4 | Vendor | Auto-TXT | Auto-filled from GRN | 🔴 | Read-only |
| 5 | Return Date | DATE | — | 🔴 | When returned |
| 6 | Return Reason | DRP | Quality / Expiry / Over-supply / Damage / Wrong Item / Specification Mismatch | 🔴 | Category |
| 7 | Vendor Acknowledgement No. | TXT | Vendor's return authorization number | 🟡 **[NEW]** | For tracking |
| 8 | Debit Note Reference | TXT | Link to AP debit note (for credit) | 🟡 **[NEW]** | AP integration |
| 9 | Lines: Item / Lot / Qty / Cost (Sub-table) | SUB | — | 🔴 | Returned items |
| 10 | Return to Source Bin | LKP | Where to put returned goods in warehouse | 🟡 **[NEW]** | Usually reject/return bin |
| 11 | Credit Expected | TGL | Yes / No | 🟡 **[NEW]** | Refund or exchange |
| 12 | Status | System-DRP | Draft / Approved / Dispatched / Confirmed by Vendor | 🔴 | Workflow |

---

### ⭐ FORM 10: Customer Return (RMA)

**Purpose:** Record and process customer returns with inspection and disposition.

| # | Field Name | Type | Rules | Mandatory | Notes |
|---|---|---|---|---|---|
| 1 | RMA No. | Auto-TXT | Format: RMA-2026-00001 | 🔴 | Read-only |
| 2 | Sales Order / Invoice Reference | LKP | Original SO or invoice | 🔴 | Link to sale |
| 3 | Customer | Auto-TXT | From SO, read-only | 🔴 | — |
| 4 | Return Date | DATE | — | 🔴 | When received |
| 5 | Return Reason | DRP | Defective / Wrong Item / Excess / Damage in Transit / Customer Preference / Other | 🔴 | Category |
| 6 | Lines: Item / Lot / Serial / Qty (Sub-table) | SUB | — | 🔴 | Details |
| 7 | Inspection Result | DRP | Restock / Scrap / Repair / Return to Vendor | 🔴 **[NEW]** | Disposition |
| 8 | Restockable Qty | DEC | Put back to available stock | 🔴 **[NEW]** | Inventory add |
| 9 | Scrap Qty | DEC | Destroyed / unusable | 🟡 **[NEW]** | Inventory reduction |
| 10 | Credit Note Reference | TXT | Link to AR credit note | 🟡 **[NEW]** | AR integration |
| 11 | Status | System-DRP | Draft / Received / Inspected / Closed | 🔴 | Workflow |

---

### ⭐ FORM 11: Stock Count Sheet

**Purpose:** Execute physical inventory count with blind count option, recount thresholds, and variance posting.

**Section A: Header**

| # | Field Name | Type | Rules | Mandatory | Notes |
|---|---|---|---|---|---|
| 1 | Count No. | Auto-TXT | Format: COUNT-2026-00001 | 🔴 | Read-only |
| 2 | Count Plan Reference | LKP | Link to schedule/plan | 🔴 **[NEW]** | Planning reference |
| 3 | Count Type | DRP | Cycle Count / Annual / Spot / ABC-Triggered | 🔴 **[NEW]** | Purpose |
| 4 | Count Date | DATE | — | 🔴 | When counted |
| 5 | Freeze Timestamp | System-DTS | When stock was locked for count (all movements stop) | 🔴 **[NEW]** | Immutable reference point |
| 6 | Company / Branch / Warehouse | LKP | — | 🔴 | Location |
| 7 | Zone / Bin Range | LKP (multi) | Scope of count (e.g., Zone A, or specific bins) | 🟡 | Delimits work |
| 8 | Blind Count Flag | TGL | Yes / No — if Yes, system qty hidden from counters | 🔴 **[NEW]** | For accuracy |
| 9 | Counter 1 (Name) | LKP | Primary counter | 🔴 **[NEW]** | User link |
| 10 | Counter 2 / Supervisor | LKP | For recount or supervision | 🔴 **[NEW]** | SoD / verification |
| 11 | Count Status | System-DRP | Open / In Progress / Pending Recount / Pending Approval / Posted | 🔴 | Workflow |

**Section B: Line Items**

| # | Field Name | Type | Rules | Mandatory | Notes |
|---|---|---|---|---|---|
| 1 | Item Code | Auto-TXT | From count plan | 🔴 | — |
| 2 | Description | Auto-TXT | From item master | 🔴 | — |
| 3 | Bin / Location | Auto-TXT | Physical location | 🔴 | — |
| 4 | Lot / Batch | Auto-TXT | If tracked | 🟡 | — |
| 5 | UOM | Auto-DRP | From item master | 🔴 | — |
| 6 | System Qty (hidden if blind) | System-DEC | Read-only | 🔴 | Current ledger |
| 7 | Count 1 Qty (Counter 1) | DEC | First count by counter 1 | 🔴 **[NEW]** | Actual count |
| 8 | Count 2 Qty (Counter 2) | DEC | If recount triggered | 🟡 **[NEW]** | Verification count |
| 9 | Final Accepted Qty | DEC | After reconciliation (system auto-selects or manager picks) | 🔴 **[NEW]** | Approved balance |
| 10 | Variance Qty | Auto-DEC | Final - System | 🔴 **[NEW]** | Difference |
| 11 | Variance % | Auto-DEC | (Variance / System Qty) × 100 | 🔴 **[NEW]** | % deviation |
| 12 | Variance Threshold Breach | System-TGL | Auto-flag if variance % > company threshold (e.g., 5%) | 🔴 **[NEW]** | Triggers recount |
| 13 | Variance Value | Auto-CUR | Variance Qty × Unit Cost | 🔴 **[NEW]** | Financial impact |
| 14 | Recount Required | System-TGL | Auto-flag if variance % exceeds threshold | 🔴 **[NEW]** | QA control |
| 15 | Count Note | TXT | Line-level observation (e.g., "damaged lid") | 🟢 | — |

**Section C: Approval**

| # | Field Name | Type | Rules | Mandatory | Notes |
|---|---|---|---|---|---|
| 1 | Counted By | System-TXT | Auto-captured | 🔴 | Audit trail |
| 2 | Supervised By | LKP | Storekeeper/manager | 🔴 **[NEW]** | SoD |
| 3 | Approved By | LKP | Finance/inventory manager | 🔴 | Final sign-off |
| 4 | Approval Date | System-DATE | Auto-captured | 🔴 | — |
| 5 | Variance Root-Cause | TXT | Mandatory if variance > 0: "Theft", "Evaporation", "Record Error", "Scale Calibration", etc. | 🟡 **[NEW]** | Investigation |

---

### ⭐ FORM 12: Cost Revaluation / Write-Down Proposal

**Purpose:** Propose and approve inventory value adjustments (NRV, obsolescence, standard cost revision).

| # | Field Name | Type | Rules | Mandatory | Notes |
|---|---|---|---|---|---|
| 1 | Proposal No. | Auto-TXT | Format: WD-2026-00001 | 🔴 | Read-only |
| 2 | Date | DATE | — | 🔴 | Proposal date |
| 3 | Proposal Type | DRP | NRV Write-Down / Obsolescence / Expiry Loss / Standard Cost Revision | 🔴 **[NEW]** | Category |
| 4 | Item / Category scope | LKP (multi) | Single item or bulk (category-wide) | 🔴 | Scope |
| 5 | Current Cost (system) | Auto-CUR | From valuation ledger, read-only | 🔴 | Baseline |
| 6 | Proposed NRV / New Cost | CUR | > 0 or = 0 (full write-off) | 🔴 | New value |
| 7 | Write-Down Amount (total) | Auto-CUR | Current - Proposed (if negative, shown as loss) | 🔴 | Financial impact |
| 8 | Justification | TXT | Mandatory — why write-down needed | 🔴 **[NEW]** | Business reason |
| 9 | Supporting Market Price Evidence | FIL | E.g., market survey, vendor quote, obsolescence report | 🟡 **[NEW]** | Documentation |
| 10 | Reversal Eligible | TGL | Yes / No per IAS 2 reversal rules | 🟡 **[NEW]** | Accounting treatment |
| 11 | Approved By (CFO/Controller) | LKP | Senior approval required | 🔴 **[NEW]** | CFO sign-off |
| 12 | GL Impact Preview | Auto-TXT | "Dr [Write-Off Expense] Cr [Inventory] — [Amount]" | 🔴 **[NEW]** | Shows posting |
| 13 | Status | System-DRP | Draft / Pending Approval / Approved / Posted | 🔴 | Workflow |

---

## 6) 🧮 Valuation & Costing Framework

### 6.1 Supported Methods Detailed
| Method | Description | When to Use | GL Impact |
|---|---|---|---|
| **FIFO** | First lot received = first lot issued | High inflation, stable supply | Daily lot cost tracking |
| **Moving Weighted Average** | Cost recalculated on each receipt | Volatile market, frequent purchases | Smoother COGS |
| **Standard Cost** | Fixed cost with variance tracking | Mass manufacturing, stable products | Variance reports for analysis |
| **LIFO** | Last lot received = first lot issued | Feature-flagged; US/specific countries | Feature toggle |

### 6.2 Cost Component Hierarchy
```
LANDED COST BREAKDOWN:
├─ Base Cost (Item Cost at Purchase)
│  └─ Unit Price from PO
├─ Transportation & Logistics
│  ├─ Freight
│  ├─ Insurance
│  └─ Handling Charges
├─ Trade & Customs
│  ├─ Customs Duty
│  ├─ Import Tax
│  └─ Clearing Charges
└─ Receiving & Storage (optional)
   ├─ Unloading
   └─ Initial Storage
```

### 6.3 NRV & Obsolescence Controls
- **Slow-Moving:** Items with 0 movement for X days (configurable, default 180)
- **Near-Expiry:** Alert X days before shelf-life expiry
- **Damaged/Defective:** Flagged from QC inspections
- **Obsolete:** Market price falls below carrying cost
- **Superseded:** New version released, old stock unwanted

**Control Flow:**
1. System auto-generates write-down proposals
2. Cost accountant reviews evidence
3. CFO approves
4. GL posting + audit log

---

## 7) 🧷 Internal Controls & Security Model

### 7.1 Role-Based Access Control (RBAC)

| Role | Key Responsibilities | Transaction Access |
|---|---|---|
| **Inventory Admin** | Master data setup, config, company-wide access | Item Master, Warehouse Master, tax config |
| **Storekeeper** | Daily receipt, issue, transfers, adjustments | GRN, Delivery, Transfer, Adjustment (threshold) |
| **Procurement Officer** | PR, PO creation and submission | PR, PO creation; approver if authorized |
| **Finance Manager / Cost Accountant** | Validation, landed cost, write-downs, GL mapping | Valuation forms, approval workflows, GL account mapping |
| **QC Inspector** | Goods inspection, QC status | GRN QC section, RMA inspection |
| **Sales / Fulfillment** | Delivery, pick list, RMA | Delivery, RMA initiation |
| **CFO / Controller** | High-value approvals, policy oversight | High-value adjustment, write-down final approval |
| **Auditor** | Read-only audit access | All forms read-only with audit trail visible |

### 7.2 Approval Matrix (By Transaction Type & Value)

| Transaction | Trigger | Level 1 Approver | Level 2 Approver (if $> Threshold) |
|---|---|---|---|
| **Purchase Order** | All POs | Procurement Manager | Finance Manager (if > $10K) |
| **Stock Adjustment** | Any adjustment | Warehouse Manager | Finance Manager (if > $1K variance) |
| **Write-Down Proposal** | All write-downs | Finance Manager | CFO (always required) |
| **Backdated Transaction** | Any backdate > 30 days | System Admin | Finance Manager |
| **Period Lock Override** | Any locked period access | Finance Manager | CFO |
| **GRN QC Rejection** | Rejection Qty > 10% | QC Inspector | Procurement Manager |

### 7.3 Segregation of Duties (SoD)

**Critical SoD Rules (Hard-Coded):**
1. **Requester ≠ Approver:** PR creator ≠ PO approver
2. **Receiver ≠ Approver:** GRN creator (storekeeper) ≠ adjustment approver (finance)
3. **Poster ≠ Adjuster:** Adjustment creator ≠ GL poster
4. **Counter ≠ Supervisor:** Count entry ≠ count approval (different users)
5. **Override Requirement:** Price overrides require documented justification + approval

### 7.4 Mandatory Audit Events

**MUST CAPTURE (Immutable Log):**
1. **Create Event:** User, timestamp, all field values, IP, session ID
2. **Update:** User, timestamp, field name, old value, new value
3. **Delete Attempt:** User, timestamp, reason, status (blocked if no reason)
4. **Status Change:** User, timestamp, from status → to status
5. **Price/Cost Change:** User, old cost, new cost, reason code
6. **Manual Override:** Field, old value, new value, justification, approver
7. **Approval:** User, timestamp, comments (if any)
8. **GL Posting:** User, posting date, GL entries debited/credited
9. **Approval Rejection:** User, timestamp, rejection reason
10. **Login/Logout:** User, timestamp, location/IP

### 7.5 Hard Validations (Cannot Bypass)

| Validation | Consequence | User Message |
|---|---|---|
| Duplicate serial number (globally or per company) | Block save | "Serial number already exists in system" |
| Posting in locked fiscal period | Block posting | "Fiscal period locked — contact Finance" |
| Reason code missing for adjustment | Block save | "Reason code is mandatory for adjustments" |
| UOM mismatch | Block GRN receipt | "Purchase UOM does not match PO — confirm override" |
| Inactive item in new transaction | Block save | "Item is inactive — contact inventory admin" |
| Over-receipt beyond tolerance | Block or escalate | "Over-receipt exceeds 5% tolerance — approval required" |
| Negative stock (if policy = OFF) | Hard block | "Negative stock not allowed — insufficient qty" |
| Expired lot in outbound delivery | Block | "Item has expired — use alternate lot or write-off" |

---

## 8) 📊 Reports Blueprint

### 8.1 Operational Reports (Transactional)

| Report | Purpose | Key Filters | Update Frequency |
|---|---|---|---|
| **Stock On Hand (SOH)** | Real-time inventory visibility by item-location-bin | Warehouse, item, category, date snapshot | Real-time |
| **Stock Movement Register** | Trace all movements in period | Date range, item, warehouse, transaction type | Daily |
| **In-Transit Inventory** | Items in-movement between locations | Source, destination, item, date range | Real-time |
| **Batch/Lot/Serial Traceability** | Forward + backward trace of specific batch | Lot/serial number, date from-to | Real-time |
| **Expiry & Near-Expiry** | Items approaching/past expiry date | Days to expiry, item, warehouse, category | Daily |
| **Reorder & Stock-Out Risk** | Items below reorder point or stockout risk | Item, warehouse, lead time visibility | Daily |
| **Negative Stock Exceptions** | Items with negative or zero balance | By warehouse (if policy allows negative) | Real-time |
| **Slow-Moving Inventory** | Items with zero movement > threshold (e.g., 180 days) | Threshold (days), item, warehouse, last movement date | Weekly |
| **ABC Classification Report** | Items by value classification (A=high, C=low) | Warehouse, period, value threshold | Monthly |

### 8.2 Financial & Valuation Reports

| Report | Purpose | Key Filters | Update Frequency |
|---|---|---|---|
| **Inventory Valuation** | Balance sheet inventory value by costing method | Warehouse, item, method (FIFO/Avg/Std), date, currency | Monthly |
| **COGS Reconciliation** | Link Inventory GL ↔ Delivery ledger | Period, company, item | Monthly period-end |
| **GRNI (Goods Received Not Invoiced)** | GRNs awaiting AP invoice | Vendor, date, GRN age, amount | Daily |
| **Landed Cost Variance** | Import cost allocation vs actual | LC document, GRN, cost type, variance % | On posting |
| **Write-Down / Write-Off Summary** | Adjustments posted, reason, amount | Date, adjustment type, reason code, item | Monthly |
| **Standard Cost Variance** | Actual purchase price vs standard cost | Item, period, variance (qty, price), reason | Monthly |
| **Purchase Price Analysis** | Price trend by item and vendor | Item, vendor, period, price movement | Monthly |

### 8.3 Control & Audit Reports

| Report | Purpose | Key Filters | Update Frequency |
|---|---|---|---|
| **Adjustment Approval Report** | All adjustments by status and approver | Date, status, approver, reason code | Daily |
| **Backdated Transaction Report** | Transactions posted to prior periods | Transaction type, user, date posted vs period date | Daily |
| **User Activity & Override Log** | All overrides by user and transaction | User, date, override type (price, qty, GL), justification | Real-time |
| **Count Variance Analysis** | Physical count variances by item and warehouse | Count date, warehouse, variance %, root cause | After count posting |
| **Duplicate/Invalid Serial Report** | QC control for serial uniqueness | Company, date, serial duplicate instances | Weekly |
| **SoD Violation Alerts** | Transactions violating segregation of duties | Role, user, transaction type, violation type | Real-time |
| **Approval Workflow Report** | All approvals pending or completed | Status, approver, transaction type, age | Daily |

### 8.4 Standard Report Filters (All Reports Support)
- **Date Range:** From date, to date
- **Company / Branch / Warehouse:** Single or multi-select
- **Item / Category / Brand:** Single or multi-select
- **Lot / Serial / Batch:** Specific identifier search
- **Vendor / Customer:** Single or multi-select
- **Status:** Draft / Approved / Posted (multi-select)
- **Currency:** Report currency (base or transaction)
- **User / Role:** Filter by creator or approver
- **Reason Code:** For adjustment-related reports
- **Export Format:** PDF, Excel, CSV

---

## 9) 🔗 Integration Blueprint  

### 9.1 Core Module Dependencies

| Module | Integration Points | Data Flow |
|---|---|---|
| **Procurement** | PR → PO → GRN → AP Invoice | Quantity, cost, approvals |
| **Accounts Payable (AP)** | GRN → 3-way match → Invoice → Payment | Cost, invoice matching, payment terms |
| **Sales** | SO → Allocation → Delivery → SI → AR | Quantity, COGS, revenue recognition |
| **Accounts Receivable (AR)** | Delivery → Invoice → RMA → Credit Note | Revenue, returns, credits |
| **General Ledger (GL)** | All postable transactions | Debits/credits, period, account |
| **Tax Engine** | All tax calculations on PO, GRN, Delivery, AP | Tax code, rate, amount |
| **Manufacturing (Optional)** | BOM → Consumption → Production Receipt | Item, quantity, cost |
| **Warehouse Management (WMS, Optional)** | Bin assignment, barcode scanning, pick lists | Location, serial, batch, cycle |
| **E-commerce Integration (Optional)** | SO → Inventory ATP (Available to Promise) | Real-time stock visibility |
| **POS Integration (Optional)** | Point-of-Sale transactions → Inventory reduction | Real-time stock deduction |

### 9.2 Key GL Posting Events

| Event | GL Entries | Trigger | Posted By |
|---|---|---|---|
| **GRN Received** | Dr Inventory Cr GRNI (Goods Received Not Invoiced) | GRN posting | System auto |
| **AP Invoice Match** | Dr GRNI Cr Accounts Payable | 3-way match approval | System auto |
| **Delivery Posted** | Dr COGS Cr Inventory (at valuation cost) | Delivery posting | System auto |
| **Stock Adjustment Gain** | Dr Inventory Cr Inventory Gain (Income) | Adjustment posting | System auto |
| **Stock Adjustment Loss** | Dr Inventory Loss (Expense) Cr Inventory | Adjustment posting | System auto |
| **Write-Down** | Dr Write-Off Expense Cr Inventory | Write-down posting | System auto |
| **Landed Cost Allocation** | Dr Inventory Cr Freight/Duty Payable | LC posting | System auto |
| **Standard Cost Variance** | Dr/Cr Variance Account Cr/Dr COGS | At delivery (if variance) | System auto |

### 9.3 Real-Time Sync Requirements
- **Stock-on-hand:** Should update in sales module (ATP) in real-time
- **Cost updates:** COGS calculations in SI should use latest valuation
- **Serial/Lot blocking:** If serial expires, block in outbound sales
- **Negative stock:** Trigger AR credit hold (if policy enabled)

---

## 10) 🌐 Multi-Country Localization Layer

### 10.1 Country-Level Configuration Pack

**Per-country deployments require these settings:**

| Config Item | Example France | Example India | Example USA |
|---|---|---|---|
| **Base Currency** | EUR | INR | USD |
| **Reporting Currency** | EUR | INR | USD |
| **Tax Profile** | VAT 20% | GST 18% | Sales Tax (varies) |
| **Costing Method** | FIFO/Avg | FIFO/Avg | FIFO/LIFO/Avg |
| **Negative Stock Policy** | OFF (forbidden) | OFF | ON (allowed, at discretion) |
| **Lot Tracking** | Optional | Optional | Optional |
| **Serial Tracking** | Optional | Optional | Required (electronics) |
| **Expiry Policy** | By expiry date | By expiry date | Optional |
| **Fiscal Calendar** | Jan-Dec | Apr-Mar (by default) | Jan-Dec |
| **Document Numbering** | FR-2026-00001 | IN-2026-00001 | US-2026-00001 |
| **Date Format** | DD.MM.YYYY | DD-MM-YYYY | MM/DD/YYYY |
| **Decimal Precision** | 2 | 2 | 2 |
| **Language Pack** | French | Hindi/Urdu/English | English |
| **Local Compliance Reports** | Inventory Certification | ICAI Audit Trail | SoX 404 Compliance |

### 10.2 Currency & FX Management

```
Transaction Entry:
  ├─ Transaction Currency (vendor payment currency, e.g., EUR)
  ├─ Rate at Transaction Date (spot or manual with approval)
  ├─ Base Currency Conversion (e.g., EUR → INR)
  └─ Reporting Currency (if different from base)

GL Posting:
  ├─ Always in base currency
  ├─ FX Difference → separate FX Gain/Loss GL account
  └─ Audit trail of rate used
```

### 10.3 UOM, Packaging, Units Support

- **Metric:** kg, liter, meter, CBM
- **Imperial:** lb, gallon, inch, feet
- **Count:** pieces, units, boxes
- **Packaging Hierarchy:** Unit → Box → Case → Pallet (with conversion factors)

---

## 11) ⚙️ Performance & Data Governance

### 11.1 Performance Targets (Recommended SLAs)

| Operation | Target Time | Scenario |
|---|---|---|
| Stock lookup by item-warehouse | < 2 sec | 1M+ items |
| Standard transaction posting (GRN, Delivery) | < 3 sec | Normal load |
| Large report generation (1 year, all items) | Async queue | Scheduled off-peak |
| Batch operations (e.g., cost revaluation) | Background job | Queued with progress |
| Real-time ATP (Available to Promise) | < 1 sec | Sales integration |

### 11.2 Data Quality Controls

| Control | Risk Mitigated |
|---|---|
| Item code uniqueness constraint | Duplicate items, data confusion |
| UOM conversion validation | Qty miscalculuation, cost errors |
| GL account existence check | Orphaned posting, unbalanced GL |
| Lot/serial duplicate detection | Traceability loss |
| Inactive master usage rules | Obsolete data in transactions |
| Date range validation | Period lock violations |
| Currency code validation | FX calculation errors |

### 11.3 Archival & Data Retention (Per country law)

| Data Type | Retention Period | Archival Method |
|---|---|---|
| Transactions (GRN, Delivery, etc.) | 7-10 years (varies by country) | Cold storage archive |
| Audit logs | 7 years minimum | Immutable, encrypted logs |
| Master data changes | 7 years | Versioned snapshots |
| GL posted entries | 7-10 years | GL archive |
| Backup & recovery | 2+ years rolling | Replicated snapshots |

### 11.4 Backup & Disaster Recovery

- **Daily automated backups** of all transactional data
- **Immutable audit logs** (cannot be altered or deleted)
- **Recovery time objective (RTO):** < 4 hours
- **Recovery point objective (RPO):** < 1 hour

---

## 12) ✅ UAT & Go-Live Checklist

### 12.1 Functional UAT Scenarios (Must Pass Before Go-Live)

| Scenario | Test Case | Pass Criteria |
|---|---|---|
| **Procure-to-Stock** | PO → GRN (with QC) → AP Invoice 3-way match | All three documents synchronized, GL posted correctly |
| **Sales-to-COGS** | SO → Delivery → Invoice, COGS posted at correct cost method | COGS amount matches valuation method, GL balance correct |
| **Inter-Warehouse Transfer** | Request → Issue → In-transit → Receipt with short | Stock reduced in source, increased in destination, variance logged |
| **Batch Expiry Control** | Item with expiry → Near-expiry alert → Delivery blocks expired batch | Alert triggered at X days, blocked at expiry date |
| **Cycle Count Variance** | Blind count → Variance > threshold → Auto-recount → Approval → Posting | Variance captured, recount triggered, GL updated |
| **Month-End Reconciliation** | Inventory GL (opening + receipts - issues) vs Quantity ledger | Balances match; GL COGS ↔ quantity COGS reconcile |
| **Write-Down Approval** | Obsolete item → Proposal → Manager review → CFO approval → GL posting | Approval workflow enforced, GL impact recorded |
| **Standard Cost Variance** | Std cost = $10, actual purchase = $12, delivery posted | Variance recorded separately, COGS at standard cost |

### 12.2 Data Migration & Cutover

- **Opening Stock:** All items with opening qty and cost agreed with finance
- **Cost Layer Validation:** Valuation ledger layers populated correctly per costing method
- **Serial/Lot Migration:** All tracked items' serial/lot numbers migrated and no duplicates
- **GL Account Mapping:** All item GL accounts configured and tested
- **Master Data Sign-Off:** Item master, warehouse master, vendor master signed by business

### 12.3 Access Control & SoD Verification

- ✅ Roles assigned to users per RBAC matrix
- ✅ Approval authorities configured and tested (PO, Adjustment, Write-Down)
- ✅ Period locking configured
- ✅ Backdating policy defined and enforced
- ✅ Audit logs enabled and tested

### 12.4 Configuration Verification

- ✅ Company, branch, warehouse setup complete
- ✅ Fiscal calendar and periods configured
- ✅ Document numbering format set per company
- ✅ Tax codes mapped to tax engine
- ✅ Costing method (FIFO/Avg/Std) selected and configured
- ✅ Negative stock policy set (ON/OFF)
- ✅ Reorder point, safety stock, ABC classification populated
- ✅ Approval thresholds set for each transaction type

---

## 13) 🗺️ Suggested Build Phasing

### Phase A: Foundation (Weeks 1-4)
- Item Master form + validation
- Warehouse/Zone/Bin Master form
- Stock On Hand report
- Basic inventory setup screens

### Phase B: Core Transactions (Weeks 5-10)
- Purchase Order form (PO creation, approval)
- Goods Receipt Note (GRN) form
- Delivery / Goods Issue form
- Stock Transfer form
- Stock Adjustment form

### Phase C: Valuation & Finance Integration (Weeks 11-16)
- Costing engine (FIFO, Weighted Avg, Std Cost)
- Landed Cost Allocation form
- GL posting logic for all transactions
- Financial reconciliation reports

### Phase D: Controls & Compliance (Weeks 17-22)
- Approval workflows (PO, Adjustment, Write-Down)
- Audit trails (all transaction events)
- Period locking
- SoD enforcement
- Advanced reports (Variance, Traceability, Control)

### Phase E: Advanced Features (Weeks 23+)
- FEFO/FIFO picking optimization
- Demand forecasting
- 3PL consignment management
- Mobile barcode scanning (WMS)
- E-commerce integration (ATP)

---

## 14) 🎯 Final Recommendations for Your Development Team

### For Form Designers:
✅ Use this document**exact field specifications** (name, type, mandatory flag, validation)  
✅ Follow the header + line-item structure for multi-line forms  
✅ Implement audit trail fields (created by, date, modified by, date) systemically  
✅ Add print layouts for all transactional forms  

### For Developers:
✅ Implement **hard validations** (cannot bypass)  
✅ Build audit logging at database trigger level  
✅ Enforce **SoD constraints** in business logic  
✅ Set up GL posting queues (transactional integrity)  
✅ Create **immutable audit tables** (no deletes, no updates)  

### For QA / Testers:
✅ Use UAT scenarios (Section 12.1) as test scripts  
✅ Verify all **approval workflows** end-to-end  
✅ Test **data migration** with production-like volumes  
✅ Validate GL balances post-transaction posting  

### For Business Analysts:
✅ Map customer processes to these forms sequentially  
✅ Configure **company-specific parameters** (Section 10.1)  
✅ Validate approval matrix matches customer org structure  
✅ Document any country-specific exceptions or extensions  

---

## Appendix A: Minimum Master Configuration per Company

```
COMPANY SETUP CHECKLIST:

1. Company & Organization
   ☐ Company code
   ☐ Company name
   ☐ Base currency
   ☐ Tax profile (VAT/GST rate)
   ☐ Fiscal calendar (Jan-Dec or Apr-Mar)
   ☐ Costing method (FIFO / Avg / Std Cost)
   ☐ Negative stock policy (ON / OFF)

2. Warehouse Hierarchy
   ☐ Main warehouse(s)
   ☐ Zones & bins
   ☐ Inbound & outbound staging bins
   ☐ Temperature class compliance (if applicable)

3. Accounts (GL Mapping)
   ☐ Inventory account
   ☐ COGS account
   ☐ GRNI account
   ☐ Write-off expense account
   ☐ Price variance account (if Std Cost)

4. Approval Thresholds
   ☐ PO approval limit
   ☐ Adjustment approval limit
   ☐ Write-down approval (CFO always)
   ☐ Backdate approval limit

5. Item Master Data
   ☐ All active products
   ☐ UOM conversions
   ☐ Tracking mode (Lot/Serial/None)
   ☐ Reorder points & safety stock
   ☐ Tax categories

6. User Access
   ☐ Roles assigned per RBAC
   ☐ Approval authorities configured
   ☐ Period lock configuration
```

---

## Appendix B: Critical KPIs for Monitoring

```
INVENTORY HEALTH METRICS:

1. Operational Metrics
   ☐ Inventory Turnover Ratio = COGS / Avg Inventory Value
   ☐ Days Inventory Outstanding (DIO) = 365 / Turnover
   ☐ Stock-out Rate (%) = Stockouts / Total Orders × 100
   ☐ Count Accuracy (%) = Items counted correctly / Total counted
   ☐ Cycle Count Variance (%) = Variance Qty / System Qty

2. Financial Metrics
   ☐ Carrying Cost (%) = (Storage + Obsolescence + Damage) / Avg Inventory
   ☐ Write-Off Loss (%) = Write-offs / Avg Inventory Value
   ☐ COGS Variance (%) = (Actual - Standard) / Standard Qty
   ☐ Landed Cost Variance (%) = (Actual - Budgeted) / Budgeted

3. Process Metrics
   ☐ GRN to Invoice Cycle Time (days)
   ☐ Transfer Lead Time (days) — source to destination
   ☐ SO to Delivery Time (days)
   ☐ Appr approval cycle time (%) on-time

4. Compliance Metrics
   ☐ SoD Violations (count) — should be 0
   ☐ Backdated Transactions (%) — should be minimal
   ☐ Approval Override Rate (%) — should be < 5%
   ☐ Audit Trail Completeness (%) — should be 100%
```

---

## Appendix C: Comparison Matrix (Forms at a Glance)

| Form | Purpose | Transaction Type | Approval Required | GL Posting |
|---|---|---|---|---|
| **PO** | Purchase order | Inbound | Yes (manager) | No |
| **GRN** | Receipt from vendor | Inbound | Yes (QC) | **Yes** (Inventory/GRNI) |
| **Landed Cost** | Import cost allocation | Inbound supplementary | No | **Yes** (Freight/Duties) |
| **Stock Transfer** | Move between warehouses | Internal | Optional (if value > threshold) | No |
| **Delivery** | Goods issue to customer | Outbound | No | **Yes** (COGS/Inventory) |
| **Stock Adjustment** | Gain/loss/write-off | Internal | Yes (if value > threshold) | **Yes** (Variance accounts) |
| **RTV** | Return to vendor | Internal-Outbound | No | No (reverses GRN) |
| **RMA** | Customer return | Inbound Returns | No | **Yes** (if postable) |
| **Stock Count** | Physical count | Inventory | Yes (manager approval) | **Yes** (variance accounts) |
| **Write-Down** | NRV/obsolescence | Adjustment | Yes (CFO) | **Yes** (Write-off account) |

---

**Document Version:** 3.0 (Final Merged) | **Last Updated:** 2026-03-03 | **Status:** Ready for Form & Development Implementation

---

