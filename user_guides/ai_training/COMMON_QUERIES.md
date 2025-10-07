# ❓ Common User Queries - AI Training

## 🎯 **Purpose**
Frequently asked questions and their answers for AI bot training. This ensures consistent, accurate responses to common user queries.

---

## 💱 **Currency System Queries**

### **Q: "How to add a new currency?"**
```
A: To add a new currency:
1. Go to System → Currencies → Add Currency
2. Fill currency details:
   - Code: 3-letter code (e.g., USD, EUR, GBP)
   - Name: Full currency name (US Dollar, Euro, British Pound)
   - Symbol: Currency symbol ($, €, £)
   - Country: Country name
   - Exchange Rate: Rate to base currency
3. Set active status
4. Save currency

Note: Exchange rate will be updated automatically from APIs.
```

### **Q: "How to update exchange rates?"**
```
A: There are several ways to update exchange rates:

Method 1 - Web Interface:
1. Go to System → Currencies
2. Click "Update Rates from API" button
3. Confirm the action
4. Wait for completion

Method 2 - Command Line:
php artisan currency:update-rates
php artisan currency:update-rates --force

Method 3 - Automatic:
Rates update automatically daily at midnight.
```

### **Q: "Currency converter not working?"**
```
A: If currency converter is not working:

1. Check floating calculator widget:
   - Look for calculator button (bottom-right corner)
   - Click to open widget
   - Verify company currency is selected

2. Check internet connection:
   - API requires internet for live rates
   - Try refreshing the page

3. Check currency status:
   - Ensure currencies are active
   - Go to System → Currencies
   - Activate required currencies

4. Contact admin if issue persists.
```

### **Q: "How to set base currency?"**
```
A: To set base currency:
1. Go to System → Currencies
2. Find the currency you want as base
3. Click "Set as Base" button
4. Confirm the action
5. All other currencies will be calculated relative to this base

Note: Only one currency can be base currency at a time.
```

### **Q: "Exchange rates seem wrong?"**
```
A: If exchange rates seem incorrect:

1. Check rate source:
   - Go to System → Currencies → History
   - View rate change history
   - Check rate source (API/manual)

2. Update rates:
   - Click "Update Rates from API"
   - Or run: php artisan currency:update-rates

3. Verify with external sources:
   - Check rates on financial websites
   - Compare with other sources

4. Contact admin for manual rate update if needed.
```

---

## 📊 **Accounts Module Queries**

### **Q: "How to create a journal voucher?"**
```
A: To create a journal voucher:
1. Go to Accounts → Journal Voucher → Create
2. Fill voucher details:
   - Date: Select transaction date
   - Description: Enter transaction description
   - Reference: Optional reference number
3. Select currency (use floating calculator if needed)
4. Add journal entries:
   - Select account from dropdown
   - Enter description
   - Enter debit amount (if debit entry)
   - Enter credit amount (if credit entry)
5. Verify balance (debits = credits)
6. Save voucher

Tip: Use floating calculator for currency conversion.
```

### **Q: "Journal voucher is unbalanced?"**
```
A: If voucher is unbalanced:

1. Check all entry amounts:
   - Ensure all amounts are entered
   - Verify debit and credit entries
   - Check for missing entries

2. Balance the voucher:
   - Total debits must equal total credits
   - Add missing entries if needed
   - Use calculator to verify totals

3. Common mistakes:
   - Missing debit or credit entry
   - Wrong amount entered
   - Account not selected

4. Save only when balanced.
```

### **Q: "How to use floating calculator in journal voucher?"**
```
A: To use floating calculator:
1. Look for floating calculator button (bottom-right corner)
2. Click button to open widget
3. Company currency is auto-selected
4. Select target currency from dropdown
5. Enter amount to convert
6. Get converted amount and exchange rate
7. Use converted amount in voucher entries
8. Close widget when done

Note: Calculator provides real-time exchange rates.
```

### **Q: "Account not found in dropdown?"**
```
A: If account is not in dropdown:

1. Check account status:
   - Go to Chart of Accounts
   - Ensure account is active
   - Check account type

2. Search for account:
   - Use search function in dropdown
   - Try partial name search
   - Check account code

3. Contact admin:
   - Request account activation
   - Ask to add new account
   - Verify permissions

4. Check account type:
   - Ensure correct account type
   - Verify account category
```

