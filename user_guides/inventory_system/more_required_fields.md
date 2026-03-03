# 📦 Inventory Module — International Standards Blueprint v2.0
> **ERP System | Complete Form & Field Specification**
> Updated: 2026-03-03 | Status: Phase-2 Ready

---

## 🎯 Document Purpose

Ye document Inventory Module ka **mukamal global-level blueprint** hai jisme:
- Original functional design
- Har form ka complete field specification (data type, mandatory/optional, validation)
- Gap analysis — pehle jo missing tha wo sab add kar diya gaya hai
- International compliance mapping
- Controls, approvals, audit requirements

**Ye document directly form design team aur developers ke liye ready input hai.**

---

## 1) 🌍 Global Design Principles

### 1.1 Core Goals
1. **Accurate stock visibility** — real-time, location-wise
2. **Compliant valuation** — IFRS/IAS + local GAAP ready
3. **Strong controls** — audit trail, approvals, segregation of duties
4. **Multi-country readiness** — tax, currency, language, calendar, legal docs
5. **Scalable architecture** — SME se enterprise tak

### 1.2 Operating Model
- Multi-company, Multi-branch / warehouse / bin / zone
- Multi-currency, Multi-UOM
- Batch / lot / serial tracking
- Expiry-aware inventory
- Landed cost allocation
- Optional consignment & 3PL support

---

## 2) 📚 International Standards & Compliance Mapping

### 2.1 Accounting Standards

| Standard | Requirement |
|---|---|
| IAS 2 | Cost formula, NRV, write-down/reversal |
| IAS 21 | Foreign currency purchase impact |
| IAS 8 | Costing policy change governance |
| IAS 36 | Slow/obsolete stock impairment |
| IFRS 15 | COGS timing with revenue recognition |
| ASC 330 | US GAAP inventory measurement |
| ASC 606 | US GAAP sales-COGS alignment |

**Valuation Methods Supported:**
- FIFO
- Moving Weighted Average
- Standard Cost (variance tracking)
- LIFO *(feature-flagged — country dependent)*

### 2.2 Tax & Trade Requirements
- VAT / GST / Sales Tax at purchase and sale side
- Input tax claim controls
- Customs duties into landed cost
- Withholding tax (where applicable)
- E-invoice / digital invoice (country plug-in layer)
- Incoterms 2020 reference fields

### 2.3 Data & Traceability Standards
- GS1-compatible product identifiers (GTIN, barcode, optional SSCC)
- Full audit trail (who / when / what / before / after)
- Lot/serial traceability — forward + backward
- Recall-ready reporting for regulated sectors

### 2.4 Control & Audit Expectations
- **SoD:** requester ≠ approver ≠ receiver ≠ poster
- Maker-checker approvals for sensitive transactions
- Period locking + backdate control
- Reason codes mandatory for adjustments, write-offs, returns

---

## 3) 🧱 Inventory Data Model Blueprint

### 3.1 Master Data Objects
1. Item Master
2. Warehouse / Zone / Bin Master
3. Business Partner Master (Vendor, Customer, Transporter, 3PL)
4. UOM Master + Conversion Table
5. Reference Masters (reason codes, status codes, adjustment types)

### 3.2 Transactional Objects
- Purchase Requisition (PR)
- Purchase Order (PO)
- Goods Receipt Note (GRN)
- Purchase Invoice (AP Bill link)
- Goods Issue / Delivery
- Sales Invoice (AR link)
- Stock Transfer Request / Issue / Receipt
- Stock Adjustment
- Production Consumption / Receipt
- Return to Vendor (RTV)
- Customer Return (RMA)
- Stock Count (Cycle / Annual)
- Landed Cost Allocation
- Cost Revaluation / Write-down Proposal

### 3.3 Ledger Layers
| Ledger | Purpose |
|---|---|
| Quantity Ledger | Stock movement by item-location |
| Valuation Ledger | Cost layer by item-location-method |
| Audit Ledger | Full event trail — immutable |

---

## 4) 🔄 End-to-End Process Flows

### 4.1 Procure-to-Stock (P2S)
```
PR → PO Approval → Inbound Planning → GRN → QC Inspection
→ Accepted Qty to Stock → Rejected to Return Bin
→ Landed Cost Allocation → AP 3-Way Match → GL Posting
```
**Controls:** Over-receipt tolerance | Mandatory lot/serial | UOM mismatch block

### 4.2 Stock-to-Sale (S2S)
```
Sales Order → Allocation/Reservation → Pick List → Packing
→ Dispatch → Delivery Confirmation → Sales Invoice → COGS Posting
```
**Controls:** Negative stock policy | FEFO/FIFO picking | Credit hold integration

### 4.3 Internal Stock Transfer
```
Transfer Request → Approval → Issue from Source
→ In-Transit Tracking → Receipt at Destination → Variance Handling
```

### 4.4 Inventory Adjustment & Write-Off
```
Adjustment Request + Reason Code → Approval (threshold-based)
→ Qty/Cost Simulation → Posting → Audit Log Entry
```

### 4.5 Returns Flows
- **RTV:** Quality issue, expiry, over-supply → Vendor
- **RMA:** Customer return → Inspection → Restock / Scrap

### 4.6 Physical Count
```
Count Plan → Freeze → Blind Count Entry → Recount (if variance)
→ Approval → Posting → Variance Root-Cause Analytics
```

---

## 5) 📋 FORMS — Complete Field Specifications

> **Legend:**
> - 🔴 Mandatory | 🟡 Conditional | 🟢 Optional
> - **[NEW]** = Gap analysis se add kiya gaya field

---

