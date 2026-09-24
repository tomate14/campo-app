-- Feature 84: modelo de costos del dashboard operativo agricola.
-- 1) Vinculo N:N compra<->lote para prorratear el costo de comprobantes por hectarea.
-- 2) La orden de aplicacion referencia un insumo del catalogo (costo al validar).
-- 3) El movimiento de insumo referencia la orden que lo genero (idempotencia + trazabilidad).

-- Vinculo N:N entre compras a proveedores y lotes. El prorrateo del monto por
-- hectarea se calcula en tiempo de lectura, no se persiste.
CREATE TABLE finanzas_compra_lotes (
    compra_id VARCHAR(36) NOT NULL,
    lote_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (compra_id, lote_id),
    CONSTRAINT fk_compra_lotes_compra FOREIGN KEY (compra_id) REFERENCES finanzas_compras(id),
    CONSTRAINT fk_compra_lotes_lote FOREIGN KEY (lote_id) REFERENCES lotes(id),
    INDEX idx_compra_lotes_lote (lote_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insumo del catalogo aplicado por la orden. Nullable por compatibilidad con
-- ordenes existentes; requerido a nivel aplicacion para las ordenes nuevas.
ALTER TABLE ordenes_aplicacion
    ADD COLUMN insumo_id VARCHAR(36) NULL,
    ADD CONSTRAINT fk_orden_aplicacion_insumo FOREIGN KEY (insumo_id) REFERENCES insumos_agricolas(id);

CREATE INDEX idx_orden_aplicacion_insumo ON ordenes_aplicacion (insumo_id);

-- Orden que genero el movimiento (idempotencia: no duplicar el costo al re-validar).
ALTER TABLE movimientos_insumos_agricolas
    ADD COLUMN orden_aplicacion_id VARCHAR(36) NULL,
    ADD CONSTRAINT fk_movimiento_insumo_orden FOREIGN KEY (orden_aplicacion_id) REFERENCES ordenes_aplicacion(id);

CREATE INDEX idx_movimiento_insumo_orden ON movimientos_insumos_agricolas (orden_aplicacion_id);
