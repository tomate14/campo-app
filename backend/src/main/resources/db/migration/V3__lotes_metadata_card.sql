ALTER TABLE lotes
    ADD COLUMN ph_minimo DECIMAL(4,2) NULL AFTER poligono,
    ADD COLUMN ph_maximo DECIMAL(4,2) NULL AFTER ph_minimo,
    ADD COLUMN fecha_siembra DATE NULL AFTER ph_maximo,
    ADD COLUMN fecha_cosecha_estimada DATE NULL AFTER fecha_siembra;
