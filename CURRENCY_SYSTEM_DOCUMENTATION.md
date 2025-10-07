# 💱 Advanced Multi-Currency System Documentation

## Overview
A comprehensive, enterprise-grade multi-currency management system with automatic exchange rate updates, currency conversion, historical tracking, and multi-currency reporting capabilities.

---

## 🌟 Features Implemented

### 1. **Dynamic Currency Management** ✅
- 100+ pre-loaded currencies from around the world
- Complete CRUD operations (Create, Read, Update, Delete)
- Active/Inactive status management
- Base currency configuration
- Sort ordering for display preferences

### 2. **Automatic Exchange Rate Updates** ✅
- Integration with free external APIs:
  - **Frankfurter API** (European Central Bank data)
  - **ExchangeRate-API** (Alternative provider)
- Manual and automatic update capabilities
- Scheduled daily updates at midnight
- Force update option to bypass cache
- Detailed logging of all updates

### 3. **Exchange Rate History Tracking** ✅
- Complete history of all rate changes
- Track previous rates and percentage changes
- Source tracking (manual, API, system)
- API provider information
- Effective date recording
- Visual history viewer with charts

### 4. **Currency Converter Calculator** ✅
- Real-time currency conversion
- Interactive, user-friendly interface
- Bi-directional conversion support
- Exchange rate display
- Swap currencies functionality
- Mobile-responsive design

### 5. **Multi-Currency Reporting** ✅
- Display financial data in multiple currencies
- Automatic currency conversion
- Export to CSV functionality
- Real-time exchange rate application
- Total calculations in selected currency

### 6. **Currency Helper Functions** ✅
- Format amounts with currency symbols
- Convert between any currency pairs
- Get exchange rates programmatically
- Calculate totals across multiple currencies
- Base currency conversions

---

## 📁 File Structure

```
app/
├── Console/Commands/
│   └── UpdateExchangeRates.php          # Artisan command for updating rates
├── Models/
│   ├── Currency.php                     # Currency model
│   └── CurrencyExchangeRateHistory.php  # Rate history model
├── Services/
│   └── ExchangeRateService.php          # Exchange rate business logic
├── Helpers/
│   └── CurrencyHelper.php               # Currency utility functions
└── Http/Controllers/system/
    └── CurrencyController.php           # Currency management endpoints

database/
└── migrations/
    ├── 2025_10_05_174754_create_currencies_table.php
    └── 2025_10_07_024709_create_currency_exchange_rate_history_table.php

database/seeders/
└── CurrencySeeder.php                    # Seeds 100+ currencies

resources/js/
├── Pages/system/Currencies/
│   ├── Index.jsx                         # Currency list page
│   ├── Create.jsx                        # Add/Edit currency
│   ├── Converter.jsx                     # Currency converter
│   └── History.jsx                       # Rate history viewer
└── Components/
    └── MultiCurrencyReport.jsx           # Multi-currency report component

routes/
├── web.php                               # Currency routes
└── console.php                           # Scheduled tasks
```

---

## 🚀 Usage Guide

### Basic Operations

#### 1. Access Currency Management
Navigate to: `/system/currencies`

#### 2. Add New Currency
```
1. Click "Add Currency" button
2. Fill in currency details:
   - Code (3 letters, e.g., USD)
   - Name (Full currency name)
   - Symbol ($, €, £, etc.)
   - Country
   - Exchange Rate
   - Active Status
   - Base Currency (optional)
3. Click "Add Currency"
```

#### 3. Update Exchange Rates from API
**Via Web Interface:**
```
1. Go to /system/currencies
2. Click "Update Rates from API" button
3. Confirm the action
```

**Via Command Line:**
```bash
# Update with default provider (Frankfurter)
php artisan currency:update-rates

# Update with specific provider
php artisan currency:update-rates --provider=frankfurter

# Force update (bypass cache)
php artisan currency:update-rates --force
```

#### 4. Use Currency Converter
Navigate to: `/system/currencies/converter`
```
1. Enter amount
2. Select FROM currency
3. Select TO currency
4. Click "Convert Currency"
```

#### 5. View Currency History
```
1. Go to /system/currencies
2. Click the history icon (clock) for any currency
3. View detailed rate change history
4. Select different time periods (7D, 30D, 90D, 180D, 365D)
```

