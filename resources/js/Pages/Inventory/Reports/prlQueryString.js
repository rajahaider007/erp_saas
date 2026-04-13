export function buildPurchaseRequisitionLinesQueryString(f) {
  const p = new URLSearchParams();
  if (f.date_from) p.set('date_from', String(f.date_from));
  if (f.date_to) p.set('date_to', String(f.date_to));
  if (f.status && f.status !== 'all') p.set('status', String(f.status));
  if (f.department_id) p.set('department_id', String(f.department_id));
  if (f.search && String(f.search).trim()) p.set('search', String(f.search).trim());
  p.set('sort_by', f.sort_by ? String(f.sort_by) : 'pr_date');
  p.set('sort_order', f.sort_order === 'asc' ? 'asc' : 'desc');
  return p.toString();
}
