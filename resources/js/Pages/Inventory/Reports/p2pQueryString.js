export function buildPrToPoConversionQueryString(f) {
  const p = new URLSearchParams();
  if (f.date_from) p.set('date_from', String(f.date_from));
  if (f.date_to) p.set('date_to', String(f.date_to));
  if (f.pr_status && f.pr_status !== 'all') p.set('pr_status', String(f.pr_status));
  p.set('po_linked_only', f.po_linked_only ? '1' : '0');
  if (f.search && String(f.search).trim()) p.set('search', String(f.search).trim());
  p.set('sort_by', f.sort_by ? String(f.sort_by) : 'pr_date');
  p.set('sort_order', f.sort_order === 'asc' ? 'asc' : 'desc');
  return p.toString();
}
