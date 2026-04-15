# Phase 3 Implementation Plan

**Status:** Phase 3 - Functional Enhancement  
**Start Date:** April 15, 2026  

---

## 🎯 Phase 3 Objectives

بغیر لائن آئٹمز کے فارمز مکمل نہیں ہیں۔ اب ہمیں:
1. **Line Items Management UI** شامل کریں
2. **Amount Calculations** خودکار کریں
3. **Workflow State Transitions** implement کریں
4. **Complete Testing** کریں

---

## 📋 Task Breakdown

### Task 1: Line Items Management UI (HIGH PRIORITY)
**یہ سب سے اہم کام ہے**

#### Problem:
موجودہ Quotation/Order/Invoice Form میں line items شامل کرنے کا کوئی طریقہ نہیں

#### Solution:
ہر form میں ایک "Line Items" section شامل کریں جہاں:
- Product select کریں
- Quantity درج کریں
- Unit Price خود fill ہو (product سے)
- Discount % لگائیں
- Line Total خود calculate ہو
- Add/Remove buttons ہوں

#### Implementation:
1. QuotationForm میں line items section شامل کریں
2. SalesOrderForm میں line items section شامل کریں
3. InvoiceForm میں line items section شامل کریں
4. Line items کو state میں ٹریک کریں
5. Save کرتے وقت line items بھی save ہوں

#### Files to Update:
- `resources/js/Pages/Sales/Quotation/Form.jsx`
- `resources/js/Pages/Sales/SalesOrder/Form.jsx`
- `resources/js/Pages/Sales/Invoice/Form.jsx`

---

### Task 2: Amount Calculations (HIGH PRIORITY)

#### What to Calculate:
```
Line Level:
- line_amount_untaxed = quantity × unit_price - discount_amount
- tax_amount = line_amount_untaxed × tax_rate (اگر applicable)
- line_amount_total = line_amount_untaxed + tax_amount

Header Level:
- amount_untaxed = SUM(all line_amount_untaxed)
- amount_tax = SUM(all tax_amount)
- amount_total = amount_untaxed + amount_tax
```

#### Implementation:
1. Helper function بنائیں جو line totals calculate کرے
2. Helper function جو header totals calculate کرے
3. Line item changes سے automatically header update ہو
4. Display کریں formatted currency میں

#### Files to Create:
- `resources/js/Utils/SalesCalculations.js` - Shared calculation logic

---

### Task 3: Workflow State Transitions (MEDIUM PRIORITY)

#### Quotation Workflow:
```
draft → (confirm button) → confirmed
draft → (send button) → sent
any state → (cancel button) → cancelled
sent (date passed) → expired
```

#### Sales Order Workflow:
```
draft → (confirm button) → confirmed
confirmed → (mark delivery) → in_delivery
in_delivery → (complete delivery) → delivered
delivered → (invoice) → invoiced
invoiced → (close) → closed
```

#### Invoice Workflow:
```
draft → (post button) → posted
posted → (payment) → updates payment_status
```

#### Implementation:
1. Add action buttons on Index pages
2. Create action methods in controllers
3. Update state on backend
4. Refresh UI after state change

---

### Task 4: Complete O2C Testing (MEDIUM PRIORITY)

Test the entire workflow:
```
1. Create Customer ✓ (Phase 1)
2. Create Quotation (Draft) → ✓ Need to test with line items
3. Send/Confirm Quotation → Need to implement action
4. Create Sales Order from Quotation → Need to copy line items
5. Confirm Sales Order → Need to implement action
6. Create Delivery Order → Link to SO
7. Complete Delivery → Update state
8. Create Invoice from Delivery → Copy line items
9. Post Invoice → Change state to posted
10. Register Payment → Allocate to invoice
11. Verify payment_status changes to "paid"
```

---

## 🛠️ Implementation Order

### Step 1: Create Calculation Helper (30 min)
- Create `resources/js/Utils/SalesCalculations.js`
- Functions: calculateLineTotal(), calculateHeaderTotals()
- Handle currency formatting

### Step 2: Update Quotation Form (1 hour)
- Add line items table
- Add product select
- Implement line item calculations
- Add add/remove buttons
- Test save/load

### Step 3: Update Sales Order Form (1 hour)
- Copy quotation template
- Add quotation_id field
- When quotation selected, auto-load line items
- Allow edit line items
- Test calculations

