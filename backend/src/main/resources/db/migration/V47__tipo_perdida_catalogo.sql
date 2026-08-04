-- Feature 70: "tipo de perdida" de cosecha pasa a ser un catalogo configurable
-- del apartado Utilidades (categoria TIPO_PERDIDA_COSECHA), con alta desde el
-- boton "+". La columna deja de ser ENUM y pasa a VARCHAR para admitir nuevos
-- tipos dados de alta por el usuario.

-- Seed de los tipos base (los que antes eran el enum CABEZAL/COLA/OTRO).
INSERT INTO utilidad_opcion (id, categoria, valor, activo, orden, created_at, updated_at)
VALUES
    (UUID(), 'TIPO_PERDIDA_COSECHA', 'Cabezal', TRUE, 1, NOW(6), NOW(6)),
    (UUID(), 'TIPO_PERDIDA_COSECHA', 'Cola',    TRUE, 2, NOW(6), NOW(6)),
    (UUID(), 'TIPO_PERDIDA_COSECHA', 'Otro',    TRUE, 3, NOW(6), NOW(6));

-- La columna pasa de ENUM('CABEZAL','COLA','OTRO') a VARCHAR (valor del catalogo).
ALTER TABLE registros_cosecha MODIFY COLUMN tipo_perdida VARCHAR(160) NULL;
