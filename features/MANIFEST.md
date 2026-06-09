# Manifest de Features - Campo App

## Proposito
Este archivo es el registro operativo de features de Campo App. Debe indicar que historias existen, cuales estan realizadas, cuales estan pendientes y cuales quedaron diferidas o saltadas.

## Regla de Mantenimiento
- Cada vez que se cree una feature nueva, agregarla a este manifest con estado `Pendiente`.
- Cada vez que se termine una feature, actualizar su estado a `Realizada` o `Parcial` segun corresponda.
- Cuando una feature quede `Realizada`, su archivo debe incluir `_COMPLETA_` entre el numero y la primera palabra del nombre.
- Si una feature queda fuera de alcance y se reemplaza por otra, marcarla como `Saltada` o `Diferida` y explicar el motivo.
- Si durante una feature se detectan pendientes, crear una nueva feature numerada con `max + 1` y agregarla a este manifest.

## Estados
- `Realizada`: implementada y validada tecnicamente en el alcance definido.
- `Parcial`: hay core operativo implementado, pero quedaron pendientes avanzados documentados en otra feature.
- `Pendiente`: especificada, no implementada o no validada.
- `Saltada`: se decidio no desarrollarla por ahora o fue reemplazada por otra feature.

## Resumen
- Total de historias registradas: 43
- Realizadas: 21
- Parciales: 0
- Pendientes: 20
- Saltadas: 2
- Ultima actualizacion: 2026-06-08

## Registro por Feature

