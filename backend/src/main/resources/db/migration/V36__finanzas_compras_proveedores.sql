CREATE TABLE IF NOT EXISTS finanzas_proveedores (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    razon_social VARCHAR(180) NOT NULL,
    cuit VARCHAR(20) NOT NULL,
    condicion_fiscal VARCHAR(40) NOT NULL,
    email VARCHAR(180) NULL,
    telefono VARCHAR(60) NULL,
    direccion VARCHAR(220) NULL,
    categoria VARCHAR(160) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_finanzas_proveedores_cuit (cuit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS finanzas_compras (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    proveedor_id VARCHAR(36) NOT NULL,
    operario_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
    tipo_comprobante VARCHAR(30) NOT NULL,
    numero_comprobante VARCHAR(30) NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(30) NOT NULL,
    subtotal DECIMAL(14,2) NOT NULL DEFAULT 0,
    iva DECIMAL(14,2) NOT NULL DEFAULT 0,
    total DECIMAL(14,2) NOT NULL DEFAULT 0,
    saldo_pendiente DECIMAL(14,2) NOT NULL DEFAULT 0,
    observaciones TEXT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_fin_compra_proveedor FOREIGN KEY (proveedor_id) REFERENCES finanzas_proveedores(id),
    CONSTRAINT fk_fin_compra_operario FOREIGN KEY (operario_id) REFERENCES operarios(id),
    INDEX idx_fin_compra_proveedor (proveedor_id),
    INDEX idx_fin_compra_estado (estado),
    INDEX idx_fin_compra_fecha (fecha_emision)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS finanzas_compra_items (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    compra_id VARCHAR(36) NOT NULL,
    insumo_id VARCHAR(36) NULL,
    descripcion VARCHAR(180) NOT NULL,
    cantidad DECIMAL(14,3) NOT NULL,
    unidad VARCHAR(30) NOT NULL,
    precio_unitario DECIMAL(14,2) NOT NULL,
    iva_porcentaje DECIMAL(14,2) NOT NULL DEFAULT 21,
    subtotal DECIMAL(14,2) NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_fin_compra_item_compra FOREIGN KEY (compra_id) REFERENCES finanzas_compras(id),
    CONSTRAINT fk_fin_compra_item_insumo FOREIGN KEY (insumo_id) REFERENCES insumos_agricolas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS finanzas_pagos_proveedor (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    compra_id VARCHAR(36) NOT NULL,
    operario_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
    fecha DATE NOT NULL,
    metodo_pago VARCHAR(30) NOT NULL,
    importe DECIMAL(14,2) NOT NULL,
    referencia VARCHAR(160) NULL,
    observaciones TEXT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_fin_pago_proveedor_compra FOREIGN KEY (compra_id) REFERENCES finanzas_compras(id),
    CONSTRAINT fk_fin_pago_proveedor_operario FOREIGN KEY (operario_id) REFERENCES operarios(id),
    INDEX idx_fin_pago_proveedor_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO menu_options (id, menu_key, label, route, section, icon, display_order)
SELECT UUID(), 'finanzas-compras-proveedores', 'Compras y proveedores', '/finanzas/compras-proveedores', 'Finanzas', 'shopping-cart', 510
WHERE NOT EXISTS (SELECT 1 FROM menu_options WHERE menu_key = 'finanzas-compras-proveedores');

INSERT INTO role_menu_options (role_id, menu_option_id)
SELECT r.id, m.id
FROM roles r
JOIN menu_options m ON m.menu_key = 'finanzas-compras-proveedores'
WHERE r.deleted_at IS NULL
  AND m.deleted_at IS NULL
  AND m.active = TRUE
  AND r.name IN ('super_admin', 'admin', 'contador')
  AND NOT EXISTS (
      SELECT 1
      FROM role_menu_options existing
      WHERE existing.role_id = r.id
        AND existing.menu_option_id = m.id
  );

INSERT INTO finanzas_proveedores (id, razon_social, cuit, condicion_fiscal, email, telefono, direccion, categoria)
VALUES
('f1800000-0000-0000-0000-000000000001', 'Agroinsumos Tandil SRL', '30714555991', 'RESPONSABLE_INSCRIPTO', 'ventas@agroinsumostandil.com', '+54 249 456-1001', 'Ruta 226 km 162', 'Fitosanitarios'),
('f1800000-0000-0000-0000-000000000002', 'Semillas del Sudeste SA', '30709888772', 'RESPONSABLE_INSCRIPTO', 'administracion@semillassudeste.com', '+54 223 499-2100', 'Parque Industrial Balcarce', 'Semillas'),
('f1800000-0000-0000-0000-000000000003', 'Fertilizantes Pampa Norte', '30681234561', 'RESPONSABLE_INSCRIPTO', 'cuentas@fertipampa.com', '+54 11 4800-3321', 'Colectora Norte 540', 'Fertilizantes')
ON DUPLICATE KEY UPDATE razon_social = VALUES(razon_social), categoria = VALUES(categoria);

INSERT INTO finanzas_compras (id, proveedor_id, operario_id, tipo_comprobante, numero_comprobante, fecha_emision, fecha_vencimiento, estado, subtotal, iva, total, saldo_pendiente, observaciones)
VALUES
('f1810000-0000-0000-0000-000000000001', 'f1800000-0000-0000-0000-000000000001', NULL, 'FACTURA_A', 'A-0004-00001822', '2026-06-12', '2026-06-27', 'PARCIAL', 189750.00, 39847.50, 229597.50, 89597.50, 'Compra de fitosanitarios para campania fina'),
('f1810000-0000-0000-0000-000000000002', 'f1800000-0000-0000-0000-000000000003', NULL, 'FACTURA_A', 'A-0002-00004109', '2026-06-19', '2026-07-04', 'REGISTRADA', 147000.00, 30870.00, 177870.00, 177870.00, 'Reposicion de fertilizantes')
ON DUPLICATE KEY UPDATE estado = VALUES(estado), saldo_pendiente = VALUES(saldo_pendiente);

INSERT INTO finanzas_compra_items (id, compra_id, insumo_id, descripcion, cantidad, unidad, precio_unitario, iva_porcentaje, subtotal)
VALUES
('f1820000-0000-0000-0000-000000000001', 'f1810000-0000-0000-0000-000000000001', NULL, 'Glifosato 66%', 150.000, 'L', 759.00, 21.00, 113850.00),
('f1820000-0000-0000-0000-000000000002', 'f1810000-0000-0000-0000-000000000001', NULL, 'Fungicida triazol', 30.000, 'L', 2530.00, 21.00, 75900.00),
('f1820000-0000-0000-0000-000000000003', 'f1810000-0000-0000-0000-000000000002', NULL, 'Urea granulada', 210.000, 'BOLSA', 700.00, 21.00, 147000.00)
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

INSERT INTO finanzas_pagos_proveedor (id, compra_id, operario_id, fecha, metodo_pago, importe, referencia, observaciones)
VALUES
('f1830000-0000-0000-0000-000000000001', 'f1810000-0000-0000-0000-000000000001', NULL, '2026-06-20', 'TRANSFERENCIA', 140000.00, 'TRF-PROV-1029', 'Pago parcial de factura')
ON DUPLICATE KEY UPDATE importe = VALUES(importe);
