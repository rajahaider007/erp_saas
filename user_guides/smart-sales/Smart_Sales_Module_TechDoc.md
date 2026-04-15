# Smart Sales Module — Full Technical Flow Documentation
## International ERP System | Multi-Company | Multi-Currency | Multi-Language

**Document Version:** 1.0  
**Module:** Smart Sales Module (SSM)  
**Standard:** IFRS / GAAP / ISO 8601 / ISO 4217 / Unicode CLDR  
**Compatible With:** International Accounting Module, Advanced Inventory Module, Audit Log & Recovery Module  

---

## TABLE OF CONTENTS

1. Module Overview & Architecture
2. System Configuration & Setup
3. Customer Master Management
4. Quotation & Proforma Invoice Module
5. Sales Order Management
6. Delivery & Shipment Module
7. Invoice & Billing Module
8. Payment & Receipt Module
9. Sales Returns & Credit Notes
10. Commission & Target Management
11. Pricing Engine (Multi-Currency / Multi-Tier)
12. Tax Engine (Multi-Region)
13. Reports & Analytics
14. Dashboards
15. Audit Trail Integration
16. Inventory Integration
17. Accounting Integration
18. User Roles & Permissions
19. API Endpoints Reference
20. Database Schema Reference

---

# 1. MODULE OVERVIEW & ARCHITECTURE

## 1.1 Purpose
The Smart Sales Module (SSM) is a full-cycle, international-standard sales management system designed for multi-company, multi-branch, multi-currency, and multi-language environments. It manages the complete Order-to-Cash (O2C) cycle from initial customer inquiry to final payment collection and reconciliation.

## 1.2 Key Capabilities

| Capability | Description |
|---|---|
| Multi-Company | Separate books, policies, and workflows per company entity |
| Multi-Branch | Branch-level sales, inventory, and reporting |
| Multi-Currency | Real-time exchange rates, forex gain/loss accounting |
| Multi-Language | UI and document output in any configured language |
| Multi-Tax | VAT, GST, WHT, Sales Tax per region/customer |
| Multi-Warehouse | Sales linked to specific warehouse locations |
| Multi-Pricelist | Customer/segment/volume/date-based pricing |
| Approval Workflows | Configurable multi-level approval chains |
| Document Output | PDF invoices/orders in customer language |

## 1.3 O2C Process Flow

```
INQUIRY → QUOTATION → SALES ORDER → DELIVERY ORDER → INVOICE → PAYMENT → RECONCILIATION
            ↓               ↓              ↓               ↓
        Approval         Approval       WH Confirm      Accounting
        Workflow         Workflow       Stock Deduct     Entries
```

## 1.4 Technology Integration Map

```
Smart Sales Module
       ↕
┌─────────────────────────────────────┐
│  Accounting Module  ←→  GL Postings  │
│  Inventory Module   ←→  Stock Moves  │
│  CRM Module         ←→  Leads/Opps   │
│  HR/Payroll         ←→  Commissions  │
│  Audit Log System   ←→  All Events   │
│  Document Engine    ←→  PDF/Email     │
│  Exchange Rate API  ←→  Live FX Rates │
└─────────────────────────────────────┘
```

---

# 2. SYSTEM CONFIGURATION & SETUP

## 2.1 Company-Level Sales Settings Form

**Form Name:** SSM-CONFIG-001  
**Access:** System Admin → Company Settings → Sales Configuration

| Field | Type | Description |
|---|---|---|
| Default Currency | Dropdown (ISO 4217) | Base currency for sales documents |
| Default Tax Group | Lookup | Default tax applied to sales |
| Sales Order Numbering | Text/Pattern | Auto-sequence e.g. SO-{YEAR}-{SEQ} |
| Invoice Numbering | Text/Pattern | INV-{COMP}-{YEAR}-{SEQ} |
| Payment Terms Default | Dropdown | Net 30, Net 60, Immediate, etc. |
| Credit Limit Enforcement | Toggle | Block/Warn/Allow over-limit orders |
| Negative Stock Allowed | Toggle | Allow sales without stock |
| Auto Confirm SO | Toggle | Skip SO confirmation step |
| Quotation Validity Days | Number | Default quote expiry period |
| Delivery Policy | Dropdown | Ship Complete / Partial Allowed |
| Invoice Policy | Dropdown | On Delivery / On Order / Milestone |
| Commission Module Active | Toggle | Enable salesperson commission |
| Document Language Mode | Dropdown | System / Customer / Branch |
| Forex Gain/Loss Account | Lookup | GL Account for FX differences |
| Rounding Method | Dropdown | Half-up / Banker's Rounding |

---

# 3. CUSTOMER MASTER MANAGEMENT

## 3.1 Customer Registration Form

**Form Name:** SSM-CUST-001  
**Access:** Sales → Customers → New Customer

### Section A: Basic Information
| Field | Type | Validation |
|---|---|---|
| Customer Code | Auto/Manual | Unique per company |
| Customer Name | Text | Required, max 200 chars |
| Customer Type | Dropdown | Individual / Company / Government |
| Parent Company | Lookup | For subsidiaries |
| Registration No. | Text | Tax/Company registration |
| Tax ID / VAT No. | Text | Format per country |
| Industry Sector | Dropdown | Configurable list |
| Customer Since | Date | Default today |
| Active Status | Toggle | Active/Inactive |