| Feature | Archivo | Dominio | Estado | Registro |
|---|---|---|---|---|
| 00 | `00_COMPLETA_agricultura_monitoreo_siembra_cosecha.md` | Agricultura | Realizada | Core de siembra/cosecha implementado y marcado como finalizado. Pendientes avanzados/offline quedan derivados a feature 27. |
| 00_01 | `00_01_COMPLETA_faltantes.md` | Agricultura | Realizada | Feature historica de faltantes 00/01 marcada como finalizada. |
| 01 | `01_COMPLETA_agricultura_gestion_lotes.md` | Agricultura | Realizada | Gestion de lotes implementada y marcada como finalizada. Pendientes avanzados/offline quedan derivados a feature 27. |
| 02 | `02_COMPLETA_clima_monitoreo_e_integracion.md` | Clima | Realizada | Integracion Open-Meteo y cards climaticas implementadas y marcadas como finalizadas. Pendientes avanzados quedan derivados a feature 28. |
| 03 | `03_COMPLETA_agricultura_rendimiento_analytics.md` | Agricultura | Realizada | Analytics agricola desarrollado con backend, frontend y graficos uPlot. |
| 04 | `04_COMPLETA_ganaderia_trazabilidad_animal.md` | Ganaderia | Realizada | Trazabilidad core y UI enterprise implementadas y marcadas como finalizadas. Pendientes avanzados SENASA/RFID/offline quedan derivados a feature 30. |
| 05 | `05_COMPLETA_ganaderia_sanidad_vacunacion.md` | Ganaderia | Realizada | Sanidad/vacunacion core implementado con catalogo, aplicaciones, alertas y UI premium, marcado como finalizado. Pendientes avanzados quedan derivados a feature 32. |
| 06 | `06_COMPLETA_ganaderia_reproduccion_genealogia.md` | Ganaderia | Realizada | Core operativo de reproduccion, genealogia, alertas de parto y recomendaciones implementado. Pendientes avanzados derivados a features 33 y 34. |
| 07 | `07_COMPLETA_ganaderia_alimentacion_monitoreo.md` | Ganaderia | Realizada | Core de alimentacion, dietas, suministros, pesajes y dashboard implementado. Pendientes avanzados derivados a feature 35. |
| 08 | `08_COMPLETA_maquinaria_inventario_control.md` | Maquinaria | Realizada | Inventario de maquinaria implementado con UI y datos mock de prueba. |
| 09 | `09_COMPLETA_maquinaria_mantenimiento_preventivo.md` | Maquinaria | Realizada | Mantenimiento preventivo implementado con backend, frontend, mock data y UI de tabs/cards premium. Pendientes avanzados derivados a feature 36. |
| 10 | `10_SALTEAR_maquinaria_gps_telemetria.md` | Maquinaria | Saltada | Feature marcada explicitamente como SALTEAR. |
| 11 | `11_SALTEAR_maquinaria_consumo_combustible.md` | Maquinaria | Saltada | Feature marcada explicitamente como SALTEAR. |
| 12 | `12_COMPLETA_operarios_gestion_administracion.md` | Operarios | Realizada | Gestion de operarios implementada con backend CRUD, documentacion, cambios de rol, dashboard y pantalla Angular premium. El alta genera usuario automaticamente con password inicial igual al username. |
| 13 | `13_COMPLETA_operarios_ordenes_trabajo.md` | Operarios | Realizada | Ordenes de trabajo implementadas con backend, frontend, actividades, estados, aceptacion/rechazo e historial. Asignacion de maquinas excluida por pedido explicito. |
| 14 | `14_operarios_asignaciones_disponibilidad.md` | Operarios | Pendiente | Asignaciones y disponibilidad pendiente. |
| 15 | `15_inventario_insumos_agricolas.md` | Inventario | Pendiente | Inventario agricola de insumos pendiente; requerido para fitosanitarios avanzados. |
| 16 | `16_inventario_stock_control.md` | Inventario | Pendiente | Stock y control centralizado pendiente. |
| 17 | `17_finanzas_facturacion_ventas.md` | Finanzas | Pendiente | Facturacion y ventas pendiente. |
| 18 | `18_finanzas_compras_proveedores.md` | Finanzas | Pendiente | Compras y proveedores pendiente. |
| 19 | `19_finanzas_reportes_financieros.md` | Finanzas | Pendiente | Reportes financieros pendiente. |
| 20 | `20_geo_mapas_lotes.md` | Geolocalizacion | Pendiente | Mapas/geolocalizacion avanzada pendiente; el mapa de lotes operativo existe de forma parcial en agricultura. |
| 21 | `21_geo_tracking_operarios.md` | Geolocalizacion | Pendiente | Tracking de operarios pendiente. |
| 22 | `22_reportes_operacionales.md` | Reportes | Pendiente | Reportes operacionales pendiente. |
| 10-reportes | `10_COMPLETA_reportes_agricola_ganaderia.md` | Reportes/Agricultura | Realizada | Dashboard Agricola Ejecutivo Premium implementado en `/reportes/agricola` consumiendo `GET /api/v1/reportes/agricola/dashboard`, sin datos mockeados en frontend. |
| 24 | `24_sincronizacion_offline_first.md` | Infraestructura | Pendiente | Offline-first transversal pendiente. |
| 25 | `25_agricultura_control_plagas_enfermedades.md` | Agricultura | Pendiente | Reformulada como capa avanzada de plagas: camara real, offline, IA, recomendaciones, inventario, regulacion y reportes. |
| 26 | `26_COMPLETA_autenticacion_seguridad_login_tokens.md` | Seguridad | Realizada | Autenticacion JWT, refresh tokens, RBAC y validez de token extendida implementadas. |
| 27 | `27_agricultura_offline_validacion_cierre_00_01.md` | Agricultura | Pendiente | Cierre avanzado/offline de features 00 y 01 pendiente. |
| 28 | `28_clima_pronostico_15_dias_cache_dashboard.md` | Clima | Pendiente | Pronostico real 15 dias, cache/offline cliente y dashboard climatico avanzado pendiente. |
| 29 | `29_agricultura_prediccion_ml_avanzada.md` | Agricultura | Pendiente | Prediccion ML agricola avanzada pendiente. |
| 30 | `30_ganaderia_integracion_senasa_rfid_offline.md` | Ganaderia | Pendiente | Integracion SENASA/RFID/offline avanzada pendiente. |
| 31 | `31_COMPLETA_ganaderia_selectores_potreros_personal.md` | Frontend/Ganaderia | Realizada | Componente generico select-buscador implementado y aplicado en animales, potreros, personal, veterinarios, responsables, plagas, sanidad y alimentacion. |
| 32 | `32_ganaderia_sanidad_notificaciones_offline_mobile.md` | Ganaderia | Pendiente | Sanidad avanzada: notificaciones, offline/mobile y selectores en registros pendiente. |
| 33 | `33_ganaderia_reproduccion_offline_laboratorio_genetica_avanzada.md` | Ganaderia | Pendiente | Reproduccion avanzada offline/laboratorio/genetica pendiente. |
| 34 | `34_ganaderia_ficha_tecnica_reproductiva_avanzada.md` | Ganaderia | Pendiente | Ficha tecnica reproductiva avanzada pendiente. |
| 35 | `35_ganaderia_alimentacion_offline_balanzas_nrc_inra.md` | Ganaderia | Pendiente | Alimentacion avanzada offline, balanzas e integracion nutricional pendiente. |
| 36 | `36_maquinaria_mantenimiento_offline_notificaciones_avanzadas.md` | Maquinaria | Pendiente | Mantenimiento avanzado offline/notificaciones pendiente. |
| 37 | `37_COMPLETA_agricultura_control_plagas_fitosanitarios.md` | Agricultura | Realizada | Core operativo de plagas y aplicaciones fitosanitarias implementado: backend, web, mobile base, mapa con pins y tests. |
| 38 | `38_COMPLETA_ganaderia_potreros_mapa_interactivo.md` | Ganaderia | Realizada | Pantalla de potreros con mapa interactivo, dibujo de multiples poligonos, popup de alta y persistencia implementada. |
| 39 | `39_mobile_primer_login_cambio_password_obligatorio.md` | Seguridad/Mobile | Pendiente | Cambio obligatorio de contraseña en primer login mobile para usuarios creados automaticamente desde operarios. |
| 40 | `40_COMPLETA_operaciones_calendario_operaciones.md` | Operaciones | Realizada | Calendario semanal operativo para ordenes de trabajo, con filtros, chips de operarios, popup de seguimiento, cambio de estado y registro de actividad. |
| 41 | `41_COMPLETA_roles_menu_permisos.md` | Seguridad/Frontend | Realizada | Pantalla administrativa para definir opciones de menu visibles por rol, con backend persistido y sidebar filtrado por permisos. |
| 42 | `42_COMPLETA_dashboard_ganadero_ejecutivo.md` | Ganaderia/Reportes | Realizada | Dashboard Ganadero Ejecutivo implementado con endpoint backend-driven, KPIs, graficos, alertas operativas y analitica del rodeo. |

