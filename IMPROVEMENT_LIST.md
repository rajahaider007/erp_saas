# SaaS ERP — Design & UX Improvement List

Work through these items **one by one**. Each item has a short title, description, and relevant URLs/files for implementation.

---

## 1. Login Screen Redesign
**URL:** `http://127.0.0.1:8000/login`  
**Status:** [ ] Not started

**Issue:** Login screen looks generic (“free AI” style), not like a crafted, professional piece.

**Tasks:**
- Redesign login page with a distinct, professional look (typography, layout, branding).
- Avoid generic gradients/placeholders; add purposeful visuals or minimal art.
- Ensure responsive and accessible.

**Relevant files:**
- `resources/views/login.blade.php`
- `resources/js/Pages/Login.jsx`

---

## 2. ERP Modules Screen — First Load Not Working (Needs Reload)
**URL:** `http://127.0.0.1:8000/erp-modules`  
**Status:** [ ] Not started

**Issue:** After first login, navigating to ERP Modules — screen is not “touch working”; user must reload the page for it to work.

**Tasks:**
- Find why first visit (e.g. client-side hydration, Inertia, or JS) fails.
- Fix so ERP Modules is fully interactive on first load without reload.

**Relevant files:**
- `resources/js/Pages/Modules/index.jsx` (or equivalent)
- `routes/web.php` (route: `/erp-modules` → Inertia `Modules/index`)
- `resources/js/Components/Layout/Sidebar.jsx`, `Header.jsx` (navigation)

---

## 3. Rights Screen — Sidebar Disappears
**URL:** `http://127.0.0.1:8000/system/users/1/rights`  
**Status:** [ ] Not started

**Issue:** On the user rights screen, the sidebar menu disappears.

**Tasks:**
- Ensure rights page uses the same layout as other system pages (with sidebar).
- Check layout component and route/layout binding for this route.

**Relevant files:**
- Route and controller for `system/users/{id}/rights`
- Layout used by that page (e.g. `resources/js/Layouts/` or page-level layout)
- `resources/js/Components/Layout/Sidebar.jsx`

---

## 4. Rights Enforcement — Menu, Forms, and ERP Modules
**Status:** [x] Done

**Issues:**
- If a form has no rights, its menu still appears in the sidebar.
- User can still add/edit/delete records for forms they have no rights to.
- If user has no rights to any form of a module, that module should be disabled (not accessible) on the ERP Modules screen.

**Tasks:**
- **Sidebar:** Filter menu items by user rights; hide forms/pages user cannot access.
- **Forms:** Enforce rights on all add/edit/delete actions (backend + frontend).
- **ERP Modules screen:** Disable or hide modules where user has no access to any form; prevent navigation to them.

**Relevant areas:**
- Sidebar/menu building (e.g. `Sidebar.jsx`, menu API or props).
- Permission middleware and policy checks on controllers.
- ERP Modules page component (disable cards/links by module rights).

---

## 5. Theme Customizer — Single Option for Theme Mode + Form Theme
**Status:** [x] Done

**Issue:** Theme Customizer has separate options for “Theme Mode” and “Form Theme”; user wants a single, unified option.

**Tasks:**
- Merge “Theme Mode” and “Form Theme” into one setting (e.g. Light / Dark / System).
- Update Theme Customizer UI and any code that reads these two settings.

**Relevant files:**
- Theme Customizer component/page
- Any theme state (e.g. context, localStorage, backend preference)

---

## 6. Dark/Light Mode — Some Forms Not Fully Themed
**Status:** [x] Done

**Issue:** When switching from dark to light (or vice versa), some forms don’t fully switch — some divs/elements don’t have theme classes.

**Tasks:**
- Audit form pages and shared form components for hardcoded colors or missing theme classes.
- Use a consistent set of theme-aware classes (e.g. Tailwind dark:) so all form sections respond to theme.

**Relevant areas:**
- Form components and form wrapper layouts
- Global theme/CSS variables and Tailwind dark mode config

---

## 7. Footer — System Footer Instead of Website Footer
**Status:** [x] Done

**Issue:** Current footer looks like a marketing/website footer; it should look like a system/app footer.

**Tasks:**
- Redesign footer for “system” context: compact, optional links (e.g. help, version, terms), no heavy marketing content.
- Reuse this footer in the main app layout only (not necessarily on login or marketing pages).

**Relevant files:**
- Footer component (e.g. `resources/js/Components/Layout/Footer.jsx` or similar)
- Main app layout(s) that include the footer

---

## 8. Unit Conversion Form — Design and Master–Detail
**Status:** [x] Done

**Issue:** “Create New Unit Conversion” form should be 100% consistent with system design and implemented as a master–detail form so multiple conversions can be added for a “from unit”.

