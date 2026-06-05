# 27_agricultura_offline_validacion_cierre_00_01 - Agricultura: Offline, Validacion Final y Cierre de Features 00 y 01

## Descripcion
Feature de cierre final para separar los pendientes que siguen abiertos luego de implementar el nucleo operativo de las features 00 y 01. Esta feature concentra exclusivamente lo que falta para poder marcar ambas como realmente completas.

## Objetivo
Cerrar los ultimos gaps tecnicos y operativos de Agricultura en web Angular y mobile Expo, con foco en offline-first real, validacion integral y actualizacion formal del estado del proyecto.

## Alcance
- Implementar offline-first real para lotes, siembra y cosecha
- Agregar cola de sincronizacion y persistencia local en mobile
- Validar end-to-end los nuevos flujos mobile
- Cerrar la documentacion y trazabilidad del estado del proyecto

## Funcionalidades Principales
- Persistencia local de altas y cambios cuando no haya conectividad
- Cola de operaciones pendientes para sincronizacion posterior
- Reintento y resolucion de sincronizacion al recuperar red
- Estado visible de operaciones pendientes y sincronizadas
- Validacion final de rutas y formularios mobile
- Actualizacion de memoria y changelog una vez cerrado todo

## Tareas
1. **Persistencia Local de Lotes**: guardar altas y cambios de lotes en almacenamiento local cuando el backend no este disponible.
2. **Persistencia Local de Siembra**: registrar eventos offline y sincronizarlos luego.
3. **Persistencia Local de Cosecha**: registrar cosechas offline y sincronizarlas luego.
4. **Cola de Sincronizacion**: implementar una cola de operaciones pendientes con estado `pending`, `synced` y `error`.
5. **Reintento de Sync**: reintentar automaticamente o manualmente al recuperar conectividad.
6. **Indicadores de Estado**: mostrar en mobile que datos estan pendientes de sincronizacion.
7. **Validacion Mobile**: validar rutas `lotes/nuevo`, `lotes/[id]` y `agricola/registro-cosecha` con toolchain local completa.
8. **Pruebas End-to-End Operativas**: verificar flujo completo lote -> siembra -> cosecha -> detalle.
9. **Cierre de Proyecto**: actualizar `memory.md` y `docs/changelogs/CHANGELOG.md` solo cuando estos puntos esten terminados.

## Backend
- Mantener compatibilidad con reintentos idempotentes desde mobile
- Revisar si hace falta soporte adicional para operaciones reenviadas
- Validar que import/export y reportes no rompan el flujo offline posterior

## Frontend Web Angular
- Mantener alineacion funcional con backend
- No bloquear el cierre de 00 y 01 por temas exclusivos de mobile offline
- Reflejar en UI cualquier estado relevante si se replica la capa offline en web mas adelante

## Mobile
- Incorporar almacenamiento local para operaciones agricolas
- Incorporar mecanismo de sincronizacion diferida
- Exponer estado de sync al usuario
- Validar navegacion y formularios con datos reales

## Servicios Esperados
- `OfflineQueueService`
- `SyncService`
- `ConnectivityService`
- `LoteService`
- `SiembraService`
- `CosechaService`

## Requisitos Tecnicos
- No perder operaciones creadas offline
- Mantener compatibilidad con Expo
- Mantener separacion entre capa Angular web y capa React Native mobile
- Evitar dobles inserciones durante reintentos

## Criterios de Aceptacion
- Se puede crear un lote offline y sincronizarlo despues
- Se puede registrar siembra offline y sincronizarla despues
- Se puede registrar cosecha offline y sincronizarla despues
- El usuario ve que operaciones estan pendientes o fallidas
- Las rutas nuevas de mobile quedan validadas sin errores de compilacion
- `memory.md` y `CHANGELOG.md` reflejan el cierre real una vez completado todo

## Dependencias
- Feature 00
- Feature 01
- Feature 24

