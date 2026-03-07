# i18n Strategy – Forms + Database (EN/UR)

## Current Setup
- **Frontend:** `useTranslations()` hook, `t('namespace.key')` (e.g. `common.actions.save`, `login.title`).
- **Translations:** `lang/{en|ur}/*.json` (common, login, sidebar, header, modules). Loaded by `TranslationLoaderService` and shared via Inertia.

---

## 1. Forms (sab forms translate karna)

### Approach
- **Har form** mein `useTranslations()` use karein aur hardcoded strings ko `t('key')` se replace karein.
- **JSON structure:** Module-wise files rakhein taake manage easy ho:
  - `lang/en/accounts.json` → keys: `cash_voucher.create.*`, `bank_voucher.create.*`, `journal_voucher.*`, …
  - `lang/en/inventory.json` → `item_master.*`, `uom.*`, …
  - `lang/en/system.json` → `users.*`, `menus.*`, `companies.*`, …
- **Common** strings (Save, Cancel, Delete, Search, …) already `common.json` mein hain.

### Steps per form
1. Form file kholen (e.g. `Accounts/CashVoucher/Create.jsx`).
2. `import { useTranslations } from '@/hooks/useTranslations';` add karein, component mein `const { t } = useTranslations();`.
3. Har user-facing string ko replace karein:  
   `"Cash Payment"` → `t('accounts.cash_voucher.voucher_types.cash_payment')`  
   `placeholder="Select voucher date"` → `placeholder={t('accounts.cash_voucher.placeholders.voucher_date')}`
4. `lang/en/accounts.json` (aur `lang/ur/accounts.json`) mein woh keys add karein.

### Automation (script)
- **Extract:**  
  `npm run i18n:extract`  
  → `scripts/i18n-extract-report.json` banega (file, line, string, suggestedKey, namespace).
- **Extract + JSON update (EN):**  
  `npm run i18n:extract:update`  
  → Report ke saath `lang/en/accounts.json`, `inventory.json`, `system.json`, `reports.json`, `logs.json`, `pages.json` mein suggested keys add ho jayengi (value = extracted string).
- **Urdu:**  
  `lang/ur/` mein same names ki files banao (e.g. `accounts.json`) aur EN structure copy karke values Urdu mein translate karo. Optional: `node scripts/i18n-sync-ur-keys.js` se EN keys UR files mein copy ho sakti hain (nayi keys ki value EN rehti hai, aap baad mein translate kar sakte ho).
- **Forms par apply:**  
  Report mein file + line dekh kar wahan `t('accounts.cash_voucher.create.xxx')` lagao. Pehle form mein `useTranslations` add karo, phir ek ek string ko replace karo.

### Ek form ka example (CashVoucher Create)
```jsx
import { useTranslations } from '@/hooks/useTranslations';

const CashVoucherCreate = () => {
  const { t } = useTranslations();
  // ...
  return (
    <>
      <div className="breadcrumbs-description">{t('accounts.cash_voucher.create.navigate_through_your_application_module')}</div>
      <option value="Cash Payment">{t('accounts.cash_voucher.voucher_types.cash_payment')}</option>
      <input placeholder={t('accounts.cash_voucher.create.select_voucher_date')} />
    </>
  );
};
```
`common.actions.save`, `common.actions.cancel` jaisi keys pehle se `common.json` mein hain; form-specific keys `accounts.json` (ya dusre module JSON) mein rakhein.

---

## 2. Database content – translation DB mein NAHI, sirf JSON

- **Translation storage:** Sirf `lang/{en|ur}/*.json` – database mein translation columns ya translation table **nahi** use karte.
- **Menus / modules / sections:** Names DB se aate hain (e.g. `menu_name`, `module_name`). UI par label **JSON se** dikhana hai:
  - Backend har menu/module ke saath ek **slug** (e.g. route se: `cash-voucher`, `chart-of-accounts`) bhejta hai.
  - Frontend: `t('sidebar.menus.' + slug)` use karta hai; agar key nahi milti to **fallback** `menu_name` (DB value) dikhata hai.
- Is se DB structure same rehti hai, sirf JSON files mein `sidebar.menus.cash_voucher`, `sidebar.menus.chart_of_accounts` waghera add karte ho.

---

## 3. Pura system – translation sirf JSON, har file par logic

- **Database mein translation save nahi:** Sirf `lang/{en|ur}/*.json` use karo.
- **Har file par translation logic:** Sab Pages (aur zarurat ho to Components) par `useTranslations()` aur `t('key')` laga chuke hain (script se apply ho chuka).

### Commands (order of work)

1. **Extract strings:** `npm run i18n:extract` → report banta hai.
2. **Update EN JSON:** `npm run i18n:extract:update` → `lang/en/*.json` mein keys add.
3. **Sync UR keys:** `npm run i18n:sync-ur` → `lang/ur/*.json` mein same keys (value EN), phir Urdu translate karo.
4. **Apply t() in code:** `npm run i18n:apply` → report ke hisaab se sab files mein `t('key')` replace.
5. **Missing import:** `npm run i18n:add-imports` → jahan `useTranslations()` hai wahan import add.

### Database (menus/sections)

- Backend `menu_slug` bhejta hai (route se). Frontend: `t('sidebar.menus.' + slug)` with fallback `menu_name`.
- Naye menu ke liye `lang/en/sidebar.json` aur `lang/ur/sidebar.json` mein `menus.<slug>` add karo.

### Validation / flash

- Laravel: `lang/{en,ur}/validation.php`.
- Flash: backend se translated message bhejo ya frontend key + `t(flash.key)`.
