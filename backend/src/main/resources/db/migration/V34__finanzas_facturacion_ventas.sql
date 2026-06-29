CREATE TABLE IF NOT EXISTS finanzas_clientes (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    razon_social VARCHAR(180) NOT NULL,
    cuit VARCHAR(20) NOT NULL,
    condicion_fiscal VARCHAR(40) NOT NULL,
    email VARCHAR(180) NULL,
    telefono VARCHAR(60) NULL,
    direccion VARCHAR(220) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_finanzas_clientes_cuit (cuit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS finanzas_facturas (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    cliente_id VARCHAR(36) NOT NULL,
    operario_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
    tipo_comprobante VARCHAR(30) NOT NULL,
    punto_venta VARCHAR(20) NOT NULL,
    numero_comprobante VARCHAR(30) NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(30) NOT NULL,
    estado_fiscal VARCHAR(30) NOT NULL,
    cae VARCHAR(40) NULL,
    cae_vencimiento DATE NULL,
    subtotal DECIMAL(14,2) NOT NULL DEFAULT 0,
    iva DECIMAL(14,2) NOT NULL DEFAULT 0,
    total DECIMAL(14,2) NOT NULL DEFAULT 0,
    saldo_pendiente DECIMAL(14,2) NOT NULL DEFAULT 0,
    observaciones TEXT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_fin_fact_cliente FOREIGN KEY (cliente_id) REFERENCES finanzas_clientes(id),
    CONSTRAINT fk_fin_fact_operario FOREIGN KEY (operario_id) REFERENCES operarios(id),
    INDEX idx_fin_fact_cliente (cliente_id),
    INDEX idx_fin_fact_estado (estado),
    INDEX idx_fin_fact_fecha (fecha_emision)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS finanzas_factura_items (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    factura_id VARCHAR(36) NOT NULL,
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
    CONSTRAINT fk_fin_item_fact FOREIGN KEY (factura_id) REFERENCES finanzas_facturas(id),
    CONSTRAINT fk_fin_item_insumo FOREIGN KEY (insumo_id) REFERENCES insumos_agricolas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS finanzas_cobros (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    factura_id VARCHAR(36) NOT NULL,
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
    CONSTRAINT fk_fin_cobro_fact FOREIGN KEY (factura_id) REFERENCES finanzas_facturas(id),
    CONSTRAINT fk_fin_cobro_operario FOREIGN KEY (operario_id) REFERENCES operarios(id),
    INDEX idx_fin_cobro_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS finanzas_notas_credito (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    factura_id VARCHAR(36) NOT NULL,
    operario_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
    fecha DATE NOT NULL,
    importe DECIMAL(14,2) NOT NULL,
    motivo VARCHAR(220) NOT NULL,
    cae VARCHAR(40) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_fin_nc_fact FOREIGN KEY (factura_id) REFERENCES finanzas_facturas(id),
    CONSTRAINT fk_fin_nc_operario FOREIGN KEY (operario_id) REFERENCES operarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO menu_options (id, menu_key, label, route, section, icon, display_order)
SELECT UUID(), 'finanzas-facturacion', 'Facturacion y ventas', '/finanzas/facturacion', 'Finanzas', 'receipt', 500
WHERE NOT EXISTS (SELECT 1 FROM menu_options WHERE menu_key = 'finanzas-facturacion');

INSERT IGNORE INTO role_menu_options (role_id, menu_option_id)
SELECT r.id, m.id FROM roles r JOIN menu_options m ON m.menu_key = 'finanzas-facturacion' WHERE r.name IN ('ADMIN','PRODUCTOR');

INSERT INTO finanzas_clientes (id, razon_social, cuit, condicion_fiscal, email, telefono, direccion)
VALUES
('f1700000-0000-0000-0000-000000000001', 'Agroexport Norte SA', '30711222331', 'RESPONSABLE_INSCRIPTO', 'compras@agroexportnorte.com', '+54 11 4500-1200', 'Ruta 8 km 92'),
('f1700000-0000-0000-0000-000000000002', 'Cooperativa Santa Clara', '30699888771', 'RESPONSABLE_INSCRIPTO', 'administracion@santaclara.coop', '+54 249 444-2200', 'Av. Campo 1450'),
('f1700000-0000-0000-0000-000000000003', 'Estancia Los Robles', '27244555666', 'MONOTRIBUTO', 'pagos@losrobles.com', '+54 2262 51-9040', 'Paraje La Numancia')
ON DUPLICATE KEY UPDATE razon_social = VALUES(razon_social);

INSERT INTO finanzas_facturas (id, cliente_id, operario_id, tipo_comprobante, punto_venta, numero_comprobante, fecha_emision, fecha_vencimiento, estado, estado_fiscal, cae, cae_vencimiento, subtotal, iva, total, saldo_pendiente, observaciones)
VALUES
('f1710000-0000-0000-0000-000000000001', 'f1700000-0000-0000-0000-000000000001', NULL, 'FACTURA_A', '0001', '00000001', '2026-06-10', '2026-06-25', 'PARCIAL', 'CAE_SIMULADO', '761234567890', '2026-06-20', 125000.00, 26250.00, 151250.00, 51250.00, 'Venta de insumos de campania'),
('f1710000-0000-0000-0000-000000000002', 'f1700000-0000-0000-0000-000000000002', NULL, 'FACTURA_A', '0001', '00000002', '2026-06-16', '2026-07-01', 'EMITIDA', 'CAE_SIMULADO', '761234567891', '2026-06-26', 98000.00, 20580.00, 118580.00, 118580.00, 'Fertilizantes y fitosanitarios')
ON DUPLICATE KEY UPDATE estado = VALUES(estado);

INSERT INTO finanzas_factura_items (id, factura_id, insumo_id, descripcion, cantidad, unidad, precio_unitario, iva_porcentaje, subtotal)
VALUES
('f1720000-0000-0000-0000-000000000001', 'f1710000-0000-0000-0000-000000000001', NULL, 'Glifosato 66%', 120.000, 'L', 760.00, 21.00, 91200.00),
('f1720000-0000-0000-0000-000000000002', 'f1710000-0000-0000-0000-000000000001', NULL, 'Lambda Cihalotrina', 20.000, 'L', 1690.00, 21.00, 33800.00),
('f1720000-0000-0000-0000-000000000003', 'f1710000-0000-0000-0000-000000000002', NULL, 'MAP 11-52', 100.000, 'BOLSA', 980.00, 21.00, 98000.00)
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

INSERT INTO finanzas_cobros (id, factura_id, operario_id, fecha, metodo_pago, importe, referencia, observaciones)
VALUES
('f1730000-0000-0000-0000-000000000001', 'f1710000-0000-0000-0000-000000000001', NULL, '2026-06-18', 'TRANSFERENCIA', 100000.00, 'TRX-90821', 'Pago parcial')
ON DUPLICATE KEY UPDATE importe = VALUES(importe);
