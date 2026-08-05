-- Feature 54: enriquecer el catalogo de plagas.
-- Se agrega la zona tipica de aparicion y una tabla de imagenes propias
-- (guardadas en filesystem servido estatico, NO como BLOB en la base).

-- Zona geografica/agroecologica tipica donde suele aparecer la plaga.
ALTER TABLE catalogo_plagas
    ADD COLUMN zona_tipica VARCHAR(260) NULL AFTER umbral_accion;

-- Imagenes del item de catalogo. Solo se guarda el path relativo dentro del
-- uploads-dir (ej: plagas-catalogo/uuid.jpg); los bytes viven en filesystem.
CREATE TABLE catalogo_plaga_imagen (
    id VARCHAR(36) NOT NULL,
    catalogo_plaga_id VARCHAR(36) NOT NULL,
    path VARCHAR(400) NOT NULL,                    -- path relativo dentro del uploads-dir
    nombre VARCHAR(255) NULL,                       -- nombre original informado por el cliente
    content_type VARCHAR(100) NULL,
    tamanio_bytes BIGINT NULL,
    es_principal BIT NOT NULL DEFAULT b'0',         -- marca la imagen principal del item
    orden INT NOT NULL DEFAULT 0,                   -- orden de visualizacion
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_catalogo_plaga_imagen_catalogo FOREIGN KEY (catalogo_plaga_id) REFERENCES catalogo_plagas(id),
    INDEX idx_catalogo_plaga_imagen_catalogo (catalogo_plaga_id),
    INDEX idx_catalogo_plaga_imagen_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
