# ERP navigation — suppliers, customers, vendors

This file is ingested by `npm run rag:build` into the RAHJ AI corpus. Keep routes aligned with `routes/web.php`.

**RAHJ AI — inventory URLs (canonical, copy-paste for links):** [INVENTORY_NAVIGATION_FOR_RAHJ_AI.md](./INVENTORY_NAVIGATION_FOR_RAHJ_AI.md) — procurement, masters, coding, reports; **PO list = `/inventory/purchase-order`** (not `purchase-orders`).

**Full inventory module map:** [INVENTORY_MODULE_FORMS_AND_ROUTES.md](./INVENTORY_MODULE_FORMS_AND_ROUTES.md) (paths, route names, reports, master-data keys).

## Where to add a supplier or vendor

- List suppliers: [Vendor master](/inventory/master-data/vendor-master)
- **Create a new supplier:** [Create vendor](/inventory/master-data/vendor-master/create)

Vendors are party masters backed by **Chart of Accounts** (Level 4 under Accounts Payable). They are **not** created from GRN supplier invoice screens.

## Where to add a customer

- List customers: [Customer master](/inventory/master-data/customer-master)
- **Create a new customer:** [Create customer](/inventory/master-data/customer-master/create)

## Chart of accounts (general COA maintenance)

- [Chart of accounts](/accounts/chart-of-accounts)

Use this for the account hierarchy and Level 4 codes. Party-specific entry for purchasing/sales is still via **Vendor master** and **Customer master** under Inventory → Master data.

## Common mistake to avoid

- **Do not** direct users to [GRN supplier invoice](/inventory/grn-supplier-invoice) to *register* a new supplier. That module is for posting supplier invoices against **existing** vendors.

## Related procurement (after vendor exists)

- [Purchase requisition](/inventory/purchase-requisition)
- [Purchase order](/inventory/purchase-order)
- [Goods receipt (GRN)](/inventory/goods-receipt-note)
- [GRN supplier invoice](/inventory/grn-supplier-invoice)