### **Q: "How to edit a journal voucher?"**
```
A: To edit a journal voucher:
1. Go to Accounts → Journal Voucher → List
2. Find the voucher to edit
3. Click "Edit" button
4. Make necessary changes:
   - Update voucher details
   - Modify entries
   - Change amounts
5. Verify balance (debits = credits)
6. Save changes

Note: Some vouchers may be locked if already approved.
```

---

## ⚙️ **System Management Queries**

### **Q: "How to create a new company?"**
```
A: To create a new company:
1. Go to System → Companies → Add Company
2. Fill company details:
   - Company Name: Full company name
   - Company Code: Unique identifier
   - Email: Company email address
   - Address: Complete address
   - Currency: Default currency
3. Set company status (active/inactive)
4. Save company
5. Create admin user for company
6. Set up locations and departments

Note: Each company has its own data and settings.
```

### **Q: "How to add a new user?"**
```
A: To add a new user:
1. Go to System → Users → Add User
2. Fill user details:
   - Personal Information: Name, email, phone
   - Login Details: Username, password
   - Company: Select company
   - Location: Select location
   - Department: Select department
   - Role: Assign appropriate role
3. Set user permissions
4. Save user
5. Send login credentials to user

Note: User must be assigned to a company and location.
```

### **Q: "How to set up locations and departments?"**
```
A: To set up organizational structure:

Locations:
1. Go to System → Locations → Add Location
2. Enter location details:
   - Location Name: Full location name
   - Address: Complete address
   - Company: Select company
3. Save location

Departments:
1. Go to System → Departments → Add Department
2. Enter department details:
   - Department Name: Full department name
   - Location: Select location
   - Manager: Assign manager (optional)
3. Save department

Note: Departments must be assigned to locations.
```

### **Q: "User cannot login?"**
```
A: If user cannot login:

1. Check login credentials:
   - Verify username and password
   - Check for typos
   - Try password reset

2. Check user status:
   - Ensure user is active
   - Check company assignment
   - Verify location assignment

3. Check permissions:
   - Verify user has access
   - Check role assignments
   - Contact admin for permission issues

4. Contact admin:
   - Request account activation
   - Reset password
   - Check system issues
```

### **Q: "How to change user permissions?"**
```
A: To change user permissions:
1. Go to System → Users
2. Find the user
3. Click "Edit" button
4. Go to "Permissions" tab
5. Select/deselect permissions:
   - System access
   - Module access
   - Feature access
6. Save changes
7. User will need to log out and back in

Note: Only admin users can change permissions.
```

---

## 🚨 **Troubleshooting Queries**

### **Q: "System is slow?"**
```
A: If system is running slow:

1. Check internet connection:
   - Ensure stable connection
   - Check for network issues
   - Try refreshing page

2. Clear browser cache:
   - Clear browser cache
   - Try incognito mode
   - Restart browser

3. Check system resources:
   - Close unnecessary tabs
   - Check available memory
   - Restart browser

4. Contact admin:
   - Report performance issues
   - Check server status
   - Request system optimization
```

### **Q: "Data not saving?"**
```
A: If data is not saving:

1. Check required fields:
   - Ensure all required fields are filled
   - Check for validation errors
   - Verify data format

2. Check permissions:
   - Verify user has save permission
   - Check company assignment
   - Contact admin for permission issues

3. Check system status:
   - Try refreshing page
   - Check for error messages
   - Contact admin if issue persists

4. Try alternative:
   - Save as draft
   - Try different browser
   - Contact admin for assistance
```

### **Q: "Error messages appearing?"**
```
A: If error messages appear:

1. Read error message:
   - Note the exact error
   - Check error details
   - Look for solution hints

2. Common solutions:
   - Refresh page
   - Check internet connection
   - Verify data format
   - Contact admin

3. Document error:
   - Screenshot error message
   - Note steps to reproduce
   - Contact admin with details

4. Try workaround:
   - Use alternative method
   - Try different browser
   - Contact admin for help
```

### **Q: "Feature not working?"**
```
A: If a feature is not working:

1. Check feature status:
   - Verify feature is enabled
   - Check user permissions
   - Contact admin for activation

2. Check system requirements:
   - Verify browser compatibility
   - Check internet connection
   - Try refreshing page

3. Contact admin:
   - Report feature issue
   - Provide error details
   - Request feature activation

4. Try alternative:
   - Use different method
   - Try different browser
   - Contact admin for assistance
```

