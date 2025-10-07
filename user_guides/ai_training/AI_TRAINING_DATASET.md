# 🤖 AI Training Dataset - ERP SaaS System

## 🎯 **Purpose**
Complete training dataset for AI bot to provide accurate assistance with ERP SaaS system features, troubleshooting, and user guidance.

---

## 📊 **Training Data Structure**

### **1. System Overview**
### **2. Feature Explanations**
### **3. User Scenarios**
### **4. Troubleshooting**
### **5. Common Queries**
### **6. Best Practices**

---

## 🏢 **System Overview**

### **ERP SaaS System Features:**
```
✅ Multi-Company Support
✅ User Management & Roles
✅ Currency Management (100+ currencies)
✅ Accounting Module (Journal Vouchers, Chart of Accounts)
✅ Floating Currency Calculator Widget
✅ Real-time Exchange Rates
✅ Multi-Currency Reporting
✅ System Administration
✅ Location & Department Management
```

### **Technology Stack:**
```
Backend: Laravel 12.x
Frontend: React + Inertia.js
Database: MySQL
Styling: Tailwind CSS
APIs: External currency APIs
```

---

## 💱 **Currency System Training Data**

### **Q: "How to add a new currency?"**
```
A: 1. Go to System → Currencies → Add Currency
   2. Fill currency details:
      - Code: 3-letter code (e.g., USD, EUR)
      - Name: Full currency name
      - Symbol: Currency symbol ($, €, £)
      - Country: Country name
      - Exchange Rate: Rate to base currency
   3. Set active status
   4. Save currency
```

### **Q: "How to update exchange rates?"**
```
A: Method 1 - Web Interface:
   1. Go to System → Currencies
   2. Click "Update Rates from API"
   3. Confirm action
   4. Wait for completion

Method 2 - Command Line:
   php artisan currency:update-rates
   php artisan currency:update-rates --force
```

### **Q: "How to use currency converter?"**
```
A: 1. Go to System → Currencies → Converter
   2. Enter amount to convert
   3. Select FROM currency
   4. Select TO currency
   5. Click "Convert Currency"
   6. View converted amount and exchange rate
```

### **Q: "Floating currency calculator not working?"**
```
A: Troubleshooting steps:
   1. Check if widget is visible (bottom-right corner)
   2. Click floating button to open widget
   3. Verify company currency is set
   4. Check internet connection for API rates
   5. Try refreshing the page
   6. Contact admin if issue persists
```

---

## 📊 **Accounts Module Training Data**

### **Q: "How to create a journal voucher?"**
```
A: 1. Go to Accounts → Journal Voucher → Create
   2. Fill voucher details:
      - Date: Select transaction date
      - Description: Enter transaction description
      - Reference: Optional reference number
   3. Select currency (use floating calculator if needed)
   4. Add journal entries:
      - Select account
      - Enter description
      - Enter debit amount (if debit entry)
      - Enter credit amount (if credit entry)
   5. Verify balance (debits = credits)
   6. Save voucher
```

### **Q: "Journal voucher is unbalanced?"**
```
A: Solution steps:
   1. Check all entry amounts are entered
   2. Ensure debits equal credits
   3. Verify all accounts are selected
   4. Use calculator to verify totals
   5. Add missing entries if needed
   6. Recalculate and save
```

### **Q: "How to use floating calculator in journal voucher?"**
```
A: 1. Look for floating calculator button (bottom-right)
   2. Click button to open widget
   3. Company currency auto-selected
   4. Select target currency
   5. Enter amount to convert
   6. Get converted amount
   7. Use amount in voucher entries
```

---

## ⚙️ **System Management Training Data**

### **Q: "How to create a new company?"**
```
A: 1. Go to System → Companies → Add Company
   2. Fill company details:
      - Company Name: Full company name
      - Company Code: Unique identifier
      - Email: Company email
      - Address: Complete address
      - Currency: Default currency
   3. Set company status
   4. Save company
```

### **Q: "How to add a new user?"**
```
A: 1. Go to System → Users → Add User
   2. Fill user details:
      - Personal Information: Name, email, phone
      - Login Details: Username, password
      - Company: Select company
      - Location: Select location
      - Department: Select department
      - Role: Assign role
   3. Set user permissions
   4. Save user
```

### **Q: "How to set up locations and departments?"**
```
A: Locations:
   1. Go to System → Locations → Add Location
   2. Enter location details
   3. Assign to company
   4. Save location

Departments:
   1. Go to System → Departments → Add Department
   2. Enter department details
   3. Assign to location
   4. Save department
```

---

## 🚨 **Troubleshooting Training Data**

### **Common Issues & Solutions:**

#### **"Currency dropdown is empty"**
```
Problem: No currencies in dropdown
Solution:
1. Check if currencies are active
2. Go to System → Currencies
3. Activate required currencies
4. Clear cache: php artisan cache:clear
5. Refresh page
```

#### **"Exchange rates not updating"**
```
Problem: Rates not updating from API
Solution:
1. Check internet connection
2. Try force update: php artisan currency:update-rates --force
3. Check API provider status
4. Contact admin for manual rates
```

#### **"Floating calculator not visible"**
```
Problem: Calculator button not showing
Solution:
1. Check if on accounts page
2. Scroll to bottom-right corner
3. Look for calculator icon
4. Refresh page if needed
5. Check browser console for errors
```

