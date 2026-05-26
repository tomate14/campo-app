-- Mock manual de datos para pruebas de ganaderia.
-- No es una migracion Flyway: ejecutar solo bajo pedido explicito.
-- Uso sugerido:
--   docker exec -i campo-db mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} ${MYSQL_DATABASE} < backend/src/main/resources/db/mock/ganaderia_mock_data.sql

START TRANSACTION;

INSERT INTO animales (
    id, caravana, raza, sexo, fecha_nacimiento, fecha_compra, peso_actual_kg,
    rfid_codigo, qr_codigo, estado, ubicacion_actual, madre_id, padre_id, observaciones
) VALUES
    ('10000000-0000-0000-0000-000000000001', '1257', 'Angus Negro', 'Femenino', '2020-08-15', '2021-02-10', 620.00, 'RFID-1257', NULL, 'ACTIVO', 'Potrero 12A', NULL, NULL, 'Vaca adulta prenada. Buena condicion corporal.'),
    ('10000000-0000-0000-0000-000000000002', '0923', 'Hereford', 'Femenino', '2021-01-20', '2021-08-15', 585.00, 'RFID-0923', NULL, 'ACTIVO', 'Potrero 7B', NULL, NULL, 'Proxima a parir. Seguimiento medio.'),
    ('10000000-0000-0000-0000-000000000003', '0448', 'Braford', 'Femenino', '2019-11-04', '2020-05-22', 600.00, 'RFID-0448', NULL, 'ACTIVO', 'Potrero 5C', NULL, NULL, 'Rodeo premium. Riesgo bajo.'),
    ('10000000-0000-0000-0000-000000000004', '0781', 'Angus Colorado', 'Femenino', '2020-03-12', '2020-10-03', 610.00, 'RFID-0781', NULL, 'ACTIVO', 'Potrero 9A', NULL, NULL, 'Control reproductivo mensual.'),
    ('10000000-0000-0000-0000-000000000005', '1562', 'Brangus', 'Femenino', '2021-06-01', '2022-01-10', 560.00, 'RFID-1562', NULL, 'ACTIVO', 'Potrero 12A', NULL, NULL, 'Animal en programa reproductivo.'),
    ('10000000-0000-0000-0000-000000000006', '33333', 'Angus Negro', 'Femenino', '2018-05-11', '2019-03-08', 650.00, 'RFID-33333', NULL, 'ACTIVO', 'Potrero Madres', NULL, NULL, 'Madre de referencia genealogica.'),
    ('10000000-0000-0000-0000-000000000007', '44444', 'Hereford', 'Masculino', '2017-09-09', '2018-04-01', 890.00, 'RFID-44444', NULL, 'ACTIVO', 'Potrero Toros', NULL, NULL, 'Toro padre de referencia.'),
    ('10000000-0000-0000-0000-000000000008', '55555', 'Angus Negro', 'Masculino', '2023-10-02', NULL, 320.00, 'RFID-55555', NULL, 'ACTIVO', 'Potrero Recria', NULL, NULL, 'Ternero para validar arbol genealogico ascendente.'),
    ('10000000-0000-0000-0000-000000000009', '0456', 'Angus Negro', 'Femenino', '2016-04-03', '2017-01-17', 640.00, 'RFID-0456', NULL, 'ACTIVO', 'Potrero Madres', NULL, NULL, 'Abuela materna.'),
    ('10000000-0000-0000-0000-000000000010', '0123', 'Hereford', 'Masculino', '2015-07-18', '2016-02-12', 910.00, 'RFID-0123', NULL, 'ACTIVO', 'Potrero Toros', NULL, NULL, 'Abuelo paterno.'),
    ('10000000-0000-0000-0000-000000000011', '0789', 'Angus Negro', 'Masculino', '2016-09-22', '2017-04-11', 870.00, 'RFID-0789', NULL, 'ACTIVO', 'Potrero Toros', NULL, NULL, 'Toro usado en servicios recientes.')
