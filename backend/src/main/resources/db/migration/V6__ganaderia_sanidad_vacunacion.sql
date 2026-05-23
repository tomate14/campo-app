CREATE TABLE vacunas_catalogo (
    id                  VARCHAR(36)    NOT NULL DEFAULT (UUID()),
    codigo              VARCHAR(60)    NOT NULL,
    nombre              VARCHAR(140)   NOT NULL,
    descripcion         TEXT           NULL,
    obligatoria         BIT            NOT NULL DEFAULT b'0',
    especie             VARCHAR(40)    NOT NULL DEFAULT 'BOVINA',
    frecuencia_dias     INT            NULL,
    edad_min_dias       INT            NULL,
    edad_max_dias       INT            NULL,
    dosis_recomendada   VARCHAR(80)    NULL,
    via_aplicacion      VARCHAR(80)    NULL,
    laboratorio         VARCHAR(120)   NULL,
    costo_referencia    DECIMAL(12,2)  NULL,
    stock_disponible    INT            NULL,
    activo              BIT            NOT NULL DEFAULT b'1',
    created_at          DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at          DATETIME(6)    NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_vacunas_catalogo_codigo UNIQUE (codigo),
    INDEX idx_vacunas_catalogo_nombre (nombre),
    INDEX idx_vacunas_catalogo_obligatoria (obligatoria, activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE aplicaciones_vacuna (
    id                  VARCHAR(36)    NOT NULL DEFAULT (UUID()),
    animal_id           VARCHAR(36)    NOT NULL,
    vacuna_id           VARCHAR(36)    NOT NULL,
    fecha_aplicacion    DATE           NOT NULL,
    proxima_dosis_fecha DATE           NULL,
    operario            VARCHAR(120)   NULL,
    lote_marca          VARCHAR(120)   NULL,
    costo_aplicado      DECIMAL(12,2)  NULL,
    observaciones       TEXT           NULL,
    created_at          DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at          DATETIME(6)    NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_aplicaciones_vacuna_animal FOREIGN KEY (animal_id) REFERENCES animales(id),
    CONSTRAINT fk_aplicaciones_vacuna_catalogo FOREIGN KEY (vacuna_id) REFERENCES vacunas_catalogo(id),
    INDEX idx_aplicaciones_vacuna_fecha (animal_id, fecha_aplicacion),
    INDEX idx_aplicaciones_vacuna_proxima (proxima_dosis_fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tratamientos_medicamento (
    id                  VARCHAR(36)    NOT NULL DEFAULT (UUID()),
    animal_id           VARCHAR(36)    NOT NULL,
    fecha_inicio        DATE           NOT NULL,
    fecha_fin           DATE           NULL,
    medicamento         VARCHAR(140)   NOT NULL,
    dosis               VARCHAR(80)    NULL,
    via_aplicacion      VARCHAR(80)    NULL,
    responsable         VARCHAR(120)   NULL,
    motivo              VARCHAR(180)   NULL,
    costo               DECIMAL(12,2)  NULL,
    observaciones       TEXT           NULL,
    created_at          DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at          DATETIME(6)    NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_tratamientos_animal FOREIGN KEY (animal_id) REFERENCES animales(id),
    INDEX idx_tratamientos_animal_inicio (animal_id, fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE diagnosticos_sanitarios (
    id                    VARCHAR(36)    NOT NULL DEFAULT (UUID()),
    animal_id             VARCHAR(36)    NOT NULL,
    fecha_diagnostico     DATE           NOT NULL,
    enfermedad            VARCHAR(160)   NOT NULL,
    severidad             VARCHAR(30)    NOT NULL DEFAULT 'MEDIA',
    estado                VARCHAR(30)    NOT NULL DEFAULT 'ABIERTO',
    veterinario           VARCHAR(120)   NULL,
    tratamiento_indicado  VARCHAR(180)   NULL,
    observaciones         TEXT           NULL,
    created_at            DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6),
    updated_at            DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at            DATETIME(6)    NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_diagnosticos_animal FOREIGN KEY (animal_id) REFERENCES animales(id),
    INDEX idx_diagnosticos_animal_fecha (animal_id, fecha_diagnostico),
    INDEX idx_diagnosticos_estado (estado, severidad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO vacunas_catalogo (
    id, codigo, nombre, descripcion, obligatoria, especie, frecuencia_dias, edad_min_dias, dosis_recomendada,
    via_aplicacion, laboratorio, costo_referencia, stock_disponible, activo
) VALUES
    (UUID(), 'AFTOSA', 'Vacuna Aftosa', 'Cobertura obligatoria para rodeo bovino.', b'1', 'BOVINA', 180, 60, '5 ml', 'Subcutanea', 'Biogenesis Bago', 1850.00, 120, b'1'),
    (UUID(), 'BRUCELOSIS', 'Vacuna Brucelosis', 'Aplicacion recomendada en hembras jovenes.', b'1', 'BOVINA', 365, 90, '2 ml', 'Subcutanea', 'CDV', 1320.00, 80, b'1'),
    (UUID(), 'CLOSTRIDIAL', 'Vacuna Clostridial', 'Prevencion de enfermedades clostridiales.', b'0', 'BOVINA', 365, 120, '5 ml', 'Intramuscular', 'Vetanco', 980.00, 65, b'1');
