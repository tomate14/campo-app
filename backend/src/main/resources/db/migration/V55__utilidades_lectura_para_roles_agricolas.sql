-- Feature 58 (fix): los selects configurables de agricultura (cultivo, unidad de dosis,
-- destino, etc.) leen del modulo Utilidades. Ese endpoint exige read:utilidades, que los
-- roles operativos (p. ej. operario) no tenian, y rompia formularios como la orden de
-- aplicacion. Se otorga SOLO LECTURA de utilidades a todo rol que ya pueda leer lotes.
-- No se toca write:utilidades ni la visibilidad del menu de Utilidades.
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT DISTINCT rp.role_id, pu.id
FROM role_permissions rp
JOIN permissions pl ON pl.id = rp.permission_id AND pl.name = 'read:lotes'
JOIN permissions pu ON pu.name = 'read:utilidades';
