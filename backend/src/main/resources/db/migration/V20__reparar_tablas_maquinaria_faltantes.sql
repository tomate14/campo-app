CREATE TABLE IF NOT EXISTS asignaciones_maquinaria (
    id             VARCHAR(36) NOT NULL,
    maquinaria_id  VARCHAR(36) NOT NULL,
    operario       VARCHAR(180) NOT NULL,
    fecha_inicio   DATETIME(6) NOT NULL,
    fecha_fin      DATETIME(6) NULL,
    actividad      VARCHAR(180) NULL,
    ubicacion      VARCHAR(180) NULL,
    observaciones  TEXT NULL,
    created_at     DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at     DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at     DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_asignacion_maquinaria_repair FOREIGN KEY (maquinaria_id) REFERENCES maquinaria(id),
    INDEX idx_asignacion_maquinaria_repair (maquinaria_id),
    INDEX idx_asignacion_fecha_repair (fecha_inicio),
    INDEX idx_asignacion_deleted_at_repair (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS documentos_maquinaria (
    id             VARCHAR(36) NOT NULL,
    maquinaria_id  VARCHAR(36) NOT NULL,
    tipo_documento VARCHAR(100) NOT NULL,
    numero         VARCHAR(120) NULL,
    vencimiento    DATE NULL,
    url            VARCHAR(500) NULL,
    observaciones  TEXT NULL,
    created_at     DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at     DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at     DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_documento_maquinaria_repair FOREIGN KEY (maquinaria_id) REFERENCES maquinaria(id),
    INDEX idx_documento_maquinaria_repair (maquinaria_id),
    INDEX idx_documento_vencimiento_repair (vencimiento),
    INDEX idx_documento_deleted_at_repair (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
