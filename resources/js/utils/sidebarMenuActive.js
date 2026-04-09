const GRN_LIST_PATH = '/inventory/goods-receipt-note';
const GRN_SUPPLIER_INVOICE_PATH = '/inventory/grn-supplier-invoice';

/**
 * @param {string} pageUrl Inertia usePage().url (path + optional ?query)
 * @param {string} childHref Menu route from DB
 */
export function isSidebarChildActive(pageUrl, childHref) {
  const raw = pageUrl || '';
  const q = raw.indexOf('?');
  const path = q === -1 ? raw : raw.slice(0, q);

  if (childHref === GRN_SUPPLIER_INVOICE_PATH) {
    return path === GRN_SUPPLIER_INVOICE_PATH || path.startsWith(`${GRN_SUPPLIER_INVOICE_PATH}/`);
  }

  if (childHref === GRN_LIST_PATH) {
    return path === childHref || path.startsWith(`${childHref}/`);
  }

  return path === childHref || path.startsWith(`${childHref}/`);
}
