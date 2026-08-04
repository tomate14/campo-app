-- Feature 71: el modulo Utilidades pasa a "una tabla por catalogo".
-- Cada catalogo configurable tiene su propia tabla con prefijo utilidad_ y el
-- mismo esquema (id, valor, activo, orden, timestamps, deleted_at, UNIQUE(valor)).
-- Se migran los catalogos existentes (destino y tipo de perdida) desde la tabla
-- generica utilidad_opcion, se seedean los nuevos y se elimina utilidad_opcion.

-- 1) Catalogo: destino de la cosecha.
CREATE TABLE utilidad_destino_cosecha (
    id VARCHAR(36) NOT NULL,
    valor VARCHAR(160) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    orden INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_utilidad_destino_cosecha_valor UNIQUE (valor)
);

-- 2) Catalogo: tipo de perdida de cosecha.
CREATE TABLE utilidad_tipo_perdida (
    id VARCHAR(36) NOT NULL,
    valor VARCHAR(160) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    orden INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_utilidad_tipo_perdida_valor UNIQUE (valor)
);

-- 3) Catalogo: cultivo (alta de lote y deteccion de plaga).
CREATE TABLE utilidad_cultivo (
    id VARCHAR(36) NOT NULL,
    valor VARCHAR(160) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    orden INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_utilidad_cultivo_valor UNIQUE (valor)
);

-- 4) Catalogo: tipo de plaga (tipo del catalogo de plagas).
CREATE TABLE utilidad_tipo_plaga (
    id VARCHAR(36) NOT NULL,
    valor VARCHAR(160) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    orden INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_utilidad_tipo_plaga_valor UNIQUE (valor)
);

-- 5) Catalogo: tipo de insumo agricola.
CREATE TABLE utilidad_tipo_insumo (
    id VARCHAR(36) NOT NULL,
    valor VARCHAR(160) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    orden INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_utilidad_tipo_insumo_valor UNIQUE (valor)
);

-- 6) Catalogo: unidad de medida de insumo.
CREATE TABLE utilidad_unidad_insumo (
    id VARCHAR(36) NOT NULL,
    valor VARCHAR(160) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    orden INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_utilidad_unidad_insumo_valor UNIQUE (valor)
);

-- Migracion de datos existentes desde la tabla generica utilidad_opcion.
INSERT INTO utilidad_destino_cosecha (id, valor, activo, orden, created_at, updated_at, deleted_at)
SELECT id, valor, activo, orden, created_at, updated_at, deleted_at
FROM utilidad_opcion
WHERE categoria = 'DESTINO_COSECHA';

INSERT INTO utilidad_tipo_perdida (id, valor, activo, orden, created_at, updated_at, deleted_at)
SELECT id, valor, activo, orden, created_at, updated_at, deleted_at
FROM utilidad_opcion
WHERE categoria = 'TIPO_PERDIDA_COSECHA';

-- Seed: cultivos base.
INSERT INTO utilidad_cultivo (id, valor, activo, orden, created_at, updated_at) VALUES
    (UUID(), 'SOJA',    TRUE, 1, NOW(6), NOW(6)),
    (UUID(), 'MAIZ',    TRUE, 2, NOW(6), NOW(6)),
    (UUID(), 'TRIGO',   TRUE, 3, NOW(6), NOW(6)),
    (UUID(), 'GIRASOL', TRUE, 4, NOW(6), NOW(6)),
    (UUID(), 'SORGO',   TRUE, 5, NOW(6), NOW(6)),
    (UUID(), 'OTRO',    TRUE, 6, NOW(6), NOW(6));

-- Seed: tipos de plaga base (los que antes eran el enum TipoPlaga).
INSERT INTO utilidad_tipo_plaga (id, valor, activo, orden, created_at, updated_at) VALUES
    (UUID(), 'PLAGA',      TRUE, 1, NOW(6), NOW(6)),
    (UUID(), 'ENFERMEDAD', TRUE, 2, NOW(6), NOW(6)),
    (UUID(), 'MALEZA',     TRUE, 3, NOW(6), NOW(6));

-- Seed: tipos de insumo base (los que antes eran el enum TipoInsumoAgricola).
INSERT INTO utilidad_tipo_insumo (id, valor, activo, orden, created_at, updated_at) VALUES
    (UUID(), 'SEMILLA',      TRUE, 1, NOW(6), NOW(6)),
    (UUID(), 'FERTILIZANTE', TRUE, 2, NOW(6), NOW(6)),
    (UUID(), 'FITOSANITARIO', TRUE, 3, NOW(6), NOW(6)),
    (UUID(), 'HERBICIDA',    TRUE, 4, NOW(6), NOW(6)),
    (UUID(), 'FUNGICIDA',    TRUE, 5, NOW(6), NOW(6)),
    (UUID(), 'INSECTICIDA',  TRUE, 6, NOW(6), NOW(6)),
    (UUID(), 'COADYUVANTE',  TRUE, 7, NOW(6), NOW(6)),
    (UUID(), 'COMBUSTIBLE',  TRUE, 8, NOW(6), NOW(6)),
    (UUID(), 'OTRO',         TRUE, 9, NOW(6), NOW(6));

-- Seed: unidades de medida de insumo base (los que antes eran el enum UnidadMedidaInsumo).
INSERT INTO utilidad_unidad_insumo (id, valor, activo, orden, created_at, updated_at) VALUES
    (UUID(), 'KG',    TRUE, 1, NOW(6), NOW(6)),
    (UUID(), 'L',     TRUE, 2, NOW(6), NOW(6)),
    (UUID(), 'UN',    TRUE, 3, NOW(6), NOW(6)),
    (UUID(), 'BOLSA', TRUE, 4, NOW(6), NOW(6)),
    (UUID(), 'DOSIS', TRUE, 5, NOW(6), NOW(6)),
    (UUID(), 'TN',    TRUE, 6, NOW(6), NOW(6));

-- La tabla generica ya no se usa: cada catalogo vive en su propia tabla.
DROP TABLE utilidad_opcion;
