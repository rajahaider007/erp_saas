# i18n Translation System

This folder contains **JSON-based translations** for the SaaS ERP app. The structure is designed to be **easy to manage** and **extensible** (e.g. add more languages later).

## Structure

- **`{locale}/`** — One folder per language code (e.g. `en`, `ur`).
- **`{locale}/*.json`** — One JSON file per **form/template/area**:
  - `common.json` — Buttons, actions, statuses, generic labels (Save, Cancel, Logout, etc.).
  - `login.json` — Login page: titles, labels, errors, concurrent session modal.
  - `sidebar.json` — Sidebar: Dashboard, ERP Modules, Storage, Settings, footer text.
  - `header.json` — Header: nav labels, Language, Theme, Profile, Notifications.
  - `modules.json` — ERP Modules page: page title, descriptions, status labels, empty state.

## Adding a new language

1. Create a folder: `lang/{new_locale}/` (e.g. `lang/ar/` for Arabic).
2. Copy all JSON files from `lang/en/` into it.
3. Translate the values (keep keys unchanged).
4. Register the locale in `App\Services\TranslationLoaderService::LOCALES` and in `getSupportedLocales()` (name and `dir`: `ltr` or `rtl`).

## Keys and placeholders

- **Keys** use dot notation in the app: `login.title`, `common.actions.save`, `modules.footer_welcome`.
- **Placeholders** in strings use `{name}`. Example: `"footer_welcome": "Welcome to {company} - Your Business Management Solution"`. In code: `t('modules.footer_welcome', { company: 'Acme Inc.' })`.

## Where translations are used

- **Backend:** Locale is stored in session (`locale`). Translations are loaded by `TranslationLoaderService` and passed to the frontend via Inertia shared data.
- **Frontend:** `useTranslations()` hook (see `resources/js/hooks/useTranslations.js`) provides `t(key, replacements)`, `locale`, `setLocale`, and `supportedLocales`. Used in Login, Sidebar, Header, and ERP Modules page.
- **Locale switcher:** Login page (top-right) and Header (EN | اردو). Switching posts to `/locale` and reloads with the new language.

## RTL support

For right-to-left languages (e.g. Urdu), set `"dir": "rtl"` in `TranslationLoaderService::getSupportedLocales()`. The app sets `document.documentElement.dir` and `lang` automatically when the user changes language.
