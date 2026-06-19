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
-- Datos adicionales para Dashboard Ganadero Ejecutivo.
-- Cubren potreros, pesajes, dietas, alimentacion y mas eventos
-- sanitarios/reproductivos para que todos los graficos muestren datos.
-- =============================================================

INSERT INTO potreros (
    id, nombre, descripcion, superficie_ha, tipo_uso, estado, capacidad_animales,
    recurso_forrajero, disponibilidad_agua, tiene_sombra,
    observaciones, poligono, centroide_latitud, centroide_longitud, created_at, updated_at
) VALUES
    ('15000000-0000-0000-0000-000000000001', 'Potrero 12A', 'Pastoreo intensivo para vacas preparto.', 1456.00, 'PASTOREO', 'ACTIVO', 1500, 'CAMPO NATURAL', b'1', b'1', 'Alta carga, requiere seguimiento semanal.', CAST('{"type":"Polygon","coordinates":[[[-59.164250,-37.336402],[-59.161250,-37.336402],[-59.161250,-37.339402],[-59.164250,-37.339402],[-59.164250,-37.336402]]]}' AS JSON), -37.3379020, -59.1627500, NOW(6), NOW(6)),
    ('15000000-0000-0000-0000-000000000002', 'Potrero 7B', 'Pastoreo de vacas en ultimo tercio.', 920.00, 'MATERNIDAD', 'ACTIVO', 980, 'PASTURA', b'1', b'1', 'Buena oferta forrajera.', CAST('{"type":"Polygon","coordinates":[[[-59.161250,-37.336402],[-59.158250,-37.336402],[-59.158250,-37.339402],[-59.161250,-37.339402],[-59.161250,-37.336402]]]}' AS JSON), -37.3379020, -59.1597500, NOW(6), NOW(6)),
    ('15000000-0000-0000-0000-000000000003', 'Potrero 5C', 'Recria y vacas de bajo riesgo.', 780.00, 'RECRIA', 'ACTIVO', 820, 'VERDEO', b'1', b'0', 'Sin sombra suficiente en sector norte.', CAST('{"type":"Polygon","coordinates":[[[-59.164250,-37.339402],[-59.161250,-37.339402],[-59.161250,-37.342402],[-59.164250,-37.342402],[-59.164250,-37.339402]]]}' AS JSON), -37.3409020, -59.1627500, NOW(6), NOW(6)),
    ('15000000-0000-0000-0000-000000000004', 'Potrero 9A', 'Lote de servicio y seguimiento reproductivo.', 640.00, 'PASTOREO', 'DESCANSO', 620, 'ALFALFA', b'1', b'1', 'Descanso parcial por recuperacion de cobertura.', CAST('{"type":"Polygon","coordinates":[[[-59.161250,-37.339402],[-59.158250,-37.339402],[-59.158250,-37.342402],[-59.161250,-37.342402],[-59.161250,-37.339402]]]}' AS JSON), -37.3409020, -59.1597500, NOW(6), NOW(6)),
    ('15000000-0000-0000-0000-000000000005', 'Potrero Madres', 'Rodeo de madres elite.', 1180.00, 'MATERNIDAD', 'ACTIVO', 1100, 'PASTURA', b'1', b'1', 'Rodeo estable con alta carga.', CAST('{"type":"Polygon","coordinates":[[[-59.167250,-37.336402],[-59.164250,-37.336402],[-59.164250,-37.339402],[-59.167250,-37.339402],[-59.167250,-37.336402]]]}' AS JSON), -37.3379020, -59.1657500, NOW(6), NOW(6)),
    ('15000000-0000-0000-0000-000000000006', 'Potrero Toros', 'Sector de toros activos.', 560.00, 'RESERVA', 'ACTIVO', 180, 'CAMPO NATURAL', b'1', b'1', 'Control de alambrados mensual.', CAST('{"type":"Polygon","coordinates":[[[-59.158250,-37.336402],[-59.155250,-37.336402],[-59.155250,-37.339402],[-59.158250,-37.339402],[-59.158250,-37.336402]]]}' AS JSON), -37.3379020, -59.1567500, NOW(6), NOW(6)),
    ('15000000-0000-0000-0000-000000000007', 'Potrero Recria', 'Recria de terneros y novillos.', 890.00, 'RECRIA', 'ACTIVO', 950, 'VERDEO', b'1', b'0', 'Asignar sombra artificial en verano.', CAST('{"type":"Polygon","coordinates":[[[-59.167250,-37.339402],[-59.164250,-37.339402],[-59.164250,-37.342402],[-59.167250,-37.342402],[-59.167250,-37.339402]]]}' AS JSON), -37.3409020, -59.1657500, NOW(6), NOW(6))