### FORM 1: Item Master

**Header Fields:**

| # | Field Name | Type | Rule | Status |
|---|---|---|---|---|
| 1 | Item Code | Text (unique, auto/manual) | Unique constraint, no spaces | 🔴 |
| 2 | Item Name (Short) | Text (50 chars) | Required | 🔴 |
| 3 | Item Name (Long / Description) | Text (250 chars) | — | 🟢 |
| 4 | Item Status | Dropdown | Active / Inactive / Discontinued / Blocked | 🔴 **[NEW]** |
| 5 | Item Type | Dropdown | Raw Material / Finished Good / Trading / Consumable / Service-Non-Stock | 🔴 |
| 6 | Item Class | Dropdown | Linked to master list | 🔴 |
| 7 | Item Category | Dropdown | Child of Class | 🔴 |
| 8 | Item Group | Dropdown | Child of Category | 🟡 |
| 9 | Brand | Text / Dropdown | — | 🟢 |
| 10 | Item Image | File attachment | JPG/PNG only | 🟢 **[NEW]** |

**Tracking & UOM:**

| # | Field Name | Type | Rule | Status |
|---|---|---|---|---|
| 11 | Tracking Mode | Dropdown | None / Lot / Serial | 🔴 |
| 12 | Stock UOM | Dropdown | From UOM master | 🔴 |
| 13 | Purchase UOM | Dropdown | May differ from Stock UOM | 🔴 **[NEW]** |
| 14 | Sales UOM | Dropdown | May differ from Stock UOM | 🔴 **[NEW]** |
| 15 | UOM Conversion Table | Sub-table | Purchase UOM → Stock UOM → Sales UOM with factor | 🔴 **[NEW]** |
| 16 | Packaging Hierarchy | Sub-table | Unit / Box / Case / Pallet with qty per level | 🟡 **[NEW]** |

**Costing & Procurement:**

| # | Field Name | Type | Rule | Status |
|---|---|---|---|---|
| 17 | Costing Method | Dropdown | FIFO / Moving Average / Standard Cost | 🔴 |
| 18 | Standard Cost | Currency | Required if Standard Cost method | 🟡 |
| 19 | Last Purchase Price | Currency | Auto-updated, read-only | 🟢 |
| 20 | Minimum Order Qty (MOQ) | Decimal | For PO generation | 🟡 **[NEW]** |
| 21 | Reorder Point | Decimal | Triggers reorder alert | 🟡 |
| 22 | Safety Stock | Decimal | Buffer level | 🟡 |
| 23 | Maximum Stock Level | Decimal | Overstock alert | 🟢 |
| 24 | Lead Time (days) | Integer | For reorder planning | 🟡 **[NEW]** |
| 25 | Default Vendor | Lookup | From vendor master | 🟢 **[NEW]** |
| 26 | Substitute Items | Multi-lookup | Stock-out fallback items | 🟢 **[NEW]** |

**Expiry & Storage:**

| # | Field Name | Type | Rule | Status |
|---|---|---|---|---|
| 27 | Expiry Tracking | Toggle | Yes / No | 🔴 |
| 28 | Shelf Life (days) | Integer | Required if expiry ON | 🟡 |
| 29 | Expiry Basis | Dropdown | Manufacturing Date / Receipt Date | 🟡 **[NEW]** |
| 30 | Near-Expiry Alert (days) | Integer | Alert X days before expiry | 🟡 **[NEW]** |
| 31 | Storage Temperature Class | Dropdown | Ambient / Chilled / Frozen / Controlled | 🟢 **[NEW]** |
| 32 | Hazardous Material Flag | Toggle | Triggers compliance checks | 🟡 **[NEW]** |

**Physical Attributes:**

| # | Field Name | Type | Rule | Status |
|---|---|---|---|---|
| 33 | Gross Weight (kg) | Decimal | For freight/WMS | 🟢 **[NEW]** |
| 34 | Net Weight (kg) | Decimal | — | 🟢 **[NEW]** |
| 35 | Volume (CBM) | Decimal | For container planning | 🟢 **[NEW]** |
| 36 | Dimensions (L×W×H cm) | Text | — | 🟢 **[NEW]** |

**Tax & Trade Compliance:**

| # | Field Name | Type | Rule | Status |
|---|---|---|---|---|
| 37 | Tax Category | Dropdown | Linked to tax engine | 🔴 |
| 38 | HSN Code / SAC Code | Text | GST/VAT compliance | 🟡 **[NEW]** |
| 39 | HS Tariff Code | Text | Customs classification | 🟡 **[NEW]** |
| 40 | Country of Origin | Dropdown | ISO country list | 🟡 **[NEW]** |
| 41 | Barcode / GTIN | Text | GS1 format validation | 🟡 |
| 42 | Alternate Barcodes | Sub-table | Multiple symbologies | 🟢 **[NEW]** |

**Alternate Codes & Identifiers:**

| # | Field Name | Type | Rule | Status |
|---|---|---|---|---|
| 43 | Alternate Item Codes | Sub-table | Code / Type (Supplier/Customer/Internal) / Vendor Link | 🟡 **[NEW]** |
| 44 | Inspection Required | Toggle | Triggers QC workflow on GRN | 🟡 **[NEW]** |
| 45 | Consignment Item Flag | Toggle | For 3PL/vendor consignment | 🟢 **[NEW]** |

**Classification & Analytics:**

| # | Field Name | Type | Rule | Status |
|---|---|---|---|---|
| 46 | ABC Classification | Dropdown | A / B / C | 🟡 **[NEW]** |
| 47 | Slow-Moving Threshold (days) | Integer | Days without movement = slow-moving | 🟢 **[NEW]** |

