CREATE TABLE animales_potreros (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    animal_id VARCHAR(36) NOT NULL,
    potrero_id VARCHAR(36) NOT NULL,
    fecha_desde DATETIME(6) NOT NULL,
    fecha_hasta DATETIME(6) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    motivo VARCHAR(180) NULL,
    responsable VARCHAR(120) NULL,
    movimiento_id VARCHAR(36) NULL,
    observaciones TEXT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    CONSTRAINT fk_animales_potreros_animal FOREIGN KEY (animal_id) REFERENCES animales(id),
    CONSTRAINT fk_animales_potreros_potrero FOREIGN KEY (potrero_id) REFERENCES potreros(id),
    INDEX idx_animales_potreros_animal_activo (animal_id, activo),
    INDEX idx_animales_potreros_potrero_activo (potrero_id, activo),
    INDEX idx_animales_potreros_deleted_at (deleted_at)
);

ALTER TABLE movimientos_animal
    ADD COLUMN potrero_origen_id VARCHAR(36) NULL,
    ADD COLUMN potrero_destino_id VARCHAR(36) NULL,
    ADD CONSTRAINT fk_movimientos_animal_potrero_origen FOREIGN KEY (potrero_origen_id) REFERENCES potreros(id),
    ADD CONSTRAINT fk_movimientos_animal_potrero_destino FOREIGN KEY (potrero_destino_id) REFERENCES potreros(id);

ALTER TABLE registros_alimentacion
    ADD COLUMN potrero_id VARCHAR(36) NULL,
    ADD CONSTRAINT fk_registros_alimentacion_potrero FOREIGN KEY (potrero_id) REFERENCES potreros(id);

INSERT INTO animales_potreros (
    id,
    animal_id,
    potrero_id,
    fecha_desde,
    fecha_hasta,
    activo,
    motivo,
    responsable,
    movimiento_id,
    observaciones,
    created_at,
    updated_at,
    deleted_at
)
SELECT
    UUID(),
    a.id,
    p.id,
    COALESCE(a.created_at, NOW(6)),
    NULL,
    TRUE,
    'Migracion desde ubicacion_actual',
    NULL,
    NULL,
    CONCAT('Valor legacy: ', a.ubicacion_actual),
    NOW(6),
    NOW(6),
    NULL
FROM animales a
JOIN potreros p
  ON LOWER(TRIM(a.ubicacion_actual)) = LOWER(TRIM(p.nombre))
  OR LOWER(TRIM(a.ubicacion_actual)) = LOWER(CONCAT('potrero ', TRIM(p.nombre)))
WHERE a.deleted_at IS NULL
  AND a.ubicacion_actual IS NOT NULL
  AND TRIM(a.ubicacion_actual) <> ''
  AND NOT EXISTS (
      SELECT 1
      FROM animales_potreros ap
      WHERE ap.animal_id = a.id
        AND ap.activo = TRUE
        AND ap.deleted_at IS NULL
  );

UPDATE animales a
JOIN animales_potreros ap ON ap.animal_id = a.id AND ap.activo = TRUE AND ap.deleted_at IS NULL
JOIN potreros p ON p.id = ap.potrero_id
SET a.ubicacion_actual = p.nombre
WHERE a.deleted_at IS NULL;

UPDATE registros_alimentacion r
JOIN potreros p
  ON LOWER(TRIM(r.potrero)) = LOWER(TRIM(p.nombre))
  OR LOWER(TRIM(r.potrero)) = LOWER(CONCAT('potrero ', TRIM(p.nombre)))
SET r.potrero_id = p.id,
    r.potrero = p.nombre
WHERE r.deleted_at IS NULL
  AND r.potrero IS NOT NULL
  AND TRIM(r.potrero) <> '';
