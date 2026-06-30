ALTER TABLE insumos_agricolas
    ADD COLUMN proveedor_id VARCHAR(36) NULL AFTER proveedor;

ALTER TABLE insumos_agricolas
    ADD CONSTRAINT fk_insumos_proveedor_financiero
    FOREIGN KEY (proveedor_id) REFERENCES finanzas_proveedores(id);

UPDATE insumos_agricolas i
JOIN finanzas_proveedores p
  ON lower(trim(i.proveedor)) = lower(trim(p.razon_social))
SET i.proveedor_id = p.id
WHERE i.proveedor_id IS NULL
  AND i.proveedor IS NOT NULL
  AND i.proveedor <> '';