**GL Mapping:**

| # | Field Name | Type | Rule | Status |
|---|---|---|---|---|
| 48 | Inventory GL Account | Lookup | Required for posting | 🔴 **[NEW]** |
| 49 | COGS GL Account | Lookup | Required for delivery posting | 🔴 **[NEW]** |
| 50 | Write-Off GL Account | Lookup | For adjustments/write-downs | 🔴 **[NEW]** |
| 51 | Price Variance GL Account | Lookup | For Standard Cost variance | 🟡 **[NEW]** |

**Audit Trail (System-Generated, Read-Only):**

| # | Field Name | Type |
|---|---|---|
| 52 | Created By | System |
| 53 | Created Date | System |
| 54 | Last Modified By | System |
| 55 | Last Modified Date | System |
| 56 | Modification History Log | System — expandable trail |

---

### FORM 2: Warehouse / Bin Master

| # | Field Name | Type | Status |
|---|---|---|---|
| 1 | Warehouse Code | Text (unique) | 🔴 |
| 2 | Warehouse Name | Text | 🔴 |
| 3 | Company | Lookup | 🔴 |
| 4 | Branch | Lookup | 🔴 |
| 5 | Address | Text area | 🟡 |
| 6 | Warehouse Type | Dropdown: Main / Transit / Quarantine / Return / Scrap | 🔴 **[NEW]** |
| 7 | Storage Temperature Class | Dropdown | 🟢 **[NEW]** |
| 8 | Zone Code | Text | 🟡 |
| 9 | Aisle | Text | 🟢 |
| 10 | Bin Code | Text (unique per warehouse) | 🟡 |
| 11 | Bin Capacity (qty/weight/vol) | Decimal | 🟢 **[NEW]** |
| 12 | Inbound Staging Bin | Lookup | 🟡 **[NEW]** |
| 13 | Outbound Staging Bin | Lookup | 🟡 **[NEW]** |
| 14 | Active Flag | Toggle | 🔴 |

---

### FORM 3: Purchase Order (PO)

**Header:**

| # | Field Name | Type | Validation | Status |
|---|---|---|---|---|
| 1 | PO Number | Auto | Format per country config | 🔴 |
| 2 | PO Type | Dropdown | Standard / Blanket / Import | 🔴 **[NEW]** |
| 3 | Blanket PO Flag | Toggle | If yes → release mechanism enabled | 🟡 **[NEW]** |
| 4 | Vendor | Lookup | Active vendors only | 🔴 |
| 5 | Vendor Reference No. | Text | Vendor's quote/offer number | 🟢 |
| 6 | PO Date | Date | Cannot be future dated beyond policy | 🔴 |
| 7 | Expected Delivery Date | Date | Header-level default | 🔴 **[NEW]** |
| 8 | Company | Lookup | — | 🔴 |
| 9 | Branch / Warehouse | Lookup | Ship-to location | 🔴 |
| 10 | Delivery Address | Text area | Ship-to full address | 🔴 **[NEW]** |
| 11 | Currency | Dropdown | With FX rate field | 🔴 |
| 12 | FX Rate | Decimal | Spot or manual | 🔴 |
| 13 | Incoterms 2020 | Dropdown | EXW/FOB/CIF/DAP/DDP etc. | 🔴 **[NEW]** |
| 14 | Incoterms Location | Text | Port/city for Incoterm | 🟡 **[NEW]** |
| 15 | Payment Terms | Dropdown | From vendor master, overridable | 🔴 **[NEW]** |
| 16 | Advance Payment % | Decimal | If advance required | 🟡 **[NEW]** |
| 17 | Tax Inclusive Flag | Toggle | Prices include tax or not | 🔴 |
| 18 | Header Discount % | Decimal | Applied before tax | 🟢 **[NEW]** |
| 19 | Notes / Terms | Text area | Special conditions | 🟢 |
| 20 | Attachments | File | Quote, spec sheet, contract | 🟢 |
| 21 | Status | System | Draft / Approved / Partially Received / Closed / Cancelled | 🔴 |
| 22 | Cancellation Reason | Text | Mandatory if cancelled | 🟡 **[NEW]** |

**Line Items:**

| # | Field Name | Type | Validation | Status |
|---|---|---|---|---|
| 1 | Line No. | Auto | — | 🔴 |
| 2 | Item Code | Lookup | Active items only | 🔴 |
| 3 | Item Description | Auto-fill | From item master | 🔴 |
| 4 | Item Specifications / Notes | Text | QC reference | 🟢 **[NEW]** |
| 5 | Purchase UOM | Dropdown | From item UOM config | 🔴 |
| 6 | Ordered Qty | Decimal | > 0 | 🔴 |
| 7 | Unit Price | Currency | > 0 | 🔴 |
| 8 | Line Discount % | Decimal | — | 🟢 **[NEW]** |
| 9 | Net Unit Price | Auto-calc | After discount | 🔴 |
| 10 | Tax Code | Dropdown | From tax engine | 🔴 |
| 11 | Tax Amount (line) | Auto-calc | — | 🔴 |
| 12 | Line Total (excl. tax) | Auto-calc | — | 🔴 |
| 13 | Line Total (incl. tax) | Auto-calc | — | 🔴 |
| 14 | Expected Line Delivery Date | Date | Per line override | 🟡 **[NEW]** |
| 15 | Warehouse / Bin | Lookup | Receiving location | 🟡 |
| 16 | GRN Tolerance % | Decimal | Over/under receipt limit | 🟡 **[NEW]** |
| 17 | Price Variance Tolerance % | Decimal | AP match control | 🟡 **[NEW]** |
| 18 | Received Qty | Auto | From GRN, read-only | 🔴 |
| 19 | Pending Qty | Auto-calc | Ordered - Received | 🔴 |
| 20 | Line Status | System | Open / Partial / Closed / Cancelled | 🔴 |

