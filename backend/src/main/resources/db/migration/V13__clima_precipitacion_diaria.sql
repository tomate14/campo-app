CREATE TABLE clima_precipitacion_diaria (
    id                VARCHAR(36)    NOT NULL DEFAULT (UUID()),
    lote_id           VARCHAR(36)    NOT NULL,
    fecha             DATE           NOT NULL,
    precipitacion_mm  DECIMAL(8,2)   NOT NULL DEFAULT 0,
    fuente            VARCHAR(40)    NOT NULL DEFAULT 'Open-Meteo',
    created_at        DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6),
    updated_at        DATETIME(6)    DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at        DATETIME(6)    NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_clima_precipitacion_diaria_lote FOREIGN KEY (lote_id) REFERENCES lotes(id),
    UNIQUE KEY uk_clima_precipitacion_lote_fecha (lote_id, fecha),
    INDEX idx_clima_precipitacion_lote_fecha (lote_id, fecha),
    INDEX idx_clima_precipitacion_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
