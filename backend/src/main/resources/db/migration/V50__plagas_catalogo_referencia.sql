-- Feature 73: catalogo de referencia de plagas por cultivo descargado desde GBIF.
-- A partir de un mapping curado cultivo->taxones, un scheduler y un endpoint manual
-- consultan GBIF por nombre cientifico, descargan la imagen (licencia Creative Commons)
-- al volumen de uploads y persisten aca el path + atribucion/licencia. Idempotente.

CREATE TABLE plaga_referencia (
    id VARCHAR(36) NOT NULL,
    cultivo_id VARCHAR(36) NOT NULL,                -- id de utilidad_cultivo (soft ref sin FK, estilo feature 72)
    nombre_comun VARCHAR(160) NOT NULL,
    nombre_cientifico VARCHAR(200) NOT NULL,
    tipo VARCHAR(40) NULL,                           -- id de TIPO_PLAGA (utilidad_tipo_plaga)
    path VARCHAR(400) NULL,                          -- path relativo dentro del uploads-dir (ej: plagas-referencia/uuid.jpg)
    fuente VARCHAR(60) NULL,                          -- origen del dato/imagen (ej: GBIF)
    gbif_usage_key BIGINT NULL,                       -- usageKey resuelto por species/match
    url_original VARCHAR(600) NULL,                   -- URL original de la imagen (identifier de GBIF)
    licencia VARCHAR(200) NULL,                        -- URL de la licencia Creative Commons
    atribucion VARCHAR(300) NULL,                      -- rightsHolder informado por GBIF
    activo BIT NOT NULL DEFAULT 1,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_plaga_referencia UNIQUE (cultivo_id, nombre_cientifico),
    INDEX idx_plaga_referencia_cultivo (cultivo_id),
    INDEX idx_plaga_referencia_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
