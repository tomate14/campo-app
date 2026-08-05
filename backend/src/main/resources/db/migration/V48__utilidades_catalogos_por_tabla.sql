-- Feature 71: el modulo Utilidades pasa a "una tabla por catalogo".
-- Cada catalogo configurable tiene su propia tabla con prefijo utilidad_ y el
-- mismo esquema (id, valor, activo, orden, timestamps, deleted_at, UNIQUE(valor)).
-- Feature 72: los campos que referencian estos catalogos guardan el ID de la fila
-- (no el string valor). Por eso los seeds usan ids fijos legibles (slugs estables)
-- en lugar de UUID(): asi las referencias de otras tablas apuntan a un id conocido
-- y renombrar una opcion no rompe las referencias. Se seedean los 6 catalogos
-- fresh (incluidos destino y tipo de perdida) y se elimina utilidad_opcion.

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

-- Feature 72: seed de destino de cosecha con ids fijos legibles.
INSERT INTO utilidad_destino_cosecha (id, valor, activo, orden, created_at, updated_at) VALUES
    ('dest-camion', 'Camión', TRUE, 1, NOW(6), NOW(6)),
    ('dest-silo',   'Silo',   TRUE, 2, NOW(6), NOW(6)),
    ('dest-puerto', 'Puerto', TRUE, 3, NOW(6), NOW(6));

-- Feature 72: seed de tipo de perdida de cosecha con ids fijos legibles.
INSERT INTO utilidad_tipo_perdida (id, valor, activo, orden, created_at, updated_at) VALUES
    ('tperd-cabezal', 'Cabezal', TRUE, 1, NOW(6), NOW(6)),
    ('tperd-cola',    'Cola',    TRUE, 2, NOW(6), NOW(6)),
    ('tperd-otro',    'Otro',    TRUE, 3, NOW(6), NOW(6));

-- Seed: cultivos base (ids fijos referenciados por lotes/detecciones).
INSERT INTO utilidad_cultivo (id, valor, activo, orden, created_at, updated_at) VALUES
    ('cult-soja',    'SOJA',    TRUE, 1, NOW(6), NOW(6)),
    ('cult-maiz',    'MAIZ',    TRUE, 2, NOW(6), NOW(6)),
    ('cult-trigo',   'TRIGO',   TRUE, 3, NOW(6), NOW(6)),
    ('cult-girasol', 'GIRASOL', TRUE, 4, NOW(6), NOW(6)),
    ('cult-sorgo',   'SORGO',   TRUE, 5, NOW(6), NOW(6)),
    ('cult-otro',    'OTRO',    TRUE, 6, NOW(6), NOW(6));

-- Seed: tipos de plaga base (referenciados por catalogo_plagas.tipo, ver V12/V17).
INSERT INTO utilidad_tipo_plaga (id, valor, activo, orden, created_at, updated_at) VALUES
    ('tpla-plaga',      'PLAGA',      TRUE, 1, NOW(6), NOW(6)),
    ('tpla-enfermedad', 'ENFERMEDAD', TRUE, 2, NOW(6), NOW(6)),
    ('tpla-maleza',     'MALEZA',     TRUE, 3, NOW(6), NOW(6));

-- Seed: tipos de insumo base (los que antes eran el enum TipoInsumoAgricola).
INSERT INTO utilidad_tipo_insumo (id, valor, activo, orden, created_at, updated_at) VALUES
    ('tins-semilla',       'SEMILLA',       TRUE, 1, NOW(6), NOW(6)),
    ('tins-fertilizante',  'FERTILIZANTE',  TRUE, 2, NOW(6), NOW(6)),
    ('tins-fitosanitario', 'FITOSANITARIO', TRUE, 3, NOW(6), NOW(6)),
    ('tins-herbicida',     'HERBICIDA',     TRUE, 4, NOW(6), NOW(6)),
    ('tins-fungicida',     'FUNGICIDA',     TRUE, 5, NOW(6), NOW(6)),
    ('tins-insecticida',   'INSECTICIDA',   TRUE, 6, NOW(6), NOW(6)),
    ('tins-coadyuvante',   'COADYUVANTE',   TRUE, 7, NOW(6), NOW(6)),
    ('tins-combustible',   'COMBUSTIBLE',   TRUE, 8, NOW(6), NOW(6)),
    ('tins-otro',          'OTRO',          TRUE, 9, NOW(6), NOW(6));

-- Seed: unidades de medida de insumo base (los que antes eran el enum UnidadMedidaInsumo).
INSERT INTO utilidad_unidad_insumo (id, valor, activo, orden, created_at, updated_at) VALUES
    ('unid-kg',    'KG',    TRUE, 1, NOW(6), NOW(6)),
    ('unid-l',     'L',     TRUE, 2, NOW(6), NOW(6)),
    ('unid-un',    'UN',    TRUE, 3, NOW(6), NOW(6)),
    ('unid-bolsa', 'BOLSA', TRUE, 4, NOW(6), NOW(6)),
    ('unid-dosis', 'DOSIS', TRUE, 5, NOW(6), NOW(6)),
    ('unid-tn',    'TN',    TRUE, 6, NOW(6), NOW(6));

-- La tabla generica ya no se usa: cada catalogo vive en su propia tabla.
DROP TABLE utilidad_opcion;