#### **"Journal voucher not saving"**
```
Problem: Cannot save voucher
Solution:
1. Check if voucher is balanced (debits = credits)
2. Verify all required fields are filled
3. Check if user has permission
4. Try refreshing page
5. Contact admin if issue persists
```

#### **"User cannot login"**
```
Problem: Login issues
Solution:
1. Check username and password
2. Verify user is active
3. Check company assignment
4. Reset password if needed
5. Contact admin for account issues
```

---

## 💡 **Best Practices Training Data**

### **Currency Management:**
```
✅ Set base currency first
✅ Keep exchange rates updated
✅ Use floating calculator for conversions
✅ Check rate history for trends
✅ Backup currency data regularly
```

### **Journal Voucher Creation:**
```
✅ Always balance debits and credits
✅ Use clear descriptions
✅ Verify currency and amounts
✅ Use reference numbers for tracking
✅ Review before saving
```

### **User Management:**
```
✅ Assign appropriate roles
✅ Set strong passwords
✅ Regular permission reviews
✅ Deactivate unused accounts
✅ Monitor user activity
```

### **System Administration:**
```
✅ Regular backups
✅ Monitor system performance
✅ Update exchange rates daily
✅ Review user permissions
✅ Keep documentation updated
```

---

## 🎯 **User Scenario Training Data**

### **Scenario 1: New Company Setup**
```
User: "I need to set up a new company in the system"
AI Response:
1. Go to System → Companies → Add Company
2. Fill required company information
3. Set default currency
4. Create admin user for company
5. Set up locations and departments
6. Configure company settings
```

### **Scenario 2: Multi-Currency Transaction**
```
User: "I need to create a journal voucher in different currency"
AI Response:
1. Use floating calculator to convert amounts
2. Select appropriate currency
3. Enter converted amounts in voucher
4. Verify exchange rate is correct
5. Save voucher with currency details
```

### **Scenario 3: Exchange Rate Update**
```
User: "Exchange rates seem outdated"
AI Response:
1. Go to System → Currencies
2. Click "Update Rates from API"
3. Or run command: php artisan currency:update-rates
4. Check updated rates
5. Verify with external sources
```

### **Scenario 4: User Permission Issue**
```
User: "I cannot access certain features"
AI Response:
1. Check user role and permissions
2. Verify company assignment
3. Contact admin to update permissions
4. Check if feature is enabled for company
5. Try logging out and back in
```

---

## 🔧 **Technical Training Data**

### **Database Queries:**
```
Get active currencies:
SELECT * FROM currencies WHERE is_active = 1

Get company currency:
SELECT currency FROM companies WHERE id = ?

Get exchange rate:
SELECT exchange_rate FROM currencies WHERE code = ?
```

### **API Endpoints:**
```
Currency conversion:
POST /system/currencies/convert
Body: {amount, from, to}

Update exchange rates:
POST /system/currencies/update-from-api

Get active currencies:
GET /system/currencies/api/active
```

### **File Locations:**
```
Currency Model: app/Models/Currency.php
Currency Controller: app/Http/Controllers/system/CurrencyController.php
Floating Widget: resources/js/Components/FloatingCurrencyWidget.jsx
Journal Voucher: resources/js/Pages/Accounts/JournalVoucher/Create.jsx
```

---

## 📚 **Documentation References**

### **User Guides:**
```
Currency System: user_guides/currency_system/
Accounts Module: user_guides/accounts_module/
System Management: user_guides/system_management/
AI Training: user_guides/ai_training/
```

### **Quick References:**
```
Currency Codes: USD, EUR, GBP, PKR, INR, etc.
Exchange Rate APIs: Frankfurter, ExchangeRate-API
Commands: php artisan currency:update-rates
Widget: Floating calculator (bottom-right)
```

---

## 🎯 **AI Response Templates**

### **Greeting & Introduction:**
```
"Hello! I'm your ERP system assistant. I can help you with:
- Currency management and conversion
- Journal voucher creation
- System administration
- Troubleshooting issues
- Feature explanations

What would you like to know?"
```

### **Feature Explanation:**
```
"The [Feature Name] allows you to [Purpose]. Here's how to use it:

1. [Step 1]
2. [Step 2]
3. [Step 3]

Benefits:
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

Need more help? Just ask!"
```

### **Troubleshooting Response:**
```
"I understand you're having trouble with [Issue]. Let's solve this step by step:

1. [First step to try]
2. [Second step to try]
3. [Third step to try]

If this doesn't work, try:
- [Alternative solution]
- [Contact admin]
- [Check documentation]

Is this helpful?"
```

---

## 🚀 **Training Completion Checklist**

### **Currency System:**
- ✅ Add/edit/delete currencies
- ✅ Update exchange rates
- ✅ Use currency converter
- ✅ Floating calculator widget
- ✅ Multi-currency support
- ✅ Troubleshooting

### **Accounts Module:**
- ✅ Create journal vouchers
- ✅ Balance entries
- ✅ Currency selection
- ✅ Account management
- ✅ Reporting
- ✅ Troubleshooting

### **System Management:**
- ✅ Company setup
- ✅ User management
- ✅ Location/department setup
- ✅ Permissions
- ✅ System configuration
- ✅ Troubleshooting

---

**This comprehensive training dataset ensures the AI bot can provide accurate, helpful assistance for all ERP system features! 🚀**

---

**Last Updated:** October 7, 2025  
**Version:** 1.0.0  
**Status:** ✅ Training Ready
