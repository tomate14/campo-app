ALTER TABLE pronosticos
    ADD COLUMN apparent_temp_max DECIMAL(5,2) NULL AFTER temp_min,
    ADD COLUMN apparent_temp_min DECIMAL(5,2) NULL AFTER apparent_temp_max,
    ADD COLUMN uv_index_max DECIMAL(5,2) NULL AFTER humedad_pct,
    ADD COLUMN direccion_viento_dominante INT NULL AFTER velocidad_viento;
