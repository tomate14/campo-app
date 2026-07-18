-- Feature 39: cambio obligatorio de contraseña en primer login para usuarios generados desde operarios.
-- Agrega el flag must_change_password a users.
ALTER TABLE users ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill: todos los usuarios vinculados a un operario quedan marcados con cambio pendiente.
-- Es correcto marcar a todos porque nunca existió un mecanismo de cambio de contraseña:
-- todos siguen con la contraseña inicial (igual al username).
UPDATE users u
JOIN operarios o ON o.user_id = u.id
SET u.must_change_password = TRUE;
