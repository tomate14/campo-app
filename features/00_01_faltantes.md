# 00_01_faltantes - Agricultura: Cierre de Faltantes de Features 00 y 01

## Descripcion
Cierre de los faltantes detectados en las features 00 (Monitoreo de Siembra y Cosecha) y 01 (Gestion de Lotes), con foco en completar funcionalidad faltante, reparar flujos rotos en mobile y unificar el comportamiento entre backend, frontend Angular y mobile.

## Objetivo
Dejar las features 00 y 01 en estado realmente operativo y consistente con su especificacion funcional original, evitando marcar como completas features que todavia tienen gaps de producto o implementacion.

## Alcance
- Completar flujos faltantes de lotes en mobile
- Completar flujos faltantes de siembra/cosecha en mobile
- Agregar capacidades pendientes de consulta y mapas de lotes
- Incorporar offline real para los modulos agricolas alcanzados
- Incorporar reportes minimos de ciclo y productividad
- Alinear el frontend web a Angular en componentes, servicios, templates y directivas

## Funcionalidades Principales
- Alta, detalle y navegacion de lotes en mobile
- Registro de cosecha en mobile
- Consulta avanzada de lotes por propiedades
- Importacion y exportacion de mapas/lotes
- Reportes basicos de ciclo agricola
- Soporte offline con sincronizacion posterior
- Frontend Angular sin dependencias funcionales de React hooks

## Tareas
1. **Mobile Lotes**: crear rutas reales para alta y detalle de lotes, corrigiendo la navegacion rota actual.
2. **Mobile Cosecha**: implementar `registro-cosecha` para completar el flujo de Feature 00 en Expo.
3. **Detalle Mobile de Lote**: exponer informacion, historial, suelo y accesos a mapas desde mobile.
4. **Consulta Avanzada de Lotes**: agregar filtros por propiedades de suelo, rango de superficie, cultivo, temporada y presencia de poligono.
5. **Import/Export de Mapas**: permitir exportar e importar GeoJSON de lotes.
6. **Area y Productividad**: consolidar calculos por hectarea y metricas productivas por lote.
7. **Reportes de Ciclo**: resumen por lote y cultivo con eventos, cosecha y rendimiento.
8. **Offline Real**: persistencia local, cola de operaciones y sincronizacion diferida para lotes, siembra y cosecha.
9. **Validacion de Poligonos**: validar GeoJSON en backend antes de persistir.
10. **Frontend Angular**: eliminar dependencias de React Query/Hooks en web y usar servicios Angular, signals, templates y directivas nativas.
11. **Ajuste de Estado de Proyecto**: actualizar `memory.md` y changelogs cuando el cierre quede realmente terminado.

## Backend
- Extender `LoteController` y servicios para filtros avanzados
- Incorporar endpoints de import/export GeoJSON
- Validar estructura GeoJSON de `poligono`
- Agregar endpoints de reportes minimos para 00/01
- Preparar soporte para sincronizacion diferida si el cliente envia operaciones offline

## Frontend Web Angular
- Consumir filtros avanzados de lotes
- Agregar export/import de GeoJSON en gestion de lotes
- Crear vistas minimas de reportes de ciclo/productividad
- Mantener compatibilidad con editor de poligonos actual
- Usar componentes Angular separados por carpeta con archivos `.ts`, `.html` y `.css`
- Usar `HttpClient`, servicios inyectables y `signals` donde aplique
- Usar templates Angular con `@if`, `@for` o directivas estructurales equivalentes, bindings de propiedades/eventos y formularios Angular
- No depender de hooks React dentro del runtime web

## Mobile
- Crear `mobile/app/lotes/nuevo.tsx`
- Crear `mobile/app/lotes/[id].tsx`
- Crear `mobile/app/agricola/registro-cosecha.tsx`
- Vincular lotes, siembra, cosecha, suelo e historial en navegacion consistente
- Persistir datos offline y sincronizar al recuperar conectividad

## Servicios Esperados
- `LoteService`
- `SiembraService`
- `CosechaService`
- `SueloService`
- `HistorialCultivoService`
- `GeoService` o equivalente para import/export GeoJSON
- `SyncService` o capa offline para mobile/frontend
- `ReporteAgricolaService`

## Repositorios Esperados
- `LoteRepository`
- `EventoSiembraRepository`
- `RegistroCosechaRepository`
- `PropiedadSueloRepository`
- `HistoricoCultivoRepository`

## Requisitos Tecnicos
- Mantener UUID, soft delete y auditoria
- Mantener RBAC en todos los endpoints nuevos
- Validar GeoJSON antes de persistencia
- Compatibilidad con frontend Angular y mobile Expo
- Soporte offline-first real, no solo refetch manual
- Mantener separacion clara entre servicios Angular web y hooks React Native mobile

## Criterios de Aceptacion
- En mobile se puede crear un lote y abrir su detalle sin rutas rotas
- En mobile se puede registrar cosecha
- Se puede exportar e importar GeoJSON de lotes
- Existen filtros avanzados de consulta de lotes
- Existen reportes minimos de ciclo y productividad
- El frontend web usa Angular de forma nativa, sin hooks React en su flujo operativo
- Los componentes Angular usan estructura por carpeta y archivos separados `.ts`, `.html` y `.css`
- El sistema puede seguir operando sin conectividad y sincronizar luego
- `memory.md` puede marcar 00 y 01 como completas solo cuando estos puntos esten cerrados

## Dependencias
- Feature 00
- Feature 01
- Feature 24 (sincronizacion offline-first)
- Feature 22/23 si se amplian reportes mas alla del minimo
