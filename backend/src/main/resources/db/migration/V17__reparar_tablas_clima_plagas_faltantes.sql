CREATE TABLE IF NOT EXISTS dato_clima (
    id                 VARCHAR(36) NOT NULL DEFAULT (UUID()),
    lote_id            VARCHAR(36) NOT NULL,
    timestamp_utc      DATETIME(6) NOT NULL,
    temperatura        DECIMAL(5,2) NULL,
    sensacion_termica  DECIMAL(5,2) NULL,
    temp_min           DECIMAL(5,2) NULL,
    temp_max           DECIMAL(5,2) NULL,
    humedad_pct        INT NULL,
    presion_hpa        INT NULL,
    velocidad_viento   DECIMAL(6,2) NULL,
    direccion_viento   INT NULL,
    descripcion        VARCHAR(100) NULL,
    icono_codigo       VARCHAR(40) NULL,
    precipitaciones_mm DECIMAL(6,2) NULL,
    nubosidad_pct      INT NULL,
    condicion_codigo   INT NULL,
    nombre_localidad   VARCHAR(100) NULL,
    created_at         DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at         DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at         DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_dato_clima_lote_repair FOREIGN KEY (lote_id) REFERENCES lotes(id),
    INDEX idx_dato_clima_lote_ts_repair (lote_id, timestamp_utc)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alertas_clima (
    id           VARCHAR(36) NOT NULL DEFAULT (UUID()),
    lote_id      VARCHAR(36) NOT NULL,
    tipo_alerta  VARCHAR(20) NOT NULL,
    severidad    VARCHAR(10) NOT NULL,
    mensaje      VARCHAR(500) NOT NULL,
    valor_medido DECIMAL(8,2) NULL,
    activa       BOOLEAN NOT NULL DEFAULT TRUE,
    leida        BOOLEAN NOT NULL DEFAULT FALSE,
    fecha        DATETIME(6) NOT NULL,
    created_at   DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at   DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at   DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_alerta_clima_lote_repair FOREIGN KEY (lote_id) REFERENCES lotes(id),
    INDEX idx_alerta_clima_lote_activa_repair (lote_id, activa, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS clima_precipitacion_diaria (
    id               VARCHAR(36) NOT NULL DEFAULT (UUID()),
    lote_id          VARCHAR(36) NOT NULL,
    fecha            DATE NOT NULL,
    precipitacion_mm DECIMAL(8,2) NOT NULL DEFAULT 0,
    fuente           VARCHAR(40) NOT NULL DEFAULT 'Open-Meteo',
    created_at       DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at       DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at       DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_clima_precipitacion_diaria_lote_repair FOREIGN KEY (lote_id) REFERENCES lotes(id),
    UNIQUE KEY uk_clima_precipitacion_lote_fecha_repair (lote_id, fecha),
    INDEX idx_clima_precipitacion_lote_fecha_repair (lote_id, fecha),
    INDEX idx_clima_precipitacion_deleted_at_repair (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS catalogo_plagas (
    id                 VARCHAR(36) NOT NULL,
    nombre_comun      VARCHAR(160) NOT NULL,
    nombre_cientifico VARCHAR(180) NULL,
    tipo               VARCHAR(40) NOT NULL,
    cultivos_afectados VARCHAR(400) NULL,
    descripcion        TEXT NULL,
    sintomas           TEXT NULL,
    umbral_accion      VARCHAR(260) NULL,
    activo             BIT NOT NULL DEFAULT b'1',
    created_at         DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at         DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at         DATETIME(6) NULL,
    PRIMARY KEY (id),
    INDEX idx_catalogo_plagas_tipo_repair (tipo),
    INDEX idx_catalogo_plagas_activo_repair (activo),
    INDEX idx_catalogo_plagas_deleted_at_repair (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS detecciones_plaga (
    id                     VARCHAR(36) NOT NULL,
    lote_id                VARCHAR(36) NOT NULL,
    catalogo_plaga_id      VARCHAR(36) NOT NULL,
    fecha_deteccion        DATETIME(6) NOT NULL,
    cultivo                VARCHAR(80) NULL,
    severidad              VARCHAR(40) NOT NULL,
    area_afectada_ha       DECIMAL(12,2) NULL,
    porcentaje_afectado    DECIMAL(6,2) NULL,
    estado                 VARCHAR(40) NOT NULL,
    latitud                DECIMAL(10,7) NULL,
    longitud               DECIMAL(10,7) NULL,
    precision_metros       DECIMAL(10,2) NULL,
    origen_geolocalizacion VARCHAR(40) NOT NULL DEFAULT 'MANUAL',
    foto_url               VARCHAR(500) NULL,
    foto_nombre            VARCHAR(240) NULL,
    foto_content_type      VARCHAR(120) NULL,
    foto_tamanio_bytes     BIGINT NULL,
    descripcion            TEXT NULL,
    responsable            VARCHAR(180) NULL,
    created_at             DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at             DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at             DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_deteccion_plaga_lote_repair FOREIGN KEY (lote_id) REFERENCES lotes(id),
    CONSTRAINT fk_deteccion_plaga_catalogo_repair FOREIGN KEY (catalogo_plaga_id) REFERENCES catalogo_plagas(id),
    INDEX idx_deteccion_plaga_lote_repair (lote_id),
    INDEX idx_deteccion_plaga_catalogo_repair (catalogo_plaga_id),
    INDEX idx_deteccion_plaga_estado_repair (estado),
    INDEX idx_deteccion_plaga_severidad_repair (severidad),
    INDEX idx_deteccion_plaga_fecha_repair (fecha_deteccion),
    INDEX idx_deteccion_plaga_deleted_at_repair (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS aplicaciones_fitosanitarias (
    id                     VARCHAR(36) NOT NULL,
    deteccion_id           VARCHAR(36) NOT NULL,
    lote_id                VARCHAR(36) NOT NULL,
    fecha_aplicacion       DATETIME(6) NOT NULL,
    producto               VARCHAR(180) NOT NULL,
    principio_activo       VARCHAR(180) NULL,
    dosis                  DECIMAL(12,2) NOT NULL,
    unidad_dosis           VARCHAR(40) NOT NULL,
    volumen_caldo_l_ha     DECIMAL(12,2) NULL,
    superficie_tratada_ha  DECIMAL(12,2) NULL,
    periodo_carencia_dias  INT NULL,
    periodo_reingreso_horas INT NULL,
    fecha_reingreso_seguro DATETIME(6) NULL,
    fecha_cosecha_segura   DATE NULL,
    maquinaria_id          VARCHAR(36) NULL,
    operario_responsable   VARCHAR(180) NOT NULL,
    condiciones_climaticas VARCHAR(260) NULL,
    observaciones          TEXT NULL,
    created_at             DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at             DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at             DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_aplicacion_fito_deteccion_repair FOREIGN KEY (deteccion_id) REFERENCES detecciones_plaga(id),
    CONSTRAINT fk_aplicacion_fito_lote_repair FOREIGN KEY (lote_id) REFERENCES lotes(id),
    INDEX idx_aplicacion_fito_deteccion_repair (deteccion_id),
    INDEX idx_aplicacion_fito_lote_repair (lote_id),
    INDEX idx_aplicacion_fito_fecha_repair (fecha_aplicacion),
    INDEX idx_aplicacion_fito_deleted_at_repair (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Feature 72: catalogo_plagas.tipo guarda el id fijo del catalogo utilidad_tipo_plaga (no el string).
INSERT INTO catalogo_plagas (id, nombre_comun, nombre_cientifico, tipo, cultivos_afectados, descripcion, sintomas, umbral_accion, activo)
SELECT UUID(), 'Oruga cogollera', 'Spodoptera frugiperda', 'tpla-plaga', 'cult-maiz,cult-sorgo', 'Lepidoptero de alto impacto en cultivos estivales.', 'Perforaciones en hojas y dano en cogollo.', 'Monitorear desde V2; intervenir con dano activo en cogollo.', b'1'
WHERE NOT EXISTS (SELECT 1 FROM catalogo_plagas WHERE nombre_comun = 'Oruga cogollera');

INSERT INTO catalogo_plagas (id, nombre_comun, nombre_cientifico, tipo, cultivos_afectados, descripcion, sintomas, umbral_accion, activo)
SELECT UUID(), 'Roya asiatica', 'Phakopsora pachyrhizi', 'tpla-enfermedad', 'cult-soja', 'Enfermedad foliar con alto potencial de perdida.', 'Pustulas y amarillamiento foliar.', 'Aplicar ante primeras pustulas y condiciones predisponentes.', b'1'
WHERE NOT EXISTS (SELECT 1 FROM catalogo_plagas WHERE nombre_comun = 'Roya asiatica');

INSERT INTO catalogo_plagas (id, nombre_comun, nombre_cientifico, tipo, cultivos_afectados, descripcion, sintomas, umbral_accion, activo)
SELECT UUID(), 'Yuyo colorado', 'Amaranthus quitensis', 'tpla-maleza', 'cult-soja,cult-maiz,cult-girasol', 'Maleza competitiva con resistencia frecuente.', 'Emergencia escalonada y alta competencia.', 'Control temprano antes de 10 cm.', b'1'
WHERE NOT EXISTS (SELECT 1 FROM catalogo_plagas WHERE nombre_comun = 'Yuyo colorado');