### Section B: Contact & Address
| Field | Type | Description |
|---|---|---|
| Primary Email | Email | Required |
| Secondary Email | Email | Optional (CC on invoices) |
| Phone | Phone | With country code |
| Mobile | Phone | WhatsApp-enabled flag |
| Billing Address | Address Block | Street, City, State, ZIP, Country |
| Shipping Address | Address Block | Multiple allowed |
| Language Preference | Dropdown | Document output language |
| Time Zone | Dropdown | For scheduling |

### Section C: Financial Settings
| Field | Type | Description |
|---|---|---|
| Currency | Dropdown (ISO 4217) | Customer default currency |
| Pricelist | Lookup | Assigned price list |
| Payment Terms | Dropdown | Net 30, COD, etc. |
| Credit Limit | Decimal | Max open balance allowed |
| Credit Limit Warning % | Number | Alert threshold (e.g., 80%) |
| Tax Category | Dropdown | Local / Export / Exempt |
| Tax Group | Lookup | Applicable tax rules |
| Receivable Account | Lookup | Override default AR account |
| Salesperson | Lookup | Default assigned salesperson |
| Sales Team | Lookup | Assigned team |
| Collection Officer | Lookup | For AR follow-up |

### Section D: Delivery Preferences
| Field | Type | Description |
|---|---|---|
| Default Warehouse | Lookup | Source warehouse |
| Default Delivery Method | Dropdown | Courier / Own Fleet / Pickup |
| Incoterms | Dropdown | EXW, FOB, CIF, DDP, etc. |
| Delivery Instructions | Text Area | Special handling notes |

## 3.2 Customer Credit Check Logic

```
ON SALES ORDER SAVE:
  1. Get customer open balance (unpaid invoices + pending SO)
  2. Get customer credit limit
  3. Calculate: Usage % = (Open Balance / Credit Limit) × 100
  4. If Usage% >= Warning Threshold → Show Warning, allow proceed
  5. If Usage% >= 100% AND enforcement = Block → Reject SO
  6. If enforcement = Warn → Allow with manager approval flag
  7. All credit checks logged in Audit System
```

---

# 4. QUOTATION & PROFORMA INVOICE MODULE

## 4.1 Quotation Form

**Form Name:** SSM-QUOT-001  
**Access:** Sales → Quotations → New Quotation

### Header Section
| Field | Type | Description |
|---|---|---|
| Quotation No. | Auto | QT-{COMP}-{YEAR}-{SEQ} |
| Quotation Date | Date | Default today |
| Valid Until | Date | Auto from company setting |
| Customer | Lookup | Customer master |
| Customer Reference | Text | Customer's own PO/ref number |
| Currency | Dropdown | Default from customer |
| Exchange Rate | Decimal | Auto from live rate, editable |
| Pricelist | Lookup | Auto from customer, editable |
| Salesperson | Lookup | Logged-in user default |
| Sales Team | Lookup | Auto from salesperson |
| Payment Terms | Dropdown | Auto from customer |
| Delivery Terms | Dropdown | Incoterms |
| Delivery Date | Date | Expected delivery |
| Shipping Address | Dropdown | From customer addresses |
| Warehouse | Lookup | Source warehouse |
| Language | Dropdown | Document language |
| Notes to Customer | Text Area | Visible on document |
| Internal Notes | Text Area | Not on document |
| Tags | Multi-select | For filtering/reporting |
| Source | Dropdown | Website/Phone/Email/Visit/CRM |

### Line Items Grid
| Column | Type | Description |
|---|---|---|
| # | Auto | Line sequence |
| Product | Lookup | From product master |
| Description | Text | Auto from product, editable |
| Quantity | Decimal | Required |
| UOM | Dropdown | Unit of measure |
| Unit Price | Decimal | Auto from pricelist |
| Currency | Display | Header currency |
| Discount % | Decimal | Line-level discount |
| Discount Amount | Computed | Qty × Price × Disc% |
| Net Price | Computed | After discount |
| Tax Group | Lookup | Auto from product/customer |
| Tax Amount | Computed | Applied taxes |
| Subtotal | Computed | Net + Tax |
| Margin % | Computed | If cost available |
| Delivery Date | Date | Line-level override |
| Notes | Text | Line notes |

### Totals Section
| Field | Computed |
|---|---|
| Subtotal (before tax) | Sum of net lines |
| Total Discount | Sum of discounts |
| Tax Breakdown | Per tax type |
| Total Tax | Sum of all taxes |
| Shipping Charges | Manually added |
| Grand Total | All inclusive |
| Amount in Words | Auto-generated |
| Equivalent in Base Currency | FX converted |

## 4.2 Quotation Approval Workflow

```
DRAFT → [Submit for Approval]
  → If below discount threshold: Auto-Approve
  → If discount > 5%: Sales Manager Approval
  → If discount > 15%: Director Approval
  → If credit risk flagged: Credit Controller Approval
  → All steps: Email + In-app notification
APPROVED → Send to Customer (PDF/Email)
REJECTED → Back to Salesperson with notes
EXPIRED → Auto-status change after Valid Until date
```

## 4.3 Quotation Actions
- **Send by Email** — PDF attached, customer language, tracked open/read
- **Download PDF** — In selected language
- **Convert to Sales Order** — One-click, all data carried forward
- **Convert to Proforma Invoice** — For customs/advance payment
- **Duplicate** — Clone with new date
- **Cancel** — With reason mandatory
- **Revision** — Creates QT-XXXX-R1, R2, etc.

---

# 5. SALES ORDER MANAGEMENT

## 5.1 Sales Order Form

**Form Name:** SSM-SO-001  
**Access:** Sales → Orders → New Sales Order

