# 32 - Ganaderia: Sanidad Notificaciones, Offline y Mobile

## Descripcion
Continuacion de la Feature 05 para completar las capacidades que no quedan cubiertas solo con backend y dashboard web: notificaciones automaticas reales, trabajo offline y experiencia mobile especifica para campo.

## Objetivo
Cerrar el circuito sanitario ganadero en contextos operativos reales, con alertas proactivas, registro sin conectividad y captura desde dispositivos moviles.

## Tareas
1. **Notificaciones Automaticas**: generar avisos reales por vacunas proximas/vencidas y tratamientos criticos.
2. **Bandeja de Alertas**: centralizar alertas sanitarias por prioridad y estado.
3. **Offline de Sanidad**: registrar aplicaciones, tratamientos y diagnosticos sin conectividad.
4. **Cola de Sincronizacion**: reintentos y resolucion de conflictos para eventos sanitarios.
5. ~~**Pantallas Mobile de Sanidad**: vistas y formularios mobile para vacunacion, tratamientos y diagnosticos.~~ Cubierto por la feature [46](46_COMPLETA_ganaderia_mobile_trazabilidad_sanidad_alimentacion.md) (`mobile/app/ganaderia/nueva-sanidad.tsx`), sin offline.
6. **Integracion Inventario/Finanzas**: impacto automatico en stock de vacunas/medicinas y costos sanitarios.
7. **Auditoria Extendida**: trazabilidad operativa de quien aplico, cuando sincronizo y con que resultado.
8. ~~**Selectores Buscables en Sanidad**: reutilizar el componente generico de la Feature 31 en formularios sanitarios web y mobile.~~ El lado mobile quedo cubierto por la feature 46 (`CatalogSelect` en `mobile/shared/components/ganaderia-form-kit.tsx`, equivalente mobile del componente web de la Feature 31).
9. ~~**Registro de Aplicacion Mejorado**: `animal` y `vacuna` deben usar select con buscador basado en endpoint.~~ Cubierto en mobile por la feature 46 (`AnimalSelect`/`VacunaSelect`).
10. ~~**Registro de Tratamiento Mejorado**: `animal` debe usar select con buscador basado en endpoint.~~ Cubierto en mobile por la feature 46 (`AnimalSelect`).
11. ~~**Nuevo Diagnostico Mejorado**: `animal` con select buscador y `veterinario` resuelto como usuario real con rol `VETERINARIO`.~~ Cubierto en mobile por la feature 46 (`AnimalSelect` + `PersonSelect` filtrado por `rol=VETERINARIO`).

Queda pendiente en esta feature: notificaciones automaticas, bandeja de alertas, offline/sincronizacion, integracion con inventario/finanzas y auditoria extendida — nada de esto se toco en la feature 46.

## Dependencias
- 05_COMPLETA_ganaderia_sanidad_vacunacion
- 31_ganaderia_selectores_potreros_personal
- 24_sincronizacion_offline_first
- 15_inventario_insumos_agricolas
- 17_finanzas_facturacion_ventas
- 46_COMPLETA_ganaderia_mobile_trazabilidad_sanidad_alimentacion

