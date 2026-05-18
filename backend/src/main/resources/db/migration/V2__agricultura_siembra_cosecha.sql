-- =============================================================
-- Feature 00: Agricultura - Monitoreo de Siembra y Cosecha
-- =============================================================

CREATE TABLE lotes (
    id            CHAR(36)       NOT NULL DEFAULT (UUID()),
    nombre        VARCHAR(100)   NOT NULL,
    area          DECIMAL(10,2)  NOT NULL     COMMENT 'Superficie en hectáreas',
    cultivo       VARCHAR(50)    NOT NULL     COMMENT 'Tipo de cultivo: SOJA, MAIZ, TRIGO, GIRASOL, etc.',
    latitud       DECIMAL(10,7)  NULL,
    longitud      DECIMAL(10,7)  NULL,
    temporada     VARCHAR(20)    NOT NULL     COMMENT 'Ej: 2024/2025',
    created_at    DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at    DATETIME(6)    NULL,
    PRIMARY KEY (id),
    INDEX idx_lotes_cultivo   (cultivo),
    INDEX idx_lotes_temporada (temporada),
    INDEX idx_lotes_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE eventos_siembra (
    id                   CHAR(36)      NOT NULL DEFAULT (UUID()),
    lote_id              CHAR(36)      NOT NULL,
    tipo_evento          VARCHAR(30)   NOT NULL COMMENT 'SIEMBRA | MONITOREO_FENOLOGICO | ALERTA | TRATAMIENTO',
    estado_fenologico    VARCHAR(20)   NULL     COMMENT 'V4, V8, VE, R1, R3, R6, etc.',
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
    id                  CHAR(36)      NOT NULL DEFAULT (UUID()),
    lote_id             CHAR(36)      NOT NULL,
    fecha               DATE          NOT NULL,
    rendimiento_kg_ha   DECIMAL(10,2) NOT NULL COMMENT 'Rendimiento en kg/ha',
    toneladas_total     DECIMAL(10,2) NOT NULL COMMENT 'Total de toneladas cosechadas',
    calidad_grano       VARCHAR(20)   NULL     COMMENT 'PREMIUM | ESTANDAR | DESCUENTO',
    humedad             DECIMAL(5,2)  NULL     COMMENT 'Porcentaje de humedad del grano',
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

-- =============================================================
-- Permisos para agricultura (siembra y cosecha)
-- =============================================================
INSERT INTO permissions (id, name, description) VALUES
    (UUID(), 'create:siembra',   'Registrar eventos de siembra y monitoreo'),
    (UUID(), 'read:siembra',     'Ver lotes, siembras y monitoreo fenológico'),
    (UUID(), 'update:siembra',   'Editar eventos de siembra y monitoreo'),
    (UUID(), 'delete:siembra',   'Eliminar eventos de siembra'),
    (UUID(), 'create:cosecha',   'Registrar cosechas'),
    (UUID(), 'read:cosecha',     'Ver registros de cosecha'),
    (UUID(), 'update:cosecha',   'Editar registros de cosecha'),
    (UUID(), 'delete:cosecha',   'Eliminar registros de cosecha');

-- jefe_campo recibe permisos de siembra y cosecha
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'jefe_campo'
  AND p.name IN ('create:siembra','read:siembra','update:siembra',
                 'create:cosecha','read:cosecha','update:cosecha');

-- operario: solo leer siembra + crear/leer eventos (monitoreo en campo)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'operario'
  AND p.name IN ('read:siembra','create:siembra','read:cosecha');

-- admin: permisos completos de siembra y cosecha
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin'
  AND p.name IN ('create:siembra','read:siembra','update:siembra','delete:siembra',
                 'create:cosecha','read:cosecha','update:cosecha','delete:cosecha');
