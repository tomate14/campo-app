-- Mock manual de datos para pruebas de maquinaria.
-- No es una migracion Flyway: ejecutar solo bajo pedido explicito.
-- Uso sugerido:
--   docker exec -i campo-db mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} < backend/src/main/resources/db/mock/maquinaria_mock_data.sql

START TRANSACTION;

INSERT INTO maquinaria (
    id, codigo, tipo, marca, modelo, numero_serie, anio, estado, ubicacion_actual,
    potencia_hp, capacidad, accesorios, horometro, kilometraje, costo_adquisicion,
    fecha_alta, observaciones
) VALUES
    (
        '80000000-0000-0000-0000-000000000001',
        'TR-8120',
        'TRACTOR',
        'John Deere',
        '8120',
        'JD8120-AR-0091',
        2021,
        'DISPONIBLE',
        'Base Norte',
        210.00,
        'Tolva 14 t / tiro pesado',
        'Piloto automatico, balizas LED, enganche rapido',
        1240.50,
        0.00,
        168500000.00,
        '2021-03-15',
        'Unidad principal para siembra y labranza pesada.'
    ),
    (
        '80000000-0000-0000-0000-000000000002',
        'CO-9760',
        'COSECHADORA',
        'Case IH',
        'Axial-Flow 9760',
        'CASE9760-AR-0124',
        2020,
        'OPERANDO',
        'Lote Norte 1',
        380.00,
        'Plataforma 35 pies',
        'Monitor rendimiento, piloto, cabezal maicero',
        2150.00,
        0.00,
        315000000.00,
        '2020-11-08',
        'Cosechadora activa en campana gruesa.'
    ),
    (
        '80000000-0000-0000-0000-000000000003',
        'SM-4200',
        'SEMBRADORA',
        'Agrometal',
        'TX Mega 4200',
        'AGTX4200-045',
        2022,
        'ASIGNADA',
        'Lote Sur 4',
        NULL,
        '16 lineas a 52 cm',
        'Dosificacion variable, fertilizacion en linea',
        540.00,
        0.00,
        92500000.00,
        '2022-07-22',
        'Asignada a implantacion de soja.'
    ),
    (
        '80000000-0000-0000-0000-000000000004',
        'PU-3030',
        'PULVERIZADORA',
        'Metalfor',
        'Multiple 3030',
        'MF3030-998',
        2019,
        'EN_REPARACION',
        'Taller Central',
        180.00,
        'Tanque 3000 litros / botalon 28 m',
        'Corte por seccion, mapeo de aplicacion',
        1890.75,
        0.00,
        118000000.00,
        '2019-09-10',
        'En reparacion por revision de bomba y picos.'
    ),
    (
        '80000000-0000-0000-0000-000000000005',
        'CM-014',
        'CAMIONETA',
        'Toyota',
        'Hilux SRX',
        '8AJBA3CD4P0014001',
        2023,
        'DISPONIBLE',
        'Administracion',
        204.00,
        '4x4 doble cabina',
        'Radio VHF, caja de herramientas, jaula sanitaria',
        0.00,
        38420.00,
        52000000.00,
        '2023-02-02',
        'Unidad de supervision operativa.'
    )
