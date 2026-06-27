CREATE TABLE insumos_agricolas (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    codigo VARCHAR(80) NOT NULL,
    nombre VARCHAR(160) NOT NULL,
    tipo VARCHAR(40) NOT NULL,
    marca VARCHAR(120) NULL,
    presentacion VARCHAR(120) NULL,
    unidad_medida VARCHAR(30) NOT NULL,
    principio_activo VARCHAR(180) NULL,
    proveedor VARCHAR(160) NULL,
    origen VARCHAR(160) NULL,
    descripcion TEXT NULL,
    precio_unitario DECIMAL(14,2) NULL,
    stock_minimo DECIMAL(14,3) NOT NULL DEFAULT 0,
    stock_maximo DECIMAL(14,3) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_insumos_agricolas_codigo (codigo),
    INDEX idx_insumos_agricolas_tipo (tipo),
    INDEX idx_insumos_agricolas_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE stock_insumos_agricolas (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    insumo_id VARCHAR(36) NOT NULL,
    lote_stock VARCHAR(120) NULL,
    cantidad_disponible DECIMAL(14,3) NOT NULL DEFAULT 0,
    fecha_vencimiento DATE NULL,
    ubicacion_deposito VARCHAR(160) NULL,
    deposito VARCHAR(120) NULL,
    observaciones TEXT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_stock_insumos_insumo FOREIGN KEY (insumo_id) REFERENCES insumos_agricolas(id),
    INDEX idx_stock_insumos_insumo (insumo_id),
    INDEX idx_stock_insumos_vencimiento (fecha_vencimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE movimientos_insumos_agricolas (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    insumo_id VARCHAR(36) NOT NULL,
    stock_id VARCHAR(36) NULL,
    lote_id VARCHAR(36) NULL,
    fecha DATETIME(6) NOT NULL,
    tipo_movimiento VARCHAR(30) NOT NULL,
    cantidad DECIMAL(14,3) NOT NULL,
    costo_unitario DECIMAL(14,2) NULL,
    responsable VARCHAR(160) NULL,
    tarea_referencia VARCHAR(180) NULL,
    proveedor VARCHAR(160) NULL,
    origen VARCHAR(160) NULL,
    destino VARCHAR(160) NULL,
    observaciones TEXT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_mov_insumos_insumo FOREIGN KEY (insumo_id) REFERENCES insumos_agricolas(id),
    CONSTRAINT fk_mov_insumos_stock FOREIGN KEY (stock_id) REFERENCES stock_insumos_agricolas(id),
    CONSTRAINT fk_mov_insumos_lote FOREIGN KEY (lote_id) REFERENCES lotes(id),
    INDEX idx_mov_insumos_insumo_fecha (insumo_id, fecha),
    INDEX idx_mov_insumos_lote (lote_id),
    INDEX idx_mov_insumos_tipo (tipo_movimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO menu_options (id, menu_key, label, route, section, icon, display_order)
SELECT UUID(), 'agricola-insumos', 'Insumos', '/agricola/insumos', 'Agricultura', 'package', 150
WHERE NOT EXISTS (SELECT 1 FROM menu_options WHERE menu_key = 'agricola-insumos');

INSERT IGNORE INTO role_menu_options (role_id, menu_option_id)
SELECT DISTINCT rmo.role_id, insumos.id
FROM role_menu_options rmo
JOIN menu_options lotes ON lotes.id = rmo.menu_option_id AND lotes.menu_key = 'agricola-lotes'
JOIN menu_options insumos ON insumos.menu_key = 'agricola-insumos';
