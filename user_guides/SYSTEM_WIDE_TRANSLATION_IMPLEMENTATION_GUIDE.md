# System-Wide Translation Implementation Guide (EN/UR)

## Objective
Implement consistent bilingual translations (English + Urdu) across the full frontend system with a repeatable workflow.

## Current Status

### Completed and verified (update this list as pages pass QA EN/UR)
- Accounts/BankVoucher: Create + Show
- Accounts/CashVoucher: Create + Show
- Accounts/JournalVoucher: Create + Show
- Accounts/OpeningVoucher: Create + Show
- Accounts/AccountConfiguration: Create + List
- Accounts/VoucherNumberConfiguration: create + List + show
- Accounts/FiscalYearConfiguration: Index
- Accounts/ChartOfAccountCodeConfiguration: Index + CashConfiguration + BankConfiguration
- System “high-risk” entrypoints: `CodeConfiguration/Edit.jsx`, `RoleFeatures/create.jsx`, `Users/index.jsx` (thin re-exports; i18n on `Create.jsx`, `RoleFeatures/edit.jsx`, `Users/List.jsx`)
- System/Companies: Create + List + Show (`system.companies.*`)

## Translation Structure
- Locale files:
  - `lang/en/accounts.json`
  - `lang/ur/accounts.json`
  - `lang/en/common.json`
  - `lang/ur/common.json`
  - `lang/en/reports.json`
  - `lang/ur/reports.json`
- Translation usage in pages:
  - `useTranslations()` hook
  - `t('namespace.key')`

## Naming Convention (Recommended)
Use this pattern for all keys:
- `accounts.<module>.<page>.<key>`
- `reports.<module>.<page>.<key>`
- `common.<section>.<key>` for shared strings (alerts, buttons, actions)

Examples:
- `accounts.cash_voucher.create.msg_amount_is_required`
- `accounts.general_ledger.search.date_range`
- `common.data_table.confirm_delete_title`

## Next Forms Queue

### Priority 1: Accounts Core Config
Use `[x]` = done (keys + UI covered), `[ ]` = still to do.

1. [x] `resources/js/Pages/Accounts/AccountConfiguration/Create.jsx`
2. [x] `resources/js/Pages/Accounts/AccountConfiguration/List.jsx`
3. [x] `resources/js/Pages/Accounts/VoucherNumberConfiguration/create.jsx`
4. [x] `resources/js/Pages/Accounts/VoucherNumberConfiguration/List.jsx`
5. [x] `resources/js/Pages/Accounts/VoucherNumberConfiguration/show.jsx`
6. [x] `resources/js/Pages/Accounts/ChartOfAccountCodeConfiguration/Index.jsx` (and `CashConfiguration.jsx`, `BankConfiguration.jsx`)
7. [x] `resources/js/Pages/Accounts/FiscalYearConfiguration/Index.jsx`

**Priority 1 (Accounts Core Config) is complete.** Next up: **High-Risk** system pages (see below) and/or **Priority 2: System Forms**.

