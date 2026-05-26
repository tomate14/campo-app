CREATE TABLE dietas_nutricionales (
    id                  VARCHAR(36)    NOT NULL DEFAULT (UUID()),
    nombre              VARCHAR(140)   NOT NULL,
    tipo_animal         VARCHAR(80)    NOT NULL,
    objetivo            VARCHAR(160)   NULL,
    materia_seca_kg     DECIMAL(10,2)  NULL,
    costo_diario        DECIMAL(12,2)  NULL,
    activa              BIT            NOT NULL DEFAULT b'1',
    observaciones       TEXT           NULL,
    created_at          DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at          DATETIME(6)    NULL,
    PRIMARY KEY (id),
    INDEX idx_dietas_tipo_activa (tipo_animal, activa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dieta_ingredientes (
    id                  VARCHAR(36)    NOT NULL DEFAULT (UUID()),
    dieta_id            VARCHAR(36)    NOT NULL,
    ingrediente         VARCHAR(140)   NOT NULL,
    proporcion_pct      DECIMAL(5,2)   NOT NULL,
    costo_kg            DECIMAL(12,2)  NULL,
    materia_seca_pct    DECIMAL(5,2)   NULL,
    created_at          DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at          DATETIME(6)    NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_dieta_ingredientes_dieta FOREIGN KEY (dieta_id) REFERENCES dietas_nutricionales(id),
    INDEX idx_dieta_ingredientes_dieta (dieta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE registros_alimentacion (
    id                  VARCHAR(36)    NOT NULL DEFAULT (UUID()),
    animal_id           VARCHAR(36)    NULL,
    dieta_id            VARCHAR(36)    NULL,
    fecha               DATE           NOT NULL,
    alimento            VARCHAR(140)   NOT NULL,
    cantidad_kg         DECIMAL(10,2)  NOT NULL,
    costo_total         DECIMAL(12,2)  NULL,
    potrero             VARCHAR(120)   NULL,
    responsable         VARCHAR(120)   NULL,
    observaciones       TEXT           NULL,
    created_at          DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at          DATETIME(6)    NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_registros_alimentacion_animal FOREIGN KEY (animal_id) REFERENCES animales(id),
    CONSTRAINT fk_registros_alimentacion_dieta FOREIGN KEY (dieta_id) REFERENCES dietas_nutricionales(id),
    INDEX idx_registros_alimentacion_fecha (fecha),
    INDEX idx_registros_alimentacion_animal_fecha (animal_id, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pesajes_animales (
    id                  VARCHAR(36)    NOT NULL DEFAULT (UUID()),
    animal_id           VARCHAR(36)    NOT NULL,
    fecha               DATE           NOT NULL,
    peso_kg             DECIMAL(10,2)  NOT NULL,
    condicion_corporal  DECIMAL(3,1)   NULL,
    metodo              VARCHAR(80)    NULL,
    responsable         VARCHAR(120)   NULL,
    observaciones       TEXT           NULL,
    created_at          DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at          DATETIME(6)    NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_pesajes_animales_animal FOREIGN KEY (animal_id) REFERENCES animales(id),
    INDEX idx_pesajes_animal_fecha (animal_id, fecha),
    INDEX idx_pesajes_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
