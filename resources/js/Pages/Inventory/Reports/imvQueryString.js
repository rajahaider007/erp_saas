/** Query string for posted inventory movements register */
export function buildInventoryMovementsQueryString(f) {
  const p = new URLSearchParams();
  if (f.date_from) p.set('date_from', String(f.date_from));
  if (f.date_to) p.set('date_to', String(f.date_to));
  if (f.search && String(f.search).trim()) p.set('search', String(f.search).trim());
  p.set('sort_by', f.sort_by ? String(f.sort_by) : 'voucher_date');
  p.set('sort_order', f.sort_order === 'asc' ? 'asc' : 'desc');
  return p.toString();
}