### Header (Same as Quotation +)
| Field | Type | Description |
|---|---|---|
| SO Number | Auto | SO-{COMP}-{YEAR}-{SEQ} |
| Quotation Ref | Lookup | If converted from quote |
| Customer PO No. | Text | Customer's purchase order |
| Customer PO Date | Date | Customer PO date |
| Commitment Date | Date | Confirmed delivery date |
| Priority | Dropdown | Normal / Urgent / Critical |
| Project | Lookup | Link to project (if module active) |

### Line Items (Same as Quotation +)
| Column | Type | Description |
|---|---|---|
| Delivered Qty | Computed | From delivery orders |
| Invoiced Qty | Computed | From invoices |
| Remaining Qty | Computed | Ordered - Delivered |
| Status | Auto | Open/Partial/Done |

## 5.2 SO Status Flow

```
DRAFT
  ↓ [Confirm]
CONFIRMED
  ↓ [Generate Delivery]
IN DELIVERY
  ↓ [All Delivered]
DELIVERED
  ↓ [Generate Invoice]
INVOICED
  ↓ [Payment Received]
CLOSED
```

Possible exceptions: CANCELLED, ON HOLD, PARTIALLY_DELIVERED, PARTIALLY_INVOICED

## 5.3 Automatic SO Processing Rules

| Trigger | Action |
|---|---|
| SO Confirmed | Inventory reservation created |
| SO Confirmed | Delivery Order auto-created (if enabled) |
| SO Confirmed | Customer notified by email |
| Delivery Done | Invoice auto-created (if Invoice on Delivery) |
| Invoice Overdue | Alert to collection officer |
| SO Cancelled | Inventory reservations released |
| SO Cancelled | If deposit paid → credit note triggered |

---

# 6. DELIVERY & SHIPMENT MODULE

## 6.1 Delivery Order Form

**Form Name:** SSM-DEL-001  
**Access:** Sales → Deliveries → Open Deliveries

| Field | Type | Description |
|---|---|---|
| Delivery No. | Auto | DEL-{COMP}-{YEAR}-{SEQ} |
| Source SO | Link | Parent sales order |
| Customer | Display | From SO |
| Delivery Date | Date | Scheduled date |
| Actual Ship Date | Date | When dispatched |
| Delivery Method | Dropdown | Own Fleet/Courier/Pickup |
| Carrier | Lookup | Shipping company |
| Tracking Number | Text | From carrier |
| Shipping Address | Display | From SO, editable |
| Warehouse | Lookup | Source location |
| Picker | Lookup | Warehouse staff |
| Packer | Lookup | Warehouse staff |
| Weight | Decimal | Total shipment weight |
| Volume | Decimal | Total shipment volume |
| Number of Packages | Integer | Carton/box count |
| Special Instructions | Text Area | Handling notes |
| Proof of Delivery | File | Upload POD document |

### Line Items Grid
| Column | Description |
|---|---|
| Product | From SO |
| Ordered Qty | From SO |
| Available Stock | Real-time from inventory |
| Done Qty | Actual quantity shipped |
| Lot/Serial No. | If tracked item |
| Expiry Date | If perishable |
| Source Location | Specific bin/shelf |

## 6.2 Delivery Validation Logic

```
ON DELIVERY VALIDATE:
  1. Check Done Qty ≤ Remaining Ordered Qty
  2. If Lot tracking required → Lot must be specified
  3. If Expiry tracking → Check expiry not passed
  4. Deduct stock in Inventory Module
  5. Create Stock Move records (Audit trail)
  6. Update SO delivered quantities
  7. If all lines done → SO status = DELIVERED
  8. If partial → SO status = PARTIALLY_DELIVERED
  9. Post accounting entry (if COGS posting on delivery)
```

---

# 7. INVOICE & BILLING MODULE

## 7.1 Customer Invoice Form

**Form Name:** SSM-INV-001  
**Access:** Sales → Invoices → New Invoice

### Header
| Field | Type | Description |
|---|---|---|
| Invoice Number | Auto | INV-{COMP}-{YEAR}-{SEQ} |
| Invoice Date | Date | Posting date |
| Due Date | Computed | Invoice Date + Payment Terms |
| Source | Dropdown | From SO / Manual / Subscription |
| SO Reference | Link | Source sales order(s) |
| Delivery Reference | Link | Related deliveries |
| Customer | Lookup | |
| Customer PO No. | Text | For reference |
| Currency | Dropdown | Customer currency |
| Exchange Rate | Decimal | At invoice date |
| Payment Terms | Dropdown | |
| Bank Account | Lookup | Company bank for payment |
| IBAN / Swift | Display | Auto from bank account |
| Fiscal Position | Lookup | Tax mapping rules |
| Analytic Account | Lookup | Cost center / Project |

### Invoice Line Items
| Column | Description |
|---|---|
| Product / Account | Product or GL account |
| Description | Detailed description |
| Quantity | Billed quantity |
| UOM | Unit of measure |
| Unit Price | Selling price |
| Discount % | Applied discount |
| Tax | Tax group applied |
| Amount | Net amount |
| Analytic | Cost center per line |

### Tax Summary Section
| Tax Name | Base Amount | Tax Rate | Tax Amount |
|---|---|---|---|
| VAT 17% | [base] | 17% | [computed] |
| WHT 5% | [base] | 5% | [computed] |

### Payment Section (on invoice)
| Field | Description |
|---|---|
| Outstanding Payments | Any advances to apply |
| Payment Status | Unpaid / Partial / Paid |
| Amount Due | After applied payments |

## 7.2 Invoice Posting Process

