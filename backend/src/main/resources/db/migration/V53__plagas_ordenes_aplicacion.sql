-- Feature 58: ordenes de aplicacion con flujo tercerizado (responsable -> operario)
-- + numeracion correlativa en tabla separada + opcion de menu.

-- Orden de aplicacion. Referencia lote y deteccion (necesaria para generar el registro
-- de aplicacion al aceptar). responsable_id/operario_id apuntan a operarios (por id).
CREATE TABLE ordenes_aplicacion (
    id VARCHAR(36) NOT NULL,
    lote_id VARCHAR(36) NOT NULL,
    deteccion_id VARCHAR(36) NOT NULL,
    fecha_aplicacion DATETIME(6) NOT NULL,
    producto VARCHAR(180) NOT NULL,
    principio_activo VARCHAR(180) NULL,
    dosis DECIMAL(12,2) NOT NULL,
    unidad_dosis VARCHAR(40) NOT NULL,
    volumen_caldo_l_ha DECIMAL(12,2) NULL,
    superficie_tratada_ha DECIMAL(12,2) NULL,
    periodo_carencia_dias INT NULL,
    periodo_reingreso_horas INT NULL,
    maquinaria_id VARCHAR(36) NULL,
    condiciones_climaticas VARCHAR(260) NULL,
    observaciones TEXT NULL,
    responsable_id VARCHAR(36) NOT NULL,
    operario_id VARCHAR(36) NOT NULL,
    estado VARCHAR(20) NOT NULL,
    motivo_rechazo TEXT NULL,
    aplicacion_id VARCHAR(36) NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_orden_aplicacion_lote FOREIGN KEY (lote_id) REFERENCES lotes(id),
    CONSTRAINT fk_orden_aplicacion_deteccion FOREIGN KEY (deteccion_id) REFERENCES detecciones_plaga(id),
    INDEX idx_orden_aplicacion_estado (estado),
    INDEX idx_orden_aplicacion_operario (operario_id),
    INDEX idx_orden_aplicacion_responsable (responsable_id),
    INDEX idx_orden_aplicacion_lote (lote_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Numeracion correlativa en tabla separada: el numero es AUTO_INCREMENT (arranca en 1).
CREATE TABLE orden_aplicacion_numero (
    numero BIGINT NOT NULL AUTO_INCREMENT,
    orden_aplicacion_id VARCHAR(36) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (numero),
    CONSTRAINT uk_orden_aplicacion_numero UNIQUE (orden_aplicacion_id),
    CONSTRAINT fk_orden_aplicacion_numero FOREIGN KEY (orden_aplicacion_id) REFERENCES ordenes_aplicacion(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Opcion de menu (idempotente); reutiliza los permisos read/create/update:lotes en los endpoints.
INSERT INTO menu_options (id, menu_key, label, route, section, icon, display_order)
SELECT UUID(), 'agricola-ordenes-aplicacion', 'Órdenes de aplicación', '/agricola/ordenes-aplicacion', 'Agricultura', 'clipboard-check', 155
WHERE NOT EXISTS (SELECT 1 FROM menu_options WHERE menu_key = 'agricola-ordenes-aplicacion');

-- Visibilidad del menu: los mismos roles que ven Lotes (agricola-lotes).
INSERT IGNORE INTO role_menu_options (role_id, menu_option_id)
SELECT DISTINCT rmo.role_id, ordenes.id
FROM role_menu_options rmo
JOIN menu_options lotes ON lotes.id = rmo.menu_option_id AND lotes.menu_key = 'agricola-lotes'
JOIN menu_options ordenes ON ordenes.menu_key = 'agricola-ordenes-aplicacion';
