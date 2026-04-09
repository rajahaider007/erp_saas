# Inventory & purchase reporting — standards guide

**مقصد (Urdu):** یہ دستاویز خریداری کے فارم (PR، PO، GRN، سپلائر انوائس) اور انوینٹری رپورٹنگ کو عالمی معیار (خصوصاً **IAS 2 / IFRS** انوینٹری، اور عام **آڈٹ / اندرونی کنٹرول** اصول) سے جوڑتی ہے۔ اسے فالو کرتے ہوئے پہلے **ڈیٹا کی تعریف** (کون سی ٹیبل / واؤچر)، پھر **فلٹرز**، پھر **آؤٹ پٹ** (PDF/Excel/CSV) ایک جیسا رکھیں۔

---

## 1. Purchase cycle forms in this application (data you already have)

| Document | Purpose | Primary tables / linkage |
|----------|---------|---------------------------|
| **Purchase Requisition (PR)** | Internal demand | `purchase_requisitions`, `purchase_requisition_lines` |
| **Purchase Order (PO)** | Legal commitment to vendor | `purchase_orders`, `purchase_order_lines` |
| **Goods Receipt Note (GRN)** | Physical receipt, QC, lot/expiry | `goods_receipt_notes`, `goods_receipt_note_lines` |
| **GRN Supplier Invoice** | Vendor invoice matched to GRN(s); posting trigger | `grn_supplier_invoices`, pivot `grn_supplier_invoice_grns`, taxes `grn_supplier_invoice_line_taxes` |
| **Posted voucher** | Financial recognition (inventory + input tax + AP) | `posted_transaction_id` on GRN / invoice; GL via existing accounts module |

**Three-way match (operational target):** PO line ↔ GRN line ↔ Supplier invoice line (qty & price). Your GRN lines already carry `purchase_order_line_id`, `po_ordered_qty`, `snapshot_previously_received_qty`, and receipt/accept/reject quantities — use these for exception reports.

---

## 2. International standards — what reports must prove

### 2.1 IAS 2 *Inventories* (core ideas for reports)

- **Cost of inventory** includes purchase price, import duties, non-refundable taxes, transport, handling, and other costs to bring stock to location/condition (capitalisable portion only).
- **Measurement:** Lower of cost and net realisable value (NRV) — system should support **cost listing** and later **write-down / revaluation** workflows if you add them.
- **Cost formulas:** FIFO, weighted average, or specific identification — your `inventory_items.costing_method` should drive **valuation** logic once a stock ledger exists.
- **Expense recognition:** Abnormal waste, storage, selling costs are **not** inventory cost — flag or exclude in landed-cost reports.

### 2.2 IFRS 15 / operational purchase analytics (supporting)

- Purchase reports support **margin** and **COGS** analysis indirectly; primary IFRS alignment for purchases is still **inventory cost** + **payables**.

### 2.3 Audit & internal control (ISO-style “quality” of reporting)

Every standard report should document:

1. **Period basis** — document date vs posting date vs receipt date (state explicitly on the report).
2. **Scope** — company, location, currency, inclusion of draft vs posted only.
3. **Traceability** — drill from summary to document + line + (where applicable) GL voucher id.
4. **Immutability** — posted transactions should not change without reversal (your app should reflect posted id).

---

## 3. Master report catalogue (build order)

Legend: **P1** = first priority (available from current transactional tables), **P2** = needs stock ledger / costing engine, **P3** = advanced analytics.

### A. Purchase-to-receipt (P1 — implemented in code: see app routes under `inventory/reports`)

