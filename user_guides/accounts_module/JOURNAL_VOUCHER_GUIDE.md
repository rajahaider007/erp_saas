# 📊 Journal Voucher Management Guide

## 🎯 **Overview**
Complete guide for creating, editing, and managing journal vouchers in the ERP system with multi-currency support and floating currency calculator.

---

## 🚀 **Quick Start**

### **Access Journal Voucher:**
```
URL: /accounts/journal-voucher/create
Navigation: Accounts → Journal Voucher → Create
```

### **Basic Steps:**
1. **Fill Voucher Details** - Date, description, reference
2. **Select Currency** - Use floating calculator widget
3. **Add Entries** - Debit and credit entries
4. **Verify Balance** - Ensure debits = credits
5. **Save Voucher** - Submit for approval

---

## 💱 **Multi-Currency Features**

### **Enhanced Currency Support:**
- **Transaction Currency:** Any supported currency for voucher entries
- **Base Currency:** Company's default currency for reporting
- **Dual Display:** Both foreign and base currency amounts shown
- **Real-time Conversion:** Automatic calculation with live exchange rates
- **User Override:** Manual exchange rate entry when needed

### **Exchange Rate Management:**
- **Live API Integration:** Real-time rates from Frankfurter API
- **Manual Override:** Users can manually set exchange rates
- **Rate History:** Automatic tracking of rate changes
- **Source Tracking:** API vs manual rate identification

### **Floating Currency Calculator:**
- **Location:** Bottom-right corner floating button
- **Features:** Real-time conversion, company currency detection
- **Usage:** Click button → Select currencies → Get conversion

---

## 📝 **Step-by-Step Guide**

### **1. Voucher Header Information**

#### **Voucher Date:**
```
Field: Voucher Date
Type: Date picker
Default: Today's date
Required: Yes
```

#### **Voucher Number:**
```
Field: Voucher Number
Type: Text input
Auto-generated: If company setting enabled
Manual: If auto-generation disabled
Required: Yes (if manual)
```

#### **Description:**
```
Field: Description
Type: Text area
Purpose: Brief description of transaction
Required: Yes
```

#### **Reference Number:**
```
Field: Reference Number
Type: Text input
Purpose: External reference (invoice, receipt)
Required: No
```

### **2. Multi-Currency Selection**

#### **Currency Selection:**
```
Field: Currency
Options: All active currencies
Format: Symbol + Name + Code
Example: $ US Dollar (USD)
Auto-detection: Company's base currency
```

#### **Exchange Rate Management:**
```
Field: Exchange Rate
Type: Number input with API fetch button
Default: 1.0000 (for base currency)
Auto-fetch: Live rates from Frankfurter API
Manual Override: User can modify rates
Source Tracking: API vs Manual indicator
```

#### **Using Floating Calculator:**
```
1. Click floating calculator button (bottom-right)
2. Widget slides out smoothly
3. Company currency auto-selected
4. Select target currency
5. Enter amount
6. Get converted amount
7. Use in voucher
```

#### **Dual Currency Display:**
```
Transaction Amount: 1,000.00 EUR
Base Currency: 1,100.00 USD (at 1.10 rate)
Both amounts shown for transparency
```

### **3. Journal Entries**

#### **Adding Entries:**
```
1. Click "Add Entry" button
2. Select account from dropdown
3. Enter description
4. Enter debit amount (if debit entry)
5. Enter credit amount (if credit entry)
6. Repeat for all entries
```

#### **Account Selection:**
```
Field: Account
Type: Dropdown
Options: Chart of accounts
Filter: By account type
Search: By account name/code
```

#### **Entry Types:**
```
Debit Entry:
- Debit Amount: Enter amount
- Credit Amount: Leave empty

Credit Entry:
- Debit Amount: Leave empty  
- Credit Amount: Enter amount
```

### **4. Multi-Currency Balance Verification**

#### **Dual Currency Balance Check:**
```
System automatically:
- Calculates transaction currency totals
- Calculates base currency totals
- Shows both currency balances
- Highlights if either is unbalanced
```

#### **Transaction Currency Display:**
```
Transaction Currency (EUR):
Total Debits: € 1,000.00
Total Credits: € 1,000.00
Difference: € 0.00 ✅
Status: Balanced
```

