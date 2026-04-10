/**
 * Query string for stock position (GRN receipts) report — matches Laravel filter keys.
 * @param {Record<string, unknown>} f
 */
export function buildStockPositionQueryString(f) {
  const p = new URLSearchParams();
  if (f.as_of_date) p.set('as_of_date', String(f.as_of_date));
  if (f.posted_only) p.set('posted_only', '1');
  if (f.search && String(f.search).trim()) p.set('search', String(f.search).trim());
  p.set('sort_by', f.sort_by ? String(f.sort_by) : 'item_code');
  p.set('sort_order', f.sort_order === 'desc' ? 'desc' : 'asc');
  return p.toString();
}