```
DRAFT INVOICE
  ↓ [Confirm/Post]
JOURNAL ENTRIES CREATED:
  Dr. Accounts Receivable     [Grand Total in base currency]
  Cr. Sales Revenue Account   [Net sales per line/product]
  Cr. Tax Payable Account     [Tax amounts per tax type]
  Dr/Cr FX Adjustment         [If multi-currency]

POSTED INVOICE
  ↓ [Send to Customer]
Email with PDF in customer language
  ↓ [Payment Received]
PAID (Full or Partial)
```

## 7.3 Recurring Invoice Setup

| Field | Description |
|---|---|
| Recurrence Pattern | Monthly/Quarterly/Annual |
| Start Date | First invoice date |
| End Date | Optional termination |
| Auto-Post | Auto confirm recurring invoices |
| Auto-Send | Email automatically |
| Escalation % | Annual price increase |

---

# 8. PAYMENT & RECEIPT MODULE

## 8.1 Customer Payment Form

**Form Name:** SSM-PAY-001  
**Access:** Sales → Payments → Register Payment

| Field | Type | Description |
|---|---|---|
| Payment Reference | Auto | PAY-{COMP}-{YEAR}-{SEQ} |
| Payment Date | Date | Actual receipt date |
| Customer | Lookup | |
| Payment Method | Dropdown | Bank Transfer/Cheque/Cash/Online |
| Bank Reference | Text | Bank transaction ID |
| Cheque No. | Text | If cheque payment |
| Cheque Date | Date | For post-dated cheques |
| Amount Received | Decimal | In payment currency |
| Payment Currency | Dropdown | May differ from invoice |
| Exchange Rate | Decimal | At payment date |
| Amount in Base Currency | Computed | |
| Bank Account | Lookup | Company receiving account |
| Customer Bank | Text | Customer's bank reference |
| Invoices to Settle | Multi-select | Link to open invoices |
| Advance (Unallocated) | Toggle | If no specific invoice |
| Notes | Text Area | |

## 8.2 Payment Allocation Logic

```
PAYMENT REGISTERED:
  1. List all open invoices for customer
  2. Auto-allocate oldest-first (FIFO) or manual selection
  3. For multi-currency:
     a. Convert payment to invoice currency
     b. Calculate FX Gain/Loss = (Rate at invoice) vs (Rate at payment)
     c. Post FX Gain/Loss to configured GL account
  4. Mark invoice as Paid/Partially Paid
  5. Update AR aging report
  6. Generate receipt document for customer
```

## 8.3 Advance Payment Handling

```
ADVANCE RECEIVED (before invoice):
  Dr. Bank/Cash Account
  Cr. Customer Advance Account (Liability)

ON INVOICE CREATION:
  Link advance → Invoice
  Dr. Customer Advance Account
  Cr. Accounts Receivable
  (Net effect: reduces AR balance)
```

---

# 9. SALES RETURNS & CREDIT NOTES

## 9.1 Return Authorization Form

**Form Name:** SSM-RET-001  
**Access:** Sales → Returns → New Return Request

| Field | Type | Description |
|---|---|---|
| Return No. | Auto | RET-{COMP}-{YEAR}-{SEQ} |
| Return Date | Date | |
| Original Invoice | Lookup | Required reference |
| Original SO | Display | From invoice |
| Customer | Display | From invoice |
| Return Reason | Dropdown | Defective/Wrong Item/Excess/Other |
| Detailed Reason | Text Area | |
| Return Type | Dropdown | Full Return / Partial Return |
| Refund Method | Dropdown | Credit Note / Cash Refund / Exchange |
| Condition of Goods | Dropdown | Good/Damaged/Destroyed |
| Approval Required | Auto | Based on amount/policy |

### Return Lines
| Column | Description |
|---|---|
| Product | From original invoice |
| Original Qty | Invoiced quantity |
| Return Qty | Quantity being returned |
| Unit Price | Original selling price |
| Return Amount | Computed |
| Tax | Auto-reversed |
| Restock | Toggle — return to inventory? |
| Destination | Warehouse location for return |

## 9.2 Credit Note Generation

```
ON RETURN APPROVAL:
  1. Generate Credit Note (reverse of invoice)
  2. Accounting Entries:
     Dr. Sales Revenue          [Return amount]
     Cr. Accounts Receivable    [Total credit]
     Dr. Tax Payable            [Reverse tax]
  3. If Restock = Yes:
     → Inventory receipt created
     → Stock increased at destination location
  4. If Refund Method = Cash:
     → Payment refund record created
  5. Credit note can be applied to future invoices
```

---

# 10. COMMISSION & TARGET MANAGEMENT

## 10.1 Commission Setup Form

**Form Name:** SSM-COM-001

| Field | Type | Description |
|---|---|---|
| Commission Plan Name | Text | e.g., "Standard Sales Rep 2024" |
| Applicable To | Dropdown | Salesperson / Team / All |
| Calculation Basis | Dropdown | Revenue / Profit / GP% |
| Commission Rate | Decimal | Percentage |
| Tier Structure | Table | Volume-based tiers |
| Payment Trigger | Dropdown | On Invoice / On Payment |
| Product Category Filter | Multi-select | Specific categories only |
| Customer Category Filter | Multi-select | Specific customer types |
| Exclusions | Multi-select | Excluded products/customers |
| Currency | Dropdown | Commission payment currency |
| Valid From / To | Date Range | |

### Tier Table Example
| From Amount | To Amount | Rate % |
|---|---|---|
| 0 | 50,000 | 2.0% |
| 50,001 | 100,000 | 2.5% |
| 100,001 | Unlimited | 3.0% |