### Step 4: Update Invoice Form (1 hour)
- Copy sales order template
- Add sales_order_id field
- Auto-load line items from SO
- Display payment_status after save

### Step 5: Add State Transition Actions (1.5 hours)
- Add confirm/send buttons to Quotation Index
- Add confirm button to SalesOrder Index
- Add post button to Invoice Index (already have)
- Implement backend actions
- Test state changes

### Step 6: Complete Testing (1 hour)
- Create test customer
- Walk through entire O2C workflow
- Verify calculations at each step
- Check state transitions
- Report any issues

---

## 💻 Code Examples

### Line Items Component Template

```jsx
// In QuotationForm.jsx
const [lineItems, setLineItems] = useState(initialData?.line_items || []);

const addLineItem = () => {
    setLineItems([
        ...lineItems,
        {
            id: null,
            product_id: '',
            product_name: '',
            quantity: 1,
            unit_price: 0,
            discount_type: 0,
            discount_amount: 0,
            line_amount_total: 0,
        }
    ]);
};

const removeLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
};

const updateLineItem = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] = value;
    
    // Recalculate
    const total = calculateLineTotal(updated[index]);
    updated[index].line_amount_total = total;
    
    setLineItems(updated);
};

// Render table
<table className="w-full mt-6 border">
    <thead>
        <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Discount</th>
            <th>Total</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody>
        {lineItems.map((item, idx) => (
            <tr key={idx}>
                <td>
                    <select
                        value={item.product_id}
                        onChange={(e) => updateLineItem(idx, 'product_id', e.target.value)}
                    >
                        <option>Select</option>
                        {products.map(p => <option value={p.id}>{p.name}</option>)}
                    </select>
                </td>
                {/* Other fields */}
                <td>
                    <button onClick={() => removeLineItem(idx)}>Delete</button>
                </td>
            </tr>
        ))}
    </tbody>
</table>

<button onClick={addLineItem}>+ Add Line Item</button>
```

### Calculation Helper

```js
// resources/js/Utils/SalesCalculations.js

export const calculateLineTotal = (lineItem) => {
    const { quantity, unit_price, discount_amount } = lineItem;
    const subtotal = quantity * unit_price;
    const afterDiscount = subtotal - discount_amount;
    return Math.round(afterDiscount * 100) / 100;
};

export const calculateHeaderTotals = (lineItems) => {
    const amount_untaxed = lineItems.reduce((sum, item) => {
        const qty_price = item.quantity * item.unit_price;
        return sum + (qty_price - item.discount_amount);
    }, 0);
    
    const amount_tax = Math.round(amount_untaxed * 100) / 100; // TODO: actual tax rate
    const amount_total = amount_untaxed + amount_tax;
    
    return {
        amount_untaxed: Math.round(amount_untaxed * 100) / 100,
        amount_tax: Math.round(amount_tax * 100) / 100,
        amount_total: Math.round(amount_total * 100) / 100,
    };
};
```

---

## 📊 Estimated Timeline

| Task | Hours | Status |
|------|-------|--------|
| Calculation Helper | 0.5 | Not Started |
| Quotation Form UI | 1.0 | Not Started |
| Sales Order Form UI | 1.0 | Not Started |
| Invoice Form UI | 1.0 | Not Started |
| State Transitions | 1.5 | Not Started |
| Testing | 1.0 | Not Started |
| **Total** | **6.0** | - |

**Estimated Duration:** 6-8 hours (depending on testing complexity)

---

## ✅ Success Criteria

- [x] ✅ Phase 2 Complete (Database + Basic Forms)
- [ ] Line items can be added to Quotation/Order/Invoice
- [ ] Line item amounts calculate automatically
- [ ] Header totals update automatically
- [ ] Quotation can be confirmed/sent
- [ ] Sales Order can be confirmed
- [ ] Invoice can be posted
- [ ] Complete O2C workflow works end-to-end
- [ ] All calculations are accurate
- [ ] State transitions update correctly

---

## 🚀 Ready to Start Phase 3?

یہ تیار ہے۔ میں شروع کرتا ہوں:

1. ✅ Calculation helper بنائیں
2. ✅ Quotation form میں line items شامل کریں
3. ✅ SalesOrder اور Invoice forms update کریں
4. ✅ State transition actions implement کریں
5. ✅ Complete testing کریں

**کام شروع کریں؟** Y/N

---

**Last Updated:** April 15, 2026  
**Phase Status:** Ready to Start