---

## 💻 Developer Guide

### Using Currency Helper Functions

```php
use App\Helpers\CurrencyHelper;

// Format amount with currency symbol
$formatted = CurrencyHelper::format(1000, 'USD', true);
// Output: $ 1,000.00 USD

// Convert between currencies
$result = CurrencyHelper::convert(100, 'USD', 'EUR');
// Returns: ['from_amount' => 100, 'to_amount' => 85.00, ...]

// Get currency symbol
$symbol = CurrencyHelper::getSymbol('EUR');
// Output: €

// Get exchange rate between two currencies
$rate = CurrencyHelper::getExchangeRate('USD', 'EUR');
// Output: 0.8500

// Calculate total in base currency from multiple currencies
$total = CurrencyHelper::calculateTotalInBase([
    'USD' => 100,
    'EUR' => 50,
    'GBP' => 75
]);
```

### Using Exchange Rate Service

```php
use App\Services\ExchangeRateService;

$service = new ExchangeRateService();

// Update all currency rates
$result = $service->updateAllCurrencyRates('frankfurter', false);

// Get currency history
$history = $service->getCurrencyHistory($currencyId, 30);

// Convert currency
$result = $service->convert(100, 'USD', 'EUR');
```

### Using in Blade/Inertia

```jsx
import { usePage } from '@inertiajs/react';

const YourComponent = () => {
  const { currencies } = usePage().props;
  
  // Currencies are automatically available globally
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

### Multi-Currency Report Component

```jsx
import MultiCurrencyReport from '@/Components/MultiCurrencyReport';

const YourReportPage = () => {
  const data = [
    { description: 'Sales Revenue', amount: 10000, currency: 'USD' },
    { description: 'Expenses', amount: 5000, currency: 'EUR' },
    { description: 'Profit', amount: 3000, currency: 'GBP' }
  ];

  return (
    <MultiCurrencyReport
      title="Financial Summary"
      data={data}
      baseCurrency="USD"
      showConversion={true}
      allowExport={true}
    />
  );
};
```

---

## ⚙️ Configuration

### Automatic Updates Schedule

Edit `routes/console.php` to customize the schedule:

```php
// Daily at midnight
Schedule::command('currency:update-rates')
    ->daily()
    ->at('00:00')
    ->withoutOverlapping();

// Every 6 hours
Schedule::command('currency:update-rates')
    ->everySixHours()
    ->withoutOverlapping();

// Weekdays at 9 AM
Schedule::command('currency:update-rates')
    ->weekdays()
    ->at('09:00')
    ->withoutOverlapping();
```

### Activating the Scheduler

Add to your system's crontab:
```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

Or on Windows Task Scheduler:
```bash
Program: php
Arguments: artisan schedule:run
Start in: A:\Development\Laravel\erp_saas
Trigger: Every 1 minute
```

---

## 🔌 API Endpoints

### Currency Management
```
GET    /system/currencies                  - List all currencies
GET    /system/currencies/create           - Show create form
POST   /system/currencies                  - Store new currency
GET    /system/currencies/{id}/edit        - Show edit form
PUT    /system/currencies/{id}             - Update currency
DELETE /system/currencies/{id}             - Delete currency
```

### Special Operations
```
POST   /system/currencies/{id}/toggle-status        - Toggle active status
POST   /system/currencies/{id}/set-as-base         - Set as base currency
POST   /system/currencies/update-from-api          - Update rates from API
POST   /system/currencies/bulk-update-rates        - Bulk update rates
```

### Currency Converter
```
GET    /system/currencies/converter        - Show converter page
POST   /system/currencies/convert          - Perform conversion
```

### History & Data
```
GET    /system/currencies/{id}/history           - Show history page
GET    /system/currencies/{id}/history-data      - Get history data (JSON)
```

### API Endpoints for Dropdowns
```
GET    /system/currencies/api/active       - Get active currencies (JSON)
GET    /system/currencies/api/all          - Get all currencies (JSON)
```

---

## 📊 Database Schema