---

## 💡 **Best Practices Queries**

### **Q: "What are best practices for currency management?"**
```
A: Best practices for currency management:

1. Set base currency first:
   - Choose company's primary currency
   - Set as base currency
   - All other currencies relative to base

2. Keep exchange rates updated:
   - Update rates daily
   - Use automatic updates
   - Verify rates with external sources

3. Use floating calculator:
   - Real-time conversion
   - Accurate rates
   - Easy to use

4. Monitor rate changes:
   - Check rate history
   - Track rate trends
   - Make informed decisions

5. Backup currency data:
   - Regular backups
   - Export currency data
   - Keep historical records
```

### **Q: "What are best practices for journal vouchers?"**
```
A: Best practices for journal vouchers:

1. Always balance entries:
   - Debits must equal credits
   - Verify totals before saving
   - Use calculator for verification

2. Use clear descriptions:
   - Explain transaction purpose
   - Include reference numbers
   - Make descriptions searchable

3. Verify currency and amounts:
   - Check currency selection
   - Verify exchange rates
   - Use floating calculator

4. Review before saving:
   - Check all entries
   - Verify account selection
   - Confirm amounts

5. Use reference numbers:
   - Link to external documents
   - Track transaction sources
   - Maintain audit trail
```

### **Q: "What are best practices for user management?"**
```
A: Best practices for user management:

1. Assign appropriate roles:
   - Match role to job function
   - Limit unnecessary permissions
   - Regular permission reviews

2. Set strong passwords:
   - Use complex passwords
   - Regular password changes
   - Password policy enforcement

3. Monitor user activity:
   - Track user actions
   - Review access logs
   - Identify unusual activity

4. Regular maintenance:
   - Deactivate unused accounts
   - Update user information
   - Review permissions

5. Security measures:
   - Regular security updates
   - Monitor access attempts
   - Implement security policies
```

---

## 🎯 **Advanced Queries**

### **Q: "How to set up multi-currency reporting?"**
```
A: To set up multi-currency reporting:

1. Configure currencies:
   - Add required currencies
   - Set exchange rates
   - Activate currencies

2. Set up reporting:
   - Configure report settings
   - Select base currency
   - Set conversion options

3. Generate reports:
   - Select report type
   - Choose currencies
   - Set date range

4. Export options:
   - PDF export
   - Excel export
   - CSV export

Note: Reports will show amounts in selected currencies.
```

### **Q: "How to integrate with external systems?"**
```
A: To integrate with external systems:

1. API integration:
   - Use system APIs
   - Configure endpoints
   - Set authentication

2. Data import/export:
   - CSV import/export
   - Excel integration
   - Database connections

3. Webhook integration:
   - Configure webhooks
   - Set up endpoints
   - Test integration

4. Contact admin:
   - Request integration setup
   - Provide system details
   - Coordinate implementation

Note: Advanced integration requires technical expertise.
```

---

## 📞 **Support Queries**

### **Q: "How to contact support?"**
```
A: To contact support:

1. Check documentation:
   - User guides
   - FAQ section
   - Troubleshooting guides

2. Contact admin:
   - System administrator
   - Technical support
   - User support

3. Report issues:
   - Document problem
   - Provide error details
   - Include screenshots

4. Request features:
   - Submit feature requests
   - Provide use cases
   - Coordinate with admin

Note: Support availability depends on company setup.
```

### **Q: "How to request new features?"**
```
A: To request new features:

1. Document requirement:
   - Describe feature need
   - Provide use cases
   - Explain benefits

2. Contact admin:
   - Submit feature request
   - Provide details
   - Coordinate implementation

3. Follow up:
   - Check request status
   - Provide additional info
   - Test new features

4. Feedback:
   - Test new features
   - Provide feedback
   - Suggest improvements

Note: Feature requests are evaluated based on priority and feasibility.
```

---

**This comprehensive query database ensures the AI bot can handle all common user questions with accurate, helpful responses! 🚀**

---

**Last Updated:** October 7, 2025  
**Version:** 1.0.0  
**Status:** ✅ Training Ready
