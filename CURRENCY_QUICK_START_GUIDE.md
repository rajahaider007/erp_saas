# 🚀 Currency System - Quick Start Guide

## Bilkul Aasan Urdu/English Guide!

---

## 1️⃣ Currency Management Kaisay Karein

### Currency List Dekhna
```
URL: /system/currencies
```
- Saari currencies ka list dikhega
- Active/Inactive status
- Exchange rates
- Base currency display

### Naya Currency Add Karna
```
1. "Add Currency" button click karein
2. Details bharein:
   - Code: USD, EUR, PKR (3 letters)
   - Name: United States Dollar
   - Symbol: $, €, ₨
   - Country: United States
   - Exchange Rate: 1.0000
   - Active status: ON/OFF
3. "Add Currency" click karein
```

---

## 2️⃣ Exchange Rates Auto Update (FREE!)

### Manual Update (Web Say)
```
1. /system/currencies par jaayen
2. "Update Rates from API" button click karein
3. Confirm karein
4. Done! Saari rates update ho gayi
```

### Command Line Say Update
```bash
# Simple update
php artisan currency:update-rates

# Force update (cache bypass)
php artisan currency:update-rates --force

# Specific provider
php artisan currency:update-rates --provider=frankfurter
```

### Automatic Daily Updates
System automatically har raat 12 baje rates update kar dega!

---

## 3️⃣ Currency Converter Kaisay Use Karein

```
URL: /system/currencies/converter

Steps:
1. Amount enter karein (e.g., 100)
2. FROM currency select karein (e.g., USD)
3. TO currency select karein (e.g., PKR)
4. "Convert Currency" click karein
5. Result mil jayega with exchange rate!
```

**Example:**
```
100 USD = 28,000 PKR
Exchange Rate: 1 USD = 280 PKR
```

---

## 4️⃣ Currency History Dekhna

```
1. /system/currencies par jaayen
2. Kisi bhi currency kay samnay clock icon click karein
3. Poori history dikh jayegi:
   - Kab rate change hui
   - Previous rate kya thi
   - Kitna % change hua
   - Source (API / Manual)
```

**Time Periods:**
- 7 Days
- 30 Days  
- 90 Days
- 180 Days
- 365 Days

---

## 5️⃣ Code Main Currency Kaisay Use Karein

### PHP Main (Backend)
```php
use App\Helpers\CurrencyHelper;

// Amount format karna
$formatted = CurrencyHelper::format(1000, 'USD');
// Output: $ 1,000.00

// Currency convert karna
$result = CurrencyHelper::convert(100, 'USD', 'PKR');
// Output: ['from_amount' => 100, 'to_amount' => 28000]

// Symbol nikalna
$symbol = CurrencyHelper::getSymbol('PKR');
// Output: ₨

// Exchange rate nikalna
$rate = CurrencyHelper::getExchangeRate('USD', 'PKR');
// Output: 280.0000
```

### React/JSX Main (Frontend)
```jsx
import { usePage } from '@inertiajs/react';

const MyComponent = () => {
  const { currencies } = usePage().props;
  
  return (
    <select>
      {currencies.map(currency => (
        <option key={currency.value} value={currency.value}>
          {currency.symbol} {currency.label}
        </option>
      ))}
    </select>
  );
};
```

---

## 6️⃣ Multi-Currency Report Banana

```jsx
import MultiCurrencyReport from '@/Components/MultiCurrencyReport';

const MyReport = () => {
  const data = [
    { description: 'Sales', amount: 10000, currency: 'USD' },
    { description: 'Expenses', amount: 500000, currency: 'PKR' },
  ];

  return (
    <MultiCurrencyReport
      title="Monthly Report"
      data={data}
      baseCurrency="USD"
      showConversion={true}
      allowExport={true}
    />
  );
};
```

---

## 7️⃣ Important Routes

| Purpose | URL | Method |
|---------|-----|--------|
| Currency List | `/system/currencies` | GET |
| Add Currency | `/system/currencies/create` | GET |
| Currency Converter | `/system/currencies/converter` | GET |
| Currency History | `/system/currencies/{id}/history` | GET |
| Update from API | `/system/currencies/update-from-api` | POST |
| Convert API | `/system/currencies/convert` | POST |

---

## 8️⃣ Troubleshooting (Agar Masla Ho)

### Problem: Currencies dropdown main nahi aa rahi
**Solution:**
```bash
php artisan cache:clear
```

### Problem: Exchange rates update nahi ho rahi
**Solution:**
```bash
# Force update try karein
php artisan currency:update-rates --force

# Logs check karein
cat storage/logs/currency-updates.log
```

### Problem: Conversion kaam nahi kar raha
**Solution:**
1. Check karein currency active hai?
2. Exchange rate set hai?
3. Base currency configured hai?

---

## 9️⃣ Daily Automatic Updates Setup

### Windows Par (Task Scheduler)
```
1. Task Scheduler open karein
2. Create Basic Task
3. Name: "Currency Rate Updates"
4. Trigger: Daily at 12:00 AM
5. Action: Start a program
   - Program: php
   - Arguments: artisan schedule:run
   - Start in: A:\Development\Laravel\erp_saas
6. Finish!
```

### Linux Par (Crontab)
```bash
# Crontab edit karein
crontab -e

# Ye line add karein
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

---

## 🎯 Key Features Summary

✅ **100+ Currencies** - Duniya bhar ki currencies
✅ **Auto Updates** - Free API say automatic updates
✅ **Currency Converter** - Easy conversion tool
✅ **History Tracking** - Complete rate history
✅ **Multi-Currency Reports** - Professional reports
✅ **Developer Friendly** - Easy to use in code
✅ **Mobile Responsive** - Har device par kaam karta hai
✅ **Dark Mode Support** - Theme kay saath compatible

---

## 💡 Pro Tips

1. **Base Currency** = Jo currency aapki main hai (e.g., USD ya PKR)
2. **Exchange Rates** = Automatically update hoti hain FREE API say
3. **History** = Har rate change ka record saved rehta hai
4. **Converter** = Instant conversions with live rates
5. **Reports** = Multi-currency data ko easily handle kar saktay hain

---

## 📞 Need Help?

1. Documentation dekheın: `CURRENCY_SYSTEM_DOCUMENTATION.md`
2. Logs check karein: `storage/logs/`
3. Test karein: `php artisan currency:update-rates`

---

## 🎉 Testing Commands

```bash
# Currency update test
php artisan currency:update-rates

# Database check
php artisan tinker
>>> Currency::count()
>>> Currency::base()->first()

# Cache clear
php artisan cache:clear
php artisan config:clear
```

---

**Happy Coding! 🚀**

System fully ready hai! Bas use karna shuru karein! 💪

