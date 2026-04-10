# Inventory — canonical URLs for RAHJ AI

**Source of truth:** `routes/web.php` (prefix `inventory`). Ingested by `npm run rag:build`. When answering users, use **only** these paths in markdown links — do not invent menu names or plural segments.

## Procurement documents

| Screen | List / index | Create new |
|--------|----------------|------------|
| Purchase requisition (PR) | `/inventory/purchase-requisition` | `/inventory/purchase-requisition/create` |
| Purchase order (PO) — **includes pending / draft / open POs** | `/inventory/purchase-order` | `/inventory/purchase-order/create` |
| Goods receipt note (GRN) | `/inventory/goods-receipt-note` | `/inventory/goods-receipt-note/create` |
| GRN supplier invoice | `/inventory/grn-supplier-invoice` | `/inventory/grn-supplier-invoice/create` |

**Important:** The PO module URL is **`/inventory/purchase-order`** (hyphen, singular `order`). There is **no** `/inventory/purchase-orders` route. For “pending PO count” answers, link: [Purchase orders](/inventory/purchase-order).

## Document numbering (running numbers)

| Screen | Path |
|--------|------|
| Document number configuration | `/inventory/document-number-configuration` |
| Create configuration | `/inventory/document-number-configuration/create` |

## Item & coding masters

| Screen | List | Create |
|--------|------|--------|
| Item master | `/inventory/item-master` | `/inventory/item-master/create` |
| Item category coding | `/inventory/item-category-coding` | `/inventory/item-category-coding/create` |
| Item class coding | `/inventory/item-class-coding` | `/inventory/item-class-coding/create` |
| Item group coding | `/inventory/item-group-coding` | `/inventory/item-group-coding/create` |
| UOM master | `/inventory/uom-master` | `/inventory/uom-master/create` |
| UOM conversion | `/inventory/uom-conversion` | `/inventory/uom-conversion/create` |

## Dynamic master data (pattern)

Base: `/inventory/master-data/{master}` where `{master}` is the master key.

| Common master | List | Create |
|---------------|------|--------|
| Vendor (supplier) | `/inventory/master-data/vendor-master` | `/inventory/master-data/vendor-master/create` |
| Customer | `/inventory/master-data/customer-master` | `/inventory/master-data/customer-master/create` |

Other masters use the same pattern: `/inventory/master-data/{master}` and `/inventory/master-data/{master}/create`.

## Reports hub

| Screen | Path |
|--------|------|
| Reports index (hub) | `/inventory/reports` |
| Goods receipt register (filters) | `/inventory/reports/goods-receipt-register` |
| Goods receipt register (report view) | `/inventory/reports/goods-receipt-register/report` |
| Purchase order lines register | `/inventory/reports/purchase-order-lines` |
| Purchase order lines report | `/inventory/reports/purchase-order-lines/report` |

Export/print routes (same prefixes; use when user asks for CSV/Excel/PDF):

- GR register: `/inventory/reports/goods-receipt-register/export/csv`, `.../export/excel`, `.../export/pdf`, `.../print`
- PO lines: `/inventory/reports/purchase-order-lines/export/csv`, `.../export/excel`, `.../export/pdf`, `.../print`

## Markdown examples (copy pattern)

- [Purchase orders](/inventory/purchase-order)
- [Create purchase order](/inventory/purchase-order/create)
- [Purchase requisitions](/inventory/purchase-requisition)
- [Goods receipt (GRN)](/inventory/goods-receipt-note)
- [Inventory reports](/inventory/reports)
- [Vendor master](/inventory/master-data/vendor-master)

**Detail reference:** [INVENTORY_MODULE_FORMS_AND_ROUTES.md](./INVENTORY_MODULE_FORMS_AND_ROUTES.md)
