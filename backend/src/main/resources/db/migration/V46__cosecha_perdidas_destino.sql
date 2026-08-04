-- Feature 60: perdidas de cosecha y destino del dia sobre el registro de cosecha.
ALTER TABLE registros_cosecha
    ADD COLUMN area_real_cosechada_pct DECIMAL(5,2) NULL,
    ADD COLUMN hectareas_cosechadas DECIMAL(10,2) NULL,
    ADD COLUMN perdida_kg_ha DECIMAL(10,2) NULL,
    ADD COLUMN granos_perdidos_kg DECIMAL(12,2) NULL,
    -- Hibernate (MySQL) mapea @Enumerated(STRING) a un ENUM nativo (igual que calidad_grano)
    ADD COLUMN tipo_perdida ENUM('CABEZAL','COLA','OTRO') NULL,
    ADD COLUMN destino VARCHAR(160) NULL,
    ADD COLUMN destino_cantidad_tn DECIMAL(10,2) NULL;
