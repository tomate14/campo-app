SET @column_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'controles_prenez'
      AND COLUMN_NAME = 'nivel_riesgo_parto'
);

SET @ddl := IF(
    @column_exists = 0,
    'ALTER TABLE controles_prenez ADD COLUMN nivel_riesgo_parto VARCHAR(40) NOT NULL DEFAULT ''MEDIO'' AFTER fecha_estimada_parto',
    'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
