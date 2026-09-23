# 85 - Finanzas: cotización del dólar BNA (integración) + toggle ARS/USD

## Descripción
Integrar automáticamente la cotización del **Dólar BNA (Banco Nación) vendedor** para
alimentar el toggle **ARS / USD** del dashboard operativo agrícola (feature 84) y, a
futuro, del resto de los dashboards. La feature 84 deja el toggle preparado en la UI
(ARS activo); esta feature cablea la conversión con una cotización real y fresca.

## Origen
Detectada al desarrollar la feature 84: el diseño de charts incluye un selector de
moneda ARS/USD con la leyenda "Dólar BNA vendedor: $ … · fecha". Por su tamaño
(integración externa + scheduler + cache) se separa en esta feature.

## Alcance
1. **Backend — integración**: cliente que obtiene la cotización del Dólar BNA
   vendedor desde una fuente pública (p. ej. API de cotizaciones), con `scheduler`
   de refresco y cache/persistencia del último valor + fecha. Configuración por
   `.env` (URL/credenciales si aplica, intervalo) siguiendo el patrón
   `.env → docker-compose → application.yml → @ConfigurationProperties`.
2. **Backend — endpoint**: `GET /api/v1/finanzas/cotizaciones/dolar` que devuelve
   `{ compra, venta, fecha, fuente }` (o al menos `venta` + `fecha`). Fallback al
   último valor cacheado si la fuente no responde.
3. **Frontend**: el toggle ARS/USD del dashboard agrícola convierte los montos
   client-side usando la cotización; muestra la leyenda con valor + fecha. Extensible
   a otros dashboards.

## Requisitos técnicos
- No hardcodear la cotización; siempre desde la integración con fallback cacheado.
- Manejo de indisponibilidad de la fuente (timeout, error) sin romper el dashboard:
  si no hay cotización, el toggle USD queda deshabilitado con aviso.
- Variables sensibles/entorno en `.env`.

## Dependencias
- Feature 84 (dashboard operativo agrícola: deja el toggle preparado).
- Feature 19 (finanzas / reportes financieros) como posible consumidor futuro.

## Estado
Pendiente.
