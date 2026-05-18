-- =============================================================
-- Feature 01: Agricultura — Gestión de Lotes
-- Extiende la tabla lotes con polígono GeoJSON, agrega
-- tablas para análisis de suelo e historial de cultivos.
-- =============================================================

-- Polígono geoespacial almacenado como GeoJSON (JSON nativo MySQL)
ALTER TABLE lotes
    ADD COLUMN poligono JSON NULL COMMENT 'Límites del lote en formato GeoJSON Polygon';

-- =============================================================
-- Análisis de suelo por lote
-- =============================================================
CREATE TABLE propiedades_suelo (
    id                       CHAR(36)      NOT NULL DEFAULT (UUID()),
    lote_id                  CHAR(36)      NOT NULL,
    fecha                    DATE          NOT NULL COMMENT 'Fecha del análisis',
    ph                       DECIMAL(4,2)  NULL     COMMENT 'pH del suelo (0–14)',
    nitrogeno_kg_ha          DECIMAL(8,2)  NULL     COMMENT 'Nitrógeno disponible kg/ha',
    fosforo_kg_ha            DECIMAL(8,2)  NULL     COMMENT 'Fósforo disponible kg/ha',
    potasio_kg_ha            DECIMAL(8,2)  NULL     COMMENT 'Potasio disponible kg/ha',
    materia_organica_pct     DECIMAL(5,2)  NULL     COMMENT '% de materia orgánica',
    conductividad_electrica  DECIMAL(6,3)  NULL     COMMENT 'CE en dS/m',
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

-- =============================================================
-- Historial de cultivos por lote (trazabilidad rotación)
-- =============================================================
CREATE TABLE historico_cultivos (
    id                  CHAR(36)      NOT NULL DEFAULT (UUID()),
    lote_id             CHAR(36)      NOT NULL,
    cultivo             VARCHAR(50)   NOT NULL,
    temporada           VARCHAR(20)   NOT NULL,
    fecha_siembra       DATE          NULL,
    fecha_cosecha       DATE          NULL,
    rendimiento_kg_ha   DECIMAL(10,2) NULL     COMMENT 'Rendimiento real obtenido',
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

-- =============================================================
-- Permisos para gestión avanzada de lotes
-- =============================================================
INSERT INTO permissions (id, name, description) VALUES
    (UUID(), 'read:suelo',    'Ver análisis de suelo'),
    (UUID(), 'create:suelo',  'Registrar análisis de suelo'),
    (UUID(), 'update:suelo',  'Editar análisis de suelo'),
    (UUID(), 'delete:suelo',  'Eliminar análisis de suelo'),
    (UUID(), 'read:historial',   'Ver historial de cultivos'),
    (UUID(), 'create:historial', 'Registrar historial de cultivos'),
    (UUID(), 'update:historial', 'Editar historial de cultivos'),
    (UUID(), 'delete:historial', 'Eliminar historial de cultivos');

-- jefe_campo: lectura y escritura de suelo e historial
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'jefe_campo'
  AND p.name IN ('read:suelo','create:suelo','update:suelo',
                 'read:historial','create:historial','update:historial');

-- operario: solo lectura
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'operario'
  AND p.name IN ('read:suelo','read:historial');

-- admin: permisos completos
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin'
  AND p.name IN ('read:suelo','create:suelo','update:suelo','delete:suelo',
                 'read:historial','create:historial','update:historial','delete:historial');
