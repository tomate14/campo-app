ALTER TABLE stock_insumos_agricolas
    ADD COLUMN responsable_id VARCHAR(36) COLLATE utf8mb4_0900_ai_ci NULL AFTER deposito,
    ADD CONSTRAINT fk_stock_insumos_responsable
        FOREIGN KEY (responsable_id) REFERENCES operarios(id);

ALTER TABLE movimientos_insumos_agricolas
    ADD COLUMN responsable_id VARCHAR(36) COLLATE utf8mb4_0900_ai_ci NULL AFTER costo_unitario,
    ADD CONSTRAINT fk_movimientos_insumos_responsable
        FOREIGN KEY (responsable_id) REFERENCES operarios(id);

UPDATE movimientos_insumos_agricolas m
JOIN operarios o ON LOWER(TRIM(m.responsable)) COLLATE utf8mb4_unicode_ci = LOWER(TRIM(CONCAT(o.nombre, ' ', o.apellido))) COLLATE utf8mb4_unicode_ci
SET m.responsable_id = o.id
WHERE m.responsable IS NOT NULL
  AND m.responsable <> ''
  AND m.responsable_id IS NULL;
