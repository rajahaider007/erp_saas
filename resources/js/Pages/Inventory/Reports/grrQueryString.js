/**
 * Build query string for GRN register report URL and export downloads (matches Laravel filter keys).
 * @param {Record<string, unknown>} f
 */
export function buildGoodsReceiptRegisterQueryString(f) {
  const p = new URLSearchParams();
  if (f.date_from) p.set('date_from', String(f.date_from));
  if (f.date_to) p.set('date_to', String(f.date_to));
  if (f.date_basis && f.date_basis !== 'receipt') p.set('date_basis', String(f.date_basis));
  if (f.vendor_id != null && f.vendor_id !== '') p.set('vendor_id', String(f.vendor_id));
  if (f.status && f.status !== 'all') p.set('status', String(f.status));
  if (f.posted_only) p.set('posted_only', '1');
  if (f.search && String(f.search).trim()) p.set('search', String(f.search).trim());
  p.set('sort_by', f.sort_by ? String(f.sort_by) : 'receipt_date');
  p.set('sort_order', f.sort_order === 'asc' ? 'asc' : 'desc');
  return p.toString();
}
