INSERT INTO role_menu_options (role_id, menu_option_id)
SELECT r.id, reportes.id
FROM roles r
JOIN menu_options reportes ON reportes.menu_key = 'finanzas-reportes'
WHERE r.deleted_at IS NULL
  AND reportes.deleted_at IS NULL
  AND reportes.active = TRUE
  AND (
      r.name IN ('admin', 'super_admin', 'productor')
      OR EXISTS (
          SELECT 1
          FROM role_menu_options rmo
          JOIN menu_options facturacion ON facturacion.id = rmo.menu_option_id
          WHERE rmo.role_id = r.id
            AND facturacion.menu_key = 'finanzas-facturacion'
      )
  )
  AND NOT EXISTS (
      SELECT 1
      FROM role_menu_options existing
      WHERE existing.role_id = r.id AND existing.menu_option_id = reportes.id
  );