ON DUPLICATE KEY UPDATE
    raza = VALUES(raza),
    sexo = VALUES(sexo),
    fecha_nacimiento = VALUES(fecha_nacimiento),
    fecha_compra = VALUES(fecha_compra),
    peso_actual_kg = VALUES(peso_actual_kg),
    estado = VALUES(estado),
    ubicacion_actual = VALUES(ubicacion_actual),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

UPDATE animales SET madre_id = '10000000-0000-0000-0000-000000000009', padre_id = '10000000-0000-0000-0000-000000000010' WHERE id = '10000000-0000-0000-0000-000000000006';
UPDATE animales SET madre_id = '10000000-0000-0000-0000-000000000006', padre_id = '10000000-0000-0000-0000-000000000007' WHERE id = '10000000-0000-0000-0000-000000000008';
UPDATE animales SET madre_id = '10000000-0000-0000-0000-000000000006', padre_id = '10000000-0000-0000-0000-000000000011' WHERE id IN (
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000003'
);

INSERT INTO movimientos_animal (
    id, animal_id, fecha, tipo_movimiento, ubicacion_origen, ubicacion_destino, motivo, responsable, observaciones
) VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2026-05-01 08:30:00', 'TRANSFERENCIA', 'Potrero 8A', 'Potrero 12A', 'Lote preparto', 'Juan Perez', 'Movimiento para seguimiento de preparto.'),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '2026-05-02 09:15:00', 'TRANSFERENCIA', 'Potrero 3B', 'Potrero 7B', 'Agrupamiento reproductivo', 'Juan Perez', 'Control visual diario.'),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000008', '2026-04-18 10:00:00', 'CONTROL', 'Potrero Recria', 'Potrero Recria', 'Pesaje', 'Maria Gomez', 'Peso dentro de rango esperado.')
ON DUPLICATE KEY UPDATE
    fecha = VALUES(fecha),
    ubicacion_origen = VALUES(ubicacion_origen),
    ubicacion_destino = VALUES(ubicacion_destino),
    motivo = VALUES(motivo),
    responsable = VALUES(responsable),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO historial_medico_animal (
    id, animal_id, fecha, diagnostico, tratamiento, veterinario, observaciones
) VALUES
    ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2026-04-21', 'Control preparto normal', 'Suplementacion mineral', 'Dra. Laura Medina', 'Buena condicion corporal. Sin complicaciones.'),
    ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '2026-04-28', 'Control preparto', 'Observacion diaria', 'Dra. Laura Medina', 'Riesgo medio por historial de parto asistido.'),
    ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '2026-04-30', 'Control sanitario', 'Sin tratamiento', 'Dr. Martin Silva', 'Animal estable.')
ON DUPLICATE KEY UPDATE
    fecha = VALUES(fecha),
    diagnostico = VALUES(diagnostico),
    tratamiento = VALUES(tratamiento),
    veterinario = VALUES(veterinario),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO vacunas_catalogo (
    id, codigo, nombre, descripcion, obligatoria, especie, frecuencia_dias, edad_min_dias,
    dosis_recomendada, via_aplicacion, laboratorio, costo_referencia, stock_disponible, activo
) VALUES
    ('40000000-0000-0000-0000-000000000001', 'AFTOSA-MOCK', 'Vacuna Aftosa Mock', 'Dato mock para pruebas integrales.', b'1', 'BOVINA', 180, 60, '5 ml', 'Subcutanea', 'Biogenesis Bago', 1850.00, 120, b'1'),
    ('40000000-0000-0000-0000-000000000002', 'CLOSTRIDIAL-MOCK', 'Vacuna Clostridial Mock', 'Dato mock para pruebas integrales.', b'0', 'BOVINA', 365, 120, '5 ml', 'Intramuscular', 'Vetanco', 980.00, 65, b'1')
ON DUPLICATE KEY UPDATE
    nombre = VALUES(nombre),
    descripcion = VALUES(descripcion),
    obligatoria = VALUES(obligatoria),
    frecuencia_dias = VALUES(frecuencia_dias),
    dosis_recomendada = VALUES(dosis_recomendada),
    stock_disponible = VALUES(stock_disponible),
    activo = VALUES(activo),
    deleted_at = NULL;