ON DUPLICATE KEY UPDATE
    tipo = VALUES(tipo),
    marca = VALUES(marca),
    modelo = VALUES(modelo),
    numero_serie = VALUES(numero_serie),
    anio = VALUES(anio),
    estado = VALUES(estado),
    ubicacion_actual = VALUES(ubicacion_actual),
    potencia_hp = VALUES(potencia_hp),
    capacidad = VALUES(capacidad),
    accesorios = VALUES(accesorios),
    horometro = VALUES(horometro),
    kilometraje = VALUES(kilometraje),
    costo_adquisicion = VALUES(costo_adquisicion),
    fecha_alta = VALUES(fecha_alta),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO asignaciones_maquinaria (
    id, maquinaria_id, operario, fecha_inicio, fecha_fin, actividad, ubicacion, observaciones
) VALUES
    (
        '81000000-0000-0000-0000-000000000001',
        '80000000-0000-0000-0000-000000000002',
        'Juan Perez',
        '2026-05-20 07:30:00',
        NULL,
        'Cosecha de maiz',
        'Lote Norte 1',
        'Asignacion activa para validar estado operativo.'
    ),
    (
        '81000000-0000-0000-0000-000000000002',
        '80000000-0000-0000-0000-000000000003',
        'Maria Gomez',
        '2026-05-21 08:00:00',
        NULL,
        'Siembra soja',
        'Lote Sur 4',
        'Equipo asignado a implantacion.'
    ),
    (
        '81000000-0000-0000-0000-000000000003',
        '80000000-0000-0000-0000-000000000001',
        'Pablo Ruiz',
        '2026-05-10 06:45:00',
        '2026-05-10 18:10:00',
        'Labranza profunda',
        'Lote Oeste 2',
        'Asignacion historica cerrada.'
    )
ON DUPLICATE KEY UPDATE
    operario = VALUES(operario),
    fecha_inicio = VALUES(fecha_inicio),
    fecha_fin = VALUES(fecha_fin),
    actividad = VALUES(actividad),
    ubicacion = VALUES(ubicacion),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO usos_maquinaria (
    id, maquinaria_id, fecha, actividad, lote, operario, horas_trabajadas,
    kilometros_recorridos, combustible_litros, observaciones
) VALUES
    (
        '82000000-0000-0000-0000-000000000001',
        '80000000-0000-0000-0000-000000000002',
        '2026-05-21',
        'Cosecha de maiz',
        'Lote Norte 1',
        'Juan Perez',
        8.50,
        NULL,
        165.00,
        'Rendimiento operativo normal.'
    ),
    (
        '82000000-0000-0000-0000-000000000002',
        '80000000-0000-0000-0000-000000000003',
        '2026-05-22',
        'Siembra soja',
        'Lote Sur 4',
        'Maria Gomez',
        6.25,
        NULL,
        72.00,
        'Implantacion sin incidencias.'
    ),
    (
        '82000000-0000-0000-0000-000000000003',
        '80000000-0000-0000-0000-000000000001',
        '2026-05-18',
        'Traslado y apoyo',
        'Base Norte',
        'Pablo Ruiz',
        3.00,
        18.50,
        38.00,
        'Apoyo logistico a cosecha.'
    ),
    (
        '82000000-0000-0000-0000-000000000004',
        '80000000-0000-0000-0000-000000000005',
        '2026-05-19',
        'Supervision de potreros',
        'Potrero 12A',
        'Laura Medina',
        2.00,
        46.00,
        11.00,
        'Recorrida sanitaria y agricola.'
    )
ON DUPLICATE KEY UPDATE
    fecha = VALUES(fecha),
    actividad = VALUES(actividad),
    lote = VALUES(lote),
    operario = VALUES(operario),
    horas_trabajadas = VALUES(horas_trabajadas),
    kilometros_recorridos = VALUES(kilometros_recorridos),
    combustible_litros = VALUES(combustible_litros),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO documentos_maquinaria (
    id, maquinaria_id, tipo_documento, numero, vencimiento, url, observaciones
) VALUES
    (
        '83000000-0000-0000-0000-000000000001',
        '80000000-0000-0000-0000-000000000001',
        'Seguro',
        'SEG-TR-8120-2026',
        '2026-12-31',
        NULL,
        'Poliza anual vigente.'
    ),
    (
        '83000000-0000-0000-0000-000000000002',
        '80000000-0000-0000-0000-000000000002',
        'Revision tecnica',
        'RT-CO-9760-2026',
        '2026-06-15',
        NULL,
        'Revision proxima para validar alerta visual.'
    ),
    (
        '83000000-0000-0000-0000-000000000003',
        '80000000-0000-0000-0000-000000000004',
        'Seguro',
        'SEG-PU-3030-2025',
        '2026-05-01',
        NULL,
        'Documento vencido para validar KPI.'
    )
