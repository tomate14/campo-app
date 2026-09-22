# 59 - Agrícola: NDVI / mapa de verdes (actualización cada 15 días)

## Descripción
Incorporar un mapa de vigor vegetativo (NDVI, "mapa de verdes") por lote,
actualizado periódicamente (cada 15 días), superpuesto sobre el polígono del lote
en el mapa.

## Enfoque sugerido (a investigar/confirmar)
El usuario pidió investigar cómo hacer el mapa de verdes. Propuesta:
- **Fuente de imágenes satelitales**: Sentinel-2 (resolución 10 m, revisita ~5
  días, gratuita). Acceso vía **Copernicus Data Space Ecosystem** o **Sentinel
  Hub** (requiere credenciales/API). Alternativa: Google Earth Engine.
- **Cálculo NDVI** = (NIR − Red) / (NIR + Red), usando las bandas B8 (NIR) y B4
  (Red) de Sentinel-2, recortado al polígono del lote.
- **Enmascarado de nubes** (Scene Classification / cloud mask) para descartar
  fechas nubladas; elegir la mejor imagen dentro de la ventana de 15 días.
- **Actualización cada 15 días**: job programado en backend (mismo patrón que la
  sincronización de precipitaciones — `@Scheduled` + trigger inicial), que genera
  y cachea el raster/overlay NDVI por lote.
- **Visualización**: overlay del raster NDVI (rampa de color verde) sobre el
  polígono del lote en el mapa (web MapLibre y mobile).

## Consideraciones
- Confirmar credenciales, límites y licencia de la fuente elegida.
- Definir almacenamiento del raster/tiles (tamaño) y su expiración.
- Fechas y fuente siempre visibles (dato satelital, no dato propio).

## Requisitos Técnicos
- Servicio backend de obtención/cálculo NDVI + cache por lote + scheduler.
- Overlay en el mapa (web y mobile) con leyenda de la rampa NDVI.

## Dependencias
- Lotes con polígono (features 01/38), infraestructura de mapas (38/47).

## Decisiones tomadas
- Fuente: **Sentinel-2 (gratis)** vía **Copernicus Data Space Ecosystem (CDSE)**, API
  Sentinel Hub Process API, auth OAuth2 client-credentials. Credenciales en `.env`
  (`NDVI_CLIENT_ID`/`NDVI_CLIENT_SECRET`), nunca en el repo.
- Salida: **un PNG NDVI por lote** recortado al polígono (rampa de verdes + enmascarado
  de nubes por SCL), guardado en un **volumen de Docker** (`backend_ndvi:/app/ndvi`),
  archivo `{loteId}.png` que **se pisa** en cada corrida (solo la última).

## Estado
Completa.

- Backend: generación Sentinel-2/CDSE, cache PNG por lote, scheduler, manifiesto
  autenticado y endpoint de descarga versionado por fecha/tamaño.
- Web: NDVI dentro del selector del mapa general, overlays de todos los lotes
  activos, leyenda/fuente y visor dedicado desde el detalle del lote.
- Mobile: NDVI dentro del selector del mapa general, visor dedicado desde el
  detalle del lote y descarga anticipada para uso offline mediante el sync-down.
- Cache mobile: actualización atómica, conservación de la versión anterior ante
  fallos y limpieza de archivos pertenecientes a lotes que dejaron de estar activos.
- Verificación: pruebas unitarias NDVI backend y mobile, type-check mobile y build
  Angular. La validación visual con imágenes satelitales reales requiere ejecutar
  el stack con acceso a CDSE y Docker.
