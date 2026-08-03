# 66 - Plagas web: pin de detección sin coordenadas (paridad con mobile)

## Descripción
El mapa web de detecciones de plagas debe mostrar **exactamente la misma
información que el mobile**: un pin por cada detección. Hoy, una detección sin
coordenadas propias no dibuja pin en el mapa web (aparece solo en la tabla),
mientras que en mobile sí se muestra (cae en el centro del lote).

## Problema (bug reportado)
- En el panel web: la tabla de detecciones lista 2, pero el mapa muestra 1 solo
  pin. En mobile se ven 2 pines.
- Causa: en `plagas-page.component.ts`, el computed `pins()` descartaba toda
  detección sin `latitud`/`longitud` propias (`if (!hasCoords ...) return`), sin
  ningún fallback. El mobile (`mobile/app/(tabs)/lotes.tsx`) usa el **centro del
  lote** como fallback (`detectionCoordinate(d) ?? loteCenters.get(d.loteId)`),
  por eso ahí sí se dibuja el segundo pin.
- El DTO `DeteccionPlagaResponse` trae `latitud`/`longitud` nullable por
  detección; la coordenada del lote no viene en el DTO y se deriva del polígono
  en el cliente.

## Solución (nota: resuelto en el branch de la feature 65 por pedido del usuario)
Replicar en el web el fallback del mobile:
- Nuevo computed `loteCenters` (mapa `loteId → {lat,lng}`) y helper
  `loteCenterFromPolygon` que calcula el centroide (promedio de vértices) del
  polígono del lote, reutilizando `flattenCoordinates`.
- En `pins()`, cuando la detección no trae coordenadas finitas, usar el centro
  del lote (`loteCenters.get(loteId)`); solo se descarta si el lote tampoco tiene
  polígono. Se mantiene el dedup por coordenada (2 detecciones en el mismo punto
  se agrupan en un pin con badge, igual que mobile).

## Requisitos Técnicos
- Frontend `npm run type-check` verde.
- El mapa web dibuja un pin por detección (con fallback al centro del lote),
  igual que mobile.

## Verificación
- Contra el stack Docker con el dato real (lote "Lote Norte 1" con 2 detecciones,
  una con coords y otra `NULL`): el mapa web pasó de **1 a 2** `.maplibregl-marker`
  (conteo en el DOM), quedando en paridad con la tabla (2) y con mobile (2).

## Dependencias
- Feature 37 (plagas), 57 (área afectada/mapa — relacionada, pendiente).

## Estado
Realizada.