ON DUPLICATE KEY UPDATE
    nombre = VALUES(nombre),
    descripcion = VALUES(descripcion),
    superficie_ha = VALUES(superficie_ha),
    tipo_uso = VALUES(tipo_uso),
    estado = VALUES(estado),
    capacidad_animales = VALUES(capacidad_animales),
    recurso_forrajero = VALUES(recurso_forrajero),
    disponibilidad_agua = VALUES(disponibilidad_agua),
    tiene_sombra = VALUES(tiene_sombra),
    observaciones = VALUES(observaciones),
    poligono = VALUES(poligono),
    centroide_latitud = VALUES(centroide_latitud),
    centroide_longitud = VALUES(centroide_longitud),
    deleted_at = NULL;

INSERT INTO animales (
    id, caravana, raza, sexo, fecha_nacimiento, fecha_compra, peso_actual_kg,
    rfid_codigo, qr_codigo, estado, ubicacion_actual, madre_id, padre_id, observaciones
) VALUES
    ('10000000-0000-0000-0000-000000000012', '2010', 'Brangus', 'Masculino', '2024-09-10', NULL, 365.00, 'RFID-2010', NULL, 'ACTIVO', 'Potrero Recria', NULL, NULL, 'Novillo de recria.'),
    ('10000000-0000-0000-0000-000000000013', '2011', 'Hereford', 'Masculino', '2024-08-18', NULL, 352.00, 'RFID-2011', NULL, 'ACTIVO', 'Potrero Recria', NULL, NULL, 'Novillo en seguimiento de ganancia.'),
    ('10000000-0000-0000-0000-000000000014', '2012', 'Angus Negro', 'Femenino', '2024-10-02', NULL, 318.00, 'RFID-2012', NULL, 'ACTIVO', 'Potrero 5C', NULL, NULL, 'Vaquillona de reposicion.'),
    ('10000000-0000-0000-0000-000000000015', '2013', 'Braford', 'Femenino', '2025-09-01', NULL, 205.00, 'RFID-2013', NULL, 'ACTIVO', 'Potrero 7B', NULL, NULL, 'Ternera destete temprano.'),
    ('10000000-0000-0000-0000-000000000016', '2014', 'Angus Colorado', 'Masculino', '2025-10-12', NULL, 218.00, 'RFID-2014', NULL, 'ACTIVO', 'Potrero 5C', NULL, NULL, 'Ternero en recria.'),
    ('10000000-0000-0000-0000-000000000017', '2015', 'Brangus', 'Femenino', '2023-02-04', '2023-08-01', 462.00, 'RFID-2015', NULL, 'ACTIVO', 'Potrero 9A', NULL, NULL, 'Vaquillona en control reproductivo.'),
    ('10000000-0000-0000-0000-000000000018', '2016', 'Angus Negro', 'Femenino', '2020-12-08', '2021-07-01', 598.00, 'RFID-2016', NULL, 'ACTIVO', 'Potrero Madres', NULL, NULL, 'Madre en rodeo elite.'),
    ('10000000-0000-0000-0000-000000000019', '2017', 'Hereford', 'Masculino', '2018-03-15', '2019-01-20', 905.00, 'RFID-2017', NULL, 'ACTIVO', 'Potrero Toros', NULL, NULL, 'Toro activo de respaldo.'),
    ('10000000-0000-0000-0000-000000000020', '2018', 'Angus Negro', 'Femenino', '2022-04-15', '2022-11-01', 512.00, 'RFID-2018', NULL, 'ACTIVO', NULL, NULL, NULL, 'Animal mock sin ubicacion para KPI.')
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

