# Manifest de Features - Campo App

## Proposito
Este archivo es el registro operativo de features de Campo App. Debe indicar que historias existen, cuales estan realizadas, cuales estan pendientes y cuales quedaron diferidas o saltadas.

## Regla de Mantenimiento
- Cada vez que se cree una feature nueva, agregarla a este manifest con estado `Pendiente`.
- Cada vez que se termine una feature, actualizar su estado a `Realizada` o `Parcial` segun corresponda.
- Si una feature queda fuera de alcance y se reemplaza por otra, marcarla como `Saltada` o `Diferida` y explicar el motivo.
- Si durante una feature se detectan pendientes, crear una nueva feature numerada con `max + 1` y agregarla a este manifest.

## Estados
- `Realizada`: implementada y validada tecnicamente en el alcance definido.
- `Parcial`: hay core operativo implementado, pero quedaron pendientes avanzados documentados en otra feature.
- `Pendiente`: especificada, no implementada o no validada.
- `Saltada`: se decidio no desarrollarla por ahora o fue reemplazada por otra feature.

## Resumen
- Total de historias registradas: 39
- Realizadas: 7
- Parciales: 5
- Pendientes: 25
- Saltadas: 2
- Ultima actualizacion: 2026-05-26

## Registro por Feature

| Feature | Archivo | Dominio | Estado | Registro |
|---|---|---|---|---|
| 00 | `00_agricultura_monitoreo_siembra_cosecha.md` | Agricultura | Parcial | Core de siembra/cosecha implementado. Pendientes de cierre derivados a `27_agricultura_offline_validacion_cierre_00_01.md`. |
| 00_01 | `00_01_faltantes.md` | Agricultura | Pendiente | Feature historica de faltantes 00/01; el cierre operativo queda consolidado en feature 27. |
| 01 | `01_agricultura_gestion_lotes.md` | Agricultura | Parcial | Gestion de lotes implementada. Pendientes avanzados/offline derivados a feature 27. |
| 02 | `02_clima_monitoreo_e_integracion.md` | Clima | Parcial | Integracion Open-Meteo y cards climaticas implementadas. Pendientes de pronostico/cache/dashboard avanzado derivados a feature 28. |
| 03 | `03_agricultura_rendimiento_analytics.md` | Agricultura | Realizada | Analytics agricola desarrollado con backend, frontend y graficos uPlot. |
| 04 | `04_ganaderia_trazabilidad_animal.md` | Ganaderia | Parcial | Trazabilidad core y UI enterprise implementadas. Pendientes avanzados SENASA/RFID/offline derivados a feature 30. |
| 05 | `05_ganaderia_sanidad_vacunacion.md` | Ganaderia | Parcial | Sanidad/vacunacion core implementado con catalogo, aplicaciones, alertas y UI premium. Pendientes offline/notificaciones/mobile derivados a feature 32. |
| 06 | `06_ganaderia_reproduccion_genealogia.md` | Ganaderia | Realizada | Core operativo de reproduccion, genealogia, alertas de parto y recomendaciones implementado. Pendientes avanzados derivados a features 33 y 34. |
| 07 | `07_ganaderia_alimentacion_monitoreo.md` | Ganaderia | Realizada | Core de alimentacion, dietas, suministros, pesajes y dashboard implementado. Pendientes avanzados derivados a feature 35. |
| 08 | `08_maquinaria_inventario_control.md` | Maquinaria | Realizada | Inventario de maquinaria implementado con UI y datos mock de prueba. |
| 09 | `09_maquinaria_mantenimiento_preventivo.md` | Maquinaria | Realizada | Mantenimiento preventivo implementado con backend, frontend, mock data y UI de tabs/cards premium. Pendientes avanzados derivados a feature 36. |
| 10 | `10_SALTEAR_maquinaria_gps_telemetria.md` | Maquinaria | Saltada | Feature marcada explicitamente como SALTEAR. |
| 11 | `11_SALTEAR_maquinaria_consumo_combustible.md` | Maquinaria | Saltada | Feature marcada explicitamente como SALTEAR. |
| 12 | `12_operarios_gestion_administracion.md` | Operarios | Pendiente | Gestion de operarios/personas aun pendiente como modulo completo. |
| 13 | `13_operarios_ordenes_trabajo.md` | Operarios | Pendiente | Ordenes de trabajo pendiente. |
| 14 | `14_operarios_asignaciones_disponibilidad.md` | Operarios | Pendiente | Asignaciones y disponibilidad pendiente. |
| 15 | `15_inventario_insumos_agricolas.md` | Inventario | Pendiente | Inventario agricola de insumos pendiente; requerido para fitosanitarios avanzados. |
| 16 | `16_inventario_stock_control.md` | Inventario | Pendiente | Stock y control centralizado pendiente. |
| 17 | `17_finanzas_facturacion_ventas.md` | Finanzas | Pendiente | Facturacion y ventas pendiente. |
| 18 | `18_finanzas_compras_proveedores.md` | Finanzas | Pendiente | Compras y proveedores pendiente. |
| 19 | `19_finanzas_reportes_financieros.md` | Finanzas | Pendiente | Reportes financieros pendiente. |
| 20 | `20_geo_mapas_lotes.md` | Geolocalizacion | Pendiente | Mapas/geolocalizacion avanzada pendiente; el mapa de lotes operativo existe de forma parcial en agricultura. |
| 21 | `21_geo_tracking_operarios.md` | Geolocalizacion | Pendiente | Tracking de operarios pendiente. |
| 22 | `22_reportes_operacionales.md` | Reportes | Pendiente | Reportes operacionales pendiente. |
| 23 | `23_reportes_agricola_ganaderia.md` | Reportes | Pendiente | Reportes agricola/ganaderia pendiente. |
| 24 | `24_sincronizacion_offline_first.md` | Infraestructura | Pendiente | Offline-first transversal pendiente. |
| 25 | `25_agricultura_control_plagas_enfermedades.md` | Agricultura | Pendiente | Reformulada como capa avanzada de plagas: camara real, offline, IA, recomendaciones, inventario, regulacion y reportes. |
| 26 | `26_autenticacion_seguridad_login_tokens.md` | Seguridad | Realizada | Autenticacion JWT, refresh tokens, RBAC y validez de token extendida implementadas. |
| 27 | `27_agricultura_offline_validacion_cierre_00_01.md` | Agricultura | Pendiente | Cierre avanzado/offline de features 00 y 01 pendiente. |
| 28 | `28_clima_pronostico_15_dias_cache_dashboard.md` | Clima | Pendiente | Pronostico real 15 dias, cache/offline cliente y dashboard climatico avanzado pendiente. |
| 29 | `29_agricultura_prediccion_ml_avanzada.md` | Agricultura | Pendiente | Prediccion ML agricola avanzada pendiente. |
| 30 | `30_ganaderia_integracion_senasa_rfid_offline.md` | Ganaderia | Pendiente | Integracion SENASA/RFID/offline avanzada pendiente. |
| 31 | `31_ganaderia_selectores_potreros_personal.md` | Frontend/Ganaderia | Pendiente | Componente generico select-buscador, potreros, personal, veterinarios y responsables pendiente. Incluye responsable de plagas. |
| 32 | `32_ganaderia_sanidad_notificaciones_offline_mobile.md` | Ganaderia | Pendiente | Sanidad avanzada: notificaciones, offline/mobile y selectores en registros pendiente. |
| 33 | `33_ganaderia_reproduccion_offline_laboratorio_genetica_avanzada.md` | Ganaderia | Pendiente | Reproduccion avanzada offline/laboratorio/genetica pendiente. |
| 34 | `34_ganaderia_ficha_tecnica_reproductiva_avanzada.md` | Ganaderia | Pendiente | Ficha tecnica reproductiva avanzada pendiente. |
| 35 | `35_ganaderia_alimentacion_offline_balanzas_nrc_inra.md` | Ganaderia | Pendiente | Alimentacion avanzada offline, balanzas e integracion nutricional pendiente. |
| 36 | `36_maquinaria_mantenimiento_offline_notificaciones_avanzadas.md` | Maquinaria | Pendiente | Mantenimiento avanzado offline/notificaciones pendiente. |
| 37 | `37_agricultura_control_plagas_fitosanitarios.md` | Agricultura | Realizada | Core operativo de plagas y aplicaciones fitosanitarias implementado: backend, web, mobile base, mapa con pins y tests. |

## Registro por Dominio

### Agricultura
- Realizadas: 03, 37.
- Parciales: 00, 01.
- Pendientes: 00_01, 25, 27, 29.

### Clima
- Parciales: 02.
- Pendientes: 28.

### Ganaderia
- Realizadas: 06, 07.
- Parciales: 04, 05.
- Pendientes: 30, 31, 32, 33, 34, 35.

### Maquinaria
- Realizadas: 08, 09.
- Saltadas: 10, 11.
- Pendientes: 36.

### Operarios
- Pendientes: 12, 13, 14.

### Inventario
- Pendientes: 15, 16.

### Finanzas
- Pendientes: 17, 18, 19.

### Geolocalizacion
- Pendientes: 20, 21.

### Reportes
- Pendientes: 22, 23.

### Infraestructura
- Pendientes: 24.

### Seguridad
- Realizadas: 26.

## Ultimas Actualizaciones
- 2026-05-26: Feature 37 marcada como realizada.
- 2026-05-26: Feature 25 reformulada para cubrir pendientes avanzados no incluidos en 37.
- 2026-05-26: Feature 31 actualizada para incluir selector buscador de responsable en plagas.
- 2026-05-26: Manifest reescrito como registro operativo de estado de features.
