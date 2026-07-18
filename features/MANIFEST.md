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
- Total de historias registradas: 53
- Realizadas: 35
- Parciales: 0
- Pendientes: 16
- Saltadas: 2
- Ultima actualizacion: 2026-07-18

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
| 15 | `15_COMPLETA_inventario_insumos_agricolas.md` | Inventario | Realizada | Inventario agricola de insumos implementado con catalogo, stock por deposito/lote, movimientos auditados, alertas de reorden/vencimiento, endpoint REST, pantalla Angular y mock data. |
| 16 | `16_inventario_stock_control.md` | Inventario | Pendiente | Stock y control centralizado pendiente. |
| 17 | `17_COMPLETA_finanzas_facturacion_ventas.md` | Finanzas | Realizada | Facturacion y ventas implementada con clientes fiscales, facturas, CAE simulado, cobros, notas de credito, dashboard, REST paginado, pantalla Angular premium y datos iniciales. |
| 18 | `18_COMPLETA_finanzas_compras_proveedores.md` | Finanzas | Realizada | Compras y proveedores implementada con proveedores, compras, items, pagos, dashboard, REST paginado, sidebar y pantalla Angular premium. |
| 19 | `19_COMPLETA_finanzas_reportes_financieros.md` | Finanzas | Realizada | Dashboard financiero ejecutivo implementado con endpoint backend-driven, KPIs reales, series de 12 periodos, flujo de caja, rankings parametrizables, tablas operativas, ApexCharts y tooltips premium. |
| 20 | `20_geo_mapas_lotes.md` | Geolocalizacion | Pendiente | Mapas/geolocalizacion avanzada pendiente; el mapa de lotes operativo existe de forma parcial en agricultura. |
| 21 | `21_geo_tracking_operarios.md` | Geolocalizacion | Pendiente | Tracking de operarios pendiente. |
| 22 | `22_reportes_operacionales.md` | Reportes | Pendiente | Reportes operacionales pendiente. |
| 10-reportes | `10_COMPLETA_reportes_agricola_ganaderia.md` | Reportes/Agricultura | Realizada | Dashboard Agricola Ejecutivo Premium implementado en `/reportes/agricola` consumiendo `GET /api/v1/reportes/agricola/dashboard`, sin datos mockeados en frontend. |
| 24 | `24_COMPLETA_sincronizacion_offline_first.md` | Infraestructura | Realizada | Offline-first mobile implementada: Sync Down proactiva (replica local de 10 datasets de agricultura/ganaderia/operarios), Outbox FIFO persistido con Idempotency-Key (filtro backend + tabla) y remap de tempIds, banner global y bandeja de pendientes. Pendiente prueba manual en dispositivo real con modo avion. |
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
| 39 | `39_mobile_primer_login_cambio_password_obligatorio.md` | Seguridad/Mobile | Realizada | Cambio obligatorio de contraseña en primer login mobile: flag `must_change_password` (V43), endpoint `POST /auth/first-login/change-password` con revocación de tokens previos y auditoría, pantalla mobile obligatoria con guard de navegación. Incluye fix preexistente: el login rechazaba usernames de operarios por validación `@Email`. Verificada con tests, curl y navegador contra el stack Docker. |
| 40 | `40_COMPLETA_operaciones_calendario_operaciones.md` | Operaciones | Realizada | Calendario semanal operativo para ordenes de trabajo, con filtros, chips de operarios, popup de seguimiento, cambio de estado y registro de actividad. |
| 41 | `41_COMPLETA_roles_menu_permisos.md` | Seguridad/Frontend | Realizada | Pantalla administrativa para definir opciones de menu visibles por rol, con backend persistido y sidebar filtrado por permisos. |
| 42 | `42_COMPLETA_dashboard_ganadero_ejecutivo.md` | Ganaderia/Reportes | Realizada | Dashboard Ganadero Ejecutivo implementado con endpoint backend-driven, KPIs, graficos, alertas operativas y analitica del rodeo. |
| 43 | `43_COMPLETA_integridad_referencial_transversal_por_id.md` | Arquitectura/Datos | Realizada | Integridad referencial animal-potrero implementada con `animales_potreros`, movimientos por `potrero_id`, dashboard ganadero por IDs y alimentacion por FK de potrero. |
| 44 | `44_frontend_modernizacion_graficos_apexcharts.md` | Frontend | Realizada | Graficos compartidos (barras, donut, linea) migrados de SVG plano a ApexCharts con gradientes, glow, curvas suaves y tooltip premium, sin romper el contrato de los componentes. |
| 45 | `45_COMPLETA_ganaderia_mobile_menu_potreros_alta_edicion.md` | Ganaderia/Mobile | Realizada | Alta/edicion/baja de potreros desde mobile y burbuja "Agregar Reproduccion" (monta, inseminacion, prenez, parto, indice) implementadas. Color por estado del potrero verificado funcionando. Pendiente prueba manual en dispositivo real. |
| 46 | `46_COMPLETA_ganaderia_mobile_trazabilidad_sanidad_alimentacion.md` | Ganaderia/Mobile | Realizada | Trazabilidad, Sanidad y Alimentacion activadas en el menu de ganaderia mobile y en sus burbujas de "nueva actividad", clonando campo por campo los formularios web (incluyendo selectores tipo buscador). Pendiente prueba manual en dispositivo real. |
| 47 | `47_COMPLETA_ganaderia_alertas_potreros.md` | Ganaderia | Realizada | Alertas georreferenciadas sobre potreros implementadas end-to-end: backend (V42, usuario del token, resolver), mobile (burbuja + pantalla + pins campanita + preview + offline outbox/syncdown) y web (alta por click en potrero, pins mgl-marker, detalle con resolver). Pendiente prueba manual en dispositivo real. |
| 48 | `48_frontend_budget_bundle_inicial.md` | Frontend | Pendiente | `ng build` falla el budget del bundle inicial (2.51+ MB vs 2.35 MB), preexistente a la feature 47: recortar bundle (lazy-loading de charts/mapas) o ajustar budget justificado. |
| 49 | `49_COMPLETA_dashboard_ganadero_alertas_potrero.md` | Ganaderia/Reportes | Realizada | Alertas de potrero (feature 47) integradas como sexto generador de la seccion Alertas Operativas del Dashboard Ganadero: gravedad mapeada a prioridad (CRITICA colapsa en ALTA), fecha real de creacion, limit(3) y regla CSS explicita para BAJA. Test del generador 2/2. Pendiente verificacion visual con stack Docker. |
| 50 | `50_COMPLETA_ganaderia_mobile_animales_ficha_historiales.md` | Ganaderia/Mobile | Realizada | Menu GANADERIA reducido a Animales + Potreros. Nueva vista Animales: listado colapsable con ficha resumen por animal, filtros combinables por caravana/potrero con chips activos, y chips chicos que abren los 6 historiales (clinico, pesos, movimientos, vacunas, tratamientos, diagnosticos) en pantalla modal parametrizada. Ampliada con paginacion server-side de a 20 (endpoint /animales/page) con fallback offline, refresh de sesion mobile corregido (401/403 + entry point), e historiales replicados para lectura offline (consulta bulk por tipo + 2 endpoints nuevos de movimientos/historial-medico + 6 datasets en sync down). Verificada en navegador contra el stack Docker. |
| 51 | `51_ganaderia_historiales_nombres_operarios.md` | Ganaderia | Realizada | Historiales y tablas muestran nombres en vez de UUIDs: resolver batch de operarios en backend (OperarioNombreResolver, sin N+1) + potreros por nombre en movimientos/registros, con campos *Nombre nuevos en 7 DTOs consumidos por mobile y web con fallback al valor crudo. Verificado en navegador contra el stack Docker. |
| 52 | `52_web_primer_login_cambio_password_obligatorio.md` | Seguridad/Frontend | Pendiente | Extender al panel web Angular el flujo de cambio obligatorio de contraseña inicial (feature 39): guard de rutas, pantalla dedicada y consumo del endpoint ya existente en backend. |

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
- Realizadas: 04, 05, 06, 07, 31, 38, 42, 45, 46, 47.
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
- Realizadas: 15.
- Pendientes: 16.

