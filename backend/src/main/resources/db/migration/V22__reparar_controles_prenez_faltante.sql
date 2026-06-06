CREATE TABLE IF NOT EXISTS controles_prenez (
    id                   VARCHAR(36) NOT NULL DEFAULT (UUID()),
    vaca_id              VARCHAR(36) NOT NULL,
    fecha_diagnostico    DATE NOT NULL,
    estado               VARCHAR(40) NOT NULL,
    fecha_estimada_parto DATE NULL,
    nivel_riesgo_parto   VARCHAR(40) NOT NULL DEFAULT 'MEDIO',
    veterinario          VARCHAR(120) NULL,
    observaciones        TEXT NULL,
    created_at           DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at           DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at           DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_controles_prenez_vaca_repair FOREIGN KEY (vaca_id) REFERENCES animales(id),
    INDEX idx_controles_prenez_fecha_repair (fecha_diagnostico),
    INDEX idx_controles_prenez_vaca_repair (vaca_id, fecha_diagnostico)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
