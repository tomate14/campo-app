ALTER TABLE animales
    ADD COLUMN raza_id VARCHAR(36) NULL AFTER raza,
    ADD INDEX idx_animales_raza_id (raza_id);

UPDATE animales a
JOIN catalogo_razas_bovinas r
  ON LOWER(TRIM(a.raza)) = LOWER(TRIM(r.nombre))
  OR LOWER(REPLACE(TRIM(a.raza), ' ', '_')) = LOWER(TRIM(r.codigo))
SET a.raza_id = r.id
WHERE a.raza_id IS NULL;

ALTER TABLE animales
    ADD CONSTRAINT fk_animales_raza_bovina
    FOREIGN KEY (raza_id) REFERENCES catalogo_razas_bovinas(id);
