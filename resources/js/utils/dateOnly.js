/**
 * Calendar / API date-only strings (Y-m-d) must use the user's local calendar day.
 * `date.toISOString().split('T')[0]` uses UTC and shifts the day in many timezones (e.g. UTC+5).
 */

export function formatLocalYmd(date) {
  if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayLocalYmd() {
  return formatLocalYmd(new Date());
}

/**
 * Parse a Y-m-d (or ISO string starting with Y-m-d) into local midnight for that calendar day.
 */
export function parseLocalYmd(value) {
  if (value == null || value === '') {
    return null;
  }
  const s = String(value).trim().split('T')[0];
  const parts = s.split('-');
  if (parts.length !== 3) {
    return null;
  }
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if ([y, m, d].some((n) => Number.isNaN(n))) {
    return null;
  }
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
    return null;
  }
  return dt;
}