### Priority 2: System Forms
1. [x] `resources/js/Pages/system/Companies/Create.jsx`
2. [x] `resources/js/Pages/system/Companies/List.jsx`
3. [x] `resources/js/Pages/system/Companies/Show.jsx`
4. `resources/js/Pages/system/Currencies/Create.jsx`
5. `resources/js/Pages/system/Currencies/Index.jsx`
6. `resources/js/Pages/system/Locations/create.jsx`
7. `resources/js/Pages/system/Locations/List.jsx`
8. `resources/js/Pages/system/Departments/create.jsx`
9. `resources/js/Pages/system/Departments/List.jsx`
10. `resources/js/Pages/system/Users/create.jsx`
11. `resources/js/Pages/system/Users/List.jsx`
12. `resources/js/Pages/system/Users/show.jsx`
13. `resources/js/Pages/system/AttachmentManager/Index.jsx`
14. `resources/js/Pages/system/AddModules/List.jsx`
15. `resources/js/Pages/system/AddModules/edit.jsx`
16. `resources/js/Pages/system/AddModules/show.jsx`
17. `resources/js/Pages/system/Menus/List.jsx`
18. `resources/js/Pages/system/Menus/edit.jsx`
19. `resources/js/Pages/system/Packages/List.jsx`
20. `resources/js/Pages/system/Packages/edit.jsx`
21. `resources/js/Pages/system/PackageFeatures/List.jsx`
22. `resources/js/Pages/system/PackageFeatures/edit.jsx`
23. `resources/js/Pages/system/Sections/List.jsx`
24. `resources/js/Pages/system/Sections/edit.jsx`
25. `resources/js/Pages/system/RoleFeatures/index.jsx`
26. `resources/js/Pages/system/RoleFeatures/create.jsx`
27. `resources/js/Pages/system/RoleFeatures/edit.jsx`
28. `resources/js/Pages/system/Roles/index.jsx`
29. `resources/js/Pages/system/CodeConfiguration/Create.jsx`
30. `resources/js/Pages/system/CodeConfiguration/Index.jsx`
31. `resources/js/Pages/system/CodeConfiguration/Edit.jsx`

### Priority 3: Inventory Forms
1. `resources/js/Pages/Inventory/ItemCategoryCoding/Create.jsx`
2. `resources/js/Pages/Inventory/ItemCategoryCoding/List.jsx`
3. `resources/js/Pages/Inventory/ItemClassCoding/Create.jsx`
4. `resources/js/Pages/Inventory/ItemClassCoding/List.jsx`
5. `resources/js/Pages/Inventory/ItemGroupCoding/Create.jsx`
6. `resources/js/Pages/Inventory/ItemGroupCoding/List.jsx`
7. `resources/js/Pages/Inventory/ItemMaster/Create.jsx`
8. `resources/js/Pages/Inventory/ItemMaster/List.jsx`
9. `resources/js/Pages/Inventory/MasterData/Create.jsx`
10. `resources/js/Pages/Inventory/MasterData/List.jsx`
11. `resources/js/Pages/Inventory/UomConversion/Create.jsx`
12. `resources/js/Pages/Inventory/UomConversion/List.jsx`
13. `resources/js/Pages/Inventory/UomMaster/Create.jsx`
14. `resources/js/Pages/Inventory/UomMaster/List.jsx`

## Next Reports Queue

### Priority 1: Accounts Reports
1. `resources/js/Pages/Accounts/GeneralLedger/Search.jsx`
2. `resources/js/Pages/Accounts/GeneralLedger/Report.jsx`
3. `resources/js/Pages/Accounts/GeneralLedger/Print.jsx`
4. `resources/js/Pages/Accounts/TrialBalance/Search.jsx`
5. `resources/js/Pages/Accounts/TrialBalance/Report.jsx`
6. `resources/js/Pages/Accounts/TrialBalance/Print.jsx`
7. `resources/js/Pages/Accounts/IncomeStatement/Search.jsx`
8. `resources/js/Pages/Accounts/IncomeStatement/Report.jsx`
9. `resources/js/Pages/Accounts/BalanceSheet/Search.jsx`
10. `resources/js/Pages/Accounts/BalanceSheet/Report.jsx`
11. `resources/js/Pages/Accounts/BalanceSheet/PrintView.jsx`
12. `resources/js/Pages/Accounts/CurrencyLedger/Search.jsx`
13. `resources/js/Pages/Accounts/CurrencyLedger/Report.jsx`
14. `resources/js/Pages/Accounts/CurrencyLedger/Print.jsx`

### Priority 2: Reports Module
1. `resources/js/Pages/Reports/CashBook/Search.jsx`
2. `resources/js/Pages/Reports/CashBook/Report.jsx`
3. `resources/js/Pages/Reports/ChartOfAccount/Search.jsx`
4. `resources/js/Pages/Reports/ChartOfAccount/Report.jsx`
5. `resources/js/Pages/Reports/GeneralLedger/Index.jsx`

