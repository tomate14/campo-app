-- Feature 60: modulo Utilidades (catalogos configurables) + permisos y opcion de menu.

-- Tabla generica de opciones de catalogo, discriminada por categoria.
CREATE TABLE utilidad_opcion (
    id VARCHAR(36) NOT NULL,
    categoria VARCHAR(60) NOT NULL,
    valor VARCHAR(160) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    orden INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_utilidad_opcion UNIQUE (categoria, valor),
    INDEX idx_utilidad_opcion_categoria (categoria)
);

-- Seed del primer catalogo: destino de la cosecha.
INSERT INTO utilidad_opcion (id, categoria, valor, activo, orden, created_at, updated_at) VALUES
    (UUID(), 'DESTINO_COSECHA', 'Camión', TRUE, 1, NOW(6), NOW(6)),
    (UUID(), 'DESTINO_COSECHA', 'Silo', TRUE, 2, NOW(6), NOW(6)),
    (UUID(), 'DESTINO_COSECHA', 'Puerto', TRUE, 3, NOW(6), NOW(6));

-- Permisos RBAC del modulo Utilidades.
INSERT INTO permissions (id, name, description) VALUES
    (UUID(), 'read:utilidades', 'Ver utilidades'),
    (UUID(), 'write:utilidades', 'Gestionar utilidades');

-- Asignacion de permisos a super_admin y admin.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name IN ('super_admin', 'admin')
  AND p.name IN ('read:utilidades', 'write:utilidades');

-- Opcion de menu (idempotente).
INSERT INTO menu_options (id, menu_key, label, route, section, icon, display_order, active)
SELECT UUID(), 'utilidades', 'Utilidades', '/utilidades', 'Administracion', 'settings', 910, TRUE
WHERE NOT EXISTS (SELECT 1 FROM menu_options WHERE menu_key = 'utilidades');

-- Visibilidad del menu para super_admin y admin.
INSERT INTO role_menu_options (role_id, menu_option_id)
SELECT r.id, m.id
FROM roles r
JOIN menu_options m ON m.menu_key = 'utilidades'
WHERE r.name IN ('super_admin', 'admin')
  AND NOT EXISTS (
      SELECT 1 FROM role_menu_options e
      WHERE e.role_id = r.id AND e.menu_option_id = m.id
  );
