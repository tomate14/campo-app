-- Mock manual de inventario agricola.
-- No es una migracion Flyway: ejecutar solo bajo pedido explicito.

START TRANSACTION;

INSERT INTO insumos_agricolas (
    id, codigo, nombre, tipo, marca, presentacion, unidad_medida, principio_activo,
    proveedor, origen, descripcion, precio_unitario, stock_minimo, stock_maximo, activo
) VALUES
    ('18000000-0000-0000-0000-000000000001', 'SEM-MAIZ-VT3P', 'Semilla Maiz VT3P', 'SEMILLA', 'Dekalb', 'Bolsa 80.000 semillas', 'BOLSA', NULL, 'Agroinsumos Tandil', 'Lote certificado AR', 'Semilla hibrida para siembra temprana.', 285.00, 12.000, 80.000, b'1'),
    ('18000000-0000-0000-0000-000000000002', 'FERT-MAP-11-52', 'MAP 11-52', 'FERTILIZANTE', 'Profertil', 'Big bag 1000 kg', 'KG', 'Fosfato monoamonico', 'Nutrien Ag Solutions', 'Bahia Blanca', 'Fertilizante fosforado para arranque.', 0.82, 2500.000, 18000.000, b'1'),
    ('18000000-0000-0000-0000-000000000003', 'HERB-GLIFO-66', 'Glifosato 66%', 'HERBICIDA', 'Atanor', 'Bidon 20 L', 'L', 'Glifosato potasico', 'Campo Quimica', 'Argentina', 'Herbicida sistemico no selectivo.', 4.60, 180.000, 1200.000, b'1'),
    ('18000000-0000-0000-0000-000000000004', 'FUNG-AZOXI-CIPRO', 'Azoxistrobin + Ciproconazole', 'FUNGICIDA', 'Syngenta', 'Bidon 5 L', 'L', 'Azoxistrobin / Ciproconazole', 'Campo Quimica', 'Brasil', 'Fungicida foliar para soja y trigo.', 18.50, 45.000, 260.000, b'1'),
    ('18000000-0000-0000-0000-000000000005', 'INSEC-LAMBDA', 'Lambda Cihalotrina', 'INSECTICIDA', 'Adama', 'Bidon 5 L', 'L', 'Lambda cihalotrina', 'Agroinsumos Tandil', 'Argentina', 'Insecticida piretroide para control de isocas y chinches.', 11.20, 30.000, 180.000, b'1')
ON DUPLICATE KEY UPDATE
    nombre = VALUES(nombre),
    tipo = VALUES(tipo),
    marca = VALUES(marca),
    presentacion = VALUES(presentacion),
    unidad_medida = VALUES(unidad_medida),
    principio_activo = VALUES(principio_activo),
    proveedor = VALUES(proveedor),
    origen = VALUES(origen),
    descripcion = VALUES(descripcion),
    precio_unitario = VALUES(precio_unitario),
    stock_minimo = VALUES(stock_minimo),
    stock_maximo = VALUES(stock_maximo),
    activo = VALUES(activo),
    deleted_at = NULL;

INSERT INTO stock_insumos_agricolas (
    id, insumo_id, lote_stock, cantidad_disponible, fecha_vencimiento, ubicacion_deposito, deposito, observaciones
) VALUES
    ('18100000-0000-0000-0000-000000000001', '18000000-0000-0000-0000-000000000001', 'DK-2405-A', 38.000, '2027-03-30', 'Rack A1', 'Deposito semillas', 'Lote certificado con marbete.'),
    ('18100000-0000-0000-0000-000000000002', '18000000-0000-0000-0000-000000000002', 'MAP-2601', 4200.000, NULL, 'Silo bolsa fertilizante 1', 'Deposito fertilizantes', 'Mantener seco y cubierto.'),
    ('18100000-0000-0000-0000-000000000003', '18000000-0000-0000-0000-000000000003', 'GLI-0426', 165.000, '2026-07-20', 'Estanteria F2', 'Deposito fitosanitarios', 'Stock bajo, disparar reorden.'),
    ('18100000-0000-0000-0000-000000000004', '18000000-0000-0000-0000-000000000004', 'AZC-1125', 58.000, '2026-08-10', 'Estanteria F4', 'Deposito fitosanitarios', 'Controlar vencimiento.'),
    ('18100000-0000-0000-0000-000000000005', '18000000-0000-0000-0000-000000000005', 'LAM-0226', 22.000, '2026-07-05', 'Estanteria F1', 'Deposito fitosanitarios', 'Debajo del minimo operativo.')
ON DUPLICATE KEY UPDATE
    cantidad_disponible = VALUES(cantidad_disponible),
    fecha_vencimiento = VALUES(fecha_vencimiento),
    ubicacion_deposito = VALUES(ubicacion_deposito),
    deposito = VALUES(deposito),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO movimientos_insumos_agricolas (
    id, insumo_id, stock_id, lote_id, fecha, tipo_movimiento, cantidad, costo_unitario,
    responsable, tarea_referencia, proveedor, origen, destino, observaciones
) VALUES
    ('18200000-0000-0000-0000-000000000001', '18000000-0000-0000-0000-000000000003', '18100000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000001', '2026-06-18 08:30:00', 'USO', 42.000, 4.60, 'Sergio Fernandez', 'Aplicacion barbecho Lote Norte 1', NULL, 'Deposito fitosanitarios', 'Lote Norte 1', 'Uso registrado para control de malezas.'),
    ('18200000-0000-0000-0000-000000000002', '18000000-0000-0000-0000-000000000002', '18100000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', '2026-06-19 10:15:00', 'USO', 850.000, 0.82, 'Maria Gomez', 'Fertilizacion Lote Sur 4', NULL, 'Deposito fertilizantes', 'Lote Sur 4', 'Aplicacion de base.'),
    ('18200000-0000-0000-0000-000000000003', '18000000-0000-0000-0000-000000000005', '18100000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000001', '2026-06-20 07:40:00', 'USO', 8.000, 11.20, 'Juan Perez', 'Control isoca lote norte', NULL, 'Deposito fitosanitarios', 'Lote Norte 1', 'Tratamiento puntual.')
ON DUPLICATE KEY UPDATE
    fecha = VALUES(fecha),
    tipo_movimiento = VALUES(tipo_movimiento),
    cantidad = VALUES(cantidad),
    costo_unitario = VALUES(costo_unitario),
    responsable = VALUES(responsable),
    tarea_referencia = VALUES(tarea_referencia),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

COMMIT;
