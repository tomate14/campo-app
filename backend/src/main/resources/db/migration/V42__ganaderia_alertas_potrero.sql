-- Feature 47: alertas georreferenciadas sobre potreros (campanita en el mapa).
-- gravedad reutiliza los 4 niveles de SeveridadPlaga: BAJA, MEDIA, ALTA, CRITICA.
CREATE TABLE alertas_potrero (
    id            VARCHAR(36)     NOT NULL DEFAULT (UUID()),
    potrero_id    VARCHAR(36)     NOT NULL,
    usuario_id    VARCHAR(36)     NOT NULL,
    fecha         DATE            NOT NULL,
    gravedad      VARCHAR(40)     NOT NULL,
    observacion   TEXT            NOT NULL,
    latitud       DECIMAL(10,7)   NULL,
    longitud      DECIMAL(10,7)   NULL,
    estado        VARCHAR(20)     NOT NULL DEFAULT 'ABIERTA',
    created_at    DATETIME(6)     DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6)     DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at    DATETIME(6)     NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_alertas_potrero_potrero FOREIGN KEY (potrero_id) REFERENCES potreros(id),
    INDEX idx_alertas_potrero_potrero (potrero_id),
    INDEX idx_alertas_potrero_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