#### **Base Currency Display:**
```
Base Currency (USD):
Total Debits: $ 1,100.00
Total Credits: $ 1,100.00
Difference: $ 0.00 ✅
Status: Balanced
```

#### **Unbalanced Voucher:**
```
Transaction Currency (EUR):
Total Debits: € 1,000.00
Total Credits: € 950.00
Difference: € 50.00 ❌
Status: Unbalanced - Cannot save
```

### **5. Saving Voucher**

#### **Save Options:**
```
Draft: Save as draft for later editing
Submit: Submit for approval
Approve: Approve immediately (if authorized)
```

#### **Validation Checks:**
```
✅ Voucher date is valid
✅ Description is provided
✅ At least 2 entries
✅ Debits = Credits
✅ All amounts are positive
✅ Accounts are selected
```

---

## 🎨 **User Interface Guide**

### **Header Section:**
```
┌─────────────────────────────────────┐
│ 📅 Voucher Date    📝 Description   │
│ 🔢 Voucher Number  📋 Reference     │
│ 💱 Currency       💰 Exchange Rate  │
└─────────────────────────────────────┘
```

### **Entries Section:**
```
┌─────────────────────────────────────┐
│ Account │ Description │ Debit │ Credit│
├─────────────────────────────────────┤
│ Cash    │ Received    │ 1000  │      │
│ Sales   │ Revenue     │       │ 1000 │
└─────────────────────────────────────┘
```

### **Summary Section:**
```
┌─────────────────────────────────────┐
│ Total Debits:  $ 1,000.00          │
│ Total Credits: $ 1,000.00          │
│ Difference:     $ 0.00 ✅          │
└─────────────────────────────────────┘
```

---

## 💡 **Pro Tips**

### **Currency Conversion:**
1. **Use Floating Calculator** - Real-time rates
2. **Check Exchange Rate** - Verify current rate
3. **Company Currency** - Default from session
4. **Multi-Currency** - Support for any currency

### **Entry Management:**
1. **Start with Cash/Bank** - Common first entry
2. **Balance Entries** - Ensure debits = credits
3. **Use Descriptions** - Clear transaction details
4. **Check Totals** - Verify before saving

### **Best Practices:**
1. **Review Before Save** - Check all entries
2. **Use Reference Numbers** - For tracking
3. **Clear Descriptions** - Explain transaction
4. **Verify Currency** - Correct currency selected

---

## 🔧 **Advanced Features**

### **Auto Voucher Numbering:**
```
Company Setting: Auto Voucher Numbering
Effect: Voucher numbers generated automatically
Format: JV-YYYY-MM-001, JV-YYYY-MM-002, etc.
Manual Override: Available if setting disabled
```

### **Multi-Currency Support:**
```
Transaction Currency: Any supported currency
Base Currency: Company's default currency
Dual Display: Both currencies shown simultaneously
Conversion: Automatic with live rates
Reporting: Multi-currency reports
```

### **International Accounting Standards (IAS) Compliance:**
```
IAS 21 - Foreign Exchange: Proper currency conversion
IAS 1 - Financial Statements: Clear currency disclosure
IAS 7 - Cash Flows: Multi-currency cash flow tracking
Double Entry: Maintained in both currencies
Rate Tracking: Historical exchange rate records
```

### **Exchange Rate Management:**
```
Live API Integration: Real-time rates from Frankfurter API
Manual Override: User can set custom rates
Rate History: Automatic tracking of changes
Source Attribution: API vs manual rate identification
Compliance: Meets IAS 21 requirements
```

---

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **"Voucher is Unbalanced"**
```
Problem: Debits ≠ Credits
Solution: 
1. Check all entry amounts
2. Verify debit/credit entries
3. Ensure all amounts are entered
4. Recalculate totals
```

#### **"Currency Not Available"**
```
Problem: Currency not in dropdown
Solution:
1. Check if currency is active
2. Contact admin to activate currency
3. Use floating calculator for conversion
```

#### **"Exchange Rate Error"**
```
Problem: Invalid exchange rate
Solution:
1. Click refresh button next to exchange rate
2. Use floating calculator for conversion
3. Check internet connection
4. Enter manual rate if API fails
5. Contact admin for historical rates
```

#### **"Multi-Currency Balance Issues"**
```
Problem: Base currency totals don't match
Solution:
1. Verify exchange rate is correct
2. Check both currency balances
3. Ensure all amounts are entered
4. Recalculate with current rate
5. Use floating calculator to verify
```

