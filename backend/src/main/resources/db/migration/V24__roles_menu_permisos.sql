CREATE TABLE menu_options (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    menu_key VARCHAR(120) NOT NULL UNIQUE,
    label VARCHAR(160) NOT NULL,
    route VARCHAR(220) NOT NULL,
    section VARCHAR(80) NOT NULL,
    icon VARCHAR(80) NOT NULL,
    display_order INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    INDEX idx_menu_options_section_order (section, display_order),
    INDEX idx_menu_options_key (menu_key)
);

CREATE TABLE role_menu_options (
    role_id VARCHAR(36) NOT NULL,
    menu_option_id VARCHAR(36) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (role_id, menu_option_id),
    CONSTRAINT fk_role_menu_options_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_menu_options_option FOREIGN KEY (menu_option_id) REFERENCES menu_options(id) ON DELETE CASCADE
);

INSERT INTO menu_options (id, menu_key, label, route, section, icon, display_order) VALUES
    (UUID(), 'dashboard-agricola', 'Dashboard agricola', '/reportes/agricola', 'Dashboard', 'dashboard', 10),
    (UUID(), 'operaciones-calendario', 'Calendario', '/operaciones/calendario', 'Dashboard', 'calendar', 20),
    (UUID(), 'agricola-lotes', 'Lotes', '/agricola/lotes', 'Agricultura', 'leaf', 100),
    (UUID(), 'agricola-ciclo', 'Ciclo agricola', '/agricola/siembra', 'Agricultura', 'sprout', 110),
    (UUID(), 'agricola-analytics', 'Analytics', '/agricola/analytics', 'Agricultura', 'chart', 120),
    (UUID(), 'agricola-plagas', 'Plagas', '/agricola/plagas', 'Agricultura', 'bug', 130),
    (UUID(), 'clima', 'Clima', '/clima', 'Agricultura', 'cloud', 140),
    (UUID(), 'ganaderia-trazabilidad', 'Trazabilidad', '/ganaderia/trazabilidad', 'Ganaderia', 'cow', 200),
    (UUID(), 'ganaderia-sanidad', 'Sanidad', '/ganaderia/sanidad', 'Ganaderia', 'shield', 210),
    (UUID(), 'ganaderia-reproduccion', 'Reproduccion', '/ganaderia/reproduccion', 'Ganaderia', 'dna', 220),
    (UUID(), 'ganaderia-alimentacion', 'Alimentacion', '/ganaderia/alimentacion', 'Ganaderia', 'wheat', 230),
    (UUID(), 'ganaderia-potreros', 'Potreros', '/ganaderia/potreros', 'Ganaderia', 'map', 240),
    (UUID(), 'maquinaria-inventario', 'Inventario', '/maquinaria/inventario', 'Maquinaria', 'tractor', 300),
    (UUID(), 'maquinaria-mantenimiento', 'Mantenimiento', '/maquinaria/mantenimiento', 'Maquinaria', 'wrench', 310),
    (UUID(), 'operarios-gestion', 'Gestion de operarios', '/operarios/gestion', 'Operarios', 'users', 400),
    (UUID(), 'operarios-ordenes', 'Ordenes de trabajo', '/operarios/ordenes', 'Operarios', 'clipboard', 410),
    (UUID(), 'admin-roles-menu', 'Roles y menu', '/admin/roles-menu', 'Administracion', 'settings', 900);

-- Por defecto admin, super_admin y operario ven todas las opciones; luego se restringe desde la pantalla.
INSERT INTO role_menu_options (role_id, menu_option_id)
SELECT r.id, m.id
FROM roles r
CROSS JOIN menu_options m
WHERE r.name IN ('super_admin', 'admin', 'operario');

-- Jefe de campo conserva acceso operativo amplio, sin administracion.
INSERT INTO role_menu_options (role_id, menu_option_id)
SELECT r.id, m.id
FROM roles r
CROSS JOIN menu_options m
WHERE r.name = 'jefe_campo'
  AND m.menu_key <> 'admin-roles-menu';

-- Contador conserva dashboard, clima y reportes agricolas como vista ejecutiva minima.
INSERT INTO role_menu_options (role_id, menu_option_id)
SELECT r.id, m.id
FROM roles r
CROSS JOIN menu_options m
WHERE r.name = 'contador'
  AND m.menu_key IN ('dashboard-agricola', 'clima');
