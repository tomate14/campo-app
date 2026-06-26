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
    'Migracion desde ubicacion_actual legacy',
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

UPDATE animales
SET ubicacion_actual = NULL
WHERE deleted_at IS NULL
  AND ubicacion_actual IS NOT NULL;