UPDATE animales SET madre_id = '10000000-0000-0000-0000-000000000006', padre_id = '10000000-0000-0000-0000-000000000011' WHERE id IN (
    '10000000-0000-0000-0000-000000000012',
    '10000000-0000-0000-0000-000000000013',
    '10000000-0000-0000-0000-000000000014',
    '10000000-0000-0000-0000-000000000015',
    '10000000-0000-0000-0000-000000000016',
    '10000000-0000-0000-0000-000000000017',
    '10000000-0000-0000-0000-000000000018'
);

INSERT INTO pesajes_animales (
    id, animal_id, fecha, peso_kg, condicion_corporal, metodo, responsable, observaciones
) VALUES
    ('70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000012', DATE_SUB(CURDATE(), INTERVAL 75 DAY), 312.00, 3.2, 'Balanza electronica', 'Juan Perez', 'Pesaje inicial recria.'),
    ('70000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000012', DATE_SUB(CURDATE(), INTERVAL 15 DAY), 365.00, 3.5, 'Balanza electronica', 'Juan Perez', 'Buena ganancia.'),
    ('70000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000013', DATE_SUB(CURDATE(), INTERVAL 75 DAY), 306.00, 3.0, 'Balanza electronica', 'Maria Gomez', 'Pesaje inicial.'),
    ('70000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000013', DATE_SUB(CURDATE(), INTERVAL 15 DAY), 352.00, 3.4, 'Balanza electronica', 'Maria Gomez', 'Ganancia sostenida.'),
    ('70000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000014', DATE_SUB(CURDATE(), INTERVAL 70 DAY), 280.00, 3.1, 'Cinta bovina', 'Juan Perez', 'Vaquillona en desarrollo.'),
    ('70000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000014', DATE_SUB(CURDATE(), INTERVAL 12 DAY), 318.00, 3.3, 'Cinta bovina', 'Juan Perez', 'Desarrollo correcto.'),
    ('70000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000015', DATE_SUB(CURDATE(), INTERVAL 65 DAY), 168.00, 2.8, 'Balanza portatil', 'Maria Gomez', 'Destete.'),
    ('70000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000015', DATE_SUB(CURDATE(), INTERVAL 10 DAY), 205.00, 3.1, 'Balanza portatil', 'Maria Gomez', 'Recuperacion buena.'),
    ('70000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000016', DATE_SUB(CURDATE(), INTERVAL 65 DAY), 176.00, 2.9, 'Balanza portatil', 'Juan Perez', 'Destete.'),
    ('70000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000016', DATE_SUB(CURDATE(), INTERVAL 10 DAY), 218.00, 3.2, 'Balanza portatil', 'Juan Perez', 'Muy buena respuesta.')
