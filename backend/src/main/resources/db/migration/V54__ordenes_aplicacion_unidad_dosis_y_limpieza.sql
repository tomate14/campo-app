-- Feature 58 (ajustes): la unidad de dosis pasa a salir del catalogo de Utilidades
-- y se eliminan carencia/reingreso/condiciones de la orden de aplicacion.

-- 1) Quitar columnas que ya no se usan en la orden.
ALTER TABLE ordenes_aplicacion
    DROP COLUMN periodo_carencia_dias,
    DROP COLUMN periodo_reingreso_horas,
    DROP COLUMN condiciones_climaticas;

-- 2) Catalogo configurable: unidad de dosis (mismo esquema que el resto de Utilidades).
CREATE TABLE utilidad_unidad_dosis (
    id VARCHAR(36) NOT NULL,
    valor VARCHAR(160) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    orden INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_utilidad_unidad_dosis_valor UNIQUE (valor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed de unidades de dosis base (agronomicas).
INSERT INTO utilidad_unidad_dosis (id, valor, activo, orden, created_at, updated_at) VALUES
    ('udosis-lha',  'l/ha',  TRUE, 1, NOW(6), NOW(6)),
    ('udosis-ccha', 'cc/ha', TRUE, 2, NOW(6), NOW(6)),
    ('udosis-kgha', 'kg/ha', TRUE, 3, NOW(6), NOW(6)),
    ('udosis-gha',  'g/ha',  TRUE, 4, NOW(6), NOW(6));
