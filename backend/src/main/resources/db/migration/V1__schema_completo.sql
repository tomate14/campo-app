-- =============================================================
-- Schema completo — Campo App
-- Auth · Agricultura · Suelo & Historial · Clima
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- TABLAS DE AUTENTICACIÓN
-- ─────────────────────────────────────────────────────────────

CREATE TABLE users (
    id            VARCHAR(36)     NOT NULL DEFAULT (UUID()),
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
    id          VARCHAR(36)     NOT NULL DEFAULT (UUID()),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at  DATETIME(6)  NULL,
    PRIMARY KEY (id),
    INDEX idx_roles_name (name)
);

CREATE TABLE permissions (
    id          VARCHAR(36)     NOT NULL DEFAULT (UUID()),
    name        VARCHAR(200) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at  DATETIME(6)  NULL,
    PRIMARY KEY (id),
    INDEX idx_permissions_name (name)
);

CREATE TABLE user_roles (
    user_id    VARCHAR(36)    NOT NULL,
    role_id    VARCHAR(36)    NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE role_permissions (
    role_id       VARCHAR(36)    NOT NULL,
    permission_id VARCHAR(36)    NOT NULL,
    created_at    DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id)       REFERENCES roles(id)       ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE refresh_tokens (
    id          VARCHAR(36)     NOT NULL DEFAULT (UUID()),
    user_id     VARCHAR(36)     NOT NULL,
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
    id          VARCHAR(36)     NOT NULL DEFAULT (UUID()),
    user_id     VARCHAR(36)     NULL,
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

-- ─────────────────────────────────────────────────────────────
-- TABLAS DE AGRICULTURA
-- ─────────────────────────────────────────────────────────────

CREATE TABLE lotes (
    id            VARCHAR(36)       NOT NULL DEFAULT (UUID()),
    nombre        VARCHAR(100)   NOT NULL,
    area          DECIMAL(10,2)  NOT NULL,
    cultivo       VARCHAR(50)    NOT NULL,
    latitud       DECIMAL(10,7)  NULL,
    longitud      DECIMAL(10,7)  NULL,
    temporada     VARCHAR(20)    NOT NULL,
    poligono      JSON           NULL,
    created_at    DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at    DATETIME(6)    NULL,
    PRIMARY KEY (id),
    INDEX idx_lotes_cultivo    (cultivo),
    INDEX idx_lotes_temporada  (temporada),
    INDEX idx_lotes_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE eventos_siembra (
    id                   VARCHAR(36)      NOT NULL DEFAULT (UUID()),
    lote_id              VARCHAR(36)      NOT NULL,
    tipo_evento          ENUM('SIEMBRA','MONITOREO_FENOLOGICO','ALERTA','TRATAMIENTO') NOT NULL,
    estado_fenologico    VARCHAR(20)   NULL,
    descripcion          TEXT          NULL,
    fecha                DATE          NOT NULL,
    created_at           DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at           DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at           DATETIME(6)   NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_evento_lote FOREIGN KEY (lote_id) REFERENCES lotes(id),
    INDEX idx_evento_lote       (lote_id),
    INDEX idx_evento_tipo       (tipo_evento),
    INDEX idx_evento_fecha      (fecha),
    INDEX idx_evento_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE registros_cosecha (
    id                  VARCHAR(36)      NOT NULL DEFAULT (UUID()),
    lote_id             VARCHAR(36)      NOT NULL,
    fecha               DATE          NOT NULL,
    rendimiento_kg_ha   DECIMAL(10,2) NOT NULL,
    toneladas_total     DECIMAL(10,2) NOT NULL,
    calidad_grano       ENUM('PREMIUM','ESTANDAR','DESCUENTO') NULL,
    humedad             DECIMAL(5,2)  NULL,
    observaciones       TEXT          NULL,
    created_at          DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at          DATETIME(6)   NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_cosecha_lote FOREIGN KEY (lote_id) REFERENCES lotes(id),
    INDEX idx_cosecha_lote       (lote_id),
    INDEX idx_cosecha_fecha      (fecha),
    INDEX idx_cosecha_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE propiedades_suelo (
    id                       VARCHAR(36)      NOT NULL DEFAULT (UUID()),
    lote_id                  VARCHAR(36)      NOT NULL,
    fecha                    DATE          NOT NULL,
    ph                       DECIMAL(4,2)  NULL,
    nitrogeno_kg_ha          DECIMAL(8,2)  NULL,
    fosforo_kg_ha            DECIMAL(8,2)  NULL,
    potasio_kg_ha            DECIMAL(8,2)  NULL,
    materia_organica_pct     DECIMAL(5,2)  NULL,
    conductividad_electrica  DECIMAL(6,3)  NULL,
    observaciones            TEXT          NULL,
    created_at               DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at               DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at               DATETIME(6)   NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_suelo_lote FOREIGN KEY (lote_id) REFERENCES lotes(id),
    INDEX idx_suelo_lote       (lote_id),
    INDEX idx_suelo_fecha      (fecha),
    INDEX idx_suelo_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE historico_cultivos (
    id                  VARCHAR(36)      NOT NULL DEFAULT (UUID()),
    lote_id             VARCHAR(36)      NOT NULL,
    cultivo             VARCHAR(50)   NOT NULL,
    temporada           VARCHAR(20)   NOT NULL,
    fecha_siembra       DATE          NULL,
    fecha_cosecha       DATE          NULL,
    rendimiento_kg_ha   DECIMAL(10,2) NULL,
    observaciones       TEXT          NULL,
    created_at          DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at          DATETIME(6)   NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_historico_lote FOREIGN KEY (lote_id) REFERENCES lotes(id),
    INDEX idx_historico_lote       (lote_id),
    INDEX idx_historico_temporada  (temporada),
    INDEX idx_historico_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- TABLAS DE CLIMA
-- ─────────────────────────────────────────────────────────────

CREATE TABLE dato_clima (
    id                VARCHAR(36)      NOT NULL DEFAULT (UUID()),
    lote_id           VARCHAR(36)      NOT NULL,
    timestamp_utc     DATETIME(6)   NOT NULL,
    temperatura       DECIMAL(5,2)  NULL,
    sensacion_termica DECIMAL(5,2)  NULL,
    temp_min          DECIMAL(5,2)  NULL,
    temp_max          DECIMAL(5,2)  NULL,
    humedad_pct       INT           NULL,
    presion_hpa       INT           NULL,
    velocidad_viento  DECIMAL(6,2)  NULL,
    direccion_viento  INT           NULL,
    descripcion       VARCHAR(100)  NULL,
    icono_codigo      VARCHAR(10)   NULL,
    precipitaciones_mm DECIMAL(6,2) NULL,
    nubosidad_pct     INT           NULL,
    condicion_codigo  INT           NULL,
    nombre_localidad  VARCHAR(100)  NULL,
    created_at        DATETIME(6)   DEFAULT CURRENT_TIMESTAMP(6),
    updated_at        DATETIME(6)   DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at        DATETIME(6)   NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_dato_clima_lote FOREIGN KEY (lote_id) REFERENCES lotes(id),
    INDEX idx_dato_clima_lote_ts (lote_id, timestamp_utc)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pronosticos (
    id                  VARCHAR(36)     NOT NULL DEFAULT (UUID()),
    lote_id             VARCHAR(36)     NOT NULL,
    fecha               DATE         NOT NULL,
    temp_max            DECIMAL(5,2) NULL,
    temp_min            DECIMAL(5,2) NULL,
    humedad_pct         INT          NULL,
    probabilidad_lluvia DECIMAL(5,2) NULL,
    precipitacion_mm    DECIMAL(6,2) NULL,
    descripcion         VARCHAR(100) NULL,
    icono_codigo        VARCHAR(10)  NULL,
    velocidad_viento    DECIMAL(6,2) NULL,
    condicion_codigo    INT          NULL,
    created_at          DATETIME(6)  DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6)  DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at          DATETIME(6)  NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_pronostico_lote FOREIGN KEY (lote_id) REFERENCES lotes(id),
    UNIQUE KEY uk_pronostico_lote_fecha (lote_id, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE alertas_clima (
    id            VARCHAR(36)      NOT NULL DEFAULT (UUID()),
    lote_id       VARCHAR(36)      NOT NULL,
    tipo_alerta   ENUM('HELADA','LLUVIA_EXCESIVA','SEQUIA','VIENTO_FUERTE','GRANIZO','TORMENTA') NOT NULL,
    severidad     ENUM('BAJA','MEDIA','ALTA','CRITICA') NOT NULL,
    mensaje       VARCHAR(500)  NOT NULL,
    valor_medido  DECIMAL(8,2)  NULL,
    activa        BOOLEAN       NOT NULL DEFAULT TRUE,
    leida         BOOLEAN       NOT NULL DEFAULT FALSE,
    fecha         DATETIME(6)   NOT NULL,
    created_at    DATETIME(6)   DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6)   DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at    DATETIME(6)   NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_alerta_clima_lote FOREIGN KEY (lote_id) REFERENCES lotes(id),
    INDEX idx_alerta_clima_lote_activa (lote_id, activa, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- SEED: Roles
-- ─────────────────────────────────────────────────────────────

INSERT INTO roles (id, name, description) VALUES
    (UUID(), 'super_admin', 'Acceso total al sistema'),
    (UUID(), 'admin',       'Gestión de sistema y usuarios'),
    (UUID(), 'jefe_campo',  'Gestión de operarios, lotes y operaciones'),
    (UUID(), 'operario',    'Ejecución de órdenes de trabajo asignadas'),
    (UUID(), 'contador',    'Gestión financiera y reportes económicos');

-- ─────────────────────────────────────────────────────────────
-- SEED: Permisos
-- ─────────────────────────────────────────────────────────────

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
    -- Siembra y cosecha
    (UUID(), 'create:siembra',     'Registrar eventos de siembra y monitoreo'),
    (UUID(), 'read:siembra',       'Ver lotes, siembras y monitoreo fenológico'),
    (UUID(), 'update:siembra',     'Editar eventos de siembra y monitoreo'),
    (UUID(), 'delete:siembra',     'Eliminar eventos de siembra'),
    (UUID(), 'create:cosecha',     'Registrar cosechas'),
    (UUID(), 'read:cosecha',       'Ver registros de cosecha'),
    (UUID(), 'update:cosecha',     'Editar registros de cosecha'),
    (UUID(), 'delete:cosecha',     'Eliminar registros de cosecha'),
    -- Suelo e historial
    (UUID(), 'read:suelo',         'Ver análisis de suelo'),
    (UUID(), 'create:suelo',       'Registrar análisis de suelo'),
    (UUID(), 'update:suelo',       'Editar análisis de suelo'),
    (UUID(), 'delete:suelo',       'Eliminar análisis de suelo'),
    (UUID(), 'read:historial',     'Ver historial de cultivos'),
    (UUID(), 'create:historial',   'Registrar historial de cultivos'),
    (UUID(), 'update:historial',   'Editar historial de cultivos'),
    (UUID(), 'delete:historial',   'Eliminar historial de cultivos'),
    -- Clima
    (UUID(), 'read:clima',         'Ver datos climáticos, pronósticos y alertas'),
    (UUID(), 'create:clima',       'Sincronizar datos climáticos manualmente'),
    (UUID(), 'update:clima',       'Marcar alertas climáticas como leídas'),
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
    -- Reportes y auditoría
    (UUID(), 'read:reportes',      'Ver reportes'),
    (UUID(), 'read:audit',         'Ver logs de auditoría');

-- ─────────────────────────────────────────────────────────────
-- SEED: Asignación de permisos a roles
-- ─────────────────────────────────────────────────────────────

-- super_admin: todos los permisos
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'super_admin';

-- admin: todo excepto tracking
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin' AND p.name != 'read:tracking';

-- jefe_campo
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'jefe_campo'
  AND p.name IN (
    'read:lotes','create:lotes','update:lotes',
    'read:ordenes','create:ordenes','update:ordenes','delete:ordenes',
    'read:animales','create:animales','update:animales',
    'read:maquinaria','create:maquinaria','update:maquinaria',
    'read:inventario','create:inventario','update:inventario',
    'create:siembra','read:siembra','update:siembra',
    'create:cosecha','read:cosecha','update:cosecha',
    'read:suelo','create:suelo','update:suelo',
    'read:historial','create:historial','update:historial',
    'read:clima','create:clima','update:clima',
    'read:geo','read:tracking','read:reportes'
  );

-- operario
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'operario'
  AND p.name IN (
    'read:ordenes','update:ordenes',
    'read:lotes',
    'read:animales','create:animales','update:animales',
    'read:maquinaria',
    'read:inventario','update:inventario',
    'read:siembra','create:siembra',
    'read:cosecha',
    'read:suelo','read:historial',
    'read:clima'
  );

-- contador
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'contador'
  AND p.name IN (
    'read:finanzas','create:finanzas','update:finanzas',
    'read:inventario',
    'read:reportes'
  );
