-- Soporte generico de idempotencia para sincronizacion offline mobile (feature 24).
-- Guarda la respuesta de cada operacion POST/PUT que llega con header Idempotency-Key
-- para poder repetirla sin re-ejecutar el handler cuando el cliente reintenta.
CREATE TABLE idempotency_keys (
    id            VARCHAR(64)  NOT NULL,
    user_id       VARCHAR(36)  NULL,
    method        VARCHAR(8)   NOT NULL,
    path          VARCHAR(255) NOT NULL,
    status        INT          NOT NULL,
    content_type  VARCHAR(100) NULL,
    response_body MEDIUMTEXT   NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_idempotency_created_at (created_at)
);
