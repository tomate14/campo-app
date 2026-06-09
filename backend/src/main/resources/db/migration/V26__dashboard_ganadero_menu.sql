INSERT INTO menu_options (id, menu_key, label, route, section, icon, display_order)
SELECT UUID(), 'dashboard-ganadero', 'Dashboard ganadero', '/reportes/ganaderia', 'Dashboard', 'cow-chart', 15
WHERE NOT EXISTS (
    SELECT 1 FROM menu_options WHERE menu_key = 'dashboard-ganadero'
);

INSERT INTO role_menu_options (role_id, menu_option_id)
SELECT r.id, m.id
FROM roles r
JOIN menu_options m ON m.menu_key = 'dashboard-ganadero'
WHERE r.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1
      FROM role_menu_options rmo
      WHERE rmo.role_id = r.id
        AND rmo.menu_option_id = m.id
  );
