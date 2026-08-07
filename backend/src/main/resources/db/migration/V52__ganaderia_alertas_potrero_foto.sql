-- Feature 79: foto opcional en alertas de potrero (aditivo, no requiere regenerar la base).
ALTER TABLE alertas_potrero
    ADD COLUMN foto_url VARCHAR(500) NULL,
    ADD COLUMN foto_nombre VARCHAR(255) NULL,
    ADD COLUMN foto_content_type VARCHAR(100) NULL,
    ADD COLUMN foto_tamanio_bytes BIGINT NULL;
