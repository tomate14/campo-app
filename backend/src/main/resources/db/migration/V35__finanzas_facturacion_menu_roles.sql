INSERT INTO role_menu_options (role_id, menu_option_id)
SELECT r.id, m.id
FROM roles r
JOIN menu_options m ON m.menu_key = 'finanzas-facturacion'
WHERE r.deleted_at IS NULL
  AND m.deleted_at IS NULL
  AND m.active = TRUE
  AND r.name IN ('super_admin', 'admin', 'contador')
  AND NOT EXISTS (
      SELECT 1
      FROM role_menu_options existing
      WHERE existing.role_id = r.id
        AND existing.menu_option_id = m.id
  );