**Tasks:**
- Align form layout, controls, and styling with the rest of the system.
- Implement master–detail: one “from unit” (master) with multiple conversion rows (detail), add/remove rows, save together.

**Relevant files:**
- Unit conversion controller and routes (e.g. `UomConversionController`, routes under inventory)
- Unit conversion create/edit page (e.g. under `resources/js/Pages/Inventory/` or similar)

---

## 9. Journal Voucher — Account Select (Search + Scroll + Dropdown)
**Status:** [x] Done

**Issue:** In Journal Voucher form, the “Account *” select has bad behavior when searching and scrolling: clicking an option from a lower select opens the dropdown of the select above (z-index/position/consistency issue).

**Tasks:**
- Fix dropdown stacking and positioning so the correct select’s dropdown is shown and click targets are correct.
- Ensure search + scroll inside the list works and doesn’t mix up with other Account selects.

**Relevant files:**
- Journal Voucher form page and Account select component (e.g. Select2, custom select, or Combobox)
- Any shared “account picker” or “searchable select” component

---

## 10. Storage System — Visibility and Entry Point
**Status:** [x] Done

**Issue:** You designed a storage system but it’s not obvious where it lives in the app.

**Location (current):**
- **URL:** `http://127.0.0.1:8000/system/attachment-manager`
- **Backend:** `App\Services\StorageService`, `AttachmentController`, `AttachmentManagerController`
- **Frontend:** `resources/js/Pages/system/AttachmentManager/Index.jsx`, `resources/js/Components/StorageWarning.jsx`

**Tasks:**
- Add a clear entry point: link in sidebar (e.g. under System or Settings) and/or from dashboard.
- Optionally add a “Storage” or “Attachment manager” item in a user menu or system section so it’s discoverable.

**Relevant files:**
- `resources/js/Components/Layout/Sidebar.jsx` (add menu item)
- `routes/web.php` (already has `system/attachment-manager` routes)

---

## 11. i18n Translation System (JSON, English/Urdu, Extensible)
**Status:** [ ] Not started

**Requirements:**
- JSON-based translation files, well-structured (e.g. by form name and template name for easy management).
- Support at least English and Urdu; easy to add more languages later.
- Fast; integrated across the app (no missing areas).
- Optional: form in the system to manage translations and add languages (can be a later phase).

**Tasks:**
- Define JSON structure (e.g. `lang/{locale}/{module}/{form-or-template}.json` or similar).
- Integrate Laravel `lang` and/or frontend i18n (e.g. react-i18next, Inertia shared data) so backend and frontend use same keys where needed.
- Replace hardcoded strings with translation keys in login, sidebar, ERP modules, and key forms; add English and Urdu files.
- Document structure (form names, template names) so future translators can manage JSON easily.
- (Optional) Build an admin form to edit JSON translations and add new locales.

**Relevant areas:**
- `lang/` directory structure
- Laravel localization config and middleware
- Frontend i18n setup (e.g. in `app.jsx` or layout)
- Shared Inertia data for locale and messages

---

## 12. Overall System Design — More Professional Look
**Status:** [ ] Not started

**Issue:** Final pass to make the whole system look more professional.

**Tasks:**
- Review main layouts (sidebar, header, dashboard, list/detail pages).
- Unify spacing, typography, buttons, cards, and tables.
- Ensure consistent use of theme (light/dark) and system footer.
- Polish icons, borders, and hierarchy so the product feels cohesive and professional.

**Relevant areas:**
- Global CSS / Tailwind config
- Layout components (Sidebar, Header, Footer, main content wrapper)
- Dashboard and ERP Modules pages
- A few representative forms and list pages

---

## Quick Reference — Order of Work

| # | Item                              | Priority / dependency      |
|---|-----------------------------------|----------------------------|
| 1 | Login screen redesign             | Can do first               |
| 2 | ERP Modules first-load fix        | High (UX)                  |
| 3 | Rights screen sidebar             | High (broken page)         |
| 4 | Rights enforcement (menu + forms) | High (security/UX)         |
| 5 | Theme single option               | Medium                     |
| 6 | Dark/light form theme fixes       | Medium                     |
| 7 | System footer                     | Medium                     |
| 8 | Unit conversion master–detail     | Medium                     |
| 9 | Journal Voucher Account select    | Medium                     |
|10 | Storage system entry point        | Quick win                  |
|11 | i18n (JSON, EN/UR, structure)     | Larger (do when ready)     |
|11 | i18n (JSON, EN/UR, structure)     | Larger (do when ready)     |

|12 | Overall professional design       | Good as final pass         |

---

*Use this list as a checklist: mark items done in the **Status** line (e.g. `[x] Done`) and move to the next one.*