| # | Report | Standard / use | Minimum columns | Standard filters |
|---|--------|----------------|-----------------|------------------|
| A1 | **Goods receipt register (line detail)** | Receipt audit, IAS 2 cost build-up | GRN #, dates, PO #, vendor, item, UoM, receipt/accept/reject qty, unit cost, line amount, lot/expiry, status, posted flag | Date basis (receipt/posting), vendor, status, item, posted-only, GRN # |
| A2 | **Purchase order lines register** | Open commitment, delivery performance | PO #, dates, vendor, line, item, ordered/received qty, balance qty, unit price, line status, ship-to | PO date, vendor, status, item, open-lines-only |
| A3 | **GRN vs PO variance (qty & value)** | Three-way match exception | Ordered, cumulative received (GRN), variance %, PO unit price vs GRN unit cost | Same as A1/A2 |
| A4 | **Supplier invoice listing (GRN-linked)** | AP and tax reconciliation | Invoice #, vendor, dates, linked GRNs, status, posted id | Date, vendor, status |

### B. Requisition & sourcing (P1)

| # | Report | Use | Filters |
|---|--------|-----|---------|
| B1 | PR lines register | Budget / approval trail | Department, date, item, status |
| B2 | PR → PO conversion | Pipeline speed | Date range, requester |

### C. Stock position & movement (P2 — requires inventory subledger)

| # | Report | Standard | Notes |
|---|--------|----------|-------|
| C1 | Stock balance by item/location/bin | IAS 2 on-hand | Needs sum of movements |
| C2 | Stock ledger (card) | Audit trail | Receipt, issue, transfer, adjustment |
| C3 | Valuation at month-end | IAS 2 | Weighted avg / FIFO per policy |
| C4 | Ageing / slow-moving | Working capital | Uses last movement or last receipt date |
| C5 | Lot / batch traceability | Regulated industries | From GRN line lot to issue |

### D. Compliance & master data (P1/P2)

| # | Report | Use |
|---|--------|-----|
| D1 | Item master extract (with GL accounts) | Control: posting readiness |
| D2 | Negative stock / incomplete GL mapping | Pre-posting validation |
| D3 | HSN / tariff / country of origin listing | Trade compliance |

---

## 4. Column & rounding guidelines

- **Quantities:** Show in **document UoM**; if reporting in stock UoM, apply `uom_conversions` explicitly and label the column.
- **Money:** Line amount = accepted qty × unit cost (match posting service: accepted capped by receipt qty).
- **FX:** When document currency ≠ functional currency, show **document currency** and **FX rate** columns; functional amount belongs in GL reports.
- **Rounding:** Monetary totals rounded per company policy (2 decimals typical); quantities per UoM decimal scale from master.

---

## 5. Implementation phases (follow in order)

1. **Phase 1 (implemented):** Menus under **Inventory → Reports**: hub `/inventory/reports`, **Goods Receipt Register** `/inventory/reports/goods-receipt-register`, **Purchase Order Lines Report** `/inventory/reports/purchase-order-lines`. APIs: **A1** `POST …/goods-receipt-register/data`, **A2** `POST …/purchase-order-lines/data`. Migrations: `2026_04_09_240000_add_inventory_reports_menu`, `2026_04_10_101000_inventory_reports_submenus_and_rights` (menus + `user_rights` for active users). Fresh seeds: `InventoryMasterCodingMenusSeeder` includes the same three menus and rights. Filters: dates, vendor, status, search, sort, pagination; GRN also has receipt vs posting date basis and posted-only.
2. **Phase 2:** A3, A4, B1, B2 using same controller/service pattern; CSV/Excel export (mirror `accounts/reports` exporters).
3. **Phase 3:** Persisted **inventory_transactions** (or subledger) for C1–C5; tie `posted_transaction_id` and average cost layers.
4. **Phase 4:** Scheduled snapshots for month-end valuation and IFRS disclosures pack (optional).

---

## 6. References (external)

- IASB — *IAS 2 Inventories*
- IFRS Foundation summary materials for inventory cost and NRV
- COSO / ISO 9001 — traceability and document control (report headers, user, timestamp)

---

*Document version: 1.0 — aligned with `saas_erp` inventory schema as of 2026-04.*