**Approval & Amendment:**

| # | Field Name | Type | Status |
|---|---|---|---|
| 1 | Approval Workflow Status | System | 🔴 |
| 2 | Approved By | System | 🔴 |
| 3 | Approval Date | System | 🔴 |
| 4 | Approval Comments | Text | 🟢 |
| 5 | Amendment Number | Auto | Increment on each change | 🔴 **[NEW]** |
| 6 | Amendment History | System log | Who changed what and when | 🔴 **[NEW]** |

---

### FORM 4: Goods Receipt Note (GRN)

**Header:**

| # | Field Name | Type | Validation | Status |
|---|---|---|---|---|
| 1 | GRN Number | Auto | Per country numbering config | 🔴 |
| 2 | GRN Type | Dropdown | Standard / Import / Return / Sample | 🔴 **[NEW]** |
| 3 | PO Reference | Lookup | Link to approved PO | 🔴 |
| 4 | Vendor | Auto-fill from PO | — | 🔴 |
| 5 | Receipt Date | Date | Cannot backdate beyond policy | 🔴 |
| 6 | Posting Date | Date | Fiscal period validation | 🔴 |
| 7 | Company / Branch / Warehouse | Lookup | — | 🔴 |
| 8 | Vehicle Number | Text | Delivery tracking | 🟡 **[NEW]** |
| 9 | Transporter Name | Lookup/Text | — | 🟡 **[NEW]** |
| 10 | Driver Name & Contact | Text | — | 🟢 **[NEW]** |
| 11 | Seal Number | Text | Container seal for import | 🟡 **[NEW]** |
| 12 | Container / Trailer Number | Text | Import/logistics | 🟡 **[NEW]** |
| 13 | Bill of Lading / AWB No. | Text | Import documentation | 🟡 **[NEW]** |
| 14 | Packing List Reference | Text | 3-way match support | 🟡 **[NEW]** |
| 15 | Vendor Delivery Note No. | Text | Vendor's DN reference | 🟢 |
| 16 | Currency | Dropdown | — | 🔴 |
| 17 | FX Rate | Decimal | — | 🔴 |
| 18 | Overall QC Status | Dropdown | Pending / Passed / Failed / Partial | 🔴 **[NEW]** |
| 19 | Landed Cost Flag | Toggle | Link to landed cost form | 🟡 **[NEW]** |
| 20 | Landed Cost Reference | Lookup | If flag ON | 🟡 **[NEW]** |
| 21 | 3-Way Match Status | System | Pending / Matched / Discrepancy | 🔴 **[NEW]** |
| 22 | Notes | Text area | — | 🟢 |
| 23 | Attachments | File | Packing list, QC docs, photos | 🟢 |
| 24 | Status | System | Draft / QC Pending / Approved / Posted / Cancelled | 🔴 |

**Line Items:**

| # | Field Name | Type | Validation | Status |
|---|---|---|---|---|
| 1 | PO Line Reference | Auto | — | 🔴 |
| 2 | Item Code | Auto / Lookup | — | 🔴 |
| 3 | Item Description | Auto-fill | — | 🔴 |
| 4 | Country of Origin (line) | Dropdown | Per-line for mixed shipments | 🟡 **[NEW]** |
| 5 | Purchase UOM | Auto from PO | — | 🔴 |
| 6 | PO Ordered Qty | Auto | Read-only | 🔴 |
| 7 | Previously Received Qty | Auto | Read-only | 🔴 |
| 8 | This Receipt Qty | Decimal | ≤ pending qty + tolerance | 🔴 |
| 9 | Unit Cost | Currency | From PO or overridable per policy | 🔴 |
| 10 | Accepted Qty | Decimal | After QC | 🔴 **[NEW]** |
| 11 | Rejected Qty | Decimal | Auto = Receipt - Accepted | 🔴 **[NEW]** |
| 12 | Rejection Reason | Dropdown | Mandatory if Rejected Qty > 0 | 🟡 **[NEW]** |
| 13 | QC Status (line) | Dropdown | Passed / Failed / Partial / Waived | 🔴 **[NEW]** |
| 14 | Lot / Batch Number | Text | Mandatory if item tracking = Lot | 🟡 |
| 15 | Serial Numbers | Sub-table | One per unit if tracking = Serial | 🟡 |
| 16 | Manufacturing Date | Date | Required if expiry tracking ON | 🟡 **[NEW]** |
| 17 | Expiry Date | Date | Auto-calc from Mfg Date + shelf life, overridable | 🟡 **[NEW]** |
| 18 | Temperature at Receipt | Decimal | Cold chain compliance | 🟢 **[NEW]** |
| 19 | Put-Away Bin | Lookup | Target bin location | 🟡 **[NEW]** |
| 20 | Over-Receipt Tolerance % | System check | Block or warn if exceeded | 🔴 **[NEW]** |
| 21 | Line Total Cost | Auto-calc | Accepted Qty × Unit Cost | 🔴 |

---

### FORM 5: Landed Cost Allocation

