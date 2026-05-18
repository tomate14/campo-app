-- =============================================================
-- Feature 26: Autenticación, Seguridad y Gestión de Tokens
-- =============================================================

CREATE TABLE users (
    id            CHAR(36)     NOT NULL DEFAULT (UUID()),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(255) NOT NULL,
    phone         VARCHAR(50),
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at    DATETIME(6)  NULL,
    PRIMARY KEY (id),
    INDEX idx_users_email (email),
    INDEX idx_users_active (active),
    INDEX idx_users_deleted_at (deleted_at)
);

CREATE TABLE roles (
    id          CHAR(36)     NOT NULL DEFAULT (UUID()),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at  DATETIME(6)  NULL,
    PRIMARY KEY (id),
    INDEX idx_roles_name (name)
);

CREATE TABLE permissions (
    id          CHAR(36)     NOT NULL DEFAULT (UUID()),
    name        VARCHAR(200) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at  DATETIME(6)  NULL,
    PRIMARY KEY (id),
    INDEX idx_permissions_name (name)
);

CREATE TABLE user_roles (
    user_id    CHAR(36)    NOT NULL,
    role_id    CHAR(36)    NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE role_permissions (
    role_id       CHAR(36)    NOT NULL,
    permission_id CHAR(36)    NOT NULL,
    created_at    DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id)       REFERENCES roles(id)       ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE refresh_tokens (
    id          CHAR(36)     NOT NULL DEFAULT (UUID()),
    user_id     CHAR(36)     NOT NULL,
    token_hash  VARCHAR(500) NOT NULL UNIQUE,
    expires_at  DATETIME(6)  NOT NULL,
    revoked_at  DATETIME(6)  NULL,
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    deleted_at  DATETIME(6)  NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_refresh_tokens_user_id (user_id),
    INDEX idx_refresh_tokens_expires_at (expires_at)
);

CREATE TABLE audit_logs (
    id          CHAR(36)     NOT NULL DEFAULT (UUID()),
    user_id     CHAR(36)     NULL,
    action      VARCHAR(100) NOT NULL,
    resource    VARCHAR(200) NOT NULL,
    resource_id VARCHAR(100) NULL,
    changes     JSON         NULL,
    ip_address  VARCHAR(50)  NULL,
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    INDEX idx_audit_logs_user_id (user_id),
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_created_at (created_at)
);

-- =============================================================
-- Seed: Roles base del sistema
-- =============================================================
INSERT INTO roles (id, name, description) VALUES
    (UUID(), 'super_admin', 'Acceso total al sistema'),
    (UUID(), 'admin',       'Gestión de sistema y usuarios'),
    (UUID(), 'jefe_campo',  'Gestión de operarios, lotes y operaciones'),
    (UUID(), 'operario',    'Ejecución de órdenes de trabajo asignadas'),
    (UUID(), 'contador',    'Gestión financiera y reportes económicos');

-- =============================================================
-- Seed: Permisos base por dominio
-- =============================================================
INSERT INTO permissions (id, name, description) VALUES
    -- Usuarios
    (UUID(), 'create:usuarios',    'Crear usuarios'),
    (UUID(), 'read:usuarios',      'Ver usuarios'),
    (UUID(), 'update:usuarios',    'Editar usuarios'),
    (UUID(), 'delete:usuarios',    'Eliminar usuarios'),
    -- Lotes
    (UUID(), 'create:lotes',       'Crear lotes'),
    (UUID(), 'read:lotes',         'Ver lotes'),
    (UUID(), 'update:lotes',       'Editar lotes'),
    (UUID(), 'delete:lotes',       'Eliminar lotes'),
    -- Órdenes de trabajo
    (UUID(), 'create:ordenes',     'Crear órdenes de trabajo'),
    (UUID(), 'read:ordenes',       'Ver órdenes de trabajo'),
    (UUID(), 'update:ordenes',     'Editar órdenes de trabajo'),
    (UUID(), 'delete:ordenes',     'Eliminar órdenes de trabajo'),
    -- Ganadería
    (UUID(), 'create:animales',    'Crear registros de animales'),
    (UUID(), 'read:animales',      'Ver animales'),
    (UUID(), 'update:animales',    'Editar animales'),
    (UUID(), 'delete:animales',    'Eliminar animales'),
    -- Maquinaria
    (UUID(), 'create:maquinaria',  'Crear registros de maquinaria'),
    (UUID(), 'read:maquinaria',    'Ver maquinaria'),
    (UUID(), 'update:maquinaria',  'Editar maquinaria'),
    (UUID(), 'delete:maquinaria',  'Eliminar maquinaria'),
    -- Inventario
    (UUID(), 'create:inventario',  'Crear movimientos de inventario'),
    (UUID(), 'read:inventario',    'Ver inventario'),
    (UUID(), 'update:inventario',  'Editar inventario'),
    (UUID(), 'delete:inventario',  'Eliminar del inventario'),
    -- Finanzas
    (UUID(), 'create:finanzas',    'Crear registros financieros'),
    (UUID(), 'read:finanzas',      'Ver información financiera'),
    (UUID(), 'update:finanzas',    'Editar registros financieros'),
    (UUID(), 'delete:finanzas',    'Eliminar registros financieros'),
    -- Geo / Tracking
    (UUID(), 'read:geo',           'Ver mapas y geolocalización'),
    (UUID(), 'read:tracking',      'Ver tracking de operarios'),
    -- Reportes
    (UUID(), 'read:reportes',      'Ver reportes'),
    -- Auditoría
    (UUID(), 'read:audit',         'Ver logs de auditoría');

-- =============================================================
-- Seed: Asignar permisos a roles
-- =============================================================

-- super_admin: todos los permisos
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'super_admin';

-- admin: todo excepto tracking de operarios
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin' AND p.name != 'read:tracking';

-- jefe_campo: lotes, órdenes, animales, maquinaria, inventario, geo, reportes
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'jefe_campo'
  AND p.name IN (
    'read:lotes','create:lotes','update:lotes',
    'read:ordenes','create:ordenes','update:ordenes','delete:ordenes',
    'read:animales','create:animales','update:animales',
    'read:maquinaria','create:maquinaria','update:maquinaria',
    'read:inventario','create:inventario','update:inventario',
    'read:geo','read:tracking',
    'read:reportes'
  );

-- operario: solo leer y actualizar sus órdenes + lotes + animales
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'operario'
  AND p.name IN (
    'read:ordenes','update:ordenes',
    'read:lotes',
    'read:animales','create:animales','update:animales',
    'read:maquinaria',
    'read:inventario','update:inventario'
  );

-- contador: finanzas, inventario y reportes
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'contador'
  AND p.name IN (
    'read:finanzas','create:finanzas','update:finanzas',
    'read:inventario',
    'read:reportes'
  );
