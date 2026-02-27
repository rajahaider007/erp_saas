-- Remove menu items for reports that are not yet implemented in the system
DELETE FROM menus WHERE route IN (
    '/reports/multi-currency',
    '/reports/account-summary', 
    '/reports/journal-entries',
    '/reports/aged-payables',
    '/reports/aged-receivables',
    '/reports/cash-flow',
    '/reports/profit-loss'
);

-- Show remaining active report menus
SELECT id, section_id, menu_name, route, icon, status, sort_order, created_at, updated_at 
FROM menus 
WHERE section_id = 10 
AND status = 1 
ORDER BY sort_order;
