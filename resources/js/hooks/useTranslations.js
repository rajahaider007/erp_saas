import { usePage, router } from '@inertiajs/react';
import { useCallback } from 'react';

/**
 * Get a nested value from an object using dot notation (e.g. 'login.errors.fill_all').
 */
function getNested(obj, path) {
  if (!obj || typeof path !== 'string') return undefined;
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[key];
  }
  return current;
}

/**
 * Replace placeholders in a string (e.g. "Hello {name}" with { name: 'World' } => "Hello World").
 */
function replacePlaceholders(str, replacements = {}) {
  if (typeof str !== 'string') return str;
  return Object.keys(replacements).reduce(
    (acc, key) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(replacements[key])),
    str
  );
}

/**
 * Translation hook for i18n. Uses translations and locale shared by HandleInertiaRequests.
 * @returns {{ t: (key: string, replacements?: Object) => string, locale: string, setLocale: (code: string) => void, supportedLocales: Array }}
 */
export function useTranslations() {
  const { props } = usePage();
  const locale = props.locale || 'en';
  const translations = props.translations || {};
  const supportedLocales = props.supportedLocales || [];

  const t = useCallback(
    (key, replacements = {}) => {
      const value = getNested(translations, key);
      if (value === undefined || value === null) return key;
      if (typeof value !== 'string') return value; // e.g. arrays for lists
      return replacePlaceholders(value, replacements);
    },
    [translations]
  );

  const setLocale = useCallback((code) => {
    router.post('/locale', { locale: code }, { preserveScroll: true });
  }, []);

  return { t, locale, setLocale, supportedLocales };
}

export default useTranslations;
