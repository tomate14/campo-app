-- Feature 87: eliminar Analytics de Agricultura.
-- Quita la opcion de menu 'agricola-analytics' (sembrada en V24) y sus asignaciones por rol.

DELETE rmo FROM role_menu_options rmo
JOIN menu_options mo ON mo.id = rmo.menu_option_id
WHERE mo.menu_key = 'agricola-analytics';

DELETE FROM menu_options WHERE menu_key = 'agricola-analytics';
