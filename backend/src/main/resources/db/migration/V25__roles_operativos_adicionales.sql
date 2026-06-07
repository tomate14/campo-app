INSERT INTO roles (id, name, description)
SELECT UUID(), 'tractorista', 'Operador de maquinaria agricola'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'tractorista' AND deleted_at IS NULL);

INSERT INTO roles (id, name, description)
SELECT UUID(), 'supervisor', 'Supervision operativa de campo'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'supervisor' AND deleted_at IS NULL);

INSERT INTO roles (id, name, description)
SELECT UUID(), 'veterinario', 'Responsable sanitario veterinario'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'veterinario' AND deleted_at IS NULL);

INSERT INTO roles (id, name, description)
SELECT UUID(), 'encargado', 'Encargado operativo del establecimiento'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'encargado' AND deleted_at IS NULL);

INSERT IGNORE INTO role_menu_options (role_id, menu_option_id)
SELECT r.id, m.id
FROM roles r
JOIN menu_options m ON m.deleted_at IS NULL AND m.active = TRUE
WHERE r.name IN ('tractorista', 'supervisor', 'veterinario', 'encargado')
  AND r.deleted_at IS NULL;