| # | Field Name | Type | Validation | Status |
|---|---|---|---|---|
| 1 | LC Document No. | Auto | — | 🔴 |
| 2 | Reference GRN(s) | Multi-lookup | Multiple GRNs per one LC doc | 🔴 **[NEW]** |
| 3 | LC Date | Date | — | 🔴 |
| 4 | Company / Branch | Lookup | — | 🔴 |
| **Cost Components Sub-table:** | | | | |
| 5 | Cost Type | Dropdown | Freight / Insurance / Customs Duty / Clearing / Handling / Other | 🔴 **[NEW]** |
| 6 | Vendor / Carrier | Lookup | Who charged this cost | 🟡 **[NEW]** |
| 7 | Vendor Invoice Reference | Text | AP match support | 🟡 **[NEW]** |
| 8 | Amount | Currency | — | 🔴 |
| 9 | Currency | Dropdown | — | 🔴 |
| 10 | FX Rate at Allocation Date | Decimal | — | 🔴 **[NEW]** |
| 11 | Amount in Base Currency | Auto-calc | — | 🔴 |
| **Allocation Settings:** | | | | |
| 12 | Allocation Method | Dropdown | By Qty / By Value / By Weight / By Volume | 🔴 **[NEW]** |
| 13 | Allocation Preview Table | Computed | Shows per-item, per-GRN breakdown before posting | 🔴 **[NEW]** |
| 14 | GL Account | Lookup | — | 🔴 |
| 15 | Status | System | Draft / Preview / Posted | 🔴 |
| 16 | Posted By / Posted Date | System | Read-only | 🔴 |

---

### FORM 6: Stock Transfer

**Header:**

| # | Field Name | Type | Status |
|---|---|---|---|
| 1 | Transfer No. | Auto | 🔴 |
| 2 | Transfer Type | Dropdown: Inter-Warehouse / Inter-Branch / Inter-Company / Bin-to-Bin | 🔴 **[NEW]** |
| 3 | Transfer Date | Date | 🔴 |
| 4 | Source Warehouse / Bin | Lookup | 🔴 |
| 5 | Destination Warehouse / Bin | Lookup | Must differ from source | 🔴 |
| 6 | In-Transit Warehouse | Lookup | For long-distance transfers | 🟡 **[NEW]** |
| 7 | Reason for Transfer | Dropdown | — | 🟡 |
| 8 | Status | System | Draft / Approved / In-Transit / Received / Closed | 🔴 |

**Line Items:**

| # | Field Name | Type | Status |
|---|---|---|---|
| 1 | Item Code | Lookup | 🔴 |
| 2 | Lot / Batch | Lookup | From source stock | 🟡 |
| 3 | Serial Numbers | Sub-table | — | 🟡 |
| 4 | UOM | Auto | 🔴 |
| 5 | Requested Qty | Decimal | 🔴 |
| 6 | Issued Qty | Decimal | At issue | 🔴 |
| 7 | Received Qty | Decimal | At destination receipt | 🔴 |
| 8 | Variance Qty | Auto-calc | — | 🔴 **[NEW]** |
| 9 | Variance Reason | Dropdown | Mandatory if variance > 0 | 🟡 **[NEW]** |
| 10 | Damage Flag | Toggle | — | 🟡 **[NEW]** |
| 11 | Unit Cost | Auto | For valuation | 🔴 |

---

### FORM 7: Delivery / Goods Issue

| # | Field Name | Type | Status |
|---|---|---|---|
| 1 | Delivery No. | Auto | 🔴 |
| 2 | Sales Order Reference | Lookup | 🔴 |
| 3 | Customer | Auto-fill | 🔴 |
| 4 | Delivery Date | Date | 🔴 |
| 5 | Ship-To Address | Auto / Editable | 🔴 |
| 6 | Transporter | Lookup | 🟡 |
| 7 | Vehicle No. | Text | 🟢 |
| 8 | Dispatch Warehouse / Bin | Lookup | 🔴 |
| 9 | Picking List Reference | Lookup | 🟡 |
| 10 | Item / Lot / Serial per line | Sub-table | 🔴 |
| 11 | Ordered Qty / Delivered Qty | Decimal | 🔴 |
| 12 | Short-Delivery Reason | Dropdown | If delivered < ordered | 🟡 **[NEW]** |
| 13 | COGS Amount | Auto-calc | At valuation cost | 🔴 |
| 14 | E-invoice Reference | Text | Country compliance | 🟡 **[NEW]** |
| 15 | Status | System | Draft / Picked / Dispatched / Delivered / Posted | 🔴 |

---

### FORM 8: Stock Adjustment

| # | Field Name | Type | Validation | Status |
|---|---|---|---|---|
| 1 | Adjustment No. | Auto | — | 🔴 |
| 2 | Adjustment Date | Date | Fiscal period check | 🔴 |
| 3 | Adjustment Type | Dropdown | Gain / Loss / Write-Off / Revaluation / QC Rejection | 🔴 **[NEW]** |
| 4 | Company / Branch / Warehouse | Lookup | — | 🔴 |
| 5 | Item Code | Lookup | Active items | 🔴 |
| 6 | Lot / Batch / Serial | Lookup | If tracked | 🟡 |
| 7 | UOM | Auto | — | 🔴 |
| 8 | System Qty (Before) | Auto | **Read-only — cannot be edited** | 🔴 **[NEW]** |
| 9 | Physical / Adjusted Qty | Decimal | User enters actual | 🔴 **[NEW]** |
| 10 | Variance Qty | Auto-calc | Physical - System | 🔴 **[NEW]** |
| 11 | Unit Cost | Auto | From valuation layer | 🔴 |
| 12 | Variance Value | Auto-calc | Variance Qty × Unit Cost | 🔴 **[NEW]** |
| 13 | Reason Code | Dropdown | **Mandatory — no default** | 🔴 |
| 14 | GL Account | Lookup | Default from reason code, overridable by accountant | 🟡 **[NEW]** |
| 15 | Supporting Document Ref. | Text | Reference external doc | 🟡 **[NEW]** |
| 16 | Attachments | File | QC report, survey | 🟢 |
| 17 | Notes | Text area | — | 🟢 |
| 18 | Approval Threshold Flag | System | Auto-flag if value > threshold | 🔴 **[NEW]** |
| 19 | Reviewed By | Lookup | Separate from Approved By (SoD) | 🔴 **[NEW]** |
| 20 | Approved By | Lookup | — | 🔴 |
| 21 | Approval Date | System | — | 🔴 |
| 22 | Status | System | Draft / Pending Approval / Approved / Posted / Rejected | 🔴 |