## 10.2 Sales Target Management

| Field | Description |
|---|---|
| Target Period | Month / Quarter / Year |
| Salesperson / Team | Target owner |
| Revenue Target | Amount in base currency |
| Qty Target | Optional unit target |
| GP Target | Gross profit target |
| New Customer Target | Number of new accounts |
| Auto-calculation | Progress tracked against SO/Invoices |

---

# 11. PRICING ENGINE

## 11.1 Pricelist Configuration

**Form Name:** SSM-PRICE-001

| Field | Description |
|---|---|
| Pricelist Name | e.g., "Retail USD", "Wholesale PKR" |
| Currency | ISO 4217 |
| Computation Method | Fixed / Discount on Cost / Markup on Cost / Formula |
| Rounding | To nearest 0.01, 0.5, 1, 5, 10 |
| Start Date / End Date | Validity period |
| Country Groups | Geographic applicability |
| Customer Segments | Assigned customer categories |

### Pricelist Rules
| Priority | Product/Category | Qty Min | Price Type | Value |
|---|---|---|---|---|
| 1 | Specific Product A | 1 | Fixed | 150.00 |
| 2 | Category Electronics | 50 | Discount | 10% off |
| 3 | All Products | 1 | Markup | Cost + 25% |

## 11.2 Price Calculation Flow

```
ON PRODUCT ADDED TO ORDER:
  1. Check customer's assigned pricelist
  2. Find matching rule (highest priority first)
  3. Check quantity breaks
  4. Apply computation:
     - Fixed: Use defined price
     - Discount: Base Price × (1 - Discount%)
     - Markup: Cost Price × (1 + Markup%)
     - Formula: Custom expression
  5. Convert to order currency using live rate
  6. Apply rounding rule
  7. Check minimum margin (alert if below threshold)
```

---

# 12. TAX ENGINE (MULTI-REGION)

## 12.1 Tax Configuration

| Field | Description |
|---|---|
| Tax Name | e.g., "VAT 17% - Pakistan" |
| Tax Type | Sales / Purchase / Both |
| Computation | Percentage / Fixed / Group |
| Rate % | Applied rate |
| Tax Account | GL account for tax payable |
| Tax Scope | Services / Goods / Both |
| Country | Applicability |
| Tax Group | For display grouping on invoice |
| Price Included | Is price tax-inclusive? |
| Cascade | Apply on previous tax? |

## 12.2 Fiscal Position (Tax Mapping)

Fiscal positions map standard taxes to region-specific taxes automatically.

| Customer Type | Standard Tax | Mapped Tax |
|---|---|---|
| Local Customer | VAT 17% | VAT 17% (no change) |
| Export Customer | VAT 17% | Zero-Rated (0%) |
| AJK Customer | VAT 17% | AJK VAT 16% |
| Gulf Customer | GST 5% | UAE VAT 5% |

---

# 13. REPORTS & ANALYTICS

## 13.1 Sales Reports List

### R-01: Sales Summary Report
**Purpose:** High-level sales performance overview  
**Filters:** Date Range, Company, Branch, Currency, Salesperson, Customer, Product Category  
**Columns:** Period | Invoices Count | Gross Sales | Discounts | Net Sales | Tax | Total | vs Last Period %  
**Group By:** Day / Week / Month / Quarter / Year  
**Output:** Screen / PDF / Excel / CSV

---

### R-02: Salesperson Performance Report
**Purpose:** Individual and team sales performance  
**Filters:** Period, Team, Salesperson, Target vs Actual  
**Columns:** Salesperson | Target | Achieved | Achievement% | GP | Commission Earned | New Customers  
**Visualization:** Progress bars, trend lines  
**Output:** Screen / PDF / Excel

---

### R-03: Customer Sales Analysis
**Purpose:** Per-customer sales breakdown  
**Filters:** Date Range, Customer, Segment, Country, Currency  
**Columns:** Customer | Total Orders | Total Invoiced | Paid | Outstanding | Last Order Date | Credit Usage%  
**Sort By:** Any column  
**Output:** Screen / PDF / Excel

---

### R-04: Product Sales Analysis
**Purpose:** Best-selling and slow-moving product analysis  
**Filters:** Date Range, Product, Category, Warehouse  
**Columns:** Product | Qty Sold | Revenue | Avg Price | Discount Given | GP | GP% | Rank  
**Visualization:** Bar chart, pie chart  
**Output:** Screen / PDF / Excel

---

### R-05: Outstanding Invoices (AR Aging)
**Purpose:** Receivables aging analysis  
**Filters:** As of Date, Customer, Salesperson, Currency  
**Columns:** Customer | Current | 1-30 Days | 31-60 Days | 61-90 Days | 90+ Days | Total Outstanding  
**Color Coding:** Green/Yellow/Orange/Red by aging bracket  
**Output:** Screen / PDF / Excel / Email Schedule

---

### R-06: Sales Order Status Report
**Purpose:** Pipeline and order fulfillment tracking  
**Filters:** Date Range, Status, Customer, Salesperson, Priority  
**Columns:** SO No. | Customer | Date | Commitment Date | Amount | Delivered% | Invoiced% | Status  
**Output:** Screen / PDF / Excel

---

### R-07: Quotation Conversion Report
**Purpose:** Quote-to-order conversion analysis  
**Filters:** Period, Salesperson, Customer  
**Columns:** Quotes Sent | Converted | Lost | Expired | Conversion Rate% | Avg Days to Convert  
**Output:** Screen / PDF / Excel

