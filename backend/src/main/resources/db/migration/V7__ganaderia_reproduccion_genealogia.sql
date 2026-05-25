CREATE TABLE montas (
    id              VARCHAR(36)    NOT NULL DEFAULT (UUID()),
    vaca_id         VARCHAR(36)    NOT NULL,
    toro_id         VARCHAR(36)    NOT NULL,
    fecha           DATE           NOT NULL,
    resultado       VARCHAR(40)    NOT NULL DEFAULT 'PENDIENTE',
    observaciones   TEXT           NULL,
    created_at      DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at      DATETIME(6)    NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_montas_vaca FOREIGN KEY (vaca_id) REFERENCES animales(id),
    CONSTRAINT fk_montas_toro FOREIGN KEY (toro_id) REFERENCES animales(id),
    INDEX idx_montas_fecha (fecha),
    INDEX idx_montas_vaca (vaca_id, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inseminaciones (
    id                 VARCHAR(36)    NOT NULL DEFAULT (UUID()),
    vaca_id            VARCHAR(36)    NOT NULL,
    fecha              DATE           NOT NULL,
    genetica_usada     VARCHAR(180)   NOT NULL,
    tecnico            VARCHAR(120)   NULL,
    costo              DECIMAL(12,2)  NULL,
    resultado          VARCHAR(40)    NOT NULL DEFAULT 'PENDIENTE',
    observaciones      TEXT           NULL,
    created_at         DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6),
    updated_at         DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at         DATETIME(6)    NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_inseminaciones_vaca FOREIGN KEY (vaca_id) REFERENCES animales(id),
    INDEX idx_inseminaciones_fecha (fecha),
    INDEX idx_inseminaciones_vaca (vaca_id, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE controles_prenez (
    id                    VARCHAR(36)    NOT NULL DEFAULT (UUID()),
    vaca_id               VARCHAR(36)    NOT NULL,
    fecha_diagnostico     DATE           NOT NULL,
    estado                VARCHAR(40)    NOT NULL,
    fecha_estimada_parto  DATE           NULL,
    nivel_riesgo_parto    VARCHAR(40)    NOT NULL DEFAULT 'MEDIO',
    veterinario           VARCHAR(120)   NULL,
    observaciones         TEXT           NULL,
    created_at            DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6),
    updated_at            DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at            DATETIME(6)    NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_controles_prenez_vaca FOREIGN KEY (vaca_id) REFERENCES animales(id),
    INDEX idx_controles_prenez_fecha (fecha_diagnostico),
    INDEX idx_controles_prenez_vaca (vaca_id, fecha_diagnostico)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE partos (
    id                 VARCHAR(36)    NOT NULL DEFAULT (UUID()),
    madre_id           VARCHAR(36)    NOT NULL,
    ternero_id         VARCHAR(36)    NULL,
    fecha              DATE           NOT NULL,
    complicaciones     VARCHAR(180)   NULL,
    viabilidad_ternero VARCHAR(40)    NOT NULL DEFAULT 'VIABLE',
    observaciones      TEXT           NULL,
    created_at         DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6),
    updated_at         DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at         DATETIME(6)    NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_partos_madre FOREIGN KEY (madre_id) REFERENCES animales(id),
    CONSTRAINT fk_partos_ternero FOREIGN KEY (ternero_id) REFERENCES animales(id),
    INDEX idx_partos_fecha (fecha),
    INDEX idx_partos_madre (madre_id, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE indices_geneticos (
    id                    VARCHAR(36)    NOT NULL DEFAULT (UUID()),
    animal_id             VARCHAR(36)    NOT NULL,
    fecha_evaluacion      DATE           NOT NULL,
    epd                   DECIMAL(10,2)  NULL,
    dep                   DECIMAL(10,2)  NULL,
    indice_productivo     DECIMAL(10,2)  NULL,
    fuente                VARCHAR(120)   NULL,
    observaciones         TEXT           NULL,
    created_at            DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6),
    updated_at            DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at            DATETIME(6)    NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_indices_geneticos_animal FOREIGN KEY (animal_id) REFERENCES animales(id),
    INDEX idx_indices_geneticos_animal (animal_id, fecha_evaluacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
