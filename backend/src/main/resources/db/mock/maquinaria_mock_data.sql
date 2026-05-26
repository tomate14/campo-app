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

COMMIT;