---

### R-08: Sales Returns Report
**Purpose:** Return and credit note analysis  
**Columns:** Return No. | Customer | Product | Return Reason | Amount | Restocked Y/N | Credit Note Status  
**Output:** Screen / PDF / Excel

---

### R-09: Commission Report
**Purpose:** Sales commission calculation and verification  
**Filters:** Period, Salesperson, Plan  
**Columns:** Salesperson | Invoice Amount | Commission Basis | Rate% | Commission Earned | Status  
**Output:** Screen / PDF / Excel

---

### R-10: Multi-Currency Sales Report
**Purpose:** Sales in original and base currency  
**Columns:** Invoice | Customer | Original Currency | Original Amount | Exchange Rate | Base Currency Amount | FX Gain/Loss  
**Output:** Screen / PDF / Excel

---

### R-11: Tax Collection Report
**Purpose:** Tax liability reporting for tax authorities  
**Filters:** Period, Tax Type, Fiscal Position  
**Columns:** Tax Name | Tax Rate | Taxable Amount | Tax Collected | Tax Refunded | Net Tax Due  
**Format:** Suitable for FBR/VAT filing  
**Output:** Screen / PDF / Excel

---

### R-12: Delivery Performance Report
**Purpose:** On-time delivery tracking  
**Columns:** Delivery No. | SO No. | Customer | Promised Date | Actual Date | Variance Days | On Time Y/N  
**Output:** Screen / PDF / Excel

---

# 14. DASHBOARDS

## 14.1 Sales Executive Dashboard

**Target User:** Salesperson  
**Refresh:** Real-time  

### KPI Widgets (Top Row)
| Widget | Metric |
|---|---|
| My Sales This Month | Revenue vs Target with % |
| My Quotations | Open quotes count + value |
| My Orders | Active SO count + value |
| My Overdue Invoices | Amount overdue |
| My Commission YTD | Earned commission |

### Charts Section
| Chart | Type | Data |
|---|---|---|
| Sales Trend | Line Chart | Daily/weekly sales this month vs last month |
| Top 5 Customers | Bar Chart | By revenue this period |
| Pipeline Funnel | Funnel | Quotes → SO → Delivered → Invoiced |
| Target vs Actual | Gauge | Monthly progress |

### Activity Feed
- Recent quotations sent
- Pending approvals
- Overdue invoice alerts
- Upcoming commitment dates

---

## 14.2 Sales Manager Dashboard

**Target User:** Sales Manager / Team Leader  
**Refresh:** Real-time  

### KPI Widgets
| Widget | Metric |
|---|---|
| Team Revenue MTD | vs Target % |
| Open Quotation Value | Total pipeline |
| Orders Pending Delivery | Count + Value |
| AR Outstanding | Team's receivables |
| Avg Deal Size | Current vs last period |
| New Customers This Month | Count |

### Charts Section
| Chart | Type | Data |
|---|---|---|
| Team Leaderboard | Bar Chart | Revenue per salesperson |
| Quote Conversion Rate | Trend Line | Weekly conversion % |
| Customer Acquisition | Column Chart | New vs Repeat customers |
| Margin Analysis | Scatter Plot | Revenue vs GP% by deal |
| Top Products | Donut Chart | By revenue share |

### Alerts & Actions Panel
- Quotes expiring in next 7 days
- Approvals waiting (discount/credit)
- Orders with missed commitment dates
- High-value customers with overdue invoices

---

## 14.3 Finance / AR Dashboard

**Target User:** Finance Manager, AR Officer  
**Refresh:** Hourly  

### KPI Widgets
| Widget | Metric |
|---|---|
| Total AR Outstanding | In base currency |
| Current (not due) | Amount |
| Overdue (all buckets) | Amount |
| Collected This Month | Amount |
| Avg Collection Days (DSO) | Days Sales Outstanding |
| Bad Debt Risk | High-aging amount |

### Charts Section
| Chart | Type | Data |
|---|---|---|
| AR Aging Pyramid | Stacked Bar | Current/30/60/90/90+ |
| Daily Collections | Bar Chart | Payments received per day |
| Top 10 Overdue | Table | Customer + days overdue |
| Collection Trend | Line Chart | Monthly collection vs target |
| FX Exposure | Donut Chart | AR by currency |

---

## 14.4 C-Suite / Executive Dashboard

**Target User:** CEO, CFO, Director  
**Refresh:** Daily  

### KPI Widgets
| Widget | Metric |
|---|---|
| Revenue YTD | vs Budget % |
| Gross Profit YTD | GP% |
| Active Customers | Count |
| Total Orders | Month/Quarter/Year |
| Collection Efficiency | % |
| Top Market | By revenue |

### Charts
| Chart | Type |
|---|---|
| Monthly Revenue Trend (3 years) | Multi-line |
| Revenue by Company/Branch | Grouped Bar |
| Revenue by Country | World Map Heat |
| Top Customers (Pareto) | Bar + Line |
| Product Category Mix | Donut |
| Sales Forecast | Predictive Line |

---

# 15. AUDIT TRAIL INTEGRATION

## 15.1 Events Logged for Sales Module

| Event | Data Captured |
|---|---|
| Quotation Created/Modified | User, Timestamp, Before/After values |
| Discount Applied > Threshold | User, Amount, Approver |
| SO Confirmed | User, Timestamp, Total value |
| SO Cancelled | User, Reason, Original value |
| Delivery Validated | User, Quantities, Stock locations |
| Invoice Posted | User, Amounts, GL entries |
| Invoice Cancelled | User, Reason, Reversal entries |
| Payment Registered | User, Amount, Bank reference |
| Credit Note Created | User, Reason, Amounts |
| Price Override | User, Original price, New price, Reason |
| Credit Limit Override | User, Customer, Approver |
| Exchange Rate Override | User, System rate, Applied rate |