---

### FORM 9: Return to Vendor (RTV)

| # | Field Name | Type | Status |
|---|---|---|---|
| 1 | RTV No. | Auto | 🔴 |
| 2 | GRN Reference | Lookup | Origin of returned goods | 🔴 |
| 3 | PO Reference | Auto | — | 🔴 |
| 4 | Vendor | Auto | — | 🔴 |
| 5 | Return Date | Date | 🔴 |
| 6 | Return Reason | Dropdown | Quality / Expiry / Over-supply / Damage / Wrong Item | 🔴 |
| 7 | Vendor Acknowledgement No. | Text | — | 🟡 **[NEW]** |
| 8 | Debit Note Reference | Text | AP credit/debit note link | 🟡 **[NEW]** |
| 9 | Lines: Item / Lot / Qty / Cost | Sub-table | — | 🔴 |
| 10 | Return to Source Bin | Lookup | — | 🟡 **[NEW]** |
| 11 | Credit Expected | Toggle | — | 🟡 **[NEW]** |
| 12 | Status | System | Draft / Approved / Dispatched / Confirmed | 🔴 |

---

### FORM 10: Customer Return (RMA)

| # | Field Name | Type | Status |
|---|---|---|---|
| 1 | RMA No. | Auto | 🔴 |
| 2 | Sales Order / Invoice Reference | Lookup | 🔴 |
| 3 | Customer | Auto | 🔴 |
| 4 | Return Date | Date | 🔴 |
| 5 | Return Reason | Dropdown | Defective / Wrong item / Excess / Customer preference | 🔴 |
| 6 | Lines: Item / Lot / Serial / Qty | Sub-table | 🔴 |
| 7 | Inspection Result | Dropdown | Restock / Scrap / Repair / Return to Vendor | 🔴 **[NEW]** |
| 8 | Restockable Qty | Decimal | — | 🔴 **[NEW]** |
| 9 | Scrap Qty | Decimal | — | 🟡 **[NEW]** |
| 10 | Credit Note Reference | Text | AR credit note link | 🟡 **[NEW]** |
| 11 | Status | System | Draft / Received / Inspected / Closed | 🔴 |

---

### FORM 11: Stock Count Sheet

**Header:**

| # | Field Name | Type | Validation | Status |
|---|---|---|---|---|
| 1 | Count No. | Auto | — | 🔴 |
| 2 | Count Plan Reference | Lookup | Link to schedule | 🔴 **[NEW]** |
| 3 | Count Type | Dropdown | Cycle Count / Annual / Spot / ABC-Triggered | 🔴 **[NEW]** |
| 4 | Count Date | Date | — | 🔴 |
| 5 | Freeze Timestamp | System | When stock was locked for count | 🔴 **[NEW]** |
| 6 | Company / Branch / Warehouse | Lookup | — | 🔴 |
| 7 | Zone / Bin Range | Lookup | Scope of count | 🟡 |
| 8 | Blind Count Flag | Toggle | Hides system qty from counter | 🔴 **[NEW]** |
| 9 | Counter 1 (Name) | Lookup | — | 🔴 **[NEW]** |
| 10 | Counter 2 / Supervisor | Lookup | For recount / supervision | 🔴 **[NEW]** |
| 11 | Count Status | System | Open / In Progress / Pending Recount / Pending Approval / Posted | 🔴 |

**Line Items:**

| # | Field Name | Type | Status |
|---|---|---|---|
| 1 | Item Code | From plan | 🔴 |
| 2 | Description | Auto | 🔴 |
| 3 | Bin / Location | Auto | 🔴 |
| 4 | Lot / Batch | Auto | 🟡 |
| 5 | UOM | Auto | 🔴 |
| 6 | System Qty (hidden if blind) | System | 🔴 |
| 7 | Count 1 Qty (Counter 1) | Decimal | 🔴 **[NEW]** |
| 8 | Count 2 Qty (Counter 2) | Decimal | If recount triggered | 🟡 **[NEW]** |
| 9 | Final Accepted Qty | Decimal | After reconciliation | 🔴 **[NEW]** |
| 10 | Variance Qty | Auto-calc | Final - System | 🔴 **[NEW]** |
| 11 | Variance % | Auto-calc | — | 🔴 **[NEW]** |
| 12 | Variance Threshold Breach | System flag | Auto-trigger recount | 🔴 **[NEW]** |
| 13 | Variance Value | Auto-calc | At unit cost | 🔴 **[NEW]** |
| 14 | Recount Required | System flag | — | 🔴 **[NEW]** |
| 15 | Count Note | Text | Per line observation | 🟢 |

**Approval:**

| # | Field Name | Type | Status |
|---|---|---|---|
| 1 | Counted By | System | 🔴 |
| 2 | Supervised By | Lookup | SoD | 🔴 **[NEW]** |
| 3 | Approved By | Lookup | Finance / management | 🔴 |
| 4 | Approval Date | System | 🔴 |
| 5 | Variance Root-Cause | Text | Mandatory if variance posted | 🟡 **[NEW]** |