ON DUPLICATE KEY UPDATE
    fecha = VALUES(fecha),
    peso_kg = VALUES(peso_kg),
    condicion_corporal = VALUES(condicion_corporal),
    metodo = VALUES(metodo),
    responsable = VALUES(responsable),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO dietas_nutricionales (
    id, nombre, tipo_animal, objetivo, materia_seca_kg, costo_diario, activa, observaciones
) VALUES
    ('71000000-0000-0000-0000-000000000001', 'Dieta recria intensiva', 'Novillos', 'Maximizar ganancia diaria en recria.', 7.80, 1850.00, b'1', 'Base silo de maiz y concentrado proteico.'),
    ('71000000-0000-0000-0000-000000000002', 'Dieta preparto mineral', 'Vacas preparto', 'Mejorar condicion corporal y balance mineral.', 9.20, 2100.00, b'1', 'Incluye sales anionicas y nucleo mineral.'),
    ('71000000-0000-0000-0000-000000000003', 'Dieta terneros destete', 'Terneros', 'Adaptacion ruminal y crecimiento temprano.', 4.10, 980.00, b'1', 'Racion inicial con fibra efectiva.'),
    ('71000000-0000-0000-0000-000000000004', 'Dieta toros servicio', 'Toros', 'Mantener condicion durante servicio.', 10.50, 2350.00, b'1', 'Suplementacion energetica controlada.'),
    ('71000000-0000-0000-0000-000000000005', 'Dieta mantenimiento madres', 'Vacas', 'Sostener condicion en madres elite.', 8.70, 1650.00, b'1', 'Pastoreo mas suplemento.'),
    ('71000000-0000-0000-0000-000000000006', 'Dieta verdeo invierno', 'Rodeo general', 'Complementar verdeos con fibra.', 6.50, 1320.00, b'1', 'Uso estacional.')
ON DUPLICATE KEY UPDATE
    tipo_animal = VALUES(tipo_animal),
    objetivo = VALUES(objetivo),
    materia_seca_kg = VALUES(materia_seca_kg),
    costo_diario = VALUES(costo_diario),
    activa = VALUES(activa),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO dieta_ingredientes (
    id, dieta_id, ingrediente, proporcion_pct, costo_kg, materia_seca_pct
) VALUES
    ('71100000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000001', 'Silo de maiz', 55.00, 95.00, 34.00),
    ('71100000-0000-0000-0000-000000000002', '71000000-0000-0000-0000-000000000001', 'Expeller de soja', 20.00, 280.00, 88.00),
    ('71100000-0000-0000-0000-000000000003', '71000000-0000-0000-0000-000000000002', 'Heno de alfalfa', 45.00, 130.00, 86.00),
    ('71100000-0000-0000-0000-000000000004', '71000000-0000-0000-0000-000000000002', 'Nucleo mineral preparto', 8.00, 620.00, 95.00),
    ('71100000-0000-0000-0000-000000000005', '71000000-0000-0000-0000-000000000003', 'Balanceado iniciador', 65.00, 340.00, 89.00),
    ('71100000-0000-0000-0000-000000000006', '71000000-0000-0000-0000-000000000004', 'Maiz partido', 35.00, 180.00, 87.00)
ON DUPLICATE KEY UPDATE
    ingrediente = VALUES(ingrediente),
    proporcion_pct = VALUES(proporcion_pct),
    costo_kg = VALUES(costo_kg),
    materia_seca_pct = VALUES(materia_seca_pct),
    deleted_at = NULL;