## 15.2 Audit Log Record Structure

```json
{
  "log_id": "AUDIT-SO-20240115-0001",
  "company_id": "COMP-001",
  "module": "SmartSales",
  "event_type": "SO_CONFIRMED",
  "document_type": "SalesOrder",
  "document_id": "SO-COMP-2024-00142",
  "user_id": "USR-042",
  "user_name": "Ahmed Khan",
  "branch": "Lahore-Main",
  "timestamp": "2024-01-15T14:32:11Z",
  "ip_address": "192.168.1.55",
  "session_id": "SES-20240115-XR92",
  "changes": {
    "status": {"before": "DRAFT", "after": "CONFIRMED"},
    "total_amount": {"before": 0, "after": 125000.00}
  },
  "metadata": {
    "customer": "CUST-0089",
    "currency": "PKR",
    "salesperson": "USR-042"
  }
}
```

---

# 16. INVENTORY INTEGRATION

## 16.1 Stock Reservation Flow

```
SO CONFIRMED:
  → For each line: Reserve stock in inventory
  → Reservation record: Product | Qty | Warehouse | Batch | SO Ref
  → Reserved Qty shown in inventory (not available for other orders)
  → If insufficient stock: Warning or block (per company setting)

DELIVERY VALIDATED:
  → Convert reservation to actual move
  → Decrease stock on-hand
  → Create stock move record
  → Update inventory valuation (FIFO/AVCO/Standard)

RETURN RECEIVED (Restock=Yes):
  → Create positive stock move
  → Increase stock on-hand
  → Record in inventory with return reference
```

## 16.2 Stock Availability Check on Order

| Scenario | System Behavior |
|---|---|
| Stock Available | Proceed normally |
| Stock Partial | Show availability, allow partial order |
| Stock Zero | Warning + expected restock date |
| Negative Stock Allowed | Proceed with negative stock flag |
| Negative Stock Not Allowed | Block order line |

---

# 17. ACCOUNTING INTEGRATION

## 17.1 Automatic Journal Entry Map

| Transaction | Debit | Credit |
|---|---|---|
| Invoice Posted | AR Account | Sales Revenue + Tax Payable |
| Payment Received | Bank/Cash | AR Account |
| Payment FX Gain | AR Account | FX Gain Account |
| Payment FX Loss | FX Loss Account | AR Account |
| Credit Note Posted | Sales Revenue + Tax Payable | AR Account |
| Advance Received | Bank/Cash | Customer Advance (Liability) |
| Advance Applied | Customer Advance | AR Account |
| Bad Debt Write-off | Bad Debt Expense | AR Account |

## 17.2 Period Closing Checks

Before period close, system checks:
1. All confirmed SOs have been delivered or have delivery in progress
2. All deliveries have invoices
3. No draft invoices in the period
4. All payments reconciled
5. FX revaluation of open AR completed
6. Commission accruals posted

---

# 18. USER ROLES & PERMISSIONS

## 18.1 Role Matrix

| Feature | Sales Rep | Senior Rep | Sales Manager | Finance | Admin |
|---|---|---|---|---|---|
| Create Quotation | ✓ | ✓ | ✓ | View | ✓ |
| Approve Discount <5% | ✓ | ✓ | ✓ | — | ✓ |
| Approve Discount 5-15% | — | ✓ | ✓ | — | ✓ |
| Approve Discount >15% | — | — | ✓ | — | ✓ |
| Confirm Sales Order | ✓ | ✓ | ✓ | — | ✓ |
| Cancel Sales Order | — | — | ✓ | — | ✓ |
| Post Invoice | — | — | — | ✓ | ✓ |
| Register Payment | — | — | — | ✓ | ✓ |
| Override Credit Limit | — | — | ✓ | ✓ | ✓ |
| View All Customers | — | — | ✓ | ✓ | ✓ |
| View Own Customers | ✓ | ✓ | ✓ | — | ✓ |
| Commission Reports | Own | Own | Team | All | All |
| System Configuration | — | — | — | — | ✓ |
| Export Data | — | ✓ | ✓ | ✓ | ✓ |
| Delete Records | — | — | — | — | ✓ |

---

# 19. API ENDPOINTS REFERENCE

## 19.1 RESTful API Summary

**Base URL:** `https://erp.yourcompany.com/api/v1/sales/`  
**Auth:** Bearer Token (JWT)  
**Format:** JSON  
**Versioning:** URL-based (/v1/, /v2/)

| Method | Endpoint | Description |
|---|---|---|
| GET | /quotations | List quotations (paginated, filterable) |
| POST | /quotations | Create new quotation |
| GET | /quotations/{id} | Get quotation details |
| PUT | /quotations/{id} | Update draft quotation |
| POST | /quotations/{id}/confirm | Confirm quotation |
| POST | /quotations/{id}/send | Send to customer |
| POST | /quotations/{id}/convert | Convert to SO |
| GET | /orders | List sales orders |
| POST | /orders | Create sales order |
| GET | /orders/{id} | Get SO details |
| POST | /orders/{id}/confirm | Confirm SO |
| POST | /orders/{id}/cancel | Cancel SO |
| GET | /invoices | List invoices |
| POST | /invoices | Create invoice |
| POST | /invoices/{id}/post | Post invoice |
| GET | /payments | List payments |
| POST | /payments | Register payment |
| GET | /customers | List customers |
| POST | /customers | Create customer |
| GET | /customers/{id}/statement | Customer statement |
| GET | /reports/ar-aging | AR aging report |
| GET | /reports/sales-summary | Sales summary |
| GET | /pricelist/calculate | Calculate price for product+qty+customer |