INSERT INTO aplicaciones_vacuna (
    id, animal_id, vacuna_id, fecha_aplicacion, proxima_dosis_fecha, operario, lote_marca, costo_aplicado, observaciones
) VALUES
    ('41000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '2026-04-21', '2026-10-18', 'Juan Perez', 'CL-0426', 1850.00, 'Aplicacion preparto registrada.'),
    ('41000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '2026-04-10', '2027-04-10', 'Juan Perez', 'CL-0426', 980.00, 'Refuerzo clostridial.'),
    ('41000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', '2025-12-01', '2026-05-29', 'Maria Gomez', 'AFT-0526', 1850.00, 'Mock para alerta de vacunacion proxima.')
ON DUPLICATE KEY UPDATE
    fecha_aplicacion = VALUES(fecha_aplicacion),
    proxima_dosis_fecha = VALUES(proxima_dosis_fecha),
    operario = VALUES(operario),
    lote_marca = VALUES(lote_marca),
    costo_aplicado = VALUES(costo_aplicado),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO tratamientos_medicamento (
    id, animal_id, fecha_inicio, fecha_fin, medicamento, dosis, via_aplicacion, responsable, motivo, costo, observaciones
) VALUES
    ('42000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2026-04-10', '2026-04-10', 'Ivermectina', '10 ml', 'Subcutanea', 'Juan Perez', 'Desparasitacion', 650.00, 'Tratamiento preventivo.'),
    ('42000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '2026-04-12', NULL, 'Complejo vitaminico ADE', '5 ml', 'Intramuscular', 'Maria Gomez', 'Preparacion preparto', 420.00, 'Seguimiento semanal.')
ON DUPLICATE KEY UPDATE
    fecha_inicio = VALUES(fecha_inicio),
    fecha_fin = VALUES(fecha_fin),
    medicamento = VALUES(medicamento),
    dosis = VALUES(dosis),
    responsable = VALUES(responsable),
    motivo = VALUES(motivo),
    costo = VALUES(costo),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO diagnosticos_sanitarios (
    id, animal_id, fecha_diagnostico, enfermedad, severidad, estado, veterinario, tratamiento_indicado, observaciones
) VALUES
    ('43000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2026-04-25', 'Control gestacional', 'BAJA', 'CERRADO', 'Dra. Laura Medina', 'Monitoreo visual', 'Sin hallazgos relevantes.'),
    ('43000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '2026-05-05', 'Riesgo preparto medio', 'MEDIA', 'ABIERTO', 'Dra. Laura Medina', 'Control cada 48 horas', 'Historial de parto asistido.')
ON DUPLICATE KEY UPDATE
    fecha_diagnostico = VALUES(fecha_diagnostico),
    enfermedad = VALUES(enfermedad),
    severidad = VALUES(severidad),
    estado = VALUES(estado),
    veterinario = VALUES(veterinario),
    tratamiento_indicado = VALUES(tratamiento_indicado),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO montas (
    id, vaca_id, toro_id, fecha, resultado, observaciones
) VALUES
    ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000011', '2025-08-12', 'PRENADA', 'Servicio natural validado.'),
    ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007', '2025-08-18', 'PRENADA', 'Servicio natural con seguimiento.'),
    ('50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000011', '2025-08-25', 'PRENADA', 'Servicio natural sin complicaciones.')
ON DUPLICATE KEY UPDATE
    fecha = VALUES(fecha),
    resultado = VALUES(resultado),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO inseminaciones (
    id, vaca_id, fecha, genetica_usada, tecnico, costo, resultado, observaciones
) VALUES
    ('51000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', '2025-09-01', 'Semen Angus Premium AP-220', 'Tec. Pablo Ruiz', 24000.00, 'PRENADA', 'IA programada.'),
    ('51000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', '2025-09-04', 'Semen Brangus Elite BE-155', 'Tec. Pablo Ruiz', 26000.00, 'PRENADA', 'IA con protocolo IATF.')
ON DUPLICATE KEY UPDATE
    fecha = VALUES(fecha),
    genetica_usada = VALUES(genetica_usada),
    tecnico = VALUES(tecnico),
    costo = VALUES(costo),
    resultado = VALUES(resultado),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO controles_prenez (
    id, vaca_id, fecha_diagnostico, estado, fecha_estimada_parto, nivel_riesgo_parto, veterinario, observaciones
) VALUES
    ('52000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2025-09-15', 'PRENADA', '2026-05-24', 'ALTO', 'Dra. Laura Medina', 'Ecografia positiva. Prioridad alta por cercania.'),
    ('52000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '2025-09-18', 'PRENADA', '2026-05-27', 'MEDIO', 'Dra. Laura Medina', 'Control de rutina.'),
    ('52000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '2025-09-23', 'PRENADA', '2026-05-30', 'BAJO', 'Dr. Martin Silva', 'Sin indicadores de riesgo.'),
    ('52000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', '2025-10-01', 'PRENADA', '2026-06-01', 'MEDIO', 'Dra. Laura Medina', 'Seguimiento medio.'),
    ('52000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', '2025-10-04', 'PRENADA', '2026-06-03', 'BAJO', 'Dr. Martin Silva', 'Control normal.')
ON DUPLICATE KEY UPDATE
    fecha_diagnostico = VALUES(fecha_diagnostico),
    estado = VALUES(estado),
    fecha_estimada_parto = VALUES(fecha_estimada_parto),
    nivel_riesgo_parto = VALUES(nivel_riesgo_parto),
    veterinario = VALUES(veterinario),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO partos (
    id, madre_id, ternero_id, fecha, complicaciones, viabilidad_ternero, observaciones
) VALUES
    ('53000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000008', '2023-10-02', NULL, 'VIABLE', 'Parto normal. Ternero 55555 asociado.'),
    ('53000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', NULL, '2025-05-28', 'Asistencia leve', 'VIABLE', 'Parto anterior viable.')
ON DUPLICATE KEY UPDATE
    fecha = VALUES(fecha),
    complicaciones = VALUES(complicaciones),
    viabilidad_ternero = VALUES(viabilidad_ternero),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO indices_geneticos (
    id, animal_id, fecha_evaluacion, epd, dep, indice_productivo, fuente, observaciones
) VALUES
    ('54000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2026-04-01', 72.00, 68.00, 75.00, 'Mock evaluacion interna', 'Excelente base materna.'),
    ('54000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007', '2026-04-01', 88.00, 82.00, 90.00, 'Mock evaluacion interna', 'Toro recomendado.'),
    ('54000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000011', '2026-04-01', 80.00, 78.00, 84.00, 'Mock evaluacion interna', 'Buen indice productivo.'),
    ('54000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', '2026-04-01', 65.00, 70.00, 72.00, 'Mock evaluacion interna', 'Linea materna estable.')
ON DUPLICATE KEY UPDATE
    fecha_evaluacion = VALUES(fecha_evaluacion),
    epd = VALUES(epd),
    dep = VALUES(dep),
    indice_productivo = VALUES(indice_productivo),
    fuente = VALUES(fuente),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

-- =============================================================
-- Mock manual de datos para pruebas de agricultura.
-- Incluye lotes, ciclo agricola, cosecha, suelo e historial.
-- =============================================================

INSERT INTO lotes (
    id, nombre, area, cultivo, latitud, longitud, temporada, poligono,
    ph_minimo, ph_maximo, fecha_siembra, fecha_cosecha_estimada
) VALUES
    (
        '60000000-0000-0000-0000-000000000001',
        'Lote Norte 1',
        157.78,
        'MAIZ',
        -36.1966878,
        -60.6735049,
        '2026',
        CAST('{"type":"Polygon","coordinates":[[[-60.6965793,-36.1823326],[-60.6676145,-36.2091681],[-60.6563210,-36.1985626],[-60.6965793,-36.1823326]]]}' AS JSON),
        5.70,
        7.20,
        '2025-09-15',
        '2026-02-20'
    ),
    (
        '60000000-0000-0000-0000-000000000002',
        'Lote Sur 4',
        98.45,
        'SOJA',
        -36.2141200,
        -60.6419000,
        '2026',
        CAST('{"type":"Polygon","coordinates":[[[-60.6509000,-36.2071000],[-60.6315000,-36.2178000],[-60.6428000,-36.2312000],[-60.6622000,-36.2195000],[-60.6509000,-36.2071000]]]}' AS JSON),
        5.90,
        6.80,
        '2025-11-05',
        '2026-04-12'
    ),
    (
        '60000000-0000-0000-0000-000000000003',
        'Lote Oeste 2',
        121.30,
        'TRIGO',
        -36.1785000,
        -60.7023000,
        '2025',
        CAST('{"type":"Polygon","coordinates":[[[-60.7165000,-36.1710000],[-60.6935000,-36.1745000],[-60.6981000,-36.1902000],[-60.7210000,-36.1874000],[-60.7165000,-36.1710000]]]}' AS JSON),
        6.10,
        7.10,
        '2025-06-10',
        '2025-12-05'
    ),
    (
        '60000000-0000-0000-0000-000000000004',
        'Lote Bajo 7',
        76.62,
        'GIRASOL',
        -36.2326000,
        -60.6892000,
        '2026',
        CAST('{"type":"Polygon","coordinates":[[[-60.6990000,-36.2246000],[-60.6812000,-36.2263000],[-60.6828000,-36.2410000],[-60.7035000,-36.2386000],[-60.6990000,-36.2246000]]]}' AS JSON),
        5.60,
        6.70,
        '2025-10-01',
        '2026-03-15'
    )
ON DUPLICATE KEY UPDATE
    nombre = VALUES(nombre),
    area = VALUES(area),
    cultivo = VALUES(cultivo),
    latitud = VALUES(latitud),
    longitud = VALUES(longitud),
    temporada = VALUES(temporada),
    poligono = VALUES(poligono),
    ph_minimo = VALUES(ph_minimo),
    ph_maximo = VALUES(ph_maximo),
    fecha_siembra = VALUES(fecha_siembra),
    fecha_cosecha_estimada = VALUES(fecha_cosecha_estimada),
    deleted_at = NULL;

INSERT INTO eventos_siembra (
    id, lote_id, tipo_evento, estado_fenologico, descripcion, fecha
) VALUES
    ('61000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'SIEMBRA', 'V1', 'Siembra directa con densidad objetivo y fertilizacion base.', '2025-09-15'),
    ('61000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', 'MONITOREO_FENOLOGICO', 'V6', 'Emergencia uniforme. Buen stand de plantas.', '2025-10-20'),
    ('61000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000001', 'TRATAMIENTO', 'V8', 'Aplicacion preventiva por presion inicial de malezas.', '2025-11-08'),
    ('61000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000002', 'SIEMBRA', 'VE', 'Implantacion de soja con humedad adecuada.', '2025-11-05'),
    ('61000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000002', 'MONITOREO_FENOLOGICO', 'R1', 'Inicio de floracion con buen cierre de surco.', '2026-01-12'),
    ('61000000-0000-0000-0000-000000000006', '60000000-0000-0000-0000-000000000003', 'SIEMBRA', 'Z10', 'Siembra de trigo en lote de rotacion.', '2025-06-10'),
    ('61000000-0000-0000-0000-000000000007', '60000000-0000-0000-0000-000000000003', 'ALERTA', 'Z32', 'Alerta por deficit hidrico moderado.', '2025-09-02'),
    ('61000000-0000-0000-0000-000000000008', '60000000-0000-0000-0000-000000000004', 'SIEMBRA', 'V2', 'Siembra de girasol con lote bajo monitoreo.', '2025-10-01')
ON DUPLICATE KEY UPDATE
    tipo_evento = VALUES(tipo_evento),
    estado_fenologico = VALUES(estado_fenologico),
    descripcion = VALUES(descripcion),
    fecha = VALUES(fecha),
    deleted_at = NULL;

INSERT INTO registros_cosecha (
    id, lote_id, fecha, rendimiento_kg_ha, toneladas_total, calidad_grano, humedad, observaciones
) VALUES
    ('62000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '2026-02-20', 9450.00, 1491.02, 'PREMIUM', 13.20, 'Maiz con excelente rendimiento y humedad dentro de rango.'),
    ('62000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', '2026-04-12', 3480.00, 342.61, 'ESTANDAR', 12.80, 'Soja con rendimiento estable.'),
    ('62000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000003', '2025-12-05', 5120.00, 621.06, 'PREMIUM', 11.50, 'Trigo premium con buena calidad panadera.'),
    ('62000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000004', '2026-03-15', 2860.00, 219.13, 'ESTANDAR', 9.70, 'Girasol con aceite dentro de parametros esperados.')
ON DUPLICATE KEY UPDATE
    fecha = VALUES(fecha),
    rendimiento_kg_ha = VALUES(rendimiento_kg_ha),
    toneladas_total = VALUES(toneladas_total),
    calidad_grano = VALUES(calidad_grano),
    humedad = VALUES(humedad),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO propiedades_suelo (
    id, lote_id, fecha, ph, nitrogeno_kg_ha, fosforo_kg_ha, potasio_kg_ha,
    materia_organica_pct, conductividad_electrica, observaciones
) VALUES
    ('63000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '2025-08-20', 6.40, 78.00, 18.50, 310.00, 3.20, 0.820, 'Suelo apto para maiz de alto potencial.'),
    ('63000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', '2025-10-15', 6.20, 62.00, 16.30, 285.00, 2.80, 0.760, 'Lote con buena disponibilidad para soja.'),
    ('63000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000003', '2025-05-18', 6.70, 55.00, 21.00, 295.00, 3.60, 0.690, 'Trigo con buena base de fosforo.'),
    ('63000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000004', '2025-09-10', 6.00, 48.00, 14.80, 260.00, 2.50, 0.910, 'Requiere seguimiento por posicion baja.')
ON DUPLICATE KEY UPDATE
    fecha = VALUES(fecha),
    ph = VALUES(ph),
    nitrogeno_kg_ha = VALUES(nitrogeno_kg_ha),
    fosforo_kg_ha = VALUES(fosforo_kg_ha),
    potasio_kg_ha = VALUES(potasio_kg_ha),
    materia_organica_pct = VALUES(materia_organica_pct),
    conductividad_electrica = VALUES(conductividad_electrica),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO historico_cultivos (
    id, lote_id, cultivo, temporada, fecha_siembra, fecha_cosecha, rendimiento_kg_ha, observaciones
) VALUES
    ('64000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'MAIZ', '2026', '2025-09-15', '2026-02-20', 9450.00, 'Campana maicera de referencia.'),
    ('64000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', 'SOJA', '2025', '2024-11-10', '2025-04-02', 3220.00, 'Rotacion previa a maiz.'),
    ('64000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000002', 'SOJA', '2026', '2025-11-05', '2026-04-12', 3480.00, 'Soja de primera.'),
    ('64000000-0000-0000-0000-000000000004', '60000000-0000-0000-0000-000000000003', 'TRIGO', '2025', '2025-06-10', '2025-12-05', 5120.00, 'Trigo premium.'),
    ('64000000-0000-0000-0000-000000000005', '60000000-0000-0000-0000-000000000004', 'GIRASOL', '2026', '2025-10-01', '2026-03-15', 2860.00, 'Girasol en lote bajo.')
ON DUPLICATE KEY UPDATE
    cultivo = VALUES(cultivo),
    temporada = VALUES(temporada),
    fecha_siembra = VALUES(fecha_siembra),
    fecha_cosecha = VALUES(fecha_cosecha),
    rendimiento_kg_ha = VALUES(rendimiento_kg_ha),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

COMMIT;
