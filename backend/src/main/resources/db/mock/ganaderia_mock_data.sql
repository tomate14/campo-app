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

COMMIT;