---

# 20. DATABASE SCHEMA REFERENCE

## 20.1 Core Tables

### sales_quotation
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| company_id | FK | Company reference |
| branch_id | FK | Branch reference |
| quotation_no | VARCHAR(50) | Unique document number |
| state | ENUM | draft/sent/confirmed/cancelled/expired |
| customer_id | FK | Customer master |
| currency_id | FK | ISO 4217 currency |
| exchange_rate | DECIMAL(15,6) | At document date |
| pricelist_id | FK | Applied pricelist |
| salesperson_id | FK | HR employee |
| validity_date | DATE | Quote expiry |
| amount_untaxed | DECIMAL(18,2) | Before tax total |
| amount_tax | DECIMAL(18,2) | Total tax |
| amount_total | DECIMAL(18,2) | Grand total |
| amount_total_base | DECIMAL(18,2) | In base currency |
| language_id | FK | Document language |
| created_by | FK | User |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### sales_order
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| quotation_id | FK | Source quotation |
| order_no | VARCHAR(50) | Unique SO number |
| state | ENUM | draft/confirmed/done/cancelled |
| commitment_date | DATE | Promised delivery |
| delivery_status | ENUM | pending/partial/done |
| invoice_status | ENUM | nothing/partial/invoiced |
| ... | | (all quotation fields +) |

### sales_order_line
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| order_id | FK | Parent SO |
| sequence | INT | Line number |
| product_id | FK | Product master |
| description | TEXT | Line description |
| quantity | DECIMAL(15,3) | Ordered qty |
| uom_id | FK | Unit of measure |
| price_unit | DECIMAL(18,4) | Unit price |
| discount | DECIMAL(5,2) | Discount % |
| price_subtotal | DECIMAL(18,2) | Net amount |
| tax_ids | M2M | Applied taxes |
| qty_delivered | DECIMAL(15,3) | From deliveries |
| qty_invoiced | DECIMAL(15,3) | From invoices |
| analytic_account_id | FK | Cost center |

### customer_invoice
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| invoice_no | VARCHAR(50) | Unique number |
| invoice_date | DATE | Posting date |
| due_date | DATE | Payment deadline |
| state | ENUM | draft/posted/cancelled |
| payment_state | ENUM | not_paid/partial/paid |
| customer_id | FK | |
| currency_id | FK | |
| exchange_rate | DECIMAL(15,6) | |
| amount_untaxed | DECIMAL(18,2) | |
| amount_tax | DECIMAL(18,2) | |
| amount_total | DECIMAL(18,2) | |
| amount_residual | DECIMAL(18,2) | Outstanding |
| journal_id | FK | Accounting journal |
| move_id | FK | Journal entry |

### customer_payment
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| payment_no | VARCHAR(50) | Reference number |
| payment_date | DATE | |
| payment_method | ENUM | bank/cheque/cash/online |
| amount | DECIMAL(18,2) | In payment currency |
| currency_id | FK | |
| exchange_rate | DECIMAL(15,6) | |
| amount_base | DECIMAL(18,2) | In base currency |
| state | ENUM | draft/posted/reconciled |
| bank_ref | VARCHAR(100) | Bank transaction ID |
| customer_id | FK | |
| journal_id | FK | |

---

# APPENDIX A: FORM NUMBERING REFERENCE

| Code | Form Name |
|---|---|
| SSM-CONFIG-001 | Company Sales Configuration |
| SSM-CUST-001 | Customer Registration |
| SSM-QUOT-001 | Quotation / Proforma Invoice |
| SSM-SO-001 | Sales Order |
| SSM-DEL-001 | Delivery Order |
| SSM-INV-001 | Customer Invoice |
| SSM-PAY-001 | Customer Payment |
| SSM-RET-001 | Return Authorization |
| SSM-COM-001 | Commission Plan Setup |
| SSM-PRICE-001 | Pricelist Configuration |

# APPENDIX B: REPORT NUMBERING REFERENCE

| Code | Report Name |
|---|---|
| R-01 | Sales Summary Report |
| R-02 | Salesperson Performance |
| R-03 | Customer Sales Analysis |
| R-04 | Product Sales Analysis |
| R-05 | AR Aging Report |
| R-06 | SO Status Report |
| R-07 | Quotation Conversion |
| R-08 | Sales Returns Report |
| R-09 | Commission Report |
| R-10 | Multi-Currency Sales |
| R-11 | Tax Collection Report |
| R-12 | Delivery Performance |

# APPENDIX C: INTERNATIONAL STANDARDS COMPLIANCE

| Standard | Application in SSM |
|---|---|
| IFRS 15 | Revenue recognition on performance obligation |
| IFRS 9 | Expected credit loss for AR provisioning |
| ISO 4217 | Currency codes throughout system |
| ISO 8601 | Date/time format in all records and API |
| Unicode CLDR | Number/date formatting per locale |
| GDPR Article 17 | Customer data deletion capability |
| SOX Section 302 | Approval workflows and audit trail |
| FATF Guidelines | Customer due diligence fields |

---

*Document End — Smart Sales Module Technical Flow v1.0*  
*Prepared for: International ERP System | SSM Module*  
*All forms, reports, and workflows comply with international accounting standards*
