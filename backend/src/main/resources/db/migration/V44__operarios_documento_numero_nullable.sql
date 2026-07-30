-- Permite fichas de operario auto-provisionadas desde el registro de usuario.
-- Estas fichas no tienen documento cargado hasta que RRHH lo complete, por lo
-- que documento_numero pasa a NULL permitido. El indice UNIQUE
-- uk_operarios_documento se mantiene: MySQL admite multiples valores NULL en un
-- indice unico, asi que el alta manual (que sigue exigiendo documento en el
-- servicio) conserva la unicidad de documentos reales.
ALTER TABLE operarios MODIFY documento_numero VARCHAR(40) NULL;