ON DUPLICATE KEY UPDATE
    tipo_documento = VALUES(tipo_documento),
    numero = VALUES(numero),
    vencimiento = VALUES(vencimiento),
    url = VALUES(url),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO historial_estado_maquinaria (
    id, maquinaria_id, estado_anterior, estado_nuevo, fecha, responsable, motivo
) VALUES
    (
        '84000000-0000-0000-0000-000000000001',
        '80000000-0000-0000-0000-000000000004',
        'DISPONIBLE',
        'EN_REPARACION',
        '2026-05-20 17:20:00',
        'Jefe de taller',
        'Revision de bomba y calibracion de picos'
    ),
    (
        '84000000-0000-0000-0000-000000000002',
        '80000000-0000-0000-0000-000000000002',
        'DISPONIBLE',
        'OPERANDO',
        '2026-05-20 07:30:00',
        'Juan Perez',
        'Inicio de cosecha'
    ),
    (
        '84000000-0000-0000-0000-000000000003',
        '80000000-0000-0000-0000-000000000003',
        'DISPONIBLE',
        'ASIGNADA',
        '2026-05-21 08:00:00',
        'Maria Gomez',
        'Asignacion a siembra'
    )
ON DUPLICATE KEY UPDATE
    estado_anterior = VALUES(estado_anterior),
    estado_nuevo = VALUES(estado_nuevo),
    fecha = VALUES(fecha),
    responsable = VALUES(responsable),
    motivo = VALUES(motivo),
    deleted_at = NULL;

INSERT INTO planes_mantenimiento (
    id, maquinaria_id, tipo_maquinaria, modelo, nombre, descripcion,
    intervalo_horas, intervalo_dias, prioridad, activo
) VALUES
    (
        '85000000-0000-0000-0000-000000000001',
        '80000000-0000-0000-0000-000000000001',
        'TRACTOR',
        '8120',
        'Servicio 250 horas',
        'Cambio de aceite, filtros, engrase general y control hidraulico.',
        250.00,
        90,
        'ALTA',
        b'1'
    ),
    (
        '85000000-0000-0000-0000-000000000002',
        '80000000-0000-0000-0000-000000000002',
        'COSECHADORA',
        'Axial-Flow 9760',
        'Inspeccion de cosecha',
        'Control de correas, zarandas, rotor, plataforma y sensores de rendimiento.',
        180.00,
        45,
        'ALTA',
        b'1'
    ),
    (
        '85000000-0000-0000-0000-000000000003',
        NULL,
        'PULVERIZADORA',
        NULL,
        'Calibracion de aplicacion',
        'Calibracion de picos, bomba, filtros y caudalimetro.',
        120.00,
        60,
        'MEDIA',
        b'1'
    )
ON DUPLICATE KEY UPDATE
    maquinaria_id = VALUES(maquinaria_id),
    tipo_maquinaria = VALUES(tipo_maquinaria),
    modelo = VALUES(modelo),
    nombre = VALUES(nombre),
    descripcion = VALUES(descripcion),
    intervalo_horas = VALUES(intervalo_horas),
    intervalo_dias = VALUES(intervalo_dias),
    prioridad = VALUES(prioridad),
    activo = VALUES(activo),
    deleted_at = NULL;

INSERT INTO mantenimientos_programados (
    id, maquinaria_id, plan_id, fecha_programada, horometro_objetivo,
    estado, responsable, observaciones
) VALUES
    (
        '86000000-0000-0000-0000-000000000001',
        '80000000-0000-0000-0000-000000000001',
        '85000000-0000-0000-0000-000000000001',
        '2026-05-30',
        1500.00,
        'PENDIENTE',
        'Jefe de taller',
        'Preparar kit de filtros y aceite.'
    ),
    (
        '86000000-0000-0000-0000-000000000002',
        '80000000-0000-0000-0000-000000000002',
        '85000000-0000-0000-0000-000000000002',
        '2026-05-20',
        2300.00,
        'PENDIENTE',
        'Juan Perez',
        'Revision vencida para validar alerta.'
    ),
    (
        '86000000-0000-0000-0000-000000000003',
        '80000000-0000-0000-0000-000000000004',
        '85000000-0000-0000-0000-000000000003',
        '2026-06-03',
        1950.00,
        'PENDIENTE',
        'Jefe de taller',
        'Realizar junto con reparacion actual.'
    )