---

### FORM 12: Cost Revaluation / Write-Down Proposal

| # | Field Name | Type | Status |
|---|---|---|---|
| 1 | Proposal No. | Auto | 🔴 |
| 2 | Date | Date | 🔴 |
| 3 | Proposal Type | Dropdown | NRV Write-Down / Obsolescence / Expiry / Standard Cost Revision | 🔴 **[NEW]** |
| 4 | Item / Category scope | Lookup | Single or bulk | 🔴 |
| 5 | Current Cost (system) | Auto | Read-only | 🔴 |
| 6 | Proposed NRV / New Cost | Decimal | — | 🔴 |
| 7 | Write-Down Amount (total) | Auto-calc | — | 🔴 |
| 8 | Justification | Text area | Mandatory | 🔴 **[NEW]** |
| 9 | Supporting Market Price Evidence | Attachment | — | 🟡 **[NEW]** |
| 10 | Reversal Eligible | Toggle | IAS 2 reversal rules | 🟡 **[NEW]** |
| 11 | Approved By (CFO/Controller) | Lookup | Senior approval required | 🔴 **[NEW]** |
| 12 | GL Impact Preview | Auto | Shows Dr/Cr before posting | 🔴 **[NEW]** |
| 13 | Status | System | Draft / Pending Approval / Approved / Posted | 🔴 |

---

## 6) 🧮 Valuation & Costing Framework

### 6.1 Supported Methods
| Method | Description |
|---|---|
| FIFO | First batch cost used first |
| Moving Weighted Average | Recalculated on each receipt |
| Standard Cost | Fixed cost with variance tracking |
| LIFO | Feature-flagged — US/country specific |

### 6.2 Cost Components (Landed Cost)
- Item base cost
- Freight
- Insurance
- Customs duty
- Clearing / handling
- Other user-defined components

### 6.3 NRV & Obsolescence Controls
- Slow-moving threshold (configurable per item/category)
- Near-expiry flags (X days alert)
- NRV check at period-end
- Write-down proposal workflow (Form 12)
- Reversal logic where IAS 2 permits

---

## 7) 🧷 Internal Controls & Security

### 7.1 Role Model
| Role | Permissions |
|---|---|
| Inventory Admin | Master data setup, configuration |
| Storekeeper | GRN, Transfer, Issue, Adjustment (within threshold) |
| Procurement Officer | PR, PO |
| Sales Fulfillment | Delivery, RMA |
| Cost Accountant | Valuation, write-down, GL mapping |
| QC Inspector | QC status update on GRN |
| Auditor | Read-only across all |

### 7.2 Approval Matrix
| Transaction | Trigger | Approver Level |
|---|---|---|
| PO | Value > threshold | Finance Manager |
| Stock Adjustment | Any value | Warehouse Manager |
| Stock Adjustment | Value > X | Finance Manager |
| Write-Down | Any | CFO / Controller |
| Backdate Transaction | Any | System Admin + Finance |
| Period Lock Override | Any | Finance Manager |

### 7.3 Hard Validations
- No duplicate serial number (globally or per company policy)
- No posting in locked fiscal period
- No reason code = no posting for adjustments/write-offs
- UOM mismatch = block transaction
- Inactive item = block new transactions
- Over-receipt beyond tolerance = block or escalate
- Negative stock (if policy = OFF) = hard block

### 7.4 Audit Events — Must Log
| Event | Fields Logged |
|---|---|
| Create | User, timestamp, all field values |
| Update | User, timestamp, field name, old value, new value |
| Delete attempt | User, timestamp, reason |
| Status change | User, timestamp, from → to |
| Price/cost change | User, old cost, new cost, reason |
| Manual override | User, field, justification |
| Login/logout | User, session time |

---

## 8) 📊 Reports Blueprint

### 8.1 Operational Reports
| Report | Key Filters |
|---|---|
| Stock On Hand (item-location-bin) | Company, warehouse, item, category, date |
| Stock Movement Register | Date range, item, warehouse, transaction type |
| In-Transit Inventory | Source, destination, item |
| Batch/Lot/Serial Traceability (fwd+bkwd) | Lot/serial number |
| Expiry & Near-Expiry | Days to expiry, item, warehouse |
| Reorder & Stock-Out Risk | Below reorder point, lead time |
| Negative Stock Exceptions | All locations |
| Slow-Moving Inventory | Days without movement threshold |

### 8.2 Financial Reports
| Report | Key Filters |
|---|---|
| Inventory Valuation (by method) | Date, warehouse, item, category |
| COGS Reconciliation (Inventory ↔ GL) | Period, company |
| GRNI (Goods Received Not Invoiced) | Vendor, date, PO |
| Landed Cost Variance | LC document, GRN |
| Write-Down / Write-Off Summary | Period, item, type |
| Standard Cost Variance | Item, period |

### 8.3 Control & Audit Reports
| Report | Key Filters |
|---|---|
| Adjustment Approval Report | Date, user, status |
| Backdated Transaction Report | Transaction type, user |
| User Activity & Override Log | User, date, action type |
| Count Variance Analysis | Count date, warehouse, item |
| Duplicate/Invalid Serial Report | Company, date |
| SoD Violation Alerts | Role, user, transaction |

### 8.4 Standard Report Filters
- Date range
- Company / branch / warehouse
- Item / category / brand
- Lot / serial / batch
- Vendor / customer
- Status (draft / approved / posted)
- Currency
- User / role

---