### Finanzas
- Realizadas: 17, 18, 19.
- Pendientes: ninguna.

### Geolocalizacion
- Pendientes: 20, 21.

### Reportes
- Realizadas: 10-reportes.
- Pendientes: 22.

### Infraestructura
- Realizadas: 24.
- Pendientes: ninguna.

### Seguridad
- Realizadas: 26, 39, 41.
- Pendientes: 52.

### Arquitectura/Datos
- Realizadas: 43.

### Frontend
- Realizadas: 44.
- Pendientes: 48.

## Ultimas Actualizaciones
- 2026-07-18: Feature 39 realizada con los agentes backend y mobile: flag `must_change_password` (V43 + backfill), endpoint `POST /auth/first-login/change-password` (revoca tokens previos, audita, rechaza reutilizar la inicial), pantalla mobile obligatoria `(auth)/cambiar-password` y guard en el gate de navegación (cubre sesión persistida). Fix preexistente: `LoginRequest` exigía formato de email, por lo que los usuarios generados desde operarios nunca habían podido loguearse; se quitó `@Email` del login. Verificada con 5 tests JUnit, batería curl de 10 casos y flujo completo en navegador contra el stack Docker. La evaluación del flujo web se materializó como feature 52 (pendiente).
- 2026-07-18: Feature 50 mergeada a master y renombrada `_COMPLETA_` (referencias en feature 51 y MANIFEST actualizadas). La feature 51 quedo desarrollada y mergeada dentro del mismo branch (ver entrada del 2026-07-17); su archivo conserva el nombre hasta que se pida marcarla completa.
- 2026-07-18: Feature 50 ampliada para operar offline completa: los 6 historiales del animal pasan a consulta bulk por tipo con query keys estables replicadas por la sync down (2 endpoints bulk nuevos en backend con nombres resueltos, hook con filtrado client-side por animal, mensaje de sin-conexion cuando no hay replica). Sync up sin cambios (la vista es de consulta; las cargas ya operaban via outbox). Gates verdes: mvn compile + 11 tests, tsc + jest.
- 2026-07-17: Feature 51 realizada (sobre la branch de la 50): los historiales del animal y las tablas web muestran nombres de operarios y potreros en vez de UUIDs. Resolucion batch en backend (helper compartido, texto libre intacto, paginacion sin N+1, 6 tests), consumo con fallback en mobile y web. Verificado en navegador contra el stack Docker con la imagen backend reconstruida.
- 2026-07-17: Bug de feature 50 corregido y verificado en navegador contra el stack Docker: los historiales del animal aparecian vacios porque el access token vencia y el cliente mobile nunca usaba el refresh token; ademas el backend devolvia 403 (sin entry point) en vez de 401. Se agrego renovacion de sesion single-flight con retry en el cliente axios, entry point 401 en SecurityConfig, y 403 ahora pausa el outbox en vez de marcar error. Se crea la feature 51 (UUIDs de operarios visibles en historiales).
- 2026-07-17: Feature 50 ampliada a pedido del usuario con paginacion server-side de a 20 en el listado de animales: endpoint GET /animales/page (filtros caravana/potreroId/estado, orden estable, size acotado) siguiendo la convencion /page de sanidad, paginador en la pantalla mobile con placeholderData y fallback offline a la replica local con paginacion cliente. Gates verdes: mvn compile + 3 tests, tsc + jest 7/7.
- 2026-07-16: Feature 50 realizada con el agente mobile: menu GANADERIA queda en Animales + Potreros, listado de animales con rows colapsables y ficha resumen, filtros por caravana/potrero en sheet inferior, y pantalla modal de historiales por animal (clinico, pesos, movimientos, vacunas, tratamientos, diagnosticos) consumiendo los endpoints existentes. tsc y jest verdes; queda prueba manual en dispositivo.
- 2026-07-16: Feature 50 creada: menu GANADERIA mobile reducido a Potreros + nueva vista Animales con listado colapsable, filtros e historiales por animal. Arranca desarrollo en branch propia.
- 2026-07-16: Feature 49 mergeada a master y renombrada `_COMPLETA_`.
- 2026-07-16: Feature 49 realizada: las alertas de potrero abiertas aparecen en la seccion Alertas Operativas del Dashboard Ganadero con prioridad mapeada desde la gravedad y fecha real de creacion. mvn compile + 2 tests verdes y type-check web limpio; verificacion visual pendiente (Docker Desktop apagado en el entorno).
- 2026-07-16: Feature 49 creada para integrar las alertas de potrero al Dashboard Ganadero (seccion Alertas Operativas desactualizada tras la feature 47). Arranca desarrollo en branch propia.
- 2026-07-16: Feature 47 mergeada a master y renombrada `_COMPLETA_` (referencias en MANIFEST y feature 48 actualizadas).
- 2026-07-15: Feature 47 realizada end-to-end con los agentes de dominio (backend/mobile/frontend): tabla alertas_potrero (V42) con usuario del token, burbuja y pantalla de alta mobile con GPS, pins de campanita coloreados por gravedad en ambos mapas con preview/detalle y "marcar resuelta", e integracion offline (regla de outbox con orden critico + dataset en sync down + test de regresion). Gates verdes: mvn compile + 5 tests, tsc mobile + 7 tests, type-check web. Queda prueba manual en dispositivo real.
- 2026-07-15: Feature 48 creada para el budget del bundle inicial de Angular que falla en ng build (preexistente, detectado durante la 47).
- 2026-07-15: Feature 47 creada: alertas georreferenciadas en potreros (usuario logueado, fecha, gravedad con los niveles de lotes, observacion), pin de campanita coloreada por gravedad en los mapas de web y mobile, e integracion obligatoria al offline-first de la feature 24. Pendiente de desarrollo.
- 2026-07-15: Feature 24 mergeada a master y renombrada `_COMPLETA_` (referencias en features 30, 32 y 33 actualizadas).
- 2026-07-15: Feature 24 realizada: offline-first mobile con Sync Down proactiva (replica local de 10 datasets criticos con las mismas query keys de los hooks), Outbox FIFO persistido con interceptor axios sobre 22 mutaciones de agricultura/ganaderia, filtro backend Idempotency-Key (migracion V41), remap de IDs temporales, banner global de estado y bandeja de pendientes con reintento/descarte. Type-check, compilacion backend y 4 tests de outbox OK; queda prueba manual en dispositivo real.
- 2026-07-14: Feature 24 reformulada tras analisis de mercado: offline-first mobile con Sync Down proactiva (nube a telefono, replica local de lotes/potreros/animales/operarios/catalogos) y Outbox FIFO (telefono a nube, con Idempotency-Key y remap de IDs temporales), acotada a agricultura, ganaderia y operarios. Se descartan SQLite/Realm, delta-sync, endpoint /sync, compresion y merge de conflictos del planteo original. Quedan 3 decisiones abiertas documentadas en el doc antes de implementar.
- 2026-07-14: Feature 46 realizada: Trazabilidad, Sanidad y Alimentacion activadas en el menu Drawer y en las burbujas del mapa de potreros en mobile, con formularios clonados campo por campo de las paginas web equivalentes (incluyendo selectores tipo buscador). Se extrajo un `ganaderia-form-kit.tsx` compartido para no duplicar los componentes de formulario entre pantallas. Narrowed el alcance restante de la feature 32 (offline/notificaciones/alertas/inventario/auditoria).
- 2026-07-14: Feature 45 mergeada a master y renombrada `_COMPLETA_`. Arranca desarrollo de feature 46 en branch propia.
- 2026-07-09: Feature 45 realizada: alta/edicion/baja de potreros desde mobile (poligono como texto GeoJSON) y burbuja "Agregar Reproduccion" con los 5 tipos de actividad reproductiva. Type-check de mobile sin errores; queda pendiente prueba manual en dispositivo real y verificacion visual (bloqueada por un problema preexistente de entorno con lightningcss en el preview web).
- 2026-07-09: Feature 45 acotada a Potreros (alta/edicion/baja) y burbuja "Agregar Reproduccion"; el resto (Trazabilidad/Sanidad/Alimentacion) se deriva a la feature 46 creada para eso. Arranca desarrollo en branch propia.
- 2026-07-09: Feature 45 creada a pedido del usuario para avanzar el menu de Ganaderia en mobile: activar Trazabilidad/Sanidad/Alimentacion, portar alta y edicion de potreros desde mobile (hoy solo lectura) y definir burbujas de tareas en el mapa. Queda pendiente de priorizacion antes de desarrollar.
- 2026-07-08: Feature 44 realizada. Graficos compartidos (barras, donut, linea) migrados de SVG plano a ApexCharts con gradientes, glow, curvas suaves y tooltip premium (`apex-tooltip-card`), manteniendo el contrato de los componentes. De paso se corrigio un SIGSEGV de la JVM en el backend Docker (musl+G1GC) que bloqueaba la validacion contra datos reales.
- 2026-06-29: Feature 19 realizada con dashboard financiero ejecutivo, endpoint consolidado, datos reales de facturacion/compras/cobros/pagos/inventario, graficos ApexCharts y sidebar visible.
- 2026-06-29: Feature 18 realizada con compras y proveedores, proveedores fiscales, compras de insumos, pagos, cuentas por pagar, dashboard, endpoints paginados y UI Angular premium.
- 2026-06-29: Feature 17 realizada con facturacion y ventas, clientes, comprobantes, cobros, notas de credito, dashboard financiero y UI Angular premium.
- 2026-06-26: Feature 15 realizada con inventario agricola de insumos, stock, movimientos, alertas, backend REST, pantalla Angular y datos mock.
- 2026-06-16: Feature 43 realizada con `animales_potreros`, movimientos por IDs, dashboard ganadero sin agrupacion por texto y selectores de potrero enviando IDs.
- 2026-06-09: Feature 43 creada para corregir integridad referencial transversal por ID y evitar joins por nombres/textos libres.
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