#### **"Currency Conversion Not Working"**
```
Problem: Amounts not converting to base currency
Solution:
1. Check exchange rate is set
2. Verify currency selection
3. Refresh exchange rate from API
4. Enter manual rate if needed
5. Contact admin if issue persists
```

#### **"Account Not Found"**
```
Problem: Account not in dropdown
Solution:
1. Check account is active
2. Verify account type
3. Contact admin to add account
4. Use search function
```

### **Error Messages:**

#### **Validation Errors:**
```
❌ "Voucher date is required"
✅ Solution: Select a valid date

❌ "Description is required"  
✅ Solution: Enter transaction description

❌ "At least 2 entries required"
✅ Solution: Add debit and credit entries

❌ "Debits must equal credits"
✅ Solution: Balance all entries
```

---

## 📊 **Reporting & Analytics**

### **Voucher Reports:**
```
Daily Vouchers: Today's transactions
Monthly Vouchers: Month-wise summary
Currency Reports: Multi-currency analysis
Account Reports: Account-wise transactions
```

### **Export Options:**
```
PDF Export: Printable voucher
Excel Export: Data analysis
CSV Export: Data import
Email: Send to stakeholders
```

---

## 🎯 **AI Training Scenarios**

### **Common User Queries:**

#### **Q: "How to create a journal voucher?"**
```
A: 1. Go to Accounts → Journal Voucher → Create
   2. Fill voucher details (date, description)
   3. Select currency using floating calculator
   4. Add debit and credit entries
   5. Verify balance (debits = credits)
   6. Save voucher
```

#### **Q: "Currency conversion not working?"**
```
A: 1. Check floating calculator widget
   2. Verify internet connection
   3. Try refreshing exchange rates
   4. Contact admin if issue persists
```

#### **Q: "Voucher is unbalanced?"**
```
A: 1. Check all entry amounts
   2. Ensure debits = credits
   3. Verify all amounts are entered
   4. Use calculator to verify totals
```

#### **Q: "How to use floating calculator?"**
```
A: 1. Click floating button (bottom-right)
   2. Widget slides out
   3. Company currency auto-selected
   4. Select target currency
   5. Enter amount
   6. Get converted amount
```

#### **Q: "How to create multi-currency journal voucher?"**
```
A: 1. Select foreign currency from dropdown
   2. System auto-fetches exchange rate
   3. Enter amounts in foreign currency
   4. Base currency amounts auto-calculated
   5. Verify both currency balances
   6. Save voucher
```

#### **Q: "Exchange rate not updating?"**
```
A: 1. Click refresh button next to rate field
   2. Check internet connection
   3. Try manual rate entry
   4. Use floating calculator
   5. Contact admin if API issues
```

#### **Q: "Base currency amounts wrong?"**
```
A: 1. Verify exchange rate is correct
   2. Check rate source (API vs manual)
   3. Recalculate with current rate
   4. Ensure all amounts entered
   5. Use floating calculator to verify
```

---

## 🚀 **Future Enhancements**

### **Planned Features:**
- ✅ **Bulk Voucher Creation** - Multiple vouchers at once
- ✅ **Voucher Templates** - Pre-defined voucher formats
- ✅ **Approval Workflow** - Multi-level approval process
- ✅ **Integration** - Bank statement import
- ✅ **Mobile App** - Mobile voucher creation

### **AI Bot Capabilities:**
- ✅ **Smart Suggestions** - Account recommendations
- ✅ **Auto-Balancing** - Suggest balancing entries
- ✅ **Currency Help** - Real-time conversion assistance
- ✅ **Error Prevention** - Proactive validation
- ✅ **Best Practices** - Accounting guidance

---

## 📞 **Support & Help**

### **Documentation:**
- **Quick Start Guide** - Basic voucher creation
- **Advanced Guide** - Complex scenarios
- **Troubleshooting** - Common issues
- **API Documentation** - Technical details

### **Training:**
- **Video Tutorials** - Step-by-step videos
- **Live Training** - Interactive sessions
- **User Manual** - Complete reference
- **FAQ** - Frequently asked questions

---

**This guide ensures users can effectively create and manage journal vouchers with full multi-currency support! 🚀**

---

**Last Updated:** December 19, 2024  
**Version:** 2.0.0  
**Status:** ✅ Production Ready with Multi-Currency Support