## Registro por Dominio

### Agricultura
- Realizadas: 00, 00_01, 01, 03, 10-reportes, 37.
- Parciales: ninguna.
- Pendientes: 25, 27, 29.

### Clima
- Realizadas: 02.
- Parciales: ninguna.
- Pendientes: 28.

### Ganaderia
- Realizadas: 04, 05, 06, 07, 31, 38, 42.
- Parciales: ninguna.
- Pendientes: 30, 32, 33, 34, 35.

### Maquinaria
- Realizadas: 08, 09.
- Saltadas: 10, 11.
- Pendientes: 36.

### Operarios
- Realizadas: 12, 13.
- Pendientes: 14.

### Operaciones
- Realizadas: 40.

### Inventario
- Pendientes: 15, 16.

### Finanzas
- Pendientes: 17, 18, 19.

### Geolocalizacion
- Pendientes: 20, 21.

### Reportes
- Realizadas: 10-reportes.
- Pendientes: 22.

### Infraestructura
- Pendientes: 24.

### Seguridad
- Realizadas: 26, 41.
- Pendientes: 39.

## Ultimas Actualizaciones
- 2026-06-08: Feature 42 realizada con Dashboard Ganadero Ejecutivo backend-driven, endpoint de reportes ganaderos y pantalla Angular premium.
- 2026-06-07: Feature 41 realizada con administracion de visibilidad de menu por rol, endpoint de menu visible y sidebar filtrado.
- 2026-06-06: Feature 31 realizada con componente generico de select buscador aplicado a animales, potreros, operarios, veterinarios, responsables, plagas, sanidad y alimentacion.
- 2026-06-06: Feature 40 realizada con Calendario de Operaciones semanal basado en ordenes de trabajo, filtros, chips, popup de detalle y acciones de seguimiento.
- 2026-06-05: Feature 13 realizada con ordenes de trabajo, actividades, estados, aceptacion/rechazo e historial. Tarea 4 de asignacion de maquinas excluida.
- 2026-06-05: Feature 39 creada para cambio obligatorio de contraseña en primer login mobile de usuarios generados desde operarios.
- 2026-06-05: Feature 12 ajustada para eliminar jornadas y evaluaciones de operarios del backend, frontend y migracion.
- 2026-06-05: Feature 12 ajustada para generar usuario automaticamente en alta de operario y eliminar legajo/email/contrato/jornada/area/ubicacion del registro.
- 2026-06-05: Feature 12 realizada con backend de operarios, documentacion, historial de roles y pantalla Angular de gestion.
- 2026-06-05: Features 00_01, 00, 01, 02, 04 y 05 marcadas como realizadas y renombradas con `_COMPLETA_`.
- 2026-06-05: Feature 38 realizada con backend CRUD de potreros, mapa interactivo Angular, dibujo de poligonos y popup de alta.
- 2026-05-29: Feature `10-reportes` marcada como realizada con dashboard agricola ejecutivo premium backend-driven.
- 2026-05-29: `10_COMPLETA_reportes_agricola_ganaderia.md` reemplazado por la especificacion Dashboard Agricola Ejecutivo Premium y registrado como `10-reportes` para no colisionar con `10_SALTEAR_maquinaria_gps_telemetria.md`.
- 2026-05-26: Feature 37 marcada como realizada.
- 2026-05-26: Feature 25 reformulada para cubrir pendientes avanzados no incluidos en 37.
- 2026-05-26: Feature 31 actualizada para incluir selector buscador de responsable en plagas.
- 2026-05-26: Manifest reescrito como registro operativo de estado de features.