INSERT INTO registros_alimentacion (
    id, animal_id, dieta_id, fecha, alimento, cantidad_kg, costo_total, potrero, responsable, observaciones
) VALUES
    ('72000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000012', '71000000-0000-0000-0000-000000000001', DATE_SUB(CURDATE(), INTERVAL 150 DAY), 'Silo maiz + expeller', 1180.00, 290000.00, 'Potrero Recria', 'Juan Perez', 'Suministro mensual lote recria.'),
    ('72000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000013', '71000000-0000-0000-0000-000000000001', DATE_SUB(CURDATE(), INTERVAL 120 DAY), 'Silo maiz + expeller', 1250.00, 305000.00, 'Potrero Recria', 'Juan Perez', 'Consumo ajustado por carga.'),
    ('72000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000014', '71000000-0000-0000-0000-000000000003', DATE_SUB(CURDATE(), INTERVAL 90 DAY), 'Balanceado iniciador', 740.00, 210000.00, 'Potrero 5C', 'Maria Gomez', 'Adaptacion de terneras.'),
    ('72000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000015', '71000000-0000-0000-0000-000000000003', DATE_SUB(CURDATE(), INTERVAL 75 DAY), 'Balanceado iniciador', 620.00, 176000.00, 'Potrero 7B', 'Maria Gomez', 'Destete.'),
    ('72000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000002', DATE_SUB(CURDATE(), INTERVAL 60 DAY), 'Preparto mineral', 980.00, 260000.00, 'Potrero 12A', 'Juan Perez', 'Preparto vacas.'),
    ('72000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', '71000000-0000-0000-0000-000000000002', DATE_SUB(CURDATE(), INTERVAL 45 DAY), 'Preparto mineral', 1120.00, 298000.00, 'Potrero 7B', 'Juan Perez', 'Preparto vacas.'),
    ('72000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000018', '71000000-0000-0000-0000-000000000005', DATE_SUB(CURDATE(), INTERVAL 30 DAY), 'Suplemento madres', 1540.00, 352000.00, 'Potrero Madres', 'Maria Gomez', 'Madres elite.'),
    ('72000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000007', '71000000-0000-0000-0000-000000000004', DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'Maiz partido + nucleo', 880.00, 245000.00, 'Potrero Toros', 'Juan Perez', 'Toros de servicio.'),
    ('72000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000017', '71000000-0000-0000-0000-000000000006', DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'Verdeo + fibra', 970.00, 198000.00, 'Potrero 9A', 'Maria Gomez', 'Verdeo invierno.'),
    ('72000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000003', '71000000-0000-0000-0000-000000000005', CURDATE(), 'Suplemento madres', 1320.00, 315000.00, 'Potrero 5C', 'Juan Perez', 'Suministro del mes actual.')
