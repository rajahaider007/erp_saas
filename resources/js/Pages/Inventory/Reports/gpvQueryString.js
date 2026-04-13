/** Query string for GRN vs PO variance report */
export function buildGrnPoVarianceQueryString(f) {
  const p = new URLSearchParams();
  if (f.date_from) p.set('date_from', String(f.date_from));
  if (f.date_to) p.set('date_to', String(f.date_to));
  if (f.vendor_id) p.set('vendor_id', String(f.vendor_id));
  if (f.status && f.status !== 'all') p.set('status', String(f.status));
  if (f.open_lines_only) p.set('open_lines_only', '1');
  if (f.variance_only) p.set('variance_only', '1');
  if (f.search && String(f.search).trim()) p.set('search', String(f.search).trim());
  p.set('sort_by', f.sort_by ? String(f.sort_by) : 'po_date');
  p.set('sort_order', f.sort_order === 'asc' ? 'asc' : 'desc');
  return p.toString();
}
