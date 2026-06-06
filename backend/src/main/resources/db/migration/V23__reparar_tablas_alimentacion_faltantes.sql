CREATE TABLE IF NOT EXISTS dietas_nutricionales (
    id              VARCHAR(36) NOT NULL DEFAULT (UUID()),
    nombre          VARCHAR(140) NOT NULL,
    tipo_animal     VARCHAR(80) NOT NULL,
    objetivo        VARCHAR(160) NULL,
    materia_seca_kg DECIMAL(10,2) NULL,
    costo_diario    DECIMAL(12,2) NULL,
    activa          BIT NOT NULL DEFAULT b'1',
    observaciones   TEXT NULL,
    created_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at      DATETIME(6) NULL,
    PRIMARY KEY (id),
    INDEX idx_dietas_tipo_activa_repair (tipo_animal, activa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dieta_ingredientes (
    id              VARCHAR(36) NOT NULL DEFAULT (UUID()),
    dieta_id        VARCHAR(36) NOT NULL,
    ingrediente     VARCHAR(140) NOT NULL,
    proporcion_pct  DECIMAL(5,2) NOT NULL,
    costo_kg        DECIMAL(12,2) NULL,
    materia_seca_pct DECIMAL(5,2) NULL,
    created_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at      DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_dieta_ingredientes_dieta_repair FOREIGN KEY (dieta_id) REFERENCES dietas_nutricionales(id),
    INDEX idx_dieta_ingredientes_dieta_repair (dieta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
