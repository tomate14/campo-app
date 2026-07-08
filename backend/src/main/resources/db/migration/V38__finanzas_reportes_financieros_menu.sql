INSERT INTO menu_options (id, menu_key, label, route, section, icon, display_order)
SELECT UUID(), 'finanzas-reportes', 'Dashboard financiero', '/finanzas/reportes', 'Dashboard', 'chart-line', 20
WHERE NOT EXISTS (SELECT 1 FROM menu_options WHERE menu_key = 'finanzas-reportes');

INSERT INTO role_menu_options (role_id, menu_option_id)
SELECT r.id, m.id
FROM roles r
JOIN menu_options m ON m.menu_key = 'finanzas-reportes'
WHERE r.name IN ('ADMIN', 'PRODUCTOR')
  AND NOT EXISTS (
      SELECT 1
      FROM role_menu_options existing
      WHERE existing.role_id = r.id AND existing.menu_option_id = m.id
  );