## High-Risk Files (barrel / thin entrypoints)
**Done (2026-04-08).** These three files are re-exports only (no UI). Comments in each file point to the real component:

1. [x] `resources/js/Pages/system/CodeConfiguration/Edit.jsx` → UI + i18n in `CodeConfiguration/Create.jsx` (`system.code_configuration.create.*`)
2. [x] `resources/js/Pages/system/RoleFeatures/create.jsx` → UI + i18n in `RoleFeatures/edit.jsx` (`system.role_features.edit.*`)
3. [x] `resources/js/Pages/system/Users/index.jsx` → UI + i18n in `Users/List.jsx` (`system.users.list.*`; alerts use `common.flash` / `common.data_table` where shared)

## Implementation Workflow (Per File)
1. Add `useTranslations` import and initialize `const { t } = useTranslations();`
2. Replace all hardcoded user-facing text with `t('...')`
3. Add matching keys in both locale files (EN + UR)
4. Keep wording consistent with existing module tone
5. Validate no missing keys using script checks
6. QA in UI for both languages

## Missing Key Validation Scripts (PowerShell)

### A) Validate one module (example: CashVoucher)
```powershell
$files = Get-ChildItem resources/js/Pages/Accounts/CashVoucher/*.jsx | Select-Object -ExpandProperty FullName
$pattern = "accounts\.cash_voucher\.(create|show|list|print_detailed|print_summary)\.([a-zA-Z0-9_]+)"
$used = New-Object System.Collections.Generic.HashSet[string]
foreach($f in $files){
  $content = Get-Content $f -Raw
  [regex]::Matches($content,$pattern) | ForEach-Object { [void]$used.Add($_.Value) }
}

$en = Get-Content lang/en/accounts.json -Raw | ConvertFrom-Json
$ur = Get-Content lang/ur/accounts.json -Raw | ConvertFrom-Json

function Has-Key($obj,$path){
  $parts = $path.Split('.')
  $curr = $obj
  foreach($p in $parts){
    if($curr -is [pscustomobject] -and $curr.PSObject.Properties.Name -contains $p){
      $curr = $curr.$p
    } else { return $false }
  }
  return $true
}

$missingEn=@(); $missingUr=@()
foreach($k in $used){
  $rel=$k.Substring('accounts.'.Length)
  if(-not (Has-Key $en $rel)){ $missingEn += $k }
  if(-not (Has-Key $ur $rel)){ $missingUr += $k }
}

'Missing EN keys:'; if($missingEn.Count){$missingEn|Sort-Object}else{'(none)'}
'Missing UR keys:'; if($missingUr.Count){$missingUr|Sort-Object}else{'(none)'}
```

### B) Find pages with no translation usage
```powershell
$files=Get-ChildItem -Recurse -File resources/js/Pages -Include *.jsx,*.js
$files | Where-Object { (Get-Content $_.FullName -Raw) -notmatch 'useTranslations|\bt\(' } |
  Select-Object -ExpandProperty FullName
```

## QA Checklist
- EN/UR language switch works on every updated page
- No raw English labels remain in UI controls/buttons/alerts
- Form validation messages are translated
- Table action labels and confirmations are translated
- Report filters, headings, print labels are translated
- No broken placeholder variables (`{{count}}`, `{{name}}`, etc.)
- JSON files remain valid and lint/parse clean

## Suggested Rollout Plan
- Phase 1: System high-risk files + Accounts config pages
- Phase 2: Inventory forms
- Phase 3: Accounts reports
- Phase 4: Reports module + final global sweep

## Done Criteria
A page is considered done when:
- All visible text uses translation keys
- EN and UR keys both exist
- Validation and alert strings are translated
- Print/report variants of that module are also covered