ON DUPLICATE KEY UPDATE
    maquinaria_id = VALUES(maquinaria_id),
    plan_id = VALUES(plan_id),
    fecha_programada = VALUES(fecha_programada),
    horometro_objetivo = VALUES(horometro_objetivo),
    estado = VALUES(estado),
    responsable = VALUES(responsable),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO intervenciones_mantenimiento (
    id, maquinaria_id, plan_id, programacion_id, fecha, tipo, tareas_realizadas,
    operario, horas_maquina, mano_obra_costo, repuestos_costo, costo_total,
    estado_resultante, observaciones
) VALUES
    (
        '87000000-0000-0000-0000-000000000001',
        '80000000-0000-0000-0000-000000000001',
        '85000000-0000-0000-0000-000000000001',
        NULL,
        '2026-05-12',
        'PREVENTIVO',
        'Cambio de aceite, filtros y engrase completo.',
        'Jefe de taller',
        1240.50,
        95000.00,
        185000.00,
        280000.00,
        'DISPONIBLE',
        'Servicio realizado sin novedades.'
    ),
    (
        '87000000-0000-0000-0000-000000000002',
        '80000000-0000-0000-0000-000000000004',
        '85000000-0000-0000-0000-000000000003',
        NULL,
        '2026-05-21',
        'CORRECTIVO',
        'Revision de bomba, cambio de picos y limpieza de filtros.',
        'Taller Central',
        1890.75,
        140000.00,
        260000.00,
        400000.00,
        'EN_REPARACION',
        'Queda pendiente prueba de presion.'
    )
ON DUPLICATE KEY UPDATE
    maquinaria_id = VALUES(maquinaria_id),
    plan_id = VALUES(plan_id),
    programacion_id = VALUES(programacion_id),
    fecha = VALUES(fecha),
    tipo = VALUES(tipo),
    tareas_realizadas = VALUES(tareas_realizadas),
    operario = VALUES(operario),
    horas_maquina = VALUES(horas_maquina),
    mano_obra_costo = VALUES(mano_obra_costo),
    repuestos_costo = VALUES(repuestos_costo),
    costo_total = VALUES(costo_total),
    estado_resultante = VALUES(estado_resultante),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO repuestos_utilizados (
    id, intervencion_id, codigo, descripcion, cantidad, costo_unitario, costo_total, proveedor
) VALUES
    ('88000000-0000-0000-0000-000000000001', '87000000-0000-0000-0000-000000000001', 'FIL-ACE-8120', 'Filtro de aceite tractor 8120', 1.00, 85000.00, 85000.00, 'Agro Repuestos SA'),
    ('88000000-0000-0000-0000-000000000002', '87000000-0000-0000-0000-000000000001', 'ACE-15W40', 'Aceite 15W40 bidon 20L', 2.00, 50000.00, 100000.00, 'Agro Repuestos SA'),
    ('88000000-0000-0000-0000-000000000003', '87000000-0000-0000-0000-000000000002', 'PICO-11003', 'Pico pulverizador abanico 11003', 24.00, 8500.00, 204000.00, 'Pulverizaciones del Centro'),
    ('88000000-0000-0000-0000-000000000004', '87000000-0000-0000-0000-000000000002', 'FILT-LINEA', 'Filtro de linea pulverizadora', 2.00, 28000.00, 56000.00, 'Pulverizaciones del Centro')
ON DUPLICATE KEY UPDATE
    codigo = VALUES(codigo),
    descripcion = VALUES(descripcion),
    cantidad = VALUES(cantidad),
    costo_unitario = VALUES(costo_unitario),
    costo_total = VALUES(costo_total),
    proveedor = VALUES(proveedor),
    deleted_at = NULL;

COMMIT;
