# 28_clima_pronostico_15_dias_cache_dashboard - Clima: Pronostico 15 Dias, Cache Cliente y Dashboard Analitico

## Descripcion
Feature nueva para cerrar los pendientes funcionales detectados luego del avance principal de la Feature 02 de clima. Esta feature separa el trabajo restante en una unidad numerada propia, en lugar de dejarlo como nota pendiente dentro de la feature original.

## Objetivo
Completar el modulo de clima con un pronostico real de 15 dias, cache/offline explicito del lado cliente y visualizaciones mas analiticas para web y mobile.

## Alcance
- Integrar un proveedor que soporte pronostico real de 15 dias
- Mantener compatibilidad con el modelo actual de monitoreo consolidado
- Agregar cache local del lado cliente
- Mejorar el dashboard visual de clima

## Funcionalidades Principales
- Pronostico real a 15 dias
- Cache local explicito de datos climaticos recientes
- Reutilizacion offline de los ultimos datos sincronizados
- Visualizaciones climaticas mas ricas en dashboard

## Tareas
1. **Proveedor 15 Dias**: evaluar e integrar proveedor externo compatible con pronostico real de 15 dias.
2. **Backend de Pronostico Extendido**: adaptar el servicio de clima para almacenar y exponer el nuevo rango de pronostico.
3. **Persistencia de Pronostico**: asegurar almacenamiento consistente de pronosticos extendidos.
4. **Cache Cliente Angular**: guardar los ultimos datos climaticos consultados por lote para uso inmediato y fallback local.
5. **Cache Cliente Mobile**: guardar los ultimos datos climaticos consultados en Expo para fallback offline.
6. **Modo Offline de Clima**: mostrar ultimo snapshot disponible cuando falle el backend o no haya conectividad.
7. **Dashboard Analitico Web**: incorporar graficos mas ricos para historico, lluvia, temperatura y tendencia.
8. **Dashboard Analitico Mobile**: mejorar la visualizacion compacta del historico y pronostico.
9. **Validacion Integral**: verificar que el nuevo proveedor no rompa alertas ni recomendaciones.

## Backend
- Extender `ClimaService`
- Ajustar sincronizacion y scheduler
- Mantener `ClimaController` y `/api/v1/clima/monitoreo` consistentes

## Frontend Web Angular
- Mejorar `clima-page`
- Incorporar cache cliente para fallback offline
- Agregar visualizaciones climaticas mas completas

## Mobile
- Cache local de clima por lote
- Fallback offline
- Visualizacion mejorada del historico y pronostico

## Requisitos Tecnicos
- Mantener compatibilidad con el proveedor actual mientras se integra el nuevo
- Evitar sobreescribir historicos validos con respuestas parciales
- No degradar las alertas y recomendaciones existentes

## Criterios de Aceptacion
- El sistema expone pronostico real de 15 dias
- Web y mobile pueden mostrar datos climaticos recientes aun sin conectividad
- El dashboard web muestra visualizaciones mas ricas que la version base actual
- Mobile mantiene una vista compacta pero mas informativa del historico y pronostico

## Dependencias
- Feature 02
- Feature 24

