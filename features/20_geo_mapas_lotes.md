# 20 - GeolocalizaciÃ³n: Mapas y Lotes

## DescripciÃ³n
Sistema de geolocalizaciÃ³n con visualizaciÃ³n de lotes, mÃ¡quinas y operarios en mapas interactivos en tiempo real.

## Funcionalidades Principales
- Mapas interactivos de lotes
- VisualizaciÃ³n de mÃ¡quinas en movimiento
- Seguimiento de operarios
- CÃ¡lculos de distancias y Ã¡reas
- ImportaciÃ³n de mapas base

## Tareas
1. **Mapa Base**: IntegraciÃ³n con proveedores (Google Maps, Mapbox, OSM)
2. **VisualizaciÃ³n de Lotes**: PolÃ­gonos en mapa con datos
3. **MÃ¡quinas en Vivo**: Posiciones actualizadas en tiempo real
4. **Operarios**: LocalizaciÃ³n de personas en campo
5. **Rutas**: VisualizaciÃ³n de recorridos realizados
6. **Mediciones**: Distancia, Ã¡rea de lotes
7. **Geofencing**: Zonas permitidas/prohibidas
8. **ImportaciÃ³n/ExportaciÃ³n**: Archivos KML, GeoJSON

## Servicios
- `MapaService`: GestiÃ³n de capas y visualizaciÃ³n
- `GeoService`: CÃ¡lculos geoespaciales
- `ProvedorMapasService`: IntegraciÃ³n con APIs

## Repositorios
- `PolÃ­gonoRepository`
- `PuntoInteresRepository`
- `RutaRepository`

## Requisitos TÃ©cnicos
- Base de datos geoespacial (PostGIS compatible)
- Endpoint REST: `/api/v1/geo/mapas`
- WebSocket para actualizaciones en vivo
- Disponible offline (mapas cached)
- Compatibilidad con estÃ¡ndares OGC (WMS, WFS)

## Integraciones Externas
- Google Maps
- Mapbox
- OpenStreetMap
- Providers de tiles

## Dependencias
- Lotes (polÃ­gonos a mostrar)
- MÃ¡quinas (posiciones GPS)
- Operarios (posiciones)
- Reportes (anÃ¡lisis espacial)