## 9) 🔗 Integration Blueprint

### 9.1 Module Integrations
| Module | Integration Points |
|---|---|
| Procurement | PR → PO → GRN |
| Accounts Payable | GRN → 3-way match → AP invoice |
| Sales | SO → Delivery → Invoice |
| Accounts Receivable | RMA → Credit note |
| General Ledger | All posting events |
| Tax Engine | All tax calculations |
| Manufacturing (optional) | Production consumption/receipt |
| POS (optional) | Real-time stock deduction |
| WMS (optional) | Bin management, scanning |
| E-commerce (optional) | ATP (available to promise) |

### 9.2 Key GL Posting Events
| Event | Debit | Credit |
|---|---|---|
| GRN Posted | Inventory | GRNI |
| AP Invoice Matched | GRNI | Accounts Payable |
| Delivery / Issue | COGS | Inventory |
| Stock Adjustment Gain | Inventory | Inventory Adjustment Income |
| Stock Adjustment Loss | Inventory Adjustment Expense | Inventory |
| Write-Down | Write-Down Expense | Inventory |
| Landed Cost Allocation | Inventory | Freight Payable / AP |

---

## 10) 🌐 Multi-Country Localization Layer

### 10.1 Per-Company Configuration
- Base currency + reporting currency
- Costing method
- Negative stock policy (on/off)
- Lot/serial policy
- Expiry policy
- Tax profile + tax engine rules
- Approval thresholds
- Fiscal calendar
- Document numbering format
- Date format + decimal precision
- Language pack
- Local compliance reports

### 10.2 Currency & FX
- Transaction currency + base currency + reporting currency
- Spot rate + manual override (with approval)
- FX difference posted to Finance module

### 10.3 Units, Packaging, Trade
- Metric / imperial support
- Packaging hierarchy (unit → box → case → pallet)
- Multiple barcode symbology support (EAN, UPC, QR, DataMatrix)

---

## 11) ⚙️ Performance & Data Governance

### 11.1 Performance Targets
| Operation | Target |
|---|---|
| Stock lookup | < 2 seconds |
| Standard posting | < 3 seconds |
| Large reports | Async queue with notification |
| Batch operations | Background job with status |

### 11.2 Data Quality Controls
- Item code uniqueness constraint (DB level)
- UOM conversion validation on every transaction
- Duplicate serial detection (real-time)
- Inactive master usage blocked on transactions
- Period lock enforced at posting layer

### 11.3 Archival & Retention
- Retention period per country profile (e.g., 7 years)
- Immutable audit logs (no delete/update allowed)
- Backup and restore validation schedule
- Archive policy for closed fiscal years

---

## 12) ✅ UAT & Go-Live Checklist

### 12.1 UAT Scenarios (Must Pass)
- [ ] PO → GRN → AP invoice 3-way match
- [ ] Sales order → Delivery → Invoice → COGS posting
- [ ] Inter-warehouse transfer with transit loss case
- [ ] Batch expiry tracking and blocked sale on expired lot
- [ ] Cycle count — dual counter, blind count, variance recount
- [ ] Landed cost allocation across multiple GRNs
- [ ] Month-end valuation reconciliation with GL
- [ ] Stock adjustment with threshold-based approval routing
- [ ] RTV → vendor credit note
- [ ] RMA → inspection → restock vs scrap decision
- [ ] Negative stock block enforcement
- [ ] Period lock enforcement
- [ ] SoD validation — same user cannot request and approve

### 12.2 Go-Live Controls
- [ ] Opening stock migration signed-off
- [ ] Cost layers validated
- [ ] Approval matrix configured and tested
- [ ] Fiscal periods and numbering configured
- [ ] User roles and SoD tested
- [ ] GL account mapping validated
- [ ] Tax codes configured
- [ ] Country configuration pack activated

---

## 13) 🗺️ Build Phasing

| Phase | Scope |
|---|---|
| **A — Foundation** | Item master, warehouse/bin, UOM, GL mapping, stock on hand |
| **B — Core Transactions** | PO, GRN, Transfer, Delivery, Adjustment |
| **C — Valuation & Finance** | Costing engine, landed cost, GL posting, reconciliation |
| **D — Controls & Compliance** | Approvals, audit trail, period lock, SoD, reports |
| **E — Advanced** | FEFO optimization, cycle count automation, 3PL, mobile scanning, demand forecasting |

---

## Appendix A: Minimum Configuration Matrix (Per Company)
- Base currency
- Reporting currency
- Costing method
- Negative stock policy
- Lot/serial policy
- Expiry policy
- Tax profile
- Approval thresholds (by transaction type and value)
- Fiscal calendar
- Document numbering rules (per transaction type)
- Language pack

## Appendix B: Critical KPIs
| KPI | Formula |
|---|---|
| Inventory Turnover Ratio | COGS ÷ Average Inventory |
| Days Inventory Outstanding (DIO) | 365 ÷ Turnover Ratio |
| Stock-Out Rate | Stock-out events ÷ Total order lines |
| Carrying Cost % | Holding costs ÷ Average inventory value |
| Expiry Loss % | Expired inventory value ÷ Total inventory value |
| Count Accuracy % | Lines with zero variance ÷ Total lines counted |
| GRN to Invoice Cycle Time | Days from GRN to AP invoice posting |
| Transfer Lead Time | Days from transfer request to receipt |
| Reorder Compliance % | POs raised within lead time ÷ Total reorder triggers |

---

*Document Version: 2.0 | ERP Inventory Module | International Standards Blueprint*
*All [NEW] fields are additions identified through gap analysis for complete ERP-grade implementation.*