### currencies Table
```sql
- id (bigint, PK)
- code (varchar(3), unique) - e.g., USD, EUR
- name (varchar) - Full currency name
- symbol (varchar) - Currency symbol
- country (varchar) - Country name
- exchange_rate (decimal(20,4)) - Exchange rate to base
- is_active (boolean) - Active status
- is_base_currency (boolean) - Base currency flag
- sort_order (integer) - Display order
- timestamps
```

### currency_exchange_rate_history Table
```sql
- id (bigint, PK)
- currency_id (bigint, FK)
- exchange_rate (decimal(20,6)) - New rate
- previous_rate (decimal(20,6)) - Old rate
- rate_change (decimal(10,6)) - Percentage change
- source (varchar) - manual, api, system
- api_provider (varchar) - API provider name
- notes (text) - Additional notes
- effective_date (timestamp) - When rate became effective
- timestamps
```

---

## 🎯 Features in Action

### 1. Real-Time Currency Conversion
The converter provides instant conversion between any two currencies with live exchange rates.

### 2. Historical Rate Tracking
Every rate change is automatically logged with:
- Previous rate
- New rate
- Percentage change
- Source (manual/API)
- Date and time
- API provider used

### 3. Multi-Currency Reports
Display financial data in any currency with automatic conversion:
- View transactions in original currencies
- Convert to any display currency
- Export reports to CSV
- Accurate exchange rate calculations

### 4. Automatic API Updates
Exchange rates update automatically:
- Daily at midnight (configurable)
- Uses reliable free APIs
- Logs all updates
- Handles errors gracefully
- Caches to prevent excessive API calls

---

## 🔒 Security Features

1. **Rate Limiting**: API calls are cached to prevent abuse
2. **Validation**: All input is validated server-side
3. **Authentication**: All routes protected by authentication middleware
4. **Base Currency Protection**: Cannot delete or deactivate base currency
5. **Transaction Safety**: Uses database transactions for critical operations

---

## 🐛 Troubleshooting

### Exchange rates not updating
1. Check internet connection
2. Verify API provider is accessible
3. Check logs: `storage/logs/currency-updates.log`
4. Try force update: `php artisan currency:update-rates --force`

### Currency not showing in dropdowns
1. Check if currency is active: `is_active = true`
2. Clear cache: `php artisan cache:clear`
3. Verify currency exists in database

### Conversion errors
1. Ensure both currencies exist and are active
2. Check exchange rates are set
3. Verify base currency is configured

---

## 📝 API Response Examples

### Currency Conversion Response
```json
{
  "from_currency": "USD",
  "to_currency": "EUR",
  "from_amount": 100,
  "to_amount": 85.00,
  "exchange_rate": 0.8500,
  "from_symbol": "$",
  "to_symbol": "€"
}
```

### Update Rates Response
```json
{
  "success": true,
  "message": "Successfully updated 29 currency exchange rates",
  "updated": 29,
  "errors": [],
  "provider": "frankfurter",
  "date": "2025-10-06"
}
```

---

## 🎨 UI Components

### Available Components
1. **Currency Index** - List and manage all currencies
2. **Currency Converter** - Interactive conversion tool
3. **Currency History** - Visual rate history with charts
4. **Multi-Currency Report** - Flexible reporting component

### Styling
All components use your existing theme system with support for:
- Light/Dark mode
- Responsive design
- Professional UI/UX
- Accessibility features

---

## 🚀 Performance Optimizations

1. **Caching**: Active currencies cached for 1 hour
2. **Lazy Loading**: History data loaded on demand
3. **Pagination**: Large datasets paginated automatically
4. **Indexing**: Database indexes on frequently queried columns
5. **Efficient Queries**: Optimized database queries

---

## 📈 Future Enhancements (Optional)

- [ ] Cryptocurrency support
- [ ] Real-time exchange rate websockets
- [ ] Currency trend charts
- [ ] Email notifications for significant rate changes
- [ ] Multi-currency invoicing
- [ ] Currency forecasting
- [ ] API rate limit monitoring
- [ ] Custom API provider integration

---

## 👥 Support

For issues or questions:
1. Check this documentation
2. Review logs in `storage/logs/`
3. Run diagnostics: `php artisan currency:update-rates --force`

---

## 📜 License

This currency system is part of your ERP SaaS application.

---

**Version**: 1.0.0  
**Last Updated**: October 7, 2025  
**Status**: ✅ Production Ready

