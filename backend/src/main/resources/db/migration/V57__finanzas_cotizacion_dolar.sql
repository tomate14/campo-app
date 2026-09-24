-- Feature 85: historial de cotizaciones del Dolar BNA (oficial).
-- Se guarda append: la cotizacion "actual" es la fila mas reciente por fecha/created_at.
-- Alimenta el toggle ARS/USD del dashboard operativo agricola (feature 84).
CREATE TABLE IF NOT EXISTS finanzas_cotizacion_dolar (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    compra DECIMAL(14,2) NOT NULL,
    venta DECIMAL(14,2) NOT NULL,
    fecha DATETIME NOT NULL,
    fuente VARCHAR(80) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    INDEX idx_cotizacion_dolar_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
