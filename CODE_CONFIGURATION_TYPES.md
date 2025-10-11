# Code Configuration Types - Complete ERP System

This document lists all available code types in the Code Configuration module for the complete ERP system.

## 📊 Customer & Sales Related (6 Types)

| Code Type | Label | Description |
|-----------|-------|-------------|
| `customer` | Customer Code | Main customer master codes |
| `lead` | Lead/Prospect Code | Lead and prospect tracking codes |
| `sales_order` | Sales Order Code | Sales order document numbering |
| `sales_invoice` | Sales Invoice Code | Sales invoice numbering |
| `sales_return` | Sales Return Code | Sales return document codes |
| `quotation` | Quotation Code | Quotation/Quote numbering |

## 🛒 Supplier & Purchase Related (6 Types)

| Code Type | Label | Description |
|-----------|-------|-------------|
| `vendor` | Vendor Code | Vendor master codes |
| `supplier` | Supplier Code | Supplier master codes |
| `purchase_order` | Purchase Order Code | Purchase order numbering |
| `purchase_invoice` | Purchase Invoice Code | Purchase invoice numbering |
| `purchase_return` | Purchase Return Code | Purchase return codes |
| `grn` | GRN (Goods Receipt Note) Code | Goods receipt note numbering |

## 📦 Inventory & Products (7 Types)

| Code Type | Label | Description |
|-----------|-------|-------------|
| `product` | Product Code | Product master codes |
| `raw_material` | Raw Material Code | Raw material inventory codes |
| `finished_goods` | Finished Goods Code | Finished goods codes |
| `batch` | Batch Code | Batch numbering for inventory |
| `serial` | Serial Number Code | Serial number tracking |
| `bin_location` | Bin/Location Code | Warehouse bin locations |
| `warehouse` | Warehouse Code | Warehouse master codes |

## 💰 Financial (8 Types)

| Code Type | Label | Description |
|-----------|-------|-------------|
| `bank` | Bank Account Code | Bank account codes |
| `cash` | Cash Account Code | Cash account codes |
| `payment_voucher` | Payment Voucher Code | Payment voucher numbering |
| `receipt_voucher` | Receipt Voucher Code | Receipt voucher numbering |
| `journal_voucher` | Journal Voucher Code | Journal voucher numbering |
| `expense` | Expense Code | Expense tracking codes |
| `budget` | Budget Code | Budget numbering |
| `cost_center` | Cost Center Code | Cost center codes |

## 👥 Human Resource (6 Types)

| Code Type | Label | Description |
|-----------|-------|-------------|
| `employee` | Employee Code | Employee master codes |
| `department` | Department Code | Department codes |
| `designation` | Designation Code | Job designation codes |
| `attendance` | Attendance Code | Attendance record codes |
| `payroll` | Payroll Code | Payroll processing codes |
| `leave` | Leave Application Code | Leave application numbering |

## 🏢 Assets (3 Types)

| Code Type | Label | Description |
|-----------|-------|-------------|
| `asset` | Asset Code | General asset codes |
| `fixed_asset` | Fixed Asset Code | Fixed asset codes |
| `asset_maintenance` | Asset Maintenance Code | Asset maintenance codes |

## 🎯 Projects & Jobs (4 Types)

| Code Type | Label | Description |
|-----------|-------|-------------|
| `project` | Project Code | Project codes |
| `job` | Job Code | Job codes |
| `task` | Task Code | Task numbering |
| `work_order` | Work Order Code | Work order numbering |

## 🏭 Manufacturing (4 Types)

| Code Type | Label | Description |
|-----------|-------|-------------|
| `bom` | BOM (Bill of Materials) Code | Bill of materials codes |
| `production_order` | Production Order Code | Production order numbering |
| `job_card` | Job Card Code | Job card numbering |
| `quality_inspection` | Quality Inspection Code | Quality control codes |

## 📋 Others (6 Types)

| Code Type | Label | Description |
|-----------|-------|-------------|
| `contract` | Contract Code | Contract numbering |
| `delivery_note` | Delivery Note Code | Delivery note numbering |
| `shipment` | Shipment Code | Shipment tracking codes |
| `complaint` | Complaint/Ticket Code | Complaint/ticket numbering |
| `warranty` | Warranty Code | Warranty tracking codes |
| `barcode` | Barcode Code | Barcode generation codes |

---

## 📊 Summary

**Total Code Types: 50+**

### By Category:
- Customer & Sales: 6 types
- Supplier & Purchase: 6 types
- Inventory & Products: 7 types
- Financial: 8 types
- Human Resource: 6 types
- Assets: 3 types
- Projects & Jobs: 4 types
- Manufacturing: 4 types
- Others: 6 types

## 💡 Usage Examples

### Example 1: Customer Code Configuration
```
Code Type: customer
Code Name: Customer Code
Prefix: CUST
Separator: -
Number Length: 4
Next Number: 1
Result: CUST-0001, CUST-0002, CUST-0003...
```

### Example 2: Sales Invoice Configuration
```
Code Type: sales_invoice
Code Name: Sales Invoice
Prefix: SI
Separator: /
Number Length: 5
Next Number: 1
Result: SI/00001, SI/00002, SI/00003...
```

### Example 3: Employee Code (Company Level)
```
Code Type: employee
Code Name: Employee ID
Company: ABC Corporation
Location: Head Office
Prefix: EMP
Separator: -
Number Length: 6
Next Number: 1001
Result: EMP-001001, EMP-001002, EMP-001003...
```

## 🎯 Features

✅ **Parent Company Level**: Configuration can be set at parent level (applies to all companies)
✅ **Company Specific**: Configuration can be specific to a company
✅ **Location Specific**: Configuration can be specific to a location within a company
✅ **Flexible Format**: Customize prefix, separator, and number length
✅ **Auto Increment**: System automatically generates next number
✅ **Multi-level**: Supports Level 2 and Level 3 in chart of accounts

## 🔧 System Access

**Route:** `/system/code-configurations`

**Permissions Required:**
- View: See all configurations
- Add: Create new configurations
- Edit: Update existing configurations
- Delete: Remove configurations

---

**Created:** October 2025  
**Version:** 1.0  
**Module:** Code Configuration Management

