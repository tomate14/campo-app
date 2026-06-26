SET @drop_idx_animales_ubicacion := (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = 'animales'
        AND index_name = 'idx_animales_ubicacion'
    ),
    'ALTER TABLE animales DROP INDEX idx_animales_ubicacion',
    'SELECT 1'
  )
);

PREPARE stmt FROM @drop_idx_animales_ubicacion;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @drop_idx_animales_ubicacion_repair := (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = 'animales'
        AND index_name = 'idx_animales_ubicacion_repair'
    ),
    'ALTER TABLE animales DROP INDEX idx_animales_ubicacion_repair',
    'SELECT 1'
  )
);

PREPARE stmt FROM @drop_idx_animales_ubicacion_repair;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @drop_col_ubicacion_actual := (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'animales'
        AND column_name = 'ubicacion_actual'
    ),
    'ALTER TABLE animales DROP COLUMN ubicacion_actual',
    'SELECT 1'
  )
);

PREPARE stmt FROM @drop_col_ubicacion_actual;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