ON DUPLICATE KEY UPDATE
    animal_id = VALUES(animal_id),
    dieta_id = VALUES(dieta_id),
    fecha = VALUES(fecha),
    alimento = VALUES(alimento),
    cantidad_kg = VALUES(cantidad_kg),
    costo_total = VALUES(costo_total),
    potrero = VALUES(potrero),
    responsable = VALUES(responsable),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO aplicaciones_vacuna (
    id, animal_id, vacuna_id, fecha_aplicacion, proxima_dosis_fecha, operario, lote_marca, costo_aplicado, observaciones
) VALUES
    ('41000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000012', '40000000-0000-0000-0000-000000000001', DATE_SUB(CURDATE(), INTERVAL 190 DAY), DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'Juan Perez', 'AFT-VENC-01', 1850.00, 'Vencida para probar alertas.'),
    ('41000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000013', '40000000-0000-0000-0000-000000000001', DATE_SUB(CURDATE(), INTERVAL 175 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Juan Perez', 'AFT-PROX-01', 1850.00, 'Proxima a vencer.'),
    ('41000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000014', '40000000-0000-0000-0000-000000000002', DATE_SUB(CURDATE(), INTERVAL 370 DAY), DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Maria Gomez', 'CLO-VENC-01', 980.00, 'Vencida clostridial.'),
    ('41000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000015', '40000000-0000-0000-0000-000000000002', DATE_SUB(CURDATE(), INTERVAL 350 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'Maria Gomez', 'CLO-PROX-01', 980.00, 'Proxima clostridial.')
ON DUPLICATE KEY UPDATE
    fecha_aplicacion = VALUES(fecha_aplicacion),
    proxima_dosis_fecha = VALUES(proxima_dosis_fecha),
    operario = VALUES(operario),
    lote_marca = VALUES(lote_marca),
    costo_aplicado = VALUES(costo_aplicado),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO diagnosticos_sanitarios (
    id, animal_id, fecha_diagnostico, enfermedad, severidad, estado, veterinario, tratamiento_indicado, observaciones
) VALUES
    ('43000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000012', DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'Cojera leve', 'BAJA', 'ABIERTO', 'Dr. Martin Silva', 'Reposo y observacion', 'Caso bajo para donut.'),
    ('43000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000013', DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'Neumonia inicial', 'ALTA', 'ABIERTO', 'Dra. Laura Medina', 'Antibiotico y control 48h', 'Caso alto para dashboard.'),
    ('43000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000014', DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Diarrea neonatal', 'CRITICA', 'ABIERTO', 'Dra. Laura Medina', 'Fluidoterapia y seguimiento intensivo', 'Caso critico para alerta operativa.'),
    ('43000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000017', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Dermatitis', 'MEDIA', 'ABIERTO', 'Dr. Martin Silva', 'Topico antiseptico', 'Caso medio para distribucion.')
ON DUPLICATE KEY UPDATE
    fecha_diagnostico = VALUES(fecha_diagnostico),
    enfermedad = VALUES(enfermedad),
    severidad = VALUES(severidad),
    estado = VALUES(estado),
    veterinario = VALUES(veterinario),
    tratamiento_indicado = VALUES(tratamiento_indicado),
    observaciones = VALUES(observaciones),
    deleted_at = NULL;

INSERT INTO tratamientos_medicamento (
    id, animal_id, fecha_inicio, fecha_fin, medicamento, dosis, via_aplicacion, responsable, motivo, costo, observaciones
) VALUES
    ('42000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000013', DATE_SUB(CURDATE(), INTERVAL 6 DAY), DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Oxitetraciclina LA', '20 ml', 'Intramuscular', 'Dra. Laura Medina', 'Neumonia inicial', 18500.00, 'Tratamiento activo.'),
    ('42000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000014', DATE_SUB(CURDATE(), INTERVAL 4 DAY), NULL, 'Suero oral y antibiotico', 'Segun peso', 'Oral', 'Dra. Laura Medina', 'Diarrea neonatal', 24000.00, 'Caso critico activo.'),
    ('42000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000017', DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Antiseptico topico', 'Aplicacion diaria', 'Topica', 'Dr. Martin Silva', 'Dermatitis', 9200.00, 'Tratamiento activo.')
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

INSERT INTO controles_prenez (
    id, vaca_id, fecha_diagnostico, estado, fecha_estimada_parto, nivel_riesgo_parto, veterinario, observaciones
) VALUES
    ('52000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000017', DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'VACIA', NULL, 'BAJO', 'Dr. Martin Silva', 'Control negativo para estado reproductivo.'),
    ('52000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000018', DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'EN_CONTROL', DATE_ADD(CURDATE(), INTERVAL 75 DAY), 'MEDIO', 'Dra. Laura Medina', 'Seguimiento pendiente.')
ON DUPLICATE KEY UPDATE
    fecha_diagnostico = VALUES(fecha_diagnostico),
    estado = VALUES(estado),
    fecha_estimada_parto = VALUES(fecha_estimada_parto),
    nivel_riesgo_parto = VALUES(nivel_riesgo_parto),
    veterinario = VALUES(veterinario),
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
        -37.3334020,
        -59.1672500,
        '2026',
        CAST('{"type":"Polygon","coordinates":[[[-59.173250,-37.327402],[-59.161250,-37.327402],[-59.161250,-37.339402],[-59.173250,-37.339402],[-59.173250,-37.327402]]]}' AS JSON),
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
        -37.3334020,
        -59.1552500,
        '2026',
        CAST('{"type":"Polygon","coordinates":[[[-59.161250,-37.327402],[-59.149250,-37.327402],[-59.149250,-37.339402],[-59.161250,-37.339402],[-59.161250,-37.327402]]]}' AS JSON),
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
        -37.3454020,
        -59.1672500,
        '2025',
        CAST('{"type":"Polygon","coordinates":[[[-59.173250,-37.339402],[-59.161250,-37.339402],[-59.161250,-37.351402],[-59.173250,-37.351402],[-59.173250,-37.339402]]]}' AS JSON),
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
        -37.3454020,
        -59.1552500,
        '2026',
        CAST('{"type":"Polygon","coordinates":[[[-59.161250,-37.339402],[-59.149250,-37.339402],[-59.149250,-37.351402],[-59.161250,-37.351402],[-59.161250,-37.339402]]]}' AS JSON),
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
